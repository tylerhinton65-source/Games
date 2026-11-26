'use strict';
// Part of Swamp Defense (swamp.html loads this before its main script). See SWAMP.md.
/* ---- ZONE 2: Beach (work in progress, Nov 25). Picked in Style → Zone. Same game, new scenery:
   sunset sky + sun, ocean with surf, sandy lane, palm trees, a tide pool where swimmers pop out.
   The cabin is still the swamp cabin for now (next: a beach shack), and the swamp wildlife is hidden here. ---- */
const BEACH_ZONE=true;
function isBeach(){ return BEACH_ZONE&&SET.zone==='beach'; }
function palm(c,x,y,s,R,lean,sway){ c.save(); c.translate(x,y); c.scale(s,s);
  const lx=lean*60+(sway||0)*4; c.strokeStyle='#6b4a2e'; c.lineWidth=7; c.lineCap='round'; c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(lx*.2,-60,lx,-118); c.stroke();
  c.strokeStyle='#8a6440'; c.lineWidth=1.4; for(let i=1;i<12;i++){ const t=i/12, px=lx*t*t, py=-118*t; c.beginPath(); c.moveTo(px-3.5,py); c.lineTo(px+3.5,py-2); c.stroke(); }
  c.translate(lx,-118);
  for(let i=0;i<8;i++){ const a=-Math.PI/2+(i-3.5)*.42+(R()-.5)*.15+(sway||0)*.06*Math.sin(i*1.7), l=44+R()*14, droop=18+R()*10+(sway||0)*2*Math.sin(i*2.3);
    const ex=Math.cos(a)*l, ey=Math.sin(a)*l*.55+droop;
    c.fillStyle=i%2?'#2f6b3a':'#3c8044'; c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(ex*.5,ey*.2-14,ex,ey); c.quadraticCurveTo(ex*.55,ey*.2-4,0,4); c.fill();
    c.strokeStyle='rgba(20,50,25,.5)'; c.lineWidth=.8; c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(ex*.5,ey*.2-11,ex,ey); c.stroke(); }
  c.fillStyle='#5a3a22'; for(const [cx,cy] of [[-3,5],[3,6],[0,9]]){ c.beginPath(); c.arc(cx,cy,3.4,0,TAU); c.fill(); }
  c.restore(); }
/* Live beach layer (drawn every frame, under the zombies): the lighthouse lamp blinks, a little fishing boat
   putters back and forth on the water with a wake and a bob, and the palms sway gently in the sea breeze. */
