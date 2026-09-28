/* ============================================================
   OSULLOC Redesign — main.js
   원칙: 점진적 향상. 이 파일이 없어도 모든 콘텐츠·서사가 성립한다.
   애니메이션: IO once:true (기존 Marshall 프로젝트 패턴 계승)
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- 1. 헤더: 스크롤 시 배경 부여 ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var headerScrolled = header.classList.contains('is-scrolled');
    var onScroll = function () {
      var shouldBeScrolled = window.scrollY > 8;
      if (shouldBeScrolled === headerScrolled) return;

      headerScrolled = shouldBeScrolled;
      header.classList.toggle('is-scrolled', shouldBeScrolled);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- 2. 스크롤 리빌 — IO 미지원 시 전부 노출 (방어적 폴백) ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (!('IntersectionObserver' in window) || prefersReduced.matches) {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // once — 리소스 즉시 해제
          }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- 3. 제품 필터 (products.html) ---------- */
  var filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    var buttons = filterBar.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('[data-category]');
    var countEl = document.querySelector('.product-count');

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;

      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });

      var cat = btn.dataset.filter;
      var visible = 0;
      cards.forEach(function (card) {
        var show = cat === 'all' || card.dataset.category === cat;
        card.hidden = !show;
        if (show) visible++;
      });

      // 스크린리더에 결과 공지 (aria-live)
      if (countEl) {
        countEl.textContent = btn.textContent.trim() + ' — ' + visible + '개 제품';
      }
    });
  }

  /* ---------- 4. 연대기 키보드 탐색 ---------- */
  var timeline = document.querySelector('.timeline');
  if (timeline) {
    timeline.addEventListener('keydown', function (e) {
      var supportedKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!supportedKeys.includes(e.key)) return;

      e.preventDefault();
      var firstCard = timeline.querySelector('.milestone');
      var gap = parseFloat(getComputedStyle(timeline).gap) || 0;
      var step = firstCard ? firstCard.getBoundingClientRect().width + gap : timeline.clientWidth * 0.8;
      var behavior = prefersReduced.matches ? 'auto' : 'smooth';

      if (e.key === 'Home' || e.key === 'End') {
        timeline.scrollTo({
          left: e.key === 'Home' ? 0 : timeline.scrollWidth,
          behavior: behavior
        });
        return;
      }

      timeline.scrollBy({
        left: e.key === 'ArrowRight' ? step : -step,
        behavior: behavior
      });
    });
  }

  /* ---------- 5. 푸터 연도 ---------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
