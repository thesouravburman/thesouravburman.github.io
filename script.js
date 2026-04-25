/* ============================================================
   script.js — All interactions & animations
   Portfolio: thesouravburman.github.io
   Engines: GSAP + ScrollTrigger · Vanilla JS · Canvas API
============================================================ */

/* ── 0. REGISTER GSAP PLUGINS ───────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ── 1. CUSTOM MAGNETIC CURSOR ──────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Ring follows with slight lag
  (function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  // Hover state on interactive elements
  const interactives = document.querySelectorAll(
    'a, button, .project-card, .bento, .social-btn'
  );
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
})();

/* ── 2. MAGNETIC PULL ON ELEMENTS ───────────────────────── */
(function initMagnetic() {
  const els = document.querySelectorAll('.magnetic');

  els.forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect   = el.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = e.clientX - cx;
      const dy     = e.clientY - cy;
      const factor = el.classList.contains('project-card') ? 0.08 : 0.28;
      gsap.to(el, {
        x: dx * factor,
        y: dy * factor,
        duration: 0.4,
        ease: 'power2.out'
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    });
  });
})();

/* ── 3. BINARY RAIN CANVAS ──────────────────────────────── */
(function initBinaryRain() {
  const canvas  = document.getElementById('binaryRain');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');
  const CHARS   = '01';
  const FONT_SZ = 13;
  let cols, drops;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    cols  = Math.floor(canvas.width / FONT_SZ);
    drops = Array(cols).fill(1);
  }

  function draw() {
    // Fade trail — dark semi-transparent wash
    ctx.fillStyle = 'rgba(6, 6, 6, 0.045)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${FONT_SZ}px 'JetBrains Mono', monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x    = i * FONT_SZ;
      const y    = drops[i] * FONT_SZ;

      // Lead char is bright blue-white, trail fades to deeper blue
      const bright = drops[i] % 20 < 2;
      ctx.fillStyle = bright
        ? 'rgba(147, 197, 253, 0.9)'   // bright lead — sky blue
        : 'rgba(59, 130, 246, 0.35)';  // column trail — electric blue

      ctx.fillText(char, x, y);

      // Random reset to top
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 40);
})();

/* ── 4. HERO NAME — LETTER BY LETTER ────────────────────── */
(function initHeroName() {
  const nameEl  = document.getElementById('heroName');
  if (!nameEl) return;
  const text    = 'Sourav Burman';
  let html      = '';

  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ') {
      html += '<span class="space"></span>';
    } else {
      html += `<span class="letter">${text[i]}</span>`;
    }
  }
  nameEl.innerHTML = html;

  const letters = nameEl.querySelectorAll('.letter');
  const eyebrow = document.querySelector('.hero-eyebrow');
  const meta    = document.getElementById('heroMeta');
  const scroll  = document.getElementById('scrollIndicator');

  // Sequence: eyebrow → letters → meta → scroll
  gsap.timeline({ delay: 0.4 })
    .to(eyebrow, { opacity: 1, duration: 1, ease: 'power2.out' })
    .to(letters, {
      opacity: 1,
      y: 0,
      rotate: 0,
      duration: 0.9,
      stagger: 0.045,
      ease: 'power4.out'
    }, '-=0.4')
    .to(meta, { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.3')
    .to(scroll, { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.3');
})();

/* ── 5. TYPEWRITER SUBTITLE ─────────────────────────────── */
(function initTypewriter() {
  const el      = document.getElementById('typewriter');
  if (!el) return;
  const phrases = [
    'AI Developer.',
    'Computer Vision Engineer.',
    'Building things that matter.',
    'ex-Samsung R&D.',
  ];
  let pIdx = 0, cIdx = 0, deleting = false;
  const SPEED_TYPE = 55, SPEED_DEL = 28, PAUSE = 2000;

  function tick() {
    const phrase = phrases[pIdx];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++cIdx);
      if (cIdx === phrase.length) {
        deleting = true;
        return setTimeout(tick, PAUSE);
      }
    } else {
      el.textContent = phrase.slice(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
  }

  // Start after hero animation completes
  setTimeout(tick, 1800);
})();

/* ── 6. ABOUT — SENTENCE FADE IN ────────────────────────── */
(function initAboutSentences() {
  const sentences = document.querySelectorAll('.reveal-sentence');
  sentences.forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      onEnter: () => {
        setTimeout(() => el.classList.add('visible'), i * 180);
      }
    });
  });
})();

