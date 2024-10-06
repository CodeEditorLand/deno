// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
use std::{pin::Pin, str};

use futures::future::FutureExt;

use crate::{
	compilers::{CompiledModule, CompiledModuleFuture},
	file_fetcher::SourceFile,
};

pub struct JsCompiler {}

impl JsCompiler {
	pub fn compile_async(self: &Self, source_file:&SourceFile) -> Pin<Box<CompiledModuleFuture>> {
		let module = CompiledModule {
			code:str::from_utf8(&source_file.source_code).unwrap().to_string(),
			name:source_file.url.to_string(),
		};

		futures::future::ok(module).boxed()
	}
}
