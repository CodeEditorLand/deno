import { parse } from "./mod.ts";

// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
const { args } = Deno;

console.dir(parse(args));
