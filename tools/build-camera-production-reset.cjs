const fs=require('fs'),a=require('assert/strict'),H=x=>require('crypto').createHash('sha256').update(x).digest('hex'),I=require('./iced-1.21/package/iced_x86.js');
const [src,dst]=process.argv.slice(2),old=fs.readFileSync(src),b=Buffer.from(old);
a(['fd83e1a63bc1059a140557b0e93b4bb0813a85e405301601d8496712d4aa2f68','a9594ca71b52c2a10ff5a2bc548b0f8f041943a3657475aa0875782106c4385a'].includes(H(old)));
const site=0x215914,on=0x215923,off=0x21591b,sec=0x3b0,va=b.readUInt32LE(sec+12),raw=b.readUInt32LE(sec+20),vs=b.readUInt32LE(sec+8),align=(v,a)=>Math.ceil(v/a)*a;
const stub=va+align(vs,16),at=raw+stub-va,patch=Buffer.from('80bfdf010000000f8500000000e900000000','hex');
patch.writeInt32LE(on-(stub+13),9);patch.writeInt32LE(off-(stub+18),14);
a.equal(b.subarray(site-0xc00,site-0xc00+7).toString('hex'),'41807d21009090');
a(stub+patch.length-va<=b.readUInt32LE(sec+16));a(b.subarray(at,at+patch.length).every(x=>x===0));
patch.copy(b,at);b.writeUInt32LE(stub+patch.length-va,sec+8);
b[site-0xc00]=0xe9;b.writeInt32LE(stub-site-5,site-0xc00+1);b.fill(0x90,site-0xc00+5,site-0xc00+7);
const f=new I.Formatter(I.FormatterSyntax.Intel),d=new I.Decoder(64,patch,I.DecoderOptions.None);d.ip=BigInt(stub);
const ops=[];while(d.canDecode){const i=d.decode();a(!i.isInvalid);ops.push([f.format(i),Number(i.nearBranchTarget)]);i.free();}
a.deepEqual(ops.map(x=>x[1]),[0,on,off]);a(ops[0][0].includes('[rdi+1DFh]'));
for(let i=0;i<b.length;i++){if(b[i]!==old[i])a((i>=site-0xc00&&i<site-0xc00+7)||(i>=sec+8&&i<sec+12)||(i>=at&&i<at+patch.length));}
fs.writeFileSync(dst,b,{flag:'wx'});a.equal(H(fs.readFileSync(dst)),H(b));console.log(ops,H(b));