'use strict';

/* ═══════════════ Utilidades ═══════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const debounce = (fn, ms = 300) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 2200);
}

function loadJson(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

/* ═══════════════ Personalización ═══════════════ */
const SETTINGS_KEY = 'webasis:settings:v1';
const FONTS = {
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  serif: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
  mono: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
};
const SETTINGS_DEFAULTS = { theme: 'light', accent: '#ff8000', font: 'sans', radius: 12, size: 16 };
let settings = { ...SETTINGS_DEFAULTS };

function loadSettings() {
  settings = { ...SETTINGS_DEFAULTS, ...(loadJson(SETTINGS_KEY) || {}) };
}

function persistSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* sin almacenamiento */ }
}

function applySettings() {
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  root.style.setProperty('--accent', settings.accent);
  root.style.setProperty('--radius', settings.radius + 'px');
  root.style.setProperty('--size', settings.size + 'px');
  root.style.setProperty('--font', FONTS[settings.font] || FONTS.sans);

  $$('#swatches .swatch[data-accent]').forEach((b) =>
    b.classList.toggle('active', b.dataset.accent.toLowerCase() === String(settings.accent).toLowerCase()));
  const accentInput = $('#accent-input');
  if (accentInput) accentInput.value = settings.accent;
  const fontSel = $('#font-select');
  if (fontSel) fontSel.value = settings.font;
  const rad = $('#radius-range');
  if (rad) { rad.value = settings.radius; $('#radius-out').textContent = settings.radius + 'px'; }
  const siz = $('#size-range');
  if (siz) { siz.value = settings.size; $('#size-out').textContent = settings.size + 'px'; }
  $$('#theme-seg button').forEach((b) =>
    b.classList.toggle('active', b.dataset.themeOpt === settings.theme));
}

function openSettings() { $('#settings').classList.add('open'); $('#overlay').hidden = false; }
function closeSettings() { $('#settings').classList.remove('open'); $('#overlay').hidden = true; }

function bindSettings() {
  $('#open-settings').addEventListener('click', openSettings);
  $('#settings-close').addEventListener('click', closeSettings);
  $('#overlay').addEventListener('click', closeSettings);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSettings(); });

  $$('#theme-seg button').forEach((b) => b.addEventListener('click', () => {
    settings.theme = b.dataset.themeOpt; persistSettings(); applySettings();
  }));
  $$('#swatches .swatch[data-accent]').forEach((b) => b.addEventListener('click', () => {
    settings.accent = b.dataset.accent; persistSettings(); applySettings();
  }));
  $('#accent-input').addEventListener('input', (e) => {
    settings.accent = e.target.value; persistSettings(); applySettings();
  });
  $('#font-select').addEventListener('change', (e) => {
    settings.font = e.target.value; persistSettings(); applySettings();
  });
  $('#radius-range').addEventListener('input', (e) => {
    settings.radius = +e.target.value; persistSettings(); applySettings();
  });
  $('#size-range').addEventListener('input', (e) => {
    settings.size = +e.target.value; persistSettings(); applySettings();
  });
  $('#settings-reset').addEventListener('click', () => {
    settings = { ...SETTINGS_DEFAULTS }; persistSettings(); applySettings();
    toast('weBasis restablecido //');
  });
}

/* ═══════════════ Audio (síntesis del navegador) ═══════════════ */
const synth = window.speechSynthesis || null;

function pickVoice() {
  if (!synth) return null;
  return synth.getVoices().find((v) => (v.lang || '').toLowerCase().startsWith('es')) || null;
}

function setSpeakingUI(on) { const b = $('#stop-audio'); if (b) b.hidden = !on; }

function speak(text) {
  if (!synth) { toast('Tu navegador no soporta audio de síntesis 😅'); return; }
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice();
  if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'es-ES'; }
  u.rate = 1.04; u.pitch = 1;
  u.onend = () => setSpeakingUI(false);
  u.onerror = () => setSpeakingUI(false);
  synth.speak(u);
  setSpeakingUI(true);
}

