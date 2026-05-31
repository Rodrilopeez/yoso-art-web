/* ============================================================
   YOSO — Formularios (contacto + newsletter)
   Validación accesible + envío por mailto (sin backend).
   Para producción: sustituir sendViaMailto() por un POST a
   Formspree / Web3Forms / Brevo (ver README / nota del repo).
   ============================================================ */
(function () {
  'use strict';

  const RECIPIENT = 'yosolg@gmail.com';

  function setStatus(form, msg, ok) {
    const el = form.querySelector('.form__status');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('is-ok', !!ok);
    el.classList.toggle('is-error', !ok);
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  // ---- Contacto ----
  const contact = document.getElementById('contactForm');
  if (contact) {
    contact.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contact.name.value.trim();
      const email = contact.email.value.trim();
      const subject = contact.subject.value;
      const message = contact.message.value.trim();

      if (!name || !validEmail(email) || !message) {
        setStatus(contact, 'Revisa tu nombre, un email válido y el mensaje.', false);
        return;
      }
      const body = `Nombre: ${name}\nEmail: ${email}\n\n${message}`;
      window.location.href = `mailto:${RECIPIENT}?subject=${encodeURIComponent('[yoso.art] ' + subject)}&body=${encodeURIComponent(body)}`;
      setStatus(contact, 'Abriendo tu cliente de correo para enviar el mensaje…', true);
    });
  }

  // ---- Newsletter ----
  const news = document.getElementById('newsletterForm');
  if (news) {
    news.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = news.email.value.trim();
      if (!validEmail(email)) {
        setStatus(news, 'Introduce un email válido.', false);
        return;
      }
      const body = `Quiero recibir avisos de nueva obra disponible.\nEmail: ${email}`;
      window.location.href = `mailto:${RECIPIENT}?subject=${encodeURIComponent('[yoso.art] Alta en avisos de nueva obra')}&body=${encodeURIComponent(body)}`;
      setStatus(news, '¡Gracias! Abriendo tu correo para confirmar la suscripción.', true);
    });
  }
})();
