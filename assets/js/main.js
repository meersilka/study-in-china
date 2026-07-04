/* =================================================================
   ОБРАЗОВАНИЕ В КИТАЕ — интерактив сайта
   Простой ванильный JS без библиотек. Все блоки подписаны.
   ================================================================= */
(function () {
  'use strict';

  /* ---------- 1. Тёмная / светлая тема ----------
     Запоминаем выбор в localStorage; при первом визите берём
     системную настройку (prefers-color-scheme). */
  var root = document.documentElement;
  var saved = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  /* ---------- 2. Мобильное меню (бургер) ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('mainNav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Закрываем меню после клика по пункту
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 3. Тень у шапки при прокрутке ---------- */
  var header = document.querySelector('.site-header');
  var onScroll = function () {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
    var toTop = document.getElementById('toTop');
    if (toTop) toTop.hidden = window.scrollY < 600;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 4. Кнопка «наверх» ---------- */
  var toTop = document.getElementById('toTop');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 5. Появление блоков при скролле (reveal) ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 6. Анимация счётчиков-метрик ---------- */
  var counters = document.querySelectorAll('.metric__num[data-count]');
  var animateCount = function (el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400, start = null;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- 7. Фильтр вузов по городу ---------- */
  var chips = document.querySelectorAll('.filter-bar .chip');
  var uniCards = document.querySelectorAll('#uniGrid .uni-card');
  var uniEmpty = document.getElementById('uniEmpty');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      var f = chip.getAttribute('data-filter');
      var shown = 0;
      uniCards.forEach(function (card) {
        var match = f === 'all' || card.getAttribute('data-city') === f;
        card.style.display = match ? '' : 'none';
        if (match) shown++;
      });
      if (uniEmpty) uniEmpty.hidden = shown !== 0;
    });
  });

  /* ---------- 8. Видео-заглушка (модалка) ----------
     Пока стоит плейсхолдер. Чтобы показать реальное видео —
     вставьте <iframe> в #videoModal в index.html. */
  var modal = document.getElementById('videoModal');
  document.querySelectorAll('[data-video]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (modal) { modal.hidden = false; document.body.style.overflow = 'hidden'; }
    });
  });
  if (modal) {
    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', function () {
        modal.hidden = true; document.body.style.overflow = '';
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) { modal.hidden = true; document.body.style.overflow = ''; }
    });
  }

  /* ---------- 9. Заглушки для «скоро» (языки) ---------- */
  document.querySelectorAll('[data-soon]').forEach(function (b) {
    b.addEventListener('click', function () { showToast('Версия на этом языке скоро появится 🙂'); });
  });

  /* ---------- 10. Тост-уведомление ---------- */
  var toastEl = document.getElementById('toast');
  var toastTimer;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // reflow, чтобы сработала анимация
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
      setTimeout(function () { toastEl.hidden = true; }, 300);
    }, 3500);
  }

  /* ---------- 11. Формы захвата лида ----------
     Сейчас данные НЕ уходят на сервер (статический сайт) — просто
     показываем спасибо. Чтобы получать заявки, подключите одно из:
       • Formspree / Getform (form action="https://...")
       • отправку в Telegram-бот
       • CRM (Битрикс24 вебхук)
     См. README.md, раздел «Приём заявок». */
  document.querySelectorAll('[data-lead-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.querySelector('[name=name]') || {}).value || '';
      var phone = (form.querySelector('[name=phone]') || {}).value || '';
      if (!name.trim() || !phone.trim()) {
        showToast('Заполните имя и контакт, пожалуйста');
        return;
      }
      // Здесь будет реальная отправка (fetch на Formspree / Telegram / CRM)
      console.log('Заявка:', { name: name, phone: phone });
      form.reset();
      showToast('Спасибо! Куратор свяжется с вами в течение 15 минут.');
    });
  });

  /* ---------- 12. Cookie-согласие + загрузка аналитики (152-ФЗ) ----------
     Аналитику (Метрику/GA) запускаем ТОЛЬКО после «Принять». */
  var banner = document.getElementById('cookieBanner');
  var choice = localStorage.getItem('cookieChoice');
  if (banner && !choice) {
    setTimeout(function () { banner.hidden = false; }, 800);
  } else if (choice === 'accept') {
    loadAnalytics();
  }
  var accept = document.getElementById('cookieAccept');
  var decline = document.getElementById('cookieDecline');
  if (accept) accept.addEventListener('click', function () {
    localStorage.setItem('cookieChoice', 'accept');
    if (banner) banner.hidden = true;
    loadAnalytics();
  });
  if (decline) decline.addEventListener('click', function () {
    localStorage.setItem('cookieChoice', 'decline');
    if (banner) banner.hidden = true;
  });

  function loadAnalytics() {
    // === СЮДА вставьте инициализацию Метрики/GA после согласия ===
    // Пример (раскомментируйте и подставьте номер счётчика):
    // (function(m,e,t,r,i,k,a){ ... ym(XXXXXXXX,"init",{...}); })(...);
    // Пока просто помечаем, что согласие получено:
    document.documentElement.setAttribute('data-analytics', 'on');
  }

  /* ---------- 13. Год в футере ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
