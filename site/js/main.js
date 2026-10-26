(()=>{
const d=document,root=d.documentElement;root.classList.add('js');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
const big=matchMedia('(min-width: 821px)').matches;
const nav=d.getElementById('nav');const onS=()=>nav.classList.toggle('scrolled',scrollY>10);addEventListener('scroll',onS,{passive:true});onS();

/* ---------- floating parallax decor (desktop only) ---------- */
const orbSets=[[['orb',90,'8%','-30px'],['orb ring',160,'auto','6%',1]],[['orb glass',120,'14%','auto',1],['orb',46,'70%','4%']],[['orb ring',220,'-60px','auto',1],['orb',60,'auto','3%']],[['orb',110,'20%','auto',1],['orb glass',80,'72%','6%']],[['orb',140,'10%','8%'],['orb ring',120,'60%','auto',1]]];
if(big&&!reduce)d.querySelectorAll('[data-orbs]').forEach((sec,i)=>{(orbSets[i%orbSets.length]).forEach(([c,s,t,l,r])=>{const o=d.createElement('div');o.className=c;o.setAttribute('aria-hidden','true');o.style.width=o.style.height=s+'px';o.style.top=t;r?o.style.right=l==='auto'?'5%':l:o.style.left=l;o.dataset.speed=(.15+Math.random()*.35).toFixed(2);sec.prepend(o)})});

/* ---------- reveals: GSAP+ScrollTrigger if present, else IntersectionObserver ---------- */
const reveals=[...d.querySelectorAll('.reveal')];
function ioReveal(){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});reveals.forEach((el,i)=>{el.style.transitionDelay=(i%4)*70+'ms';io.observe(el)})}
function boot(){
 const G=window.gsap,ST=window.ScrollTrigger;
 if(reduce||!G||!ST){reveals.forEach(e=>e.classList.add('in'));if(!reduce&&!G)ioReveal();return}
 G.registerPlugin(ST);
 // smooth scroll (desktop with fine pointer only; native on touch)
 if(window.Lenis&&fine){const lenis=new Lenis({lerp:.1,smoothWheel:true});lenis.on('scroll',ST.update);G.ticker.add(t=>lenis.raf(t*1000));G.ticker.lagSmoothing(0);
  d.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=d.querySelector(a.getAttribute('href'));if(t){e.preventDefault();lenis.scrollTo(t,{offset:-70})}}))}
 reveals.forEach(el=>{el.classList.add('in');el.style.transition='none'});
 ST.batch(reveals,{start:'top 90%',once:true,onEnter:b=>G.fromTo(b,{autoAlpha:0,y:36,rotateX:big?8:0,transformPerspective:900},{autoAlpha:1,y:0,rotateX:0,duration:1.1,ease:'expo.out',stagger:.08,clearProps:'transform'})});
 G.set(reveals.filter(e=>e.getBoundingClientRect().top>innerHeight*.9),{autoAlpha:0});
 if(big)d.querySelectorAll('.orb').forEach(o=>G.to(o,{yPercent:-120*o.dataset.speed*2,rotate:'+=25',ease:'none',scrollTrigger:{trigger:o.parentElement,start:'top bottom',end:'bottom top',scrub:true}}));
 if(big)G.to('.hero-in',{yPercent:-12,opacity:.35,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
}
let tries=0;(function wait(){if(window.gsap&&window.ScrollTrigger||tries++>20||reduce)boot();else setTimeout(wait,60)})();

/* ---------- work cards: lazy video, hover preview, play button, 3D tilt ---------- */
const lz=v=>{if(!v.src&&v.dataset.src)v.src=v.dataset.src};
const lio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.preload='metadata';lz(e.target);lio.unobserve(e.target)}}),{rootMargin:'200px'});
const pio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting&&!e.target.paused)e.target.pause()}));
d.querySelectorAll('.film').forEach(f=>{const v=f.querySelector('video'),b=f.querySelector('.play');lio.observe(v);pio.observe(v);
 if(fine&&!reduce){
  f.addEventListener('mouseenter',()=>{if(f.classList.contains('playing'))return;lz(v);v.muted=true;v.play().catch(()=>{})});
  f.addEventListener('mouseleave',()=>{if(!f.classList.contains('playing'))v.pause();f.style.transform=''});
  f.addEventListener('pointermove',e=>{if(f.classList.contains('playing'))return;const r=f.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
   f.style.setProperty('--mx',x*100+'%');f.style.setProperty('--my',y*100+'%');f.style.transform=`rotateX(${(.5-y)*6}deg) rotateY(${(x-.5)*8}deg) translateZ(0)`});
 }
 b&&b.addEventListener('click',()=>{d.querySelectorAll('.film.playing video').forEach(o=>{if(o!==v){o.pause();o.controls=false;o.closest('.film').classList.remove('playing')}});lz(v);f.style.transform='';v.muted=false;v.loop=false;v.controls=true;v.currentTime=0;f.classList.add('playing');v.play().catch(()=>{})});
});

