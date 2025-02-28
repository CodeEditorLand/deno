// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
import { assert, assertEquals } from "../testing/asserts.ts";
import { test } from "../testing/mod.ts";
import { delCookie, getCookies, setCookie } from "./cookie.ts";
import { Response, ServerRequest } from "./server.ts";

test({
	name: "[HTTP] Cookie parser",
	fn(): void {
		const req = new ServerRequest();

		req.headers = new Headers();

		assertEquals(getCookies(req), {});

		req.headers = new Headers();

		req.headers.set("Cookie", "foo=bar");

		assertEquals(getCookies(req), { foo: "bar" });

		req.headers = new Headers();

		req.headers.set("Cookie", "full=of  ; tasty=chocolate");

		assertEquals(getCookies(req), { full: "of  ", tasty: "chocolate" });

		req.headers = new Headers();

		req.headers.set("Cookie", "igot=99; problems=but...");

		assertEquals(getCookies(req), { igot: "99", problems: "but..." });

		req.headers = new Headers();

		req.headers.set("Cookie", "PREF=al=en-GB&f1=123; wide=1; SID=123");

		assertEquals(getCookies(req), {
			PREF: "al=en-GB&f1=123",
			wide: "1",
			SID: "123",
		});
	},
});

test({
	name: "[HTTP] Cookie Delete",
	fn(): void {
		const res: Response = {};

		delCookie(res, "deno");

		assertEquals(
			res.headers!.get("Set-Cookie"),
			"deno=; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
		);
	},
});

test({
	name: "[HTTP] Cookie Set",
	fn(): void {
		const res: Response = {};

		res.headers = new Headers();

		setCookie(res, { name: "Space", value: "Cat" });

		assertEquals(res.headers.get("Set-Cookie"), "Space=Cat");

		res.headers = new Headers();

		setCookie(res, { name: "Space", value: "Cat", secure: true });

		assertEquals(res.headers.get("Set-Cookie"), "Space=Cat; Secure");

		res.headers = new Headers();

		setCookie(res, { name: "Space", value: "Cat", httpOnly: true });

		assertEquals(res.headers.get("Set-Cookie"), "Space=Cat; HttpOnly");

		res.headers = new Headers();

		setCookie(res, {
			name: "Space",
			value: "Cat",
			httpOnly: true,
			secure: true,
		});

		assertEquals(
			res.headers.get("Set-Cookie"),
			"Space=Cat; Secure; HttpOnly",
		);

		res.headers = new Headers();

		setCookie(res, {
			name: "Space",
			value: "Cat",
			httpOnly: true,
			secure: true,
			maxAge: 2,
		});

		assertEquals(
			res.headers.get("Set-Cookie"),
			"Space=Cat; Secure; HttpOnly; Max-Age=2",
		);

		let error = false;

		res.headers = new Headers();

		try {
			setCookie(res, {
				name: "Space",
				value: "Cat",
				httpOnly: true,
				secure: true,
				maxAge: 0,
			});
		} catch (e) {
			error = true;
		}

		assert(error);

		res.headers = new Headers();

		setCookie(res, {
			name: "Space",
			value: "Cat",
			httpOnly: true,
			secure: true,
			maxAge: 2,
			domain: "deno.land",
		});

		assertEquals(
			res.headers.get("Set-Cookie"),
			"Space=Cat; Secure; HttpOnly; Max-Age=2; Domain=deno.land",
		);

		res.headers = new Headers();

		setCookie(res, {
			name: "Space",
			value: "Cat",
			httpOnly: true,
			secure: true,
			maxAge: 2,
			domain: "deno.land",
			sameSite: "Strict",
		});

		assertEquals(
			res.headers.get("Set-Cookie"),
			"Space=Cat; Secure; HttpOnly; Max-Age=2; Domain=deno.land; " +
				"SameSite=Strict",
		);

		res.headers = new Headers();

		setCookie(res, {
			name: "Space",
			value: "Cat",
			httpOnly: true,
			secure: true,
			maxAge: 2,
			domain: "deno.land",
			sameSite: "Lax",
		});

		assertEquals(
			res.headers.get("Set-Cookie"),
			"Space=Cat; Secure; HttpOnly; Max-Age=2; Domain=deno.land; SameSite=Lax",
		);

		res.headers = new Headers();

		setCookie(res, {
			name: "Space",
			value: "Cat",
			httpOnly: true,
			secure: true,
			maxAge: 2,
			domain: "deno.land",
			path: "/",
		});

		assertEquals(
			res.headers.get("Set-Cookie"),
			"Space=Cat; Secure; HttpOnly; Max-Age=2; Domain=deno.land; Path=/",
		);

		res.headers = new Headers();

		setCookie(res, {
			name: "Space",
			value: "Cat",
			httpOnly: true,
			secure: true,
			maxAge: 2,
			domain: "deno.land",
			path: "/",
			unparsed: ["unparsed=keyvalue", "batman=Bruce"],
		});

		assertEquals(
			res.headers.get("Set-Cookie"),
			"Space=Cat; Secure; HttpOnly; Max-Age=2; Domain=deno.land; Path=/; " +
				"unparsed=keyvalue; batman=Bruce",
		);

		res.headers = new Headers();

		setCookie(res, {
			name: "Space",
			value: "Cat",
			httpOnly: true,
			secure: true,
			maxAge: 2,
			domain: "deno.land",
			path: "/",
			expires: new Date(Date.UTC(1983, 0, 7, 15, 32)),
		});

		assertEquals(
			res.headers.get("Set-Cookie"),
			"Space=Cat; Secure; HttpOnly; Max-Age=2; Domain=deno.land; Path=/; " +
				"Expires=Fri, 07 Jan 1983 15:32:00 GMT",
		);

		res.headers = new Headers();

		setCookie(res, { name: "__Secure-Kitty", value: "Meow" });

		assertEquals(
			res.headers.get("Set-Cookie"),
			"__Secure-Kitty=Meow; Secure",
		);

		res.headers = new Headers();

		setCookie(res, {
			name: "__Host-Kitty",
			value: "Meow",
			domain: "deno.land",
		});

		assertEquals(
			res.headers.get("Set-Cookie"),
			"__Host-Kitty=Meow; Secure; Path=/",
		);
	},
});
