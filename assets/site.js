document.querySelectorAll('#yr').forEach(function(el){el.textContent=new Date().getFullYear()});
var hdr=document.getElementById('hdr');
if(hdr){var onScroll=function(){hdr.classList.toggle('scrolled',window.scrollY>8)};window.addEventListener('scroll',onScroll,{passive:true});onScroll()}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
var vid=document.querySelector('.hero-vid');
if(vid&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){vid.removeAttribute('autoplay');vid.pause()}
if(vid&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){var vp=vid.play();if(vp&&vp.catch)vp.catch(function(){})}
var tgl=document.querySelector('.nav-toggle'),mm=document.querySelector('.mobile-menu');
if(tgl&&mm){var setOpen=function(o){mm.classList.toggle('open',o);document.body.style.overflow=o?'hidden':'';tgl.setAttribute('aria-expanded',o)};
tgl.addEventListener('click',function(){setOpen(!mm.classList.contains('open'))});
mm.addEventListener('click',function(e){if(e.target.closest('a')||e.target.closest('.close-x'))setOpen(false)});}
