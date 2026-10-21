import {readFile,writeFile,rename} from 'node:fs/promises';
const snapshot=JSON.parse(await readFile(new URL('../data/snapshot.json',import.meta.url),'utf8'));
if(!snapshot.asOf||!Array.isArray(snapshot.auctions)||!Array.isArray(snapshot.schedule)||!Array.isArray(snapshot.upcoming))throw new Error('Incomplete snapshot');
const target=new URL('../public/data.js',import.meta.url);
const tmp=new URL('../public/data.js.tmp',import.meta.url);
await writeFile(tmp,'// Official-source snapshot. asOf records the data timestamp; this is not a live feed.\nconst seed='+JSON.stringify(snapshot)+';\n');
await rename(tmp,target);
console.log(`Snapshot synchronized: ${snapshot.auctions.length} auctions, as of ${snapshot.asOf}`);
