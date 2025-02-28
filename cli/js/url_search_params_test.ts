// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
import { assert, assertEquals, test } from "./test_util.ts";

test(function urlSearchParamsInitString(): void {
	const init = "c=4&a=2&b=3&%C3%A1=1";

	const searchParams = new URLSearchParams(init);

	assert(
		init === searchParams.toString(),
		"The init query string does not match",
	);
});

test(function urlSearchParamsInitIterable(): void {
	const init = [
		["a", "54"],
		["b", "true"],
	];

	const searchParams = new URLSearchParams(init);

	assertEquals(searchParams.toString(), "a=54&b=true");
});

test(function urlSearchParamsInitRecord(): void {
	const init = { a: "54", b: "true" };

	const searchParams = new URLSearchParams(init);

	assertEquals(searchParams.toString(), "a=54&b=true");
});

test(function urlSearchParamsInit(): void {
	const params1 = new URLSearchParams("a=b");

	assertEquals(params1.toString(), "a=b");
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const params2 = new URLSearchParams(params1 as any);

	assertEquals(params2.toString(), "a=b");
});

test(function urlSearchParamsAppendSuccess(): void {
	const searchParams = new URLSearchParams();

	searchParams.append("a", "true");

	assertEquals(searchParams.toString(), "a=true");
});

test(function urlSearchParamsDeleteSuccess(): void {
	const init = "a=54&b=true";

	const searchParams = new URLSearchParams(init);

	searchParams.delete("b");

	assertEquals(searchParams.toString(), "a=54");
});

test(function urlSearchParamsGetAllSuccess(): void {
	const init = "a=54&b=true&a=true";

	const searchParams = new URLSearchParams(init);

	assertEquals(searchParams.getAll("a"), ["54", "true"]);

	assertEquals(searchParams.getAll("b"), ["true"]);

	assertEquals(searchParams.getAll("c"), []);
});

test(function urlSearchParamsGetSuccess(): void {
	const init = "a=54&b=true&a=true";

	const searchParams = new URLSearchParams(init);

	assertEquals(searchParams.get("a"), "54");

	assertEquals(searchParams.get("b"), "true");

	assertEquals(searchParams.get("c"), null);
});

test(function urlSearchParamsHasSuccess(): void {
	const init = "a=54&b=true&a=true";

	const searchParams = new URLSearchParams(init);

	assert(searchParams.has("a"));

	assert(searchParams.has("b"));

	assert(!searchParams.has("c"));
});

test(function urlSearchParamsSetReplaceFirstAndRemoveOthers(): void {
	const init = "a=54&b=true&a=true";

	const searchParams = new URLSearchParams(init);

	searchParams.set("a", "false");

	assertEquals(searchParams.toString(), "a=false&b=true");
});

test(function urlSearchParamsSetAppendNew(): void {
	const init = "a=54&b=true&a=true";

	const searchParams = new URLSearchParams(init);

	searchParams.set("c", "foo");

	assertEquals(searchParams.toString(), "a=54&b=true&a=true&c=foo");
});

test(function urlSearchParamsSortSuccess(): void {
	const init = "c=4&a=2&b=3&a=1";

	const searchParams = new URLSearchParams(init);

	searchParams.sort();

	assertEquals(searchParams.toString(), "a=2&a=1&b=3&c=4");
});

test(function urlSearchParamsForEachSuccess(): void {
	const init = [
		["a", "54"],
		["b", "true"],
	];

	const searchParams = new URLSearchParams(init);

	let callNum = 0;

	searchParams.forEach((value, key, parent): void => {
		assertEquals(searchParams, parent);

		assertEquals(value, init[callNum][1]);

		assertEquals(key, init[callNum][0]);

		callNum++;
	});

	assertEquals(callNum, init.length);
});

test(function urlSearchParamsMissingName(): void {
	const init = "=4";

	const searchParams = new URLSearchParams(init);

	assertEquals(searchParams.get(""), "4");

	assertEquals(searchParams.toString(), "=4");
});

