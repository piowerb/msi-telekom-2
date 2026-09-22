/* MSI Telekom, strona jednostronicowa. Czysty JavaScript, bez bibliotek. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  /* ---------- Menu mobilne ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu');

  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Zamknij' : 'Menu';
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Cień nagłówka po przewinięciu ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Podświetlanie aktywnej sekcji w menu ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]:not(.btn)'));
  if ('IntersectionObserver' in window && links.length) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var active = map[entry.target.id];
        if (active) active.setAttribute('aria-current', 'location');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  /* ---------- Obrazy: lokalny plik, potem adres zapasowy, potem tekst ---------- */
  function handleImage(img) {
    function giveUp() {
      img.hidden = true;
      var holder = img.parentElement;
      var note = holder && holder.querySelector('.img-fallback');
      if (holder && holder.classList.contains('logo-tile__img')) { holder.hidden = true; }
      else if (note) note.hidden = false;
      var text = holder && holder.querySelector('.brand__text');
      if (text) text.hidden = false;
    }
    function fail() {
      var fb = img.getAttribute('data-fallback');
      if (fb && !img.dataset.triedFallback) {
        img.dataset.triedFallback = '1';
        img.src = fb;
      } else {
        giveUp();
      }
    }
    img.addEventListener('error', fail);
    if (img.getAttribute('loading') !== 'lazy' && img.complete && img.naturalWidth === 0) fail();
  }
  Array.prototype.forEach.call(document.querySelectorAll('img[data-fallback]'), handleImage);

  /* ---------- Formularz kontaktowy (wersja demonstracyjna) ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = form.querySelector('.form__status');

    var isContact = function (v) {
      v = v.trim();
      var email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      var digits = v.replace(/[\s()+\-]/g, '');
      var phone = /^\d{9,13}$/.test(digits);
      return email || phone;
    };

    var rules = [
      { id: 'name',    err: 'err-name',    msg: 'Prosimy o podanie imienia i nazwiska.',
        ok: function (el) { return el.value.trim().length >= 2; } },
      { id: 'contact', err: 'err-contact', msg: 'Prosimy o podanie numeru telefonu lub adresu e-mail.',
        ok: function (el) { return isContact(el.value); } },
      { id: 'message', err: 'err-message', msg: 'Prosimy opisać, w czym możemy pomóc (co najmniej kilka słów).',
        ok: function (el) { return el.value.trim().length >= 10; } },
      { id: 'consent', err: 'err-consent', msg: 'Aby wysłać wiadomość, prosimy zaznaczyć zgodę.',
        ok: function (el) { return el.checked; } }
    ];

    var showError = function (rule, el, visible) {
      var box = document.getElementById(rule.err);
      var field = el.closest('.field');
      if (field) field.classList.toggle('is-invalid', visible);
      el.setAttribute('aria-invalid', visible ? 'true' : 'false');
      box.textContent = visible ? rule.msg : '';
      box.hidden = !visible;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      status.className = 'form__status';

      var firstBad = null;
      rules.forEach(function (rule) {
        var el = form.elements[rule.id];
        var valid = rule.ok(el);
        showError(rule, el, !valid);
        if (!valid && !firstBad) firstBad = el;
      });
      if (firstBad) { firstBad.focus(); return; }

      /* Pole-pułapka dla botów: jeśli wypełnione, nic nie robimy. */
      if (form.elements.website && form.elements.website.value) return;

      /* DEMO: po wdrożeniu podłącz tu wysyłkę (skrypt PHP na serwerze lub usługa formularzy). */
      status.className = 'form__status is-info';
      status.textContent = 'Jest to wersja demonstracyjna, dlatego wiadomość nie została wysłana. Formularz zostanie połączony z serwerem podczas wdrożenia.';
    });

    rules.forEach(function (rule) {
      var el = form.elements[rule.id];
      var evt = el.type === 'checkbox' ? 'change' : 'input';
      el.addEventListener(evt, function () {
        if (el.getAttribute('aria-invalid') === 'true' && rule.ok(el)) showError(rule, el, false);
      });
    });
  }
})();
