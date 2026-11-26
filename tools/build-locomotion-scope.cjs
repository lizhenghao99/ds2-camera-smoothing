const fs=require('node:fs'), {createHash}=require('node:crypto'), a=require('node:assert/strict');
const H=x=>createHash('sha256').update(x).digest('hex');
const U=(b,o)=>b.readUInt32LE(o);
const W=(b,o,v)=>b.writeUInt32LE(v,o);
const input=process.argv[2], output=process.argv[3];
const old=fs.readFileSync(input);
const baseline='5432f48d0f4929deb4c39fdd78b367e23b76adefd92d377fb00fbdacd408f794';
const expected='5432f48d0f4929deb4c39fdd78b367e23b76adefd92d377fb00fbdacd408f794';
a.equal(H(old),baseline);
const symbol=Buffer.from('01e84e34fd8a8230021c004c6f6f6b617448656967687441646a757374536d6f6f746854696d6503cecc4c3e','hex');
const nameRef=Buffer.from('00300000000400','hex');
const entries=(file)=>{
 a.equal(file.toString('ascii',0,4),'OBSP'); a.equal(U(file,13),7884); a.equal(U(file,17),0x9c678);
 const rows=Array.from({length:U(file,13)},(_,i)=>{
  const at=U(file,17)+51*i;
  return {at,off:U(file,at+16),len:U(file,at+20)};
 });
 let end=U(file,17)+51*rows.length;
 for(const row of [...rows].sort((x,y)=>x.off-y.off)){a.equal(end,row.off);a(row.len>0);end+=row.len;}
 a.equal(end,file.length);
 return rows;
};
const parse=(buf)=>{
 a.equal(buf.subarray(0,4).toString('hex'),'424f44fd');
 let p=16; const ns=[], refs=[], defs=[];
 const b=()=>{a(p<buf.length);return buf[p++];};
 const u=()=>{const x=U(buf,p);p+=4;return x;};
 const nm=()=>{const kind=b();if(kind===0){const off=p,n=u();a(n<ns.length);refs.push([off,n]);return ns[n];}
  a.equal(kind,1);defs.push(p-1);p+=8;const l=buf.readUInt16LE(p);p+=2;const s=buf.toString('latin1',p,p+l);p+=l;ns.push(s);return s;};
 const cl=()=>{const mode=b();a(mode===1||mode===4);if(mode===4)u();return nm();};
 const fields=()=>{const f=[];for(let c=u();c>0;c--){const name=nm();f.push([name,v()]);}return f;};
 const v=()=>{const t=b();switch(t){
 case 2:case 3:return [t,u()];
 case 4:return [t,b()];
 case 7:{const i=u(),c=cl();return [t,i,c,fields()];}
 case 9:{let n=u();a.equal(b(),0);const seq=[];while(n--)seq.push(v());return [t,seq];}
 case 15:return [t,nm()];
 case 252:{const q=buf.subarray(p,p+12).toString('hex');p+=12;return [t,q];}
 case 254:return [t];
 default:throw Error('unexpected value tag '+t+' at '+(p-1));}};
 const tree=[cl(),fields()];
 a.equal(p,buf.length);a.equal(ns.length,U(buf,8));
 return {refs,defs,tree};
};
const splice=(buf,at,bytes)=>Buffer.concat([buf.subarray(0,at),bytes,buf.subarray(at)]);
function addNamed(record,countAt,at,ordinal,stockCount){
 const q=Buffer.from(record);
 a.equal(U(q,countAt),stockCount);
 for(const [p,k] of parse(record).refs)if(p>=at&&k>=ordinal)W(q,p,k+1);
 W(q,countAt,stockCount+1);W(q,8,U(q,8)+1);
 return splice(q,at,symbol);
}
function replace(file,indexEntry,off,len,edit){
 const table=entries(file);
 const target=table.find(row=>row.at===indexEntry);
 a(target);a.equal(target.off,off);a.equal(target.len,len);
 const before=file.subarray(off,off+len), after=edit(before);
 const delta=after.length-len;
 const out=Buffer.concat([file.subarray(0,off),after,file.subarray(off+len)]);
 for(const row of table){
  if(row.at===indexEntry)W(out,row.at+20,row.len+delta);
  else if(row.off>off)W(out,row.at+16,row.off+delta);
 }
 entries(out);
 return out;
}
function editAt(file,index,edit){const row=entries(file).find(x=>x.at===index);a(row);return replace(file,index,row.off,row.len,edit)}
function addScope(r,count,at,n){
 const parsed=parse(r); const ord=parsed.defs.filter(x=>x<at).length;
 return [addNamed(r,count,at,ord,n),ord];
}
const m=editAt(old,0xe6dcc,r=>{
 const [q,ord]=addScope(r,1733,1799,2);
 const end=10096+symbol.length,count=10078+symbol.length;
 a.equal(U(q,count),2);W(q,count,3);
 const ref=Buffer.from('000000000003cecc4c3e','hex');W(ref,1,ord);
 return splice(q,end,ref);
});
const out=editAt(m,0xc343b,r=>addScope(r,22720,22824,4)[0]);
const key='LookatHeightAdjustSmoothTime', changed=[], seen=[];
function strip(node, trail=[]){if(!Array.isArray(node))return node;
 const next=node[0]===7?[...trail,node[1]]:trail;
 return node.flatMap(x=>{
  if(Array.isArray(x)&&x[0]===key&&x[1]?.[0]===3&&x[1][1]===0x3e4cccce){seen.push(next.at(-1));return []}
  return [strip(x,next)];
 });}
const before=entries(old),after=entries(out);
for(let i=0;i<before.length;i++){
 const x=before[i],y=after[i],b=old.subarray(x.off,x.off+x.len),c=out.subarray(y.off,y.off+y.len);
 if(!b.equals(c)){changed.push(x.at);a.deepEqual(strip(parse(b).tree),strip(parse(c).tree));}
}
a.deepEqual(changed,[0xc343b,0xe6dcc]);a.deepEqual(seen,[414,12,115]);
a.equal(old.indexOf(Buffer.from('03cecc4c3e','hex')),-1);
const bytes=Buffer.from('03cecc4c3e','hex');let j=-1,n=0;while((j=out.indexOf(bytes,j+1))>=0)n++;a.equal(n,3);
fs.writeFileSync(output,out,{flag:'wx'});a.equal(H(fs.readFileSync(output)),H(out));console.log('Scope only in three movement nodes: '+H(out));