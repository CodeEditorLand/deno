// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
#[cfg(unix)]
use std::os::unix::process::ExitStatusExt;
use std::{
	self,
	convert::From,
	future::Future,
	pin::Pin,
	process::{Command, ExitStatus},
	task::{Context, Poll},
};

use deno::*;
use futures::{
	self,
	future::{FutureExt, TryFutureExt},
	task::SpawnExt,
};
use tokio::prelude::Async;
use tokio_process::CommandExt;

use super::{
	dispatch_json::{Deserialize, JsonOp, Value},
	io::StreamResource,
};
use crate::{deno_error::bad_resource, ops::json_op, signal::kill, state::ThreadSafeState};

pub fn init(i:&mut Isolate, s:&ThreadSafeState) {
	i.register_op("run", s.core_op(json_op(s.stateful_op(op_run))));

	i.register_op("run_status", s.core_op(json_op(s.stateful_op(op_run_status))));

	i.register_op("kill", s.core_op(json_op(s.stateful_op(op_kill))));
}

struct CloneFileFuture {
	rid:ResourceId,
	state:ThreadSafeState,
}

impl Future for CloneFileFuture {
	type Output = Result<tokio::fs::File, ErrBox>;

	fn poll(self: Pin<&mut Self>, _cx:&mut Context) -> Poll<Self::Output> {
		let inner = self.get_mut();

		let mut table = inner.state.lock_resource_table();

		let repr = table.get_mut::<StreamResource>(inner.rid).ok_or_else(bad_resource)?;

		match repr {
			StreamResource::FsFile(ref mut file) => {
				match file.poll_try_clone().map_err(ErrBox::from) {
					Err(err) => Poll::Ready(Err(err)),
					Ok(Async::Ready(v)) => Poll::Ready(Ok(v)),
					Ok(Async::NotReady) => Poll::Pending,
				}
			},
			_ => Poll::Ready(Err(bad_resource())),
		}
	}
}

fn clone_file(rid:u32, state:&ThreadSafeState) -> Result<std::fs::File, ErrBox> {
	futures::executor::block_on(CloneFileFuture { rid, state:state.clone() }).map(|f| f.into_std())
}

