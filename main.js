/* ═══════════════════════════════════════════
   GENEVA HÔTEL — Shared JS
═══════════════════════════════════════════ */

// ── Nav scroll ──────────────────────────────
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('solid', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Active nav link ──────────────────────────
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(a => {
  if (a.getAttribute('href') === currentPage) a.classList.add('active');
});

// ── Mobile menu ──────────────────────────────
const drawer = document.getElementById('drawer');
const burger = document.getElementById('burger');
function toggleDrawer(open) {
  drawer.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
  burger.querySelectorAll('span')[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
  burger.querySelectorAll('span')[1].style.opacity = open ? '0' : '1';
  burger.querySelectorAll('span')[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
}
burger?.addEventListener('click', () => toggleDrawer(!drawer.classList.contains('open')));
drawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleDrawer(false)));

// ── Scroll reveal ────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// ── Parallax (lightweight) ───────────────────
const parallaxEls = document.querySelectorAll('[data-parallax]');
if (parallaxEls.length && window.innerWidth > 768) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        parallaxEls.forEach(el => {
          const rect = el.getBoundingClientRect();
          const speed = parseFloat(el.dataset.parallax) || 0.3;
          const offset = (rect.top - window.innerHeight / 2) * speed;
          el.style.transform = `translateY(${offset}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ── Cursor glow (desktop only) ───────────────
if (window.innerWidth > 1024 && !window.matchMedia('(pointer: coarse)').matches) {
  const cursor = document.createElement('div');
  cursor.id = 'cursor-glow';
  cursor.style.cssText = `
    position:fixed;width:320px;height:320px;
    border-radius:50%;pointer-events:none;z-index:9998;
    background:radial-gradient(circle,rgba(201,168,92,0.04) 0%,transparent 70%);
    transition:transform 0.15s ease;transform:translate(-50%,-50%);
    top:0;left:0;
  `;
  document.body.appendChild(cursor);
  window.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  }, { passive: true });
}

// ── Booking date defaults ────────────────────
function initBookingDates() {
  const ci = document.getElementById('checkin');
  const co = document.getElementById('checkout');
  if (!ci || !co) return;
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  const t1 = new Date(today); t1.setDate(today.getDate() + 1);
  const t2 = new Date(today); t2.setDate(today.getDate() + 2);
  ci.min = fmt(today); ci.value = fmt(t1);
  co.min = fmt(t1);    co.value = fmt(t2);
  ci.addEventListener('change', () => {
    const next = new Date(ci.value); next.setDate(next.getDate() + 1);
    co.min = fmt(next);
    if (co.value <= ci.value) co.value = fmt(next);
  });
}
initBookingDates();

// ── Counter animation ────────────────────────
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.round(current) + suffix;
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}
const counterSection = document.querySelector('[data-counters]');
if (counterSection) {
  const co = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { animateCounters(); co.disconnect(); }
  }, { threshold: 0.3 });
  co.observe(counterSection);
}

// ── Google Translate i18n ────────────────────
function initLanguageSwitcher() {
  // 1. Inject hidden Google Translate div
  const container = document.createElement('div');
  container.id = 'google_translate_element';
  container.style.display = 'none';
  document.body.appendChild(container);

  // 2. Setup init function
  window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
      pageLanguage: 'fr',
      includedLanguages: 'en,fr',
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false
    }, 'google_translate_element');
  };

  // 3. Load script
  const script = document.createElement('script');
  script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.head.appendChild(script);

  // 4. Handle language switch clicks
  const triggerTranslation = (lang) => {
    const select = document.querySelector('select.goog-te-combo');
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
    }
  };

  // Determine current lang from cookie
  const getLangCookie = () => {
    const match = document.cookie.match(/googtrans=\/fr\/([a-z]{2})/);
    return match ? match[1] : 'fr';
  };

  const updateActiveStates = () => {
    const currentLang = getLangCookie();
    document.querySelectorAll('.nav-lang a').forEach(a => {
      if(a.dataset.lang === currentLang) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  };

  // Set initial states
  setTimeout(updateActiveStates, 500);

  document.querySelectorAll('.nav-lang a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = e.target.dataset.lang;
      
      // If switching to French (default), we can also clear the cookie and reload, 
      // or just select "fr" if available in combo.
      // Often, setting combo to 'fr' works, or restoring original text works.
      const select = document.querySelector('select.goog-te-combo');
      if (lang === 'fr') {
        // Clear cookies to revert completely
        document.cookie = 'googtrans=/fr/fr; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'googtrans=/fr/fr; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=' + window.location.hostname + '; path=/;';
        // The safest way to revert is reload, but try to trigger translation first
        if (select) {
           select.value = 'fr';
           select.dispatchEvent(new Event('change'));
        } else {
           window.location.reload();
        }
        
        // Ensure UI updates if no reload happens
        setTimeout(() => window.location.reload(), 300);
      } else {
        triggerTranslation(lang);
      }
      
      // update active classes locally before reload
      document.querySelectorAll('.nav-lang a').forEach(link => link.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
}
initLanguageSwitcher();
