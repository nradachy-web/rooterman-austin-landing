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
/* Clean in-page navigation: scroll to sections without leaving a #hash in the URL */
(function(){
  var KEY='rm_scroll';
  function go(id){var el=document.getElementById(id);if(el){el.scrollIntoView({behavior:'smooth',block:'start'});return true}return false}
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
    if(!a)return;
    var raw=a.getAttribute('href')||'';
    if(raw.indexOf('#')<0)return;
    var url;try{url=new URL(a.href,location.href)}catch(_){return}
    if(url.origin!==location.origin||!url.hash)return;
    var id=url.hash.slice(1);if(!id)return;
    e.preventDefault();
    if(url.pathname===location.pathname){
      go(id);history.replaceState(null,'',location.pathname+location.search);
    }else{
      try{sessionStorage.setItem(KEY,id)}catch(_){}
      location.href=url.pathname+url.search;
    }
  });
  window.addEventListener('load',function(){
    var id=null;try{id=sessionStorage.getItem(KEY)}catch(_){}
    if(id){try{sessionStorage.removeItem(KEY)}catch(_){}setTimeout(function(){go(id)},80)}
    if(location.hash){var h=location.hash.slice(1);setTimeout(function(){go(h);history.replaceState(null,'',location.pathname+location.search)},80)}
  });
})();
