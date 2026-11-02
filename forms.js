/* =========================================================
   Crowned by Busi - forms.js  (Enquiry + Contact pages)

   1. A small validation engine (client-side, with clear error messages)
   2. enquiry.html : validated form -> instant answer about price,
                     stock and availability (or a consultation slot)
   3. contact.html : validated form -> compiled email the visitor can send
                     (mailto / Gmail / copy) + AJAX (fetch) submission
                     when a form endpoint such as Formspree is connected
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* ---------------------------------------------------------
     Business settings - change these to match the real shop.
     --------------------------------------------------------- */
  var CONFIG = {
    recipient: 'hello@crownedbybusi.co.za',   // who the compiled email is sent to
    bulkMinQty: 5,                            // 5 or more items ...
    bulkDiscount: 0.10,                       // ... get 10% off
    freeDeliveryOver: 1200,                   // free delivery above this (Randburg & surrounds)
    deliveryFee: 80,                          // otherwise this delivery fee
    consultationFee: 150,                     // deducted from any purchase on the day
    /* opening hours by weekday number (0 = Sunday); null = closed */
    hours: { 0: null, 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [9, 17], 6: [9, 14] },
    bookingWindowDays: 90                     // how far ahead a date may be chosen
  };

  /* ---------------------------------------------------------
     Small helpers
     --------------------------------------------------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }

  /* Build an element safely: text always goes in as textContent,
     never as HTML, so visitor input cannot inject markup. */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) {
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }

  function money(n) {
    return 'R' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function toISODate(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function startOfToday() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function longDate(d) {
    return d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  /* strict yyyy-mm-dd parser that rejects impossible dates such as 2026-02-31 */
  function parseDate(str) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) return null;
    return d;
  }

  function mailtoLink(to, subject, body) {
    return 'mailto:' + to + '?subject=' + encodeURIComponent(subject) +
           '&body=' + encodeURIComponent(body.replace(/\n/g, '\r\n'));
  }

  function copyText(text, statusEl) {
    function done(ok) {
      statusEl.textContent = ok ? 'Copied! Paste it into a new email.' : 'Could not copy automatically. Select the text and copy it manually.';
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      return;
    }
    var ta = el('textarea', { 'aria-hidden': 'true', tabindex: '-1' });
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    done(ok);
  }

  /* ---------------------------------------------------------
     1. VALIDATION ENGINE
     --------------------------------------------------------- */
  var RULES = {
    name: function (v) {
      if (!v) return 'Please enter your full name.';
      if (v.length < 2) return 'Your name must be at least 2 characters.';
      if (v.length > 60) return 'Your name must be 60 characters or fewer.';
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' .\-]*$/.test(v)) return 'Use letters, spaces, hyphens and apostrophes only.';
      return '';
    },
    email: function (v) {
      if (!v) return 'Please enter your email address.';
      if (v.length > 254) return 'That email address is too long.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address, like name@example.com.';
      return '';
    },
    phone: function (required) {
      return function (v) {
        if (!v) return required ? 'Please enter your cell number.' : '';
        var n = v.replace(/[\s\-().]/g, '');
        if (!/^(?:\+27|0)[1-9]\d{8}$/.test(n)) return 'Enter a valid South African number, e.g. 082 123 4567 or +27 82 123 4567.';
        return '';
      };
    },
    required: function (message) {
      return function (v) { return v ? '' : message; };
    },
    minMax: function (label, min, max) {
      return function (v) {
        if (!v) return 'Please enter your ' + label + '.';
        if (v.length < min) return 'Your ' + label + ' must be at least ' + min + ' characters (you have ' + v.length + ').';
        if (v.length > max) return 'Your ' + label + ' must be ' + max + ' characters or fewer (you have ' + v.length + ').';
        return '';
      };
    },
    consent: function (v) { return v ? '' : 'Please tick the box so we know we may contact you.'; }
  };

  function setError(field, msg) {
    var out = document.getElementById(field.id + '-error');
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (out) out.textContent = msg || '';
  }

  /* Wires a form to a set of rules: validates on blur, re-checks while the
     visitor corrects a mistake, and validates everything on submit with an
     error summary (links jump straight to each problem field). */
  function attachValidation(form, rules, summaryEl) {
    var touched = {};
    form.noValidate = true;     // we show our own messages (browser bubbles stay off)

    function field(id) { return form.querySelector('#' + id); }
    function isActive(f) { return f && !f.disabled && !f.closest('[hidden]'); }
    function labelOf(id) {
      var f = field(id);
      if (f && f.type === 'checkbox') return 'Consent';
      var lab = form.querySelector('label[for="' + id + '"]');
      return lab ? lab.textContent.replace(/\*|\(optional\)/g, '').trim() : id;
    }

    function check(id) {
      var f = field(id);
      if (!f) return '';
      if (!isActive(f)) { setError(f, ''); return ''; }
      var value = f.type === 'checkbox' ? f.checked : f.value.trim();
      var msg = rules[id](value, f, form) || '';
      setError(f, msg);
      return msg;
    }

    Object.keys(rules).forEach(function (id) {
      var f = field(id);
      if (!f) return;
      f.addEventListener('blur', function () { touched[id] = true; check(id); });
      ['input', 'change'].forEach(function (evt) {
        f.addEventListener(evt, function () {
          if (touched[id] || f.getAttribute('aria-invalid') === 'true') check(id);
        });
      });
    });

    function renderSummary(errors) {
      summaryEl.replaceChildren();
      if (!errors.length) { summaryEl.hidden = true; return; }
      var list = el('ul');
      errors.forEach(function (e) {
        var a = el('a', { href: '#' + e.id, text: labelOf(e.id) + ': ' + e.msg });
        a.addEventListener('click', function (ev) {
          ev.preventDefault();
          field(e.id).focus();
        });
        list.appendChild(el('li', {}, [a]));
      });
      summaryEl.appendChild(el('p', { text: 'Please fix ' + errors.length + (errors.length === 1 ? ' problem' : ' problems') + ' before continuing:' }));
      summaryEl.appendChild(list);
      summaryEl.hidden = false;
    }

    return {
      validateAll: function () {
        var errors = [];
        Object.keys(rules).forEach(function (id) {
          var msg = check(id);
          if (msg) errors.push({ id: id, msg: msg });
        });
        renderSummary(errors);
        if (errors.length) field(errors[0].id).focus();
        return errors.length === 0;
      },
      reset: function () {
        touched = {};
        form.reset();
        Object.keys(rules).forEach(function (id) { var f = field(id); if (f) setError(f, ''); });
        summaryEl.hidden = true;
        form.dispatchEvent(new Event('cbb:reset'));
      }
    };
  }

  /* live "123 / 1000" counter for a textarea */
  function attachCounter(textarea, counterEl) {
    function update() {
      var max = textarea.getAttribute('maxlength');
      counterEl.textContent = textarea.value.length + ' / ' + max;
    }
    textarea.addEventListener('input', update);
    textarea.form.addEventListener('cbb:reset', function () { setTimeout(update, 0); });
    update();
  }

  /* =========================================================
     2. ENQUIRY PAGE
     ========================================================= */
  var enquiryForm = document.getElementById('enquiry-form');
  if (enquiryForm) {
    (function initEnquiry() {
      var products = window.CBB_PRODUCTS || [];
      var typeEl = $('#enquiryType', enquiryForm);
      var productFields = $('#product-fields');
      var consultFields = $('#consult-fields');
      var productEl = $('#product', enquiryForm);
      var lengthField = $('#length-field');
      var lengthEl = $('#length', enquiryForm);
      var dateEl = $('#consultDate', enquiryForm);
      var resultEl = $('#enquiry-result');
      var summaryEl = $('#enquiry-summary');

      function findProduct(id) { return products.filter(function (p) { return p.id === id; })[0]; }

      /* date limits: today .. today + 90 days */
      var today = startOfToday();
      dateEl.min = toISODate(today);
      dateEl.max = toISODate(addDays(today, CONFIG.bookingWindowDays));

      /* show only the fields that belong to the chosen enquiry type */
      function syncType() {
        var isProduct = typeEl.value === 'product';
        productFields.hidden = !isProduct;
        consultFields.hidden = isProduct;
        resultEl.hidden = true;
        summaryEl.hidden = true;
      }

      /* fill the length drop-down from the chosen product (DOM manipulation) */
      function syncLengths() {
        var p = findProduct(productEl.value);
        lengthEl.replaceChildren(el('option', { value: '', text: 'Choose a length…' }));
        if (p && p.lengths.length) {
          p.lengths.forEach(function (n) { lengthEl.appendChild(el('option', { value: String(n), text: n + '"' })); });
          lengthField.hidden = false;
        } else {
          lengthField.hidden = true;
        }
      }

      var rules = {
        name: RULES.name,
        email: RULES.email,
        phone: RULES.phone(true),
        enquiryType: function (v) { return v === 'product' || v === 'consultation' ? '' : 'Please choose what you would like to know.'; },
        product: function (v) {
          if (!v) return 'Please choose a product.';
          return findProduct(v) ? '' : 'That product is not in our range. Please choose from the list.';
        },
        length: function (v) {
          var p = findProduct(productEl.value);
          if (!p || !p.lengths.length) return '';
          if (!v) return 'Please choose a length.';
          return p.lengths.indexOf(Number(v)) === -1 ? 'That length is not available for this product.' : '';
        },
        quantity: function (v) {
          if (!v) return 'Please enter a quantity.';
          if (!/^\d+$/.test(v)) return 'Quantity must be a whole number, like 1 or 2.';
          var n = Number(v);
          if (n < 1) return 'Quantity must be at least 1.';
          if (n > 20) return 'For more than 20 items, please use the contact page and tell us what you need.';
          return '';
        },
        consultTopic: RULES.required('Please choose what you need help with.'),
        consultDate: function (v) {
          if (!v) return 'Please choose a preferred date.';
          var d = parseDate(v);
          if (!d) return 'Enter a valid date.';
          if (d < today) return 'Please choose today or a future date.';
          if (d > addDays(today, CONFIG.bookingWindowDays)) return 'Please choose a date within the next ' + CONFIG.bookingWindowDays + ' days.';
          return '';
        },
        notes: function (v) { return v.length > 500 ? 'Please keep your note to 500 characters or fewer.' : ''; },
        consent: RULES.consent
      };
      var validator = attachValidation(enquiryForm, rules, summaryEl);
      attachCounter($('#notes', enquiryForm), $('#notes-count'));

      typeEl.addEventListener('change', syncType);
      productEl.addEventListener('change', syncLengths);
      enquiryForm.addEventListener('cbb:reset', function () { setTimeout(function () { syncType(); syncLengths(); }, 0); });

      /* start state from the link the visitor used, e.g. ?type=consultation or ?product=glueless-bob-wig */
      var params = new URLSearchParams(window.location.search);
      if (params.get('type') === 'consultation') typeEl.value = 'consultation';
      if (findProduct(params.get('product'))) productEl.value = params.get('product');
      syncType();
      syncLengths();

      /* ----- pricing + availability rules ----- */
      function computeQuote(p, qty, fulfilment) {
        var subtotal = p.price * qty;
        var discount = qty >= CONFIG.bulkMinQty ? Math.round(subtotal * CONFIG.bulkDiscount) : 0;
        var afterDiscount = subtotal - discount;
        var delivery = (fulfilment === 'delivery' && afterDiscount < CONFIG.freeDeliveryOver) ? CONFIG.deliveryFee : 0;
        return { subtotal: subtotal, discount: discount, delivery: delivery, total: afterDiscount + delivery };
      }
      function availability(p, qty) {
        if (p.stock >= qty) {
          return { level: 'ok', label: 'In stock',
                   text: 'Good news: we have enough in stock. It can be collected today or dispatched within 1–2 working days.' };
        }
        if (p.stock > 0) {
          return { level: 'warn', label: 'Partly in stock',
                   text: 'We have ' + p.stock + ' in stock right now. The remaining ' + (qty - p.stock) + ' can be ready in 5–7 working days.' };
        }
        return { level: 'info', label: 'Pre-order',
                 text: 'This item is currently out of stock. You can pre-order it and it will be ready in 5–7 working days.' };
      }
      function buildSlots(hours) {
        var slots = [];
        for (var h = hours[0]; h + 1 <= hours[1]; h += 2) { slots.push(pad2(h) + ':00'); }
        return slots;
      }
      function nextOpenDay(from) {
        var d = addDays(from, 1);
        for (var i = 0; i < 7; i++) {
          if (CONFIG.hours[d.getDay()]) return d;
          d = addDays(d, 1);
        }
        return d;
      }

      function row(dl, label, value, cls) {
        dl.appendChild(el('dt', cls ? { class: cls, text: label } : { text: label }));
        dl.appendChild(el('dd', cls ? { class: cls, text: value } : { text: value }));
      }

      function showResult(nodes) {
        resultEl.replaceChildren.apply(resultEl, nodes);
        resultEl.hidden = false;
        resultEl.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        resultEl.focus({ preventScroll: true });
      }

      function resetButton() {
        var b = el('button', { type: 'button', class: 'btn btn-outline-dark btn-small', text: 'Start a new enquiry' });
        b.addEventListener('click', function () {
          validator.reset();
          resultEl.hidden = true;
          enquiryForm.scrollIntoView({ block: 'start' });
          $('#name', enquiryForm).focus();
        });
        return b;
      }

      function renderProductResult(data) {
        var p = findProduct(data.product);
        var qty = Number(data.quantity);
        var q = computeQuote(p, qty, data.fulfilment);
        var av = availability(p, qty);
        var first = data.name.split(/\s+/)[0];
        var lengthText = data.length ? ' (' + data.length + '")' : '';

        var dl = el('dl', { class: 'quote-list' });
        row(dl, 'Item', p.name + lengthText);
        row(dl, 'Price each', money(p.price));
        row(dl, 'Quantity', String(qty));
        row(dl, 'Subtotal', money(q.subtotal));
        if (q.discount) row(dl, 'Bulk discount (' + Math.round(CONFIG.bulkDiscount * 100) + '% off ' + CONFIG.bulkMinQty + '+)', '−' + money(q.discount));
        row(dl, data.fulfilment === 'delivery' ? 'Delivery' : 'Collection in store',
            q.delivery ? money(q.delivery) : 'Free');
        row(dl, 'Estimated total', money(q.total), 'quote-total');

        var fulfilText = data.fulfilment === 'delivery'
          ? (q.delivery
              ? 'Delivery costs ' + money(CONFIG.deliveryFee) + ' for orders under ' + money(CONFIG.freeDeliveryOver) + ' in Randburg and surrounds. We will confirm the cost for other areas.'
              : 'Your order qualifies for free delivery in Randburg and surrounds.')
          : 'Collect from Shop 12, Randburg Square during trading hours.';

        var body = [
          'Hi Crowned by Busi,', '',
          'I would like to confirm this quote from your website:', '',
          'Product: ' + p.name + lengthText,
          'Quantity: ' + qty,
          'Estimated total: ' + money(q.total) + (data.fulfilment === 'delivery' ? ' (delivery)' : ' (collection)'),
          'Availability: ' + av.label, '',
          'My details:',
          'Name: ' + data.name,
          'Email: ' + data.email,
          'Cell: ' + data.phone
        ];
        if (data.notes) { body.push('', 'Notes: ' + data.notes); }
        var mailto = mailtoLink(CONFIG.recipient, 'Quote request: ' + p.name, body.join('\n'));

        showResult([
          el('span', { class: 'status status-' + av.level, text: av.label }),
          el('h3', { text: 'Thanks, ' + first + '! Here is your quote.' }),
          dl,
          el('p', { text: av.text }),
          el('p', { text: fulfilText }),
          el('p', { class: 'field-hint', text: 'Prices are estimates until the shop confirms your order.' }),
          el('div', { class: 'result-actions' }, [
            el('a', { class: 'btn btn-primary btn-small', href: mailto, text: 'Email this quote to the shop' }),
            resetButton()
          ])
        ]);
      }

      function renderConsultResult(data) {
        var d = parseDate(data.consultDate);
        var hours = CONFIG.hours[d.getDay()];
        var first = data.name.split(/\s+/)[0];
        var useDate = d;
        var status, statusText, intro;

        if (hours) {
          status = 'ok'; statusText = 'Open that day';
          intro = 'We are open on ' + longDate(d) + ' from ' + pad2(hours[0]) + ':00 to ' + pad2(hours[1]) + ':00.';
        } else {
          useDate = nextOpenDay(d);
          hours = CONFIG.hours[useDate.getDay()];
          status = 'warn'; statusText = 'Closed that day';
          intro = 'Sorry, the shop is closed on ' + longDate(d) + '. The next day we are open is ' + longDate(useDate) + '.';
        }
        var slots = buildSlots(hours);
        var slotList = el('ul', { class: 'tick-list' }, slots.map(function (s) { return el('li', { text: s }); }));

        var body = [
          'Hi Crowned by Busi,', '',
          'I would like to book a consultation:', '',
          'Topic: ' + data.consultTopic,
          'Preferred date: ' + longDate(useDate),
          'Preferred time: (please choose one of: ' + slots.join(', ') + ')', '',
          'My details:',
          'Name: ' + data.name,
          'Email: ' + data.email,
          'Cell: ' + data.phone
        ];
        if (data.notes) { body.push('', 'Notes: ' + data.notes); }
        var mailto = mailtoLink(CONFIG.recipient, 'Consultation booking request', body.join('\n'));

        showResult([
          el('span', { class: 'status status-' + status, text: statusText }),
          el('h3', { text: 'Thanks, ' + first + '! Here is what is available.' }),
          el('p', { text: intro }),
          el('p', { text: 'Available start times on ' + longDate(useDate) + ':' }),
          slotList,
          el('p', { text: 'Consultation fee: ' + money(CONFIG.consultationFee) + ', which we deduct from any purchase you make on the day.' }),
          el('p', { class: 'field-hint', text: 'Email your preferred time to the shop and we will confirm your slot.' }),
          el('div', { class: 'result-actions' }, [
            el('a', { class: 'btn btn-primary btn-small', href: mailto, text: 'Email my booking request' }),
            resetButton()
          ])
        ]);
      }

      enquiryForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validator.validateAll()) { resultEl.hidden = true; return; }
        var fd = new FormData(enquiryForm);
        var data = {
          name: String(fd.get('name')).trim(),
          email: String(fd.get('email')).trim(),
          phone: String(fd.get('phone')).trim(),
          type: String(fd.get('enquiryType')),
          product: String(fd.get('product') || ''),
          length: lengthField.hidden ? '' : String(fd.get('length') || ''),
          quantity: String(fd.get('quantity') || ''),
          fulfilment: String(fd.get('fulfilment') || 'collection'),
          consultTopic: String(fd.get('consultTopic') || ''),
          consultDate: String(fd.get('consultDate') || ''),
          notes: String(fd.get('notes') || '').trim()
        };
        if (data.type === 'product') renderProductResult(data); else renderConsultResult(data);
      });
    })();
  }

  /* =========================================================
     3. CONTACT PAGE
     ========================================================= */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    (function initContact() {
      var summaryEl = $('#contact-summary');
      var resultEl = $('#contact-result');
      var submitBtn = $('#contact-submit');

      var rules = {
        name: RULES.name,
        email: RULES.email,
        phone: RULES.phone(false),
        messageType: RULES.required('Please choose the type of message.'),
        subject: RULES.minMax('subject', 3, 80),
        message: RULES.minMax('message', 10, 1000),
        consent: RULES.consent
      };
      var validator = attachValidation(contactForm, rules, summaryEl);
      attachCounter($('#message', contactForm), $('#message-count'));

      /* The form's action attribute is the AJAX endpoint (e.g. a Formspree
         URL). While it still contains the placeholder, we only prepare the email. */
      function endpoint() {
        var a = contactForm.getAttribute('action') || '';
        return (a && a.indexOf('your-form-id') === -1) ? a : '';
      }

      function show(nodes) {
        resultEl.replaceChildren.apply(resultEl, nodes);
        resultEl.hidden = false;
        resultEl.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        resultEl.focus({ preventScroll: true });
      }

      /* compile the validated fields into an email */
      function compileEmail(d) {
        var subject = '[' + d.messageType + '] ' + d.subject;
        var lines = [
          'Hi Crowned by Busi,', '',
          d.message, '',
          '---',
          'Name: ' + d.name,
          'Email: ' + d.email
        ];
        if (d.phone) lines.push('Cell: ' + d.phone);
        lines.push('Message type: ' + d.messageType, 'Sent from the Crowned by Busi website contact form');
        var body = lines.join('\n');
        return {
          to: CONFIG.recipient, subject: subject, body: body,
          mailto: mailtoLink(CONFIG.recipient, subject, body),
          gmail: 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(CONFIG.recipient) +
                 '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body)
        };
      }

      function showEmailPanel(mail, introText) {
        var copyStatus = el('p', { class: 'field-hint', role: 'status', 'aria-live': 'polite' });
        var copyBtn = el('button', { type: 'button', class: 'btn btn-outline-dark btn-small', text: 'Copy email text' });
        copyBtn.addEventListener('click', function () {
          copyText('To: ' + mail.to + '\nSubject: ' + mail.subject + '\n\n' + mail.body, copyStatus);
        });
        var editBtn = el('button', { type: 'button', class: 'card-link', text: 'Edit my message' });
        editBtn.addEventListener('click', function () {
          resultEl.hidden = true;
          $('#message', contactForm).focus();
        });

        show([
          el('span', { class: 'status status-info', text: 'Almost done' }),
          el('h3', { text: 'Your email is ready to send' }),
          el('p', { text: introText }),
          el('p', {}, [el('strong', { text: 'To: ' }), mail.to, el('br'), el('strong', { text: 'Subject: ' }), mail.subject]),
          el('div', { class: 'email-preview', tabindex: '0', role: 'region', 'aria-label': 'Email preview', text: mail.body }),
          el('div', { class: 'result-actions' }, [
            el('a', { class: 'btn btn-primary btn-small', href: mail.mailto, text: 'Open in my email app' }),
            el('a', { class: 'btn btn-outline-dark btn-small', href: mail.gmail, target: '_blank', rel: 'noopener noreferrer', text: 'Open in Gmail' }),
            copyBtn, editBtn
          ]),
          copyStatus
        ]);
      }

      function showSent(d) {
        var again = el('button', { type: 'button', class: 'btn btn-outline-dark btn-small', text: 'Send another message' });
        again.addEventListener('click', function () {
          resultEl.hidden = true;
          $('#name', contactForm).focus();
        });
        show([
          el('span', { class: 'status status-ok', text: 'Message sent' }),
          el('h3', { text: 'Thank you, ' + d.name.split(/\s+/)[0] + '!' }),
          el('p', { text: 'We received your message and will reply to ' + d.email + ' as soon as we can.' }),
          el('div', { class: 'result-actions' }, [again])
        ]);
      }

      /* AJAX: send the data in the background with fetch(), no page reload */
      function sendAjax(url, d) {
        var ctl = window.AbortController ? new AbortController() : null;
        var timer = ctl ? setTimeout(function () { ctl.abort(); }, 12000) : null;
        return fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: d.name, email: d.email, phone: d.phone,
            messageType: d.messageType, subject: d.subject, message: d.message,
            _subject: '[' + d.messageType + '] ' + d.subject
          }),
          signal: ctl ? ctl.signal : undefined
        }).then(function (res) {
          if (timer) clearTimeout(timer);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res;
        }, function (err) {
          if (timer) clearTimeout(timer);
          throw err;
        });
      }

      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        /* honeypot: real visitors never see or fill this field; bots do */
        if ($('#website', contactForm).value) { return; }
        if (!validator.validateAll()) { resultEl.hidden = true; return; }

        var fd = new FormData(contactForm);
        var d = {
          name: String(fd.get('name')).trim(),
          email: String(fd.get('email')).trim(),
          phone: String(fd.get('phone') || '').trim(),
          messageType: String(fd.get('messageType')),
          subject: String(fd.get('subject')).trim(),
          message: String(fd.get('message')).trim()
        };
        var mail = compileEmail(d);
        var url = endpoint();

        if (!url) {
          showEmailPanel(mail, 'Everything looks good. Open it in your email app (or Gmail), check it over and press send.');
          return;
        }

        submitBtn.disabled = true;
        var oldLabel = submitBtn.textContent;
        submitBtn.textContent = 'Sending…';
        show([el('p', { class: 'sending', text: 'Sending your message…' })]);

        sendAjax(url, d).then(function () {
          showSent(d);
          validator.reset();
        }).catch(function () {
          showEmailPanel(mail, 'We could not send your message automatically (check your internet connection). You can still send it as an email below.');
        }).then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = oldLabel;
        });
      });
    })();
  }
});