/* ============================================================
   script.js — souravburman.me v3.0
   All interactions, animations, rain, music, theme, video
============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ── UTILS ───────────────────────────────────────────────── */
const isMobile = () => window.innerWidth <= 768;
const isTouch  = () => window.matchMedia('(hover: none)').matches;

/* ── 1. PROGRESS BAR ────────────────────────────────────── */
(function() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
})();

/* ── 2. THEME TOGGLE ────────────────────────────────────── */
(function() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const root = document.documentElement;

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    // Refresh binary rain colors
    window.dispatchEvent(new Event('themechange'));
  });
})();

/* ── 3. CURTAIN ─────────────────────────────────────────── */
(function() {
  const curtain = document.getElementById('curtain');
  if (!curtain) return;
  setTimeout(() => curtain.classList.add('hidden'), 1800);
})();

/* ── 4. LOCAL TIME GREETING ─────────────────────────────── */
(function() {
  const el = document.getElementById('heroTime');
  if (!el) return;
  function greet(h) {
    if (h >= 5  && h < 12) return 'Good morning';
    if (h >= 12 && h < 17) return 'Good afternoon';
    if (h >= 17 && h < 21) return 'Good evening';
    return 'Good night';
  }
  function update() {
    const kol  = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const h    = kol.getHours();
    const m    = String(kol.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    el.textContent = `${greet(h)} — it's ${h % 12 || 12}:${m} ${ampm} in Kolkata`;
    el.classList.add('visible');
  }
  update();
  setInterval(update, 60000);
})();

/* ── 5. CURSOR ──────────────────────────────────────────── */
(function() {
  if (isTouch()) return;
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  const spot = document.getElementById('cursorSpotlight');
  if (!dot || !ring) return;
  let mx=0, my=0, rx=0, ry=0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    if (spot) { spot.style.left = mx + 'px'; spot.style.top = my + 'px'; }
  });
  (function loop() {
    rx += (mx - rx) * .12; ry += (my - ry) * .12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a, button, .project-card, .bento, .social-btn, .btn').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

/* ── 6. MAGNETIC PULL ───────────────────────────────────── */
(function() {
  if (isTouch()) return;
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      const f  = el.classList.contains('featured-card') ? .04 : .26;
      gsap.to(el, { x: dx * f, y: dy * f, duration: .4, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.5)' });
    });
  });
})();

