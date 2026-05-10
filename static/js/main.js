/* ══════════════════════════════════════════════════════
   ANKIT RAJ · PORTFOLIO — main.js
   ══════════════════════════════════════════════════════ */

/* ── Helpers ─────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ══════════════════════════════════════════════════════
   THEME TOGGLE  — dark / light with localStorage
   ══════════════════════════════════════════════════════ */
(function initTheme() {
  const root   = document.documentElement;
  const toggle = $('themeToggle');
  const saved  = localStorage.getItem('theme');
  const prefer = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const theme  = saved || prefer;

  root.setAttribute('data-theme', theme);

  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
})();

/* ══════════════════════════════════════════════════════
   NAVBAR  — scroll state + mobile menu
   ══════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar  = $('navbar');
  const burger  = $('hamburger');
  const overlay = $('mobileOverlay');

  // Scroll shadow
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const toggleMenu = (open) => {
    burger.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  burger.addEventListener('click', () => toggleMenu(!burger.classList.contains('open')));

  // Clone nav links into overlay
  const navLinks = $$('.nav-links .nav-link');
  navLinks.forEach(link => {
    const clone = link.cloneNode(true);
    clone.addEventListener('click', () => toggleMenu(false));
    overlay.appendChild(clone);
  });

  // Close on outside click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) toggleMenu(false);
  });
})();

/* ══════════════════════════════════════════════════════
   ACTIVE NAV HIGHLIGHT  — IntersectionObserver
   ══════════════════════════════════════════════════════ */
(function initActiveNav() {
  const sections = $$('section[id]');
  const links    = $$('.nav-link');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => io.observe(s));
})();

/* ══════════════════════════════════════════════════════
   FADE-IN ON SCROLL
   ══════════════════════════════════════════════════════ */
(function initFadeIn() {
  // Add fade-in to key elements
  const targets = [
    '.hero-content > *',
    '.about-text > *',
    '.about-visual',
    '.skill-category',
    '.project-card',
    '.contact-info',
    '.contact-form',
  ];
  targets.forEach(sel => {
    $$(sel).forEach((el, i) => {
      el.classList.add('fade-in');
      el.style.transitionDelay = `${i * 0.07}s`;
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  $$('.fade-in').forEach(el => io.observe(el));
})();

/* ══════════════════════════════════════════════════════
   SKILL BARS  — animate on first view
   ══════════════════════════════════════════════════════ */
(function initSkillBars() {
  const bars = $$('.skill-bar');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(b => io.observe(b));
})();

/* ══════════════════════════════════════════════════════
   FOOTER YEAR
   ══════════════════════════════════════════════════════ */
const yearEl = $('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ══════════════════════════════════════════════════════
   CONTACT FORM  — validation + fetch submission
   ══════════════════════════════════════════════════════ */
(function initContactForm() {
  const form       = $('contactForm');
  const submitBtn  = $('submitBtn');
  const feedback   = $('formFeedback');

  if (!form) return;

  const fields = {
    name:    { el: $('name'),    error: $('nameError') },
    email:   { el: $('email'),   error: $('emailError') },
    message: { el: $('message'), error: $('messageError') },
  };

  /* — Validators — */
  const validators = {
    name:    v => v.trim().length >= 2   ? '' : 'Please enter your name.',
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email.',
    message: v => v.trim().length >= 10  ? '' : 'Message must be at least 10 characters.',
  };

  /* — Clear errors on input — */
  Object.keys(fields).forEach(key => {
    fields[key].el.addEventListener('input', () => {
      fields[key].el.classList.remove('error');
      fields[key].error.textContent = '';
      feedback.textContent = '';
      feedback.className   = 'form-feedback';
    });
  });

  /* — Validate all — */
  function validate() {
    let valid = true;
    Object.keys(fields).forEach(key => {
      const msg = validators[key](fields[key].el.value);
      if (msg) {
        valid = false;
        fields[key].el.classList.add('error');
        fields[key].error.textContent = msg;
      } else {
        fields[key].el.classList.remove('error');
        fields[key].error.textContent = '';
      }
    });
    return valid;
  }

  /* — Submit — */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    feedback.textContent = '';
    feedback.className   = 'form-feedback';

    const payload = {
      name:    fields.name.el.value.trim(),
      email:   fields.email.el.value.trim(),
      message: fields.message.el.value.trim(),
    };

    try {
      const res  = await fetch('/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        feedback.textContent = data.message || 'Message sent successfully!';
        feedback.className   = 'form-feedback success';
        form.reset();
        // Clear individual errors
        Object.keys(fields).forEach(k => {
          fields[k].el.classList.remove('error');
          fields[k].error.textContent = '';
        });
      } else {
        throw new Error(data.error || 'Failed to send message.');
      }
    } catch (err) {
      feedback.textContent = err.message || 'Something went wrong. Please try again.';
      feedback.className   = 'form-feedback error-msg';
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
})();
