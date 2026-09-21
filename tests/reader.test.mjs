/**
 * Deterministic suite for neurai-reader 0.1.0 (plan v2 §3.2).
 * Runs against the BUILT artifact (dist/index.mjs) and local HTTP JSON-RPC
 * servers — no external network. Run: npm run build && npm test
 */
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

import Reader, {
  createReader,
  isReaderRpcError,
  URL_MAINNET,
  URL_TESTNET,
} from "../dist/index.mjs";

// --- local JSON-RPC server ---------------------------------------------------
// handler(method, params) may return:
//   { result }                          → 200 { result }
//   { jsonError: {code,message}, status? } → status (default 200) with body
//   { raw: { status, body, contentType? } } → verbatim response
function startServer(handler) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        const { method, params } = JSON.parse(body);
        server.calls.push({
          method,
          params,
          authorization: req.headers.authorization,
        });
        let out;
        try {
          out = handler(method, params);
        } catch (e) {
          out = { jsonError: { code: -32603, message: String(e.message ?? e) } };
        }
        if (out && out.raw) {
          res.writeHead(out.raw.status, {
            "Content-Type": out.raw.contentType ?? "text/plain",
          });
          res.end(out.raw.body);
          return;
        }
        if (out && out.jsonError) {
          res.writeHead(out.status ?? 200, {
            "Content-Type": "application/json",
          });
          res.end(
            JSON.stringify({
              result: null,
              error: out.jsonError,
              description: out.jsonError.message,
            }),
          );
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ result: out ? out.result : null }));
      });
    });
    server.calls = [];
    server.listen(0, "127.0.0.1", () => {
      server.url = `http://127.0.0.1:${server.address().port}/`;
      resolve(server);
    });
  });
}

const openServers = [];
async function serverWith(handler) {
  const s = await startServer(handler);
  openServers.push(s);
  return s;
}

afterEach(async () => {
  // Restore the singleton so no test depends on order or leaks to mainnet.
  Reader.setURL(URL_MAINNET);
  Reader.setUsername("anonymous");
  Reader.setPassword("anonymous");
  while (openServers.length) {
    const s = openServers.pop();
    if (s.closeAllConnections) s.closeAllConnections();
    await new Promise((r) => s.close(r));
  }
});

async function rejectionOf(promise) {
  try {
    await promise;
  } catch (e) {
    return e;
  }
  return null;
}

// --- §3.2.1 happy path -------------------------------------------------------

test("results pass through untouched (getAsset, getBestBlockHash)", async () => {
  const s = await serverWith((method) => {
    if (method === "getassetdata")
      return { result: { name: "BUTTER", amount: 100, units: 0 } };
    if (method === "getbestblockhash") return { result: "ab".repeat(32) };
    throw new Error(`unexpected ${method}`);
  });
  const r = createReader({ url: s.url });
  assert.deepEqual(await r.getAsset("BUTTER"), {
    name: "BUTTER",
    amount: 100,
    units: 0,
  });
  assert.equal(await r.getBestBlockHash(), "ab".repeat(32));
});

// --- §3.2.2-5 error contract -------------------------------------------------

test("JSON-RPC error over 200 → Error with method, description, code, cause", async () => {
  const s = await serverWith(() => ({
    jsonError: { code: -8, message: "Block height out of range" },
  }));
  const r = createReader({ url: s.url });
  const err = await rejectionOf(r.getBlockByHash("00".repeat(32)));
  assert.ok(err instanceof Error);
  assert.match(err.message, /getblock/);
  assert.match(err.message, /Block height out of range/);
  assert.equal(err.code, -8);
  assert.equal(err.cause?.error?.code, -8);
  assert.equal(isReaderRpcError(err), true);
  assert.equal(isReaderRpcError(new Error("ordinary")), false);
});

test("JSON-RPC error over HTTP 500 keeps code and status in cause", async () => {
  const s = await serverWith(() => ({
    jsonError: { code: -26, message: "txn-mempool-conflict" },
    status: 500,
  }));
  const r = createReader({ url: s.url });
  const err = await rejectionOf(r.getBestBlockHash());
  assert.ok(err instanceof Error);
  assert.match(err.message, /getbestblockhash/);
  assert.match(err.message, /txn-mempool-conflict/);
  assert.equal(err.code, -26);
  assert.equal(err.cause?.status, 500);
});

test("HTTP error without JSON-RPC body → Error without invented code", async () => {
  const s = await serverWith(() => ({
    raw: { status: 503, body: "upstream down" },
  }));
  const r = createReader({ url: s.url });
  const err = await rejectionOf(r.getBestBlockHash());
  assert.ok(err instanceof Error);
  assert.match(err.message, /HTTP 503/);
  assert.ok(!("code" in err));
  assert.equal(err.cause?.status, 503);
});