const BOAT={x:0,dir:1,init:false};
function drawBeachLife(){
  const fw=W-L.FX, t=TIME;
  if(L.lighthouse){ const on=(t%3)<1.4, a=on?.9:.15, lx=L.lighthouse.x, ly=L.lighthouse.y;
    const g=ctx.createRadialGradient(lx,ly,0,lx,ly,on?14:5); g.addColorStop(0,`rgba(255,240,170,${a})`); g.addColorStop(1,'rgba(255,220,140,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(lx,ly,on?14:5,0,TAU); ctx.fill(); }
  // boat
  if(!BOAT.init){ BOAT.x=L.FX+fw*.55; BOAT.init=true; }
  const x0=L.FX+fw*.3, x1=W-40, dt=Math.min(.05,t-(BOAT.t||t)); BOAT.t=t;
  BOAT.x+=BOAT.dir*9*dt; if(BOAT.x>x1){BOAT.x=x1;BOAT.dir=-1;} if(BOAT.x<x0){BOAT.x=x0;BOAT.dir=1;}
  const bx=BOAT.x, by=236+Math.sin(t*1.6)*.8, rock=Math.sin(t*1.3)*.05;
  ctx.save(); ctx.translate(bx,by);
  ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=.9; for(let k=1;k<4;k++){ const wx=-BOAT.dir*(10+k*7); ctx.beginPath(); ctx.moveTo(wx,1.5+k*.4); ctx.lineTo(wx-BOAT.dir*6,1.5+k*.4); ctx.stroke(); }
  ctx.fillStyle='rgba(20,40,60,.3)'; ctx.beginPath(); ctx.ellipse(0,3,15,1.6,0,0,TAU); ctx.fill();
  ctx.rotate(rock); ctx.scale(BOAT.dir,1);
  ctx.fillStyle='#f2ece0'; ctx.beginPath(); ctx.moveTo(-14,-3); ctx.lineTo(13,-3); ctx.quadraticCurveTo(12,2,7,3); ctx.lineTo(-11,3); ctx.quadraticCurveTo(-14,1,-14,-3); ctx.fill();
  ctx.fillStyle='#c84a3e'; ctx.fillRect(-13,-1,25,1.6);
  ctx.fillStyle='#e9dccb'; ctx.fillRect(-7,-9,8,6); ctx.fillStyle='#5a8ab0'; ctx.fillRect(-5.5,-7.6,2.4,2.2); ctx.fillRect(-2.2,-7.6,2.4,2.2);
  ctx.fillStyle='#6a4a3a'; ctx.fillRect(-7.5,-10,9,1.3);
  ctx.strokeStyle='#4a3a30'; ctx.lineWidth=.8; ctx.beginPath(); ctx.moveTo(5,-3); ctx.lineTo(5,-17); ctx.moveTo(5,-16); ctx.lineTo(13,-4); ctx.stroke(); // mast + fishing line
  ctx.fillStyle='#ffcf6a'; ctx.beginPath(); ctx.arc(-9.5,-5,1,0,TAU); ctx.fill(); // little cabin light
  ctx.restore();
  beachExtras(t,fw);
  // palms down the beach, swaying
  const R=mulberry(77);
  for(const p of [{x:L.FX+fw*.3,s:.75,l:.3,ph:0},{x:L.FX+fw*.52,s:.95,l:-.2,ph:1.7},{x:L.FX+fw*.74,s:.7,l:.35,ph:3.1},{x:W-14,s:1.15,l:-.4,ph:4.4}])
    palm(ctx,p.x,294,p.s,R,p.l,Math.sin(t*.7+p.ph)*.6+Math.sin(t*1.9+p.ph)*.15);
}
function drawBeachBG(c){
  const R=mulberry(23), top=-OY-2, Wd=W+4, fw=W-L.FX;
  // sunset sky
  let g=c.createLinearGradient(0,top,0,220); g.addColorStop(0,'#2b3a78'); g.addColorStop(.45,'#7a5aa8'); g.addColorStop(.75,'#f08a6a'); g.addColorStop(1,'#ffc46b');
  c.fillStyle=g; c.fillRect(-2,top,Wd,224-top);
  c.fillStyle='#fff'; for(let i=0;i<30;i++){ c.globalAlpha=R()*.5+.15; c.fillRect(R()*W,top+R()*(90-top),1.3,1.3); } c.globalAlpha=1;
  // sun sinking into the sea
  const sx=W*.64, sy=206; let sg=c.createRadialGradient(sx,sy,8,sx,sy,120); sg.addColorStop(0,'rgba(255,220,140,.7)'); sg.addColorStop(1,'rgba(255,180,110,0)'); c.fillStyle=sg; c.fillRect(sx-120,sy-120,240,240);
  sg=c.createLinearGradient(0,sy-34,0,sy+10); sg.addColorStop(0,'#fff1b0'); sg.addColorStop(1,'#ff9a52'); c.fillStyle=sg; c.beginPath(); c.arc(sx,sy,34,Math.PI,TAU); c.fill();
  // soft clouds
  for(let i=0;i<6;i++){ const cx=R()*W, cy=60+R()*90, w=40+R()*70; c.fillStyle=`rgba(255,${150+R()*60|0},${150+R()*40|0},.35)`; c.beginPath(); c.ellipse(cx,cy,w,6+R()*5,0,0,TAU); c.fill(); c.beginPath(); c.ellipse(cx+w*.3,cy-5,w*.5,5,0,0,TAU); c.fill(); }
  // ocean
  g=c.createLinearGradient(0,206,0,292); g.addColorStop(0,'#f2a070'); g.addColorStop(.12,'#3f7fa8'); g.addColorStop(1,'#1f5f86'); c.fillStyle=g; c.fillRect(-2,206,Wd,90);
  c.fillStyle='rgba(255,210,140,.55)'; for(let i=0;i<20;i++){ const y=209+i*i*.2; c.fillRect(sx-26+R()*52-i*2,y,12+R()*40,1.3); }
  c.strokeStyle='rgba(255,255,255,.22)'; c.lineWidth=1; for(let i=0;i<40;i++){ const x=R()*W, y=222+R()*60; c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x+6,y-2,x+12,y); c.stroke(); }
  // distant island: two hills, sunlit rim, a few palms, a beach strip and a little lighthouse (its lamp blinks in drawBeachLife)
  { const ix=L.FX+fw*.2, iy=208; L.island={l:ix-fw*.14,r:ix+fw*.15,y:iy};
    c.fillStyle='#8a6890'; c.beginPath(); c.moveTo(ix-fw*.14,iy); c.quadraticCurveTo(ix-fw*.08,iy-12,ix-fw*.02,iy-14); c.quadraticCurveTo(ix+fw*.05,iy-24,ix+fw*.1,iy-8); c.quadraticCurveTo(ix+fw*.13,iy-3,ix+fw*.15,iy); c.fill();
    c.fillStyle='#7a5a86'; c.beginPath(); c.moveTo(ix-fw*.06,iy); c.quadraticCurveTo(ix+fw*.03,iy-20,ix+fw*.1,iy); c.fill();
    c.strokeStyle='rgba(255,190,140,.6)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(ix+fw*.0,iy-14); c.quadraticCurveTo(ix+fw*.05,iy-24.5,ix+fw*.1,iy-8.5); c.stroke();
    c.fillStyle='#c79a86'; c.beginPath(); c.ellipse(ix-fw*.02,iy+.5,fw*.1,1.6,0,0,TAU); c.fill();
    const mini=(x,h,l)=>{ c.strokeStyle='#5e4472'; c.lineWidth=1.1; c.beginPath(); c.moveTo(x,iy-1); c.quadraticCurveTo(x+l*.4,iy-h*.6,x+l,iy-h); c.stroke(); c.fillStyle='#5e4472';
      for(let k=0;k<5;k++){ const a=-Math.PI/2+(k-2)*.6; c.beginPath(); c.moveTo(x+l,iy-h); c.quadraticCurveTo(x+l+Math.cos(a)*4,iy-h+Math.sin(a)*2-1.5,x+l+Math.cos(a)*7,iy-h+Math.sin(a)*2+3); c.lineTo(x+l+Math.cos(a)*6,iy-h+Math.sin(a)*2+3.6); c.quadraticCurveTo(x+l+Math.cos(a)*3,iy-h+Math.sin(a)*2,x+l,iy-h+.8); c.fill(); } };
    mini(ix-fw*.09,15,2); mini(ix-fw*.075,12,-1.5); mini(ix+fw*.07,13,1.5);
    // lighthouse on the shoulder of the right hill
    const lx=ix+fw*.075, lb=iy-7; c.fillStyle='#e8ddd8'; c.beginPath(); c.moveTo(lx-2.4,lb); c.lineTo(lx-1.5,lb-14); c.lineTo(lx+1.5,lb-14); c.lineTo(lx+2.4,lb); c.fill();
    c.fillStyle='#b8505a'; c.fillRect(lx-2,lb-5,4,2.4); c.fillRect(lx-1.7,lb-10,3.4,2.2); c.fillStyle='#3a2c3a'; c.fillRect(lx-2,lb-17,4,3); c.beginPath(); c.moveTo(lx-2.4,lb-17); c.lineTo(lx,lb-19.5); c.lineTo(lx+2.4,lb-17); c.fill();
    c.fillStyle='#6a4c78'; c.beginPath(); c.ellipse(ix+fw*.14,iy-.5,5,2.2,0,0,TAU); c.fill(); // rocks off the point
    // its reflection in the water, broken up by ripples
    c.fillStyle='rgba(110,80,130,.28)'; for(let k=0;k<7;k++){ const yy=iy+1+k*1.6, w=(fw*.13)*(1-k*.1); c.fillRect(ix-fw*.11+(R()-.5)*4,yy,w*1.5,1); }
    // sea haze along the horizon so the island melts into the distance
    { const hz=c.createLinearGradient(0,iy-14,0,iy+6); hz.addColorStop(0,'rgba(255,175,130,0)'); hz.addColorStop(.7,'rgba(255,175,130,.45)'); hz.addColorStop(1,'rgba(255,175,130,0)'); c.fillStyle=hz; c.fillRect(-2,iy-14,Wd,20); }
    L.lighthouse={x:lx,y:lb-15.5}; }
  // surf line then sand
  c.fillStyle='rgba(255,255,255,.75)'; c.beginPath(); c.moveTo(-2,290); for(let x=-2;x<=W+4;x+=10)c.lineTo(x,284+Math.sin(x*.06)*3+R()*2); c.lineTo(W+4,296); c.lineTo(-2,296); c.fill();
  g=c.createLinearGradient(0,286,0,402); g.addColorStop(0,'#e8c98e'); g.addColorStop(1,'#cfa564'); c.fillStyle=g; c.beginPath(); c.moveTo(-2,293); for(let x=-2;x<=W+4;x+=16)c.lineTo(x,289+Math.sin(x*.05)*2+R()*2); c.lineTo(W+4,402); c.lineTo(-2,402); c.fill();
  c.fillStyle='rgba(120,80,40,.12)'; for(let i=0;i<260;i++){ c.fillRect(R()*W,295+R()*105,1.2,1.2); }
  for(let i=0;i<14;i++){ const x=L.HX+R()*(W-L.HX), y=302+R()*92; c.fillStyle='rgba(150,105,55,.2)'; c.beginPath(); c.ellipse(x,y,14+R()*24,2+R()*2.5,0,0,TAU); c.fill(); }
  // a row of smaller, hazier palms further down the shore (behind the swaying ones)
  c.globalAlpha=.8; for(const t of [{x:L.FX+16,s:.44,l:.15},{x:L.FX+fw*.14,s:.42,l:-.2},{x:L.FX+fw*.41,s:.5,l:.25},{x:L.FX+fw*.64,s:.46,l:-.3},{x:L.FX+fw*.9,s:.55,l:.2}]) palm(c,t.x,290,t.s,R,t.l); c.globalAlpha=1;
  // driftwood and a line of footprints wandering down the beach
  { const dx=L.FX+fw*.86, dy=304; c.strokeStyle='#9a8a72'; c.lineWidth=4; c.lineCap='round'; c.beginPath(); c.moveTo(dx-22,dy+2); c.quadraticCurveTo(dx,dy-3,dx+20,dy); c.stroke(); c.lineWidth=2; c.beginPath(); c.moveTo(dx+4,dy-1); c.lineTo(dx+10,dy-8); c.stroke(); c.strokeStyle='rgba(255,255,255,.25)'; c.lineWidth=1; c.beginPath(); c.moveTo(dx-18,dy); c.quadraticCurveTo(dx,dy-4.5,dx+18,dy-1.5); c.stroke(); }
  c.fillStyle='rgba(150,110,60,.28)'; for(let k=0;k<16;k++){ const x=L.FX+fw*.34+k*9, y=300+k*1.3+(k%2?3:0); c.beginPath(); c.ellipse(x,y,2.2,1,.2,0,TAU); c.fill(); }
  // shells and starfish
  for(let i=0;i<10;i++){ const x=L.FX+R()*fw, y=300+R()*90; if(R()<.35){ c.fillStyle='#e86a4a'; c.save(); c.translate(x,y); c.beginPath(); for(let k=0;k<10;k++){ const r=k%2?1.6:4.2, a=k*Math.PI/5-Math.PI/2; c.lineTo(Math.cos(a)*r,Math.sin(a)*r*.7); } c.fill(); c.restore(); } else { c.fillStyle='#fbefe0'; c.beginPath(); c.ellipse(x,y,2.6,1.8,R(),0,TAU); c.fill(); } }
  // tide pool across the lane (swimmers pop out here)
  const pc=(L.POOL0+L.POOL1)/2, pw=(L.POOL1-L.POOL0)/2;
  c.fillStyle='#b88e55'; c.beginPath(); c.ellipse(pc,342,pw+6,34,0,0,TAU); c.fill();
  g=c.createLinearGradient(0,310,0,375); g.addColorStop(0,'#4aa0b8'); g.addColorStop(1,'#2a7088'); c.fillStyle=g; c.beginPath(); c.ellipse(pc,342,pw,30,0,0,TAU); c.fill();
  c.strokeStyle='rgba(255,255,255,.3)'; for(let i=0;i<6;i++){ c.beginPath(); c.ellipse(pc+R()*pw-pw/2,330+R()*24,8+R()*14,1.5,0,0,TAU); c.stroke(); }
  c.fillStyle='#7a7470'; for(let i=0;i<5;i++){ const a=R()*TAU; c.beginPath(); c.ellipse(pc+Math.cos(a)*(pw+4),342+Math.sin(a)*32,5+R()*4,3+R()*2,0,0,TAU); c.fill(); }
  // palm trees (behind the cabin, and down the beach — clear of the stairs, fence and turret spots)
  palm(c,170,262,.9,R,-.25);
  // beach umbrella + towel
  { const ux=L.FX+fw*.62, uy=300; c.fillStyle='#d9524a'; c.fillRect(ux-16,uy+2,30,8); c.fillStyle='#f4e6c8'; c.fillRect(ux-16,uy+4,30,2);
    c.strokeStyle='#eee'; c.lineWidth=1.5; c.beginPath(); c.moveTo(ux,uy+6); c.lineTo(ux+6,uy-30); c.stroke();
    c.save(); c.translate(ux+6,uy-30); c.rotate(.2); for(let i=0;i<6;i++){ c.fillStyle=i%2?'#f4f0e0':'#2a8ac0'; c.beginPath(); c.moveTo(0,0); c.arc(0,0,22,Math.PI+i*Math.PI/6,Math.PI+(i+1)*Math.PI/6); c.fill(); } c.restore(); }
  drawCabin(c,R);
  return bgCv;
}

/* ---- Beach ambience (live, subtle): foam lapping at the shore, a cruise ship creeping along the horizon (it slips
   behind the island), a dolphin that leaps now and then, gulls wheeling overhead, a paraglider drifting by once in a
   while, and a little crab scuttling along the waterline. Each one can be switched off in BEACH_FX. ---- */
const BEACH_FX={foam:true,ship:true,dolphin:true,gulls:true,glider:true,crab:true};
const BX={ship:null,shipWait:4,dol:null,dolWait:8,glide:null,glideWait:14,crab:{x:0,dir:1,stop:0,init:false},last:0};
function beachExtras(t,fw){
  const dt=Math.min(.05,Math.max(0,t-(BX.last||t))); BX.last=t; const isl=L.island;
  // waves lapping: wet sand darkens as the water pulls back, then a soft foam edge rolls in
  if(BEACH_FX.foam){ const k=Math.sin(t*.9), y0=287+k*2.4;
    ctx.fillStyle='rgba(160,120,70,.16)'; ctx.beginPath(); ctx.moveTo(-2,y0+1); for(let x=-2;x<=W+4;x+=12)ctx.lineTo(x,y0+3+Math.sin(x*.05+t*.6)*1.5); ctx.lineTo(W+4,y0+8); ctx.lineTo(-2,y0+8); ctx.fill();
    ctx.strokeStyle=`rgba(255,255,255,${.45+k*.15})`; ctx.lineWidth=1.4; ctx.beginPath(); for(let x=180;x<=W+4;x+=6){ const y=y0+Math.sin(x*.07+t*1.3)*1.2; x===180?ctx.moveTo(x,y):ctx.lineTo(x,y); } ctx.stroke(); }
  // cruise ship far out on the horizon, right to left; hidden once it passes behind the island
  if(BEACH_FX.ship&&isl){ if(!BX.ship){ BX.shipWait-=dt; if(BX.shipWait<=0)BX.ship={x:W+90}; }
    if(BX.ship){ const sh=BX.ship; sh.x-=3.2*dt; if(sh.x<isl.r-60){ BX.ship=null; BX.shipWait=40+Math.random()*40; }
      else { ctx.save(); ctx.beginPath(); ctx.rect(isl.r-2,isl.y-30,W,40); ctx.clip(); ctx.translate(sh.x,isl.y-1);
        ctx.fillStyle='rgba(90,70,110,.9)'; ctx.beginPath(); ctx.moveTo(-34,0); ctx.lineTo(30,0); ctx.lineTo(36,-6); ctx.lineTo(-38,-6); ctx.fill();
        ctx.fillStyle='rgba(120,95,135,.95)'; ctx.fillRect(-28,-10,50,4); ctx.fillRect(-22,-13.5,36,3.5); ctx.fillRect(-14,-16.5,18,3);
        ctx.fillStyle='rgba(80,60,95,.95)'; ctx.fillRect(4,-21,4,5); // funnel
        ctx.fillStyle='rgba(255,220,150,.8)'; for(let i=0;i<12;i++)ctx.fillRect(-30+i*5,-4,1.4,1); for(let i=0;i<8;i++)ctx.fillRect(-26+i*6,-9,1.2,.9);
        ctx.fillStyle='rgba(255,190,150,.3)'; ctx.fillRect(-36,1,70,.8); ctx.restore(); } } }
  // dolphin: an arc out of the water with a splash at each end
  if(BEACH_FX.dolphin){ if(!BX.dol){ BX.dolWait-=dt; if(BX.dolWait<=0){ const d=Math.random()<.5?1:-1; BX.dol={x:L.FX+fw*(.3+Math.random()*.55),y:248+Math.random()*16,d,p:0}; } }
    if(BX.dol){ const D=BX.dol; D.p+=dt/1.5; if(D.p>=1.35){ BX.dol=null; BX.dolWait=14+Math.random()*16; }
      else { const p=Math.min(1,D.p), sc=.75+(D.y-248)/40;
        const splash=(sx,age)=>{ if(age<0||age>.6)return; ctx.strokeStyle=`rgba(255,255,255,${.7*(1-age/.6)})`; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(sx,D.y,4+age*18,1+age*3,0,0,TAU); ctx.stroke();
          ctx.fillStyle=`rgba(255,255,255,${.8*(1-age/.6)})`; for(let k=-2;k<=2;k++){ ctx.beginPath(); ctx.arc(sx+k*2.4,D.y-age*14*(1-Math.abs(k)*.25)+age*age*30,.9,0,TAU); ctx.fill(); } };
        splash(D.x,D.p*1.5); splash(D.x+D.d*44*sc,(D.p-1)*1.5+.05);
        if(D.p<1){ const x=D.x+D.d*p*44*sc, y=D.y-Math.sin(p*Math.PI)*20*sc, ang=Math.atan2(-Math.cos(p*Math.PI)*20*Math.PI*sc,44*sc);
          ctx.save(); ctx.beginPath(); ctx.rect(x-30,D.y-60,60,60); ctx.clip(); ctx.translate(x,y); ctx.scale(D.d*sc,sc); ctx.rotate(ang*D.d*D.d);
          ctx.fillStyle='#5f7f9a'; ctx.beginPath(); ctx.moveTo(-11,0); ctx.quadraticCurveTo(-4,-4.5,6,-3); ctx.quadraticCurveTo(11,-2,13,0); ctx.quadraticCurveTo(8,1.5,4,2.6); ctx.quadraticCurveTo(-4,3.4,-11,0); ctx.fill();
          ctx.fillStyle='#c9d8e2'; ctx.beginPath(); ctx.moveTo(-6,1.4); ctx.quadraticCurveTo(2,3.8,9,1); ctx.quadraticCurveTo(2,2.2,-6,1.4); ctx.fill();
          ctx.fillStyle='#4e6c86'; ctx.beginPath(); ctx.moveTo(-1,-3.6); ctx.lineTo(-4,-8); ctx.lineTo(3,-3.4); ctx.fill(); ctx.beginPath(); ctx.moveTo(-11,0); ctx.lineTo(-15,-3.4); ctx.lineTo(-14,0); ctx.lineTo(-15,3); ctx.fill();
          ctx.fillStyle='#1a1a1a'; ctx.beginPath(); ctx.arc(8,-1.2,.6,0,TAU); ctx.fill(); ctx.restore(); } } } }
  // gulls wheeling in the sky
  if(BEACH_FX.gulls){ for(let i=0;i<3;i++){ const cx=L.FX+fw*(.2+i*.28), cy=95+i*18, r=30+i*12, a=t*(.18+i*.05)+i*2, x=cx+Math.cos(a)*r*1.6, y=cy+Math.sin(a)*r*.35, f=Math.sin(t*(5+i)+i)*2.2, s=.85-i*.12;
      ctx.strokeStyle='rgba(60,40,70,.7)'; ctx.lineWidth=1.1; ctx.beginPath(); ctx.moveTo(x-6*s,y-f*s); ctx.quadraticCurveTo(x-3*s,y-3*s,x,y); ctx.quadraticCurveTo(x+3*s,y-3*s,x+6*s,y-f*s); ctx.stroke(); } }
  // paraglider drifting across now and then
  if(BEACH_FX.glider){ if(!BX.glide){ BX.glideWait-=dt; if(BX.glideWait<=0)BX.glide={x:L.FX-40,y:110+Math.random()*30,ph:Math.random()*6}; }
    if(BX.glide){ const G=BX.glide; G.x+=11*dt; if(G.x>W+40){ BX.glide=null; BX.glideWait=45+Math.random()*40; }
      else { const x=G.x, y=G.y+Math.sin(t*.6+G.ph)*5, tilt=Math.sin(t*.8+G.ph)*.08; ctx.save(); ctx.translate(x,y); ctx.rotate(tilt);
        const cols=['#e8524a','#ffc72c','#2a8ac0','#ffc72c','#e8524a']; for(let i=0;i<5;i++){ ctx.fillStyle=cols[i]; ctx.beginPath(); const a0=Math.PI*1.12+i*Math.PI*.152, a1=a0+Math.PI*.152; ctx.moveTo(Math.cos(a0)*16,Math.sin(a0)*6); ctx.lineTo(Math.cos(a0)*13,Math.sin(a0)*4.2); ctx.lineTo(Math.cos(a1)*13,Math.sin(a1)*4.2); ctx.lineTo(Math.cos(a1)*16,Math.sin(a1)*6); ctx.fill(); }
        ctx.strokeStyle='rgba(60,40,60,.6)'; ctx.lineWidth=.5; ctx.beginPath(); for(const lx of[-14,-7,7,14]){ ctx.moveTo(lx,-2); ctx.lineTo(0,14); } ctx.stroke();
        ctx.fillStyle='#3a2c3a'; ctx.beginPath(); ctx.arc(0,15,1.3,0,TAU); ctx.fill(); ctx.fillRect(-.9,16,1.8,3.2); ctx.restore(); } } }
  // crab on the waterline: scuttles sideways, pauses, waves a claw
  if(BEACH_FX.crab){ const C=BX.crab; if(!C.init){ C.x=L.FX+fw*.55; C.init=true; }
    if(C.stop>0)C.stop-=dt; else { C.x+=C.dir*16*dt; if(Math.random()<dt*.35)C.stop=1+Math.random()*2.5; if(C.x>W-60)C.dir=-1; if(C.x<L.FX+fw*.35)C.dir=1; }
    const y=292+Math.sin(t*.9)*1, walk=C.stop>0?0:Math.sin(t*22)*1, wave=C.stop>0?Math.max(0,Math.sin(t*4))*.6:0;
    ctx.save(); ctx.translate(C.x,y); ctx.fillStyle='rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(0,2,5,1,0,0,TAU); ctx.fill();
    ctx.strokeStyle='#b8402e'; ctx.lineWidth=.8; ctx.beginPath(); for(const sd of[-1,1])for(let k=0;k<3;k++){ ctx.moveTo(sd*2.5,0); ctx.lineTo(sd*(5+k*.6),1.5+(k%2?walk:-walk)*.5); } ctx.stroke();
    ctx.fillStyle='#e0583e'; ctx.beginPath(); ctx.ellipse(0,-.5,4,2.4,0,0,TAU); ctx.fill();
    ctx.save(); ctx.translate(-4,-2); ctx.rotate(-wave); ctx.beginPath(); ctx.ellipse(-1,-1.2,1.6,1.1,-.5,0,TAU); ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.ellipse(4.6,-3,1.6,1.1,.5,0,TAU); ctx.fill();
    ctx.fillStyle='#1a1a1a'; ctx.fillRect(-1.4,-3.6,.7,1.2); ctx.fillRect(.7,-3.6,.7,1.2); ctx.restore(); }
}
