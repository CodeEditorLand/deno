const { copy } = Deno;
import { assertEquals } from "../testing/asserts.ts";
import { test } from "../testing/mod.ts";
import { copyN } from "./ioutil.ts";
import { StringReader } from "./readers.ts";
import { StringWriter } from "./writers.ts";

test(async function ioStringWriter(): Promise<void> {
	const w = new StringWriter("base");
	const r = new StringReader("0123456789");
	await copyN(w, r, 4);
	assertEquals(w.toString(), "base0123");
	await copy(w, r);
	assertEquals(w.toString(), "base0123456789");
});