fn subprocess_stdio_map(s:&str) -> std::process::Stdio {
	match s {
		"inherit" => std::process::Stdio::inherit(),
		"piped" => std::process::Stdio::piped(),
		"null" => std::process::Stdio::null(),
		_ => unreachable!(),
	}
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RunArgs {
	args:Vec<String>,
	cwd:Option<String>,
	env:Vec<(String, String)>,
	stdin:String,
	stdout:String,
	stderr:String,
	stdin_rid:u32,
	stdout_rid:u32,
	stderr_rid:u32,
}

struct ChildResource {
	child:futures::compat::Compat01As03<tokio_process::Child>,
}

impl Resource for ChildResource {}

fn op_run(
	state:&ThreadSafeState,
	args:Value,
	_zero_copy:Option<PinnedBuf>,
) -> Result<JsonOp, ErrBox> {
	let run_args:RunArgs = serde_json::from_value(args)?;

	state.check_run()?;

	let state_ = state.clone();

	let args = run_args.args;

	let env = run_args.env;

	let cwd = run_args.cwd;

	let mut c = Command::new(args.get(0).unwrap());
	(1..args.len()).for_each(|i| {
		let arg = args.get(i).unwrap();

		c.arg(arg);
	});

	cwd.map(|d| c.current_dir(d));

	for (key, value) in &env {
		c.env(key, value);
	}

	// TODO: make this work with other resources, eg. sockets
	let stdin_rid = run_args.stdin_rid;

	if stdin_rid > 0 {
		let file = clone_file(stdin_rid, &state_)?;

		c.stdin(file);
	} else {
		c.stdin(subprocess_stdio_map(run_args.stdin.as_ref()));
	}

	let stdout_rid = run_args.stdout_rid;

	if stdout_rid > 0 {
		let file = clone_file(stdout_rid, &state_)?;

		c.stdout(file);
	} else {
		c.stdout(subprocess_stdio_map(run_args.stdout.as_ref()));
	}

	let stderr_rid = run_args.stderr_rid;

	if stderr_rid > 0 {
		let file = clone_file(stderr_rid, &state_)?;

		c.stderr(file);
	} else {
		c.stderr(subprocess_stdio_map(run_args.stderr.as_ref()));
	}

	// Spawn the command.
	let mut child = c.spawn_async().map_err(ErrBox::from)?;

	let pid = child.id();

	let mut table = state_.lock_resource_table();

	let stdin_rid = match child.stdin().take() {
		Some(child_stdin) => {
			let rid = table.add("childStdin", Box::new(StreamResource::ChildStdin(child_stdin)));

			Some(rid)
		},
		None => None,
	};

	let stdout_rid = match child.stdout().take() {
		Some(child_stdout) => {
			let rid = table.add("childStdout", Box::new(StreamResource::ChildStdout(child_stdout)));

			Some(rid)
		},
		None => None,
	};

	let stderr_rid = match child.stderr().take() {
		Some(child_stderr) => {
			let rid = table.add("childStderr", Box::new(StreamResource::ChildStderr(child_stderr)));

			Some(rid)
		},
		None => None,
	};

	let child_resource = ChildResource { child:futures::compat::Compat01As03::new(child) };

	let child_rid = table.add("child", Box::new(child_resource));

	Ok(JsonOp::Sync(json!({
	  "rid": child_rid,
	  "pid": pid,
	  "stdinRid": stdin_rid,
	  "stdoutRid": stdout_rid,
	  "stderrRid": stderr_rid,
	})))
}

pub struct ChildStatus {
	rid:ResourceId,
	state:ThreadSafeState,
}

impl Future for ChildStatus {
	type Output = Result<ExitStatus, ErrBox>;

	fn poll(self: Pin<&mut Self>, cx:&mut Context) -> Poll<Self::Output> {
		let inner = self.get_mut();

		let mut table = inner.state.lock_resource_table();

		let child_resource = table.get_mut::<ChildResource>(inner.rid).ok_or_else(bad_resource)?;

		let child = &mut child_resource.child;

		child.map_err(ErrBox::from).poll_unpin(cx)
	}
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RunStatusArgs {
	rid:i32,
}

fn op_run_status(
	state:&ThreadSafeState,
	args:Value,
	_zero_copy:Option<PinnedBuf>,
) -> Result<JsonOp, ErrBox> {
	let args:RunStatusArgs = serde_json::from_value(args)?;

	let rid = args.rid as u32;

	state.check_run()?;

	let future = ChildStatus { rid, state:state.clone() };

	let future = future.and_then(move |run_status| {
		let code = run_status.code();

		#[cfg(unix)]
		let signal = run_status.signal();
		#[cfg(not(unix))]
		let signal = None;

		code.or(signal).expect("Should have either an exit code or a signal.");

		let got_signal = signal.is_some();

		futures::future::ok(json!({
		   "gotSignal": got_signal,
		   "exitCode": code.unwrap_or(-1),
		   "exitSignal": signal.unwrap_or(-1),
		}))
	});

	let pool = futures::executor::ThreadPool::new().unwrap();

	let handle = pool.spawn_with_handle(future).unwrap();

	Ok(JsonOp::Async(handle.boxed()))
}

#[derive(Deserialize)]
struct KillArgs {
	pid:i32,
	signo:i32,
}

fn op_kill(
	state:&ThreadSafeState,
	args:Value,
	_zero_copy:Option<PinnedBuf>,
) -> Result<JsonOp, ErrBox> {
	state.check_run()?;

	let args:KillArgs = serde_json::from_value(args)?;

	kill(args.pid, args.signo)?;

	Ok(JsonOp::Sync(json!({})))
}
