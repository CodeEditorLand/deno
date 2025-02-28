// Copyright the Browserify authors. MIT License.
// Ported from https://github.com/browserify/path-browserify/

import { isWindows } from "./constants.ts";
import * as _posix from "./posix.ts";
import * as _win32 from "./win32.ts";

const path = isWindows ? _win32 : _posix;

export const win32 = _win32;

export const posix = _posix;

export const resolve = path.resolve;

export const normalize = path.normalize;

export const isAbsolute = path.isAbsolute;

export const join = path.join;

export const relative = path.relative;

export const toNamespacedPath = path.toNamespacedPath;

export const dirname = path.dirname;

export const basename = path.basename;

export const extname = path.extname;

export const format = path.format;

export const parse = path.parse;

export const sep = path.sep;

export const delimiter = path.delimiter;

export { EOL, SEP, SEP_PATTERN, isWindows } from "./constants.ts";

export * from "./interface.ts";

export * from "./glob.ts";

export * from "./globrex.ts";
