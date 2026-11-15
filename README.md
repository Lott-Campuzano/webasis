# weBasis · `>_`

Un laboratorio web minimalista y altamente personalizable para que **diseñadores**
se introduzcan al desarrollo web experimentando con **HTML, CSS y JavaScript**.

## Cómo abrirlo

No necesita instalación ni servidor: abre `index.html` en cualquier navegador
(doble clic) y listo.

## Qué incluye

| Sección | Qué hace |
|---|---|
| **01 · HTML** | Editor con vista previa en vivo y 5 mini-lecciones. |
| **02 · CSS** | Controles visuales que generan el código CSS en tiempo real. |
| **03 · JavaScript** | Editor con consola, zona de pruebas DOM y ⌘/Ctrl + Enter. |
| **Tarjetas** | 27 tarjetas con explicación escrita y 🔊 audio en español. |
| **04 · Aprender** | Lista curada de documentación: MDN, javascript.info, Flexbox Froggy… |

## Diseño

Estética **Teenage Engineering** — primo hermano de [OC-1 STUDIO](https://github.com/Lott-Campuzano/oc1-studio) —
manteniendo el espíritu editorial de revista:

- **Tipografía**: JetBrains Mono para titulares, etiquetas y texto resaltado; Helvetica para el resto.
- **Los acentos del OP-1**: naranja `#ff5300`, azul `#00a8ff`, amarillo `#ffd400` para JavaScript y blanco `#f0f0f0`, sobre blanco hueso y tinta grafito. Puntos de color como marcadores y teclas `html/css/js/docs` estilo OP-1 en la portada.
- **Temas AUTO → DARK → LIGHT**: en `AUTO` la página sigue `prefers-color-scheme` y reacciona en vivo cuando cambias la apariencia de tu sistema (botón en la esquina, persistente).
- **Aparición al hacer scroll** con `IntersectionObserver`; respeta `prefers-reduced-motion`.
- **Personalización**: tema, acento, tipografía, esquinas y tamaño base; todo se guarda en `localStorage`.
- Cero dependencias, cero build: ábrelo y funciona.

Los editores y el estilo del playground también se autoguardan.

## Estructura

```
index.html   → estructura de la página
styles.css   → estilos (variables CSS)
app.js       → playgrounds, tarjetas, audio y personalización
```

Sin dependencias ni frameworks. Las fuentes de titulares cargan desde Google Fonts (con fallback monoespaciada si no hay red).

---

Hecho con amor por **Lott Campuzano** y **OpenCode** ♥
