/* ==========================================================================
   July — Front-end Developer
   Small, dependency-free behaviours: reveals, floating nav, work tour, clock.
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------ loading screen */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loading = document.querySelector('.loading-container');
  let introRunning = false;

  if (loading) {
    const html = document.documentElement;
    const hero = document.querySelector('.hero');
    const heroBits = hero ? Array.from(hero.querySelectorAll('[data-reveal]')) : [];
    const wordsBox = loading.querySelector('.loading-words');
    const words = Array.from(loading.querySelectorAll('.loading-words h2.home-active'));
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    /* Jump to the top without animating, whatever scroll-behavior says. */
    const jumpTop = () => {
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      html.style.scrollBehavior = prev;
    };

    /* Anything that tries to move the page while the curtain is up — a restored
       position, a #hash fragment, an image landing — gets pinned back to the top.
       Without this the page can creep down and then slide on unlock. */
    const pinTop = () => {
      if (html.classList.contains('no-scroll')) jumpTop();
    };

    const unlock = () => {
      html.classList.remove('no-scroll', 'is-loading');
      document.body.style.paddingRight = '';
      window.removeEventListener('scroll', pinTop);
      jumpTop();
    };

    /* A restored position or a #hash could otherwise be applied the moment the
       scroll lock lifts, which reads as the page sliding off by itself. */
    jumpTop();
    html.classList.add('no-scroll');
    window.addEventListener('scroll', pinTop, { passive: true });

    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = scrollBarWidth + 'px';
    }

    if (reduced) {
      words.forEach((el) => (el.style.display = 'none'));
      loading.classList.add('is-done');
      unlock();
      window.setTimeout(() => loading.remove(), 50);
    } else {
      introRunning = true;
      html.classList.add('is-loading');

      /* The greeting stack sits hidden; the hero waits a viewport-and-a-half
         lower and rises into place as the curtain lifts (Dennis-style). */
      if (wordsBox) wordsBox.style.opacity = '0';
      words.forEach((el, i) => {
        el.style.display = 'flex';
        el.style.transition = 'opacity 0.14s linear';
        el.style.opacity = i === 0 ? '1' : '0';
      });
      if (hero) hero.classList.add('is-intro');

      const wordStart = 900;
      const wordStep = 150;

      /* 1 — the first hello fades up */
      window.setTimeout(() => {
        if (!wordsBox) return;
        wordsBox.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        wordsBox.style.opacity = '1';
      }, 500);

      /* 2 — the hellos flick past, one every 150ms */
      words.forEach((el, i) => {
        if (!i) return;
        window.setTimeout(() => {
          words[i - 1].style.opacity = '0';
          el.style.opacity = '1';
        }, wordStart + i * wordStep);
      });

      /* 3 — the curtain lifts while the hero rises from below */
      const curtainAt = wordStart + words.length * wordStep + 150;

      window.setTimeout(() => {
        loading.classList.add('is-out');
        if (wordsBox) {
          wordsBox.style.transition = 'opacity 0.3s linear';
          wordsBox.style.opacity = '0';
        }

        window.setTimeout(() => {
          if (hero) {
            hero.classList.remove('is-intro');
            hero.classList.add('is-rise');
            heroBits.forEach((el, i) => {
              el.style.setProperty('--rise-d', `${i * 70}ms`);
              el.classList.add('is-in');
            });
            window.setTimeout(() => {
              hero.classList.remove('is-rise');
              heroBits.forEach((el) => el.style.removeProperty('--rise-d'));
            }, 1900);
          }
          introRunning = false;
        }, 200);

        window.setTimeout(() => {
          unlock();
          loading.classList.add('is-done');
          window.setTimeout(() => loading.remove(), 600);
        }, 1200);
      }, curtainAt);
    }
  }

  const raf = (fn) => requestAnimationFrame(fn);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------------------------------------------------------------- reveal */
  const revealTargets = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    revealTargets.forEach((el) => io.observe(el));

    // the hero is above the fold: stage its intro right away
    // (the loading timeline drives the hero rise itself while the curtain lifts)
    const heroBits = document.querySelectorAll('.hero [data-reveal]');
    if (!introRunning) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => heroBits.forEach((el) => el.classList.add('is-in')));
      });
    }
  } else {
    revealTargets.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------------------------------------------------------- floating nav */
  const topbar = document.getElementById('topbar');
  const hero = document.querySelector('.hero');

  if (topbar && hero) {
    let navVisible = false;
    const syncNav = () => {
      const show = window.scrollY > hero.offsetHeight * 0.72;
      if (show !== navVisible) {
        navVisible = show;
        topbar.classList.toggle('is-visible', show);
      }
    };
    syncNav();
    window.addEventListener('scroll', syncNav, { passive: true });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(syncNav, 100);
    });
  }

  /* ------------------------------------------------------------- work tour */
  const tour = document.querySelector('[data-tour]');

  if (tour) {
    const stage = tour.querySelector('.tour__stage');
    const items = Array.from(tour.querySelectorAll('.tour__item'));
    const shots = Array.from(tour.querySelectorAll('.browser__screen img'));
    const hosts = Array.from(tour.querySelectorAll('.browser__host span'));
    const bars = Array.from(tour.querySelectorAll('.tour__progress i'));

    /* 底色取项目官网主色，但要压淡：主色只占 BRAND_SHARE，其余混纸色。
       数值越小底色越浅，想再淡一点改这里即可。 */
    const BRAND_SHARE = 0.32;
    const PAPER = '#fbfbf8';
    const INK = '#0b0c0b';

    const fallbackBrands = ['#fe8401', '#db0507', '#172a88', '#19498d'];

    const parseHex = (hex) => {
      const h = hex.replace('#', '');
      const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const toHex = (rgb) => '#' + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
    const relLum = (rgb) => {
      const [r, g, b] = rgb.map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a, b) => {
      const l1 = relLum(a);
      const l2 = relLum(b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const blend = (from, to, t) => from.map((v, i) => v + (to[i] - v) * t);

    /* 品牌色按比例混进纸色，得到浅色底 */
    const lighten = (hex, share) => toHex(blend(parseHex(PAPER), parseHex(hex), share));

    /* 在 bg → ink 之间找到刚好达到目标对比度的那一档颜色 */
    const tone = (inkHex, bgHex, target) => {
      const ink = parseHex(inkHex);
      const bg = parseHex(bgHex);
      for (let t = 0.4; t <= 1.0001; t += 0.01) {
        const c = blend(bg, ink, t).map(Math.round);
        if (contrast(c, bg) >= target) return `rgb(${c.join(' ')})`;
      }
      return inkHex;
    };

    /* 每个项目用自己官网的主色做底色，文字色按对比度自动选深/浅 */
    const tints = items.map((el, k) => {
      const brand = el.dataset.brand || fallbackBrands[k % fallbackBrands.length];
      const bg = lighten(brand, BRAND_SHARE);
      const ink =
        contrast(parseHex(INK), parseHex(bg)) >= contrast(parseHex(PAPER), parseHex(bg)) ? INK : PAPER;
      return {
        brand,
        bg,
        ink,
        sub: tone(ink, bg, 6),
        dim: tone(ink, bg, 4.5),
        soft: tone(ink, bg, 4)
      };
    });

    const count = items.length;
    let active = -1;

    const setActive = (i) => {
      if (i === active) return;
      active = i;

      items.forEach((el, k) => {
        el.classList.toggle('is-on', k === i);
        el.setAttribute('aria-hidden', k === i ? 'false' : 'true');
      });
      shots.forEach((el, k) => el.classList.toggle('is-on', k === i));
      hosts.forEach((el, k) => el.classList.toggle('is-on', k === i));

      const tint = tints[i % tints.length];
      tour.style.setProperty('--tour-bg', tint.bg);
      tour.style.setProperty('--tour-ink', tint.ink);
      tour.style.setProperty('--tour-sub', tint.sub);
      tour.style.setProperty('--tour-dim', tint.dim);
      tour.style.setProperty('--tour-soft', tint.soft);
    };

    const updateTour = () => {
      const stageH = stage.offsetHeight || window.innerHeight;
      const distance = Math.max(1, tour.offsetHeight - stageH);
      const top = tour.getBoundingClientRect().top;
      const p = clamp(-top / distance, 0, 1);
      const pos = p * count;

      setActive(clamp(Math.floor(pos), 0, count - 1));

      bars.forEach((bar, k) => {
        const local = clamp(pos - k, 0, 1);
        bar.style.scale = `${local} 1`;
      });
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf(() => {
        updateTour();
        ticking = false;
      });
    };

    updateTour();
    window.addEventListener('scroll', onScroll, { passive: true });

    let tourResizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(tourResizeTimer);
      tourResizeTimer = setTimeout(() => {
        updateTour();
        onScroll();
      }, 100);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateTour).catch(() => {});
    }
  }

  /* ---------------------------------------------------------------- bubble */
  const bubble = document.getElementById('bubble');

  if (bubble) {
    const lines = Array.from(bubble.querySelectorAll('.bubble__line'));
    let current = 0;

    bubble.addEventListener('click', () => {
      lines[current].classList.remove('is-on');
      current = (current + 1) % lines.length;
      lines[current].classList.add('is-on');
    });
  }

  /* ----------------------------------------------------------------- clock */
  const clock = document.getElementById('clock');

  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Shanghai',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const tick = () => {
      clock.textContent = fmt.format(new Date());
    };
    tick();
    let timer = window.setInterval(tick, 15000);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(timer);
      } else {
        tick();
        timer = window.setInterval(tick, 15000);
      }
    });
  }
})();