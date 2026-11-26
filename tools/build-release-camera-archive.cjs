'use strict';
// DS2 Steam beta 17701647: apply the authored camera descriptor changes to a local stock archive.
// The numbers below are object IDs and the exact IEEE-754 tags consumed by the camera code.
const fs=require('node:fs'), assert=require('node:assert/strict'), crypto=require('node:crypto');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'), u=(b,o)=>b.readUInt32LE(o);
const keyword='LookatHeightAdjustSmoothTime';
const plans={
 3121:[[25,0x3e4cccd1,true],[36,0x3e4cccd1],[122,0x3e4cccd1],[135,0x3e4cccd1],[172,0x3e4cccd1],[185,0x3e4cccd1],[414,0x3e4ccccf,true]],
 5830:[[41,0x3e4cccd7,true],[59,0x3e4cccd7],[183,0x3e4cccd3],[192,0x3e4cccd3],[197,0x3e4cccd3],[206,0x3e4cccd3],[219,0x3e4cccd3],[300,0x3e4cccd7],[304,0x3e4cccd7],[307,0x3e4cccd7]]
};
function parse(b){
 let p=16;const defs=[],refs=[],objects=new Map(),names=[];
 const get=()=>{assert(p<b.length);return b[p++]},get32=()=>{const x=u(b,p);p+=4;return x};
 function name(){const pos=p,t=get();if(t===0){const at=p,n=get32();assert(n<names.length);refs.push({at,n});return names[n]}assert.equal(t,1);p+=8;const l=b.readUInt16LE(p);p+=2;const s=b.toString('latin1',p,p+l);p+=l;defs.push({pos,s});names.push(s);return s}
 function klass(){const v=get();assert(v===1||v===4);if(v===4)get32();return name()}
 function fields(kind,id){const at=p,count=get32(),fields=[];for(let j=0;j<count;j++){fields.push(name());val()}if(id!==undefined){assert(!objects.has(id));objects.set(id,{kind,at,count,pos:p,fields})}}
 function val(){switch(get()){case 2:case 3:get32();break;case 4:get();break;case 7:{const id=get32(),kind=klass();fields(kind,id);break}case 9:{const n=get32();assert.equal(get(),0);for(let j=0;j<n;j++)val();break}case 15:name();break;case 252:p+=12;break;case 254:break;default:throw Error('Unsupported archive field at '+p)}}
 assert.equal(b.subarray(0,4).toString('hex'),'424f44fd');klass();fields();assert.equal(p,b.length);assert.equal(names.length,u(b,8));return {defs,refs,objects};
}
function edit(input, plan){
 const b=Buffer.from(input),p=parse(b);assert(!p.defs.some(x=>x.s===keyword));
 const ins=plan.map(([id,value,define])=>{const obj=p.objects.get(id);assert(obj&&obj.kind.endsWith('camerastate')&&!obj.fields.includes(keyword));return {id,value,define,obj}}).sort((a,z)=>a.obj.pos-z.obj.pos);
 let serial=0,latest=-1;const defs=ins.filter(x=>x.define);assert(ins[0].define);
 for(const f of defs){const n=p.defs.filter(z=>z.pos<f.obj.pos).length;f.ordinal=n+serial++;f.originalOrdinal=n}
 for(const r of p.refs){const shift=defs.filter(f=>f.obj.pos<=r.at&&f.originalOrdinal<=r.n).length;if(shift)b.writeUInt32LE(r.n+shift,r.at)}
 b.writeUInt32LE(p.defs.length+defs.length,8);
 let last=0;const parts=[];
 for(const f of ins){
  b.writeUInt32LE(f.obj.count+1,f.obj.at);
  parts.push(b.subarray(last,f.obj.pos));last=f.obj.pos;
  if(f.define){latest=f.ordinal;parts.push(Buffer.from('01e84e34fd8a8230021c00','hex'),Buffer.from(keyword,'ascii'))}
  else {const ref=Buffer.alloc(5);ref.writeUInt32LE(latest,1);parts.push(ref)}
  const value=Buffer.alloc(5);value[0]=3;value.writeUInt32LE(f.value,1);parts.push(value)
 }
 parts.push(b.subarray(last));const out=Buffer.concat(parts);const after=parse(out);
 for(const [id,v] of plan){assert.equal(after.objects.get(id).fields.at(-1),keyword)}
 return out;
}
const [stock,target]=process.argv.slice(2),input=fs.readFileSync(stock);
assert.equal(hash(input),'eaeee0029eecc9cc65a4d7ec795d4e48a41e505ff5f7595b23df6e675d2f102b');
assert.equal(input.toString('ascii',0,4),'OBSP');const n=u(input,13),table=u(input,17);assert.equal(n,7884);
const rows=Array.from({length:n},(_,i)=>{const at=table+51*i;return {i,at,off:u(input,at+16),len:u(input,at+20)}}).sort((a,b)=>a.off-b.off);
const header=Buffer.from(input.subarray(0,table+51*n));let before=header.length,after=before;const parts=[header];
for(const row of rows){assert.equal(before,row.off);const old=input.subarray(before,before+row.len),part=plans[row.i]?edit(old,plans[row.i]):old;parts.push(part);header.writeUInt32LE(after,row.at+16);header.writeUInt32LE(part.length,row.at+20);before+=row.len;after+=part.length}
assert.equal(before,input.length);const out=Buffer.concat(parts);
assert.equal(hash(out),'da2cd17d4f3604e266e807eed0853ce472881e2c21f119d36edf3b9ee1669156');
fs.writeFileSync(target,out,{flag:'wx'});console.log('Verified release camera archive',hash(out));
