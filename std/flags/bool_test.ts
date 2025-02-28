// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../testing/asserts.ts";
import { test } from "../testing/mod.ts";
import { parse } from "./mod.ts";

test(function flagBooleanDefaultFalse(): void {
	const argv = parse(["moo"], {
		boolean: ["t", "verbose"],
		default: { verbose: false, t: false },
	});

	assertEquals(argv, {
		verbose: false,
		t: false,
		_: ["moo"],
	});

	assertEquals(typeof argv.verbose, "boolean");

	assertEquals(typeof argv.t, "boolean");
});

test(function booleanGroups(): void {
	const argv = parse(["-x", "-z", "one", "two", "three"], {
		boolean: ["x", "y", "z"],
	});

	assertEquals(argv, {
		x: true,
		y: false,
		z: true,
		_: ["one", "two", "three"],
	});

	assertEquals(typeof argv.x, "boolean");

	assertEquals(typeof argv.y, "boolean");

	assertEquals(typeof argv.z, "boolean");
});

test(function booleanAndAliasWithChainableApi(): void {
	const aliased = ["-h", "derp"];

	const regular = ["--herp", "derp"];

	const aliasedArgv = parse(aliased, {
		boolean: "herp",
		alias: { h: "herp" },
	});

	const propertyArgv = parse(regular, {
		boolean: "herp",
		alias: { h: "herp" },
	});

	const expected = {
		herp: true,
		h: true,
		_: ["derp"],
	};

	assertEquals(aliasedArgv, expected);

	assertEquals(propertyArgv, expected);
});

test(function booleanAndAliasWithOptionsHash(): void {
	const aliased = ["-h", "derp"];

	const regular = ["--herp", "derp"];

	const opts = {
		alias: { h: "herp" },
		boolean: "herp",
	};

	const aliasedArgv = parse(aliased, opts);

	const propertyArgv = parse(regular, opts);

	const expected = {
		herp: true,
		h: true,
		_: ["derp"],
	};

	assertEquals(aliasedArgv, expected);

	assertEquals(propertyArgv, expected);
});

test(function booleanAndAliasArrayWithOptionsHash(): void {
	const aliased = ["-h", "derp"];

	const regular = ["--herp", "derp"];

	const alt = ["--harp", "derp"];

	const opts = {
		alias: { h: ["herp", "harp"] },
		boolean: "h",
	};

	const aliasedArgv = parse(aliased, opts);

	const propertyArgv = parse(regular, opts);

	const altPropertyArgv = parse(alt, opts);

	const expected = {
		harp: true,
		herp: true,
		h: true,
		_: ["derp"],
	};

	assertEquals(aliasedArgv, expected);

	assertEquals(propertyArgv, expected);

	assertEquals(altPropertyArgv, expected);
});

test(function booleanAndAliasUsingExplicitTrue(): void {
	const aliased = ["-h", "true"];

	const regular = ["--herp", "true"];

	const opts = {
		alias: { h: "herp" },
		boolean: "h",
	};

	const aliasedArgv = parse(aliased, opts);

	const propertyArgv = parse(regular, opts);

	const expected = {
		herp: true,
		h: true,
		_: [],
	};

	assertEquals(aliasedArgv, expected);

	assertEquals(propertyArgv, expected);
});

// regression, see https://github.com/substack/node-optimist/issues/71
// boolean and --x=true
test(function booleanAndNonBoolean(): void {
	const parsed = parse(["--boool", "--other=true"], {
		boolean: "boool",
	});

	assertEquals(parsed.boool, true);

	assertEquals(parsed.other, "true");

	const parsed2 = parse(["--boool", "--other=false"], {
		boolean: "boool",
	});

	assertEquals(parsed2.boool, true);

	assertEquals(parsed2.other, "false");
});

test(function booleanParsingTrue(): void {
	const parsed = parse(["--boool=true"], {
		default: {
			boool: false,
		},
		boolean: ["boool"],
	});

	assertEquals(parsed.boool, true);
});

test(function booleanParsingFalse(): void {
	const parsed = parse(["--boool=false"], {
		default: {
			boool: true,
		},
		boolean: ["boool"],
	});

	assertEquals(parsed.boool, false);
});

test(function booleanParsingTrueLike(): void {
	const parsed = parse(["-t", "true123"], { boolean: ["t"] });

	assertEquals(parsed.t, true);

	const parsed2 = parse(["-t", "123"], { boolean: ["t"] });

	assertEquals(parsed2.t, true);

	const parsed3 = parse(["-t", "false123"], { boolean: ["t"] });

	assertEquals(parsed3.t, true);
});

test(function booleanNegationAfterBoolean(): void {
	const parsed = parse(["--foo", "--no-foo"], { boolean: ["foo"] });

	assertEquals(parsed.foo, false);

	const parsed2 = parse(["--foo", "--no-foo", "123"], { boolean: ["foo"] });

	assertEquals(parsed2.foo, false);
});

test(function booleanAfterBooleanNegation(): void {
	const parsed = parse(["--no--foo", "--foo"], { boolean: ["foo"] });

	assertEquals(parsed.foo, true);

	const parsed2 = parse(["--no--foo", "--foo", "123"], { boolean: ["foo"] });

	assertEquals(parsed2.foo, true);
});

test(function latestFlagIsBooleanNegation(): void {
	const parsed = parse(["--no-foo", "--foo", "--no-foo"], {
		boolean: ["foo"],
	});

	assertEquals(parsed.foo, false);

	const parsed2 = parse(["--no-foo", "--foo", "--no-foo", "123"], {
		boolean: ["foo"],
	});

	assertEquals(parsed2.foo, false);
});

test(function latestFlagIsBoolean(): void {
	const parsed = parse(["--foo", "--no-foo", "--foo"], { boolean: ["foo"] });

	assertEquals(parsed.foo, true);

	const parsed2 = parse(["--foo", "--no-foo", "--foo", "123"], {
		boolean: ["foo"],
	});

	assertEquals(parsed2.foo, true);
});
