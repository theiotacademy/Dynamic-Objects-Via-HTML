'use strict';

const bgCanvas   = document.getElementById('bg');
const bgCtx      = bgCanvas.getContext('2d');
const mainCanvas = document.getElementById('main');
const ctx        = mainCanvas.getContext('2d');
const hint       = document.getElementById('hint');
const overlay    = document.getElementById('overlay');
const replayBtn  = document.getElementById('replayBtn');

let W = 0, H = 0;

const staticBg  = document.createElement('canvas');
const sBgCtx    = staticBg.getContext('2d');
const starLayer = document.createElement('canvas');
const starCtx   = starLayer.getContext('2d');

const STARS = [];
function buildStarLayer() {
  starLayer.width  = W;
  starLayer.height = H;
  starCtx.clearRect(0, 0, W, H);
  STARS.length = 0;
  const count = Math.min(Math.floor(W * H / 2200), 320);
  for (let i = 0; i < count; i++) {
    const x    = Math.random() * W;
    const y    = Math.random() * H * 0.80;
    const r    = Math.random() * 1.8 + 0.3;
    const a    = Math.random() * 0.85 + 0.15;
    const blue = Math.random() < 0.12;
    starCtx.save();
    starCtx.globalAlpha = a;
    starCtx.fillStyle   = blue ? `hsl(${210 + Math.random()*40},70%,88%)` : '#fff';
    starCtx.shadowBlur  = r * 3;
    starCtx.shadowColor = blue ? '#aaddff' : '#ffffff';
    starCtx.beginPath();
    starCtx.arc(x, y, r, 0, 6.2832);
    starCtx.fill();
    starCtx.restore();
    STARS.push({ x, y, r, base: a, phase: Math.random() * 6.2832, speed: Math.random() * 0.9 + 0.3 });
  }
}

let starAlpha = 1;
function drawStars(t) {
  starAlpha = 0.82 + 0.18 * Math.sin(t * 0.4);
  bgCtx.save();
  bgCtx.globalAlpha = starAlpha;
  bgCtx.drawImage(starLayer, 0, 0);
  bgCtx.restore();
}

const shooters = [];
function maybeSpawnShooter() {
  if (Math.random() < 0.0025 && shooters.length < 2) {
    const x = Math.random() * W * 0.55;
    const y = Math.random() * H * 0.30;
    const ang = (Math.random() * 18 + 12) * 0.01745;
    shooters.push({ x, y, vx: Math.cos(ang) * 16, vy: Math.sin(ang) * 16,
      alpha: 1, px: x, py: y });
  }
}
function updateDrawShooters() {
  for (let i = shooters.length - 1; i >= 0; i--) {
    const s = shooters[i];
    s.px = s.x; s.py = s.y;
    s.x += s.vx; s.y += s.vy;
    s.alpha -= 0.025;
    if (s.alpha <= 0) { shooters.splice(i, 1); continue; }
    bgCtx.save();
    bgCtx.globalAlpha = s.alpha;
    bgCtx.strokeStyle = '#fff';
    bgCtx.lineWidth   = 1.8;
    bgCtx.shadowBlur  = 5;
    bgCtx.shadowColor = '#aaddff';
    bgCtx.beginPath();
    bgCtx.moveTo(s.px, s.py);
    bgCtx.lineTo(s.x,  s.y);
    bgCtx.stroke();
    bgCtx.restore();
  }
}