/* ---------- three.js hero (desktop + motion OK; mobile keeps CSS glass fallback) ---------- */
if(reduce||!big)return;
const load=()=>Promise.all([import('three'),import('three/addons/environments/RoomEnvironment.js')]).then(([T,E])=>init(T,E.RoomEnvironment)).catch(err=>console.warn('3D hero skipped',err));
('requestIdleCallback' in window)?requestIdleCallback(load,{timeout:1200}):setTimeout(load,500);
function init(T,RoomEnvironment){
 const c=d.getElementById('gl'),st=d.getElementById('stage');
 const r=new T.WebGLRenderer({canvas:c,antialias:true,alpha:true,powerPreference:'high-performance'});
 r.setPixelRatio(Math.min(devicePixelRatio,1.5));r.toneMapping=T.ACESFilmicToneMapping;r.outputColorSpace=T.SRGBColorSpace;
 const sc=new T.Scene(),cam=new T.PerspectiveCamera(32,1,.1,100);cam.position.set(0,0,11);
 const pm=new T.PMREMGenerator(r);sc.environment=pm.fromScene(new RoomEnvironment(),.04).texture;
 const BLUE=0x2F6BFF;
 const glass=new T.MeshPhysicalMaterial({color:0xffffff,roughness:.06,transmission:1,thickness:.8,ior:1.45,clearcoat:1,clearcoatRoughness:.05,attenuationColor:new T.Color(0xbcd0ff),attenuationDistance:2.5,iridescence:.25});
 const pearl=new T.MeshPhysicalMaterial({color:0xdfe8ff,roughness:.08,metalness:0,clearcoat:1,clearcoatRoughness:.04,sheen:.5,sheenColor:new T.Color(0x9fbcff)});
 const blueGlass=new T.MeshPhysicalMaterial({color:BLUE,roughness:.12,metalness:.05,clearcoat:1,emissive:0x0a2a9a,emissiveIntensity:.15});
 const rr=(w,h,rad,dep)=>{const s=new T.Shape();s.moveTo(-w/2+rad,-h/2);s.lineTo(w/2-rad,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+rad);s.lineTo(w/2,h/2-rad);s.quadraticCurveTo(w/2,h/2,w/2-rad,h/2);s.lineTo(-w/2+rad,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-rad);s.lineTo(-w/2,-h/2+rad);s.quadraticCurveTo(-w/2,-h/2,-w/2+rad,-h/2);const g=new T.ExtrudeGeometry(s,{depth:dep,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,bevelSegments:5,curveSegments:10});g.center();return g};
 const g=new T.Group();sc.add(g);
 // main video frame (glass slab) with UI + play glyph
 const frame=new T.Mesh(rr(4,2.5,.26,.14),glass);g.add(frame);
 const ui=new T.Group();ui.position.z=.13;frame.add(ui);
 const flat=(w,h,col,o,x,y,z=0)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:col,transparent:true,opacity:o}));m.position.set(x,y,z);ui.add(m);return m};
 flat(3.6,2.1,0xeef3ff,.55,0,0,-.01);flat(1.7,.22,BLUE,.95,-.75,.62);flat(1.2,.1,0x0b1020,.25,-1,.32);flat(2.4,.6,BLUE,.12,-.3,-.45);
 [-1.68,-1.53,-1.38].forEach(x=>flat(.08,.08,0x0b1020,.3,x,1.02));
 const tri=new T.Shape();tri.moveTo(-.16,-.2);tri.lineTo(.24,0);tri.lineTo(-.16,.2);
 const play=new T.Mesh(new T.ShapeGeometry(tri),new T.MeshBasicMaterial({color:0xffffff}));const pc=new T.Mesh(new T.CircleGeometry(.36,48),new T.MeshBasicMaterial({color:BLUE}));pc.position.set(1.15,-.45,.01);play.position.set(1.17,-.45,.02);ui.add(pc,play);
 // progress bar that animates
 const prog=flat(.01,.05,BLUE,1,-1.55,-.98);prog.geometry.translate(.005,0,0);flat(3.1,.05,0x0b1020,.12,0,-.98,-.001);
 // phone (9:16) frame behind-left
 const phone=new T.Mesh(rr(1.1,2.1,.2,.12),pearl);phone.position.set(-2.3,-.55,-1);phone.rotation.set(.1,.45,-.08);g.add(phone);
 const ps=new T.Mesh(new T.PlaneGeometry(.9,1.85),new T.MeshBasicMaterial({color:BLUE,transparent:true,opacity:.22}));ps.position.z=.12;phone.add(ps);
 // lens ring + spheres
 const ring=new T.Mesh(new T.TorusGeometry(.75,.17,48,128),blueGlass);ring.position.set(1.95,-1.2,.9);g.add(ring);
 const spheres=[[ -1.7,1.45,.6,.26],[2.35,1.35,-.6,.18],[.4,-1.75,1.2,.14]].map(([x,y,z,s])=>{const m=new T.Mesh(new T.SphereGeometry(s,32,32),pearl);m.position.set(x,y,z);m.userData.y=y;g.add(m);return m});
 sc.add(new T.AmbientLight(0xffffff,.5));const l1=new T.DirectionalLight(0xffffff,2);l1.position.set(3,5,6);sc.add(l1);const l2=new T.PointLight(BLUE,25,20);l2.position.set(-3,-2,4);sc.add(l2);
 const size=()=>{const b=st.getBoundingClientRect();r.setSize(b.width,b.height,false);cam.aspect=b.width/b.height;cam.updateProjectionMatrix()};size();addEventListener('resize',size);
 let mx=0,my=0,tx=0,ty=0,vis=true,run=true;addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
 new IntersectionObserver(([e])=>{vis=e.isIntersecting}).observe(st);d.addEventListener('visibilitychange',()=>{run=!d.hidden});
 root.classList.add('has-gl');c.classList.add('on');
 // adaptive quality: if the device can't hold ~35fps, step down (dpr 1 -> no transmission -> CSS fallback)
 let acc=0,n=0,lvl=0,prev=performance.now(),dead=false;
 const degrade=()=>{lvl++;if(lvl===1)r.setPixelRatio(1);else if(lvl===2){frame.material=pearl;phone.material=pearl}else{dead=true;c.classList.remove('on');root.classList.remove('has-gl');r.dispose()}size()};
 const clk=new T.Clock();(function loop(){if(dead)return;requestAnimationFrame(loop);const now=performance.now(),dt=now-prev;prev=now;if(!vis||!run)return;
  if(dt<250){acc+=dt;n++;if(n===30){if(acc/n>28)degrade();acc=0;n=0}}
  const t=clk.getElapsedTime(),s=Math.min(scrollY/innerHeight,1.2);
  tx+=(mx-tx)*.05;ty+=(my-ty)*.05;
  g.rotation.y=-.42+tx*.5+s*.6+Math.sin(t*.25)*.06;g.rotation.x=.14+ty*.3-s*.25;g.position.y=Math.sin(t*.7)*.08+s*1.1;
  ring.rotation.set(t*.25,t*.35,0);phone.position.y=-.55+Math.sin(t*.9+1)*.1;
  spheres.forEach((m,i)=>m.position.y=m.userData.y+Math.sin(t*(.8+i*.2)+i)*.12);
  prog.scale.x=1+((t*60)%300);r.render(sc,cam)})();
}
})();