function bindAudio() {
  $('#stop-audio').addEventListener('click', () => { if (synth) synth.cancel(); });
  $$('[data-say]').forEach((b) => b.addEventListener('click', () => speak(b.dataset.say)));
  document.addEventListener('visibilitychange', () => { if (document.hidden && synth) synth.cancel(); });
}

/* ═══════════════ Tarjetas de propiedades ═══════════════ */
const HTML_CARDS = [
  { t: 'div · la caja', d: 'Un contenedor invisible. Agrupa contenido: cajas dentro de cajas, como capas de Photoshop.', ex: '<div class="tarjeta">\n  <h2>Hola</h2>\n  <p>Soy una tarjeta</p>\n</div>' },
  { t: 'h1–h6 · títulos', d: 'Marcan la jerarquía del contenido, como un índice. Usa un solo h1 por página y baja de nivel en orden.', ex: '<h1>Título principal</h1>\n<h2>Subtítulo</h2>\n<h3>Detalle</h3>' },
  { t: 'p · párrafo', d: 'Un bloque de texto. El navegador le da espacio antes y después automáticamente.', ex: '<p>Escribir en la web es así de simple.</p>' },
  { t: 'a · enlace', d: 'El alma de la web: conecta páginas. href es el destino; el texto describe a dónde se llega.', ex: '<a href="https://developer.mozilla.org" target="_blank" rel="noopener">Visitar MDN</a>' },
  { t: 'img · imagen', d: 'Muestra una imagen. src es la ruta; alt, la descripción para quienes no pueden verla.', ex: '<img src="foto.jpg" alt="Un gato dormido sobre un teclado">' },
  { t: 'button · botón', d: 'Un botón pide una acción: enviar, abrir, borrar. Por sí solo no hace nada; JavaScript lo activa.', ex: '<button type="button">Cópiame</button>' },
  { t: 'ul y li · listas', d: 'Las listas agrupan elementos relacionados: pasos, características, enlaces de un menú.', ex: '<ul>\n  <li>Investigar</li>\n  <li>Diseñar</li>\n  <li>Programar</li>\n</ul>' },
  { t: 'input · campos', d: 'Los formularios recogen datos del usuario. El atributo type cambia su comportamiento: texto, email, color, fecha…', ex: '<label for="correo">Tu correo</label>\n<input id="correo" type="email" placeholder="hola@correo.com">' },
];

const CSS_CARDS = [
  { t: 'color', d: 'El color del texto. Acepta nombres (tomato), hex (#ff5c8a) o rgb(). El contraste con el fondo es clave para leer bien.', ex: 'p {\n  color: #ff5c8a;\n}' },
  { t: 'background', d: 'El fondo de un elemento: color sólido, degradado o imagen. Es el lienzo sobre el que diseñas.', ex: 'button {\n  background: linear-gradient(135deg, #ff8000, #ffb703);\n}' },
  { t: 'font-family y font-size', d: 'La tipografía: familia y tamaño. Ojo: botones e inputs no heredan la fuente del body.', ex: 'body {\n  font-family: system-ui, sans-serif;\n  font-size: 16px;\n}' },
  { t: 'padding vs margin', d: 'padding es el aire dentro de la caja; margin, el aire fuera, entre cajas.', ex: '.tarjeta {\n  padding: 24px;   /* dentro */\n  margin: 32px 0;  /* fuera */\n}' },
  { t: 'border-radius', d: 'Redondea las esquinas. Con un valor muy grande (999px) conviertes un rectángulo en una píldora.', ex: 'button {\n  border-radius: 999px;\n}' },
  { t: 'box-shadow', d: 'Sombra con desplazamiento X e Y, desenfoque y color. Usada con suavidad hace que un elemento parezca flotar.', ex: '.tarjeta {\n  box-shadow: 0 10px 30px rgba(0, 0, 0, .12);\n}' },
  { t: 'display: flex', d: 'Un contenedor flexible: sus hijos en fila o columna, alineados con justify-content y align-items.', ex: '.menu {\n  display: flex;\n  gap: 16px;\n  align-items: center;\n}' },
  { t: 'display: grid', d: 'Layout en dos dimensiones: define columnas y filas de una vez. Ideal para galerías y mosaicos.', ex: '.galeria {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 12px;\n}' },
  { t: 'transition', d: 'Anima con suavidad los cambios de estado (por ejemplo, un hover). Sin transition, todo cambia de golpe.', ex: 'button {\n  transition: transform .3s ease, box-shadow .3s ease;\n}' },
  { t: ':hover', d: 'Una pseudo-clase: se activa cuando el cursor está encima. El feedback favorito de todo diseñador.', ex: 'button:hover {\n  transform: translateY(-3px);\n}' },
];

