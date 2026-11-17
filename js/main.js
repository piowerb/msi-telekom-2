/* =========================================================
   MSI Telekom: skrypt strony. Czysty JavaScript, bez bibliotek.

   Ten sam plik działa na każdej podstronie. Każda część najpierw
   sprawdza, czy jej element jest na stronie, a jeśli go nie ma,
   po prostu nic nie robi. Części skryptu:
   1. Menu na telefonie (przycisk "Menu", zamykanie klawiszem Esc).
   2. Cień pod nagłówkiem po przewinięciu strony.
   3. Podkreślenie w menu sekcji, którą właśnie widać (strona główna).
   4. Zapasowe obrazy, gdy plik się nie wczyta.
   5. Interaktywna mapa zasięgu (nazwy punktów, przybliżenie, lista miejscowości).
   6. Sprawdzanie formularza kontaktowego.
   ========================================================= */
(function () {
  'use strict';

  // Klasa "js" na <html> mówi arkuszowi stylów, że skrypt działa.
  // Dopiero wtedy CSS chowa menu na telefonie pod przyciskiem.
  var root = document.documentElement;
  root.classList.add('js');

  /* ---------- 1. Menu mobilne ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu');

  // Otwiera (open = true) albo zamyka menu i zmienia napis na przycisku.
  // aria-expanded informuje czytniki ekranu, czy menu jest rozwinięte.
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
    // kliknięcie w link w menu zamyka menu
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    // klawisz Esc zamyka menu i wraca na przycisk
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /* ---------- 2. Cień nagłówka po przewinięciu ----------
     Po przewinięciu o więcej niż 8 px nagłówek dostaje klasę is-stuck (cień w CSS). */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. Podświetlanie aktywnej sekcji w menu ----------
     Dotyczy linków w menu prowadzących do sekcji tej samej strony (#oferta itp.).
     Gdy sekcja jest na środku ekranu, jej link dostaje aria-current i podkreślenie. */
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

  /* ---------- 4. Obrazy zapasowe ----------
     Dla obrazków z atrybutem data-fallback lub data-local: gdy plik się nie wczyta,
     skrypt próbuje adresu zapasowego, a gdy i ten zawiedzie, chowa obrazek
     i pokazuje tekst zastępczy. Obecnie żaden obrazek z tego nie korzysta,
     funkcja zostaje na wypadek dodania zdjęć. */
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
  Array.prototype.forEach.call(document.querySelectorAll('img[data-fallback], img[data-local]'), handleImage);

  /* ---------- 5. Interaktywna mapa zasięgu ----------
     Mapa jest częścią strony (rysunek SVG), nie łączy się z Google ani z innymi serwisami.
     Najechanie lub dotknięcie punktu pokazuje nazwę miejscowości. Przycisk przybliża
     okolice Olsztyna, gdzie punkty leżą blisko siebie. Nazwy na liście pod mapą
     podświetlają odpowiedni punkt na mapie. */
  var mz = document.querySelector('.mz');
  if (mz) {
    var mapWrap = mz.closest('.map');
    var tip = mapWrap.querySelector('.map__tip');
    var zoomBtn = mapWrap.querySelector('[data-map-zoom]');
    var points = Array.prototype.slice.call(mz.querySelectorAll('.mz-pt'));
    var listBtns = Array.prototype.slice.call(document.querySelectorAll('.cities [data-place]'));
    var active = null;

    // środek punktu na ekranie
    var centre = function (pt) {
      var r = pt.querySelector('.mz-dot').getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, top: r.top, bottom: r.bottom };
    };

    // podświetla punkt (albo nic, gdy pt = null) i pokazuje dymek z nazwą
    var show = function (pt) {
      if (active) active.classList.remove('is-active');
      active = pt;
      listBtns.forEach(function (b) {
        b.classList.toggle('is-active', !!pt && b.getAttribute('data-place') === pt.getAttribute('data-name'));
      });
      if (!pt) { tip.hidden = true; return; }
      pt.classList.add('is-active');
      pt.parentNode.appendChild(pt); // aktywny punkt na wierzchu

      tip.textContent = '';
      var name = document.createElement('strong');
      name.textContent = pt.getAttribute('data-name');
      tip.appendChild(name);
      if (pt.getAttribute('data-note')) {
        var note = document.createElement('span');
        note.textContent = pt.getAttribute('data-note');
        tip.appendChild(note);
      }
      tip.hidden = false;

      // dymek nad punktem, a przy górnej krawędzi pod nim; nie wychodzi poza mapę w poziomie
      var c = centre(pt), box = mapWrap.getBoundingClientRect();
      var half = tip.offsetWidth / 2 + 8;
      var x = Math.max(half, Math.min(box.width - half, c.x - box.left));
      var below = c.top - box.top < tip.offsetHeight + 16;
      tip.classList.toggle('is-below', below);
      tip.style.left = x + 'px';
      tip.style.top = (below ? c.bottom : c.top) - box.top + 'px';
    };

    // najbliższy punkt w promieniu maxPx od kursora lub palca
    var nearest = function (e, maxPx) {
      var best = null, bestD = maxPx;
      points.forEach(function (pt) {
        var c = centre(pt), d = Math.sqrt(Math.pow(c.x - e.clientX, 2) + Math.pow(c.y - e.clientY, 2));
        if (d < bestD) { best = pt; bestD = d; }
      });
      return best;
    };

    mz.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var pt = nearest(e, 16);
      if (pt !== active) show(pt);
    });
    mz.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') show(null); });
    mz.addEventListener('click', function (e) { show(nearest(e, 28)); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && active) show(null); });
    document.addEventListener('click', function (e) {
      if (active && !mapWrap.contains(e.target) && !e.target.closest('.cities')) show(null);
    });

    // przybliżenie okolic Olsztyna (na telefonie węższy i wyższy fragment mapy)
    var narrow = window.matchMedia('(max-width: 44rem)');
    var zoomBox = function () { return mz.getAttribute(narrow.matches ? 'data-zoom-m' : 'data-zoom'); };
    var setZoom = function (on) {
      mz.classList.toggle('is-zoomed', on);
      mz.setAttribute('viewBox', on ? zoomBox() : mz.getAttribute('data-full'));
      zoomBtn.textContent = on ? 'Pokaż cały zasięg' : 'Przybliż okolice Olsztyna';
      zoomBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    };
    if (zoomBtn) zoomBtn.addEventListener('click', function () { setZoom(!mz.classList.contains('is-zoomed')); show(null); });

    // czy punkt mieści się w przybliżonym fragmencie mapy
    var inZoom = function (pt) {
      var v = zoomBox().split(' ').map(Number);
      var t = pt.getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/);
      var x = +t[1], y = +t[2];
      return x > v[0] && x < v[0] + v[2] && y > v[1] && y < v[1] + v[3];
    };

    // lista miejscowości pod mapą: najechanie lub kliknięcie pokazuje punkt na mapie
    var find = function (name) {
      for (var i = 0; i < points.length; i++) if (points[i].getAttribute('data-name') === name) return points[i];
      return null;
    };
    listBtns.forEach(function (b) {
      var pt = find(b.getAttribute('data-place'));
      if (!pt) return;
      b.addEventListener('mouseenter', function () {
        if (mz.classList.contains('is-zoomed') && !inZoom(pt)) return;
        var r = mapWrap.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) show(pt);
      });
      b.addEventListener('click', function () {
        if (mz.classList.contains('is-zoomed') && !inZoom(pt)) setZoom(false);
        var r = mapWrap.getBoundingClientRect();
        var visible = r.top >= 0 && r.bottom <= window.innerHeight;
        if (!visible) {
          var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          mapWrap.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
          setTimeout(function () { show(pt); }, reduce ? 0 : 450);
        } else {
          show(pt);
        }
      });
    });
    window.addEventListener('resize', function () {
      if (mz.classList.contains('is-zoomed')) mz.setAttribute('viewBox', zoomBox());
      if (active) show(active);
    });
  }

  /* ---------- 6. Formularz kontaktowy (wersja demonstracyjna) ----------
     Sprawdza pola przed wysłaniem i pokazuje komunikaty pod błędnymi polami.
     Wiadomość nie jest jeszcze nigdzie wysyłana (patrz miejsce oznaczone DEMO niżej). */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = form.querySelector('.form__status');

    // Pole kontaktowe przyjmuje adres e-mail albo numer telefonu (9 do 13 cyfr,
    // spacje, nawiasy, plus i myślniki są pomijane przy liczeniu cyfr).
    var isContact = function (v) {
      v = v.trim();
      var email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      var digits = v.replace(/[\s()+\-]/g, '');
      var phone = /^\d{9,13}$/.test(digits);
      return email || phone;
    };

    // Reguły sprawdzania. Każda ma: id pola, id miejsca na komunikat,
    // treść komunikatu i funkcję, która zwraca true, gdy pole jest poprawne.
    // Aby zmienić treść błędu, wystarczy poprawić tekst w msg.
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

    // Pokazuje albo chowa komunikat błędu przy danym polu.
    var showError = function (rule, el, visible) {
      var box = document.getElementById(rule.err);
      var field = el.closest('.field');
      if (field) field.classList.toggle('is-invalid', visible);
      el.setAttribute('aria-invalid', visible ? 'true' : 'false');
      box.textContent = visible ? rule.msg : '';
      box.hidden = !visible;
    };

    // Kliknięcie "Wyślij": sprawdzenie wszystkich pól, kursor wraca do pierwszego błędnego.
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

    // Komunikat znika od razu, gdy użytkownik poprawi pole.
    rules.forEach(function (rule) {
      var el = form.elements[rule.id];
      var evt = el.type === 'checkbox' ? 'change' : 'input';
      el.addEventListener(evt, function () {
        if (el.getAttribute('aria-invalid') === 'true' && rule.ok(el)) showError(rule, el, false);
      });
    });
  }
})();
