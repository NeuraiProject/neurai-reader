import {getRPC as $hCgyA$getRPC, methods as $hCgyA$methods} from "@ravenrebels/ravencoin-rpc";


const $c3f6c693698dc7cd$var$ONE_FULL_COIN = 1e8;
const $c3f6c693698dc7cd$var$URL_MAINNET = "https://rvn-rpc-mainnet.ting.finance/rpc";
const $c3f6c693698dc7cd$var$URL_TESTNET = "https://rvn-rpc-testnet.ting.finance/rpc";
let $c3f6c693698dc7cd$var$username = "anonymouse";
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
function $c3f6c693698dc7cd$var$turnIntoStringArray(str) {
    if (typeof str === "string") return [
        str
    ];
    return str;
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
function $c3f6c693698dc7cd$var$getAddressDeltas(address) {
    const addresses = $c3f6c693698dc7cd$var$turnIntoStringArray(address);
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).getaddressdeltas, [
        {
            addresses: addresses
        }
    ]);
}
function $c3f6c693698dc7cd$var$getAssetBalance(address) {
    const addresses = $c3f6c693698dc7cd$var$turnIntoStringArray;
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
function $c3f6c693698dc7cd$var$getAllAssets(prefix = "*", includeAllMetaData = false) {
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).listassets, [
        prefix,
        includeAllMetaData
    ]);
}
function $c3f6c693698dc7cd$var$getMempool() {
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).getrawmempool, [
        true
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
function $c3f6c693698dc7cd$var$getRavencoinBalance(addresses) {
    if (!addresses || addresses.length < 1) return {};
    const includeAssets = false;
    const params = [
        {
            addresses: addresses
        },
        includeAssets
    ];
    return $c3f6c693698dc7cd$var$rpc((0, $hCgyA$methods).getaddressbalance, params);
}
var $c3f6c693698dc7cd$export$2e2bcd8739ae039 = {
    getAddressDeltas: $c3f6c693698dc7cd$var$getAddressDeltas,
    getAddressMempool: $c3f6c693698dc7cd$var$getAddressMempool,
    getAllAssets: $c3f6c693698dc7cd$var$getAllAssets,
    getAsset: $c3f6c693698dc7cd$var$getAsset,
    getAssetBalance: $c3f6c693698dc7cd$var$getAssetBalance,
    getMempool: $c3f6c693698dc7cd$var$getMempool,
    getRavencoinBalance: $c3f6c693698dc7cd$var$getRavencoinBalance,
    setUsername: $c3f6c693698dc7cd$var$setUsername,
    setPassword: $c3f6c693698dc7cd$var$setPassword,
    setURL: $c3f6c693698dc7cd$var$setURL,
    verifyMessage: $c3f6c693698dc7cd$var$verifyMessage,
    URL_MAINNET: $c3f6c693698dc7cd$var$URL_MAINNET,
    URL_TESTNET: $c3f6c693698dc7cd$var$URL_TESTNET
};


export {$c3f6c693698dc7cd$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.mjs.map
