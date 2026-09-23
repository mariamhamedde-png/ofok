(() => {
  'use strict';

  /* ---------- Nav: scrolled state + active link + mobile menu ---------- */
  const nav = document.getElementById('nav');
  const navBurger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  const navCta = document.querySelector('.nav__cta');
  const navLinkEls = document.querySelectorAll('[data-nav]');
  const sections = document.querySelectorAll('section[id]');
  const progressFill = document.getElementById('progressFill');
  const scrollTopBtn = document.getElementById('scrollTop');

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 20);
    scrollTopBtn.classList.toggle('show', y > 600);

    // scroll progress
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (y / docHeight) * 100 : 0;
    progressFill.style.width = progress + '%';

    // active section highlight
    let currentId = sections[0] ? sections[0].id : '';
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 120) currentId = section.id;
    });
    navLinkEls.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navBurger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navCta.classList.toggle('open', isOpen);
    navBurger.classList.toggle('open', isOpen);
    navBurger.setAttribute('aria-expanded', String(isOpen));
  });
  navLinkEls.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navCta.classList.remove('open');
      navBurger.classList.remove('open');
      navBurger.setAttribute('aria-expanded', 'false');
    });
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'), 10);
      const duration = 1200;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => counterObserver.observe(el));

  /* ---------- Language bars fill on view ---------- */
  const langBars = document.querySelectorAll('.lang-bar__fill');
  const langObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const width = entry.target.style.width;
        entry.target.style.width = '0%';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => { entry.target.style.width = width; });
        });
        langObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  langBars.forEach((el) => {
    el.dataset.targetWidth = el.style.width;
    langObserver.observe(el);
  });

  /* ---------- Cursor glow (desktop only) ---------- */
  const cursorGlow = document.querySelector('.cursor-glow');
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (cursorGlow && !isTouch) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }

  /* ---------- Hero photo tilt (desktop only) ---------- */
  const tiltCard = document.getElementById('tiltCard');
  if (tiltCard && !isTouch) {
    tiltCard.addEventListener('mousemove', (e) => {
      const rect = tiltCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      tiltCard.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    tiltCard.addEventListener('mouseleave', () => {
      tiltCard.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
    });
  }

  /* ---------- Booking form ---------- */
  const form = document.getElementById('bookingForm');
  const successMsg = document.getElementById('bookingSuccess');
  if (form) {
    const phonePattern = /^[0-9+()\-\s]{7,20}$/;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const fields = ['firstName', 'lastName', 'email', 'phone'];
      fields.forEach((name) => {
        const input = form.elements[name];
        input.classList.add('touched');

        let fieldValid = input.value.trim().length > 0;
        if (name === 'email') {
          fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        }
        if (name === 'phone') {
          fieldValid = phonePattern.test(input.value.trim());
        }
        if (!fieldValid) {
          valid = false;
          input.setCustomValidity('invalid');
        } else {
          input.setCustomValidity('');
        }
      });

      if (!valid) {
        successMsg.classList.remove('show');
        return;
      }

      successMsg.classList.add('show');
      form.reset();
      fields.forEach((name) => form.elements[name].classList.remove('touched'));

      setTimeout(() => {
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    });

    form.querySelectorAll('input').forEach((input) => {
      input.addEventListener('blur', () => input.classList.add('touched'));
      input.addEventListener('input', () => {
        if (input.classList.contains('touched')) input.classList.remove('touched');
      });
    });
  }
})();
