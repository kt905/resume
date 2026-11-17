/* ==========================================================================
   Pixel mascot bootstrap — bubble copy + intro trigger.
   Mirrors the small piece of the sebg.ch page script that drives the
   mascot bubble, so the ported Mascot bundle behaves exactly like the
   original on this page.
   ========================================================================== */
import { g as gsap } from './seb/index.CzGW6FVa.js';
import { S as ScrollTrigger } from './seb/ScrollTrigger.DNECHiyU.js';

gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const speed = reduce ? 0 : 1;

const bubble = document.querySelector('.mascot-bubble');
const body = bubble ? bubble.querySelector('.mascot-bubble__body') : null;
const lines = bubble ? Array.from(bubble.querySelectorAll('.bubble-line')) : [];
const clip = lines.length ? lines[0].parentElement : null;

function boot() {
  if (!body || !lines.length || !clip) return;

  const returning = localStorage.getItem('visited') === 'yes';
  localStorage.setItem('visited', 'yes');

  let current = -1;
  let visible = false;

  gsap.set(lines, { opacity: 0 });
  gsap.set(body, { scale: 0.9 });

  const show = (index, on) => {
    if (!on) {
      if (visible) {
        gsap.to(body, { opacity: 0, scale: 0.9, duration: 0.25, ease: 'power2.in', overwrite: true });
        visible = false;
      }
      return;
    }

    if (current !== index) {
      const height = clip.offsetHeight;
      if (current > -1) {
        lines[current].classList.add('absolute');
        gsap.to(lines[current], { opacity: 0, duration: 0.15 * speed, overwrite: true });
      }
      lines[index].classList.remove('absolute');
      gsap.to(lines[index], { opacity: 1, duration: 0.3 * speed, overwrite: true, delay: 0.15 * speed });
      if (speed) {
        gsap.fromTo(clip, { height }, { height: clip.offsetHeight, duration: 0.45, ease: 'power3.inOut', clearProps: 'height' });
      }
      current = index;
      window.dispatchEvent(new CustomEvent('mascot:say'));
    }

    if (!visible) {
      gsap.to(body, { opacity: 1, scale: 1, duration: 0.5 * speed, ease: 'back.out(1.7)', overwrite: true });
      visible = true;
    }
  };

  const first = returning ? Math.max(0, lines.findIndex((l) => l.hasAttribute('data-returning-line'))) : 0;

  const hero = document.querySelector('.hero');

  ScrollTrigger.create({
    trigger: hero,
    start: 'top bottom',
    end: 'bottom 60%',
    onToggle: ({ isActive }) => show(first, isActive),
  });

  // Make sure the first line is up as soon as we land, even if the trigger
  // was created while the layout was still settling.
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    const r = hero.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) show(first, true);
  });
}

/* The mascot bundle boots its intro on `astro:page-load`. Fire it once the
   loading curtain has left so the little guy drops in where he can be seen. */
function firePageLoad() {
  document.dispatchEvent(new Event('astro:page-load'));
}

const loading = document.querySelector('.loading-container');
if (!loading) {
  window.addEventListener('load', () => window.setTimeout(firePageLoad, 120));
} else {
  const observer = new MutationObserver(() => {
    if (!document.contains(loading)) {
      observer.disconnect();
      window.setTimeout(firePageLoad, 100);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.setTimeout(() => {
    observer.disconnect();
    firePageLoad();
  }, 8000);
}

window.addEventListener('mascot:land', boot, { once: true });