test("unreachable server → Error, no code, cause.type ServerUnreachable", async () => {
  const s = await startServer(() => ({ result: null }));
  const url = s.url;
  if (s.closeAllConnections) s.closeAllConnections();
  await new Promise((r) => s.close(r));

  const r = createReader({ url });
  const err = await rejectionOf(r.getBestBlockHash());
  assert.ok(err instanceof Error);
  assert.match(err.message, /getbestblockhash/);
  assert.ok(!("code" in err));
  assert.equal(err.cause?.type, "ServerUnreachable");
});

// --- §3.2.6-8 instances and singleton ---------------------------------------

test("two instances hit two servers with their own data, in parallel", async () => {
  const s1 = await serverWith(() => ({ result: "11".repeat(32) }));
  const s2 = await serverWith(() => ({ result: "22".repeat(32) }));
  const a = createReader({ url: s1.url });
  const b = createReader({ url: s2.url });
  const [ha, hb] = await Promise.all([
    a.getBestBlockHash(),
    b.getBestBlockHash(),
  ]);
  assert.equal(ha, "11".repeat(32));
  assert.equal(hb, "22".repeat(32));
});

test("setters of one instance do not affect another instance", async () => {
  const s1 = await serverWith(() => ({ result: "aa".repeat(32) }));
  const s2 = await serverWith(() => ({ result: "bb".repeat(32) }));
  const a = createReader({ url: s1.url });
  const b = createReader({ url: s1.url });
  b.setURL(s2.url);
  b.setUsername("other");
  assert.equal(await a.getBestBlockHash(), "aa".repeat(32));
  assert.equal(await b.getBestBlockHash(), "bb".repeat(32));
  // a kept its original credentials
  const lastA = s1.calls.at(-1);
  assert.equal(
    lastA.authorization,
    "Basic " + Buffer.from("anonymous:anonymous").toString("base64"),
  );
});

test("an independent instance does not affect the singleton", async () => {
  const singletonServer = await serverWith(() => ({ result: "33".repeat(32) }));
  const instanceServer = await serverWith(() => ({ result: "44".repeat(32) }));
  Reader.setURL(singletonServer.url);
  const instance = createReader({ url: singletonServer.url });
  instance.setURL(instanceServer.url);

  assert.equal(await Reader.getBestBlockHash(), "33".repeat(32));
  assert.equal(await instance.getBestBlockHash(), "44".repeat(32));
});

