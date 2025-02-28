// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
mod dispatch_json;
mod dispatch_minimal;

pub use dispatch_json::{JsonOp, json_op};
pub use dispatch_minimal::{MinimalOp, minimal_op};

pub mod compiler;
pub mod errors;
pub mod fetch;
pub mod files;
pub mod fs;
pub mod io;
pub mod net;
pub mod os;
pub mod permissions;
pub mod plugins;
pub mod process;
pub mod random;
pub mod repl;
pub mod resources;
pub mod timers;
pub mod tls;
pub mod workers;
