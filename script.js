/* ============================================================
   script.js — thesouravburman.github.io
   All animations, interactions, curtain, nav, spotlight
============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ── 1. PROGRESS BAR ────────────────────────────────────── */
(function() {
  const bar = document.createElement('div');
  bar.id = 'progressBar';
  document.body.appendChild(bar);
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    bar.style.width = pct + '%';
  });
})();

/* ── 2. CINEMATIC CURTAIN ───────────────────────────────── */
(function() {
  const curtain = document.getElementById('curtain');
  if (!curtain) return;
  setTimeout(() => curtain.classList.add('hidden'), 1800);
})();

/* ── 3. LOCAL TIME GREETING ─────────────────────────────── */
(function() {
  const el = document.getElementById('heroTime');
  if (!el) return;

  function getGreeting(hour) {
    if (hour >= 5  && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
  }

  function update() {
    const now = new Date();
    const kol = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const h   = kol.getHours();
    const m   = String(kol.getMinutes()).padStart(2, '0');
    const ampm= h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    el.textContent = `${getGreeting(h)} — it's ${h12}:${m} ${ampm} in Kolkata`;
    el.classList.add('visible');
  }
  update();
  setInterval(update, 60000);
})();

/* ── 4. CURSOR ──────────────────────────────────────────── */
(function() {
  const dot      = document.getElementById('cursorDot');
  const ring     = document.getElementById('cursorRing');
  const spotlight= document.getElementById('cursorSpotlight');
  if (!dot || !ring) return;
  let mx=0, my=0, rx=0, ry=0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx+'px'; dot.style.top = my+'px';
    if (spotlight) { spotlight.style.left = mx+'px'; spotlight.style.top = my+'px'; }
  });
  (function loop() {
    rx += (mx-rx)*.12; ry += (my-ry)*.12;
    ring.style.left = rx+'px'; ring.style.top = ry+'px';
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a,button,.social-btn,.email-link,.btn').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });
  document.addEventListener('mouseleave', () => { dot.style.opacity='0'; ring.style.opacity='0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity='1'; ring.style.opacity='1'; });
})();

/* ── 5. MAGNETIC PULL ───────────────────────────────────── */
(function() {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width/2);
      const dy = e.clientY - (r.top  + r.height/2);
      const f  = el.classList.contains('featured-card') ? 0.04 : 0.26;
      gsap.to(el, { x:dx*f, y:dy*f, duration:.4, ease:'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x:0, y:0, duration:.6, ease:'elastic.out(1,0.5)' });
    });
  });
})();

/* ── 6. BINARY RAIN ─────────────────────────────────────── */
(function() {
  const canvas = document.getElementById('binaryRain');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const CHARS = '01'; const FONT_SZ = 13;
  let cols, drops;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    cols  = Math.floor(canvas.width / FONT_SZ);
    drops = Array(cols).fill(1);
  }
  function draw() {
    ctx.fillStyle = 'rgba(6,6,6,0.055)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${FONT_SZ}px 'JetBrains Mono',monospace`;
    for (let i=0; i<drops.length; i++) {
      const char   = CHARS[Math.floor(Math.random()*CHARS.length)];
      const bright = drops[i] % 20 < 3;
      ctx.fillStyle = bright ? 'rgba(147,197,253,1)' : 'rgba(96,165,250,0.55)';
      ctx.fillText(char, i*FONT_SZ, drops[i]*FONT_SZ);
      if (drops[i]*FONT_SZ > canvas.height && Math.random()>.975) drops[i]=0;
      drops[i]++;
    }
  }
  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 40);
})();

/* ── 7. HERO NAME ───────────────────────────────────────── */
(function() {
  const nameEl = document.getElementById('heroName');
  if (!nameEl) return;
  const text = 'Sourav Burman';
  nameEl.innerHTML = [...text].map(c =>
    c === ' ' ? '<span class="space"></span>' : `<span class="letter">${c}</span>`
  ).join('');

  const letters = nameEl.querySelectorAll('.letter');
  const eyebrow = document.querySelector('.hero-eyebrow');
  const meta    = document.getElementById('heroMeta');
  const now     = document.getElementById('heroNow');
  const cta     = document.getElementById('heroCta');
  const scroll  = document.getElementById('scrollIndicator');

  gsap.timeline({ delay: 2 })  // starts after curtain
    .to(eyebrow, { opacity:1, duration:1, ease:'power2.out' })
    .to(letters, { opacity:1, y:0, rotate:0, duration:.85, stagger:.042, ease:'power4.out' }, '-=0.4')
    .to(meta,    { opacity:1, duration:.75, ease:'power2.out' }, '-=0.3')
    .to(now,     { opacity:1, duration:.6,  ease:'power2.out' }, '-=0.2')
    .to(cta,     { opacity:1, duration:.6,  ease:'power2.out' }, '-=0.2')
    .to(scroll,  { opacity:1, duration:.6,  ease:'power2.out' }, '-=0.2');
})();

