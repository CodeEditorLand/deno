// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
use std::{self, convert::From};

use deno::*;
use futures::future::{FutureExt, TryFutureExt};
use http::{
	header::{HeaderName, HeaderValue},
	Method,
};

use super::{
	dispatch_json::{Deserialize, JsonOp, Value},
	io::StreamResource,
};
use crate::{
	http_body::HttpBody,
	http_util::get_client,
	ops::json_op,
	state::ThreadSafeState,
};

pub fn init(i:&mut Isolate, s:&ThreadSafeState) {
	i.register_op("fetch", s.core_op(json_op(s.stateful_op(op_fetch))));
}

#[derive(Deserialize)]
struct FetchArgs {
	method:Option<String>,
	url:String,
	headers:Vec<(String, String)>,
}

pub fn op_fetch(
	state:&ThreadSafeState,
	args:Value,
	data:Option<PinnedBuf>,
) -> Result<JsonOp, ErrBox> {
	let args:FetchArgs = serde_json::from_value(args)?;
	let url = args.url;

	let client = get_client();

	let method = match args.method {
		Some(method_str) => Method::from_bytes(method_str.as_bytes())?,
		None => Method::GET,
	};

	let url_ = url::Url::parse(&url).map_err(ErrBox::from)?;
	state.check_net_url(&url_)?;

	let mut request = client.request(method, url_);

	if let Some(buf) = data {
		request = request.body(Vec::from(&*buf));
	}

	for (key, value) in args.headers {
		let name = HeaderName::from_bytes(key.as_bytes()).unwrap();
		let v = HeaderValue::from_str(&value).unwrap();
		request = request.header(name, v);
	}
	debug!("Before fetch {}", url);
	let state_ = state.clone();
	let future = futures::compat::Compat01As03::new(request.send())
		.map_err(ErrBox::from)
		.and_then(move |res| {
			debug!("Fetch response {}", url);
			let status = res.status();
			let mut res_headers = Vec::new();
			for (key, val) in res.headers().iter() {
				res_headers
					.push((key.to_string(), val.to_str().unwrap().to_owned()));
			}

			let body = HttpBody::from(res.into_body());
			let mut table = state_.lock_resource_table();
			let rid = table.add(
				"httpBody",
				Box::new(StreamResource::HttpBody(Box::new(body))),
			);

			let json_res = json!({
			  "bodyRid": rid,
			  "status": status.as_u16(),
			  "statusText": status.canonical_reason().unwrap_or(""),
			  "headers": res_headers
			});

			futures::future::ok(json_res)
		});

	Ok(JsonOp::Async(future.boxed()))
}
