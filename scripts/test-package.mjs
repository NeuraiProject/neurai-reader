/**
 * Persistent package-consumer gate.
 *
 * Packs the already-built artifacts without lifecycle scripts, installs the
 * tarball in an isolated project, verifies ESM/CJS runtime entrypoints and
 * compiles both NodeNext declaration flavours. Nothing outside the mkdtemp
 * directory is removed.
 */
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const temporaryRoot = mkdtempSync(join(tmpdir(), "neurai-reader-package-test-"));
const tarballDirectory = join(temporaryRoot, "tarball");
const consumerDirectory = join(temporaryRoot, "consumer");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args, cwd = packageRoot) {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

try {
  run(process.execPath, [
    "-e",
    "require('node:fs').mkdirSync(process.argv[1], { recursive: true })",
    tarballDirectory,
  ]);
  run(process.execPath, [
    "-e",
    "require('node:fs').mkdirSync(process.argv[1], { recursive: true })",
    consumerDirectory,
  ]);

  const packOutput = run(npmCommand, [
    "pack",
    "--ignore-scripts",
    "--pack-destination",
    tarballDirectory,
    "--json",
  ]);
  const packResult = JSON.parse(packOutput);
  const tarball = join(tarballDirectory, (Array.isArray(packResult) ? packResult[0] : Object.values(packResult)[0]).filename);

  writeFileSync(
    join(consumerDirectory, "package.json"),
    JSON.stringify({ private: true }, null, 2) + "\n",
  );
  run(
    npmCommand,
    [
      "install",
      "--omit=dev",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      tarball,
    ],
    consumerDirectory,
  );

  writeFileSync(
    join(consumerDirectory, "runtime.cjs"),
    `const pkg = require("@neuraiproject/neurai-reader");
if (typeof pkg.default?.getAsset !== "function") process.exit(1);
if (typeof pkg.createReader !== "function") process.exit(1);
if (typeof pkg.isReaderRpcError !== "function") process.exit(1);
`,
  );
  writeFileSync(
    join(consumerDirectory, "runtime.mjs"),
    `import Reader, { createReader, isReaderRpcError } from "@neuraiproject/neurai-reader";
if (typeof Reader.getAsset !== "function") process.exit(1);
if (typeof createReader !== "function") process.exit(1);
if (typeof isReaderRpcError !== "function") process.exit(1);
`,
  );
  run(process.execPath, ["runtime.cjs"], consumerDirectory);
  run(process.execPath, ["runtime.mjs"], consumerDirectory);

  writeFileSync(
    join(consumerDirectory, "types.mts"),
    `import Reader, { createReader, isReaderRpcError, type Reader as ReaderType, type IAssetData } from "@neuraiproject/neurai-reader";
const instance: ReaderType = createReader();
const asset: Promise<IAssetData | null> = instance.getAsset("BUTTER");
const formatted: string = Reader.formatBalance(9007199254740993n);
const pending: number | string = Reader.getAssetBalanceFromMempool("XNA", []);
Reader.getBestBlockHash();
try { await asset; } catch (error) { if (isReaderRpcError(error)) error.code; }
`,
  );
  writeFileSync(
    join(consumerDirectory, "types.cts"),
    `import pkg = require("@neuraiproject/neurai-reader");
import type { Reader, IUTXO } from "@neuraiproject/neurai-reader";
const instance: Reader = pkg.createReader();
const utxos: Promise<IUTXO[]> = instance.getAddressUTXOs("tAddress");
pkg.default.getBestBlockHash();
const formatted: string = pkg.default.formatBalance("9007199254740993");
const pending: Promise<number | string> = instance.getPendingBalanceFromAddressMempool("tAddress");
void utxos;
`,
  );
  writeFileSync(
    join(consumerDirectory, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          noEmit: true,
          module: "NodeNext",
          moduleResolution: "NodeNext",
          target: "ES2022",
        },
        include: ["types.mts", "types.cts"],
      },
      null,
      2,
    ) + "\n",
  );

  const typescriptBin = resolve(
    packageRoot,
    "node_modules/typescript/bin/tsc",
  );
  // Fail with a direct, useful message if a clean checkout omitted dev deps.
  readFileSync(typescriptBin);
  run(process.execPath, [typescriptBin, "-p", "tsconfig.json"], consumerDirectory);

  const installed = JSON.parse(
    readFileSync(
      join(
        consumerDirectory,
        "node_modules/@neuraiproject/neurai-reader/package.json",
      ),
      "utf8",
    ),
  );
  if (installed.devDependencies?.parcel) {
    // It may be declared in the installed manifest, but must not be installed.
    try {
      readFileSync(join(consumerDirectory, "node_modules/parcel/package.json"));
      throw new Error("parcel was installed in the production consumer tree");
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  console.log("package gate: CJS, ESM and NodeNext types passed");
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
