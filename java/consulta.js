/* ═══════════════════════════════════════════════════════════════════════
   CRUZ ESTUDIO ® — CONSULTA (/consulta)
   ------------------------------------------------------------------------
   Etapa 2 · Animación tipográfica del hero (GSAP, split por palabra) + el
             reveal-scroll de los bloques lo maneja java/gsap-reveal.js
             (clase .gsap-reveal, mismo stack Lenis + ScrollTrigger).
   Etapa 3 · Al enviar con éxito → modal del design system "consulta enviada".
   Etapa 4 · Envío vía FormSubmit.co (AJAX) a estudiocruzdesign@gmail.com con
             copia (_cc) a mariaritacha@gmail.com y paezotta@gmail.com.
             ⚠ La PRIMERA vez, FormSubmit manda un mail de activación a la
             casilla principal: hay que apretar "Activate Form" una sola vez.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* Destino del formulario ------------------------------------------------ */
    var PRIMARY = 'estudiocruzdesign@gmail.com';
    var CC = 'mariaritacha@gmail.com,paezotta@gmail.com';
    var ENDPOINT = 'https://formsubmit.co/ajax/' + encodeURIComponent(PRIMARY);

    var form = document.getElementById('consultaForm');
    if (!form) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ───────────────── Reloj del footer (GMT-3) ───────────────── */
    (function clock() {
        var el = document.getElementById('footer-clock');
        if (!el) return;
        function tick() {
            var now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
            var hh = String(now.getHours()).padStart(2, '0');
            var mm = String(now.getMinutes()).padStart(2, '0');
            el.textContent = hh + ':' + mm;
        }
        tick();
        setInterval(tick, 30000);
    })();

    /* ───────────────── Etapa 2 · Reveal tipográfico del hero ───────────────── */
    function animateTitle() {
        var title = document.querySelector('.cs-title');
        if (!title) return;

        // Parte el titular en palabras (cada una con un span interno que se desliza)
        var words = title.textContent.trim().split(/\s+/);
        title.textContent = '';
        var inners = [];
        words.forEach(function (w, i) {
            var wrap = document.createElement('span');
            wrap.className = 'cs-word';
            var inner = document.createElement('span');
            inner.textContent = w;
            wrap.appendChild(inner);
            title.appendChild(wrap);
            if (i < words.length - 1) title.appendChild(document.createTextNode(' '));
            inners.push(inner);
        });

        if (reduce || typeof gsap === 'undefined') return; // texto visible sin animar

        gsap.set(inners, { yPercent: 115 });
        gsap.to(inners, {
            yPercent: 0,
            duration: 1.1,
            ease: 'power4.out',
            stagger: 0.08,
            delay: 0.15
        });
    }

    /* ───────────────── Slider de inversión (ARS / USD por idioma) ───────────────── */
    (function investmentSlider() {
        var range = document.getElementById('csRange');
        if (!range) return;

        var CFG = {
            es: { code: 'ARS', locale: 'es-AR', min: 1500000, max: 8000000, step: 500000 },
            en: { code: 'USD', locale: 'en-US', min: 1500,    max: 8000,    step: 500 }
        };
        var lang = (window.CruzI18n && window.CruzI18n.get) ? window.CruzI18n.get() : 'es';
        var cfg = CFG[lang] || CFG.es;

        var amountEl = document.getElementById('csAmount');
        var curEl = document.getElementById('csCur');
        var minEl = document.getElementById('csMin');
        var maxEl = document.getElementById('csMax');
        var hidden = document.getElementById('csInversion');

        var fmt = new Intl.NumberFormat(cfg.locale, { maximumFractionDigits: 0 });
        function money(n) { return '$' + fmt.format(n); }

        // Aplica la configuración del idioma al control
        range.min = cfg.min;
        range.max = cfg.max;
        range.step = cfg.step;
        // Arranque determinístico en el mínimo (evita restauración de bfcache)
        range.value = cfg.min;

        if (curEl) curEl.textContent = cfg.code;
        if (minEl) minEl.textContent = money(cfg.min);
        if (maxEl) maxEl.textContent = money(cfg.max);
        range.setAttribute('aria-valuetext', money(+range.value) + ' ' + cfg.code);

        function update() {
            var v = +range.value;
            var pct = ((v - cfg.min) / (cfg.max - cfg.min)) * 100;
            range.style.setProperty('--cs-fill', pct + '%');
            if (amountEl) amountEl.textContent = money(v);
            if (hidden) hidden.value = money(v) + ' ' + cfg.code;
            range.setAttribute('aria-valuetext', money(v) + ' ' + cfg.code);
        }

        range.addEventListener('input', update);
        update();
    })();

    /* ───────────────── Validación mínima en cliente ───────────────── */
    function clearInvalid() {
        var marked = form.querySelectorAll('.cs-block.cs-invalid');
        for (var i = 0; i < marked.length; i++) marked[i].classList.remove('cs-invalid');
    }

    function firstInvalidBlock() {
        var blocks = form.querySelectorAll('.cs-block');
        for (var i = 0; i < blocks.length; i++) {
            // Checkboxes (servicios, selección múltiple): al menos uno marcado.
            // Se evalúa antes del gate de [required] porque los checkboxes no lo llevan.
            var checks = blocks[i].querySelectorAll('input[type="checkbox"]');
            if (checks.length) {
                var anyCheck = false;
                for (var k = 0; k < checks.length; k++) if (checks[k].checked) anyCheck = true;
                if (!anyCheck) return blocks[i];
                continue;
            }

            var reqs = blocks[i].querySelectorAll('input[required], textarea[required]');
            if (!reqs.length) continue;

            // Radios: al menos uno del grupo marcado
            var radios = blocks[i].querySelectorAll('input[type="radio"]');
            if (radios.length) {
                var anyChecked = false;
                for (var r = 0; r < radios.length; r++) if (radios[r].checked) anyChecked = true;
                if (!anyChecked) return blocks[i];
                continue;
            }
            // Text / email
            for (var q = 0; q < reqs.length; q++) {
                var f = reqs[q];
                if (!f.value.trim() || (f.type === 'email' && !f.checkValidity())) return blocks[i];
            }
        }
        return null;
    }

    /* ───────────────── Etapa 3 · Modal de éxito ───────────────── */
    var modal = document.getElementById('csModal');
    var lastFocus = null;

    function openModal() {
        if (!modal) return;
        lastFocus = document.activeElement;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        var closeBtn = modal.querySelector('.cs-modal-close');
        if (closeBtn) closeBtn.focus();
    }
    function closeModal() {
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    if (modal) {
        var closers = modal.querySelectorAll('[data-cs-close]');
        for (var c = 0; c < closers.length; c++) closers[c].addEventListener('click', closeModal);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
        });
    }

    /* ───────────────── Errores ───────────────── */
    var errBox = document.getElementById('csError');
    function showError(key) {
        if (!errBox) return;
        var dict = (window.CRUZ_I18N && window.CruzI18n) ? window.CRUZ_I18N[window.CruzI18n.get()] : null;
        errBox.textContent = (dict && dict[key]) ? dict[key] : 'Revisá los datos e intentá de nuevo.';
        errBox.hidden = false;
    }
    function hideError() { if (errBox) errBox.hidden = true; }

    /* ───────────────── Envío ───────────────── */
    var submitBtn = document.getElementById('csSubmit');
    var ctaText = submitBtn ? submitBtn.querySelector('.cta-text') : null;
    var ctaOriginal = ctaText ? ctaText.textContent : '';
    var sending = false;

    function i18nText(key, fallback) {
        var dict = (window.CRUZ_I18N && window.CruzI18n) ? window.CRUZ_I18N[window.CruzI18n.get()] : null;
        return (dict && dict[key]) ? dict[key] : fallback;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (sending) return;

        // Honeypot: si viene relleno, es bot → fingimos éxito sin enviar
        if (form.querySelector('.cs-honey') && form.querySelector('.cs-honey').value) {
            openModal();
            return;
        }

        clearInvalid();
        hideError();

        var bad = firstInvalidBlock();
        if (bad) {
            bad.classList.add('cs-invalid');
            showError('consulta.err.fields');
            if (typeof bad.scrollIntoView === 'function') {
                bad.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
            }
            return;
        }

        // Arma el payload
        var payload = {
            _subject: 'Nueva consulta — Cliente potencial (cruzestudio.com.ar)',
            _cc: CC,
            _template: 'table',
            _captcha: 'false'
        };
        var fd = new FormData(form);
        fd.forEach(function (value, key) {
            if (key === '_honey') return;
            // Grupos con múltiples valores (p.ej. "Servicios") llegan repetidos:
            // los concatenamos en una sola línea legible para el mail.
            if (Object.prototype.hasOwnProperty.call(payload, key)) {
                payload[key] = payload[key] + ', ' + value;
            } else {
                payload[key] = value;
            }
        });

        sending = true;
        if (submitBtn) submitBtn.classList.add('is-sending');
        if (ctaText) ctaText.textContent = i18nText('consulta.sending', 'ENVIANDO…');

        fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(function () {
            form.reset();
            openModal();
        })
        .catch(function (err) {
            /* eslint-disable no-console */
            if (window.console) console.error('[consulta] envío falló:', err);
            showError('consulta.err.generic');
        })
        .finally(function () {
            sending = false;
            if (submitBtn) submitBtn.classList.remove('is-sending');
            if (ctaText) ctaText.textContent = ctaOriginal;
        });
    });

    /* ───────────────── Init ───────────────── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', animateTitle);
    } else {
        animateTitle();
    }
})();
