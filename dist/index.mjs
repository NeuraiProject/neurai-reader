import {getRPC as $hCgyA$getRPC, methods as $hCgyA$methods} from "@neuraiproject/neurai-rpc";


const $c3f6c693698dc7cd$var$ONE_FULL_COIN = 1e8;
const $c3f6c693698dc7cd$var$URL_MAINNET = "https://rpc-main.neurai.org/rpc";
const $c3f6c693698dc7cd$var$URL_TESTNET = "https://rpc-testnet.neurai.org/rpc";
let $c3f6c693698dc7cd$var$username = "anonymous";
let $c3f6c693698dc7cd$var$password = "anonymous";
let $c3f6c693698dc7cd$var$url = $c3f6c693698dc7cd$var$URL_MAINNET;
let $c3f6c693698dc7cd$var$rpc = (0, $hCgyA$getRPC)($c3f6c693698dc7cd$var$username, $c3f6c693698dc7cd$var$password, $c3f6c693698dc7cd$var$url);
function $c3f6c693698dc7cd$var$resetRPC() {
    $c3f6c693698dc7cd$var$rpc = (0, $hCgyA$getRPC)($c3f6c693698dc7cd$var$username, $c3f6c693698dc7cd$var$password, $c3f6c693698dc7cd$var$url);
    return $c3f6c693698dc7cd$var$rpc;
}
function $c3f6c693698dc7cd$var$setURL(newURL) {
    $c3f6c693698dc7cd$var$url = newURL;
    $c3f6c693698dc7cd$var$resetRPC();
}
function $c3f6c693698dc7cd$var$setUsername(newUsername) {
    $c3f6c693698dc7cd$var$username = newUsername;
    $c3f6c693698dc7cd$var$resetRPC();
}
function $c3f6c693698dc7cd$var$setPassword(newPassword) {
    $c3f6c693698dc7cd$var$password = newPassword;
    $c3f6c693698dc7cd$var$resetRPC();
}
/**
  * 
  * @param assetName mandatory
  * @param onlytotal otional, when false result is just a list of addresses with balances -- when true the result is just a single number representing the number of addresses
  * @param count (integer, optional, default=50000, MAX=50000) truncates results to include only the first _count_ assets found
  * @param start (integer, optional, default=0) results skip over the first _start_ assets found (if negative it skips back from the end)
  
  */ function $c3f6c693698dc7cd$var$getAddressesByAsset(assetName, onlytotal, count, start) {
    const _onlytotal = onlytotal === undefined ? false : onlytotal;
    let _count = count === undefined ? 5000 : count;
    let _start = start === undefined ? 0 : start;
    if (_count > 50000) _count = 50000;
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).listaddressesbyasset, [
        assetName,
        _onlytotal,
        _count,
        _start
    ]);
}
function $c3f6c693698dc7cd$var$getAddressDeltas(address) {
    const addresses = $c3f6c693698dc7cd$var$turnIntoStringArray(address);
    const assetName = ""; //Must be empty string, NOT "*"
    const deltas = $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).getaddressdeltas, [
        {
            addresses: addresses,
            assetName: assetName
        }
    ]);
    return deltas;
}
function $c3f6c693698dc7cd$var$getAddressMempool(address) {
    const addresses = $c3f6c693698dc7cd$var$turnIntoStringArray(address); //Support both string and string array
    const includeAssets = true;
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).getaddressmempool, [
        {
            addresses: addresses
        },
        includeAssets
    ]);
}
function $c3f6c693698dc7cd$var$getAddressUTXOs(address) {
    const addresses = $c3f6c693698dc7cd$var$turnIntoStringArray(address); //Support both string and string array
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).getaddressutxos, [
        {
            addresses: addresses
        }
    ]);
}
function $c3f6c693698dc7cd$var$getAllAssets(prefix = "*", includeAllMetaData = false) {
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).listassets, [
        prefix,
        includeAllMetaData
    ]);
}
function $c3f6c693698dc7cd$var$getAssetBalance(address) {
    const addresses = $c3f6c693698dc7cd$var$turnIntoStringArray(address);
    const includeAssets = true;
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).getaddressbalance, [
        {
            addresses: addresses
        },
        includeAssets
    ]);
}
function $c3f6c693698dc7cd$var$getAsset(name) {
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).getassetdata, [
        name
    ]);
}
function $c3f6c693698dc7cd$var$getBestBlockHash() {
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).getbestblockhash, []);
}
function $c3f6c693698dc7cd$var$getBlockByHash(hash) {
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).getblock, [
        hash
    ]);
}
function $c3f6c693698dc7cd$var$getBlockByHeight(height) {
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).getblockhash, [
        height
    ]).then((hash)=>{
        const verbosity = 3; //include transactions
        const block = $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).getblock, [
            hash,
            verbosity
        ]);
        return block;
    });
}
function $c3f6c693698dc7cd$var$getMempool() {
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).getrawmempool, [
        true
    ]);
}
function $c3f6c693698dc7cd$var$getNeuraiBalance(address) {
    const addresses = $c3f6c693698dc7cd$var$turnIntoStringArray(address);
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
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).getaddressbalance, params);
}
/**
 * Get the public key for an address
 * @param address The Neurai address to query
 * @returns Object with address, pubkey, revealed status, height, and txid
 * - revealed: 1 if pubkey has been revealed on-chain, 0 if not
 * - pubkey: The public key (empty string if not revealed)
 * - height: Block height where pubkey was first revealed (0 if not revealed)
 * - txid: Transaction ID where pubkey was first revealed (empty string if not revealed)
 */ function $c3f6c693698dc7cd$var$getPubKey(address) {
    return $c3f6c693698dc7cd$var$rpc("getpubkey", [
        address
    ]);
}
function $c3f6c693698dc7cd$var$getTransaction(id) {
    const verbose = true;
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).getrawtransaction, [
        id,
        verbose
    ]);
}
function $c3f6c693698dc7cd$var$verifyMessage(address, signature, message) {
    const params = [
        address,
        signature,
        message
    ];
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).verifymessage, params);
}
function $c3f6c693698dc7cd$var$turnIntoStringArray(str) {
    if (typeof str === "string") return [
        str
    ];
    return str;
}
var $c3f6c693698dc7cd$export$2e2bcd8739ae039 = {
    getAddressesByAsset: $c3f6c693698dc7cd$var$getAddressesByAsset,
    getAddressDeltas: $c3f6c693698dc7cd$var$getAddressDeltas,
    getAddressMempool: $c3f6c693698dc7cd$var$getAddressMempool,
    getAddressUTXOs: $c3f6c693698dc7cd$var$getAddressUTXOs,
    getAllAssets: $c3f6c693698dc7cd$var$getAllAssets,
    getAsset: $c3f6c693698dc7cd$var$getAsset,
    getAssetBalance: $c3f6c693698dc7cd$var$getAssetBalance,
    getBestBlockHash: $c3f6c693698dc7cd$var$getBestBlockHash,
    getBlockByHash: $c3f6c693698dc7cd$var$getBlockByHash,
    getBlockByHeight: $c3f6c693698dc7cd$var$getBlockByHeight,
    getMempool: $c3f6c693698dc7cd$var$getMempool,
    getNeuraiBalance: $c3f6c693698dc7cd$var$getNeuraiBalance,
    getPubKey: $c3f6c693698dc7cd$var$getPubKey,
    getTransaction: $c3f6c693698dc7cd$var$getTransaction,
    setUsername: $c3f6c693698dc7cd$var$setUsername,
    setPassword: $c3f6c693698dc7cd$var$setPassword,
    setURL: $c3f6c693698dc7cd$var$setURL,
    verifyMessage: $c3f6c693698dc7cd$var$verifyMessage,
    URL_MAINNET: $c3f6c693698dc7cd$var$URL_MAINNET,
    URL_TESTNET: $c3f6c693698dc7cd$var$URL_TESTNET
};


export {$c3f6c693698dc7cd$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.mjs.map
