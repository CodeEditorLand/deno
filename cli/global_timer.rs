// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.

//! This module helps deno implement timers.
//!
//! As an optimization, we want to avoid an expensive calls into rust for every
//! setTimeout in JavaScript. Thus in //js/timers.ts a data structure is
//! implemented that calls into Rust for only the smallest timeout.  Thus we
//! only need to be able to start and cancel a single timer (or Delay, as Tokio
//! calls it) for an entire Isolate. This is what is implemented here.

use std::{future::Future, time::Instant};

use futures::{channel::oneshot, future::FutureExt};
use tokio::timer::Delay;

use crate::futures::TryFutureExt;

#[derive(Default)]
pub struct GlobalTimer {
	tx:Option<oneshot::Sender<()>>,
}

impl GlobalTimer {
	pub fn new() -> Self { Self { tx:None } }

	pub fn cancel(&mut self) {
		if let Some(tx) = self.tx.take() {
			tx.send(()).ok();
		}
	}

	pub fn new_timeout(&mut self, deadline:Instant) -> impl Future<Output = Result<(), ()>> {
		if self.tx.is_some() {
			self.cancel();
		}

		assert!(self.tx.is_none());

		let (tx, rx) = oneshot::channel();

		self.tx = Some(tx);

		let delay = futures::compat::Compat01As03::new(Delay::new(deadline))
			.map_err(|err| panic!("Unexpected error in timeout {:?}", err));

		let rx = rx.map_err(|err| panic!("Unexpected error in receiving channel {:?}", err));

		futures::future::select(delay, rx).then(|_| futures::future::ok(()))
	}
}
