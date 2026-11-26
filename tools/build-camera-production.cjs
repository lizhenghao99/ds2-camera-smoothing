'use strict';
const fs=require('fs'),a=require('assert/strict'),{createHash}=require('crypto'),I=require('./iced-1.21/package/iced_x86.js');
const [input, output, trace]=process.argv.slice(2);const old=fs.readFileSync(input),H=b=>createHash('sha256').update(b).digest('hex');
a.equal(H(old),'59df7b1de42762f9fbb53370caabbeee3bc567911ef25c282222553968853da0');
const site=0x21395d,next=0x213966, op='4c8d4580488d542430', at=x=>x-0xc00;
a.equal(old.subarray(at(site),at(next)).toString('hex'),op);
const u=p=>old.readUInt32LE(p),p=u(60),opt=p+24,cs=0x3b0,v=u(cs+12),raw=u(cs+20), vs=u(cs+8),rs=u(cs+16);
const align=(x,m)=>Math.ceil(x/m)*m,stub=v+align(vs,16);a.equal(old.length,raw+rs);a.equal(v,0x20b6000);a.equal(old.toString('ascii',cs,cs+8),'.camcode');
const bytes=[],fix=[],labels=new Map(),now=()=>stub+bytes.length;
const e=h=>bytes.push(...Buffer.from(h,'hex')); const lab=n=>labels.set(n,now());
const rel=(h,t)=>{e(h);fix.push([bytes.length,t]);e('00000000')};
let failure=0;
const bail=(h,key)=>{const n=++failure;rel('0f'+h,key||'skip'+n);};
const traceResult=()=>{};
e('80bfdf01000000');bail('85');  // native forced camera
e('80bfde01000000');bail('85');  // special auto adjustment
e('4c8b5f404d85db');bail('84');
e('458b4358'); // effective scope starts as native descriptor tag
e('4181f8d1cc4c3e');rel('0f84','nativeScope');
e('4181f8d3cc4c3e');rel('0f84','nativeScope');
e('4d8b96b00300004d85d2');rel('0f84','nativeScope');
e('4c3b9580000000');rel('0f85','nativeScope'); // only use native-validated PlayerState
rel('488d05',0x150fed8);e('493902');rel('0f85','nativeScope');
e('4d8b52104d85d2');rel('0f84','nativeScope');
for(const id of [1316557952,1316791237,1317233782,1330200792,1330201105,1330199908,1330201082,1330199960,1330201054]){
 const x=Buffer.alloc(4);x.writeUInt32LE(id); e('41817a10'+x.toString('hex'));rel('0f84','forwardScope');
}
rel('e9','nativeScope');
lab('forwardScope');e('41b8d1cc4c3e');
lab('nativeScope');
e('4181f8cfcc4c3e');rel('0f84','mountHandoffCheck');
e('4181f8d3cc4c3e');rel('0f85','keepScope');
lab('mountHandoffCheck');
rel('448b15',0x1eb5040);e('41ffca');rel('443b15',0x1eb5088);rel('0f85','keepScope');
rel('f30f1005',0x1eb508c);e('f30f5c85880000000f57c90f2ec1');rel('0f86','keepScope');
rel('f30f1105',0x1eb508c);e('41b8d9cc4c3e');rel('e9','knownCamera');
lab('keepScope');
e('4181f8cfcc4c3e');rel('0f85','scopeTest');
rel('448b15',0x1eb5040);e('41ffca');rel('443b15',0x1eb5070);rel('0f85','scopeTest');
rel('483b3d',0x1eb5078);rel('0f85','scopeTest');
rel('f30f1005',0x1eb5080);e('f30f5c85880000000f57c90f2ec1');rel('0f86','scopeTest');
rel('f30f1105',0x1eb5080);e('41b8d5cc4c3e');rel('e9','knownCamera');
lab('scopeTest');
e('4181f8cfcc4c3e');rel('0f84','knownCamera'); // on-foot Idle - Move
e('4181f8d1cc4c3e');rel('0f84','knownCamera'); // explicitly tagged dodge
e('4181f8d7cc4c3e');rel('0f84','knownCamera');e('4181f8d3cc4c3e');bail('85'); // only tagged mounted states
lab('knownCamera');
e('80bfe101000000');bail('85');   // alternate targeting path
e('4181f8d1cc4c3e');rel('0f84','dtCheck');e('4181f8d7cc4c3e');rel('0f84','dtCheck');e('4181f8d9cc4c3e');rel('0f84','dtCheck');
e('4181f8d3cc4c3e');rel('0f85','groundBlendGuard');
// Record the native riding descriptor's FOV class independently of eligibility.
rel('448b15',0x1eb5040);e('4181e20100000049c1e208');rel('488d05',0x1eb5100);e('4c01d0');
e('c640060041817b1800004842');rel('0f84','noteBoostFov');
e('41817b1800003442');rel('0f85','groundBlendGuard');e('c640062d');rel('e9','maybeBoostExit');
lab('noteBoostFov');e('c6400632');rel('e9','groundBlendGuard');
lab('maybeBoostExit');
e('807f7000');rel('0f85','tailBoostExit');
// Entry to an actual pending blend must follow a committed boosted riding sample.
e('0f57c0f30f104f6c0f2ec8');rel('0f86','groundBlendGuard');
rel('448b15',0x1eb5040);e('41ffca');rel('443b15',0x1eb5044);rel('0f85','groundBlendGuard');
e('4181e20100000049c1e208');rel('488d05',0x1eb5100);e('4c01d0');
e('81780cd3cc4c3e');rel('0f85','groundBlendGuard');e('80780632');rel('0f85','groundBlendGuard');
rel('48893d',0x1eb5098);rel('e9','keepBoostExit');
lab('tailBoostExit');
rel('483b3d',0x1eb5098);rel('0f85','groundBlendGuard');
rel('448b15',0x1eb5040);e('41ffca');rel('443b15',0x1eb5090);rel('0f85','groundBlendGuard');
lab('keepBoostExit');rel('448b15',0x1eb5040);rel('448915',0x1eb5090);rel('e9','dtCheck');
lab('groundBlendGuard');e('807f7000');bail('85');
e('4181f8d3cc4c3e');rel('0f85','stockTimerGuard');
rel('448b15',0x1eb5040);e('41ffca');rel('443b15',0x1eb5044);rel('0f85','stockTimerGuard');
e('4181e20100000049c1e208');rel('488d05',0x1eb5100);e('4c01d0');
e('81780cd3cc4c3e');rel('0f84','dtCheck'); // first frame only, both camera samples grounded and mounted
lab('stockTimerGuard');        // native transition last-frame flag
e('0f57c0f30f104f6c0f2ec8');bail('85');bail('8a');// timer must be exactly zero
lab('dtCheck');
e('f30f109588000000');rel('0f2e15','dtmin');bail('86');rel('0f2e15','dtmax');bail('87');
e('4181f8cfcc4c3e');rel('0f85','angles'); // dodge/horse get their stock speed; no walk gate
e('f30f108740010000f30f5c8730010000f30f59c0');// (current target X - prior X)^2
e('f30f108f44010000f30f5c8f34010000f30f59c9f30f58c1');// add Y distance squared
e('f30f59d20f2ec2');rel('0f8a','skip11');bail('86','lowMotion'); // speed > 1 unit/s, reject unordered
rel('f30f5915','walkmax2');e('0f2ec2');bail('87','highMotion');
rel('f30f1005','releaseTime');rel('f30f1105',0x1eb5060);rel('e9','angles');
lab('lowMotion');e('b80b000000');rel('e9','release');
lab('highMotion');e('b80c000000');
lab('release');
rel('448b15',0x1eb5040);e('41ffca');rel('443b15',0x1eb5064);rel('0f85','noRelease');
rel('483b3d',0x1eb5068);rel('0f85','noRelease');
rel('f30f1005',0x1eb5060);e('f30f5c85880000000f57c90f2ec1');rel('0f86','noRelease');
rel('f30f1105',0x1eb5060);rel('e9','angles');
lab('noRelease');e('83f80b');rel('0f84','skip11');rel('e9','skip12');
lab('angles'); // speed <= 260, native walk cap 240
for(const off of ['84000000','88000000']){e('448b97'+off+'4181e2ffffff7f4181fa17b7d138');bail('87');}
e('f30f10442450f30f59c0');        // xmm0 = qx²
e('f30f104c2454f30f59c9f30f58c1');// xmm0 += qy²
e('f30f10542458f30f59d2');        // xmm2 = qz²
e('f30f105c245cf30f59dbf30f58d3f30f58d0'); // xmm2 += qw² + qx² + qy²
rel('0f2e15','eps');bail('86');
e('f30f58c0f30f5ec2');rel('f30f5c05','one'); // sin(pitch)=2*(qx²+qy²)/norm²-1
e('0f28c8f30f59c9');rel('f30f1015','one');
e('f30f5cd1');rel('0f2e15','eps');bail('86');
e('f30f51d2f30f5ec2');             // xmm0 = tan(pitch)
e('f30f104c2430f30f5c4e30f30f59c9');// square target-eye horizontal X
e('f30f10542434f30f5c5634f30f59d2f30f58ca');// plus squared Y 
rel('0f2e0d','eps');bail('86');
e('f30f51c9f30f59c1');            // h=xmm1, locked deltaZ=xmm0
e('f30f105c2438f30f5c5e38');     // stock deltaZ=xmm3
e('0f28d1f30f59d10f28e0f30f59e3f30f58e2'); // horizontal^2=xmm2, dot=xmm4
e('0f57ed0f2ee5');bail('86');    // >90° already fully stock, also reject unordered
e('0f28e0f30f59e0f30f58e2f30f51e4'); // length of locked direction
e('0f28ebf30f59ebf30f58eaf30f51edf30f59e5'); // times length of stock direction
e('0f28e8f30f5cebf30f59e9f30f5eec'); // signed sin(angle difference)
rel('660f542d','abs');            // absolute sine, both rays share heading
e('66410f7ee9'); // r9d = angle sine, for dodge safety fade
e('4181f8d1cc4c3e');rel('0f84','dodgeAngleCheck');e('4181f8d5cc4c3e');rel('0f84','dodgeAngleCheck');e('4181f8d3cc4c3e');rel('0f84','dodgeAngleCheck');e('4181f8d7cc4c3e');rel('0f84','mountAngleCheck');e('4181f8d9cc4c3e');rel('0f84','mountAngleCheck');
rel('0f2e2d','hi');rel('e9','angleCheck');
lab('mountAngleCheck');rel('0f2e2d','mountHi');rel('e9','angleCheck');lab('dodgeAngleCheck');rel('0f2e2d','dodgeHi');
lab('angleCheck');bail('83');bail('8a');rel('f30f592d','scale');e('f30f59edf30f59ed');
e('0f57e4f30f5fe5');             // max(0,t) into xmm4
rel('f30f5d25','one');
e('0f28d40f28ecf30f58ec');        // xmm2=t, xmm5=2t
rel('f30f100d','three');e('f30f5ccdf30f59d4f30f59ca'); // t²(3−2t) into xmm1
rel('f30f590d','curveSpan');rel('f30f580d','curveFloor');
// Effective stock weight = 1 - (1-angleWeight)*smoothstep(timeLeft/.05).
e('4181f8cfcc4c3e');rel('0f85','mixTarget');rel('f30f1015',0x1eb5060);rel('f30f5915','invRelease');
rel('f30f5d15','one');
e('0f28eaf30f58ea');rel('f30f1025','three');e('f30f5ce5f30f59d2f30f59e2');
rel('f30f1015','one');e('f30f5cd1f30f59d4');rel('f30f100d','one');e('f30f5cca');
lab('mixTarget');e('f30f5cd8f30f59d9'); // mixed height delta, relative to prior pitch
e('4181f8d1cc4c3e');rel('0f84','capTarget');e('4181f8d5cc4c3e');rel('0f84','capTarget');e('4181f8d7cc4c3e');rel('0f84','capTarget');e('4181f8d9cc4c3e');rel('0f84','capTarget');e('4181f8d3cc4c3e');rel('0f85','saveTarget');lab('capTarget');
// Keep horizontal geometry fixed. Solve exact height bound for a small signed pitch step.
e('66410f7eda'); // r10d = beta's unclamped delta
e('f30f10542430f30f5c5630f30f59d2f30f10642434f30f5c6634f30f59e4f30f58d4f30f51d2');
e('f30f108d88000000');e('4181f8d3cc4c3e');rel('0f84','mountedRate');
e('4181f8d7cc4c3e');rel('0f84','mountRateLane');e('4181f8d9cc4c3e');rel('0f84','mountRecoveryLane');rel('f30f590d','dodgeRate');rel('e9','applyRate');lab('mountRateLane');rel('f30f590d','mountRate');rel('e9','applyRate');lab('mountRecoveryLane');rel('f30f590d','mountRecoveryRate');rel('e9','applyRate');
lab('mountedRate');rel('f30f590d','horseRate');
lab('applyRate');
e('0f28eb');rel('0f542d','sign');e('0f57cd'); // sign of requested height delta
e('0f28e0f30f5ee20f28ecf30f59e8f30f58eaf30f59e9f30f59e1');
rel('f30f1015','one');e('f30f5cd40f57e4');rel('0f2e15','eps');rel('0f86','saveTarget');
e('f30f5eea0f2edc');rel('0f82','limitNegative');
e('f30f5ddd');rel('e9','capFade');
lab('limitNegative');e('f30f5fdd');
lab('capFade');e('66410f6ec9');
e('4181f8d7cc4c3e');rel('0f84','mountCapFade');e('4181f8d9cc4c3e');rel('0f84','mountCapFade');
rel('f30f5c0d','dodgeLo');rel('f30f590d','dodgeInvFade');rel('e9','commonFade');
lab('mountCapFade');rel('f30f5c0d','mountLo');rel('f30f590d','mountInvFade');
lab('commonFade');
e('0f57d2f30f5fca');rel('f30f5d0d','one');
e('0f28e9f30f58ed');rel('f30f1015','three');e('f30f5cd5f30f59c9f30f59ca');
e('4181f8d9cc4c3e');rel('0f84','mountFadeTime');
e('4181f8d5cc4c3e');rel('0f85','mixCap');
rel('f30f1015',0x1eb5080);rel('f30f5915','invTail');rel('e9','tailMultiplier');
lab('mountFadeTime');rel('f30f1015',0x1eb508c);rel('f30f5915','mountFadeInv');
lab('tailMultiplier');
rel('f30f5d15','one');
e('0f28eaf30f58ea');rel('f30f1025','three');e('f30f5ce5f30f59d2f30f59e2');
rel('f30f1015','one');e('f30f5cd1f30f59d4');rel('f30f100d','one');e('f30f5cca');
lab('mixCap');e('66410f6ed2f30f5cd3f30f59d1f30f58da');
lab('saveTarget');e('f30f58c3f30f584638f30f11442468');e('4181f8cfcc4c3e');rel('0f85','specialTrace');
rel('448b15',0x1eb5040);rel('448915',0x1eb5064);rel('48893d',0x1eb5068);
rel('f30f1015',0x1eb5060);rel('0f2e15','releaseTime');rel('0f82','didRelease');
traceResult(0);rel('e9','renderChoice');
lab('didRelease');traceResult(21);rel('e9','renderChoice');
lab('specialTrace');e('4181f8d1cc4c3e');rel('0f84','dodgeTrace');e('4181f8d5cc4c3e');rel('0f84','tailTrace');
e('4181f8d7cc4c3e');rel('0f84','mountTrace');e('4181f8d9cc4c3e');rel('0f84','mountRecoveryTrace');
e('0f57c0f30f104f6c0f2ec8');rel('0f87','boostFirstTrace');
traceResult(23);rel('e9','renderChoice');
lab('boostFirstTrace');
e('807f7000');rel('0f85','boostExitTrace');
traceResult(27);rel('e9','renderChoice');
lab('boostExitTrace');traceResult(28);rel('e9','renderChoice');
lab('mountTrace');rel('f30f1015','mountTail');rel('f30f1115',0x1eb508c);
rel('448b15',0x1eb5040);rel('448915',0x1eb5088);
traceResult(25);rel('e9','renderChoice');
lab('mountRecoveryTrace');rel('448b15',0x1eb5040);rel('448915',0x1eb5088);
traceResult(26);rel('e9','renderChoice');
lab('dodgeTrace');
e('41817b58cfcc4c3e');rel('0f85','doDodgeTrace'); // only arm from real walking camera
rel('f30f1015','dodgeTail');rel('f30f1115',0x1eb5080);
rel('448b15',0x1eb5040);rel('448915',0x1eb5070);rel('48893d',0x1eb5078);
lab('doDodgeTrace');traceResult(22);rel('e9','renderChoice');
lab('tailTrace');rel('448b15',0x1eb5040);rel('448915',0x1eb5070);
traceResult(24);
lab('renderChoice');
e('4c8b5424304c89542460448b54243c448954246c'); // copy XY,W, leave stock pivot alone
e('4c8d4580488d542460');rel('e9',next);
for(let n=1;n<=failure;n++){lab('skip'+n);traceResult(n);rel('e9','stock');} lab('stock');e(op);rel('e9',next);
const codeEnd=now();
while(now()%4)e('90');lab('one');e('0000803f');lab('eps');e('17b7d138');
const fp=(n)=>{const t=Buffer.alloc(4); t.writeFloatLE(n); e(t.toString('hex'));};
lab('hi');fp(Math.sin(Math.PI/40));lab('dodgeHi');fp(Math.sin(Math.PI/15));lab('dodgeLo');fp(Math.sin(Math.PI*8/180));lab('dodgeInvFade');fp(1/(Math.sin(Math.PI/15)-Math.sin(Math.PI*8/180)));lab('dodgeRate');fp(Math.PI/15);lab('horseRate');fp(Math.PI/30);lab('mountRate');fp(Math.PI/60);lab('mountRecoveryRate');fp(Math.PI/12);lab('mountTail');fp(1.25);lab('mountFadeInv');fp(4);lab('mountHi');fp(Math.sin(Math.PI*25/180));lab('mountLo');fp(Math.sin(Math.PI*18/180));lab('mountInvFade');fp(1/(Math.sin(Math.PI*25/180)-Math.sin(Math.PI*18/180)));lab('dodgeTail');fp(.125);lab('invTail');fp(8);lab('curveFloor');fp(.02);lab('curveSpan');fp(.98);lab('releaseTime');fp(.05);lab('invRelease');fp(20);lab('dtmin');fp(.004);lab('dtmax');fp(.10);lab('walkmax2');fp(260**2);lab('scale');fp(1/Math.sin(Math.PI/40));lab('three');fp(3);while(now()%16)e('90');lab('abs');e('ffffff7fffffff7fffffff7fffffff7f');lab('sign');e('00000080000000800000008000000080');
const b=Buffer.from(bytes);
for(const [q,t] of fix)b.writeInt32LE((typeof t==='string'?labels.get(t):t)-stub-q-4,q);
const newSize=stub-v+b.length, newRS=align(newSize+64,512),out=Buffer.alloc(raw+newRS);
old.copy(out);b.copy(out,raw+stub-v);out.writeUInt32LE(newSize,cs+8);out.writeUInt32LE(newRS,cs+16);out.writeUInt32LE(u(opt+4)+newRS-rs,opt+4);out.writeUInt32LE(align(v+newSize,4096),opt+56);
const j=Buffer.alloc(next-site,0x90);j[0]=0xe9;j.writeInt32LE(stub-site-5,1);j.copy(out,at(site));
// Return the unsuccessful earlier experimental idle-clamp bypass to stock, keep all pose logging.
a.equal(old.subarray(at(0x2163d7),at(0x2163e2)).toString('hex'),'e9c4ae1101909090909090');
Buffer.from('0f57fff30f5905bac2b101','hex').copy(out,at(0x2163d7));
const fm=new I.Formatter(I.FormatterSyntax.Intel),D=new I.Decoder(64,b.subarray(0,codeEnd-stub),I.DecoderOptions.None);D.ip=BigInt(stub);
const br=[];while(D.canDecode){const x=D.decode();a(!x.isInvalid);const s=fm.format(x);console.log(x.ip.toString(16),s);if(x.nearBranchTarget)br.push(Number(x.nearBranchTarget));x.free();}
a.equal(failure,20);
a(br.every(dst=>dst===next||[...labels.values()].includes(dst)));a.equal(br.filter(x=>x===next).length,2);a.equal(br.filter(x=>x===labels.get('stock')).length,20);
a.equal(labels.get('skip1') < labels.get('stock'),true);
const poses=fs.readFileSync(trace), size=264;let checked=0,maxError=0,maxStockGap=0,changed=0,maxCorrection=0;
for(let base=8;base+256<=poses.length;base+=size){
 const f=(o)=>poses.readFloatLE(base+o), ux=poses.readUInt32LE(base+12);
 if(ux!==0x3e4cccce||poses[base+4]||[24,28].some(o=>Math.abs(f(o))>1e-4))continue;
 const [x,y,z,w]=[112,116,120,124].map(f),sin=2*(x*x+y*y)/(x*x+y*y+z*z+w*w)-1, c=Math.sqrt(1-sin*sin);
 const dx=f(224)-f(176),dy=f(228)-f(180),h=Math.hypot(dx,dy),eyeZ=f(184);
 if(!(c>0.01&&h>.01))continue;
 const stockZ=f(232)-eyeZ, lockedZ=h*sin/c, dot=h*h+lockedZ*stockZ;
 const ds=Math.abs(h*(lockedZ-stockZ)/(Math.hypot(h,lockedZ)*Math.hypot(h,stockZ)));
 const t=Math.max(0,Math.min(1,ds/Math.sin(Math.PI/40)))**4;
 const weight=dot<=0||ds>=Math.sin(Math.PI/40)?1:.02+.98*t*t*(3-2*t);
 const targetZ=weight===1?f(232):Math.fround(eyeZ+lockedZ+(stockZ-lockedZ)*weight);
 if(weight===1)a(Math.abs(targetZ-f(232))<.005);
 const targetPitch=Math.atan2(targetZ-eyeZ,h),wanted=Math.asin(sin),stockPitch=Math.atan2(f(232)-eyeZ,h);
 if(weight===0)maxError=Math.max(maxError,Math.abs(targetPitch-wanted)*180/Math.PI);
 if(weight<1)changed++;maxCorrection=Math.max(maxCorrection,Math.abs(targetPitch-stockPitch)*180/Math.PI);maxStockGap=Math.max(maxStockGap,Math.abs(stockPitch-wanted)*180/Math.PI);
 checked++;
}
a(checked>5000);a(maxError<0.001);a(maxStockGap>.1);a(changed>0);a(maxCorrection<3.5);console.log({geometrySamples:checked,changed,maxError,maxStockGap,maxCorrection});
fs.writeFileSync(output,out,{flag:'wx'});a.equal(H(fs.readFileSync(output)),H(out));console.log(H(out));