/* ── 7. BINARY RAIN FACTORY ─────────────────────────────── */
function createRain(canvas, opts = {}) {
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const FONT   = opts.fontSize || 13;
  const CHARS  = '01';
  let cols, drops;
  const dimFactor = opts.dim || 1;

  function getColors() {
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    return light
      ? { lead: `rgba(155,110,26,${0.75 * dimFactor})`, trail: `rgba(155,110,26,${0.28 * dimFactor})`, fade: 'rgba(244,239,230,0.055)' }
      : { lead: `rgba(147,197,253,${1    * dimFactor})`, trail: `rgba(96,165,250,${0.5 * dimFactor})`,  fade: 'rgba(6,6,6,0.055)' };
  }

  function resize() {
    canvas.width  = canvas.offsetWidth  || canvas.parentElement?.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || canvas.parentElement?.offsetHeight || window.innerHeight;
    cols  = Math.floor(canvas.width / FONT);
    drops = Array(cols).fill(1);
  }

  function draw() {
    const c = getColors();
    ctx.fillStyle = c.fade;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${FONT}px 'JetBrains Mono', monospace`;
    for (let i = 0; i < drops.length; i++) {
      const char   = CHARS[Math.floor(Math.random() * CHARS.length)];
      const bright = drops[i] % 20 < 3;
      ctx.fillStyle = bright ? c.lead : c.trail;
      ctx.fillText(char, i * FONT, drops[i] * FONT);
      if (drops[i] * FONT > canvas.height && Math.random() > .975) drops[i] = 0;
      drops[i]++;
    }
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('themechange', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  const interval = setInterval(draw, opts.interval || 40);
  return () => clearInterval(interval);
}

/* Hero binary rain */
createRain(document.getElementById('binaryRain'));

/* Section rains — slower, dimmer */
createRain(document.getElementById('processRain'), { dim: .55, interval: 55 });
createRain(document.getElementById('journeyRain'), { dim: .4,  interval: 60 });
createRain(document.getElementById('contactRain'), { dim: .45, interval: 55 });

/* ── 8. HERO ANIMATIONS ─────────────────────────────────── */
(function() {
  const nameEl  = document.getElementById('heroName');
  if (!nameEl) return;

  const text = 'Sourav Burman';
  nameEl.innerHTML = [...text].map(c =>
    c === ' ' ? '<span class="space"></span>' : `<span class="letter">${c}</span>`
  ).join('');

  const letters  = nameEl.querySelectorAll('.letter');
  const eyebrow  = document.querySelector('.hero-eyebrow');
  const meta     = document.getElementById('heroMeta');
  const now      = document.getElementById('heroNow');
  const cta      = document.getElementById('heroCta');
  const scroll   = document.getElementById('scrollIndicator');
  const videoCard= document.getElementById('heroVideoCard');

  gsap.timeline({ delay: 2.1 })
    .to(eyebrow, { opacity: 1, duration: .9, ease: 'power2.out' })
    .to(letters, { opacity: 1, y: 0, rotate: 0, duration: .8, stagger: .04, ease: 'power4.out' }, '-=.4')
    .to(meta,    { opacity: 1, duration: .7, ease: 'power2.out' }, '-=.3')
    .to(now,     { opacity: 1, duration: .6, ease: 'power2.out' }, '-=.2')
    .to(cta,     { opacity: 1, duration: .6, ease: 'power2.out' }, '-=.2')
    .to(scroll,  { opacity: 1, duration: .6, ease: 'power2.out' }, '-=.2')
    .call(() => { if (videoCard) videoCard.classList.add('visible'); }, null, '+=.3');
})();

/* ── 9. TYPEWRITER ──────────────────────────────────────── */
(function() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const phrases = ['AI Developer.', 'Computer Vision Engineer.', 'Full-Stack Builder.', 'Building things that matter.'];
  let pIdx = 0, cIdx = 0, deleting = false;

  function tick() {
    const phrase = phrases[pIdx];
    el.textContent = deleting ? phrase.slice(0, --cIdx) : phrase.slice(0, ++cIdx);
    if (!deleting && cIdx === phrase.length) { deleting = true; return setTimeout(tick, 2000); }
    if (deleting && cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; }
    setTimeout(tick, deleting ? 26 : 52);
  }
  setTimeout(tick, 2900);
})();

/* ── 10. SCROLLYTELLING HERO (desktop only) ─────────────── */
(function() {
  if (isMobile()) return;
  // Pin hero for extra 80% of viewport height so user experiences the rain before scrolling to about
  ScrollTrigger.create({
    trigger: '#hero',
    start:   'top top',
    end:     '+=60%',
    pin:     true,
    pinSpacing: true,
  });
})();

/* ── 11. CHAPTER NAV DOTS ───────────────────────────────── */
(function() {
  const dots     = document.querySelectorAll('.cnav-dot');
  const sections = ['hero','about','projects','process','journey','skills','contact'];

  function update() {
    const scrollY = window.scrollY + window.innerHeight * .38;
    let active = 0;
    sections.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) active = i;
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === active));
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── 12. ABOUT SENTENCES ────────────────────────────────── */
(function() {
  document.querySelectorAll('.reveal-sentence').forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 84%',
      onEnter: () => setTimeout(() => el.classList.add('visible'), i * 155)
    });
  });
})();

/* ── 13. FEATURED CARD ──────────────────────────────────── */
(function() {
  const card = document.querySelector('.featured-card');
  if (!card) return;
  gsap.fromTo(card, { opacity: 0, y: 50 }, {
    opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: card, start: 'top 87%' }
  });
})();

/* ── 14. PROJECT CARDS ──────────────────────────────────── */
(function() {
  document.querySelectorAll('.project-card').forEach((card, i) => {
    gsap.fromTo(card, { opacity: 0, y: 45 }, {
      opacity: 1, y: 0, duration: .85, delay: (i % 2) * .12, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 87%' }
    });
  });
})();

/* ── 15. PROCESS STEPS ──────────────────────────────────── */
(function() {
  document.querySelectorAll('.reveal-step').forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 85%',
      onEnter: () => setTimeout(() => el.classList.add('visible'), i * 120)
    });
  });
})();

/* ── 16. TIMELINE ───────────────────────────────────────── */
(function() {
  const fill  = document.getElementById('timelineFill');
  const nodes = document.querySelectorAll('.tl-node');
  if (!fill) return;

  gsap.to(fill, {
    height: '100%', ease: 'none',
    scrollTrigger: { trigger: '.timeline', start: 'top 68%', end: 'bottom 48%', scrub: 1.4 }
  });
  nodes.forEach((node, i) => {
    ScrollTrigger.create({
      trigger: node, start: 'top 83%',
      onEnter: () => setTimeout(() => node.classList.add('visible'), i * 105)
    });
  });
})();

/* ── 17. BENTO GRID ─────────────────────────────────────── */
(function() {
  document.querySelectorAll('.bento').forEach((b, i) => {
    ScrollTrigger.create({
      trigger: b, start: 'top 90%',
      onEnter: () => setTimeout(() => b.classList.add('visible'), i * 70)
    });
  });
})();

/* ── 18. SECTION TITLES & EPIGRAPHS ─────────────────────── */
(function() {
  document.querySelectorAll('.section-title').forEach(t => {
    gsap.fromTo(t, { opacity: 0, y: 32 }, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: t, start: 'top 87%' }
    });
  });
  document.querySelectorAll('.section-epigraph').forEach(e => {
    gsap.fromTo(e, { opacity: 0, y: 18 }, {
      opacity: 1, y: 0, duration: .8, ease: 'power2.out',
      scrollTrigger: { trigger: e, start: 'top 89%' }
    });
  });
  document.querySelectorAll('.scene .section-label').forEach(l => {
    gsap.fromTo(l, { opacity: 0, x: -16 }, {
      opacity: .8, x: 0, duration: .7, ease: 'power2.out',
      scrollTrigger: { trigger: l, start: 'top 90%' }
    });
  });
})();

/* ── 19. CONTACT SECTION ────────────────────────────────── */
(function() {
  document.querySelectorAll(
    '.contact-headline, .contact-sub, .email-link, .contact-cta, .social-row'
  ).forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 90%',
      onEnter: () => setTimeout(() => el.classList.add('visible'), i * 125)
    });
  });
})();

/* ── 20. HERO PARALLAX ON SCROLL ────────────────────────── */
(function() {
  const content = document.querySelector('.hero-content');
  if (!content || isMobile()) return;
  gsap.to(content, {
    y: 60, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
  });
})();

/* ── 21. STAT COUNT UP ──────────────────────────────────── */
(function() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.textContent);
    if (isNaN(target)) return;
    let done = false;
    ScrollTrigger.create({
      trigger: el, start: 'top 87%',
      onEnter: () => {
        if (done) return; done = true;
        let cur = 0; const step = target / 28;
        const iv = setInterval(() => {
          cur = Math.min(cur + step, target);
          el.textContent = Math.round(cur);
          if (cur >= target) clearInterval(iv);
        }, 38);
      }
    });
  });
})();

/* ── 22. BACKGROUND MUSIC ───────────────────────────────── */
(function() {
  const audio = document.getElementById('bgMusic');
  const btn   = document.getElementById('musicBtn');
  if (!audio || !btn) return;

  audio.volume  = 0.08;
  let playing   = false;

  function setPlaying(state) {
    playing = state;
    btn.classList.toggle('playing', state);
  }

  // Attempt autoplay immediately (works on return visits / after interaction)
  function tryPlay() {
    audio.play().then(() => setPlaying(true)).catch(() => {
      // Browser blocked — wait for first user interaction
      const unlock = () => {
        audio.play().then(() => setPlaying(true)).catch(() => {});
        document.removeEventListener('click',      unlock);
        document.removeEventListener('scroll',     unlock);
        document.removeEventListener('touchstart', unlock);
      };
      document.addEventListener('click',      unlock, { passive: true });
      document.addEventListener('scroll',     unlock, { passive: true });
      document.addEventListener('touchstart', unlock, { passive: true });
    });
  }

  // Start playing as early as possible
  if (document.readyState === 'complete') {
    tryPlay();
  } else {
    window.addEventListener('load', tryPlay, { once: true });
  }

  // Toggle: pause if playing, resume if paused
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  });
})();

/* ── 23. INTRO VIDEO SOUND TOGGLE ───────────────────────── */
(function() {
  const video = document.getElementById('introVideo');
  const btn   = document.getElementById('videoSoundBtn');
  if (!video || !btn) return;
  const icon  = btn.querySelector('.vsound-icon');

  btn.addEventListener('click', () => {
    video.muted = !video.muted;
    icon.textContent = video.muted ? '🔇' : '🔊';
  });
})();

/* ── 24. RESIZE REFRESH ─────────────────────────────────── */
window.addEventListener('resize', () => ScrollTrigger.refresh(), { passive: true });
