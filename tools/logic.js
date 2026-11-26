
"use strict";
const pairs=__PAIRS__;
const inputs=[document.querySelector("#exe"),document.querySelector("#obsp")];
const build=document.querySelector("#build"), statusNode=document.querySelector("#status"), downloads=document.querySelector("#downloads");
let results=null,busy=false;
function clearOutputs(){
  results=null; downloads.hidden=true;
}
inputs.forEach(input=>input.addEventListener("change",()=>{
  clearOutputs();statusNode.textContent="Choose both unmodified game files, then verify.";
}));
async function sha(bytes){
  const hash=await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,"0")).join("");
}
function applyBps(source,pair){
  const data=Uint8Array.from(atob(pair.bps),c=>c.charCodeAt(0));
  let i=4, at=0, from=0;
  const end=data.length-12;
  const fail=()=>{throw new Error("The embedded patch is invalid.");};
  if (end<=4 || String.fromCharCode(...data.subarray(0,4))!=="BPS1") fail();
  function next(){
    let n=0,s=1;
    for(let j=0;j<5&&i<end;j++){
      const x=data[i++];n+=(x&127)*s;if(x&128)return n;s*=128;n+=s;
    }
    return fail();
  }
  if(next()!==source.length||next()!==pair.length||next()!==0)fail();
  const out=new Uint8Array(pair.length);
  while(i<end){
    const op=next(),n=Math.floor(op/4)+1;if(at+n>out.length)fail();
    switch(op%4){
      case 0:if(at+n>source.length)fail();out.set(source.subarray(at,at+n),at);break;
      case 1:if(i+n>end)fail();out.set(data.subarray(i,i+n),at);i+=n;break;
      case 2:{
        const d=next();from+=Math.floor(d/2)*(d%2?-1:1);
        if(from<0||from+n>source.length)fail();out.set(source.subarray(from,from+n),at);from+=n;break;
      }
      default:fail();
    }
    at+=n;
  }
  if(at!==out.length||i!==end)fail();
  return out;
}
build.addEventListener("click",async()=>{
  if(busy)return;
  clearOutputs();
  if(!globalThis.crypto?.subtle){statusNode.textContent="Open this file from an extracted folder in a current Edge, Chrome, or Firefox browser.";return;}
  const files=inputs.map(input=>input.files[0]);
  if(files.some(f=>!f)){statusNode.textContent="Choose both stock files first.";return;}
  busy=true;build.disabled=true;inputs.forEach(input=>input.disabled=true);
  statusNode.textContent="Verifying both stock files…";
  try{
    const originals=[];
    for(const [index,file] of files.entries()){
      const pair=pairs[index];
      if(file.size!==pair.sourceLength)throw new Error(pair.path+" does not match the stock Steam build 17701647.");
      const bytes=new Uint8Array(await file.arrayBuffer());
      if(await sha(bytes)!==pair.base)throw new Error(pair.path+" does not match the stock Steam build 17701647.");
      originals.push(bytes);
    }
    const validated=[];
    for(const [index,pair] of pairs.entries()){
      const output=applyBps(originals[index],pair);
      if(await sha(output)!==pair.result)throw new Error(pair.path+" output failed verification. Nothing was saved.");
      validated.push(new Blob([output],{type:"application/octet-stream"}));
    }
    results=validated;downloads.hidden=false;
    statusNode.textContent="Both outputs passed SHA-256 verification. Save both before replacing the game files.";
  }catch(error){statusNode.textContent=error.message;}
  finally{busy=false;build.disabled=false;inputs.forEach(input=>input.disabled=false);}
});
for(const [index,pair] of pairs.entries()){
  document.querySelector("#save"+index).addEventListener("click",()=>{
    if(!results)return;
    const url=URL.createObjectURL(results[index]),link=document.createElement("a");
    link.href=url;link.download=pair.path.split("/").pop();document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
  });
}

