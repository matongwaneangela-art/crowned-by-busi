/* =========================================================
   Crowned by Busi - shared script (loaded on every page)
   Part 2: mobile menu, hero slider, shopping bag
   Part 3: saved bag, accordion, tabs, scroll animations,
           back-to-top button (see README changelog)
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {

  /* Small shared toolkit other scripts can use (products.js etc.) */
  window.CBB = window.CBB || {};

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile menu ---------- */
  var hamburger = document.getElementById('hamburger');
  var nav = document.getElementById('main-nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
      hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  /* ---------- Hero photo slider (home page only) ----------
     The photos sit side by side in a track. Showing a slide moves the track
     sideways. Arrows, dots, swiping and (unless the visitor wants less
     motion) automatic sliding all call showSlide(). */
  var slider = document.getElementById('hero-slider');
  if (slider) {
    var viewport = slider.querySelector('.hero-viewport');
    var track = slider.querySelector('.hero-track');
    var slides = slider.querySelectorAll('.hero-panel');
    var dots = slider.querySelectorAll('.hero-dot');
    var current = 0;
    var timer = null;

    function showSlide(i) {
      current = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * current) + '%)';
      slides.forEach(function (s, n) {
        s.setAttribute('aria-hidden', n === current ? 'false' : 'true');
        s.tabIndex = n === current ? 0 : -1;   /* hidden photos are skipped by the Tab key */
      });
      dots.forEach(function (d, n) {
        d.classList.toggle('is-active', n === current);
        if (n === current) { d.setAttribute('aria-current', 'true'); } else { d.removeAttribute('aria-current'); }
      });
    }
    function next() { showSlide(current + 1); }
    function prev() { showSlide(current - 1); }
    /* do not auto-slide for people who asked for less motion */
    function start() { stop(); if (!reduceMotion) { timer = setInterval(next, 5000); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    document.getElementById('hero-next').addEventListener('click', function () { next(); start(); });
    document.getElementById('hero-prev').addEventListener('click', function () { prev(); start(); });
    dots.forEach(function (d, n) {
      d.addEventListener('click', function () { showSlide(n); start(); });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', function () { if (document.hidden) { stop(); } else { start(); } });

    /* Swipe (or drag with the mouse) left or right to change photo */
    var startX = null, startY = null, swiped = false;
    viewport.addEventListener('pointerdown', function (e) { startX = e.clientX; startY = e.clientY; swiped = false; stop(); });
    viewport.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      startX = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        swiped = true;
        if (dx < 0) { next(); } else { prev(); }
      }
      start();
    });
    viewport.addEventListener('pointercancel', function () { startX = null; start(); });
    /* a swipe that ends on a photo should not also open that photo's link */
    viewport.addEventListener('click', function (e) { if (swiped) { e.preventDefault(); swiped = false; } }, true);

    showSlide(0);
    start();
  }

  /* ---------- Cart ---------- */
  var STORAGE_KEY = 'cbb-cart-v1';
  var cart = [];
  var drawer = document.getElementById('cart-drawer');
  var overlay = document.getElementById('cart-overlay');
  var toggleBtn = document.getElementById('cart-toggle');
  var closeBtn = document.getElementById('cart-close');
  var itemsEl = document.getElementById('cart-items');
  var countEl = document.getElementById('cart-count');
  var subtotalEl = document.getElementById('cart-subtotal');
  var checkoutBtn = document.getElementById('cart-checkout');
  var noteEl = document.getElementById('cart-note');

  function money(n) {
    return 'R' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  window.CBB.money = money;

  /* Part 3: the bag is remembered in the browser (localStorage) so it
     survives moving between pages. Wrapped in try/catch because storage
     can be blocked (private mode, strict browser settings). */
  function loadCart() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(saved)) return [];
      return saved.filter(function (i) {
        return i && typeof i.name === 'string' &&
          typeof i.price === 'number' && i.price >= 0 &&
          Number.isInteger(i.qty) && i.qty > 0 && i.qty <= 99;
      });
    } catch (e) { return []; }
  }
  function saveCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) { /* ignore */ }
  }

  function setDrawerOpen(open) {
    drawer.classList.toggle('is-open', open);
    overlay.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    /* inert keeps the hidden drawer's buttons out of the tab order */
    if ('inert' in drawer) { drawer.inert = !open; }
  }
  function openCart() {
    setDrawerOpen(true);
    closeBtn.focus();
  }
  function closeCart() {
    if (!drawer.classList.contains('is-open')) return;
    setDrawerOpen(false);
    toggleBtn.focus();
  }

  function renderCart() {
    itemsEl.innerHTML = '';
    var total = 0;
    var count = 0;

    if (cart.length === 0) {
      var empty = document.createElement('li');
      empty.className = 'cart-empty';
      empty.id = 'cart-empty';
      empty.textContent = 'Your bag is empty. Start adding some hair! 💇🏾‍♀️';
      itemsEl.appendChild(empty);
    }

    cart.forEach(function (item, index) {
      total += item.price * item.qty;
      count += item.qty;

      var li = document.createElement('li');
      li.className = 'cart-item';

      var info = document.createElement('div');
      var name = document.createElement('div');
      name.className = 'cart-item-name';
      name.textContent = item.name;
      var price = document.createElement('div');
      price.className = 'cart-item-price';
      price.textContent = money(item.price);
      info.appendChild(name);
      info.appendChild(price);

      var qty = document.createElement('div');
      qty.className = 'cart-item-qty';
      var minus = document.createElement('button');
      minus.textContent = '−';
      minus.setAttribute('aria-label', 'Decrease quantity of ' + item.name);
      minus.addEventListener('click', function () {
        item.qty -= 1;
        if (item.qty <= 0) cart.splice(index, 1);
        renderCart();
      });
      var num = document.createElement('span');
      num.textContent = item.qty;
      var plus = document.createElement('button');
      plus.textContent = '+';
      plus.setAttribute('aria-label', 'Increase quantity of ' + item.name);
      plus.addEventListener('click', function () {
        if (item.qty < 99) item.qty += 1;
        renderCart();
      });
      qty.appendChild(minus);
      qty.appendChild(num);
      qty.appendChild(plus);

      var remove = document.createElement('button');
      remove.className = 'cart-item-remove';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', 'Remove ' + item.name + ' from bag');
      remove.addEventListener('click', function () {
        cart.splice(index, 1);
        renderCart();
      });

      li.appendChild(info);
      li.appendChild(qty);
      li.appendChild(remove);
      itemsEl.appendChild(li);
    });

    countEl.textContent = count;
    subtotalEl.textContent = money(total);
    if (noteEl) noteEl.textContent = '';
    saveCart();
  }

  /* One function adds to the bag, whichever page the button is on */
  function addToCart(name, price, qty) {
    qty = qty || 1;
    price = Number(price);
    if (!name || !isFinite(price) || price < 0) return;
    var existing = cart.find(function (i) { return i.name === name; });
    if (existing) {
      existing.qty = Math.min(99, existing.qty + qty);
    } else {
      cart.push({ name: name, price: price, qty: qty });
    }
    renderCart();
    openCart();
  }
  window.CBB.addToCart = addToCart;

  /* Event delegation: a single listener handles every "Add to Cart" button,
     including buttons that products.js creates later. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.add-to-cart[data-name]');
    if (!btn) return;
    addToCart(btn.getAttribute('data-name'), btn.getAttribute('data-price'), 1);
  });

  toggleBtn.addEventListener('click', openCart);
  closeBtn.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCart();
  });
  checkoutBtn.addEventListener('click', function () {
    if (!noteEl) return;
    noteEl.textContent = cart.length === 0
      ? 'Your bag is empty.'
      : 'Thank you! Online checkout is coming soon. For now, send us your bag through the enquiry page or visit the shop.';
  });

  cart = loadCart();
  setDrawerOpen(false);
  renderCart();

  /* ---------- Accordion (contact page FAQs) ---------- */
  document.querySelectorAll('[data-accordion]').forEach(function (acc) {
    var triggers = acc.querySelectorAll('.accordion-trigger');

    function setOpen(trigger, open) {
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (panel) panel.hidden = !open;
    }

    triggers.forEach(function (t) {
      t.addEventListener('click', function () {
        var isOpen = t.getAttribute('aria-expanded') === 'true';
        /* data-single on the container => only one answer open at a time */
        if (acc.hasAttribute('data-single')) {
          triggers.forEach(function (o) { setOpen(o, false); });
        }
        setOpen(t, !isOpen);
      });
    });
  });

  /* ---------- Tabs (about page) ---------- */
  document.querySelectorAll('[data-tabs]').forEach(function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));

    function activate(tab, setFocus) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute('aria-selected', selected ? 'true' : 'false');
        t.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
      if (setFocus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(tab, false); });
      /* Arrow keys / Home / End move between tabs (WAI-ARIA tabs pattern) */
      tab.addEventListener('keydown', function (e) {
        var target = null;
        if (e.key === 'ArrowRight') target = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') target = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') target = tabs[0];
        if (e.key === 'End') target = tabs[tabs.length - 1];
        if (target) { e.preventDefault(); activate(target, true); }
      });
    });

    /* Deep links such as about.html#pledge open the matching tab */
    function fromHash() {
      var id = window.location.hash.replace('#', '');
      if (!id) return;
      var match = tabs.filter(function (t) { return t.getAttribute('aria-controls') === id; })[0];
      if (match) activate(match, false);
    }
    fromHash();
    window.addEventListener('hashchange', fromHash);
  });

  /* ---------- Scroll-reveal animation ---------- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    var targets = document.querySelectorAll(
      'main .section-title, main .special-card, main .category-card, ' +
      'main .about-text, main .about-image, main .form-card, main .info-card, ' +
      'main .accordion, main .map-wrap, main .cta-strip, #new-arrivals .product-card');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) {
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  /* ---------- Swipeable product row: progress bar (home page) ---------- */
  var carousel = document.getElementById('arrivals-carousel');
  var progressBar = document.querySelector('.carousel-progress span');
  if (carousel && progressBar) {
    var updateProgress = function () {
      var max = carousel.scrollWidth - carousel.clientWidth;
      var track = progressBar.parentNode.clientWidth;
      /* the bar is as wide as the visible part of the row, and slides as you scroll */
      var width = max > 0 ? Math.max(18, (carousel.clientWidth / carousel.scrollWidth) * 100) : 100;
      progressBar.style.width = width + '%';
      var ratio = max > 0 ? carousel.scrollLeft / max : 0;
      progressBar.style.transform = 'translateX(' + ((track - progressBar.offsetWidth) * ratio) + 'px)';
    };
    carousel.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  /* ---------- "Filter and sort" button (products page, phones) ----------
     On small screens the search toolbar is a sheet that slides up from the
     bottom. The pill button opens and closes it. */
  var filterToggle = document.getElementById('filter-toggle');
  var filterBar = document.getElementById('catalog-toolbar');
  var filterLabel = document.getElementById('filter-toggle-label');
  if (filterToggle && filterBar && filterLabel) {
    var setFilterOpen = function (open) {
      filterBar.classList.toggle('is-open', open);
      filterToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      filterLabel.textContent = open ? 'Show results' : 'Filter and sort';
    };
    filterToggle.addEventListener('click', function () {
      setFilterOpen(!filterBar.classList.contains('is-open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && filterBar.classList.contains('is-open')) {
        setFilterOpen(false);
        filterToggle.focus();
      }
    });
    /* the header search icon links to products.html#search */
    if (location.hash === '#search') {
      var searchBox = document.getElementById('search');
      if (window.matchMedia('(max-width: 680px)').matches) setFilterOpen(true);
      if (searchBox) searchBox.focus();
    }
  }

  /* ---------- Newsletter sign-up (footer, every page) ----------
     This site has no server to store subscribers, so after the email is
     validated we prepare a sign-up email the visitor sends to the shop
     (the same approach as the contact form). */
  var newsletterForm = document.getElementById('newsletter-form');
  var newsletterInput = document.getElementById('newsletter-email');
  var newsletterMsg = document.getElementById('newsletter-msg');
  if (newsletterForm && newsletterInput && newsletterMsg) {
    var SHOP_EMAIL = 'hello@crownedbybusi.co.za';
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = newsletterInput.value.trim();
      newsletterMsg.textContent = '';
      newsletterInput.removeAttribute('aria-invalid');

      if (!email) {
        newsletterInput.setAttribute('aria-invalid', 'true');
        newsletterMsg.textContent = 'Please enter your email address.';
        newsletterInput.focus();
        return;
      }
      if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        newsletterInput.setAttribute('aria-invalid', 'true');
        newsletterMsg.textContent = 'Please enter a valid email address, for example name@example.com.';
        newsletterInput.focus();
        return;
      }

      var link = document.createElement('a');
      link.href = 'mailto:' + SHOP_EMAIL +
        '?subject=' + encodeURIComponent('Crown Club sign-up') +
        '&body=' + encodeURIComponent('Hi Crowned by Busi,\n\nPlease add ' + email +
          ' to the Crown Club list for new bundles, limited drops and weekly specials.\n');
      link.textContent = 'send the sign-up email';
      newsletterMsg.appendChild(document.createTextNode('Looks good! To finish joining, '));
      newsletterMsg.appendChild(link);
      newsletterMsg.appendChild(document.createTextNode('.'));
    });
  }

  /* ---------- Back-to-top button (created with the DOM API) ---------- */
  var topBtn = document.createElement('button');
  topBtn.type = 'button';
  topBtn.className = 'back-to-top';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.textContent = '↑';
  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  document.body.appendChild(topBtn);
  window.addEventListener('scroll', function () {
    topBtn.classList.toggle('is-shown', window.scrollY > 700);
  }, { passive: true });
});