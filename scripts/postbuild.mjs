/**
 * Parcel emits a single dist/types.d.ts. Without a package-level
 * "type": "module", TypeScript under Node16/NodeNext flavours that file as
 * CommonJS, so the ESM entry (dist/index.mjs) would type its default import
 * as the module namespace. Ship per-condition declarations instead:
 *   dist/types.d.mts → "import" condition (ESM-flavoured, real default)
 *   dist/types.d.cts → "require" condition (CJS-flavoured, exports.default)
 * Content is identical; only the extension changes the flavour.
 */
import { readFileSync, writeFileSync } from "node:fs";

const source = readFileSync("dist/types.d.ts", "utf8")
  // The copies have no map of their own; drop the pointer to types.d.ts.map.
  .replace(/^\/\/# sourceMappingURL=.*$/m, "")
  .trimEnd();

writeFileSync("dist/types.d.mts", source + "\n");
writeFileSync("dist/types.d.cts", source + "\n");
console.log("postbuild: dist/types.d.mts and dist/types.d.cts written");
