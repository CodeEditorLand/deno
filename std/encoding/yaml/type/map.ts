// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.

import { Type } from "../type.ts";
import { Any } from "../utils.ts";

export const map = new Type("tag:yaml.org,2002:map", {
	construct(data): Any {
		return data !== null ? data : {};
	},
	kind: "mapping",
});
