import assert from 'node:assert/strict';
import {readFile,readdir,access} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url));
const publicRoot=join(root,'public');
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]))).flat();}
const all=await files(publicRoot);
for(const file of all.filter(f=>/\.(ttf|otf)$/.test(f))){
  const font=await readFile(file);assert(font.length>=12,`Truncated font ${file}`);
  const count=font.readUInt16BE(4);assert(font.length>=12+16*count,`Truncated font directory ${file}`);
  for(let i=0;i<count;i++){const offset=12+16*i;assert(font.readUInt32BE(offset+8)+font.readUInt32BE(offset+12)<=font.length,`Truncated font table ${file}`);}
}
for(const file of all.filter(f=>f.endsWith('.js')))execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
for(const file of all.filter(f=>/\.(html|css|js)$/.test(f)&&!f.includes('.min.js'))){
  const text=await readFile(file,'utf8');
  const refs=[...text.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m=>m[1]);
  refs.push(...[...text.matchAll(/["'`(]((?:\.\/?|\/)?assets\/[^\s"'`)<>;]+)/g)].map(m=>m[1]));
  if(file.endsWith('.css'))refs.push(...[...text.matchAll(/url\(\s*["']?([^\s"')]+)/g)].map(m=>m[1]));
  for(const ref of refs){
    if(/^(https?:|data:|blob:|#)/.test(ref)||ref.includes('${'))continue;
    const path=ref.split(/[?#]/)[0];
    if(!path)continue;
    await access(resolve(path.startsWith('/')?publicRoot:dirname(file),path.replace(/^\//,''))).catch(()=>{throw new Error(`Missing resource ${ref} in ${file}`)});
  }
  assert(!text.includes('__CF$cv$params'),'Hosting challenge must not be copied');
}
const dataJs=await readFile(join(publicRoot,'data.js'),'utf8');
const match=dataJs.match(/const seed\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
assert(match,'Missing seed data');
const seed=JSON.parse(match[1]);
const snapshot=JSON.parse(await readFile(join(root,'data/snapshot.json'),'utf8'));
assert.deepEqual(seed,snapshot,'Run npm run sync-data after editing snapshot.json');
for(const term of [2,3,5,7,10,20,30])assert.equal(seed.auctions.filter(a=>a.term===term).length,13,`Expected thirteen ${term}-year results`);
const keys=new Set();
for(const a of seed.auctions){
  const key=`${a.term}|${a.date}|${a.cusip}`;assert(!keys.has(key),'Duplicate auction');keys.add(key);
  for(const k of ['amount','btc','indirect','dealer','direct','highYield'])assert(Number.isFinite(a[k]),`Invalid ${k}`);
  assert(a.amount>0&&a.btc>0,'Invalid auction amount or bid-to-cover');
  assert(Math.abs(a.indirect+a.dealer+a.direct-100)<1e-6,'Invalid allocation total');
}
const index=await readFile(join(publicRoot,'index.html'),'utf8');
const calendar=await readFile(join(publicRoot,'calendar.html'),'utf8');
const app=await readFile(join(publicRoot,'app.js'),'utf8');
assert((index+app).includes('calendar.html'),'Missing calendar navigation');
assert(calendar.includes('calendar-page'),'Calendar page flag missing');
await access(join(root,'docs/美债拍卖雷达需求文档.docx'));
console.log(`Checks passed: ${all.length} public files, ${seed.auctions.length} auctions, seven tenors, calendar and documentation.`);
