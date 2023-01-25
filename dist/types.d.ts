declare function setURL(newURL: string): void;
declare function setUsername(newUsername: string): void;
declare function setPassword(newPassword: string): void;
declare function getAddressMempool(address: string | string[]): Promise<any>;
declare function getAddressDeltas(address: string | string[]): Promise<any[]>;
declare function getAssetBalance(address: string | string[]): Promise<any>;
declare function getAsset(name: string): Promise<any>;
declare function getAllAssets(prefix?: string, includeAllMetaData?: boolean): Promise<any>;
declare function getMempool(): Promise<any>;
declare function verifyMessage(address: string, signature: string, message: string): Promise<boolean>;
declare function getRavencoinBalance(addresses: Array<string>): {};
declare const _default: {
    getAddressDeltas: typeof getAddressDeltas;
    getAddressMempool: typeof getAddressMempool;
    getAllAssets: typeof getAllAssets;
    getAsset: typeof getAsset;
    getAssetBalance: typeof getAssetBalance;
    getMempool: typeof getMempool;
    getRavencoinBalance: typeof getRavencoinBalance;
    setUsername: typeof setUsername;
    setPassword: typeof setPassword;
    setURL: typeof setURL;
    verifyMessage: typeof verifyMessage;
    URL_MAINNET: string;
    URL_TESTNET: string;
};
export default _default;

//# sourceMappingURL=types.d.ts.map
