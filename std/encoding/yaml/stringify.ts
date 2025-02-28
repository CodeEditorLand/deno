// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.

import { DumperStateOptions } from "./dumper/dumper_state.ts";
import { dump } from "./dumper/dumper.ts";

export type DumpOptions = DumperStateOptions;

/**
 * Serializes `object` as a YAML document.
 *
 * You can disable exceptions by setting the skipInvalid option to true.
 */
export function stringify(obj: object, options?: DumpOptions): string {
	return dump(obj, options);
}
