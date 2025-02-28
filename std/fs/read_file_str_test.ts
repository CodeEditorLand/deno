import * as path from "../path/mod.ts";
import { assert } from "../testing/asserts.ts";
import { test } from "../testing/mod.ts";
import { readFileStr, readFileStrSync } from "./read_file_str.ts";

const testdataDir = path.resolve("fs", "testdata");

test(function testReadFileSync(): void {
	const jsonFile = path.join(testdataDir, "json_valid_obj.json");

	const strFile = readFileStrSync(jsonFile);

	assert(typeof strFile === "string");

	assert(strFile.length > 0);
});

test(async function testReadFile(): Promise<void> {
	const jsonFile = path.join(testdataDir, "json_valid_obj.json");

	const strFile = await readFileStr(jsonFile);

	assert(typeof strFile === "string");

	assert(strFile.length > 0);
});
