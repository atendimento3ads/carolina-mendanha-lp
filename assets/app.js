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

    /* ─── Formulário de qualificação (multi-etapas) ─── */
    var form = document.getElementById('lead-form');
    if (form) {
      var WA_NUMBER = '556292280866';
      var STEPS = ['nome', 'whatsapp', 'categoria', 'situacao', 'prazo', 'revisao'];
      var blockedPanel = document.getElementById('f-blocked');
      var progressFill = document.getElementById('form-progress-fill');
      var progressText = document.getElementById('form-progress-text');
      var reviewList = document.getElementById('f-review-list');

      var state = { nome: '', whatsapp: '', categoria: '', situacao: '', situacaoLabel: '', prazo: '', prazoLabel: '' };
      var current = 'nome';
      var presetSituacao = null;
      var presetApplied = false;

      function labelText(input) {
        var label = input.closest('label');
        var span = label ? label.querySelector('span') : null;
        return span ? span.textContent.trim() : '';
      }

      function applyPresetIfNeeded(id) {
        if (id !== 'situacao' || !presetSituacao || presetApplied) return;
        var input = form.querySelector('input[name="situacao"][value="' + presetSituacao + '"]');
        if (input) {
          input.checked = true;
          var opt = input.closest('.f-option');
          if (opt) opt.classList.add('checked');
          state.situacao = input.value;
          state.situacaoLabel = labelText(input);
        }
        presetApplied = true;
      }

      function updateProgress(id) {
        if (!progressFill) return;
        var idx = STEPS.indexOf(id === 'bloqueado' ? 'categoria' : id);
        if (idx < 0) idx = 0;
        var pct = ((idx + 1) / STEPS.length) * 100;
        progressFill.style.width = pct + '%';
        if (progressText) {
          progressText.textContent = id === 'bloqueado' ? 'Verificando elegibilidade' : 'Etapa ' + (idx + 1) + ' de ' + STEPS.length;
        }
      }

      function showStep(id, focusIt) {
        current = id;
        var allPanels = form.querySelectorAll('.f-step');
        for (var i = 0; i < allPanels.length; i++) allPanels[i].classList.remove('active');
        if (blockedPanel) blockedPanel.classList.remove('active');

        if (id === 'bloqueado') {
          if (blockedPanel) blockedPanel.classList.add('active');
          form.style.display = 'none';
        } else {
          form.style.display = '';
          var panel = form.querySelector('.f-step[data-step="' + id + '"]');
          if (panel) panel.classList.add('active');
        }
        applyPresetIfNeeded(id);
        updateProgress(id);

        if (focusIt !== false) {
          window.requestAnimationFrame(function () {
            var target = id === 'bloqueado' ? blockedPanel : form.querySelector('.f-step[data-step="' + id + '"]');
            if (!target) return;
            var focusable = target.querySelector('input, button');
            if (focusable) focusable.focus({ preventScroll: true });
          });
        }
      }

      function next() {
        var idx = STEPS.indexOf(current);
        if (idx < 0 || idx >= STEPS.length - 1) return;
        showStep(STEPS[idx + 1]);
      }
      function back() {
        var idx = STEPS.indexOf(current);
        if (idx <= 0) return;
        showStep(STEPS[idx - 1]);
      }

      /* Utilitário: liga vários eventos de uma vez (cobre digitação, colar e
         autopreenchimento do navegador/gerenciador de senhas, que nem sempre
         disparam 'input'). O botão nunca fica com o atributo disabled — assim
         o clique sempre funciona; a validação real acontece no clique. */
      function onAny(el, events, fn) {
        events.forEach(function (ev) { el.addEventListener(ev, fn); });
      }
      function showFieldError(input, errorEl, show) {
        input.classList.toggle('error', !!show);
        if (errorEl) errorEl.hidden = !show;
        if (show) {
          input.classList.remove('error');
          void input.offsetWidth; /* reinicia a animação de shake se já estava marcado como erro */
          input.classList.add('error');
        }
      }

      /* Nome */
      var nomeInput = document.getElementById('f-nome');
      var nomeNext = form.querySelector('.f-step[data-step="nome"] [data-next]');
      var nomeError = document.getElementById('f-nome-error');
      function nomeValid() { return nomeInput.value.trim().length >= 2; }
      function refreshNomeButton() { nomeNext.classList.toggle('is-inactive', !nomeValid()); if (nomeValid()) showFieldError(nomeInput, nomeError, false); }
      onAny(nomeInput, ['input', 'change', 'keyup', 'blur', 'paste', 'animationstart'], refreshNomeButton);
      nomeInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); nomeNext.click(); }
      });
      nomeNext.addEventListener('click', function () {
        if (nomeValid()) { state.nome = nomeInput.value.trim(); next(); }
        else { showFieldError(nomeInput, nomeError, true); nomeInput.focus(); }
      });

      /* WhatsApp */
      var waInput = document.getElementById('f-whatsapp');
      var waNext = form.querySelector('.f-step[data-step="whatsapp"] [data-next]');
      var waError = document.getElementById('f-whatsapp-error');
      function maskPhone(v) {
        var d = v.replace(/\D/g, '').slice(0, 11);
        if (d.length > 10) return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
        if (d.length > 6) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
        if (d.length > 2) return d.replace(/(\d{2})(\d{0,5})/, '($1) $2').replace(/\s$/, '');
        if (d.length > 0) return '(' + d;
        return '';
      }
      function waValid() { return waInput.value.replace(/\D/g, '').length >= 10; }
      function refreshWaButton() { waNext.classList.toggle('is-inactive', !waValid()); if (waValid()) showFieldError(waInput, waError, false); }
      onAny(waInput, ['change', 'keyup', 'blur', 'animationstart'], refreshWaButton);
      waInput.addEventListener('input', function () { waInput.value = maskPhone(waInput.value); refreshWaButton(); });
      waInput.addEventListener('paste', function () { window.requestAnimationFrame(function () { waInput.value = maskPhone(waInput.value); refreshWaButton(); }); });
      waInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); waNext.click(); }
      });
      waNext.addEventListener('click', function () {
        if (waValid()) { state.whatsapp = waInput.value.trim(); next(); }
        else { showFieldError(waInput, waError, true); waInput.focus(); }
      });

      /* Radios com auto-avanço */
      function wireRadioGroup(name, onPick) {
        var inputs = form.querySelectorAll('input[name="' + name + '"]');
        for (var i = 0; i < inputs.length; i++) {
          inputs[i].addEventListener('change', function () {
            var group = form.querySelectorAll('input[name="' + name + '"]');
            for (var j = 0; j < group.length; j++) {
              var opt = group[j].closest('.f-option');
              if (opt) opt.classList.toggle('checked', group[j].checked);
            }
            onPick(this);
          });
        }
      }

      wireRadioGroup('categoria', function (input) {
        state.categoria = input.value;
        if (window.dataLayer) {
          window.dataLayer.push({
            event: input.value === 'pessoa_fisica' ? 'form_desqualificado' : 'form_categoria_empresa',
            categoria: input.value
          });
        }
        setTimeout(function () {
          if (input.value === 'pessoa_fisica') showStep('bloqueado');
          else next();
        }, 320);
      });

      wireRadioGroup('situacao', function (input) {
        state.situacao = input.value;
        state.situacaoLabel = labelText(input);
        setTimeout(next, 320);
      });

      wireRadioGroup('prazo', function (input) {
        state.prazo = input.value;
        state.prazoLabel = labelText(input);
        setTimeout(function () { renderReview(); next(); }, 320);
      });

      /* Voltar */
      var backButtons = form.querySelectorAll('[data-back]');
      for (var b = 0; b < backButtons.length; b++) backButtons[b].addEventListener('click', back);
      var backFromBlocked = blockedPanel ? blockedPanel.querySelector('[data-back-blocked]') : null;
      if (backFromBlocked) backFromBlocked.addEventListener('click', function () { showStep('categoria'); });

      /* Revisão */
      function renderReview() {
        if (!reviewList) return;
        reviewList.innerHTML = '';
        var rows = [
          ['Nome', state.nome],
          ['WhatsApp', state.whatsapp],
          ['Situação', state.situacaoLabel],
          ['Prazo/audiência', state.prazoLabel]
        ];
        rows.forEach(function (r) {
          var div = document.createElement('div');
          div.className = 'f-review-item';
          var k = document.createElement('span'); k.className = 'k'; k.textContent = r[0];
          var v = document.createElement('span'); v.className = 'v'; v.textContent = r[1];
          div.appendChild(k); div.appendChild(v);
          reviewList.appendChild(div);
        });
      }

      /* Preset a partir dos CTAs da página (pré-seleciona a situação) */
      var presetLinks = document.querySelectorAll('[data-preset-situacao]');
      for (var p = 0; p < presetLinks.length; p++) {
        presetLinks[p].addEventListener('click', function () {
          presetSituacao = this.getAttribute('data-preset-situacao');
        });
      }

      /* Envio final: abre o WhatsApp com a mensagem pronta e segue para /obrigado (rastreio) */
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var submitBtn = document.getElementById('f-submit');
        if (submitBtn.disabled) return;
        submitBtn.disabled = true;

        var msg = [
          'Olá, Dra. Carolina! Me chamo ' + state.nome + '.',
          '',
          'Resumo do meu atendimento:',
          '• Situação: ' + state.situacaoLabel,
          '• Prazo/audiência: ' + state.prazoLabel,
          '• WhatsApp para contato: ' + state.whatsapp,
          '',
          'Aguardo retorno, obrigado(a)!'
        ].join('\n');

        var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);

        if (window.dataLayer) {
          window.dataLayer.push({ event: 'lead_qualificado', situacao: state.situacao, prazo: state.prazo });
        }

        window.open(url, '_blank', 'noopener');
        window.location.href = '/obrigado';
      });

      showStep('nome', false);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