function buildStaticBg() {
  staticBg.width  = W;
  staticBg.height = H;
  sBgCtx.fillStyle = '#8b0000';
  sBgCtx.fillRect(0, 0, W, H);
  const NEB = [
    {x:.18,y:.22,rx:.30,ry:.18,h:255,s:38,l:16,a:.36},
    {x:.76,y:.32,rx:.24,ry:.15,h:205,s:42,l:14,a:.28},
    {x:.50,y:.58,rx:.38,ry:.13,h:228,s:32,l:11,a:.20},
  ];
  for (const n of NEB) {
    const g = sBgCtx.createRadialGradient(W*n.x,H*n.y,0, W*n.x,H*n.y, W*n.rx);
    g.addColorStop(0,   `hsla(${n.h},${n.s}%,${n.l}%,${n.a})`);
    g.addColorStop(.55, `hsla(${n.h},${n.s}%,${n.l*.55}%,${n.a*.45})`);
    g.addColorStop(1,   'transparent');
    sBgCtx.save();
    sBgCtx.fillStyle = g;
    sBgCtx.scale(1, n.ry/n.rx);
    sBgCtx.beginPath();
    sBgCtx.arc(W*n.x, H*n.y/(n.ry/n.rx), W*n.rx, 0, 6.2832);
    sBgCtx.fill();
    sBgCtx.restore();
  }
}

const moonOff = document.createElement('canvas');
function buildMoon() {
  const mr = Math.min(W, H) * 0.058;
  const sz = Math.ceil(mr * 10);
  moonOff.width = moonOff.height = sz;
  const mc = moonOff.getContext('2d');
  const cx = sz / 2, cy = sz / 2;
  const halo = mc.createRadialGradient(cx,cy,mr*.9, cx,cy,mr*4.4);
  halo.addColorStop(0,   'rgba(255,228,110,.20)');
  halo.addColorStop(.45, 'rgba(255,195,70,.07)');
  halo.addColorStop(1,   'transparent');
  mc.fillStyle = halo;
  mc.beginPath(); mc.arc(cx,cy,mr*4.4,0,6.2832); mc.fill();
  const mg = mc.createRadialGradient(cx-mr*.32,cy-mr*.32,mr*.04, cx,cy,mr);
  mg.addColorStop(0,   '#fffde6');
  mg.addColorStop(.38, '#f5d868');
  mg.addColorStop(.72, '#e09e28');
  mg.addColorStop(1,   '#a86808');
  mc.save();
  mc.shadowBlur  = 28; mc.shadowColor = 'rgba(255,215,70,.65)';
  mc.fillStyle   = mg;
  mc.beginPath(); mc.arc(cx,cy,mr,0,6.2832); mc.fill();
  const CR = [{ox:.26,oy:.14,r:.19},{ox:-.31,oy:.28,r:.13},{ox:.09,oy:-.31,r:.10},{ox:-.16,oy:-.09,r:.07}];
  for (const c of CR) {
    const ccx=cx+c.ox*mr, ccy=cy+c.oy*mr, cr=c.r*mr;
    const cg = mc.createRadialGradient(ccx-cr*.2,ccy-cr*.2,0, ccx,ccy,cr);
    cg.addColorStop(0,  'rgba(110,60,0,.38)');
    cg.addColorStop(.6, 'rgba(90,48,0,.20)');
    cg.addColorStop(1,  'transparent');
    mc.fillStyle = cg;
    mc.beginPath(); mc.arc(ccx,ccy,cr,0,6.2832); mc.fill();
  }
  const ls = mc.createRadialGradient(cx+mr*.42,cy+mr*.32,0, cx,cy,mr);
  ls.addColorStop(.52,'transparent');
  ls.addColorStop(1,  'rgba(0,0,22,.48)');
  mc.fillStyle = ls;
  mc.beginPath(); mc.arc(cx,cy,mr,0,6.2832); mc.fill();
  mc.restore();
}

function drawMoon(t) {
  const mr  = Math.min(W,H)*.058;
  const sz  = moonOff.width;
  const mx  = W*.82, my = H*.13;
  const pulse = 1 + .04*Math.sin(t*.55);
  bgCtx.save();
  bgCtx.globalAlpha = 1;
  bgCtx.drawImage(moonOff, mx-sz/2*pulse, my-sz/2*pulse, sz*pulse, sz*pulse);
  bgCtx.restore();
}

