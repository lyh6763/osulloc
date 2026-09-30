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

  /* ---------- 4. 연대기 탐색 — 키보드 + 이전/다음 버튼 ---------- */
  var timeline = document.querySelector('.timeline');
  if (timeline) {
    var navButtons = document.querySelectorAll('.timeline-btn');
    var behavior = function () { return prefersReduced.matches ? 'auto' : 'smooth'; };

    // 카드 한 장(+간격) 단위로 이동
    var scrollByCard = function (dir) {
      var firstCard = timeline.querySelector('.milestone');
      var gap = parseFloat(getComputedStyle(timeline).gap) || 0;
      var step = firstCard ? firstCard.getBoundingClientRect().width + gap : timeline.clientWidth * 0.8;
      timeline.scrollBy({ left: dir * step, behavior: behavior() });
    };

    timeline.addEventListener('keydown', function (e) {
      var supportedKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!supportedKeys.includes(e.key)) return;

      e.preventDefault();
      if (e.key === 'Home' || e.key === 'End') {
        timeline.scrollTo({
          left: e.key === 'Home' ? 0 : timeline.scrollWidth,
          behavior: behavior()
        });
        return;
      }
      scrollByCard(e.key === 'ArrowRight' ? 1 : -1);
    });

    // aria-disabled: 끝에 닿아도 포커스를 잃지 않도록 disabled 대신 사용
    navButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-disabled') === 'true') return;
        scrollByCard(Number(btn.dataset.dir));
      });
    });

    // 초기 상태는 HTML에 선언(이전 버튼 비활성) — 로드 중 레이아웃 강제 읽기 방지, 스크롤 시에만 갱신
    timeline.addEventListener('scroll', function () {
      var max = timeline.scrollWidth - timeline.clientWidth;
      navButtons.forEach(function (btn) {
        var atEdge = btn.dataset.dir === '-1' ? timeline.scrollLeft <= 1 : timeline.scrollLeft >= max - 1;
        btn.setAttribute('aria-disabled', String(atEdge));
      });
    }, { passive: true });
  }
})();
