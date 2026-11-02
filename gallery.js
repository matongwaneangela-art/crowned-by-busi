/* =========================================================
   Crowned by Busi - gallery.js  (Gallery page)
   - category filter buttons
   - lightbox: click a photo to see it larger (native <dialog>)
     with previous / next buttons, arrow keys, swipe and Esc
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var grid = document.getElementById('gallery-grid');
  var lightbox = document.getElementById('lightbox');
  if (!grid || !lightbox) return;

  var chips = document.querySelectorAll('.chip[data-filter]');
  var countEl = document.getElementById('gallery-count');
  var imgEl = document.getElementById('lb-img');
  var capEl = document.getElementById('lb-caption');
  var numEl = document.getElementById('lb-count');

  var shown = [];     // the <a> links currently visible (respecting the filter)
  var index = 0;

  /* ---------- filter ---------- */
  function applyFilter(category) {
    var total = 0;
    grid.querySelectorAll('li').forEach(function (li) {
      var match = category === 'all' || li.dataset.category === category;
      li.hidden = !match;
      if (match) total += 1;
    });
    chips.forEach(function (c) {
      c.setAttribute('aria-pressed', c.dataset.filter === category ? 'true' : 'false');
    });
    countEl.textContent = 'Showing ' + total + ' photo' + (total === 1 ? '' : 's') +
      (category === 'all' ? '.' : ' in ' + category + '.');
  }
  chips.forEach(function (c) {
    c.addEventListener('click', function () { applyFilter(c.dataset.filter); });
  });
  applyFilter('all');

  /* ---------- lightbox ---------- */
  function visibleLinks() {
    return Array.prototype.filter.call(grid.querySelectorAll('.gallery-item'), function (a) {
      return !a.closest('li').hidden;
    });
  }

  function show(i) {
    index = (i + shown.length) % shown.length;
    var link = shown[index];
    var thumb = link.querySelector('img');
    imgEl.src = link.getAttribute('href');
    imgEl.alt = thumb ? thumb.alt : '';
    capEl.textContent = link.dataset.caption || '';
    numEl.textContent = (index + 1) + ' / ' + shown.length;
    /* warm the cache for the neighbours so next/prev feels instant */
    [index - 1, index + 1].forEach(function (n) {
      var l = shown[(n + shown.length) % shown.length];
      if (l) { new Image().src = l.getAttribute('href'); }
    });
  }

  function open(link) {
    shown = visibleLinks();
    show(shown.indexOf(link));
    if (typeof lightbox.showModal === 'function') {
      lightbox.showModal();
    } else {
      lightbox.setAttribute('open', '');
    }
    document.body.classList.add('no-scroll');
  }
  function close() { if (lightbox.open) lightbox.close(); }

  grid.addEventListener('click', function (e) {
    var link = e.target.closest('.gallery-item');
    if (!link) return;
    e.preventDefault();          // without JavaScript the link simply opens the image
    open(link);
  });

  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', function () { show(index - 1); });
  document.getElementById('lb-next').addEventListener('click', function () { show(index + 1); });
  lightbox.addEventListener('close', function () { document.body.classList.remove('no-scroll'); });

  /* click on the dark area (not the image or buttons) closes it */
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  lightbox.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    /* Esc is handled natively by <dialog> */
  });

  /* swipe left / right on touch screens */
  var startX = null;
  lightbox.addEventListener('touchstart', function (e) {
    startX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) { show(dx < 0 ? index + 1 : index - 1); }
  }, { passive: true });
});