/* ── 7. PROJECT CARDS REVEAL ────────────────────────────── */
(function initProjectCards() {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        duration: 0.9,
        delay: (i % 2) * 0.15,
        ease: 'power3.out', 
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
        }
      }
    );
  });
})();

/* ── 8. TIMELINE — SELF-DRAWING LINE ────────────────────── */
(function initTimeline() {
  const fill  = document.getElementById('timelineFill');
  const nodes = document.querySelectorAll('.tl-node');
  if (!fill) return;

  // Animate the fill bar as user scrolls through the section
  gsap.to(fill, {
    height: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: '.timeline',
      start: 'top 70%',
      end:   'bottom 50%',
      scrub: 1.5
    }
  });

  // Each node reveals in sequence
  nodes.forEach((node, i) => {
    ScrollTrigger.create({
      trigger: node,
      start: 'top 80%',
      onEnter: () => {
        setTimeout(() => node.classList.add('visible'), i * 120);
      }
    });
  });
})();

/* ── 9. BENTO GRID REVEAL ───────────────────────────────── */
(function initBento() {
  const bentos = document.querySelectorAll('.bento');
  bentos.forEach((b, i) => {
    ScrollTrigger.create({
      trigger: b,
      start: 'top 88%',
      onEnter: () => {
        setTimeout(() => b.classList.add('visible'), i * 80);
      }
    });
  });
})();

/* ── 10. CONTACT SECTION REVEAL ─────────────────────────── */
(function initContact() {
  const els = document.querySelectorAll(
    '.contact-headline, .contact-sub, .email-link, .social-row'
  );
  els.forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter: () => {
        setTimeout(() => el.classList.add('visible'), i * 150);
      }
    });
  });
})();

/* ── 11. SECTION HEADER PARALLAX TITLES ─────────────────── */
(function initParallaxTitles() {
  const titles = document.querySelectorAll('.section-title');
  titles.forEach(t => {
    gsap.fromTo(t,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: t, start: 'top 85%' }
      }
    );
  });

  const labels = document.querySelectorAll('.scene .section-label');
  labels.forEach(l => {
    gsap.fromTo(l,
      { opacity: 0, x: -20 },
      {
        opacity: 0.8, x: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: l, start: 'top 88%' }
      }
    );
  });
})();

/* ── 12. SMOOTH SCROLL FOR ANCHOR LINKS ─────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();

/* ── 13. PAGE PROGRESS INDICATOR ────────────────────────── */
(function initProgressBar() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed; top: 0; left: 0;
    height: 2px; width: 0%;
    background: linear-gradient(to right, #C9A84C, #E8C97A);
    z-index: 10001; pointer-events: none;
    transition: width 0.1s linear;
    box-shadow: 0 0 8px rgba(201,168,76,0.6);
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.body.scrollHeight - window.innerHeight;
    bar.style.width = (scrolled / total * 100) + '%';
  });
})();

/* ── 14. ABOUT STATS — COUNT UP ─────────────────────────── */
(function initCountUp() {
  const nums = document.querySelectorAll('.stat-num');
  nums.forEach(el => {
    const target = parseInt(el.textContent);
    if (isNaN(target)) return;  // skip "∞"

    let done = false;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        if (done) return;
        done = true;
        let current = 0;
        const step = target / 30;
        const interval = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = Math.round(current);
          if (current >= target) clearInterval(interval);
        }, 40);
      }
    });
  });
})();

/* ── 15. SUBTLE HERO PARALLAX ON SCROLL ─────────────────── */
(function initHeroParallax() {
  const content = document.querySelector('.hero-content');
  if (!content) return;

  gsap.to(content, {
    y: 80,
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end:   'bottom top',
      scrub: 1
    }
  });
})();

/* ── 16. RESIZE — REFRESH SCROLLTRIGGER ─────────────────── */
window.addEventListener('resize', () => ScrollTrigger.refresh());
