# ravencoin-reader
![image](https://user-images.githubusercontent.com/9694984/214588738-2d4f4522-44ec-44dd-9962-3bd4534bab4d.png)

Read information from Ravencoin blockchain



## Install and use

Create an empty JavaScript project
```
mkdir reader
cd reader
npm init -y
npm install github:ravenrebels/ravencoin-reader
```

Now create a file called `index.mjs` the extension .mjs tells Node.js to support ECMA Module (ECMAScript Module).

Add content to index.mjs
```
import Reader from "@ravenrebels/ravencoin-reader";

Reader.getAsset("FREN#RED").then(console.table);
```


Now run your script
```
node index.mjs
```

Expected output

![image](https://user-images.githubusercontent.com/9694984/214542343-c842ca90-e0bd-4d25-9983-34d3fbf57ace.png)

# API (more are added every day)
```
declare function getAddressMempool(address: string | string[]): Promise<any>;
declare function getAddressDeltas(address: string | string[]): Promise<any[]>;
declare function getAssetBalance(address: string | string[]): Promise<any>;
declare function getAsset(name: string): Promise<any>;
declare function getAllAssets(prefix?: string, includeAllMetaData?: boolean): Promise<any>;
declare function getMempool(): Promise<any>;
declare function verifyMessage(address: string, signature: string, message: string): Promise<boolean>;
declare function getTransaction(id: string): Promise<any>;
declare function getRavencoinBalance(addresses: Array<string>): {};

declare function setURL(newURL: string): void;
declare function setUsername(newUsername: string): void;
declare function setPassword(newPassword: string): void;

```

