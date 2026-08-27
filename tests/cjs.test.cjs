/**
 * CJS contract (plan v2 §2.2): the 0.0.9 shape `require(...).default.*` is
 * preserved, and 0.1.0 adds named `createReader`. `require(...).getAsset` was
 * never part of the contract and stays absent.
 */
const { test } = require("node:test");
const assert = require("node:assert/strict");

test("CJS exposes pkg.default (full API) and pkg.createReader", () => {
  const pkg = require("../dist/index.cjs");
  assert.equal(typeof pkg.default, "object");
  assert.equal(typeof pkg.default.getAsset, "function");
  assert.equal(typeof pkg.default.getBestBlockHash, "function");
  assert.equal(typeof pkg.default.createReader, "function");
  assert.equal(typeof pkg.createReader, "function");
  assert.equal(typeof pkg.default.URL_MAINNET, "string");
  assert.equal(typeof pkg.URL_MAINNET, "string");
  // Not promised in 0.0.9, must not silently appear as the primary contract:
  assert.equal(typeof pkg.getAsset, "undefined");
  // Helpers work through the CJS path too.
  assert.equal(pkg.default.formatBalance(150000000), "1.50000000");
  const r = pkg.createReader({ url: "http://127.0.0.1:1/" });
  assert.equal(typeof r.getBlockchainInfo, "function");
});
