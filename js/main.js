(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ============ LOADER ============ */
  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loaderFill');
  const loaderPct = document.getElementById('loaderPct');
  let pct = 0;
  const loadInterval = setInterval(() => {
    pct += Math.random() * 18 + 6;
    if (pct >= 100) {
      pct = 100;
      clearInterval(loadInterval);
      setTimeout(() => loader.classList.add('hidden'), 300);
    }
    loaderFill.style.width = pct + '%';
    loaderPct.textContent = Math.floor(pct) + '%';
  }, 180);

  /* ============ THEME ============ */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('ba-theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');
  root.setAttribute('data-theme', initialTheme);
  themeToggle.setAttribute('aria-pressed', String(initialTheme === 'dark'));

  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('ba-theme', next);
    themeToggle.setAttribute('aria-pressed', String(next === 'dark'));
  });

  /* ============ CUSTOM CURSOR ============ */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  if (isTouch) {
    document.body.classList.add('no-cursor');
  } else {
    let ringX = 0, ringY = 0, dotX = 0, dotY = 0;
    window.addEventListener('mousemove', (e) => {
      dotX = e.clientX; dotY = e.clientY;
      cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%,-50%)`;
    });
    const animateRing = () => {
      ringX += (dotX - ringX) * 0.18;
      ringY += (dotY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();
    document.querySelectorAll('a, button, .skill-card, .project-card, .chip').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('expand'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('expand'));
    });
  }

  /* ============ FULLSCREEN ============ */
  const fsToggle = document.getElementById('fullscreenToggle');
  fsToggle.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });
  document.addEventListener('fullscreenchange', () => {
    document.body.classList.toggle('is-fullscreen', !!document.fullscreenElement);
  });

  /* ============ SCROLL PROGRESS + NAVBAR STATE ============ */
  const progressBar = document.getElementById('scrollProgress');
  const navbar = document.getElementById('navbar');
  const navAnchors = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('main .section, .hero');

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
    navbar.classList.toggle('scrolled', scrollTop > 30);

    let currentId = '';
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 140 && rect.bottom >= 140) currentId = sec.id;
    });
    navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + currentId));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============ MOBILE DRAWER ============ */
  const navToggle = document.getElementById('navToggle');
  const drawer = document.getElementById('drawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const closeDrawer = () => {
    drawer.classList.remove('open');
    drawerBackdrop.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };
  navToggle.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    drawerBackdrop.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });
  drawerBackdrop.addEventListener('click', closeDrawer);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

  /* ============ TYPING ANIMATION ============ */
  const roles = ['Frontend Developer', 'UI/UX Enthusiast', 'Computer Science Student'];
  const typingEl = document.getElementById('typingRole');
  if (prefersReduced) {
    typingEl.textContent = roles[0];
  } else {
    let roleIdx = 0, charIdx = 0, deleting = false;
    const type = () => {
      const word = roles[roleIdx];
      typingEl.textContent = deleting ? word.slice(0, charIdx--) : word.slice(0, charIdx++);
      let delay = deleting ? 45 : 85;
      if (!deleting && charIdx === word.length + 1) { delay = 1400; deleting = true; }
      if (deleting && charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; delay = 400; }
      setTimeout(type, delay);
    };
    type();
  }

  /* ============ MOUSE PARALLAX (hero) ============ */
  const heroVisual = document.querySelector('.hero-visual');
  if (!prefersReduced && !isTouch && heroVisual) {
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      heroVisual.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  /* ============ REVEAL ON SCROLL ============ */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ============ ANIMATED COUNTERS ============ */
  const statNums = document.querySelectorAll('.stat-num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      if (prefersReduced) { el.textContent = target; counterObserver.unobserve(el); return; }
      let cur = 0;
      const step = Math.max(1, Math.round(target / 40));
      const tick = () => {
        cur += step;
        if (cur >= target) { el.textContent = target; return; }
        el.textContent = cur;
        requestAnimationFrame(tick);
      };
      tick();
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => counterObserver.observe(el));

  /* ============ MAGNETIC BUTTONS ============ */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ============ PROJECT CAROUSEL ============ */
  const track = document.getElementById('projectTrack');
  const cards = Array.from(track.children);
  const dotsWrap = document.getElementById('carouselDots');
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', 'Go to project ' + (i + 1));
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => scrollToCard(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function scrollToCard(i) {
    const card = cards[i];
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: prefersReduced ? 'auto' : 'smooth' });
  }
  function currentIndex() {
    let closest = 0, min = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - track.scrollLeft - track.offsetLeft);
      if (d < min) { min = d; closest = i; }
    });
    return closest;
  }
  track.addEventListener('scroll', () => {
    const idx = currentIndex();
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }, { passive: true });

  document.getElementById('prevProject').addEventListener('click', () => scrollToCard(Math.max(0, currentIndex() - 1)));
  document.getElementById('nextProject').addEventListener('click', () => scrollToCard(Math.min(cards.length - 1, currentIndex() + 1)));

  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') scrollToCard(Math.min(cards.length - 1, currentIndex() + 1));
    if (e.key === 'ArrowLeft') scrollToCard(Math.max(0, currentIndex() - 1));
  });

  /* touch swipe is handled natively via scroll-snap + overflow-x */

  /* ============ PROJECT MODALS ============ */
  const modalBackdrop = document.getElementById('modalBackdrop');
  let activeModal = null;
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('open');
    modalBackdrop.classList.add('open');
    activeModal = modal;
    modal.querySelector('.modal-close')?.focus();
  }
  function closeModal() {
    if (activeModal) activeModal.classList.remove('open');
    modalBackdrop.classList.remove('open');
    activeModal = null;
  }
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.openModal));
  });
  document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', closeModal));
  modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* ============ CONTACT FORM (client-side only) ============ */
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const toast = document.getElementById('toast');

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function setError(id, msg) {
    const el = document.querySelector(`[data-error-for="${id}"]`);
    if (el) el.textContent = msg;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    const name = document.getElementById('cName');
    const email = document.getElementById('cEmail');
    const message = document.getElementById('cMessage');

    setError('cName', ''); setError('cEmail', ''); setError('cMessage', '');

    if (!name.value.trim()) { setError('cName', 'Please enter your name.'); valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { setError('cEmail', 'Please enter a valid email.'); valid = false; }
    if (!message.value.trim() || message.value.trim().length < 10) { setError('cMessage', 'Message should be at least 10 characters.'); valid = false; }

    if (!valid) return;

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      form.reset();
      showToast('Message sent — thank you! I\'ll get back to you soon.');
    }, 1400);
  });

  /* ============ BACK TO TOP ============ */
  document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });

  /* ============ FOOTER YEAR ============ */
  document.getElementById('year').textContent = new Date().getFullYear();

})();
