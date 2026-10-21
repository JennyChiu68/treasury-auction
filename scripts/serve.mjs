import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../public/',import.meta.url));
const port=Number(process.env.PORT||4173);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid PORT');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2','.ico':'image/x-icon'};

createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'}).end();return;}
    let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(path==='/')path='/index.html';
    if(path==='/calendar'||path==='/calendar/')path='/calendar.html';
    const file=resolve(root,'.'+path);
    if(!file.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403).end('Forbidden');return;}
    if(!(await stat(file)).isFile()){res.writeHead(404).end('Not found');return;}
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Content-Length':data.length,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:data);
  }catch(error){res.writeHead(error.code==='ENOENT'?404:400).end(error.code==='ENOENT'?'Not found':'Bad request');}
}).listen(port,'127.0.0.1',()=>console.log(`Treasury auction radar: http://127.0.0.1:${port}`));
