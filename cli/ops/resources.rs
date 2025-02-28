// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
use deno::*;

use super::dispatch_json::{JsonOp, Value};
use crate::{ops::json_op, state::ThreadSafeState};

pub fn init(i:&mut Isolate, s:&ThreadSafeState) {
	i.register_op("resources", s.core_op(json_op(s.stateful_op(op_resources))));
}

fn op_resources(
	state:&ThreadSafeState,
	_args:Value,
	_zero_copy:Option<PinnedBuf>,
) -> Result<JsonOp, ErrBox> {
	let resource_table = state.lock_resource_table();

	let serialized_resources = resource_table.entries();

	Ok(JsonOp::Sync(json!(serialized_resources)))
}
