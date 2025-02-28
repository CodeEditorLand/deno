// Copyright the Browserify authors. MIT License.

import * as path from "../path/mod.ts";
import { assertEquals } from "../testing/asserts.ts";
import { test } from "../testing/mod.ts";
import { ensureDirSync } from "./ensure_dir.ts";
import { ensureFileSync } from "./ensure_file.ts";
import { getFileInfoType, isSubdir, PathType } from "./utils.ts";

const testdataDir = path.resolve("fs", "testdata");

test(function _isSubdir(): void {
	const pairs = [
		["", "", false, path.posix.sep],
		["/first/second", "/first", false, path.posix.sep],
		["/first", "/first", false, path.posix.sep],
		["/first", "/first/second", true, path.posix.sep],
		["first", "first/second", true, path.posix.sep],
		["../first", "../first/second", true, path.posix.sep],
		["c:\\first", "c:\\first", false, path.win32.sep],
		["c:\\first", "c:\\first\\second", true, path.win32.sep],
	];

	pairs.forEach(function (p): void {
		const src = p[0] as string;

		const dest = p[1] as string;

		const expected = p[2] as boolean;

		const sep = p[3] as string;

		assertEquals(
			isSubdir(src, dest, sep),
			expected,
			`'${src}' should ${expected ? "" : "not"} be parent dir of '${dest}'`,
		);
	});
});

test(function _getFileInfoType(): void {
	const pairs = [
		[path.join(testdataDir, "file_type_1"), "file"],
		[path.join(testdataDir, "file_type_dir_1"), "dir"],
	];

	pairs.forEach(function (p): void {
		const filePath = p[0] as string;

		const type = p[1] as PathType;

		switch (type) {
			case "file":
				ensureFileSync(filePath);

				break;

			case "dir":
				ensureDirSync(filePath);

				break;

			case "symlink":
				// TODO(axetroy): test symlink
				break;
		}

		const stat = Deno.statSync(filePath);

		Deno.removeSync(filePath, { recursive: true });

		assertEquals(getFileInfoType(stat), type);
	});
});
