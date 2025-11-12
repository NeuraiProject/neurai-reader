declare function setURL(newURL: string): void;
declare function setUsername(newUsername: string): void;
declare function setPassword(newPassword: string): void;
/**
  *
  * @param assetName mandatory
  * @param onlytotal otional, when false result is just a list of addresses with balances -- when true the result is just a single number representing the number of addresses
  * @param count (integer, optional, default=50000, MAX=50000) truncates results to include only the first _count_ assets found
  * @param start (integer, optional, default=0) results skip over the first _start_ assets found (if negative it skips back from the end)
  
  */
declare function getAddressesByAsset(assetName: string, onlytotal?: boolean, count?: number, start?: boolean): Promise<any>;
declare function getAddressDeltas(address: string | string[]): Promise<any[]>;
declare function getAddressMempool(address: string | string[]): Promise<any>;
declare function getAddressUTXOs(address: string | string[]): Promise<any>;
declare function getAllAssets(prefix?: string, includeAllMetaData?: boolean): Promise<any>;
declare function getAssetBalance(address: string | string[]): Promise<any>;
declare function getAsset(name: string): Promise<any>;
declare function getBestBlockHash(): Promise<string>;
declare function getBlockByHash(hash: string): Promise<any>;
declare function getBlockByHeight(height: number): Promise<any>;
declare function getMempool(): Promise<any>;
declare function getNeuraiBalance(address: string | string[]): Promise<any>;
/**
 * Get the public key for an address
 * @param address The Neurai address to query
 * @returns Object with address, pubkey, revealed status, height, and txid
 * - revealed: 1 if pubkey has been revealed on-chain, 0 if not
 * - pubkey: The public key (empty string if not revealed)
 * - height: Block height where pubkey was first revealed (0 if not revealed)
 * - txid: Transaction ID where pubkey was first revealed (empty string if not revealed)
 */
declare function getPubKey(address: string): Promise<{
    address: string;
    pubkey: string;
    revealed: number;
    height: number;
    txid: string;
}>;
declare function getTransaction(id: string): Promise<any>;
declare function verifyMessage(address: string, signature: string, message: string): Promise<boolean>;
declare const _default: {
    getAddressesByAsset: typeof getAddressesByAsset;
    getAddressDeltas: typeof getAddressDeltas;
    getAddressMempool: typeof getAddressMempool;
    getAddressUTXOs: typeof getAddressUTXOs;
    getAllAssets: typeof getAllAssets;
    getAsset: typeof getAsset;
    getAssetBalance: typeof getAssetBalance;
    getBestBlockHash: typeof getBestBlockHash;
    getBlockByHash: typeof getBlockByHash;
    getBlockByHeight: typeof getBlockByHeight;
    getMempool: typeof getMempool;
    getNeuraiBalance: typeof getNeuraiBalance;
    getPubKey: typeof getPubKey;
    getTransaction: typeof getTransaction;
    setUsername: typeof setUsername;
    setPassword: typeof setPassword;
    setURL: typeof setURL;
    verifyMessage: typeof verifyMessage;
    URL_MAINNET: string;
    URL_TESTNET: string;
};
export default _default;

//# sourceMappingURL=types.d.ts.map
