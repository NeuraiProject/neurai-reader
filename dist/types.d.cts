export const URL_MAINNET = "https://rpc-main.neurai.org/rpc";
export const URL_TESTNET = "https://rpc-testnet.neurai.org/rpc";
/** Normalized failure returned by every RPC-backed Reader method. */
export interface ReaderRpcError extends Error {
    cause: unknown;
    code?: number;
}
/** Type guard for errors produced by the Reader RPC transport. */
export function isReaderRpcError(value: unknown): value is ReaderRpcError;
/** getaddressbalance without assets: satoshi totals for the address set. */
export interface IAddressBalance {
    balance: number;
    received: number;
}
/** getaddressbalance with includeAssets: one entry per asset (XNA included). */
export interface IAssetBalanceEntry {
    assetName: string;
    balance: number;
    received: number;
}
export interface IUTXO {
    address: string;
    txid: string;
    outputIndex: number;
    script: string;
    satoshis: number;
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
    satoshis: number;
    timestamp: number;
    prevtxid?: string;
    prevout?: number;
}
export interface IAddressDelta {
    satoshis: number;
    txid: string;
    index: number;
    blockindex: number;
    height: number;
    address: string;
    assetName?: string;
}
export interface IAssetData {
    name: string;
    amount: number;
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
    revealed: number;
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
    getAddressesByAsset(assetName: string, onlytotal?: boolean, count?: number, start?: number): Promise<any>;
    getAddressDeltas(address: string | string[], assetName?: string): Promise<IAddressDelta[]>;
    getAddressMempool(address: string | string[]): Promise<IMempoolEntry[]>;
    getAddressTxids(address: string | string[], includeAssets?: boolean): Promise<string[]>;
    getAddressUTXOs(address: string | string[]): Promise<IUTXO[]>;
    getAllAssets(prefix?: string, includeAllMetaData?: boolean): Promise<string[] | Record<string, unknown>>;
    /** Resolves `null` for an unknown asset — the node does not error. */
    getAsset(name: string): Promise<IAssetData | null>;
    getAssetBalance(address: string | string[]): Promise<IAssetBalanceEntry[]>;
    getAssetBalanceFromMempool(assetName: string, mempool: IMempoolEntry[]): number;
    getBestBlockHash(): Promise<string>;
    getBlockByHash(hash: string, verbosity?: number): Promise<any>;
    getBlockByHeight(height: number, verbosity?: number): Promise<any>;
    getBlockchainInfo(): Promise<IBlockchainInfo>;
    getMempool(): Promise<any>;
    getNeuraiBalance(address: string | string[]): Promise<IAddressBalance | Record<string, never>>;
    getPendingBalanceFromAddressMempool(address: string | string[], assetName?: string): Promise<number>;
    getPubKey(address: string): Promise<IPubKeyInfo>;
    getTransaction(id: string): Promise<any>;
    formatBalance(satoshis: number): string;
    verifyMessage(address: string, signature: string, message: string): Promise<boolean>;
}
/**
 * Create an independent Reader bound to its own endpoint and credentials.
 * Instances do not share state: `setURL`/`setUsername`/`setPassword`/
 * `setMainnet`/`setTestnet` only mutate the instance they are called on.
 */
export function createReader(options?: ReaderOptions): Reader;
declare const _default: {
    createReader: typeof createReader;
    URL_MAINNET: string;
    URL_TESTNET: string;
    setURL(newURL: string): void;
    setUsername(newUsername: string): void;
    setPassword(newPassword: string): void;
    setMainnet(): void;
    setTestnet(): void;
    getAddressesByAsset(assetName: string, onlytotal?: boolean, count?: number, start?: number): Promise<any>;
    getAddressDeltas(address: string | string[], assetName?: string): Promise<IAddressDelta[]>;
    getAddressMempool(address: string | string[]): Promise<IMempoolEntry[]>;
    getAddressTxids(address: string | string[], includeAssets?: boolean): Promise<string[]>;
    getAddressUTXOs(address: string | string[]): Promise<IUTXO[]>;
    getAllAssets(prefix?: string, includeAllMetaData?: boolean): Promise<string[] | Record<string, unknown>>;
    /** Resolves `null` for an unknown asset — the node does not error. */
    getAsset(name: string): Promise<IAssetData | null>;
    getAssetBalance(address: string | string[]): Promise<IAssetBalanceEntry[]>;
    getAssetBalanceFromMempool(assetName: string, mempool: IMempoolEntry[]): number;
    getBestBlockHash(): Promise<string>;
    getBlockByHash(hash: string, verbosity?: number): Promise<any>;
    getBlockByHeight(height: number, verbosity?: number): Promise<any>;
    getBlockchainInfo(): Promise<IBlockchainInfo>;
    getMempool(): Promise<any>;
    getNeuraiBalance(address: string | string[]): Promise<IAddressBalance | Record<string, never>>;
    getPendingBalanceFromAddressMempool(address: string | string[], assetName?: string): Promise<number>;
    getPubKey(address: string): Promise<IPubKeyInfo>;
    getTransaction(id: string): Promise<any>;
    formatBalance(satoshis: number): string;
    verifyMessage(address: string, signature: string, message: string): Promise<boolean>;
};
export default _default;
