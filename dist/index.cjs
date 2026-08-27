var $g5Y9E$neuraiprojectneurairpc = require("@neuraiproject/neurai-rpc");


function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "URL_MAINNET", () => $80bd448eb6ea085b$export$7704e714695cc7a8);
$parcel$export(module.exports, "URL_TESTNET", () => $80bd448eb6ea085b$export$b6d3241152c7efb);
$parcel$export(module.exports, "createReader", () => $80bd448eb6ea085b$export$3687857846e34983);
$parcel$export(module.exports, "default", () => $80bd448eb6ea085b$export$2e2bcd8739ae039);

const $80bd448eb6ea085b$var$ONE_FULL_COIN = 1e8;
const $80bd448eb6ea085b$export$7704e714695cc7a8 = "https://rpc-main.neurai.org/rpc";
const $80bd448eb6ea085b$export$b6d3241152c7efb = "https://rpc-testnet.neurai.org/rpc";
const $80bd448eb6ea085b$var$NORMALIZED_BRAND = Symbol.for("neurai.reader.normalizedRpcError");
function $80bd448eb6ea085b$var$isNormalizedRpcError(value) {
    return value instanceof Error && value[$80bd448eb6ea085b$var$NORMALIZED_BRAND] === true;
}
function $80bd448eb6ea085b$var$stringifyUnknown(value) {
    if (typeof value === "string") return value;
    try {
        return JSON.stringify(value);
    } catch  {
        return String(value);
    }
}
function $80bd448eb6ea085b$var$describeRpcRejection(reason) {
    if (reason instanceof Error && reason.message) return reason.message;
    if (typeof reason === "string") return reason;
    if (reason && typeof reason === "object") {
        const value = reason;
        if (value.error && typeof value.error === "object") {
            const rpcError = value.error;
            if (rpcError.message) return rpcError.code !== undefined && rpcError.code !== null ? `${String(rpcError.message)} (code ${String(rpcError.code)})` : String(rpcError.message);
            return $80bd448eb6ea085b$var$stringifyUnknown(value.error);
        }
        if (value.error) return $80bd448eb6ea085b$var$stringifyUnknown(value.error);
        if (value.description) return $80bd448eb6ea085b$var$stringifyUnknown(value.description);
        if (value.status || value.statusText) return `HTTP ${String(value.status ?? "")} ${String(value.statusText ?? "")}`.trim();
        return $80bd448eb6ea085b$var$stringifyUnknown(reason);
    }
    return "Unknown RPC error";
}
function $80bd448eb6ea085b$var$extractJsonRpcCode(reason) {
    if (!reason || typeof reason !== "object") return undefined;
    const error = reason.error;
    if (!error || typeof error !== "object") return undefined;
    const code = error.code;
    return typeof code === "number" ? code : undefined;
}
function $80bd448eb6ea085b$var$normalizeRpcError(reason, context) {
    if ($80bd448eb6ea085b$var$isNormalizedRpcError(reason)) return reason;
    const err = new Error(`${context}: ${$80bd448eb6ea085b$var$describeRpcRejection(reason)}`);
    err.cause = reason;
    const code = $80bd448eb6ea085b$var$extractJsonRpcCode(reason);
    if (code !== undefined) err.code = code;
    err[$80bd448eb6ea085b$var$NORMALIZED_BRAND] = true;
    return err;
}
function $80bd448eb6ea085b$var$wrapRpc(rpc) {
    return async function normalizedRpc(method, params) {
        try {
            return await rpc(method, params);
        } catch (reason) {
            throw $80bd448eb6ea085b$var$normalizeRpcError(reason, `RPC ${String(method)} failed`);
        }
    };
}
function $80bd448eb6ea085b$var$turnIntoStringArray(str) {
    if (typeof str === "string") return [
        str
    ];
    return str;
}
function $80bd448eb6ea085b$export$3687857846e34983(options = {}) {
    let url = options.url ?? $80bd448eb6ea085b$export$7704e714695cc7a8;
    let username = options.username ?? "anonymous";
    let password = options.password ?? "anonymous";
    let rpc = $80bd448eb6ea085b$var$wrapRpc((0, $g5Y9E$neuraiprojectneurairpc.getRPC)(username, password, url));
    function resetRPC() {
        rpc = $80bd448eb6ea085b$var$wrapRpc((0, $g5Y9E$neuraiprojectneurairpc.getRPC)(username, password, url));
        return rpc;
    }
    function setURL(newURL) {
        url = newURL;
        resetRPC();
    }
    function setUsername(newUsername) {
        username = newUsername;
        resetRPC();
    }
    function setPassword(newPassword) {
        password = newPassword;
        resetRPC();
    }
    function setMainnet() {
        setURL($80bd448eb6ea085b$export$7704e714695cc7a8);
    }
    function setTestnet() {
        setURL($80bd448eb6ea085b$export$b6d3241152c7efb);
    }
    /**
   * @param assetName mandatory
   * @param onlytotal optional, when false result is a list of addresses with
   *   balances -- when true the result is a single number: how many addresses
   * @param count (integer, optional, default=5000, MAX=50000) truncates
   *   results to include only the first _count_ assets found
   * @param start (integer, optional, default=0) results skip over the first
   *   _start_ assets found (if negative it skips back from the end)
   */ function getAddressesByAsset(assetName, onlytotal, count, start) {
        const _onlytotal = onlytotal === undefined ? false : onlytotal;
        let _count = count === undefined ? 5000 : count;
        const _start = start === undefined ? 0 : start;
        if (_count > 50000) _count = 50000;
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).listaddressesbyasset, [
            assetName,
            _onlytotal,
            _count,
            _start
        ]);
    }
    /**
   * Per-transaction deltas for the address(es). Without `assetName` it keeps
   * the historic behaviour: empty string = deltas for XNA and every asset.
   * Pass "XNA" or an asset name to filter.
   */ function getAddressDeltas(address, assetName = "") {
        const addresses = $80bd448eb6ea085b$var$turnIntoStringArray(address);
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getaddressdeltas, [
            {
                addresses: addresses,
                assetName: assetName
            }
        ]);
    }
    function getAddressMempool(address) {
        const addresses = $80bd448eb6ea085b$var$turnIntoStringArray(address);
        const includeAssets = true;
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getaddressmempool, [
            {
                addresses: addresses
            },
            includeAssets
        ]);
    }
    /**
   * Transaction ids that touch the address(es). `includeAssets` defaults to
   * false, matching the node: asset transactions are only included when
   * explicitly requested.
   */ function getAddressTxids(address, includeAssets = false) {
        const addresses = $80bd448eb6ea085b$var$turnIntoStringArray(address);
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getaddresstxids, [
            {
                addresses: addresses
            },
            includeAssets
        ]);
    }
    function getAddressUTXOs(address) {
        const addresses = $80bd448eb6ea085b$var$turnIntoStringArray(address);
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getaddressutxos, [
            {
                addresses: addresses
            }
        ]);
    }
    function getAllAssets(prefix = "*", includeAllMetaData = false) {
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).listassets, [
            prefix,
            includeAllMetaData
        ]);
    }
    function getAssetBalance(address) {
        const addresses = $80bd448eb6ea085b$var$turnIntoStringArray(address);
        const includeAssets = true;
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getaddressbalance, [
            {
                addresses: addresses
            },
            includeAssets
        ]);
    }
    function getAsset(name) {
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getassetdata, [
            name
        ]);
    }
    /**
   * Net pending satoshis for `assetName` in an array of address-mempool
   * entries (spends are negative, so the result is the net change).
   */ function getAssetBalanceFromMempool(assetName, mempool) {
        if (!Array.isArray(mempool) || mempool.length === 0) return 0;
        return mempool.reduce((pending, item)=>{
            if (item && item.assetName === assetName) return pending + Number(item.satoshis || 0);
            return pending;
        }, 0);
    }
    function getBestBlockHash() {
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getbestblockhash, []);
    }
    function getBlockByHash(hash, verbosity) {
        const params = verbosity === undefined ? [
            hash
        ] : [
            hash,
            verbosity
        ];
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getblock, params);
    }
    function getBlockByHeight(height, verbosity = 3) {
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getblockhash, [
            height
        ]).then((hash)=>{
            return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getblock, [
                hash,
                verbosity
            ]);
        });
    }
    function getBlockchainInfo() {
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getblockchaininfo, []);
    }
    function getMempool() {
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getrawmempool, [
            true
        ]);
    }
    function getNeuraiBalance(address) {
        const addresses = $80bd448eb6ea085b$var$turnIntoStringArray(address);
        if (!addresses || addresses.length < 1) {
            const emptyObject = {};
            return Promise.resolve(emptyObject);
        }
        const includeAssets = false;
        const params = [
            {
                addresses: addresses
            },
            includeAssets
        ];
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getaddressbalance, params);
    }
    /**
   * Net unconfirmed balance change for `assetName` (default "XNA") taken
   * from the address mempool.
   */ async function getPendingBalanceFromAddressMempool(address, assetName = "XNA") {
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
   */ function getPubKey(address) {
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getpubkey, [
            address
        ]);
    }
    function getTransaction(id) {
        const verbose = true;
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getrawtransaction, [
            id,
            verbose
        ]);
    }
    /** Format a satoshi amount as a display string with 8 decimals. */ function formatBalance(satoshis) {
        if (!satoshis) return "0";
        return (satoshis / $80bd448eb6ea085b$var$ONE_FULL_COIN).toFixed(8);
    }
    function verifyMessage(address, signature, message) {
        const params = [
            address,
            signature,
            message
        ];
        return rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).verifymessage, params);
    }
    return {
        setURL: setURL,
        setUsername: setUsername,
        setPassword: setPassword,
        setMainnet: setMainnet,
        setTestnet: setTestnet,
        getAddressesByAsset: getAddressesByAsset,
        getAddressDeltas: getAddressDeltas,
        getAddressMempool: getAddressMempool,
        getAddressTxids: getAddressTxids,
        getAddressUTXOs: getAddressUTXOs,
        getAllAssets: getAllAssets,
        getAsset: getAsset,
        getAssetBalance: getAssetBalance,
        getAssetBalanceFromMempool: getAssetBalanceFromMempool,
        getBestBlockHash: getBestBlockHash,
        getBlockByHash: getBlockByHash,
        getBlockByHeight: getBlockByHeight,
        getBlockchainInfo: getBlockchainInfo,
        getMempool: getMempool,
        getNeuraiBalance: getNeuraiBalance,
        getPendingBalanceFromAddressMempool: getPendingBalanceFromAddressMempool,
        getPubKey: getPubKey,
        getTransaction: getTransaction,
        formatBalance: formatBalance,
        verifyMessage: verifyMessage
    };
}
// Default export: a singleton Reader with the historic defaults (mainnet,
// anonymous credentials), plus the factory and the public URLs — the exact
// surface 0.0.9 consumers already use, extended.
const $80bd448eb6ea085b$var$defaultReader = $80bd448eb6ea085b$export$3687857846e34983();
var $80bd448eb6ea085b$export$2e2bcd8739ae039 = {
    ...$80bd448eb6ea085b$var$defaultReader,
    createReader: $80bd448eb6ea085b$export$3687857846e34983,
    URL_MAINNET: $80bd448eb6ea085b$export$7704e714695cc7a8,
    URL_TESTNET: $80bd448eb6ea085b$export$b6d3241152c7efb
};


//# sourceMappingURL=index.cjs.map
