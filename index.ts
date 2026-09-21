import { getRPC, methods } from "@neuraiproject/neurai-rpc";

/** Exact RPC quantities: unsafe JSON numbers are preserved as decimal text. */
export type RpcAmount = number | string;
/** Raw integer units accepted by local amount helpers. */
export type RawAmount = RpcAmount | bigint;

const ONE_FULL_COIN = 100000000n;

function rawInteger(value: RawAmount): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isSafeInteger(value)) return BigInt(value);
  if (typeof value === "string" && /^-?[0-9]+$/.test(value)) return BigInt(value);
  throw new TypeError("Amount must be a safe integer, bigint or integer string");
}

function compatibleInteger(value: bigint): RpcAmount {
  return value >= BigInt(Number.MIN_SAFE_INTEGER) && value <= BigInt(Number.MAX_SAFE_INTEGER)
    ? Number(value) : value.toString();
}

export const URL_MAINNET = "https://rpc-main.neurai.org/rpc";
export const URL_TESTNET = "https://rpc-testnet.neurai.org/rpc";

// ---------------------------------------------------------------------------
// RPC error normalisation
//
// @neuraiproject/neurai-rpc >= 0.5 rejects with plain structured objects, in
// three shapes:
//   1. JSON-RPC error:        { error: { code, message }, description }
//   2. HTTP error:            { statusText, status, description, error }
//   3. Transport failure:     { originalError, type: "ServerUnreachable", ... }
//
// Reader's public contract (same as neurai-jswallet 0.15.0): every failure
// coming from the RPC rejects as an `Error` whose message names the method,
// whose `cause` holds the original rejection, and whose `code` carries the
// numeric JSON-RPC code when one exists. HTTP/transport failures without a
// JSON-RPC code never invent one. Already-normalised errors pass through.
// ---------------------------------------------------------------------------

type RpcErrorShape = {
  error?: unknown;
  description?: unknown;
  status?: unknown;
  statusText?: unknown;
};

const NORMALIZED_BRAND = Symbol.for("neurai.reader.normalizedRpcError");

/** Normalized failure returned by every RPC-backed Reader method. */
export interface ReaderRpcError extends Error {
  cause: unknown;
  code?: number;
}

/** Type guard for errors produced by the Reader RPC transport. */
export function isReaderRpcError(value: unknown): value is ReaderRpcError {
  return (
    value instanceof Error &&
    (value as unknown as Record<symbol, unknown>)[NORMALIZED_BRAND] === true
  );
}

