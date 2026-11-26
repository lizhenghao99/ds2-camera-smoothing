
const fs=require('node:fs'),p=require('node:path'),{createHash}=require('node:crypto'),{inflateRawSync,crc32}=require('node:zlib'),a=require('node:assert/strict');
const [manifestSrc,game,out]=process.argv.slice(2);
const sha=b=>createHash('sha256').update(b).digest('hex');
const rows=JSON.parse(fs.readFileSync(manifestSrc,'utf8').match(/^\$manifest=ConvertFrom-Json '(.*)'$/m)[1]);
function enc(x){const r=[];for(;;){const low=x%128;x=Math.floor(x/128);if(!x)return Buffer.from([...r,128+low]);r.push(low);x--;}}
function u32(x){const b=Buffer.alloc(4);b.writeUInt32LE(x);return b;}
function apply(source,patch){
 a.equal(patch.toString('ascii',0,4),'BPS1'); a.equal(crc32(patch.subarray(0,-4)),patch.readUInt32LE(patch.length-4));
 a.equal(crc32(source),patch.readUInt32LE(patch.length-12));
 let i=4,from=0,at=0;
 function next(){let v=0,s=1;for(;;){const x=patch[i++];v+=(x&127)*s;if(x&128)return v;s*=128;v+=s;}}
 a.equal(next(),source.length);const result=Buffer.alloc(next());const metadata=next();i+=metadata;
 while(i<patch.length-12){const action=next(),n=Math.floor(action/4)+1;switch(action%4){case 0:source.copy(result,at,at,at+n);break;case 1:patch.copy(result,at,i,i+n);i+=n;break;case 2:{let d=next();from+=(d%2?-1:1)*Math.floor(d/2);a(from>=0&&from+n<=source.length);source.copy(result,at,from,from+n);from+=n;break;}default:throw Error('unexpected op');}at+=n;}
 a.equal(i,patch.length-12);a.equal(at,result.length);a.equal(crc32(result),patch.readUInt32LE(patch.length-8));return result;
}
fs.mkdirSync(out,{recursive:true});
for(const r of rows){
 const base=fs.readFileSync(p.join(game,'.ds2-camera-smoothing-stock-17701647',r.file)), target=fs.readFileSync(p.join(game,r.file));
 a.equal(sha(base),r.base);a.equal(sha(target),r.result);const d=inflateRawSync(Buffer.from(r.data,'base64'));
 const parts=[Buffer.from('BPS1'),enc(base.length),enc(target.length),enc(0)];let i=0,pos=0,previous=0;
 while(d[i]){const kind=d[i++],n=d.readUInt32LE(i);i+=4;a(n>0);
 if(kind===1){const off=d.readUInt32LE(i);i+=4;if(off===pos)parts.push(enc((n-1)*4));else {const delta=off-previous;parts.push(enc((n-1)*4+2),enc(Math.abs(delta)*2+(delta<0?1:0)));previous=off+n;}}
 else if(kind===2){parts.push(enc((n-1)*4+1),d.subarray(i,i+n));i+=n;}
 else if(kind===3){parts.push(enc((n-1)*4+1),Buffer.alloc(n));}else throw Error('unknown delta command');pos+=n;}
 a.equal(i+1,d.length);a.equal(pos,target.length);parts.push(u32(crc32(base)),u32(crc32(target)));const body=Buffer.concat(parts),patch=Buffer.concat([body,u32(crc32(body))]);const reconstructed=apply(base,patch);
 a.equal(sha(reconstructed),r.result);a.throws(()=>apply(target,patch));
 fs.writeFileSync(p.join(out,p.basename(r.file)+'.bps'),patch);
 console.log(r.file,patch.length,'bytes; reconstructed SHA-256',r.result,'; wrong base rejected');
}
