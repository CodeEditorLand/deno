// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.

import { assertEquals } from "../testing/asserts.ts";
import { test } from "../testing/mod.ts";
import {
	charset,
	contentType,
	extension,
	extensions,
	lookup,
	types,
} from "./mod.ts";

test(function testLookup(): void {
	assertEquals(lookup("json"), "application/json");

	assertEquals(lookup(".md"), "text/markdown");

	assertEquals(lookup("folder/file.js"), "application/javascript");

	assertEquals(lookup("folder/.htaccess"), undefined);
});

test(function testContentType(): void {
	assertEquals(contentType("markdown"), "text/markdown; charset=utf-8");

	assertEquals(contentType("file.json"), "application/json; charset=utf-8");

	assertEquals(contentType("text/html"), "text/html; charset=utf-8");

	assertEquals(
		contentType("text/html; charset=iso-8859-1"),
		"text/html; charset=iso-8859-1",
	);

	assertEquals(contentType(".htaccess"), undefined);
});

test(function testExtension(): void {
	assertEquals(extension("application/octet-stream"), "bin");

	assertEquals(extension("application/javascript"), "js");

	assertEquals(extension("text/html"), "html");
});

test(function testCharset(): void {
	assertEquals(charset("text/markdown"), "UTF-8");

	assertEquals(charset("text/css"), "UTF-8");
});

test(function testExtensions(): void {
	assertEquals(extensions.get("application/javascript"), ["js", "mjs"]);

	assertEquals(extensions.get("foo"), undefined);
});

test(function testTypes(): void {
	assertEquals(types.get("js"), "application/javascript");

	assertEquals(types.get("foo"), undefined);
});