function stringifyUnknown(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function describeRpcRejection(reason: unknown): string {
  if (reason instanceof Error && reason.message) return reason.message;
  if (typeof reason === "string") return reason;

  if (reason && typeof reason === "object") {
    const value = reason as RpcErrorShape;

    if (value.error && typeof value.error === "object") {
      const rpcError = value.error as { message?: unknown; code?: unknown };
      if (rpcError.message) {
        return rpcError.code !== undefined && rpcError.code !== null
          ? `${String(rpcError.message)} (code ${String(rpcError.code)})`
          : String(rpcError.message);
      }
      return stringifyUnknown(value.error);
    }

    if (value.error) return stringifyUnknown(value.error);
    if (value.description) return stringifyUnknown(value.description);
    if (value.status || value.statusText) {
      return `HTTP ${String(value.status ?? "")} ${String(value.statusText ?? "")}`.trim();
    }

    return stringifyUnknown(reason);
  }

  return "Unknown RPC error";
}

function extractJsonRpcCode(reason: unknown): number | undefined {
  if (!reason || typeof reason !== "object") return undefined;
  const error = (reason as RpcErrorShape).error;
  if (!error || typeof error !== "object") return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === "number" ? code : undefined;
}

function normalizeRpcError(reason: unknown, context: string): ReaderRpcError {
  if (isReaderRpcError(reason)) return reason;

  const err = new Error(
    `${context}: ${describeRpcRejection(reason)}`
  ) as ReaderRpcError;
  err.cause = reason;
  const code = extractJsonRpcCode(reason);
  if (code !== undefined) err.code = code;
  (err as unknown as Record<symbol, unknown>)[NORMALIZED_BRAND] = true;
  return err;
}

type RpcClient = (method: string, params: any[]) => Promise<any>;

function wrapRpc(rpc: RpcClient): RpcClient {
  return async function normalizedRpc(method: string, params: any[]) {
    try {
      return await rpc(method, params);
    } catch (reason) {
      throw normalizeRpcError(reason, `RPC ${String(method)} failed`);
    }
  };
}

// ---------------------------------------------------------------------------
// Public result shapes (captured against the neurai-regtest-depin node).
// Fields the node may omit are optional; verbose block/transaction shapes
// stay `any` because they vary with verbosity.
// ---------------------------------------------------------------------------

/** getaddressbalance without assets: satoshi totals for the address set. */
export interface IAddressBalance {
  balance: RpcAmount;
  received: RpcAmount;
}

/** getaddressbalance with includeAssets: one entry per asset (XNA included). */
export interface IAssetBalanceEntry {
  assetName: string;
  balance: RpcAmount;
  received: RpcAmount;
}

export interface IUTXO {
  address: string;
  txid: string;
  outputIndex: number;
  script: string;
  satoshis: RawAmount;
  height: number;
  /** "XNA" for plain outputs, the asset name otherwise (observed on the
   *  DePIN-Test node; kept optional for older nodes). */
  assetName?: string;
}

export interface IMempoolEntry {
  address: string;
  assetName?: string;
  txid: string;
  index: number;
  satoshis: RawAmount;
  timestamp: number;
  prevtxid?: string;
  prevout?: number;
}

export interface IAddressDelta {
  satoshis: RawAmount;
  txid: string;
  index: number;
  blockindex: number;
  height: number;
  address: string;
  assetName?: string;
}

export interface IAssetData {
  name: string;
  amount: RpcAmount;
  units: number;
  reissuable: number;
  has_ipfs: number;
  block_height?: number;
  blockhash?: string;
  /** Transaction id encoded as asset data when has_ipfs is set. */
  txid?: string;
  ipfs_hash?: string;
  /** Present for restricted assets. */
  verifier_string?: string;
  [key: string]: unknown;
}

export interface IBlockchainInfo {
  chain: string;
  blocks: number;
  headers: number;
  bestblockhash: string;
  difficulty: number;
  mediantime: number;
  /** NIP-040 marker the node requires for the next block ('rvn' | 'xna').
   *  Absent on nodes that predate the field. */
  asset_marker?: "rvn" | "xna";
  [key: string]: unknown;
}

export interface IPubKeyInfo {
  address: string;
  pubkey: string;
  revealed: boolean | 0 | 1;
  height: number;
  txid: string;
}

export interface ReaderOptions {
  /** RPC endpoint. Default: URL_MAINNET. */
  url?: string;
  /** Basic-auth username. Default: "anonymous". */
  username?: string;
  /** Basic-auth password. Default: "anonymous". */
  password?: string;
}

export interface Reader {
  setURL(newURL: string): void;
  setUsername(newUsername: string): void;
  setPassword(newPassword: string): void;
  setMainnet(): void;
  setTestnet(): void;

  getAddressesByAsset(
    assetName: string,
    onlytotal?: boolean,
    count?: number,
    start?: number
  ): Promise<any>;
  getAddressDeltas(
    address: string | string[],
    assetName?: string
  ): Promise<IAddressDelta[]>;
  getAddressMempool(address: string | string[]): Promise<IMempoolEntry[]>;
  getAddressTxids(
    address: string | string[],
    includeAssets?: boolean
  ): Promise<string[]>;
  getAddressUTXOs(address: string | string[]): Promise<IUTXO[]>;
  getAllAssets(
    prefix?: string,
    includeAllMetaData?: boolean
  ): Promise<string[] | Record<string, unknown>>;
  /** Resolves `null` for an unknown asset — the node does not error. */
  getAsset(name: string): Promise<IAssetData | null>;
  getAssetBalance(address: string | string[]): Promise<IAssetBalanceEntry[]>;
  getAssetBalanceFromMempool(
    assetName: string,
    mempool: IMempoolEntry[]
  ): RpcAmount;
  getBestBlockHash(): Promise<string>;
  getBlockByHash(hash: string, verbosity?: number): Promise<any>;
  getBlockByHeight(height: number, verbosity?: number): Promise<any>;
  getBlockchainInfo(): Promise<IBlockchainInfo>;
  getMempool(): Promise<any>;
  getNeuraiBalance(
    address: string | string[]
  ): Promise<IAddressBalance | Record<string, never>>;
  getPendingBalanceFromAddressMempool(
    address: string | string[],
    assetName?: string
  ): Promise<RpcAmount>;
  getPubKey(address: string): Promise<IPubKeyInfo>;
  getTransaction(id: string): Promise<any>;
  formatBalance(satoshis?: RawAmount | null): string;
  verifyMessage(
    address: string,
    signature: string,
    message: string
  ): Promise<boolean>;
}

function turnIntoStringArray(str: string | string[]): string[] {
  if (typeof str === "string") {
    return [str];
  }
  return str;
}

/**
 * Create an independent Reader bound to its own endpoint and credentials.
 * Instances do not share state: `setURL`/`setUsername`/`setPassword`/
 * `setMainnet`/`setTestnet` only mutate the instance they are called on.
 */
export function createReader(options: ReaderOptions = {}): Reader {
  let url = options.url ?? URL_MAINNET;
  let username = options.username ?? "anonymous";
  let password = options.password ?? "anonymous";

  let rpc = wrapRpc(getRPC(username, password, url));

  /** Build first, then commit state so a rejected value cannot poison the
   * instance while leaving the previous RPC client installed. */
  function setConnection(
    newURL: string,
    newUsername: string,
    newPassword: string
  ): void {
    const newRPC = wrapRpc(getRPC(newUsername, newPassword, newURL));
    url = newURL;
    username = newUsername;
    password = newPassword;
    rpc = newRPC;
  }
  function setURL(newURL: string) {
    setConnection(newURL, username, password);
  }
  function setUsername(newUsername: string) {
    setConnection(url, newUsername, password);
  }
  function setPassword(newPassword: string) {
    setConnection(url, username, newPassword);
  }
  function setMainnet() {
    setURL(URL_MAINNET);
  }
  function setTestnet() {
    setURL(URL_TESTNET);
  }

  /**
   * @param assetName mandatory
   * @param onlytotal optional, when false result is a list of addresses with
   *   balances -- when true the result is a single number: how many addresses
   * @param count (integer, optional, default=5000, MAX=50000) truncates
   *   results to include only the first _count_ assets found
   * @param start (integer, optional, default=0) results skip over the first
   *   _start_ assets found (if negative it skips back from the end)
   */
  function getAddressesByAsset(
    assetName: string,
    onlytotal?: boolean,
    count?: number,
    start?: number
  ): Promise<any> {
    const _onlytotal = onlytotal === undefined ? false : onlytotal;
    let _count = count === undefined ? 5000 : count;
    const _start = start === undefined ? 0 : start;
    if (_count > 50000) {
      _count = 50000;
    }

    return rpc(methods.listaddressesbyasset, [
      assetName,
      _onlytotal,
      _count,
      _start,
    ]);
  }

  /**
   * Per-transaction deltas for the address(es). Without `assetName` it keeps
   * the historic behaviour: empty string = deltas for XNA and every asset.
   * Pass "XNA" or an asset name to filter.
   */
  function getAddressDeltas(
    address: string | string[],
    assetName: string = ""
  ): Promise<IAddressDelta[]> {
    const addresses = turnIntoStringArray(address);
    return rpc(methods.getaddressdeltas, [{ addresses, assetName }]);
  }

  function getAddressMempool(
    address: string | string[]
  ): Promise<IMempoolEntry[]> {
    const addresses = turnIntoStringArray(address);
    const includeAssets = true;
    return rpc(methods.getaddressmempool, [
      { addresses: addresses },
      includeAssets,
    ]);
  }

  /**
   * Transaction ids that touch the address(es). `includeAssets` defaults to
   * false, matching the node: asset transactions are only included when
   * explicitly requested.
   */
  function getAddressTxids(
    address: string | string[],
    includeAssets: boolean = false
  ): Promise<string[]> {
    const addresses = turnIntoStringArray(address);
    return rpc(methods.getaddresstxids, [{ addresses: addresses }, includeAssets]);
  }

  function getAddressUTXOs(address: string | string[]): Promise<IUTXO[]> {
    const addresses = turnIntoStringArray(address);
    return rpc(methods.getaddressutxos, [{ addresses: addresses }]);
  }

  function getAllAssets(
    prefix: string = "*",
    includeAllMetaData: boolean = false
  ): Promise<string[] | Record<string, unknown>> {
    return rpc(methods.listassets, [prefix, includeAllMetaData]);
  }

  function getAssetBalance(
    address: string | string[]
  ): Promise<IAssetBalanceEntry[]> {
    const addresses = turnIntoStringArray(address);
    const includeAssets = true;
    return rpc(methods.getaddressbalance, [
      { addresses: addresses },
      includeAssets,
    ]);
  }

  function getAsset(name: string): Promise<IAssetData | null> {
    return rpc(methods.getassetdata, [name]);
  }

  /**
   * Net pending satoshis for `assetName` in an array of address-mempool
   * entries (spends are negative, so the result is the net change).
   */
  function getAssetBalanceFromMempool(
    assetName: string,
    mempool: IMempoolEntry[]
  ): RpcAmount {
    if (!Array.isArray(mempool) || mempool.length === 0) {
      return 0;
    }
    const total = mempool.reduce((pending, item) => {
      if (item && item.assetName === assetName) {
        return pending + rawInteger(item.satoshis);
      }
      return pending;
    }, 0n);
    return compatibleInteger(total);
  }

  function getBestBlockHash(): Promise<string> {
    return rpc(methods.getbestblockhash, []);
  }

  function getBlockByHash(hash: string, verbosity?: number): Promise<any> {
    const params: Array<string | number> =
      verbosity === undefined ? [hash] : [hash, verbosity];
    return rpc(methods.getblock, params);
  }

  function getBlockByHeight(
    height: number,
    verbosity: number = 3
  ): Promise<any> {
    return rpc(methods.getblockhash, [height]).then((hash: string) => {
      return rpc(methods.getblock, [hash, verbosity]);
    });
  }

  function getBlockchainInfo(): Promise<IBlockchainInfo> {
    return rpc(methods.getblockchaininfo, []);
  }

  function getMempool(): Promise<any> {
    return rpc(methods.getrawmempool, [true]);
  }

  function getNeuraiBalance(
    address: string | string[]
  ): Promise<IAddressBalance | Record<string, never>> {
    const addresses = turnIntoStringArray(address);
    if (!addresses || addresses.length < 1) {
      const emptyObject = {};
      return Promise.resolve(emptyObject);
    }
    const includeAssets = false;
    const params = [{ addresses: addresses }, includeAssets];
    return rpc(methods.getaddressbalance, params);
  }

  /**
   * Net unconfirmed balance change for `assetName` (default "XNA") taken
   * from the address mempool.
   */
  async function getPendingBalanceFromAddressMempool(
    address: string | string[],
    assetName: string = "XNA"
  ): Promise<RpcAmount> {
    const mempool = await getAddressMempool(address);
    return getAssetBalanceFromMempool(assetName, mempool);
  }

  /**
   * Get the public key for an address
   * @param address The Neurai address to query
   * @returns Object with address, pubkey, revealed status, height, and txid
   * - revealed: 1 if pubkey has been revealed on-chain, 0 if not
   * - pubkey: The public key (empty string if not revealed)
   * - height: Block height where pubkey was first revealed (0 if not revealed)
   * - txid: Transaction ID where pubkey was first revealed (empty if not)
   */
  function getPubKey(address: string): Promise<IPubKeyInfo> {
    return rpc(methods.getpubkey, [address]);
  }

  function getTransaction(id: string): Promise<any> {
    const verbose = true;
    return rpc(methods.getrawtransaction, [id, verbose]);
  }

  /** Format a satoshi amount as a display string with 8 decimals. */
  function formatBalance(satoshis?: RawAmount | null): string {
    if (satoshis === undefined || satoshis === null) return "0";
    const raw = rawInteger(satoshis);
    if (raw === 0n) return "0";
    const absolute = raw < 0n ? -raw : raw;
    return `${raw < 0n ? "-" : ""}${absolute / ONE_FULL_COIN}.${(absolute % ONE_FULL_COIN).toString().padStart(8, "0")}`;
  }

  function verifyMessage(
    address: string,
    signature: string,
    message: string
  ): Promise<boolean> {
    const params = [address, signature, message];
    return rpc(methods.verifymessage, params);
  }

  return {
    setURL,
    setUsername,
    setPassword,
    setMainnet,
    setTestnet,

    getAddressesByAsset,
    getAddressDeltas,
    getAddressMempool,
    getAddressTxids,
    getAddressUTXOs,
    getAllAssets,
    getAsset,
    getAssetBalance,
    getAssetBalanceFromMempool,
    getBestBlockHash,
    getBlockByHash,
    getBlockByHeight,
    getBlockchainInfo,
    getMempool,
    getNeuraiBalance,
    getPendingBalanceFromAddressMempool,
    getPubKey,
    getTransaction,
    formatBalance,
    verifyMessage,
  };
}

// Default export: a singleton Reader with the historic defaults (mainnet,
// anonymous credentials), plus the factory and the public URLs — the exact
// surface 0.0.9 consumers already use, extended.
const defaultReader = createReader();

export default {
  ...defaultReader,
  createReader,
  URL_MAINNET,
  URL_TESTNET,
};