const JS_CARDS = [
  { t: 'let y const · variables', d: 'Cajas con nombre para guardar valores. const no cambia; let sí.', ex: "const nombre = 'Ada';\nlet visitas = 0;\nvisitas = visitas + 1;" },
  { t: 'tipos de datos', d: 'Texto (string), números (number), verdadero/falso (boolean), listas (array) y más. typeof te dice qué es cada cosa.', ex: "console.log(typeof 'hola'); // string\nconsole.log(typeof 42);     // number" },
  { t: 'funciones', d: 'Recetas reutilizables: reciben datos (parámetros) y devuelven un resultado. Escribe una vez, usa mil veces.', ex: "function saludo(quien) {\n  return 'Hola, ' + quien;\n}\nconsole.log(saludo('Ada'));" },
  { t: 'if / else · decisiones', d: 'El código toma caminos distintos según una condición. Para comparar usa === y evita sorpresas.', ex: "if (modo === 'oscuro') {\n  console.log('Modo oscuro');\n} else {\n  console.log('Modo claro');\n}" },
  { t: 'for · bucles', d: 'Repite acciones por cada elemento de una lista. Ideal para pintar 30 tarjetas sin escribirlas 30 veces.', ex: "const colores = ['violeta', 'rosa'];\nfor (const c of colores) {\n  console.log(c);\n}" },
  { t: 'arrays · listas', d: 'Colecciones ordenadas de valores. push añade, length cuenta y con map transformas cada elemento.', ex: "const ideas = ['moodboard', 'wireframe'];\nideas.push('prototipo');\nconsole.log(ideas.length); // 3" },
  { t: 'objetos · fichas', d: 'Agrupan datos relacionados bajo un mismo nombre, como una ficha de usuario con sus propiedades.', ex: "const user = { nombre: 'Ada', rol: 'diseñadora' };\nconsole.log(user.nombre);" },
  { t: 'querySelector · el DOM', d: 'El DOM es tu HTML visto por JavaScript. querySelector encuentra un elemento para leerlo o cambiarlo.', ex: "const titulo = document.querySelector('h1');\ntitulo.textContent = 'Nuevo título';" },
  { t: 'addEventListener · eventos', d: 'El puente entre diseño e interacción: escucha clics, teclas, scroll… y responde con una función.', ex: "boton.addEventListener('click', () => {\n  console.log('¡Click!');\n});" },
];

function cardEl(card) {
  const art = document.createElement('article');
  art.className = 'card';

  const head = document.createElement('header');
  head.className = 'card-head';
  const h4 = document.createElement('h4');
  h4.textContent = card.t;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'listen';
  btn.title = 'Escuchar explicación';
  btn.setAttribute('aria-label', 'Escuchar: ' + card.t);
  btn.textContent = '🔊';
  btn.addEventListener('click', () => speak(card.t + '. ' + card.d));
  head.append(h4, btn);

  const p = document.createElement('p');
  p.textContent = card.d;

  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.textContent = card.ex;
  pre.append(code);

  art.append(head, p, pre);
  return art;
}

