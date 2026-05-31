/* ============================================================
   YOSO — Acordeón FAQ accesible
   Cada pregunta es un <button aria-expanded> que muestra/oculta
   su respuesta. Sin dependencias.
   ============================================================ */
(function () {
  'use strict';
  const buttons = document.querySelectorAll('.faq__q');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item');
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      item.classList.toggle('is-open', !expanded);
    });
  });
})();
