import { getRPC, methods } from "@ravenrebels/ravencoin-rpc";

const ONE_FULL_COIN = 1e8;

const URL_MAINNET = "https://rvn-rpc-mainnet.ting.finance/rpc";
const URL_TESTNET = "https://rvn-rpc-testnet.ting.finance/rpc";

let username = "anonymouse";
let password = "anonymous";
let url = URL_MAINNET;

let rpc = getRPC(username, password, url);

function resetRPC() {
  rpc = getRPC(username, password, url);
  return rpc;
}
function setURL(newURL: string) {
  url = newURL;
  resetRPC();
}
function setUsername(newUsername: string) {
  username = newUsername;
  resetRPC();
}
function setPassword(newPassword: string) {
  password = newPassword;
  resetRPC();
}

/**
  * 
  * @param assetName mandatory
  * @param onlytotal otional, when false result is just a list of addresses with balances -- when true the result is just a single number representing the number of addresses
  * @param count (integer, optional, default=50000, MAX=50000) truncates results to include only the first _count_ assets found
  * @param start (integer, optional, default=0) results skip over the first _start_ assets found (if negative it skips back from the end)
  
  */
function getAddressesByAsset(
  assetName: string,
  onlytotal?: boolean,
  count?: boolean,
  start?: boolean
): Promise<any> {
  const _onlytotal = onlytotal === undefined ? false : onlytotal;
  let _count = count === undefined ? 5000 : count;
  let _start = start === undefined ? 0 : start;
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

function getAddressDeltas(address: string | string[]): Promise<any[]> {
  const addresses = turnIntoStringArray(address);

  return rpc(methods.getaddressdeltas, [{ addresses: addresses }]);
}

function getAddressMempool(address: string | string[]): Promise<any> {
  const addresses = turnIntoStringArray(address); //Support both string and string array

  const includeAssets = true;
  return rpc(methods.getaddressmempool, [
    { addresses: addresses },
    includeAssets,
  ]);
}

function getAllAssets(
  prefix: string = "*",
  includeAllMetaData: boolean = false
): Promise<any> {
  return rpc(methods.listassets, [prefix, includeAllMetaData]);
}

function getAssetBalance(address: string | string[]): Promise<any> {
  const addresses = turnIntoStringArray;
  const includeAssets = true;
  return rpc(methods.getaddressbalance, [
    { addresses: addresses },
    includeAssets,
  ]);
}

function getAsset(name: string): Promise<any> {
  return rpc(methods.getassetdata, [name]);
}

function getMempool() {
  return rpc(methods.getrawmempool, [true]);
}

function getRavencoinBalance(addresses: Array<string>) {
  if (!addresses || addresses.length < 1) {
    return {};
  }
  const includeAssets = false;
  const params = [{ addresses: addresses }, includeAssets];
  return rpc(methods.getaddressbalance, params);
}

function getTransaction(id: string): Promise<any> {
  const verbose = true;
  return rpc(methods.getrawtransaction, [id, verbose]);
}

function verifyMessage(
  address: string,
  signature: string,
  message: string
): Promise<boolean> {
  const params = [address, signature, message];
  return rpc(methods.verifymessage, params);
}

function turnIntoStringArray(str: string | string[]): string[] {
  if (typeof str === "string") {
    return [str];
  }
  return str;
}

export default {
  getAddressesByAsset,
  getAddressDeltas,
  getAddressMempool,
  getAllAssets,
  getAsset,
  getAssetBalance,
  getMempool,
  getRavencoinBalance,
  getTransaction,
  setUsername,
  setPassword,
  setURL,
  verifyMessage,

  URL_MAINNET,
  URL_TESTNET,
};
