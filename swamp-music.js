'use strict';
// Part of Swamp Defense (swamp.html loads this before its main script). See SWAMP.md.
/* ---- Music (Tyler picked from the theme ideas, Nov 25): "Bayou Stomp" on the title screen, "Moonlight Gator" in the
   shop between waves, quiet during waves. All made in code (banjo/guitar plucks, tuba, washboard, slide lead), so it plays
   offline. Goes through the master volume; Music On/Off is in the Sound panel and the pause menu. MUSIC=false turns it off. ---- */
const MUSIC=true;
const MUS={cur:null,out:null,nextT:0,step:0,ks:{},nb:null};
function musHz(n){ const N={C:-9,'C#':-8,D:-7,'D#':-6,E:-5,F:-4,'F#':-3,G:-2,'G#':-1,A:0,'A#':1,B:2}; const m=n.match(/^([A-G]#?)(\d)$/); return 440*Math.pow(2,(N[m[1]]+(+m[2]-4)*12)/12); }
function musPluck(f,damp){ const k=f.toFixed(1)+'|'+damp; if(MUS.ks[k])return MUS.ks[k]; const sr=AC.sampleRate, N=Math.round(sr/f), len=Math.floor(sr*1.4), b=AC.createBuffer(1,len,sr), y=b.getChannelData(0);
  for(let i=0;i<=N;i++)y[i]=Math.random()*2-1; for(let i=N+1;i<len;i++)y[i]=damp*.5*(y[i-N]+y[i-N-1]); return MUS.ks[k]=b; } // starts at N+1: never reads y[-1] (NaN silences Safari)
function musEnv(g,t,v,a,d){ g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(v,t+a); g.gain.exponentialRampToValueAtTime(.0001,t+a+d); }
const MI={
  pluck(t,n,vol,damp,filt,fq){ const s=AC.createBufferSource(); s.buffer=musPluck(musHz(n),damp); const f=AC.createBiquadFilter(); f.type=filt; f.frequency.value=fq; const g=AC.createGain(); g.gain.value=vol; s.connect(f); f.connect(g); g.connect(MUS.out); s.start(t); s.stop(t+1.3); },
  banjo(t,n,v=.26){ MI.pluck(t,n,v,.992,'highpass',180); }, guitar(t,n,v=.12){ MI.pluck(t,n,v,.997,'lowpass',1800); },
  tuba(t,n,d,v=.35){ const o=AC.createOscillator(); o.type='sawtooth'; o.frequency.value=musHz(n); const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.setValueAtTime(260,t); lp.frequency.linearRampToValueAtTime(520,t+.04); lp.frequency.linearRampToValueAtTime(240,t+d);
    const g=AC.createGain(); musEnv(g,t,v,.03,d); o.connect(lp); lp.connect(g); g.connect(MUS.out); o.start(t); o.stop(t+d+.1); },
  bass(t,n,d,v=.42){ const o=AC.createOscillator(); o.type='triangle'; o.frequency.value=musHz(n); const g=AC.createGain(); musEnv(g,t,v,.01,d); o.connect(g); g.connect(MUS.out); o.start(t); o.stop(t+d+.1); },
  scrape(t,v,len,f){ if(!MUS.nb){ MUS.nb=AC.createBuffer(1,AC.sampleRate,AC.sampleRate); const d=MUS.nb.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1; }
    const s=AC.createBufferSource(); s.buffer=MUS.nb; const b=AC.createBiquadFilter(); b.type='bandpass'; b.frequency.value=f; b.Q.value=.8; const g=AC.createGain(); g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+len); s.connect(b); b.connect(g); g.connect(MUS.out); s.start(t,Math.random()*.5); s.stop(t+len+.02); },
  kick(t,v=.35){ const o=AC.createOscillator(); o.frequency.setValueAtTime(130,t); o.frequency.exponentialRampToValueAtTime(45,t+.12); const g=AC.createGain(); g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+.2); o.connect(g); g.connect(MUS.out); o.start(t); o.stop(t+.22); },
  lead(t,n,d,o){ const osc=AC.createOscillator(); osc.type=o.wave; const f=musHz(n);
    if(o.from){ osc.frequency.setValueAtTime(musHz(o.from),t); osc.frequency.exponentialRampToValueAtTime(f,t+(o.glide||.12)); } else osc.frequency.setValueAtTime(f,t);
    const lfo=AC.createOscillator(), lg=AC.createGain(); lfo.frequency.value=o.vibHz; lg.gain.setValueAtTime(0,t); lg.gain.linearRampToValueAtTime(f*o.vib,t+Math.min(.25,d*.6)); lfo.connect(lg); lg.connect(osc.frequency);
    const bp=AC.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=o.formant; bp.Q.value=o.q; const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=o.lp||3200;
    const g=AC.createGain(), v=o.vol; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(v,t+(o.att||.03)); g.gain.setValueAtTime(v*.85,t+d*.8); g.gain.exponentialRampToValueAtTime(.0001,t+d+(o.rel||.08));
    osc.connect(bp); bp.connect(lp); lp.connect(g); g.connect(MUS.out); osc.start(t); lfo.start(t); osc.stop(t+d+.3); lfo.stop(t+d+.3); },
  cricket(t){ for(let i=0;i<3;i++){ const o=AC.createOscillator(); o.frequency.value=4300+Math.random()*200; const g=AC.createGain(), s=t+i*.06; musEnv(g,s,.012,.01,.035); o.connect(g); g.connect(MUS.out); o.start(s); o.stop(s+.06); } }
};
const mParse=x=>x.trim().split(/\s+/), mDur=(a,i,e)=>{ let k=1; while(a[i+k]==='-')k++; return k*e; };
const MCH={G:['G3','B3','D4','G4','B4'],C:['C4','E4','G4','C5','E4'],D:['D4','F#4','A4','D5','F#4'],E:['E3','G#3','B3','E4'],A:['A3','C#4','E4','A4'],B:['B3','D#4','F#4','B4']};
const SONGS={
  stomp:{bpm:132,swing:0,chords:'G G C G D D G G'.split(' '),br:{G:['G2','D2'],C:['C3','G2'],D:['D3','A2']},
    mel:mParse('D5 - B4 - G4 - B4 D5 E5 - D5 - B4 - - - E5 - G5 - E5 - C5 - D5 - B4 - G4 - - - A4 - D5 - F#5 - E5 D5 C5 - A4 - F#4 - A4 - B4 - D5 - G5 - B4 D5 G5 - - - - - - -'),
    play(s,t,e,bar,ch){ const c=MCH[ch], roll=[0,2,4,1,3,4,2,4]; MI.banjo(t,c[roll[s%8]]);
      if(s%4===0)MI.tuba(t,this.br[ch][(s%8)/4],e*1.7); if(s%2===1)MI.scrape(t,.11,.05,5000); if(s%8===0||s%8===4)MI.kick(t);
      const i=bar*8+s%8, m=this.mel[i]; if(Math.floor(s/64)%2===1&&m!=='-')MI.lead(t,m,mDur(this.mel,i,e)*.92,{wave:'square',formant:1600,q:1.4,vol:.11,vib:.008,vibHz:6}); }},
  moon:{bpm:76,swing:.62,chords:'E E A E B A E B'.split(' '),walk:{E:['E2','G#2','B2','C#3'],A:['A2','C#3','E3','F#3'],B:['B2','D#3','F#3','G#3']},
    mel:mParse('B4 - - - G4 - E4 - - - G4 A4 B4 - - - C#5 - - - A4 - E4 - G4 - E4 - - - - - F#4 - A4 - B4 - D5 - C#5 - B4 - A4 - - - G4 - E4 - D4 - E4 - - - - - B3 - - -'),
    play(s,t,e,bar,ch){ if(s%2===0)MI.bass(t,this.walk[ch][(s%8)/2],e*1.6);
      if(s%4===2)MCH[ch].slice(1).forEach((n,k)=>MI.guitar(t+k*.018,n));
      if(s%2===1)MI.scrape(t,.05,.09,3200); if(s%16===5)MI.cricket(t);
      const i=bar*8+s%8, m=this.mel[i]; if(m!=='-'){ let j=i-1; while(j>=0&&this.mel[j]==='-')j--; const prev=j>=0?this.mel[j]:null;
        MI.lead(t,m,mDur(this.mel,i,e)*.95,{wave:'sawtooth',from:prev&&Math.random()<.6?prev:null,glide:.16,formant:900,q:.9,lp:1800,vol:.16,vib:.018,vibHz:4.5,att:.06,rel:.25}); } }}
};
function musicWant(){ if(!MUSIC||SET.mute||SET.music===false||document.hidden)return null; return phase==='title'?'stomp':phase==='build'?'moon':null; }
function musicStep(){
  if(!AC||AC.state!=='running'){ if(!musicWant()&&MUS.cur)musicStop(); return; }
  const want=musicWant();
  if(want!==MUS.cur){ musicStop(); if(want){ MUS.cur=want; MUS.out=AC.createGain(); MUS.out.gain.setValueAtTime(.0001,AC.currentTime); MUS.out.gain.exponentialRampToValueAtTime(.5,AC.currentTime+.8); MUS.out.connect(masterOut()); MUS.step=0; MUS.nextT=AC.currentTime+.1; } }
  if(!MUS.cur)return; const d=SONGS[MUS.cur], e=60/d.bpm/2;
  if(MUS.nextT<AC.currentTime-.5){ MUS.nextT=AC.currentTime+.05; } // came back from a pause: don't rush to catch up
  while(MUS.nextT<AC.currentTime+.25){ const bar=Math.floor(MUS.step/8)%8, s8=MUS.step%8, sw=s8%2===1&&d.swing?e*(d.swing*2-1):0;
    try{ d.play(MUS.step,MUS.nextT+sw,e,bar,d.chords[bar]); }catch(err){}
    MUS.nextT+=e; MUS.step++; }
}
function musicStop(){ if(MUS.out){ const o=MUS.out; try{ o.gain.cancelScheduledValues(AC.currentTime); o.gain.setTargetAtTime(.0001,AC.currentTime,.15); }catch(e){} setTimeout(()=>{ try{o.disconnect()}catch(e){} },900); } MUS.out=null; MUS.cur=null; }