function drawGodRays(t) {
  const cx = W*.82, cy = H*.13;
  bgCtx.save();
  bgCtx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 6; i++) {
    const ang   = (i/6)*6.2832 + t*.035;
    const pulse = .022 + .012*Math.sin(t*.65+i);
    const len   = Math.min(W,H)*(.52 + .09*Math.sin(t*.28+i*1.4));
    const ex    = cx+Math.cos(ang)*len, ey = cy+Math.sin(ang)*len;
    const g     = bgCtx.createLinearGradient(cx,cy,ex,ey);
    g.addColorStop(0,   `rgba(255,215,90,${pulse})`);
    g.addColorStop(.45, `rgba(255,170,50,${pulse*.35})`);
    g.addColorStop(1,   'transparent');
    bgCtx.fillStyle = g;
    bgCtx.beginPath();
    bgCtx.moveTo(cx,cy);
    const sp = .055;
    bgCtx.lineTo(cx+Math.cos(ang-sp)*len, cy+Math.sin(ang-sp)*len);
    bgCtx.lineTo(cx+Math.cos(ang+sp)*len, cy+Math.sin(ang+sp)*len);
    bgCtx.closePath();
    bgCtx.fill();
  }
  bgCtx.restore();
}

const groundOff = document.createElement('canvas');
function buildGround() {
  groundOff.width  = W;
  groundOff.height = Math.ceil(H*.20);
  const gc = groundOff.getContext('2d');
  const gh = groundOff.height;
  const gg = gc.createLinearGradient(0,0,0,gh);
  gg.addColorStop(0,   'rgba(18,5,0,0)');
  gg.addColorStop(.18, '#1c0900');
  gg.addColorStop(1,   '#080200');
  gc.fillStyle = gg;
  gc.fillRect(0,0,W,gh);
  const eg = gc.createLinearGradient(0,0,W,0);
  eg.addColorStop(0,   'transparent');
  eg.addColorStop(.18, 'rgba(255,95,18,.22)');
  eg.addColorStop(.50, 'rgba(255,195,55,.52)');
  eg.addColorStop(.82, 'rgba(255,95,18,.22)');
  eg.addColorStop(1,   'transparent');
  gc.save();
  gc.shadowBlur  = 18; gc.shadowColor = 'rgba(255,130,25,.55)';
  gc.fillStyle   = eg;
  gc.fillRect(0,0,W,3);
  gc.restore();
}
function drawGround() {
  bgCtx.drawImage(groundOff, 0, H*.80);
}

const DIYA_PHASES = [];
const diyaBodyOff = document.createElement('canvas');
function buildDiyaBodies() {
  const count   = Math.max(5, Math.floor(W/125));
  const spacing = W/(count+1);
  const gy      = H*.915;
  DIYA_PHASES.length = 0;
  for (let i=0;i<count;i++) DIYA_PHASES.push(Math.random()*6.2832);

  diyaBodyOff.width  = W;
  diyaBodyOff.height = 40;
  const dc = diyaBodyOff.getContext('2d');
  dc.clearRect(0,0,W,40);
  for (let i=0;i<count;i++) {
    const x = spacing*(i+1);
    const db = dc.createRadialGradient(x,16,1,x,22,18);
    db.addColorStop(0,  '#e07040');
    db.addColorStop(.5, '#a03010');
    db.addColorStop(1,  '#601800');
    dc.fillStyle = db;
    dc.beginPath(); dc.ellipse(x,22,18,10,0,0,Math.PI); dc.fill();
    dc.strokeStyle = 'rgba(255,175,75,.45)';
    dc.lineWidth   = 1;
    dc.beginPath(); dc.ellipse(x,22,18,10,0,Math.PI,6.2832); dc.stroke();
    dc.strokeStyle = '#8b5e2a'; dc.lineWidth = 1.5;
    dc.beginPath(); dc.moveTo(x,12); dc.lineTo(x+2,6); dc.stroke();
  }
}

