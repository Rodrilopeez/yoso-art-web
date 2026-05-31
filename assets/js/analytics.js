/* ============================================================
   YOSO — Analítica (GA4) e instrumentación de eventos clave
   Activa GA4 solo cuando GA_ID tenga un ID real (sustituir el
   placeholder). Los eventos se registran vía gtag/dataLayer:
   - cta_ver_obra        (clic en el CTA principal del hero)
   - cta_consultar_precio(clic en "Consultar precio" de una ficha)
   - obra_abrir          (clic en una obra de la galería)
   - obra_ver_ficha      (clic en "Ver ficha")
   - form_contacto / form_newsletter (envío de formularios)
   - scroll_galeria      (la galería entra en viewport)
   ============================================================ */
(function () {
  'use strict';

  // ←—— Sustituir por el ID de medición de GA4 (formato G-XXXXXXXXXX)
  const GA_ID = 'G-XXXXXXXXXX';
  const enabled = /^G-[A-Z0-9]{8,}$/.test(GA_ID) && GA_ID !== 'G-XXXXXXXXXX';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  if (enabled) {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  function track(name, params) {
    if (enabled) gtag('event', name, params || {});
  }
  window.yosoTrack = track; // disponible para forms.js u otros

  // ---- CTA principal del hero ----
  document.querySelectorAll('.hero__ctas .btn--on-dark').forEach((el) =>
    el.addEventListener('click', () => track('cta_ver_obra', { location: 'hero' })));

  // ---- "Consultar precio" en fichas ----
  document.querySelectorAll('.obra__ctas .btn--gold').forEach((el) =>
    el.addEventListener('click', () => track('cta_consultar_precio', {
      obra: (document.querySelector('.obra__info h1') || {}).textContent || '',
    })));

  // ---- Clic en obra (galería) y "Ver ficha" ----
  document.querySelectorAll('.work').forEach((fig) => {
    const title = (fig.querySelector('.work__title') || {}).textContent || '';
    const btn = fig.querySelector('.work__btn');
    if (btn) btn.addEventListener('click', () => track('obra_abrir', { obra: title }));
    const ficha = fig.querySelector('.work__ficha');
    if (ficha) ficha.addEventListener('click', () => track('obra_ver_ficha', { obra: title }));
  });

  // ---- Envío de formularios ----
  const cf = document.getElementById('contactForm');
  if (cf) cf.addEventListener('submit', () => track('form_contacto', {
    asunto: (cf.querySelector('#cf-subject') || {}).value || '',
  }));
  const nf = document.getElementById('newsletterForm');
  if (nf) nf.addEventListener('submit', () => track('form_newsletter'));

  // ---- Scroll en galería (primera vez que entra en viewport) ----
  const gal = document.getElementById('arte-digital');
  if (gal && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { track('scroll_galeria'); io.disconnect(); }
      });
    }, { threshold: 0.25 });
    io.observe(gal);
  }
})();
