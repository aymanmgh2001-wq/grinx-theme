// GRINX theme interactions (optimized, modular)
(() => {
  'use strict';

  const raf = window.requestAnimationFrame.bind(window);
  const cancelRaf = window.cancelAnimationFrame.bind(window);

  class StarField {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.particles = [];
      this.mouse = { x: -1000, y: -1000 };
      this.count = 120;
      this._t = 0;
      this._raf = null;
      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });
      window.addEventListener('mousemove', e => this.onMove(e), { passive: true });
      this.initParticles();
      this.loop();
    }
    resize() {
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;
      this.canvas.width = Math.round(w * this.dpr);
      this.canvas.height = Math.round(h * this.dpr);
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
      this.ctx.scale(this.dpr, this.dpr);
    }
    initParticles() {
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;
      this.particles = [];
      for (let i=0;i<this.count;i++){
        this.particles.push({
          x: Math.random()*w,
          y: Math.random()*h,
          vx: (Math.random()-0.5)*0.2,
          vy: (Math.random()-0.5)*0.2,
          r: Math.random()*1.6 + 0.4,
          hue: (Math.random()*30) + 240
        });
      }
    }
    onMove(e){
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left);
      this.mouse.y = (e.clientY - rect.top);
    }
    update(dt){
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;
      for (let p of this.particles){
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.max(1, Math.hypot(dx,dy));
        const force = (200 / (dist * dist)) * 0.4;
        p.vx += dx * force * 0.001;
        p.vy += dy * force * 0.001;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }
    }
    draw(){
      const ctx = this.ctx;
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;
      ctx.clearRect(0,0,w,h);
      for (let p of this.particles){
        ctx.beginPath();
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6);
        g.addColorStop(0, `rgba(139,92,246,0.45)`);
        g.addColorStop(0.2, `rgba(59,130,246,0.18)`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.arc(p.x, p.y, p.r*3, 0, Math.PI*2);
        ctx.fill();
      }
    }
    loop(){
      this._raf = raf((t) => {
        const dt = t - (this._t || t);
        this._t = t;
        this.update(dt);
        this.draw();
        this.loop();
      });
    }
    destroy(){
      if (this._raf) cancelRaf(this._raf);
      window.removeEventListener('mousemove', this.onMove);
    }
  }

  function initLogoParallax(logoWrap) {
    if (!logoWrap) return;
    const base = { x:0,y:0 };
    let rafId = null;
    const mouse = { x: 0, y: 0 };
    function onMove(e){
      mouse.x = (e.clientX / window.innerWidth) - 0.5;
      mouse.y = (e.clientY / window.innerHeight) - 0.5;
      if (!rafId) rafId = raf(update);
    }
    function update(){
      rafId = null;
      const tx = mouse.x * 18;
      const ty = mouse.y * 10;
      logoWrap.style.transform = `rotateX(${ty}deg) rotateY(${tx}deg) translateZ(0)`;
    }
    window.addEventListener('mousemove', onMove, { passive:true });
    return () => window.removeEventListener('mousemove', onMove);
  }

  function initCursorLight(lightEl){
    if (!lightEl) return;
    let lastX = -9999, lastY = -9999;
    function onMove(e){
      const x = e.clientX, y = e.clientY;
      if (Math.hypot(x-lastX, y-lastY) < 1) return;
      lastX = x; lastY = y;
      lightEl.style.left = x + 'px';
      lightEl.style.top = y + 'px';
    }
    window.addEventListener('mousemove', onMove, { passive:true });
    window.addEventListener('touchstart', () => lightEl.style.display = 'none', {passive:true});
    return () => window.removeEventListener('mousemove', onMove);
  }

  function initRevealObservers(){
    const els = document.querySelectorAll('.grx-reveal');
    const io = new IntersectionObserver((entries) => {
      for (const e of entries){
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12 });
    els.forEach(el=>io.observe(el));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('grx-star-canvas');
    if (canvas) new StarField(canvas);

    const logoWrap = document.getElementById('grx-logo-wrap');
    initLogoParallax(logoWrap);

    const light = document.getElementById('grx-cursor-light');
    initCursorLight(light);

    initRevealObservers();

    document.documentElement.classList.add('grx-page-ready');
  });

})();
