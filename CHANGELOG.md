# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí, mapeados a la
recomendación de origen de las auditorías de negocio y SEO.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [No publicado]

### Añadido
- `chore: inicialización del repositorio y estructura base` — scaffolding inicial
  (`README.md`, `.gitignore`, `CHANGELOG.md`, `docs/plan-de-trabajo.md`). Sin recomendación
  de auditoría asociada (paso de infraestructura).
- `feat(seo): esqueleto semántico + cabeza SEO + tokens de marca en index` — Cambio 1.
  - `index.html`: estructura HTML5 semántica con **un único H1** y jerarquía H2 por
    disciplina — Recomendación SEO Top 5 §2 (Headings 22/100) + categoría Headings.
  - `<title>` único de 52 car. con keyword al inicio — Recomendación SEO Top 5 §5.
  - `<meta name="description">` de 157 car. — Recomendación SEO Top 5 §1.
  - Open Graph + Twitter Cards — Recomendación SEO Top 5 §3 (OG 8/100).
  - JSON-LD `Person` (sameAs IG/X/WISe.ART) — Recomendación SEO Top 5 §4 (Schema 5/100).
  - `canonical`, `lang="es"`, viewport, favicon SVG real — Recomendación SEO §Meta y
    §Técnico (favicon.ico devolvía HTML).
  - Footer con **© 2026** (corrige © 2022) — Recomendación Negocio §4.
  - Enlaces sociales con `rel="noopener noreferrer"` — Recomendación SEO §Enlaces.
  - `assets/css/tokens.css`, `base.css`, `layout.css`: sistema de diseño fiel a la marca
    (paleta + Playfair/Cormorant/DM Sans) — Recomendación Negocio §coherencia de marca.
- `feat(conversion): hero con propuesta de valor, CTA principal, barra de reconocimientos y stats` — Cambio 2.
  - Hero reescrito con propuesta de valor + **CTA principal "Ver obra disponible" sobre el
    pliegue** — Recomendación Negocio §6 (hero sin propuesta) y §copy (CTA claro).
  - **Barra de reconocimientos** (Arte Laguna · NASDAQ Times Square · WISe.ART · Jaume
    Graells · Art Madrid) bajo el hero — Recomendación Negocio §3 (premios invisibles).
  - Barra de **stats** (8+ premios · 15+ exposiciones · 10+ países · 3 galerías) — refuerzo
    de autoridad, Recomendación Negocio §3.
  - `assets/css/sections.css`: estilos de hero/reconocimientos/stats con animación de
    entrada respetando `prefers-reduced-motion`.

---

### Plantilla de entrada

```
- tipo(scope): descripción — Recomendación <fuente> §<n> → commit <hash>
```

Donde `<fuente>` es `SEO` o `Negocio`, y `<n>` el número/sección de la recomendación.