function renderCards(sel, items) {
  const box = $(sel);
  items.forEach((c) => box.appendChild(cardEl(c)));
}

/* ═══════════════ Lecciones ═══════════════ */
const HTML_LESSONS = [
  { name: '1 · primer texto', code: '<h1>Hola, mundo 👋</h1>\n<p>Este es mi primer párrafo escrito en HTML. Cambia el texto y mira la vista previa.</p>' },
  { name: '2 · jerarquía', code: '<h1>Mi portafolio</h1>\n<h2>Proyectos</h2>\n<p>Una breve descripción de lo que hago.</p>\n<h3>Proyecto destacado</h3>\n<p>Detalle del proyecto.</p>' },
  { name: '3 · enlaces e imágenes', code: '<p>Enlace a <a href="https://developer.mozilla.org/es/" target="_blank" rel="noopener">MDN</a></p>\n\n<img src="https://picsum.photos/seed/webbasis/420/240" alt="Fotografía aleatoria de muestra" width="420">\n<p>La imagen viene de picsum.photos</p>' },
  { name: '4 · lista', code: '<h2>Mis favoritos</h2>\n<ul>\n  <li>Tipografía</li>\n  <li>Color</li>\n  <li>Movimiento</li>\n</ul>' },
  { name: '5 · formulario', code: '<h2>Newsletter</h2>\n<label for="correo">Tu correo</label>\n<input id="correo" type="email" placeholder="hola@correo.com">\n<button type="button">Suscribirme</button>' },
];

const CSS_DEFAULTS = { color: '#2b2a26', background: '#ffe9d6', size: 18, padding: 24, radius: 16, shadow: 18, center: false, hover: false };
const CSS_LESSONS = [
  { name: '1 · tarjeta clásica', state: { color: '#1f2430', background: '#ffffff', size: 18, padding: 24, radius: 16, shadow: 18, center: false, hover: true } },
  { name: '2 · píldora de color', state: { color: '#ffffff', background: '#ff5c8a', size: 16, padding: 14, radius: 48, shadow: 8, center: true, hover: true } },
  { name: '3 · sombra flotante', state: { color: '#2b2b2b', background: '#fff8d6', size: 20, padding: 28, radius: 8, shadow: 40, center: false, hover: true } },
  { name: '4 · nítida y cuadrada', state: { color: '#18181b', background: '#e4e4e7', size: 14, padding: 16, radius: 0, shadow: 0, center: false, hover: false } },
  { name: '5 · flex centrado', state: { color: '#ffffff', background: '#12b886', size: 16, padding: 20, radius: 20, shadow: 14, center: true, hover: true } },
];

const JS_LESSONS = [
  { name: '1 · hola consola', code: "console.log('¡Hola, mundo! 👋');\nconsole.log('Los diseñadores también pueden programar.');" },
  { name: '2 · variables', code: "const nombre = 'Lott';\nlet visitas = 0;\nvisitas = visitas + 1;\nconsole.log('Hola, ' + nombre);\nconsole.log('Visitas: ' + visitas);" },
  { name: '3 · función', code: "function saludo(quien) {\n  return 'Hola, ' + quien + ' //';\n}\nconsole.log(saludo('diseñadores'));\nconsole.log(saludo('Lott'));" },
  { name: '4 · condicional', code: "const modo = 'oscuro';\nif (modo === 'oscuro') {\n  console.log('🌙 Modo oscuro activado');\n} else {\n  console.log('☀️ Modo claro activado');\n}" },
  { name: '5 · bucle', code: "const colores = ['violeta', 'rosa', 'verde'];\nfor (const color of colores) {\n  console.log('Pintando de ' + color + '…');\n}" },
  { name: '6 · contador de clics', code: "const zona = document.querySelector('#js-sandbox');\nconst boton = document.createElement('button');\nlet clics = 0;\nboton.textContent = 'Haz clic: 0';\nboton.addEventListener('click', function () {\n  clics = clics + 1;\n  boton.textContent = 'Haz clic: ' + clics;\n});\nzona.appendChild(boton);\nconsole.log('Botón creado en la zona de pruebas 👇');" },
  { name: '7 · lista dinámica', code: "const zona = document.querySelector('#js-sandbox');\nconst lista = document.createElement('ul');\nconst ideas = ['Moodboard', 'Wireframe', 'Prototipo'];\nfor (const idea of ideas) {\n  const item = document.createElement('li');\n  item.textContent = idea;\n  lista.appendChild(item);\n}\nzona.appendChild(lista);\nconsole.log('Lista creada con ' + ideas.length + ' ideas');" },
];

