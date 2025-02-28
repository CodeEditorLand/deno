import * as path from "../path/mod.ts";
import { assertEquals } from "../testing/asserts.ts";
import { test } from "../testing/mod.ts";
import { writeFileStr, writeFileStrSync } from "./write_file_str.ts";

const testdataDir = path.resolve("fs", "testdata");

test(function testReadFileSync(): void {
	const jsonFile = path.join(testdataDir, "write_file_1.json");

	const content = "write_file_str_test";

	writeFileStrSync(jsonFile, content);

	// make sure file have been create.
	Deno.statSync(jsonFile);

	const result = new TextDecoder().decode(Deno.readFileSync(jsonFile));

	// remove test file
	Deno.removeSync(jsonFile);

	assertEquals(content, result);
});

test(async function testReadFile(): Promise<void> {
	const jsonFile = path.join(testdataDir, "write_file_2.json");

	const content = "write_file_str_test";

	await writeFileStr(jsonFile, content);

	// make sure file have been create.
	await Deno.stat(jsonFile);

	const result = new TextDecoder().decode(await Deno.readFile(jsonFile));

	// remove test file
	await Deno.remove(jsonFile);

	assertEquals(content, result);
});