/* ── 8. TYPEWRITER ──────────────────────────────────────── */
(function() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const phrases = [
    'AI Developer.',
    'Computer Vision Engineer.',
    'Full-Stack Builder.',
    'Building things that matter.',
  ];
  let pIdx=0, cIdx=0, deleting=false;

  function tick() {
    const phrase = phrases[pIdx];
    el.textContent = deleting ? phrase.slice(0,--cIdx) : phrase.slice(0,++cIdx);
    if (!deleting && cIdx===phrase.length) { deleting=true; return setTimeout(tick,2000); }
    if (deleting && cIdx===0) { deleting=false; pIdx=(pIdx+1)%phrases.length; }
    setTimeout(tick, deleting ? 26 : 52);
  }
  setTimeout(tick, 2800);
})();

/* ── 9. CHAPTER NAV DOTS ────────────────────────────────── */
(function() {
  const dots    = document.querySelectorAll('.cnav-dot');
  const sections= ['hero','about','projects','journey','skills','contact'];

  function update() {
    const scrollY = window.scrollY + window.innerHeight * 0.4;
    let active = 0;
    sections.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) active = i;
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === active));
  }

  window.addEventListener('scroll', update, { passive:true });
  update();
})();

/* ── 10. ABOUT SENTENCES ────────────────────────────────── */
(function() {
  document.querySelectorAll('.reveal-sentence').forEach((el,i) => {
    ScrollTrigger.create({
      trigger: el, start:'top 83%',
      onEnter: () => setTimeout(() => el.classList.add('visible'), i*160)
    });
  });
})();

/* ── 11. FEATURED CARD ──────────────────────────────────── */
(function() {
  const card = document.querySelector('.featured-card');
  if (!card) return;
  gsap.fromTo(card,
    { opacity:0, y:50 },
    { opacity:1, y:0, duration:1.1, ease:'power3.out',
      scrollTrigger:{ trigger:card, start:'top 86%' } }
  );
})();

/* ── 12. PROJECT CARDS ──────────────────────────────────── */
(function() {
  document.querySelectorAll('.project-card').forEach((card,i) => {
    gsap.fromTo(card,
      { opacity:0, y:45 },
      { opacity:1, y:0, duration:.85, delay:(i%2)*.12, ease:'power3.out',
        scrollTrigger:{ trigger:card, start:'top 86%' } }
    );
  });
})();

/* ── 13. TIMELINE ───────────────────────────────────────── */
(function() {
  const fill  = document.getElementById('timelineFill');
  const nodes = document.querySelectorAll('.tl-node');
  if (!fill) return;
  gsap.to(fill, {
    height:'100%', ease:'none',
    scrollTrigger:{ trigger:'.timeline', start:'top 68%', end:'bottom 48%', scrub:1.4 }
  });
  nodes.forEach((node,i) => {
    ScrollTrigger.create({
      trigger:node, start:'top 82%',
      onEnter: () => setTimeout(() => node.classList.add('visible'), i*110)
    });
  });
})();

/* ── 14. BENTO GRID ─────────────────────────────────────── */
(function() {
  document.querySelectorAll('.bento').forEach((b,i) => {
    ScrollTrigger.create({
      trigger:b, start:'top 89%',
      onEnter: () => setTimeout(() => b.classList.add('visible'), i*75)
    });
  });
})();

/* ── 15. CONTACT ────────────────────────────────────────── */
(function() {
  document.querySelectorAll(
    '.contact-headline,.contact-sub,.email-link,.contact-cta,.social-row'
  ).forEach((el,i) => {
    ScrollTrigger.create({
      trigger:el, start:'top 89%',
      onEnter: () => setTimeout(() => el.classList.add('visible'), i*130)
    });
  });
})();

/* ── 16. SECTION TITLES & EPIGRAPHS ─────────────────────── */
(function() {
  document.querySelectorAll('.section-title').forEach(t => {
    gsap.fromTo(t, { opacity:0, y:36 }, {
      opacity:1, y:0, duration:1, ease:'power3.out',
      scrollTrigger:{ trigger:t, start:'top 86%' }
    });
  });
  document.querySelectorAll('.section-epigraph').forEach(e => {
    gsap.fromTo(e, { opacity:0, y:20 }, {
      opacity:1, y:0, duration:.8, ease:'power2.out',
      scrollTrigger:{ trigger:e, start:'top 88%' }
    });
  });
  document.querySelectorAll('.scene .section-label').forEach(l => {
    gsap.fromTo(l, { opacity:0, x:-18 }, {
      opacity:.8, x:0, duration:.75, ease:'power2.out',
      scrollTrigger:{ trigger:l, start:'top 89%' }
    });
  });
})();

/* ── 17. HERO PARALLAX ──────────────────────────────────── */
(function() {
  const content = document.querySelector('.hero-content');
  if (!content) return;
  gsap.to(content, {
    y:70, opacity:0, ease:'none',
    scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub:1 }
  });
})();

/* ── 18. COUNT UP ───────────────────────────────────────── */
(function() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.textContent);
    if (isNaN(target)) return;
    let done = false;
    ScrollTrigger.create({
      trigger:el, start:'top 86%',
      onEnter: () => {
        if (done) return; done=true;
        let current=0; const step=target/28;
        const iv = setInterval(() => {
          current = Math.min(current+step, target);
          el.textContent = Math.round(current);
          if (current>=target) clearInterval(iv);
        }, 38);
      }
    });
  });
})();

window.addEventListener('resize', () => ScrollTrigger.refresh());
