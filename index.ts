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

function turnIntoStringArray(str: string | string[]): string[] {
  if (typeof str === "string") {
    return [str];
  }
  return str;
}
function getAddressMempool(address: string | string[]): Promise<any> {
  const addresses = turnIntoStringArray(address); //Support both string and string array

  const includeAssets = true;
  return rpc(methods.getaddressmempool, [{ addresses: addresses }, includeAssets]);
}
function getAddressDeltas(address: string | string[]): Promise<any[]> {
  const addresses = turnIntoStringArray(address);

  return rpc(methods.getaddressdeltas, [{ addresses: addresses }]);
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
function getAllAssets(
  prefix: string = "*",
  includeAllMetaData: boolean = false
): Promise<any> {
  return rpc(methods.listassets, [prefix, includeAllMetaData]);
}
function getMempool() {
  return rpc(methods.getrawmempool, [true]);
}

function verifyMessage(
  address: string,
  signature: string,
  message: string
): Promise<boolean> {
  const params = [address, signature, message];
  return rpc(methods.verifymessage, params);
}
function getRavencoinBalance(addresses: Array<string>) {
  if (!addresses || addresses.length < 1) {
    return {};
  }
  const includeAssets = false;
  const params = [{ addresses: addresses }, includeAssets];
  return rpc(methods.getaddressbalance, params);
}
export default {
  getAddressDeltas,
  getAddressMempool,
  getAllAssets,
  getAsset,
  getAssetBalance,
  getMempool,
  getRavencoinBalance,

  setUsername,
  setPassword,
  setURL,
  verifyMessage,

  URL_MAINNET,
  URL_TESTNET,
};