test(function urlSearchParamsMissingValue(): void {
	const init = "4=";

	const searchParams = new URLSearchParams(init);

	assertEquals(searchParams.get("4"), "");

	assertEquals(searchParams.toString(), "4=");
});

test(function urlSearchParamsMissingEqualSign(): void {
	const init = "4";

	const searchParams = new URLSearchParams(init);

	assertEquals(searchParams.get("4"), "");

	assertEquals(searchParams.toString(), "4=");
});

test(function urlSearchParamsMissingPair(): void {
	const init = "c=4&&a=54&";

	const searchParams = new URLSearchParams(init);

	assertEquals(searchParams.toString(), "c=4&a=54");
});

// If pair does not contain exactly two items, then throw a TypeError.
// ref https://url.spec.whatwg.org/#interface-urlsearchparams
test(function urlSearchParamsShouldThrowTypeError(): void {
	let hasThrown = 0;

	try {
		new URLSearchParams([["1"]]);

		hasThrown = 1;
	} catch (err) {
		if (err instanceof TypeError) {
			hasThrown = 2;
		} else {
			hasThrown = 3;
		}
	}

	assertEquals(hasThrown, 2);

	try {
		new URLSearchParams([["1", "2", "3"]]);

		hasThrown = 1;
	} catch (err) {
		if (err instanceof TypeError) {
			hasThrown = 2;
		} else {
			hasThrown = 3;
		}
	}

	assertEquals(hasThrown, 2);
});

test(function urlSearchParamsAppendArgumentsCheck(): void {
	const methodRequireOneParam = ["delete", "getAll", "get", "has", "forEach"];

	const methodRequireTwoParams = ["append", "set"];

	methodRequireOneParam
		.concat(methodRequireTwoParams)
		.forEach((method: string): void => {
			const searchParams = new URLSearchParams();

			let hasThrown = 0;

			try {
				searchParams[method]();

				hasThrown = 1;
			} catch (err) {
				if (err instanceof TypeError) {
					hasThrown = 2;
				} else {
					hasThrown = 3;
				}
			}

			assertEquals(hasThrown, 2);
		});

	methodRequireTwoParams.forEach((method: string): void => {
		const searchParams = new URLSearchParams();

		let hasThrown = 0;

		try {
			searchParams[method]("foo");

			hasThrown = 1;
		} catch (err) {
			if (err instanceof TypeError) {
				hasThrown = 2;
			} else {
				hasThrown = 3;
			}
		}

		assertEquals(hasThrown, 2);
	});
});

// ref: https://github.com/web-platform-tests/wpt/blob/master/url/urlsearchparams-delete.any.js
test(function urlSearchParamsDeletingAppendedMultiple(): void {
	const params = new URLSearchParams();

	params.append("first", 1 as unknown as string);

	assert(params.has("first"));

	assertEquals(params.get("first"), "1");

	params.delete("first");

	assertEquals(params.has("first"), false);

	params.append("first", 1 as unknown as string);

	params.append("first", 10 as unknown as string);

	params.delete("first");

	assertEquals(params.has("first"), false);
});

// ref: https://github.com/web-platform-tests/wpt/blob/master/url/urlsearchparams-constructor.any.js#L176-L182
test(function urlSearchParamsCustomSymbolIterator(): void {
	const params = new URLSearchParams();

	params[Symbol.iterator] = function* (): IterableIterator<[string, string]> {
		yield ["a", "b"];
	};

	const params1 = new URLSearchParams(params as unknown as string[][]);

	assertEquals(params1.get("a"), "b");
});

test(function urlSearchParamsCustomSymbolIteratorWithNonStringParams(): void {
	const params = {};

	params[Symbol.iterator] = function* (): IterableIterator<[number, number]> {
		yield [1, 2];
	};

	const params1 = new URLSearchParams(params as unknown as string[][]);

	assertEquals(params1.get("1"), "2");
});
