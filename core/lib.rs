// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
#[macro_use]
extern crate log;
extern crate futures;
extern crate libc;
#[macro_use]
extern crate downcast_rs;

mod any_error;
mod flags;
mod isolate;
mod js_errors;
mod libdeno;
mod module_specifier;
mod modules;
mod ops;
mod plugins;
mod resources;
mod shared_queue;

pub use crate::{
	any_error::*,
	flags::v8_set_flags,
	isolate::*,
	js_errors::*,
	libdeno::{deno_mod, OpId, PinnedBuf},
	module_specifier::*,
	modules::*,
	ops::*,
	plugins::*,
	resources::*,
};

pub fn v8_version() -> &'static str {
	use std::ffi::CStr;

	let version = unsafe { libdeno::deno_v8_version() };

	let c_str = unsafe { CStr::from_ptr(version) };

	c_str.to_str().unwrap()
}

#[test]
fn test_v8_version() {
	assert!(v8_version().len() > 3);
}
