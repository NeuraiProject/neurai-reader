# neurai-reader

![image](https://user-images.githubusercontent.com/9694984/214588738-2d4f4522-44ec-44dd-9962-3bd4534bab4d.png)

Read information from the Neurai blockchain. Read-only, key-less and safe to
embed anywhere: it never builds, signs or broadcasts transactions.

By default it talks to the public RPC services (`https://rpc-main.neurai.org/rpc`
for mainnet, `https://rpc-testnet.neurai.org/rpc` for testnet). Point it at any
node you control with `setURL` / `createReader`.

## Install and use

```sh
npm install @neuraiproject/neurai-reader
```

```js
// ESM
import Reader from "@neuraiproject/neurai-reader";

const asset = await Reader.getAsset("BUTTER");
console.table(asset);
```

```js
// CommonJS — note the `.default` (unchanged since 0.0.9)
const Reader = require("@neuraiproject/neurai-reader").default;

Reader.getAsset("BUTTER").then(console.table);
```

The default export is a ready-to-use singleton pointed at mainnet with
anonymous credentials:

```js
Reader.setTestnet();               // or Reader.setURL("http://127.0.0.1:19101");
Reader.setUsername("myuser");      // for authenticated nodes
Reader.setPassword("mypassword");
```

## Multiple nodes at once — `createReader` (new in 0.1.0)

Each instance keeps its own URL and credentials; setters only affect the
instance they are called on:

```js
import { createReader, URL_TESTNET } from "@neuraiproject/neurai-reader";

const mainnet = createReader();                                  // defaults
const testnet = createReader({ url: URL_TESTNET });
const myNode  = createReader({
  url: "http://127.0.0.1:19001",
  username: "user",
  password: "pass",
});

const [a, b] = await Promise.all([
  mainnet.getBestBlockHash(),
  testnet.getBestBlockHash(),
]);
```

## API

For exact signatures and result types, see the generated declarations
(`dist/types.d.ts`) — this section is the maintained overview.

### Chain and blocks

| Method | Notes |
|---|---|
| `getBlockchainInfo()` | Full `getblockchaininfo`, including the NIP-040 `asset_marker` (`'rvn'` \| `'xna'`) the node requires for the next block. |
| `getBestBlockHash()` | Hash of the chain tip. |
| `getBlockByHash(hash, verbosity?)` | Without `verbosity`, node default (1). `0` = raw hex. |
| `getBlockByHeight(height, verbosity?)` | Chains `getblockhash` + `getblock`. Default verbosity 3 (expanded transactions), as in previous releases. |
| `getTransaction(txid)` | Verbose `getrawtransaction`. |
| `getMempool()` | Verbose `getrawmempool`. |

### Addresses

| Method | Notes |
|---|---|
| `getNeuraiBalance(address \| address[])` | `{ balance, received }` in satoshis (XNA only). `[]` resolves `{}`. |
| `getAssetBalance(address \| address[])` | Array with one `{ assetName, balance, received }` entry per asset (XNA included). |
| `getAddressUTXOs(address \| address[])` | Confirmed UTXOs with `script`, `satoshis`, `height`. |
| `getAddressDeltas(address \| address[], assetName?)` | Per-tx deltas. **Without `assetName` it returns deltas for XNA and every asset** (historic behaviour); pass `"XNA"` or an asset name to filter. |
| `getAddressTxids(address \| address[], includeAssets?)` | Transaction ids touching the address(es). `includeAssets` defaults to `false` like the node: asset-only transactions appear when you pass `true`. |
| `getAddressMempool(address \| address[])` | Unconfirmed entries (assets included; spends have negative `satoshis`). |
| `getPendingBalanceFromAddressMempool(address, assetName = "XNA")` | Net unconfirmed change for one asset, in satoshis (new in 0.1.0). |
| `getAssetBalanceFromMempool(assetName, mempool)` | Pure helper behind the previous method (new in 0.1.0). |
| `getPubKey(address)` | `{ address, pubkey, revealed, height, txid }`. Requires a node with `-pubkeyindex=1`. For witness addresses see [Address types](#address-types-neurai-key-5). |
| `verifyMessage(address, signature, message)` | Node-side signature verification. For witness addresses see [Address types](#address-types-neurai-key-5). |

#### Address types (neurai-key 5)

Reader passes addresses to the node untouched and never parses them, so every
address type the node knows works with the address-index methods above:
Legacy Base58 P2PKH (`N…`/`t…`), generic AuthScript witness v1
(`nc1p…`/`tnc1p…`), post-quantum witness v2 (`pq1z…`/`tpq1z…`) and ECDSA
witness v3 (`nq1r…`/`tnq1r…`). What `getPubKey` and `verifyMessage` accept is
decided by the node, not by this library:

- `getPubKey`: the node indexes revealed keys for Legacy P2PKH and AuthScript
  v1 addresses. Strict v2 (`pq1z…`) and v3 (`nq1r…`) addresses are rejected
  with `RPC getpubkey failed: Address does not refer to a key (code -5)`.
- `verifyMessage`: a node with the neurai-key 5 address types verifies Legacy
  P2PKH, AuthScript v1 (PQ key), v2 (PQ) and v3 (ECDSA) signatures. v2/v3
  signatures are bound to the address, so a signature made for one address
  never verifies for another address of the same key. Nodes that predate
  these address types may reject them as invalid addresses, and the
  pre-neurai-key-5 `nq1p…`/`tnq1p…` form is invalid on current nodes.

### Assets

| Method | Notes |
|---|---|
| `getAsset(name)` | Asset metadata, or **`null` when the asset does not exist** (the node does not error). |
| `getAllAssets(prefix = "*", includeAllMetaData = false)` | `listassets`. |
| `getAddressesByAsset(assetName, onlytotal?, count?, start?)` | Holders of an asset. `count` default 5000, cap 50000. |

### Utilities

| Method | Notes |
|---|---|
| `formatBalance(satoshis)` | `"1.50000000"` for `150000000`; `"0"` for zero, null or undefined (new in 0.1.0). |
| `setURL` / `setUsername` / `setPassword` | Reconfigure the instance (or the singleton). |
| `setMainnet()` / `setTestnet()` | Shortcuts to the public URLs (new in 0.1.0). |
| `createReader(options?)` | Independent instance (new in 0.1.0). |
| `URL_MAINNET` / `URL_TESTNET` | Public endpoints, exported named and on the default export. |

## Errors (changed in 0.1.0)

`@neuraiproject/neurai-rpc` >= 0.5 rejects on failure instead of resolving
`undefined`. Reader normalises every RPC failure into a conventional `Error`:

- `message` names the RPC method and keeps the node's description, e.g.
  `RPC getblock failed: Block not found (code -5)`;
- `cause` holds the original structured rejection untouched;
- `code` carries the numeric JSON-RPC error code when the node sent one.
  HTTP/transport failures without a JSON-RPC code never invent one
  (`cause.type === "ServerUnreachable"` identifies connectivity problems).

```js
try {
  await Reader.getBlockByHash(hash);
} catch (e) {
  if (e.code === -5) {
    // Block not found
  }
}
```

TypeScript consumers can narrow the error without assertions using the named
guard and its exported `ReaderRpcError` interface:

```ts
import { isReaderRpcError } from "@neuraiproject/neurai-reader";

try {
  await Reader.getBlockByHash(hash);
} catch (error) {
  if (isReaderRpcError(error) && error.code === -5) {
    // Block not found; error.cause contains the original RPC rejection.
  }
}
```

If your code relied on `undefined` results to detect failures (0.0.x
behaviour), switch to `try/catch`.

## NIP-040

Reader never builds transactions, so the asset-marker change does not affect
its outputs. What applications DO need is the marker itself:
`getBlockchainInfo()` exposes `asset_marker` so you can pass it to the
libraries that build transactions (`@neuraiproject/neurai-create-transaction`,
`@neuraiproject/neurai-jswallet`, ...).

## Migrating from the browser fork (`neurai-addon-sign`)

0.1.0 covers the local `NeuraiReader.js` fork. Equivalences:

| Fork | npm 0.1.0 |
|---|---|
| `setURL` / `setMainnet` / `setTestnet` | identical |
| `getNeuraiBalance`, `getAssetBalance`, `getAddressUTXOs`, `getAddressMempool`, `getAddressTxids`, `getPubKey`, `verifyMessage`, `getTransaction`, `getBestBlockHash`, `getMempool`, `getAllAssets`, `getAssetBalanceFromMempool`, `getPendingBalanceFromAddressMempool`, `formatBalance` | identical |
| `getBlock(hash, verbosity = 1)` | `getBlockByHash(hash, verbosity?)` — omit for node default (1) |
| `getBlockByHeight(height)` (verbosity 2) | `getBlockByHeight(height, 2)` — npm default is 3 |
| `getAddressDeltas(address, assetName = 'XNA')` | `getAddressDeltas(address, "XNA")` — **pass the filter explicitly**: without it, the npm returns deltas for every asset |

Also note the fork resolved JSON-RPC errors by throwing `Error(message)`;
0.1.0 gives you the same `Error` plus `cause` and `code`.

## License

MIT

## Exact amounts (0.1.1)

Reader requires neurai-rpc >= 0.6.1. RPC amounts retain their exact digits:
small values remain numbers; unsafe integers or decimal amounts are returned
as strings. Do not convert these strings to `Number` before doing arithmetic.
The exported `RpcAmount` type is `number | string`.

Local helpers accept raw integer units as safe numbers, integer strings or
bigint (`RawAmount`). Mempool sums use bigint internally and return a number
when safe, otherwise an integer string. Negative pending deltas are supported.
`formatBalance` uses exactly eight decimal places, except zero returns `"0"`.

```js
Reader.formatBalance("9007199254740993"); // "90071992.54740993"
Reader.formatBalance(-1n);               // "-0.00000001"
```

Unsafe numeric inputs, fractional raw units and malformed integer strings now
throw `TypeError` instead of silently rounding. Pass the original integer text
or bigint; digits already lost in a JavaScript number cannot be recovered.
`formatBalance(null)` and `formatBalance(undefined)` retain the legacy `"0"`.