test("setMainnet and setTestnet select their named public URL", async () => {
  const originalFetch = globalThis.fetch;
  const requestedURLs = [];
  globalThis.fetch = async (url) => {
    requestedURLs.push(String(url));
    return new Response(JSON.stringify({ result: "55".repeat(32) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  try {
    const instance = createReader({ url: "http://127.0.0.1:1/" });
    instance.setTestnet();
    await instance.getBestBlockHash();
    instance.setMainnet();
    await instance.getBestBlockHash();
    assert.deepEqual(requestedURLs, [URL_TESTNET, URL_MAINNET]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("failed setters are atomic and preserve the working connection", async () => {
  const s = await serverWith(() => ({ result: "66".repeat(32) }));
  const instance = createReader({ url: s.url, username: "user", password: "pass" });

  assert.throws(() => instance.setURL(""), /Syntax error/);
  assert.equal(await instance.getBestBlockHash(), "66".repeat(32));
  assert.throws(() => instance.setUsername(""), /Syntax error/);
  assert.equal(await instance.getBestBlockHash(), "66".repeat(32));
  assert.throws(() => instance.setPassword(""), /Syntax error/);
  assert.equal(await instance.getBestBlockHash(), "66".repeat(32));
  assert.equal(
    s.calls.at(-1).authorization,
    "Basic " + Buffer.from("user:pass").toString("base64"),
  );
});

test("singleton setters rebuild a normalized RPC and keep working", async () => {
  const s = await serverWith(() => ({ result: "cc".repeat(32) }));
  Reader.setURL(s.url);
  Reader.setUsername("user1");
  Reader.setPassword("pass1");
  assert.equal(await Reader.getBestBlockHash(), "cc".repeat(32));
  assert.equal(
    s.calls.at(-1).authorization,
    "Basic " + Buffer.from("user1:pass1").toString("base64"),
  );
  // still normalized after the rebuilds
  const s2 = await serverWith(() => ({
    jsonError: { code: -5, message: "not found" },
  }));
  Reader.setURL(s2.url);
  const err = await rejectionOf(Reader.getBestBlockHash());
  assert.ok(err instanceof Error);
  assert.equal(err.code, -5);
});

// --- §3.2.9-10 parameter contracts ------------------------------------------

test("getAddressDeltas: no filter sends assetName '' (historic), filter sends it", async () => {
  const s = await serverWith(() => ({ result: [] }));
  const r = createReader({ url: s.url });
  await r.getAddressDeltas("tADDR");
  assert.deepEqual(s.calls.at(-1).params[0], {
    addresses: ["tADDR"],
    assetName: "",
  });
  await r.getAddressDeltas(["tADDR"], "XNA");
  assert.deepEqual(s.calls.at(-1).params[0], {
    addresses: ["tADDR"],
    assetName: "XNA",
  });
});

test("getAddressTxids: includeAssets defaults to false and is honoured when true", async () => {
  const s = await serverWith(() => ({ result: [] }));
  const r = createReader({ url: s.url });
  await r.getAddressTxids("tADDR");
  assert.deepEqual(s.calls.at(-1).params, [{ addresses: ["tADDR"] }, false]);
  await r.getAddressTxids("tADDR", true);
  assert.deepEqual(s.calls.at(-1).params, [{ addresses: ["tADDR"] }, true]);
});

test("getAddressesByAsset applies defaults, cap and numeric start", async () => {
  const s = await serverWith(() => ({ result: {} }));
  const r = createReader({ url: s.url });
  await r.getAddressesByAsset("BUTTER");
  assert.deepEqual(s.calls.at(-1).params, ["BUTTER", false, 5000, 0]);
  await r.getAddressesByAsset("BUTTER", true, 90000, 12);
  assert.deepEqual(s.calls.at(-1).params, ["BUTTER", true, 50000, 12]);
});

// --- §3.2.11-13 mempool helpers and formatting -------------------------------

test("getAssetBalanceFromMempool sums net satoshis for one asset only", () => {
  const mempool = [
    { assetName: "XNA", satoshis: 500 },
    { assetName: "XNA", satoshis: -200 },
    { assetName: "BUTTER", satoshis: 999 },
    null,
  ];
  assert.equal(Reader.getAssetBalanceFromMempool("XNA", mempool), 300);
  assert.equal(Reader.getAssetBalanceFromMempool("BUTTER", mempool), 999);
  assert.equal(Reader.getAssetBalanceFromMempool("XNA", []), 0);
  assert.equal(Reader.getAssetBalanceFromMempool("XNA", "nope"), 0);
});

test("getPendingBalanceFromAddressMempool composes with the real HTTP call", async () => {
  const s = await serverWith((method) => {
    if (method === "getaddressmempool")
      return {
        result: [
          { address: "tADDR", assetName: "XNA", satoshis: 700 },
          { address: "tADDR", assetName: "XNA", satoshis: -100 },
          { address: "tADDR", assetName: "BUTTER", satoshis: 42 },
        ],
      };
    throw new Error(`unexpected ${method}`);
  });
  const r = createReader({ url: s.url });
  assert.equal(await r.getPendingBalanceFromAddressMempool("tADDR"), 600);
  assert.equal(
    await r.getPendingBalanceFromAddressMempool("tADDR", "BUTTER"),
    42,
  );
});

test("formatBalance: '0' for falsy, '1.50000000' for 150000000", () => {
  assert.equal(Reader.formatBalance(0), "0");
  assert.equal(Reader.formatBalance(undefined), "0");
  assert.equal(Reader.formatBalance(150000000), "1.50000000");
});

// --- §3.2.14 empty-input short-circuit --------------------------------------

test("getNeuraiBalance([]) resolves {} without any HTTP request", async () => {
  // Closed port: any accidental request would reject loudly.
  const s = await startServer(() => ({ result: null }));
  const url = s.url;
  if (s.closeAllConnections) s.closeAllConnections();
  await new Promise((r) => s.close(r));
  const r = createReader({ url });
  assert.deepEqual(await r.getNeuraiBalance([]), {});
});

// --- §3.2.15-16 block accessors ---------------------------------------------

test("getBlockByHash omits verbosity by default and sends it when given", async () => {
  const s = await serverWith(() => ({ result: { hash: "x" } }));
  const r = createReader({ url: s.url });
  await r.getBlockByHash("ff".repeat(32));
  assert.deepEqual(s.calls.at(-1).params, ["ff".repeat(32)]);
  await r.getBlockByHash("ff".repeat(32), 2);
  assert.deepEqual(s.calls.at(-1).params, ["ff".repeat(32), 2]);
});

test("getBlockByHeight: default verbosity 3, custom value, and both failure legs normalized", async () => {
  const s = await serverWith((method) => {
    if (method === "getblockhash") return { result: "ee".repeat(32) };
    if (method === "getblock") return { result: { height: 7 } };
    throw new Error(`unexpected ${method}`);
  });
  const r = createReader({ url: s.url });
  await r.getBlockByHeight(7);
  assert.deepEqual(s.calls.at(-1).params, ["ee".repeat(32), 3]);
  await r.getBlockByHeight(7, 2);
  assert.deepEqual(s.calls.at(-1).params, ["ee".repeat(32), 2]);

  const sFail1 = await serverWith((method) => {
    if (method === "getblockhash")
      return { jsonError: { code: -8, message: "Block height out of range" } };
    throw new Error(`unexpected ${method}`);
  });
  const err1 = await rejectionOf(
    createReader({ url: sFail1.url }).getBlockByHeight(999999),
  );
  assert.ok(err1 instanceof Error);
  assert.match(err1.message, /getblockhash/);
  assert.equal(err1.code, -8);

  const sFail2 = await serverWith((method) => {
    if (method === "getblockhash") return { result: "dd".repeat(32) };
    if (method === "getblock")
      return { jsonError: { code: -5, message: "Block not found" } };
    throw new Error(`unexpected ${method}`);
  });
  const err2 = await rejectionOf(
    createReader({ url: sFail2.url }).getBlockByHeight(7),
  );
  assert.ok(err2 instanceof Error);
  assert.match(err2.message, /getblock/);
  assert.equal(err2.code, -5);
});

// Literal JSON is essential: JSON.stringify of an unsafe number would already
// have discarded the digits before the transport sees the response.
test("RPC 0.6.1 preserves large raw and display amounts through Reader", async () => {
  const responses = {
    getaddressbalance: '{"balance":9007199254740993,"received":10000000000000001}',
    getaddressutxos: '[{"satoshis":9007199254740993}]',
    getaddressdeltas: '[{"satoshis":-9007199254740993}]',
    getassetdata: '{"name":"BIG","amount":100000000.00000001,"units":8}',
    getaddressmempool: '[{"assetName":"XNA","satoshis":9007199254740993},{"assetName":"XNA","satoshis":-9007199254740992},{"assetName":"BIG","satoshis":10000000000000001}]',
  };
  const s = await serverWith(method => ({ raw: {
    status: 200, contentType: "application/json", body: `{"result":${responses[method]}}`,
  } }));
  const r = createReader({ url: s.url });
  assert.deepEqual(await r.getNeuraiBalance("tADDR"), { balance: "9007199254740993", received: "10000000000000001" });
  assert.equal((await r.getAddressUTXOs("tADDR"))[0].satoshis, "9007199254740993");
  assert.equal((await r.getAddressDeltas("tADDR"))[0].satoshis, "-9007199254740993");
  assert.equal((await r.getAsset("BIG")).amount, "100000000.00000001");
  assert.equal(await r.getPendingBalanceFromAddressMempool("tADDR"), 1);
  assert.equal(await r.getPendingBalanceFromAddressMempool("tADDR", "BIG"), "10000000000000001");
});

test("mempool sums remain exact across unsafe intermediate totals and cancellation", () => {
  const entries = [Number.MAX_SAFE_INTEGER, 2, -Number.MAX_SAFE_INTEGER].map(satoshis => ({ assetName: "XNA", satoshis }));
  assert.equal(Reader.getAssetBalanceFromMempool("XNA", entries), 2);
  assert.equal(Reader.getAssetBalanceFromMempool("BIG", [
    { assetName: "BIG", satoshis: -9007199254740993n },
    { assetName: "XNA", satoshis: 100 },
  ]), "-9007199254740993");
});

test("formatBalance keeps every raw unit, including negative deltas", () => {
  for (const [raw, expected] of [
    ["9007199254740993", "90071992.54740993"],
    [10000000000000001n, "100000000.00000001"],
    [-1n, "-0.00000001"],
    ["-9007199254740993", "-90071992.54740993"],
    ["0", "0"], [0n, "0"],
  ]) assert.equal(Reader.formatBalance(raw), expected);
});

test("amount helpers reject values that are rounded or malformed", () => {
  for (const amount of [9007199254740992, NaN, Infinity, 1.5, "1.5", "", "oops", true]) {
    assert.throws(() => Reader.formatBalance(amount), TypeError);
    assert.throws(() => Reader.getAssetBalanceFromMempool("XNA", [{ assetName: "XNA", satoshis: amount }]), TypeError);
  }
});
