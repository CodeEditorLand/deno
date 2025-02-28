import * as path from "../path/mod.ts";

/**
 * Test whether or not `dest` is a sub-directory of `src`
 * @param src src file path
 * @param dest dest file path
 * @param sep path separator
 */
export function isSubdir(
	src: string,
	dest: string,
	sep: string = path.sep,
): boolean {
	if (src === dest) {
		return false;
	}

	const srcArray = src.split(sep);

	const destArray = dest.split(sep);
	// see: https://github.com/Microsoft/TypeScript/issues/30821
	return srcArray.reduce(
		// @ts-ignore
		(acc: true, current: string, i: number): boolean => {
			return acc && destArray[i] === current;
		},
		true,
	);
}

export type PathType = "file" | "dir" | "symlink";

/**
 * Get a human readable file type string.
 *
 * @param fileInfo A FileInfo describes a file and is returned by `stat`,
 *                 `lstat`
 */
export function getFileInfoType(fileInfo: Deno.FileInfo): PathType | undefined {
	return fileInfo.isFile()
		? "file"
		: fileInfo.isDirectory()
			? "dir"
			: fileInfo.isSymlink()
				? "symlink"
				: undefined;
}
