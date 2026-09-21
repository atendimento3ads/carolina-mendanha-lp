/* LP Carolina Mendanha — /advogada-trabalhista-para-empresas/ */

/* Conversão "Clique WhatsApp" (Google Ads) — dispara no clique real, não no carregamento
   da página, para evitar contagem duplicada em recarregamentos de /obrigado. */
window.gtag_report_conversion = function (url) {
  var callback = function () {
    if (typeof url !== 'undefined') window.location = url;
  };
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      'send_to': 'AW-17330897187/4pRSCI7Hw9wcEKOCgshA',
      'event_callback': callback
    });
  } else {
    callback();
  }
  return false;
};

(function () {
  var WA_NUMBER = '556292280866';
  var SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw0G7lYYAi5_9KJnxtK_hCsIpqjSt_BYurQ9V8TOX8uIGERPaBCrGbMchdrWBaN9DaSaA/exec';

  /* Mensagens padrão do WhatsApp (copy da v2) */
  var SITUACAO_MSG = {
    acao: 'uma ação trabalhista',
    notificacao: 'uma notificação trabalhista',
    intimacao: 'uma intimação trabalhista',
    outra: 'uma demanda trabalhista'
  };
  function aberturaWhatsApp(situacao) {
    if (situacao === 'audiencia') {
      return 'Olá, Dra. Carolina! Minha empresa tem uma audiência trabalhista marcada e preciso de orientação para me preparar.';
    }
    return 'Olá, Dra. Carolina! Minha empresa recebeu ' + (SITUACAO_MSG[situacao] || SITUACAO_MSG.outra) +
      ' e gostaria de orientação sobre como responder. Pode me ajudar?';
  }

  function pushDataLayer(obj) { if (window.dataLayer) window.dataLayer.push(obj); }

  function maskPhone(v) {
    var d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length > 10) return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    if (d.length > 6) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    if (d.length > 2) return d.replace(/(\d{2})(\d{0,5})/, '($1) $2').replace(/\s$/, '');
    if (d.length > 0) return '(' + d;
    return '';
  }

  /* CNPJ numérico ou alfanumérico (novo formato da Receita, a partir de jul/2026):
     12 posições [0-9A-Z] + 2 dígitos verificadores; cada caractere vale (código ASCII - 48). */
  function cnpjClean(v) { return v.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 14); }
  function maskCnpj(v) {
    var c = cnpjClean(v), out = '';
    for (var i = 0; i < c.length; i++) {
      if (i === 2 || i === 5) out += '.';
      if (i === 8) out += '/';
      if (i === 12) out += '-';
      out += c[i];
    }
    return out;
  }
  function cnpjValid(v) {
    var c = cnpjClean(v);
    if (!/^[0-9A-Z]{12}\d{2}$/.test(c) || /^(\d)\1{13}$/.test(c)) return false;
    function dv(len) {
      var sum = 0, weight = 2;
      for (var i = len - 1; i >= 0; i--) {
        sum += (c.charCodeAt(i) - 48) * weight;
        weight = weight === 9 ? 2 : weight + 1;
      }
      var r = sum % 11;
      return r < 2 ? 0 : 11 - r;
    }
    return dv(12) === +c[12] && dv(13) === +c[13];
  }

  function inputValid(input) {
    if (input.getAttribute('data-validate') === 'cnpj') return cnpjValid(input.value);
    if (input.type === 'tel') return input.value.replace(/\D/g, '').length >= 10;
    return input.value.trim().length >= 2;
  }

  /* ─── Formulário conversacional (uma instância por [data-lead-form]) ─── */
  function LeadForm(root) {
    var form = root.querySelector('form');
    var steps = [].slice.call(form.querySelectorAll('.f-step'));
    var progressFill = root.querySelector('[data-progress-fill]');
    var progressText = root.querySelector('[data-progress-text]');
    var formId = root.getAttribute('data-lead-form');
    var current = 0;
    var started = false;
    var sending = false;
    var state = {};

    function labelText(input) {
      var span = input.closest('label').querySelector('span');
      return span ? span.textContent.trim() : '';
    }

    function show(i, focusIt) {
      current = i;
      steps.forEach(function (s, j) { s.classList.toggle('active', j === i); });
      if (progressFill) progressFill.style.width = ((i + 1) / steps.length * 100) + '%';
      if (progressText) progressText.textContent = 'Etapa ' + (i + 1) + ' de ' + steps.length;
      if (focusIt !== false) {
        window.requestAnimationFrame(function () {
          var target = steps[i].querySelector('.f-input, input[type="radio"]');
          if (target) target.focus({ preventScroll: true });
        });
      }
    }

    function markStarted() {
      if (started) return;
      started = true;
      pushDataLayer({ event: 'form_inicio', formulario: formId });
    }

    function showError(step, inputs, on) {
      var err = step.querySelector('.f-error');
      if (err) err.hidden = !on;
      inputs.forEach(function (input) {
        input.classList.remove('error');
        if (on && !inputValid(input)) { void input.offsetWidth; input.classList.add('error'); }
      });
    }

    steps.forEach(function (step, i) {
      /* Radios com auto-avanço */
      var radios = [].slice.call(step.querySelectorAll('input[type="radio"]'));
      radios.forEach(function (radio) {
        radio.addEventListener('change', function () {
          markStarted();
          radios.forEach(function (r) { r.closest('.f-option').classList.toggle('checked', r.checked); });
          state[radio.name] = radio.value;
          state[radio.name + 'Label'] = labelText(radio);
          setTimeout(function () { show(i + 1); }, 320);
        });
      });

      /* Campos de texto: botão só "acende" quando todos estão válidos; a validação
         real acontece no clique (o botão nunca fica disabled, para não travar com autopreenchimento). */
      var inputs = [].slice.call(step.querySelectorAll('.f-input'));
      if (!inputs.length) return;
      var nextBtn = step.querySelector('[data-next]');
      function stepValid() { return inputs.every(inputValid); }
      function refresh() {
        nextBtn.classList.toggle('is-inactive', !stepValid());
        if (stepValid()) showError(step, inputs, false);
      }

      inputs.forEach(function (input, k) {
        if (input.getAttribute('data-validate') === 'cnpj') {
          input.addEventListener('input', function () { input.value = maskCnpj(input.value); refresh(); });
          input.addEventListener('paste', function () {
            window.requestAnimationFrame(function () { input.value = maskCnpj(input.value); refresh(); });
          });
        }
        if (input.type === 'tel') {
          input.addEventListener('input', function () { input.value = maskPhone(input.value); refresh(); });
          input.addEventListener('paste', function () {
            window.requestAnimationFrame(function () { input.value = maskPhone(input.value); refresh(); });
          });
        }
        ['input', 'change', 'keyup', 'blur', 'paste', 'animationstart'].forEach(function (ev) {
          input.addEventListener(ev, refresh);
        });
        input.addEventListener('keydown', function (e) {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          if (k < inputs.length - 1 && inputValid(input)) inputs[k + 1].focus();
          else nextBtn.click();
        });
      });

      nextBtn.addEventListener('click', function (e) {
        if (!stepValid()) {
          e.preventDefault();
          showError(step, inputs, true);
          var firstBad = inputs.filter(function (x) { return !inputValid(x); })[0];
          if (firstBad) firstBad.focus();
          return;
        }
        inputs.forEach(function (input) { state[input.name] = input.value.trim(); });
        if (nextBtn.type !== 'submit') show(i + 1);
      });
    });

    var backButtons = form.querySelectorAll('[data-back]');
    for (var b = 0; b < backButtons.length; b++) {
      backButtons[b].addEventListener('click', function () { if (current > 0) show(current - 1); });
    }

    function enviarLeadParaPlanilha() {
      var params = new URLSearchParams(window.location.search);
      var payload = {
        nome: state.nome,
        empresa: state.empresa,
        cnpj: state.cnpj,
        whatsapp: state.whatsapp,
        cidade: state.cidade,
        categoria: 'Empresa',
        situacao: state.situacaoLabel,
        prazo: state.prazoLabel,
        data_referencia: state.data,
        formulario: formId,
        pagina: window.location.href,
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || '',
        gclid: params.get('gclid') || ''
      };

      /* no-cors evita preflight no Apps Script; keepalive permite que o POST
         termine mesmo após o redirecionamento para a página de obrigado. */
      fetch(SHEETS_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-store',
        keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(payload)
      }).catch(function () {
        pushDataLayer({ event: 'lead_planilha_erro' });
      });
    }

    /* Envio final: registra na planilha, abre o WhatsApp e segue para /obrigado (rastreio) */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending || current !== steps.length - 1) return;
      var lastInputs = [].slice.call(steps[current].querySelectorAll('.f-input'));
      if (!lastInputs.every(inputValid)) return;
      lastInputs.forEach(function (input) { state[input.name] = input.value.trim(); });
      sending = true;
      steps[current].querySelector('[type="submit"]').disabled = true;

      var msg = [
        aberturaWhatsApp(state.situacao),
        '',
        'Resumo:',
        '• Nome: ' + state.nome,
        '• Empresa: ' + state.empresa,
        '• CNPJ: ' + state.cnpj,
        '• Cidade/UF: ' + state.cidade,
        '• Situação: ' + state.situacaoLabel,
        '• Prazo ou audiência marcada: ' + state.prazoLabel,
        '• Data: ' + state.data,
        '• WhatsApp: ' + state.whatsapp
      ].join('\n');

      pushDataLayer({ event: 'lead_qualificado', situacao: state.situacao, prazo: state.prazo, formulario: formId });
      enviarLeadParaPlanilha();
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      window.gtag_report_conversion('/obrigado');
    });

    show(0, false);
  }

  function init() {
    /* ─── Ano atual no rodapé ─── */
    var ano = document.getElementById('ano-atual');
    if (ano) ano.textContent = new Date().getFullYear();

    /* ─── Troca de media das fontes (carregamento não-bloqueante) ─── */
    var fontLinks = document.querySelectorAll('link[data-fontswap]');
    for (var i = 0; i < fontLinks.length; i++) fontLinks[i].media = 'all';

    /* ─── FAQ (acordeão, fechado por padrão) ─── */
    var faqBtns = document.querySelectorAll('.faq-btn');
    function toggleFaq(btn) {
      var isOpen = btn.classList.contains('open');
      for (var j = 0; j < faqBtns.length; j++) {
        faqBtns[j].classList.remove('open');
        faqBtns[j].setAttribute('aria-expanded', 'false');
        faqBtns[j].nextElementSibling.classList.remove('open');
      }
      if (!isOpen) {
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        btn.nextElementSibling.classList.add('open');
      }
    }
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
      var onScrollHeader = function () { header.classList.toggle('scrolled', window.scrollY > 12); };
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
        items.forEach(function (it) { it.el.style.transform = 'translate3d(0,' + (y * it.s).toFixed(1) + 'px,0)'; });
        ticking = false;
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
      }, { passive: true });
      update();
    }

    /* ─── Vídeo: embed do YouTube carregado só no clique (capa leve até lá) ─── */
    var videoCards = document.querySelectorAll('.video-card');
    for (var v = 0; v < videoCards.length; v++) {
      (function (card) {
        var play = card.querySelector('.video-play');
        if (!play) return;
        play.addEventListener('click', function () {
          /* aceita o ID puro ou um link (watch?v=, youtu.be/, /shorts/, /embed/) */
          var raw = (card.getAttribute('data-youtube-id') || '').trim();
          var m = raw.match(/(?:v=|youtu\.be\/|\/shorts\/|\/embed\/)([\w-]{6,})/);
          var id = m ? m[1] : raw;
          if (!id) {
            var soon = card.querySelector('.video-soon');
            if (soon) soon.hidden = false;
            return;
          }
          var iframe = document.createElement('iframe');
          iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&controls=1&fs=1&playsinline=1&rel=0';
          iframe.title = 'Vídeo da Dra. Ana Carolina Mendanha';
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
          iframe.allowFullscreen = true;
          iframe.referrerPolicy = 'strict-origin-when-cross-origin';
          card.appendChild(iframe);
          card.classList.add('is-playing');
          play.remove();
        });
      })(videoCards[v]);
    }

    /* ─── Formulários ─── */
    var forms = [].slice.call(document.querySelectorAll('[data-lead-form]'));
    forms.forEach(function (root) { new LeadForm(root); });

    /* CTAs "Relatar / Enviar / Analisar": rolam até o formulário mais próximo da tela */
    var toFormLinks = document.querySelectorAll('[data-to-form]');
    for (var t = 0; t < toFormLinks.length; t++) {
      toFormLinks[t].addEventListener('click', function (e) {
        if (!forms.length) return;
        e.preventDefault();
        var nearest = forms.reduce(function (best, f) {
          return Math.abs(f.getBoundingClientRect().top) < Math.abs(best.getBoundingClientRect().top) ? f : best;
        });
        nearest.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        pushDataLayer({ event: 'cta_formulario', cta: this.textContent.trim() });
      });
    }

    /* Cliques nos botões de WhatsApp direto (rastreio configurado depois, via GTM) */
    var waLinks = document.querySelectorAll('[data-wa]');
    for (var w = 0; w < waLinks.length; w++) {
      waLinks[w].addEventListener('click', function () {
        pushDataLayer({ event: 'clique_whatsapp', origem: this.getAttribute('data-wa') });
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
