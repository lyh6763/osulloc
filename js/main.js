/* ============================================================
   OSULLOC Redesign — main.js
   원칙: 점진적 향상. 이 파일이 없어도 모든 콘텐츠·서사가 성립한다.
   애니메이션: IO once:true (기존 Marshall 프로젝트 패턴 계승)
   ============================================================ */
(function () {
  'use strict';

  // JS 사용 가능 표시 — CSS는 .js 스코프에서만 리빌 초기 상태를 숨김
  document.documentElement.classList.add('js');

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- 1. 헤더: 스크롤 시 배경 부여 ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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

  /* ---------- 4. 푸터 연도 ---------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
