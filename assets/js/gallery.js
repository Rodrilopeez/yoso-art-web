/* ============================================================
   YOSO — Lightbox accesible (mejora progresiva)
   Sin dependencias. Lee las obras del DOM (.work) y permite
   ampliarlas con teclado, trampa de foco y aria-modal.
   ============================================================ */
(function () {
  'use strict';

  const works = Array.from(document.querySelectorAll('.work'));
  if (!works.length) return;

  // Modelo de datos extraído del DOM (fuente única de verdad)
  const items = works.map((fig) => {
    const img = fig.querySelector('img');
    const titleEl = fig.querySelector('.work__title');
    const metaEl = fig.querySelector('.work__meta');
    return {
      src: img.currentSrc || img.src,
      title: titleEl ? titleEl.textContent.trim() : (img.alt || ''),
      meta: metaEl ? metaEl.textContent.trim() : '',
      alt: img.alt || '',
    };
  });

  // ---- Construcción del lightbox (una sola vez) ----
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Visor de obra ampliada');
  lb.innerHTML = `
    <button type="button" class="lightbox__btn lightbox__close" aria-label="Cerrar (Esc)">×</button>
    <button type="button" class="lightbox__btn lightbox__prev" aria-label="Obra anterior (flecha izquierda)">‹</button>
    <figure class="lightbox__figure">
      <img class="lightbox__img" src="" alt="">
      <figcaption class="lightbox__cap"></figcaption>
    </figure>
    <button type="button" class="lightbox__btn lightbox__next" aria-label="Obra siguiente (flecha derecha)">›</button>`;
  document.body.appendChild(lb);

  const lbImg = lb.querySelector('.lightbox__img');
  const lbCap = lb.querySelector('.lightbox__cap');
  const btnClose = lb.querySelector('.lightbox__close');
  const btnPrev = lb.querySelector('.lightbox__prev');
  const btnNext = lb.querySelector('.lightbox__next');
  const focusables = [btnClose, btnPrev, btnNext];

  let current = 0;
  let lastFocused = null;

  function render(i) {
    const it = items[i];
    lbImg.src = it.src;
    lbImg.alt = it.alt;
    lbCap.innerHTML = it.meta
      ? `${escapeHtml(it.title)}<small>${escapeHtml(it.meta)}</small>`
      : escapeHtml(it.title);
  }

  function open(i) {
    current = i;
    lastFocused = document.activeElement;
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    render(i);
    // visibility:visible se aplica al instante (ver gallery.css), por lo
    // que el botón ya es enfocable: movemos el foco al diálogo.
    btnClose.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function close() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function go(delta) {
    current = (current + delta + items.length) % items.length;
    render(current);
  }

  function onKeydown(e) {
    switch (e.key) {
      case 'Escape': close(); break;
      case 'ArrowRight': go(1); break;
      case 'ArrowLeft': go(-1); break;
      case 'Tab': trapFocus(e); break;
    }
  }

  function trapFocus(e) {
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---- Listeners ----
  works.forEach((fig, i) => {
    const btn = fig.querySelector('.work__btn');
    if (btn) btn.addEventListener('click', () => open(i));
  });
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => go(-1));
  btnNext.addEventListener('click', () => go(1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
})();
