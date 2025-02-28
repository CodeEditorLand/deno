// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../testing/asserts.ts";
import { test } from "../testing/mod.ts";
import { detect, EOL, format } from "./eol.ts";

const CRLFinput = "deno\r\nis not\r\nnode";

const Mixedinput = "deno\nis not\r\nnode";

const Mixedinput2 = "deno\r\nis not\nnode";

const LFinput = "deno\nis not\nnode";

const NoNLinput = "deno is not node";

test({
	name: "[EOL] Detect CR LF",
	fn(): void {
		assertEquals(detect(CRLFinput), EOL.CRLF);
	},
});

test({
	name: "[EOL] Detect LF",
	fn(): void {
		assertEquals(detect(LFinput), EOL.LF);
	},
});

test({
	name: "[EOL] Detect No New Line",
	fn(): void {
		assertEquals(detect(NoNLinput), null);
	},
});

test({
	name: "[EOL] Detect Mixed",
	fn(): void {
		assertEquals(detect(Mixedinput), EOL.CRLF);

		assertEquals(detect(Mixedinput2), EOL.CRLF);
	},
});

test({
	name: "[EOL] Format",
	fn(): void {
		assertEquals(format(CRLFinput, EOL.LF), LFinput);

		assertEquals(format(LFinput, EOL.LF), LFinput);

		assertEquals(format(LFinput, EOL.CRLF), CRLFinput);

		assertEquals(format(CRLFinput, EOL.CRLF), CRLFinput);

		assertEquals(format(CRLFinput, EOL.CRLF), CRLFinput);

		assertEquals(format(NoNLinput, EOL.CRLF), NoNLinput);

		assertEquals(format(Mixedinput, EOL.CRLF), CRLFinput);

		assertEquals(format(Mixedinput, EOL.LF), LFinput);

		assertEquals(format(Mixedinput2, EOL.CRLF), CRLFinput);

		assertEquals(format(Mixedinput2, EOL.LF), LFinput);
	},
});
