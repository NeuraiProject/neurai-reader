var $5ALsb$neuraiprojectneurairpc = require("@neuraiproject/neurai-rpc");


function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "URL_MAINNET", () => $ac621667b126050d$export$7704e714695cc7a8);
$parcel$export(module.exports, "URL_TESTNET", () => $ac621667b126050d$export$b6d3241152c7efb);
$parcel$export(module.exports, "isReaderRpcError", () => $ac621667b126050d$export$c259d14e3ba8e12d);
$parcel$export(module.exports, "createReader", () => $ac621667b126050d$export$3687857846e34983);
$parcel$export(module.exports, "default", () => $ac621667b126050d$export$2e2bcd8739ae039);

const $ac621667b126050d$var$ONE_FULL_COIN = 1e8;
const $ac621667b126050d$export$7704e714695cc7a8 = "https://rpc-main.neurai.org/rpc";
const $ac621667b126050d$export$b6d3241152c7efb = "https://rpc-testnet.neurai.org/rpc";
const $ac621667b126050d$var$NORMALIZED_BRAND = Symbol.for("neurai.reader.normalizedRpcError");
function $ac621667b126050d$export$c259d14e3ba8e12d(value) {
    return value instanceof Error && value[$ac621667b126050d$var$NORMALIZED_BRAND] === true;
}
function $ac621667b126050d$var$stringifyUnknown(value) {
    if (typeof value === "string") return value;
    try {
        return JSON.stringify(value);
    } catch  {
        return String(value);
    }
}
function $ac621667b126050d$var$describeRpcRejection(reason) {
    if (reason instanceof Error && reason.message) return reason.message;
    if (typeof reason === "string") return reason;
    if (reason && typeof reason === "object") {
        const value = reason;
        if (value.error && typeof value.error === "object") {
            const rpcError = value.error;
            if (rpcError.message) return rpcError.code !== undefined && rpcError.code !== null ? `${String(rpcError.message)} (code ${String(rpcError.code)})` : String(rpcError.message);
            return $ac621667b126050d$var$stringifyUnknown(value.error);
        }
        if (value.error) return $ac621667b126050d$var$stringifyUnknown(value.error);
        if (value.description) return $ac621667b126050d$var$stringifyUnknown(value.description);
        if (value.status || value.statusText) return `HTTP ${String(value.status ?? "")} ${String(value.statusText ?? "")}`.trim();
        return $ac621667b126050d$var$stringifyUnknown(reason);
    }
    return "Unknown RPC error";
}
function $ac621667b126050d$var$extractJsonRpcCode(reason) {
    if (!reason || typeof reason !== "object") return undefined;
    const error = reason.error;
    if (!error || typeof error !== "object") return undefined;
    const code = error.code;
    return typeof code === "number" ? code : undefined;
}
function $ac621667b126050d$var$normalizeRpcError(reason, context) {
    if ($ac621667b126050d$export$c259d14e3ba8e12d(reason)) return reason;
    const err = new Error(`${context}: ${$ac621667b126050d$var$describeRpcRejection(reason)}`);
    err.cause = reason;
    const code = $ac621667b126050d$var$extractJsonRpcCode(reason);
    if (code !== undefined) err.code = code;
    err[$ac621667b126050d$var$NORMALIZED_BRAND] = true;
    return err;
}
function $ac621667b126050d$var$wrapRpc(rpc) {
    return async function normalizedRpc(method, params) {
        try {
            return await rpc(method, params);
        } catch (reason) {
            throw $ac621667b126050d$var$normalizeRpcError(reason, `RPC ${String(method)} failed`);
        }
    };
}
function $ac621667b126050d$var$turnIntoStringArray(str) {
    if (typeof str === "string") return [
        str
    ];
    return str;
}
function $ac621667b126050d$export$3687857846e34983(options = {}) {
    let url = options.url ?? $ac621667b126050d$export$7704e714695cc7a8;
    let username = options.username ?? "anonymous";
    let password = options.password ?? "anonymous";
    let rpc = $ac621667b126050d$var$wrapRpc((0, $5ALsb$neuraiprojectneurairpc.getRPC)(username, password, url));
    /** Build first, then commit state so a rejected value cannot poison the
   * instance while leaving the previous RPC client installed. */ function setConnection(newURL, newUsername, newPassword) {
        const newRPC = $ac621667b126050d$var$wrapRpc((0, $5ALsb$neuraiprojectneurairpc.getRPC)(newUsername, newPassword, newURL));
        url = newURL;
        username = newUsername;
        password = newPassword;
        rpc = newRPC;
    }
    function setURL(newURL) {
        setConnection(newURL, username, password);
    }
    function setUsername(newUsername) {
        setConnection(url, newUsername, password);
    }
    function setPassword(newPassword) {
        setConnection(url, username, newPassword);
    }
    function setMainnet() {
        setURL($ac621667b126050d$export$7704e714695cc7a8);
    }
    function setTestnet() {
        setURL($ac621667b126050d$export$b6d3241152c7efb);
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
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).listaddressesbyasset, [
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
        const addresses = $ac621667b126050d$var$turnIntoStringArray(address);
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).getaddressdeltas, [
            {
                addresses: addresses,
                assetName: assetName
            }
        ]);
    }
    function getAddressMempool(address) {
        const addresses = $ac621667b126050d$var$turnIntoStringArray(address);
        const includeAssets = true;
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).getaddressmempool, [
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
        const addresses = $ac621667b126050d$var$turnIntoStringArray(address);
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).getaddresstxids, [
            {
                addresses: addresses
            },
            includeAssets
        ]);
    }
    function getAddressUTXOs(address) {
        const addresses = $ac621667b126050d$var$turnIntoStringArray(address);
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).getaddressutxos, [
            {
                addresses: addresses
            }
        ]);
    }
    function getAllAssets(prefix = "*", includeAllMetaData = false) {
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).listassets, [
            prefix,
            includeAllMetaData
        ]);
    }
    function getAssetBalance(address) {
        const addresses = $ac621667b126050d$var$turnIntoStringArray(address);
        const includeAssets = true;
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).getaddressbalance, [
            {
                addresses: addresses
            },
            includeAssets
        ]);
    }
    function getAsset(name) {
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).getassetdata, [
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
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).getbestblockhash, []);
    }
    function getBlockByHash(hash, verbosity) {
        const params = verbosity === undefined ? [
            hash
        ] : [
            hash,
            verbosity
        ];
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).getblock, params);
    }
    function getBlockByHeight(height, verbosity = 3) {
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).getblockhash, [
            height
        ]).then((hash)=>{
            return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).getblock, [
                hash,
                verbosity
            ]);
        });
    }
    function getBlockchainInfo() {
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).getblockchaininfo, []);
    }
    function getMempool() {
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).getrawmempool, [
            true
        ]);
    }
    function getNeuraiBalance(address) {
        const addresses = $ac621667b126050d$var$turnIntoStringArray(address);
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
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).getaddressbalance, params);
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
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).getpubkey, [
            address
        ]);
    }
    function getTransaction(id) {
        const verbose = true;
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).getrawtransaction, [
            id,
            verbose
        ]);
    }
    /** Format a satoshi amount as a display string with 8 decimals. */ function formatBalance(satoshis) {
        if (!satoshis) return "0";
        return (satoshis / $ac621667b126050d$var$ONE_FULL_COIN).toFixed(8);
    }
    function verifyMessage(address, signature, message) {
        const params = [
            address,
            signature,
            message
        ];
        return rpc((0, $5ALsb$neuraiprojectneurairpc.methods).verifymessage, params);
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
const $ac621667b126050d$var$defaultReader = $ac621667b126050d$export$3687857846e34983();
var $ac621667b126050d$export$2e2bcd8739ae039 = {
    ...$ac621667b126050d$var$defaultReader,
    createReader: $ac621667b126050d$export$3687857846e34983,
    URL_MAINNET: $ac621667b126050d$export$7704e714695cc7a8,
    URL_TESTNET: $ac621667b126050d$export$b6d3241152c7efb
};


//# sourceMappingURL=index.cjs.map
