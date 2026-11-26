
const fs=require('fs'),p=require('path'),a=require('assert/strict'),c=require('crypto'),z=require('zlib');
const [root,game]=process.argv.slice(2);
const out=p.join(root,'offline-html-1.0.1'),old=p.join(root,'offline-html');
fs.mkdirSync(out,{recursive:true});
const sha=b=>c.createHash('sha256').update(b).digest('hex');
const mf=JSON.parse(fs.readFileSync(p.join(root,'production','DS2-Camera-Smoothing.ps1'),'utf8').match(/^\$manifest=ConvertFrom-Json '(.*)'$/m)[1]);
const candidate=fs.readFileSync(p.join(root,'loader-audit','candidate.exe'));
const released=fs.readFileSync(p.join(game,'Darksiders2.exe'));
a.equal(sha(released),mf[0].result);a.equal(candidate.length,released.length);
const pe=candidate.readUInt32LE(60),opt=pe+24,field=opt+candidate.readUInt16LE(pe+20)+7*40+8;
a.equal(released.readUInt32LE(field),0x300);a.equal(candidate.readUInt32LE(field),0x201000);
a(candidate.subarray(0,field).equals(released.subarray(0,field))&&candidate.subarray(field+4).equals(released.subarray(field+4)));
function enc(n){const r=[];for(;;){const l=n%128;n=Math.floor(n/128);if(!n)return Buffer.from([...r,128+l]);r.push(l);n--;}}
function u32(n){const b=Buffer.alloc(4);b.writeUInt32LE(n);return b;}
function bps(src,dst){
 const out=[Buffer.from('BPS1'),enc(src.length),enc(dst.length),enc(0)];let at=0,from=0,literal=0,previous=0;
 const flush=()=>{if(at>literal){out.push(enc((at-literal-1)*4+1),dst.subarray(literal,at));literal=at;}};
 while(at<dst.length){
  let n=0;while(at+n<dst.length&&from+n<src.length&&src[from+n]===dst[at+n])n++;
  if(n>=24){flush();if(from===at)out.push(enc((n-1)*4));else{const j=from-previous;out.push(enc((n-1)*4+2),enc(Math.abs(j)*2+(j<0?1:0)));previous=from+n;}at+=n;from+=n;literal=at;continue;}
  if(at+32<=dst.length){const lo=Math.max(0,from-32768),hi=Math.min(src.length,from+32768),q=src.subarray(lo,hi).indexOf(dst.subarray(at,at+32));if(q>=0){from=lo+q;continue;}}
  at++;
 }
 flush();out.push(u32(z.crc32(src)),u32(z.crc32(dst)));const body=Buffer.concat(out);return Buffer.concat([body,u32(z.crc32(body))]);
}
const pairs=mf.map(({file,base,result,length},i)=>{
 const src=fs.readFileSync(p.join(game,'.ds2-camera-smoothing-stock-17701647',file));a.equal(sha(src),base);
 const dst=i===0?candidate:fs.readFileSync(p.join(game,file));
 if(i!==0)a.equal(sha(dst),result);
 const patch=i===0?bps(src,dst):fs.readFileSync(p.join(root,'patch-only-prototype',p.basename(file)+'.bps'));
 return {path:file,base,result:sha(dst),length,sourceLength:src.length,bps:patch.toString('base64')};
});
const replace=(s,x,y)=>{a(s.includes(x),x);return s.replace(x,()=>y)};
let js=fs.readFileSync(p.join(old,'logic.js'),'utf8').replace(/\r\n?/g,'\n');
js=replace(js,'__PAIRS__',JSON.stringify(pairs));
js=replace(js,'Both outputs passed SHA-256 verification. Save both before replacing the game files.','Verified for Steam build 17701647.');
let html=fs.readFileSync(p.join(old,'template.html'),'utf8').replaceAll('Smoothing 1.0','Smoothing 1.0.1');
html=replace(html,'<div id="downloads" hidden>','<div id="downloads" hidden>\n<h2>Replace the following game files with these verified copies</h2>\n<p>Close the game and back up the originals first. The paths below are relative to the game folder.</p>');
html=replace(html,'Save Darksiders2.exe','Download replacement EXE');
html=replace(html,'Save scripts.obsp','Download replacement scripts');
html=replace(html,'<button id="save0"','<code>Darksiders2.exe</code> <button id="save0"');
html=replace(html,'<button id="save1"','<br><code>media\\scripts.obsp</code> <button id="save1"');
html=replace(html,'Prepare and save both verified outputs.','Verify your files and download each replacement.');
html=replace(html,'Choose both unmodified game files.','Choose both unmodified game files. If you installed 1.0, use your original backups as inputs.');
html=replace(html,'__HASH__',c.createHash('sha256').update(js).digest('base64'));
html=replace(html,'__JS__',js);
fs.writeFileSync(p.join(out,'DS2 Camera Smoothing.html'),html);
fs.writeFileSync(p.join(out,'README.md'),[
'# DS2 Camera Smoothing 1.0.1','Steam closed beta build 17701647 only.','',
'1. Close the game. Extract this ZIP and open DS2 Camera Smoothing.html in a browser.',
'2. Choose both original stock files. If 1.0 is installed, use the original backups as inputs.',
'3. After verification, download both replacements. The page shows the destination of each file relative to the game folder. Keep both originals outside the game folder for rollback.',
'4. Replace both files, then launch through Steam. To uninstall, restore both originals.',
'','1.0.1 fixes the Windows launch error in 1.0. Detailed camera recording stays off. The page works offline and does not overwrite your inputs. Do not bypass antivirus or browser warnings.'
].join('\r\n'));
const test=fs.readFileSync(p.join(old,'test-browser.cjs'),'utf8').replace(mf[0].result,pairs[0].result).replace("console.log('Verified download hash:',name,want);","fs.copyFileSync(f,p.join(working,'verified-'+name)); console.log('Verified download hash:',name,want);");
fs.writeFileSync(p.join(out,'test-browser.cjs'),test);
console.log(pairs.map(x=>[x.path,x.result,x.bps.length]));

