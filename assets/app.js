/* LP Carolina Mendanha — comportamento (carregado via bootstrap para compatibilidade com CSP forte) */
(function () {
  function init() {
    /* ─── Ano atual no rodapé ─── */
    var ano = document.getElementById('ano-atual');
    if (ano) ano.textContent = new Date().getFullYear();

    /* ─── Troca de media das fontes (carregamento não-bloqueante) ─── */
    var fontLinks = document.querySelectorAll('link[data-fontswap]');
    for (var i = 0; i < fontLinks.length; i++) fontLinks[i].media = 'all';

    /* ─── FAQ ─── */
    function toggleFaq(btn) {
      var body = btn.nextElementSibling;
      var isOpen = btn.classList.contains('open');
      var all = document.querySelectorAll('.faq-btn');
      for (var j = 0; j < all.length; j++) {
        all[j].classList.remove('open');
        all[j].setAttribute('aria-expanded', 'false');
        all[j].nextElementSibling.classList.remove('open');
      }
      if (!isOpen) {
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        body.classList.add('open');
      }
    }
    var faqBtns = document.querySelectorAll('.faq-btn');
    for (var k = 0; k < faqBtns.length; k++) {
      (function (b) { b.addEventListener('click', function () { toggleFaq(b); }); })(faqBtns[k]);
    }

    /* ─── Progressive enhancement: reveal + parallax ─── */
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var els = document.querySelectorAll('.reveal');

    if (!reduce && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      els.forEach(function (el) { io.observe(el); });
    } else {
      for (var m = 0; m < els.length; m++) els[m].classList.add('in');
    }

    /* Header shadow on scroll */
    var header = document.getElementById('site-header');
    if (header) {
      var onScrollHeader = function () {
        if (window.scrollY > 12) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      };
      window.addEventListener('scroll', onScrollHeader, { passive: true });
      onScrollHeader();
    }

    /* Parallax — apenas em dispositivos com capacidade computacional */
    var capable = !reduce
      && (navigator.hardwareConcurrency || 0) >= 4
      && window.matchMedia('(min-width: 1024px)').matches
      && window.matchMedia('(pointer: fine)').matches;

    if (capable) {
      var items = [].slice.call(document.querySelectorAll('[data-parallax]')).map(function (el) {
        return { el: el, s: parseFloat(el.getAttribute('data-parallax')) };
      });
      var ticking = false;
      var update = function () {
        var y = window.scrollY;
        items.forEach(function (it) {
          it.el.style.transform = 'translate3d(0,' + (y * it.s).toFixed(1) + 'px,0)';
        });
        ticking = false;
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
      }, { passive: true });
      update();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