function renderLessons(sel, lessons, onPick) {
  const box = $(sel);
  lessons.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = l.name;
    b.addEventListener('click', () => {
      box.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      b.classList.add('active');
      onPick(l);
    });
    box.appendChild(b);
  });
}

function enableTab(el) {
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      el.setRangeText('  ', el.selectionStart, el.selectionEnd, 'end');
    }
  });
}

/* ═══════════════ Playground HTML ═══════════════ */
const htmlEditor = $('#html-editor');
const htmlFrame = $('#html-preview');

function htmlDoc(body) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<style>
  body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#2b2a26;padding:24px;line-height:1.65;margin:0}
  img{max-width:100%;height:auto;border-radius:8px}
  a{color:#e05e00}
  label{display:block;margin-bottom:6px;font-weight:600}
  input{padding:8px 10px;border:1px solid #ddd;border-radius:8px;font:inherit}
  button{padding:8px 14px;border:0;border-radius:8px;background:#ff8000;color:#1d1b17;font:inherit;cursor:pointer}
</style>
</head><body>${body}</body></html>`;
}

function renderHtmlNow() { htmlFrame.srcdoc = htmlDoc(htmlEditor.value); }
const renderHtml = debounce(renderHtmlNow, 350);

const persistHtml = debounce(() => {
  try { localStorage.setItem('webasis:html:v1', htmlEditor.value); } catch { /* ignore */ }
}, 400);
function persistHtmlNow() {
  try { localStorage.setItem('webasis:html:v1', htmlEditor.value); } catch { /* ignore */ }
}

/* ═══════════════ Playground CSS ═══════════════ */
let cssState = { ...CSS_DEFAULTS };

function propList() {
  const s = cssState;
  const p = [];
  p.push('color: ' + s.color);
  p.push('background: ' + s.background);
  p.push('font-size: ' + s.size + 'px');
  p.push('padding: ' + s.padding + 'px');
  p.push('border-radius: ' + s.radius + 'px');
  if (s.center) p.push('display: flex', 'flex-direction: column', 'align-items: center', 'justify-content: center', 'gap: 8px', 'text-align: center');
  if (s.shadow > 0) p.push('box-shadow: 0 ' + Math.round(s.shadow * 0.25) + 'px ' + s.shadow + 'px rgba(0, 0, 0, ' + (s.shadow / 140).toFixed(2) + ')');
  p.push('transition: transform .35s ease, box-shadow .35s ease');
  return p;
}

function cssCodeFull() {
  const base = propList().map((line) => '  ' + line + ';').join('\n');
  let code = '.tarjeta {\n' + base + '\n}';
  if (cssState.hover) {
    code += '\n\n.tarjeta:hover {\n  transform: translateY(-6px) scale(1.02);\n  box-shadow: 0 16px 36px rgba(0, 0, 0, .2);\n}';
  }
  return code;
}

function syncCssControls() {
  const s = cssState;
  $('#css-color').value = s.color; $('#css-color-out').textContent = s.color;
  $('#css-bg').value = s.background; $('#css-bg-out').textContent = s.background;
  $('#css-size').value = s.size; $('#css-size-out').textContent = s.size + 'px';
  $('#css-padding').value = s.padding; $('#css-padding-out').textContent = s.padding + 'px';
  $('#css-radius').value = Math.min(s.radius, 48); $('#css-radius-out').textContent = s.radius + 'px';
  $('#css-shadow').value = s.shadow; $('#css-shadow-out').textContent = s.shadow;
  $('#css-center').checked = s.center;
  $('#css-hover').checked = s.hover;
}

function applyCss() {
  const demo = $('#css-demo');
  demo.style.cssText = propList().join('; ');
  demo.classList.toggle('levitar', !!cssState.hover);
  $('#css-code').textContent = cssCodeFull();
  syncCssControls();
}

function persistCss() {
  try { localStorage.setItem('webasis:css:v1', JSON.stringify(cssState)); } catch { /* ignore */ }
}
const cssChanged = () => { persistCss(); applyCss(); };

function bindCss() {
  $('#css-color').addEventListener('input', (e) => { cssState.color = e.target.value; cssChanged(); });
  $('#css-bg').addEventListener('input', (e) => { cssState.background = e.target.value; cssChanged(); });
  $('#css-size').addEventListener('input', (e) => { cssState.size = +e.target.value; cssChanged(); });
  $('#css-padding').addEventListener('input', (e) => { cssState.padding = +e.target.value; cssChanged(); });
  $('#css-radius').addEventListener('input', (e) => { cssState.radius = +e.target.value; cssChanged(); });
  $('#css-shadow').addEventListener('input', (e) => { cssState.shadow = +e.target.value; cssChanged(); });
  $('#css-center').addEventListener('change', (e) => { cssState.center = e.target.checked; cssChanged(); });
  $('#css-hover').addEventListener('change', (e) => { cssState.hover = e.target.checked; cssChanged(); });
  $('#css-reset').addEventListener('click', () => {
    cssState = { ...CSS_DEFAULTS }; cssChanged(); toast('Estilo restablecido ↺');
  });
}

/* ═══════════════ Playground JavaScript ═══════════════ */
const jsEditor = $('#js-editor');
const jsConsole = $('#js-console');
const sandbox = $('#js-sandbox');

function persistJs() {
  try { localStorage.setItem('webasis:js:v1', jsEditor.value); } catch { /* ignore */ }
}

function fmtVal(v) {
  if (typeof v === 'string') return v;
  if (v instanceof Element) return '<' + v.tagName.toLowerCase() + '>';
  try {
    const s = JSON.stringify(v);
    return s === undefined ? String(v) : s;
  } catch { return String(v); }
}

function runJs() {
  sandbox.innerHTML = '';
  jsConsole.innerHTML = '';
  const line = (kind, args) => {
    const el = document.createElement('div');
    el.className = 'line ' + kind;
    el.textContent = args.map(fmtVal).join(' ');
    jsConsole.appendChild(el);
  };
  const fakeConsole = {
    log: (...a) => line('log', a),
    info: (...a) => line('log', a),
    warn: (...a) => line('warn', a),
    error: (...a) => line('error', a),
  };
  try {
    const fn = new Function('console', '"use strict";\n' + jsEditor.value);
    fn(fakeConsole);
  } catch (err) {
    const name = err && err.name ? err.name : 'Error';
    const msg = err && err.message ? err.message : String(err);
    line('error', [name + ': ' + msg]);
  }
  jsConsole.scrollTop = jsConsole.scrollHeight;
}

function bindJs() {
  $('#js-run').addEventListener('click', runJs);
  $('#js-clear').addEventListener('click', () => { jsConsole.innerHTML = ''; });
  jsEditor.addEventListener('input', persistJs);
  jsEditor.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); runJs(); }
  });
}

/* ═══════════════ Copiar ═══════════════ */
function bindCopy() {
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    const what = b.dataset.copy;
    let text = '';
    if (what === 'html') text = htmlEditor.value;
    if (what === 'css') text = $('#css-code').textContent;
    if (what === 'js') text = jsEditor.value;
    try {
      await navigator.clipboard.writeText(text);
      toast('Copiado al portapapeles ⧉');
    } catch {
      toast('No pude copiar 🙈');
    }
  }));
}

/* ═══════════════ Navegación activa ═══════════════ */
function bindNav() {
  const links = $$('.nav a[data-section]');
  const map = {};
  links.forEach((l) => { map[l.dataset.section] = l; });
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        links.forEach((l) => l.classList.remove('active'));
        const l = map[en.target.id];
        if (l) l.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  ['html', 'css', 'js', 'docs'].forEach((id) => {
    const s = document.getElementById(id);
    if (s) obs.observe(s);
  });
}

/* ═══════════════ Titular que se ensambla ═══════════════ */
function assembleHeadline() {
  const h1 = $('.hero h1');
  if (!h1) return;

  const out = [];
  Array.from(h1.childNodes).forEach((node) => {
    const isEm = node.nodeType === 1;
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { out.push(document.createTextNode(' ')); return; }
      let word;
      if (isEm) {
        const em = document.createElement('em');
        word = document.createElement('span');
        word.className = 'hero-word';
        word.textContent = part;
        em.appendChild(word);
        out.push(em);
      } else {
        word = document.createElement('span');
        word.className = 'hero-word';
        word.textContent = part;
        out.push(word);
      }
    });
  });
  h1.replaceChildren(...out);

  let i = 0;
  out.forEach((n) => {
    if (!(n.nodeType === 1 && n.classList.contains('hero-word'))) return;
    const big = !!n.closest('em');
    const spread = big ? 3 : 1;
    n.style.setProperty('--sx', Math.round((Math.random() * 2 - 1) * 70 * spread) + 'px');
    n.style.setProperty('--sy', Math.round((Math.random() * 2 - 1) * 60 * spread) + 'px');
    n.style.setProperty('--sr', Math.round((Math.random() * 2 - 1) * 16 * spread) + 'deg');
    n.style.animationDelay = (i * 70) + 'ms';
    i++;
  });
}

/* ═══════════════ Inicio ═══════════════ */
function init() {
  assembleHeadline();
  loadSettings();
  applySettings();
  bindSettings();
  bindAudio();

  renderCards('#cards-html', HTML_CARDS);
  renderCards('#cards-css', CSS_CARDS);
  renderCards('#cards-js', JS_CARDS);

  // HTML
  renderLessons('#html-lessons', HTML_LESSONS, (l) => {
    htmlEditor.value = l.code; persistHtmlNow(); renderHtmlNow();
  });
  htmlEditor.value = localStorage.getItem('webasis:html:v1') || HTML_LESSONS[0].code;
  htmlEditor.addEventListener('input', () => { persistHtml(); renderHtml(); });
  enableTab(htmlEditor);
  renderHtmlNow();

  // CSS
  cssState = { ...CSS_DEFAULTS, ...(loadJson('webasis:css:v1') || {}) };
  renderLessons('#css-lessons', CSS_LESSONS, (l) => { cssState = { ...l.state }; cssChanged(); });
  bindCss();
  applyCss();

  // JS
  renderLessons('#js-lessons', JS_LESSONS, (l) => { jsEditor.value = l.code; persistJs(); });
  jsEditor.value = localStorage.getItem('webasis:js:v1') || JS_LESSONS[0].code;
  enableTab(jsEditor);
  bindJs();
  const welcome = document.createElement('div');
  welcome.className = 'line log';
  welcome.textContent = '← Escribe código y pulsa ▶ Ejecutar. Prueba una lección arriba //';
  jsConsole.appendChild(welcome);

  bindCopy();
  bindNav();
}

init();