function drawPankhPairs(t) {
  if (!pankhImg.complete || !pankhImg.naturalWidth) return;
  const COUNT   = 5;
  const spacing = W / (COUNT + 1);
  const pw = 90, ph = 135;
  const baseY   = H * 0.97;

  for (let i = 0; i < COUNT; i++) {
    const x   = spacing * (i + 1);
    const bob = Math.sin(t * 1.5 + i * 1.1) * 3;
    const y   = baseY + bob;

    ctx.save();
    ctx.translate(x - pw * 0, y);
    ctx.scale(-1, 1);
    ctx.rotate(0.4);
    ctx.drawImage(pankhImg, -pw / 2, -ph, pw, ph);
    ctx.restore();

    ctx.save();
    ctx.translate(x + pw * 0, y);
    ctx.rotate(0.4);
    ctx.drawImage(pankhImg, -pw / 2, -ph, pw, ph);
    ctx.restore();
  }
}

function drawDiyas(t) {
  const count   = DIYA_PHASES.length;
  const spacing = W/(count+1);
  const gy      = H*.915;
  ctx.drawImage(diyaBodyOff, 0, gy-22);
  for (let i=0;i<count;i++) {
    const x  = spacing*(i+1);
    const ph = DIYA_PHASES[i];
    const fl = .72 + .28*Math.sin(t*6.8+ph)*Math.cos(t*4.3+ph*1.6);
    const fx = x+2+Math.sin(t*7.2+ph)*1.4;
    const fy = gy-16;
    const fh = 13*fl;
    const glow = ctx.createRadialGradient(x,gy-8,0, x,gy-8,48*fl);
    glow.addColorStop(0,   `rgba(255,155,25,${.20*fl})`);
    glow.addColorStop(.55, `rgba(255,90,8,${.08*fl})`);
    glow.addColorStop(1,   'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.ellipse(x,gy,48*fl,24*fl,0,0,6.2832); ctx.fill();
    const fg = ctx.createRadialGradient(fx,fy,0, fx,fy-fh*.28,fh*1.05);
    fg.addColorStop(0,   `rgba(255,255,195,${fl})`);
    fg.addColorStop(.22, `rgba(255,215,55,${.88*fl})`);
    fg.addColorStop(.58, `rgba(255,95,8,${.65*fl})`);
    fg.addColorStop(1,   'transparent');
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.ellipse(fx,fy-fh*.32,4.5*fl,fh*.68,0,0,6.2832); ctx.fill();
    ctx.fillStyle = `rgba(255,255,235,${.92*fl})`;
    ctx.beginPath(); ctx.ellipse(fx,fy-fh*.18,1.8*fl,fh*.26,0,0,6.2832); ctx.fill();
  }
}

function resize() {
  W = mainCanvas.width = bgCanvas.width = window.innerWidth;
  H = mainCanvas.height= bgCanvas.height= window.innerHeight;
  buildStaticBg();
  buildStarLayer();
  buildMoon();
  buildGround();
  buildDiyaBodies();
}
window.addEventListener('resize', resize);


const handiImg  = new Image(); handiImg.src  = 'handi.png';
const brokenImg = new Image(); brokenImg.src = 'broken_handi.png';
const pankhImg  = new Image(); pankhImg.src  = 'pankh.png';

const rope = {
  ax:0, ay:0, len:0,
  angle:-.04, av:.004, damp:.9955, g:.0016,
  cut:false, cAlpha:1, cx:0, cy:0, cvx:0, cvy:0,
  segs:12,
  init() {
    this.ax=W*.5; this.ay=0; this.len=H*.28;
    this.angle=-.04; this.av=.004;
    this.cut=false; this.cAlpha=1;
  },
  update() {
    if (this.cut) {
      this.cvy+=.5; this.cx+=this.cvx; this.cy+=this.cvy; this.cAlpha-=.038;
      return;
    }
    this.av += -this.g*Math.sin(this.angle);
    this.av *= this.damp;
    this.angle += this.av;
  },
  pos() {
    return { x: this.ax+Math.sin(this.angle)*this.len,
             y: this.ay+Math.cos(this.angle)*this.len };
  },
  draw() {
    if (this.cut) {
      if (this.cAlpha<=0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0,this.cAlpha);
      ctx.strokeStyle = '#c8903a'; ctx.lineWidth=5; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(this.ax,this.ay); ctx.lineTo(this.cx,this.cy); ctx.stroke();
      ctx.restore(); return;
    }
    const p = this.pos();
    ctx.save();
    ctx.strokeStyle='#c8903a'; ctx.lineWidth=5; ctx.lineCap='round';
    ctx.beginPath();
    for (let i=0;i<=this.segs;i++) {
      const t=i/this.segs;
      const sag=Math.sin(t*Math.PI)*7*Math.abs(this.angle);
      const rx=this.ax+(p.x-this.ax)*t+Math.cos(this.angle)*sag;
      const ry=this.ay+(p.y-this.ay)*t+sag*.45;
      i===0?ctx.moveTo(rx,ry):ctx.lineTo(rx,ry);
    }
    ctx.stroke();
    ctx.strokeStyle='rgba(255,195,90,.22)'; ctx.lineWidth=2;
    ctx.beginPath();
    for (let i=0;i<=this.segs;i++) {
      const t=i/this.segs;
      const sag=Math.sin(t*Math.PI)*7*Math.abs(this.angle);
      const rx=this.ax+(p.x-this.ax)*t+Math.cos(this.angle)*sag+1.5;
      const ry=this.ay+(p.y-this.ay)*t+sag*.45;
      i===0?ctx.moveTo(rx,ry):ctx.lineTo(rx,ry);
    }
    ctx.stroke();
    ctx.restore();
  }
};

const HS = { active:false, t:0, dur:0.9, px:0, py:0 };

function startBreak() {
  const p = rope.pos();
  HS.active = true; HS.t = 0;
  HS.px = p.x; HS.py = p.y;
  FRAGS.length = 0;
}

const FRAGS = [];

function buildFragments() {
  FRAGS.length = 0;
  const iw = Math.min(W*.72,520), ih = iw;
  const cols = 4, rows = 4;
  const fw = iw/cols, fh = ih/rows;

  for (let r=0; r<rows; r++) {
    for (let c=0; c<cols; c++) {
      const clipX = c*fw,  clipY = r*fh;
      const pcx = -iw/2 + clipX + fw/2;
      const pcy = -ih*.15 + clipY + fh/2;
      /* explosion velocity — outward from centre + random */
      const angle = Math.atan2(pcy + ih*.15 - ih*.5, pcx);
      const spd   = 2.5 + Math.random()*3.5;
      FRAGS.push({
        sx: clipX, sy: clipY, sw: fw, sh: fh,
        ox: pcx, oy: pcy,
        /* physics */
        vx: Math.cos(angle)*spd + (Math.random()-.5)*2,
        vy: Math.sin(angle)*spd - Math.random()*4,
        av: (Math.random()-.5)*.18,
        angle: 0,
        alpha: 1
      });
    }
  }
}

function drawHandi() {
  const iw = Math.min(W*.72,520), ih=iw;

  if (!HS.active) {
    const p = rope.pos();
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(rope.angle);
    if (handiImg.complete) ctx.drawImage(handiImg,-iw/2,-ih*.15,iw,ih);
    ctx.restore();
    return;
  }

  if (state === 'broken') return;

  const px = HS.px, py = HS.py;
  const k = Math.min(HS.t / HS.dur, 1);

  if (!handiImg.complete) return;

  if (FRAGS.length === 0) buildFragments();

  const progress = k;

  for (const f of FRAGS) {
    /* integrate physics proportional to progress */
    const t = progress;
    const x = px + f.ox + f.vx * t * 60;
    const y = py + f.oy + f.vy * t * 60 + 0.5 * 18 * t * t * 60;
    const rot = f.angle + f.av * t * 60;
    const alpha = Math.max(0, 1 - progress * 1.4);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.drawImage(handiImg,
      f.sx, f.sy, f.sw, f.sh,
      -f.sw/2, -f.sh/2, f.sw, f.sh
    );
    ctx.restore();
  }
}

const petals=[];
const PCOLS=['#ff6b9d','#ff9933','#ffcc44','#ff4466','#ff8844','#ffaacc','#dd44ff','#ff6644'];
function initPetals() {
  petals.length=0;
  const n=Math.min(Math.floor(W/60),22);
  for (let i=0;i<n;i++) petals.push({
    x:Math.random()*W, y:Math.random()*H,
    vy:Math.random()*.7+.25, angle:Math.random()*6.2832,
    av:(Math.random()-.5)*.038, w:Math.random()*9+4, h:Math.random()*5+2.5,
    col:PCOLS[i%PCOLS.length], alpha:Math.random()*.45+.28,
    wob:Math.random()*6.2832, ws:Math.random()*1.8+.8
  });
}
function updateDrawPetals(t,dt) {
  for (const p of petals) {
    p.wob+=p.ws*dt; p.x+=Math.sin(p.wob)*.55; p.y+=p.vy; p.angle+=p.av;
    if (p.y>H+16) { p.y=-16; p.x=Math.random()*W; }
    if (p.x<-16) p.x=W+16; if (p.x>W+16) p.x=-16;
    ctx.save();
    ctx.globalAlpha=p.alpha; ctx.translate(p.x,p.y); ctx.rotate(p.angle);
    ctx.fillStyle=p.col;
    ctx.beginPath(); ctx.ellipse(0,0,p.w,p.h,0,0,6.2832); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.lineWidth=.5;
    ctx.beginPath(); ctx.moveTo(-p.w*.65,0); ctx.lineTo(p.w*.65,0); ctx.stroke();
    ctx.restore();
  }
}

const FW_MAX   = 4000;
const fw_x     = new Float32Array(FW_MAX);
const fw_y     = new Float32Array(FW_MAX);
const fw_vx    = new Float32Array(FW_MAX);
const fw_vy    = new Float32Array(FW_MAX);
const fw_alpha = new Float32Array(FW_MAX);
const fw_r     = new Float32Array(FW_MAX);
const fw_hue   = new Float32Array(FW_MAX);
const fw_decay = new Float32Array(FW_MAX);
const fw_type  = new Uint8Array(FW_MAX);
const fw_pvx   = new Float32Array(FW_MAX);
const fw_pvy   = new Float32Array(FW_MAX);
let   fw_count = 0;

function fwSpawn(x,y,hue,spd,type) {
  if (fw_count>=FW_MAX) return;
  const i=fw_count++;
  const a=Math.random()*6.2832;
  const s=spd*(0.55+Math.random()*.9);
  fw_x[i]=x; fw_y[i]=y;
  fw_vx[i]=Math.cos(a)*s; fw_vy[i]=Math.sin(a)*s;
  fw_pvx[i]=fw_vx[i]; fw_pvy[i]=fw_vy[i];
  fw_alpha[i]=1;
  fw_r[i]=type===2?Math.random()*1.8+.4:Math.random()*3+.8;
  fw_hue[i]=hue;
  fw_decay[i]=type===2?.024+Math.random()*.018:.011+Math.random()*.009;
  fw_type[i]=type;
}

function fwExplode(x,y,hue) {
  const h2=(hue+180)%360;
  for (let i=0;i<100;i++) fwSpawn(x,y,hue,5.2,0);
  for (let i=0;i<50;i++)  fwSpawn(x,y,hue,6.8,1);
  for (let i=0;i<65;i++)  fwSpawn(x,y,hue,3.2,2);
  for (let i=0;i<30;i++)  fwSpawn(x,y,h2,3.8,0);
  for (let i=0;i<18;i++)  fwSpawn(x,y,55,2.2,0);
}

/* rockets as simple objects (few at a time) */
const rockets=[];
class Rocket {
  constructor() {
    this.x=W*(.1+Math.random()*.8); this.y=H;
    this.tx=W*(.1+Math.random()*.8); this.ty=H*(.05+Math.random()*.44);
    this.hue=Math.random()*360;
    const dx=this.tx-this.x, dy=this.ty-this.y;
    const d=Math.sqrt(dx*dx+dy*dy), sp=13+Math.random()*5;
    this.vx=dx/d*sp; this.vy=dy/d*sp;
    this.exploded=false; this.trail=[];
  }
  update() {
    this.trail.push({x:this.x,y:this.y});
    if (this.trail.length>14) this.trail.shift();
    this.x+=this.vx; this.y+=this.vy; this.vy+=.13;
    if (this.vy>=0 && !this.exploded) { this.exploded=true; fwExplode(this.x,this.y,this.hue); }
  }
  draw() {
    if (this.exploded) return;
    ctx.save(); ctx.lineCap='round';
    for (let i=0;i<this.trail.length-1;i++) {
      const a=(i/this.trail.length)*.8;
      ctx.globalAlpha=a;
      ctx.strokeStyle=`hsl(${this.hue},100%,70%)`;
      ctx.lineWidth=2.5*(i/this.trail.length);
      ctx.beginPath();
      ctx.moveTo(this.trail[i].x,this.trail[i].y);
      ctx.lineTo(this.trail[i+1].x,this.trail[i+1].y);
      ctx.stroke();
    }
    ctx.globalAlpha=1; ctx.fillStyle='#fff';
    ctx.shadowBlur=18; ctx.shadowColor=`hsl(${this.hue},100%,72%)`;
    ctx.beginPath(); ctx.arc(this.x,this.y,3,0,6.2832); ctx.fill();
    ctx.restore();
  }
}

let fwActive=false, fwStop=0;
function startFireworks() {
  fwActive=true; fwStop=performance.now()+13000;
  for (let i=0;i<5;i++) setTimeout(()=>rockets.push(new Rocket()),i*170);
}

function updateDrawFireworks(now,dt) {
  if (!fwActive) return;
  if (now>fwStop) { fwActive=false; rockets.length=0; fw_count=0; return; }
  if (Math.random()<.05) rockets.push(new Rocket());

  for (let i=rockets.length-1;i>=0;i--) {
    rockets[i].update(); rockets[i].draw();
    if (rockets[i].exploded && rockets[i].trail.length===0) rockets.splice(i,1);
  }

  let alive=0;
  for (let i=0;i<fw_count;i++) {
    fw_pvx[i]=fw_vx[i]; fw_pvy[i]=fw_vy[i];
    fw_vx[i]*=(fw_type[i]===1?.968:.986);
    fw_vy[i]=fw_vy[i]*(fw_type[i]===1?.968:.986)+.062;
    fw_x[i]+=fw_vx[i]; fw_y[i]+=fw_vy[i];
    fw_alpha[i]-=fw_decay[i];
    if (fw_alpha[i]>0) {
      if (alive!==i) {
        fw_x[alive]=fw_x[i]; fw_y[alive]=fw_y[i];
        fw_vx[alive]=fw_vx[i]; fw_vy[alive]=fw_vy[i];
        fw_pvx[alive]=fw_pvx[i]; fw_pvy[alive]=fw_pvy[i];
        fw_alpha[alive]=fw_alpha[i]; fw_r[alive]=fw_r[i];
        fw_hue[alive]=fw_hue[i]; fw_decay[alive]=fw_decay[i];
        fw_type[alive]=fw_type[i];
      }
      alive++;
    }
  }
  fw_count=alive;

  for (let i=0;i<fw_count;i++) {
    if (fw_type[i]!==0) continue;
    const h=fw_hue[i], a=fw_alpha[i];
    ctx.save();
    ctx.globalAlpha=a;
    ctx.fillStyle=`hsl(${h},95%,65%)`;
    ctx.shadowBlur=10; ctx.shadowColor=`hsl(${h},100%,68%)`;
    ctx.beginPath(); ctx.arc(fw_x[i],fw_y[i],fw_r[i],0,6.2832); ctx.fill();
    ctx.restore();
  }
  /* streaks */
  ctx.save(); ctx.lineCap='round';
  for (let i=0;i<fw_count;i++) {
    if (fw_type[i]!==1) continue;
    const h=fw_hue[i], a=fw_alpha[i];
    ctx.globalAlpha=a;
    ctx.strokeStyle=`hsl(${h},100%,72%)`;
    ctx.lineWidth=fw_r[i]*.7;
    ctx.beginPath();
    ctx.moveTo(fw_x[i],fw_y[i]);
    ctx.lineTo(fw_x[i]-fw_pvx[i]*4,fw_y[i]-fw_pvy[i]*4);
    ctx.stroke();
  }
  ctx.restore();
  /* glitter */
  for (let i=0;i<fw_count;i++) {
    if (fw_type[i]!==2) continue;
    ctx.save();
    ctx.globalAlpha=fw_alpha[i];
    ctx.fillStyle=`hsl(${fw_hue[i]},100%,82%)`;
    ctx.beginPath(); ctx.arc(fw_x[i],fw_y[i],fw_r[i],0,6.2832); ctx.fill();
    ctx.restore();
  }
}

/* ═══════════════════════════════════════════
   MAIN LOOP
═══════════════════════════════════════════ */
let lastTime=0, state='idle';

function loop(now) {
  requestAnimationFrame(loop);
  const dt=Math.min((now-lastTime)/1000,.033); /* cap at 33ms = 30fps floor */
  lastTime=now;
  const t=now/1000;

  /* BG canvas */
  bgCtx.clearRect(0,0,W,H);
  bgCtx.drawImage(staticBg,0,0);   /* sky + nebula — one blit */
  drawGodRays(t);
  drawStars(t);
  maybeSpawnShooter();
  updateDrawShooters();
  drawMoon(t);
  drawGround();

  /* MAIN canvas — motion blur */
  ctx.fillStyle='rgba(0,0,0,.32)';
  ctx.fillRect(0,0,W,H);

  updateDrawFireworks(now,dt);
  updateDrawPetals(t,dt);
  if (state==='idle' || state==='breaking') { rope.update(); rope.draw(); }
  if (HS.active) HS.t += dt;
  drawHandi();
  drawPankhPairs(t);
}

/* ═══════════════════════════════════════════
   INTERACTION
═══════════════════════════════════════════ */
function doBreak() {
  if (state!=='idle') return;
  state='breaking';
  hint.classList.add('hide');
  startBreak();
  setTimeout(()=>{
    state='broken';
    overlay.classList.remove('hidden');
    requestAnimationFrame(()=>overlay.classList.add('show'));
    startFireworks();
  }, HS.dur * 1000);
}

function doReplay() {
  state='idle';
  fwActive=false; rockets.length=0; fw_count=0;
  HS.active=false; HS.t=0;
  rope.init();
  overlay.classList.remove('show');
  setTimeout(()=>overlay.classList.add('hidden'),500);
  hint.classList.remove('hide');
  ctx.clearRect(0,0,W,H);
}

mainCanvas.addEventListener('click',(e)=>{
  if (state!=='idle') return;
  const p=rope.pos();
  const iw=Math.min(W*.72,520), ih=iw;
  const dx=e.clientX-p.x, dy=e.clientY-p.y;
  if (Math.abs(dx)<iw/2 && dy>-ih*.15 && dy<ih*.85) doBreak();
});
replayBtn.addEventListener('click',doReplay);

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
resize();
rope.init();
initPetals();
/* black fill taaki red body na dikhe */
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, W, H);
requestAnimationFrame(loop);
