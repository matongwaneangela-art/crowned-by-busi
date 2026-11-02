/* =========================================================
   Crowned by Busi - products.js  (Shop page)
   Dynamic content: builds the product cards with JavaScript from
   window.CBB_PRODUCTS (products-data.js), then adds
   search, category filter, sorting and a quick-view modal.
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var products = window.CBB_PRODUCTS || [];
  var grid = document.getElementById('product-grid');
  var tpl = document.getElementById('product-card-template');
  if (!grid || !tpl || !products.length) return;

  var searchEl = document.getElementById('search');
  var categoryEl = document.getElementById('category');
  var sortEl = document.getElementById('sort');
  var clearBtn = document.getElementById('clear-filters');
  var emptyClear = document.getElementById('empty-clear');
  var emptyEl = document.getElementById('empty-state');
  var countEl = document.getElementById('result-count');

  var NEW_DAYS = 60;   // products added within this many days get a "New Arrival" tag
  var money = (window.CBB && window.CBB.money) || function (n) { return 'R' + n; };

  /* ---------- helpers ---------- */
  function daysSince(iso) {
    var d = new Date(iso + 'T00:00:00');
    return (Date.now() - d.getTime()) / 86400000;
  }
  function formatDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function stockInfo(p) {
    if (p.stock <= 0) return { cls: 'stock-pre', text: 'Pre-order: ready in 5–7 working days' };
    if (p.stock <= 5) return { cls: 'stock-low', text: 'Only ' + p.stock + ' left in stock' };
    return { cls: 'stock-ok', text: 'In stock' };
  }
  function findProduct(id) {
    return products.filter(function (p) { return p.id === id; })[0];
  }
  function debounce(fn, ms) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  /* ---------- filtering + sorting ---------- */
  function getResults() {
    var words = searchEl.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    var cat = categoryEl.value;

    var list = products.filter(function (p) {
      if (cat && p.category !== cat) return false;
      var haystack = (p.name + ' ' + p.description + ' ' + p.category).toLowerCase();
      /* every typed word must appear somewhere in the product text */
      return words.every(function (w) { return haystack.indexOf(w) !== -1; });
    });

    var sort = sortEl.value;
    var copy = list.slice();
    if (sort === 'price-asc') copy.sort(function (a, b) { return a.price - b.price; });
    if (sort === 'price-desc') copy.sort(function (a, b) { return b.price - a.price; });
    if (sort === 'newest') copy.sort(function (a, b) { return b.added.localeCompare(a.added); });
    if (sort === 'name') copy.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return copy;
  }

  /* ---------- rendering (template + DOM API, no innerHTML) ---------- */
  function buildCard(p, index) {
    var node = tpl.content.firstElementChild.cloneNode(true);
    node.style.setProperty('--i', Math.min(index, 12));
    node.dataset.id = p.id;

    var img = node.querySelector('img');
    img.src = p.image;
    img.alt = p.alt;

    var tag = node.querySelector('.tag');
    if (daysSince(p.added) <= NEW_DAYS) {
      tag.textContent = 'New Arrival';
      tag.classList.add('tag-new');
    } else {
      tag.textContent = p.category;
    }

    node.querySelector('h3').textContent = p.name;
    node.querySelector('.product-desc').textContent = p.description;
    node.querySelector('.price').textContent = money(p.price);

    var s = stockInfo(p);
    var stockEl = node.querySelector('.stock');
    stockEl.textContent = s.text;
    stockEl.classList.add(s.cls);

    node.querySelector('.card-date').textContent = 'Added ' + formatDate(p.added);

    var primary = node.querySelector('.card-primary-action');
    var qv = node.querySelector('.quick-view-btn');
    qv.dataset.id = p.id;
    qv.setAttribute('aria-label', 'Quick view: ' + p.name);

    if (p.lengths.length) {
      /* needs a length choice, so open the modal */
      primary.textContent = 'Choose length';
      primary.classList.add('quick-view-btn');
      primary.dataset.id = p.id;
      primary.setAttribute('aria-label', 'Choose a length for ' + p.name);
    } else {
      primary.textContent = 'Add to Cart';
      primary.classList.add('add-to-cart');     // handled by script.js (event delegation)
      primary.dataset.name = p.name;
      primary.dataset.price = p.price;
      primary.setAttribute('aria-label', 'Add ' + p.name + ' to cart');
    }
    return node;
  }

  function render() {
    var results = getResults();
    var frag = document.createDocumentFragment();
    results.forEach(function (p, i) { frag.appendChild(buildCard(p, i)); });
    grid.replaceChildren(frag);

    emptyEl.hidden = results.length !== 0;
    var cat = categoryEl.value;
    countEl.textContent = results.length === 0
      ? 'No products found.'
      : 'Showing ' + results.length + ' of ' + products.length + ' products' +
        (cat ? ' in ' + cat : '') + '.';
    syncUrl();
  }

  /* keep the address bar in step so a search can be shared or bookmarked */
  function syncUrl() {
    if (!window.history || !history.replaceState) return;
    var params = new URLSearchParams();
    if (searchEl.value.trim()) params.set('q', searchEl.value.trim());
    if (categoryEl.value) params.set('category', categoryEl.value);
    if (sortEl.value !== 'featured') params.set('sort', sortEl.value);
    var qs = params.toString();
    try {
      history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
    } catch (e) { /* file:// pages may refuse; harmless */ }
  }

  function clearFilters() {
    searchEl.value = '';
    categoryEl.value = '';
    sortEl.value = 'featured';
    render();
    searchEl.focus();
  }

  /* ---------- starting values from the URL (e.g. ?category=Wigs) ---------- */
  var params = new URLSearchParams(window.location.search);
  searchEl.value = (params.get('q') || '').slice(0, 60);
  var catParam = params.get('category');
  if (catParam && Array.prototype.some.call(categoryEl.options, function (o) { return o.value === catParam; })) {
    categoryEl.value = catParam;
  }
  var sortParam = params.get('sort');
  if (sortParam && Array.prototype.some.call(sortEl.options, function (o) { return o.value === sortParam; })) {
    sortEl.value = sortParam;
  }

  searchEl.addEventListener('input', debounce(render, 180));
  categoryEl.addEventListener('change', render);
  sortEl.addEventListener('change', render);
  clearBtn.addEventListener('click', clearFilters);
  emptyClear.addEventListener('click', clearFilters);
  /* pressing Enter in the search box must not reload the page */
  document.getElementById('catalog-toolbar').addEventListener('submit', function (e) { e.preventDefault(); });

  render();
  if (window.location.hash === '#search') searchEl.focus();

  /* ---------- Quick-view modal (native <dialog>) ---------- */
  var dialog = document.getElementById('quick-view');
  var qv = {
    img: document.getElementById('qv-image'),
    cat: document.getElementById('qv-category'),
    title: document.getElementById('qv-title'),
    desc: document.getElementById('qv-desc'),
    price: document.getElementById('qv-price'),
    stock: document.getElementById('qv-stock'),
    lengthField: document.getElementById('qv-length-field'),
    length: document.getElementById('qv-length'),
    qty: document.getElementById('qv-qty'),
    error: document.getElementById('qv-error'),
    add: document.getElementById('qv-add'),
    enquire: document.getElementById('qv-enquire')
  };
  var current = null;

  function openQuickView(p) {
    current = p;
    qv.img.src = p.image;
    qv.img.alt = p.alt;
    qv.cat.textContent = p.category;
    qv.title.textContent = p.name;
    qv.desc.textContent = p.description;
    qv.price.textContent = money(p.price);
    var s = stockInfo(p);
    qv.stock.className = 'stock ' + s.cls;
    qv.stock.textContent = s.text;
    qv.qty.value = 1;
    qv.error.textContent = '';
    qv.enquire.href = 'enquiry.html?product=' + encodeURIComponent(p.id);

    qv.length.replaceChildren();
    if (p.lengths.length) {
      p.lengths.forEach(function (n) {
        var opt = document.createElement('option');
        opt.value = n;
        opt.textContent = n + '"';
        qv.length.appendChild(opt);
      });
      qv.lengthField.hidden = false;
    } else {
      qv.lengthField.hidden = true;
    }
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');   // very old browsers: show non-modally
    }
    document.body.classList.add('no-scroll');
  }

  function closeQuickView() {
    if (dialog.open) dialog.close();
  }

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.quick-view-btn');
    if (!btn) return;
    var p = findProduct(btn.dataset.id);
    if (p) openQuickView(p);
  });

  document.getElementById('qv-close').addEventListener('click', closeQuickView);
  /* click on the dark backdrop (the <dialog> itself) closes the modal */
  dialog.addEventListener('click', function (e) { if (e.target === dialog) closeQuickView(); });
  dialog.addEventListener('close', function () { document.body.classList.remove('no-scroll'); });

  qv.add.addEventListener('click', function () {
    var qty = parseInt(qv.qty.value, 10);
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
      qv.error.textContent = 'Please choose a quantity between 1 and 10.';
      qv.qty.focus();
      return;
    }
    qv.error.textContent = '';
    var name = current.name + (current.lengths.length ? ' (' + qv.length.value + '")' : '');
    closeQuickView();
    window.CBB.addToCart(name, current.price, qty);
  });
});