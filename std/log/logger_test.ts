// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../testing/asserts.ts";
import { test } from "../testing/mod.ts";
import { BaseHandler } from "./handlers.ts";
import { LogLevel } from "./levels.ts";
import { Logger, LogRecord } from "./logger.ts";

class TestHandler extends BaseHandler {
	public messages: string[] = [];

	public records: LogRecord[] = [];

	handle(record: LogRecord): void {
		this.records.push({ ...record });

		super.handle(record);
	}

	public log(str: string): void {
		this.messages.push(str);
	}
}

test(function simpleLogger(): void {
	const handler = new TestHandler("DEBUG");

	let logger = new Logger("DEBUG");

	assertEquals(logger.level, LogLevel.DEBUG);

	assertEquals(logger.levelName, "DEBUG");

	assertEquals(logger.handlers, []);

	logger = new Logger("DEBUG", [handler]);

	assertEquals(logger.handlers, [handler]);
});

test(function customHandler(): void {
	const handler = new TestHandler("DEBUG");

	const logger = new Logger("DEBUG", [handler]);

	logger.debug("foo", 1, 2);

	const record = handler.records[0];

	assertEquals(record.msg, "foo");

	assertEquals(record.args, [1, 2]);

	assertEquals(record.level, LogLevel.DEBUG);

	assertEquals(record.levelName, "DEBUG");

	assertEquals(handler.messages, ["DEBUG foo"]);
});

test(function logFunctions(): void {
	const doLog = (level: string): TestHandler => {
		const handler = new TestHandler(level);

		const logger = new Logger(level, [handler]);

		logger.debug("foo");

		logger.info("bar");

		logger.warning("baz");

		logger.error("boo");

		logger.critical("doo");

		return handler;
	};

	let handler: TestHandler;

	handler = doLog("DEBUG");

	assertEquals(handler.messages, [
		"DEBUG foo",
		"INFO bar",
		"WARNING baz",
		"ERROR boo",
		"CRITICAL doo",
	]);

	handler = doLog("INFO");

	assertEquals(handler.messages, [
		"INFO bar",
		"WARNING baz",
		"ERROR boo",
		"CRITICAL doo",
	]);

	handler = doLog("WARNING");

	assertEquals(handler.messages, [
		"WARNING baz",
		"ERROR boo",
		"CRITICAL doo",
	]);

	handler = doLog("ERROR");

	assertEquals(handler.messages, ["ERROR boo", "CRITICAL doo"]);

	handler = doLog("CRITICAL");

	assertEquals(handler.messages, ["CRITICAL doo"]);
});
