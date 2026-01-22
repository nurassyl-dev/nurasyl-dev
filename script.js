document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');
  const yearEl = document.querySelector('[data-year]');
  const waNumber = '77713226575';

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 50);
  };

  const buildWaUrl = (message) =>
    `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  const scrollToTarget = (target) => {
    const el = document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = new Set();
  const registerRevealGroup = (items) => {
    let groupIndex = 0;
    items.forEach((item) => {
      if (revealItems.has(item)) return;
      item.classList.add('reveal');
      if (!prefersReducedMotion) {
        const delay = Math.min(groupIndex * 0.08, 0.32);
        item.style.setProperty('--reveal-delay', `${delay}s`);
      }
      revealItems.add(item);
      groupIndex += 1;
    });
  };

  [
    '.section-heading',
    '.hero-text > *',
    '.hero-tags > *',
    '.hero-actions > *',
    '.hero-note',
    '.hero-portrait',
    '.services-grid > *',
    '.price-grid > *',
    '.group-title',
    '.options-card',
    '.terms-grid > *',
    '.terms-note',
    '.cases-grid > *',
    '.process-step',
    '.audience-tags > *',
    '.audience-grid > *',
    '.faq-item',
    '.contact-info',
    '.contact-form-card',
    '.about',
    '.footer-inner',
  ].forEach((selector) => registerRevealGroup(document.querySelectorAll(selector)));

  if (revealItems.size) {
    const revealNow = (item) => item.classList.add('is-visible');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach(revealNow);
    } else {
      const observer = new IntersectionObserver(
        (entries, currentObserver) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              revealNow(entry.target);
              currentObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
      );
      revealItems.forEach((item) => observer.observe(item));
    }
  }

  const autoScrollContainers = document.querySelectorAll('[data-auto-scroll]');
  const autoScrollState = new Map();
  const AUTO_SCROLL_SPEED = 24;
  const AUTO_SCROLL_PAUSE = 1800;

  const setupAutoScroll = (container) => {
    if (autoScrollState.has(container)) return;

    const state = {
      rafId: null,
      lastTime: 0,
      paused: false,
      pauseTimer: null,
      maxScroll: 0,
      running: false,
    };

    const updateMetrics = () => {
      state.maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
      if (state.maxScroll === 0) {
        container.scrollLeft = 0;
      }
    };

    const step = (time) => {
      if (!state.running) return;
      if (!state.lastTime) state.lastTime = time;
      const delta = (time - state.lastTime) / 1000;
      state.lastTime = time;

      if (!state.paused && state.maxScroll > 0) {
        const next = container.scrollLeft + delta * AUTO_SCROLL_SPEED;
        container.scrollLeft = next >= state.maxScroll ? 0 : next;
      }

      state.rafId = requestAnimationFrame(step);
    };

    const start = () => {
      if (state.running) return;
      state.running = true;
      state.lastTime = 0;
      state.rafId = requestAnimationFrame(step);
    };

    const stop = () => {
      state.running = false;
      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
      }
      state.rafId = null;
    };

    const pause = () => {
      state.paused = true;
      if (state.pauseTimer) {
        clearTimeout(state.pauseTimer);
      }
    };

    const resume = () => {
      if (state.pauseTimer) {
        clearTimeout(state.pauseTimer);
      }
      state.pauseTimer = setTimeout(() => {
        state.paused = false;
      }, AUTO_SCROLL_PAUSE);
    };

    container.addEventListener('pointerdown', pause, { passive: true });
    container.addEventListener('pointerup', resume, { passive: true });
    container.addEventListener('pointercancel', resume, { passive: true });
    container.addEventListener('pointerleave', resume, { passive: true });
    container.addEventListener('touchstart', pause, { passive: true });
    container.addEventListener('touchend', resume, { passive: true });
    container.addEventListener('wheel', () => {
      pause();
      resume();
    }, { passive: true });

    state.updateMetrics = updateMetrics;
    state.start = start;
    state.stop = stop;
    autoScrollState.set(container, state);
    updateMetrics();
    start();
  };

  const updateAutoScroll = () => {
    if (prefersReducedMotion) {
      autoScrollState.forEach((state) => state.stop());
      return;
    }

    autoScrollContainers.forEach((container) => {
      setupAutoScroll(container);
      const state = autoScrollState.get(container);
      state.updateMetrics();
      if (state.maxScroll > 0) {
        state.start();
      } else {
        state.stop();
      }
    });
  };

  if (autoScrollContainers.length) {
    updateAutoScroll();
    window.addEventListener('resize', updateAutoScroll);
  }

  const parallaxItems = [];
  const PARALLAX_RANGE = 120;
  const registerParallax = (selector, strength) => {
    document.querySelectorAll(selector).forEach((item) => {
      if (item.classList.contains('parallax')) return;
      item.classList.add('parallax');
      item.style.setProperty('--parallax-strength', strength);
      parallaxItems.push(item);
    });
  };

  if (!prefersReducedMotion) {
    registerParallax('.hero-bg', 0.35);
    registerParallax('.hero-inner', 0.12);
    registerParallax('.section > .container-tight', 0.08);
  }

  if (parallaxItems.length) {
    let parallaxTicking = false;
    const updateParallax = () => {
      const viewportHeight = window.innerHeight;
      parallaxItems.forEach((item) => {
        const strength = parseFloat(item.style.getPropertyValue('--parallax-strength')) || 0.1;
        const rect = item.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
        const translate = -offset * strength * PARALLAX_RANGE;
        item.style.setProperty('--parallax-offset', `${translate.toFixed(2)}px`);
      });
    };

    const onScroll = () => {
      if (parallaxTicking) return;
      parallaxTicking = true;
      requestAnimationFrame(() => {
        updateParallax();
        parallaxTicking = false;
      });
    };

    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      event.preventDefault();
      scrollToTarget(href);
    });
  });

  document.querySelectorAll('[data-scroll]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-scroll');
      if (target) {
        scrollToTarget(target);
      }
    });
  });

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.classList.toggle('is-open', isOpen);
    });

    mobileMenu.querySelectorAll('a, button').forEach((item) => {
      item.addEventListener('click', () => {
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('is-open');
      });
    });
  }

  const faqItems = document.querySelectorAll('.faq-item');
  const setFaqState = (item, isOpen) => {
    const button = item.querySelector('.faq-question');
    const content = item.querySelector('.faq-answer');
    if (!button || !content) return;

    item.classList.toggle('is-open', isOpen);
    button.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      content.hidden = false;
      content.style.maxHeight = `${content.scrollHeight}px`;
    } else {
      content.style.maxHeight = '0px';
      content.addEventListener(
        'transitionend',
        () => {
          if (!item.classList.contains('is-open')) {
            content.hidden = true;
          }
        },
        { once: true }
      );
    }
  };

  faqItems.forEach((item) => {
    const button = item.querySelector('.faq-question');
    const content = item.querySelector('.faq-answer');
    if (!button || !content) return;

    content.style.maxHeight = '0px';
    content.hidden = true;

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      faqItems.forEach((other) => setFaqState(other, false));
      setFaqState(item, !isOpen);
    });
  });

  window.addEventListener('resize', () => {
    faqItems.forEach((item) => {
      if (item.classList.contains('is-open')) {
        const content = item.querySelector('.faq-answer');
        if (content) {
          content.style.maxHeight = `${content.scrollHeight}px`;
        }
      }
    });
  });

  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      const name = (data.name || '').trim();
      const contact = (data.contact || '').trim();
      const message = (data.message || '').trim();
      const lines = [
        'Здравствуйте! Заявка с сайта.',
        `Имя: ${name || 'Не указано'}`,
        `Контакт: ${contact || 'Не указан'}`,
        `Сообщение: ${message || 'Без сообщения'}`,
      ];
      window.open(buildWaUrl(lines.join('\n')), '_blank');
      form.reset();
    });
  }

  document.querySelectorAll('#price .price-card .btn-secondary').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.price-card');
      if (!card) return;
      const title = card.querySelector('h4')?.textContent?.trim() || 'Проект';
      const price = card.querySelector('.price')?.textContent?.trim();
      let message = `Здравствуйте! Меня интересует: ${title}`;
      if (price) {
        message += ` (${price})`;
      }
      message += '. Хотел(а) бы обсудить детали.';
      window.open(buildWaUrl(message), '_blank');
    });
  });

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  window.addEventListener('scroll', setHeaderState);
  setHeaderState();
});
