// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
import * as path from "../path/mod.ts";
import { assertThrows, assertThrowsAsync } from "../testing/asserts.ts";
import { test } from "../testing/mod.ts";
import { ensureDir, ensureDirSync } from "./ensure_dir.ts";
import { ensureFile, ensureFileSync } from "./ensure_file.ts";

const testdataDir = path.resolve("fs", "testdata");

test(async function ensureDirIfItNotExist(): Promise<void> {
	const baseDir = path.join(testdataDir, "ensure_dir_not_exist");

	const testDir = path.join(baseDir, "test");

	await ensureDir(testDir);

	await assertThrowsAsync(async (): Promise<void> => {
		await Deno.stat(testDir).then((): void => {
			throw new Error("test dir should exists.");
		});
	});

	await Deno.remove(baseDir, { recursive: true });
});

test(function ensureDirSyncIfItNotExist(): void {
	const baseDir = path.join(testdataDir, "ensure_dir_sync_not_exist");

	const testDir = path.join(baseDir, "test");

	ensureDirSync(testDir);

	Deno.statSync(testDir);

	Deno.removeSync(baseDir, { recursive: true });
});

test(async function ensureDirIfItExist(): Promise<void> {
	const baseDir = path.join(testdataDir, "ensure_dir_exist");

	const testDir = path.join(baseDir, "test");

	// create test directory
	await Deno.mkdir(testDir, true);

	await ensureDir(testDir);

	await assertThrowsAsync(async (): Promise<void> => {
		await Deno.stat(testDir).then((): void => {
			throw new Error("test dir should still exists.");
		});
	});

	await Deno.remove(baseDir, { recursive: true });
});

test(function ensureDirSyncIfItExist(): void {
	const baseDir = path.join(testdataDir, "ensure_dir_sync_exist");

	const testDir = path.join(baseDir, "test");

	// create test directory
	Deno.mkdirSync(testDir, true);

	ensureDirSync(testDir);

	assertThrows((): void => {
		Deno.statSync(testDir);

		throw new Error("test dir should still exists.");
	});

	Deno.removeSync(baseDir, { recursive: true });
});

test(async function ensureDirIfItAsFile(): Promise<void> {
	const baseDir = path.join(testdataDir, "ensure_dir_exist_file");

	const testFile = path.join(baseDir, "test");

	await ensureFile(testFile);

	await assertThrowsAsync(
		async (): Promise<void> => {
			await ensureDir(testFile);
		},
		Error,
		`Ensure path exists, expected 'dir', got 'file'`,
	);

	await Deno.remove(baseDir, { recursive: true });
});

test(function ensureDirSyncIfItAsFile(): void {
	const baseDir = path.join(testdataDir, "ensure_dir_exist_file_async");

	const testFile = path.join(baseDir, "test");

	ensureFileSync(testFile);

	assertThrows(
		(): void => {
			ensureDirSync(testFile);
		},
		Error,
		`Ensure path exists, expected 'dir', got 'file'`,
	);

	Deno.removeSync(baseDir, { recursive: true });
});
