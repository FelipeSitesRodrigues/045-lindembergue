/* Empresarial Adviser, interações do site */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ano do rodapé ---------- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- header ao rolar ---------- */
  var head = document.querySelector('.site-head');
  var waFloat = document.querySelector('.wa-float');

  function onScroll() {
    var y = window.scrollY;
    head.classList.toggle('is-stuck', y > 40);
    if (waFloat) waFloat.classList.toggle('is-in', y > 520);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- menu mobile ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeNav() {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
  }

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeNav();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeNav();
      burger.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (!nav.classList.contains('is-open')) return;
    if (nav.contains(e.target) || burger.contains(e.target)) return;
    closeNav();
  });

  /* ---------- reveal na rolagem ---------- */
  var revealables = document.querySelectorAll('.reveal, .arc-mark');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    // escalonamento por grupo, para os itens de uma mesma grade entrarem em sequência
    ['.cards', '.mods', '.stats__grid', '.checks'].forEach(function (sel) {
      var group = document.querySelector(sel);
      if (!group) return;
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.setProperty('--d', Math.min(i, 9) * 65 + 'ms');
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- contagem dos números ---------- */
  var counters = document.querySelectorAll('[data-count]');

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var prefix = el.getAttribute('data-prefix') || '';
    if (isNaN(target)) return;

    var dur = 1100;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (!reduced && 'IntersectionObserver' in window && counters.length) {
    var ioNum = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        ioNum.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { ioNum.observe(el); });
  }

  /* ---------- item ativo no menu ---------- */
  var sections = ['#topo', '#servicos', '#sobre', '#metodologia', '#livro', '#contato']
    .map(function (id) { return document.querySelector(id); })
    .filter(Boolean);
  var links = {};
  nav.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href')] = a; });

  if ('IntersectionObserver' in window && sections.length) {
    var ioNav = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var link = links['#' + entry.target.id];
        if (!link) return;
        Object.keys(links).forEach(function (k) { links[k].classList.remove('is-active'); });
        link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { ioNav.observe(s); });
  }
})();
