import { existsSync } from "../exists.ts";

try {
	const isExist = existsSync(Deno.args[1]);

	Deno.stdout.write(
		new TextEncoder().encode(isExist ? "exist" : "not exist"),
	);
} catch (err) {
	Deno.stdout.write(new TextEncoder().encode(err.message));
}
