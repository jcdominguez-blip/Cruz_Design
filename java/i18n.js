/* ═══════════════════════════════════════════════════════════════════════
   i18n — Motor bilingüe ES/EN para Cruz Estudio.
   ------------------------------------------------------------------------
   • Diccionario en java/i18n-dict.js (window.CRUZ_I18N = { es:{}, en:{} }).
   • Marcado en el HTML:
       data-i18n="clave"        → reemplaza textContent
       data-i18n-html="clave"   → reemplaza innerHTML (frases con <span> internos)
       data-i18n-attr="attr:clave;attr2:clave2"  → reemplaza atributos
   • Persistencia: localStorage 'cruz-lang'. Default 'es'.
   • Importante: este script es `defer` y va ANTES que los splitters
     (split-reveal.js, type.js, faq.js…). Así el texto ya está en el idioma
     elegido cuando esos scripts parten los titulares en spans por carácter.
   • Al cambiar de idioma en caliente NO reescribimos los spans ya animados:
     guardamos la preferencia y recargamos, para que los splitters vuelvan a
     correr sobre el texto correcto y las animaciones queden intactas.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORE = 'cruz-lang';
  var DEFAULT = 'es';
  var SUPPORTED = ['es', 'en'];
  var DICT = window.CRUZ_I18N || {};

  function getLang() {
    try {
      var v = localStorage.getItem(STORE);
      if (v && SUPPORTED.indexOf(v) !== -1) return v;
    } catch (e) {}
    return DEFAULT;
  }

  function t(lang, key) {
    var table = DICT[lang];
    if (table && Object.prototype.hasOwnProperty.call(table, key)) return table[key];
    return null;
  }

  function apply(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT;

    // Texto plano
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var v = t(lang, els[i].getAttribute('data-i18n'));
      if (v != null) els[i].textContent = v;
    }

    // Frases con marcado interno (ej. <span class="hl">…</span>)
    var htmlEls = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmlEls.length; j++) {
      var hv = t(lang, htmlEls[j].getAttribute('data-i18n-html'));
      if (hv != null) htmlEls[j].innerHTML = hv;
    }

    // Atributos (aria-label, placeholder, content, alt…)
    var attrEls = document.querySelectorAll('[data-i18n-attr]');
    for (var k = 0; k < attrEls.length; k++) {
      var pairs = attrEls[k].getAttribute('data-i18n-attr').split(';');
      for (var p = 0; p < pairs.length; p++) {
        var seg = pairs[p].split(':');
        var attr = (seg[0] || '').trim();
        var key = (seg[1] || '').trim();
        if (!attr || !key) continue;
        var av = t(lang, key);
        if (av != null) attrEls[k].setAttribute(attr, av);
      }
    }

    document.documentElement.setAttribute('lang', lang);
    reflectSwitch(lang);
  }

  // Marca visualmente la opción activa en todos los switches presentes
  function reflectSwitch(lang) {
    var opts = document.querySelectorAll('[data-lang-opt]');
    for (var i = 0; i < opts.length; i++) {
      var active = opts[i].getAttribute('data-lang-opt') === lang;
      opts[i].classList.toggle('is-active', active);
      opts[i].setAttribute('aria-pressed', active ? 'true' : 'false');
    }
    var groups = document.querySelectorAll('[data-lang-switch]');
    for (var g = 0; g < groups.length; g++) {
      groups[g].setAttribute('data-active-lang', lang);
    }
  }

  // Cambia el idioma: persiste y recarga (para re-split limpio de las animaciones)
  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    if (lang === getLang()) return;
    try { localStorage.setItem(STORE, lang); } catch (e) {}
    // Evita que el loader intro se vuelva a mostrar tras el reload de idioma
    try { sessionStorage.setItem('cruz-loader-visto', '1'); } catch (e) {}
    window.location.reload();
  }

  function wireSwitches() {
    var opts = document.querySelectorAll('[data-lang-opt]');
    for (var i = 0; i < opts.length; i++) {
      opts[i].addEventListener('click', function (e) {
        e.preventDefault();
        setLang(this.getAttribute('data-lang-opt'));
      });
    }
  }

  // API pública mínima
  window.CruzI18n = { apply: apply, set: setLang, get: getLang };

  // Aplica ANTES de que corran los splitters (este script va primero entre los defer).
  apply(getLang());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireSwitches);
  } else {
    wireSwitches();
  }
})();
