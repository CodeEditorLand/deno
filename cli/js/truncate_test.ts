// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
import { assertEquals, testPerm } from "./test_util.ts";

function readDataSync(name: string): string {
	const data = Deno.readFileSync(name);

	const decoder = new TextDecoder("utf-8");

	const text = decoder.decode(data);

	return text;
}

async function readData(name: string): Promise<string> {
	const data = await Deno.readFile(name);

	const decoder = new TextDecoder("utf-8");

	const text = decoder.decode(data);

	return text;
}

testPerm({ read: true, write: true }, function truncateSyncSuccess(): void {
	const enc = new TextEncoder();

	const d = enc.encode("Hello");

	const filename = Deno.makeTempDirSync() + "/test_truncateSync.txt";

	Deno.writeFileSync(filename, d);

	Deno.truncateSync(filename, 20);

	let data = readDataSync(filename);

	assertEquals(data.length, 20);

	Deno.truncateSync(filename, 5);

	data = readDataSync(filename);

	assertEquals(data.length, 5);

	Deno.truncateSync(filename, -5);

	data = readDataSync(filename);

	assertEquals(data.length, 0);

	Deno.removeSync(filename);
});

testPerm(
	{ read: true, write: true },
	async function truncateSuccess(): Promise<void> {
		const enc = new TextEncoder();

		const d = enc.encode("Hello");

		const filename = Deno.makeTempDirSync() + "/test_truncate.txt";

		await Deno.writeFile(filename, d);

		await Deno.truncate(filename, 20);

		let data = await readData(filename);

		assertEquals(data.length, 20);

		await Deno.truncate(filename, 5);

		data = await readData(filename);

		assertEquals(data.length, 5);

		await Deno.truncate(filename, -5);

		data = await readData(filename);

		assertEquals(data.length, 0);

		await Deno.remove(filename);
	},
);

testPerm({ write: false }, function truncateSyncPerm(): void {
	let err;

	try {
		Deno.mkdirSync("/test_truncateSyncPermission.txt");
	} catch (e) {
		err = e;
	}

	assertEquals(err.kind, Deno.ErrorKind.PermissionDenied);

	assertEquals(err.name, "PermissionDenied");
});

testPerm({ write: false }, async function truncatePerm(): Promise<void> {
	let err;

	try {
		await Deno.mkdir("/test_truncatePermission.txt");
	} catch (e) {
		err = e;
	}

	assertEquals(err.kind, Deno.ErrorKind.PermissionDenied);

	assertEquals(err.name, "PermissionDenied");
});
