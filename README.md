# ravencoin-reader
Read information from Ravencoin blockchain



## Install and use

Create an empty JavaScript project
```
mkdir reader
cd reader
npm init -y
npm install github:ravenrebels/ravencoin-reader
```

Now create a file called `index.mjs` the extension .mjs to use ECMA Module (ECMAScript Module) in Node. js applications.

Now run your script
```
node index.mjs
```
Add content to index.mjs
```
import Reader from "@ravenrebels/ravencoin-reader";

Reader.getAsset("FREN#RED").then(console.table);
```

Expected output

![image](https://user-images.githubusercontent.com/9694984/214542343-c842ca90-e0bd-4d25-9983-34d3fbf57ace.png)
