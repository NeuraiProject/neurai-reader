var $g5Y9E$neuraiprojectneurairpc = require("@neuraiproject/neurai-rpc");


function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $80bd448eb6ea085b$export$2e2bcd8739ae039);

const $80bd448eb6ea085b$var$ONE_FULL_COIN = 1e8;
const $80bd448eb6ea085b$var$URL_MAINNET = "https://rpc-main.neurai.org/rpc";
const $80bd448eb6ea085b$var$URL_TESTNET = "https://rpc-testnet.neurai.org/rpc";
let $80bd448eb6ea085b$var$username = "anonymous";
let $80bd448eb6ea085b$var$password = "anonymous";
let $80bd448eb6ea085b$var$url = $80bd448eb6ea085b$var$URL_MAINNET;
let $80bd448eb6ea085b$var$rpc = (0, $g5Y9E$neuraiprojectneurairpc.getRPC)($80bd448eb6ea085b$var$username, $80bd448eb6ea085b$var$password, $80bd448eb6ea085b$var$url);
function $80bd448eb6ea085b$var$resetRPC() {
    $80bd448eb6ea085b$var$rpc = (0, $g5Y9E$neuraiprojectneurairpc.getRPC)($80bd448eb6ea085b$var$username, $80bd448eb6ea085b$var$password, $80bd448eb6ea085b$var$url);
    return $80bd448eb6ea085b$var$rpc;
}
function $80bd448eb6ea085b$var$setURL(newURL) {
    $80bd448eb6ea085b$var$url = newURL;
    $80bd448eb6ea085b$var$resetRPC();
}
function $80bd448eb6ea085b$var$setUsername(newUsername) {
    $80bd448eb6ea085b$var$username = newUsername;
    $80bd448eb6ea085b$var$resetRPC();
}
function $80bd448eb6ea085b$var$setPassword(newPassword) {
    $80bd448eb6ea085b$var$password = newPassword;
    $80bd448eb6ea085b$var$resetRPC();
}
/**
  * 
  * @param assetName mandatory
  * @param onlytotal otional, when false result is just a list of addresses with balances -- when true the result is just a single number representing the number of addresses
  * @param count (integer, optional, default=50000, MAX=50000) truncates results to include only the first _count_ assets found
  * @param start (integer, optional, default=0) results skip over the first _start_ assets found (if negative it skips back from the end)
  
  */ function $80bd448eb6ea085b$var$getAddressesByAsset(assetName, onlytotal, count, start) {
    const _onlytotal = onlytotal === undefined ? false : onlytotal;
    let _count = count === undefined ? 5000 : count;
    let _start = start === undefined ? 0 : start;
    if (_count > 50000) _count = 50000;
    return $80bd448eb6ea085b$var$rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).listaddressesbyasset, [
        assetName,
        _onlytotal,
        _count,
        _start
    ]);
}
function $80bd448eb6ea085b$var$getAddressDeltas(address) {
    const addresses = $80bd448eb6ea085b$var$turnIntoStringArray(address);
    const assetName = ""; //Must be empty string, NOT "*"
    const deltas = $80bd448eb6ea085b$var$rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getaddressdeltas, [
        {
            addresses: addresses,
            assetName: assetName
        }
    ]);
    return deltas;
}
function $80bd448eb6ea085b$var$getAddressMempool(address) {
    const addresses = $80bd448eb6ea085b$var$turnIntoStringArray(address); //Support both string and string array
    const includeAssets = true;
    return $80bd448eb6ea085b$var$rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getaddressmempool, [
        {
            addresses: addresses
        },
        includeAssets
    ]);
}
function $80bd448eb6ea085b$var$getAddressUTXOs(address) {
    const addresses = $80bd448eb6ea085b$var$turnIntoStringArray(address); //Support both string and string array
    return $80bd448eb6ea085b$var$rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getaddressutxos, [
        {
            addresses: addresses
        }
    ]);
}
function $80bd448eb6ea085b$var$getAllAssets(prefix = "*", includeAllMetaData = false) {
    return $80bd448eb6ea085b$var$rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).listassets, [
        prefix,
        includeAllMetaData
    ]);
}
function $80bd448eb6ea085b$var$getAssetBalance(address) {
    const addresses = $80bd448eb6ea085b$var$turnIntoStringArray(address);
    const includeAssets = true;
    return $80bd448eb6ea085b$var$rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getaddressbalance, [
        {
            addresses: addresses
        },
        includeAssets
    ]);
}
function $80bd448eb6ea085b$var$getAsset(name) {
    return $80bd448eb6ea085b$var$rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getassetdata, [
        name
    ]);
}
function $80bd448eb6ea085b$var$getBestBlockHash() {
    return $80bd448eb6ea085b$var$rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getbestblockhash, []);
}
function $80bd448eb6ea085b$var$getBlockByHash(hash) {
    return $80bd448eb6ea085b$var$rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getblock, [
        hash
    ]);
}
function $80bd448eb6ea085b$var$getBlockByHeight(height) {
    return $80bd448eb6ea085b$var$rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getblockhash, [
        height
    ]).then((hash)=>{
        const verbosity = 3; //include transactions
        const block = $80bd448eb6ea085b$var$rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getblock, [
            hash,
            verbosity
        ]);
        return block;
    });
}
function $80bd448eb6ea085b$var$getMempool() {
    return $80bd448eb6ea085b$var$rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getrawmempool, [
        true
    ]);
}
function $80bd448eb6ea085b$var$getNeuraiBalance(address) {
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
    return $80bd448eb6ea085b$var$rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getaddressbalance, params);
}
function $80bd448eb6ea085b$var$getTransaction(id) {
    const verbose = true;
    return $80bd448eb6ea085b$var$rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).getrawtransaction, [
        id,
        verbose
    ]);
}
function $80bd448eb6ea085b$var$verifyMessage(address, signature, message) {
    const params = [
        address,
        signature,
        message
    ];
    return $80bd448eb6ea085b$var$rpc((0, $g5Y9E$neuraiprojectneurairpc.methods).verifymessage, params);
}
function $80bd448eb6ea085b$var$turnIntoStringArray(str) {
    if (typeof str === "string") return [
        str
    ];
    return str;
}
var $80bd448eb6ea085b$export$2e2bcd8739ae039 = {
    getAddressesByAsset: $80bd448eb6ea085b$var$getAddressesByAsset,
    getAddressDeltas: $80bd448eb6ea085b$var$getAddressDeltas,
    getAddressMempool: $80bd448eb6ea085b$var$getAddressMempool,
    getAddressUTXOs: $80bd448eb6ea085b$var$getAddressUTXOs,
    getAllAssets: $80bd448eb6ea085b$var$getAllAssets,
    getAsset: $80bd448eb6ea085b$var$getAsset,
    getAssetBalance: $80bd448eb6ea085b$var$getAssetBalance,
    getBestBlockHash: $80bd448eb6ea085b$var$getBestBlockHash,
    getBlockByHash: $80bd448eb6ea085b$var$getBlockByHash,
    getBlockByHeight: $80bd448eb6ea085b$var$getBlockByHeight,
    getMempool: $80bd448eb6ea085b$var$getMempool,
    getNeuraiBalance: $80bd448eb6ea085b$var$getNeuraiBalance,
    getTransaction: $80bd448eb6ea085b$var$getTransaction,
    setUsername: $80bd448eb6ea085b$var$setUsername,
    setPassword: $80bd448eb6ea085b$var$setPassword,
    setURL: $80bd448eb6ea085b$var$setURL,
    verifyMessage: $80bd448eb6ea085b$var$verifyMessage,
    URL_MAINNET: $80bd448eb6ea085b$var$URL_MAINNET,
    URL_TESTNET: $80bd448eb6ea085b$var$URL_TESTNET
};


//# sourceMappingURL=index.cjs.map
