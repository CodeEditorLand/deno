// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
use std::collections::HashMap;

use deno::*;

use super::dispatch_json::{Deserialize, JsonOp, Value};
use crate::{
	fmt_errors::JSError,
	ops::json_op,
	source_maps::{CachedMaps, get_orig_position},
	state::ThreadSafeState,
};

pub fn init(i:&mut Isolate, s:&ThreadSafeState) {
	i.register_op("apply_source_map", s.core_op(json_op(s.stateful_op(op_apply_source_map))));

	i.register_op("format_error", s.core_op(json_op(s.stateful_op(op_format_error))));
}

#[derive(Deserialize)]
struct FormatErrorArgs {
	error:String,
}

fn op_format_error(
	state:&ThreadSafeState,
	args:Value,
	_zero_copy:Option<PinnedBuf>,
) -> Result<JsonOp, ErrBox> {
	let args:FormatErrorArgs = serde_json::from_value(args)?;

	let error = JSError::from_json(&args.error, &state.global_state.ts_compiler);

	Ok(JsonOp::Sync(json!({
	  "error": error.to_string(),
	})))
}

#[derive(Deserialize)]
struct ApplySourceMap {
	filename:String,
	line:i32,
	column:i32,
}

fn op_apply_source_map(
	state:&ThreadSafeState,
	args:Value,
	_zero_copy:Option<PinnedBuf>,
) -> Result<JsonOp, ErrBox> {
	let args:ApplySourceMap = serde_json::from_value(args)?;

	let mut mappings_map:CachedMaps = HashMap::new();

	let (orig_filename, orig_line, orig_column) = get_orig_position(
		args.filename,
		args.line.into(),
		args.column.into(),
		&mut mappings_map,
		&state.global_state.ts_compiler,
	);

	Ok(JsonOp::Sync(json!({
	  "filename": orig_filename.to_string(),
	  "line": orig_line as u32,
	  "column": orig_column as u32,
	})))
}
