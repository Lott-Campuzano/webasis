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
const SETTINGS_KEY = 'webasis:settings:v2';
const FONTS = {
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  serif: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
  mono: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
};
const SETTINGS_DEFAULTS = { theme: 'auto', accent: '#ff5300', font: 'sans', radius: 12, size: 16 };
const THEME_ORDER = ['auto', 'dark', 'light'];
const THEME_LABEL = { auto: 'AUTO', dark: 'DARK', light: 'LIGHT' };
const THEME_DOT = { auto: 'dot-green', dark: 'dot-white', light: 'dot-orange' };
let settings = { ...SETTINGS_DEFAULTS };

function loadSettings() {
  settings = { ...SETTINGS_DEFAULTS, ...(loadJson(SETTINGS_KEY) || {}) };
}

function persistSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* sin almacenamiento */ }
}

const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function effTheme() {
  if (settings.theme === 'auto') return systemDark.matches ? 'dark' : 'light';
  return settings.theme;
}

function applySettings() {
  const root = document.documentElement;
  root.dataset.theme = effTheme();
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

  const dot = $('#theme-dot');
  const label = $('#theme-label');
  if (dot) {
    dot.className = 'dot ' + THEME_DOT[settings.theme];
  }
  if (label) label.textContent = THEME_LABEL[settings.theme];
}

function openSettings() { $('#settings').classList.add('open'); $('#overlay').hidden = false; }
function closeSettings() { $('#settings').classList.remove('open'); $('#overlay').hidden = true; }

function bindSettings() {
  $('#open-settings').addEventListener('click', openSettings);
  $('#settings-close').addEventListener('click', closeSettings);
  $('#overlay').addEventListener('click', closeSettings);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSettings(); });

  $('#theme-cycle').addEventListener('click', () => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(settings.theme) + 1) % THEME_ORDER.length];
    settings.theme = next; persistSettings(); applySettings();
    toast('apariencia: ' + THEME_LABEL[next] + ' //');
  });
  systemDark.addEventListener('change', () => {
    if (settings.theme === 'auto') applySettings();
  });
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
  a{color:#d64a00}
  label{display:block;margin-bottom:6px;font-weight:600}
  input{padding:8px 10px;border:1px solid #ddd;border-radius:8px;font:inherit}
  button{padding:8px 14px;border:0;border-radius:8px;background:#ff5300;color:#121212;font:inherit;cursor:pointer}
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

/* ═══════════════ Aparición al hacer scroll ═══════════════ */
function bindReveal() {
  if (!('IntersectionObserver' in window)) return;
  const targets = $$('.section-head, .playground, .docs .doc');
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    if (el.matches('.docs .doc')) el.style.transitionDelay = ((i % 4) * 60) + 'ms';
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach((el) => io.observe(el));
}

/* ═══════════════ Inicio ═══════════════ */
function init() {
  assembleHeadline();
  loadSettings();
  applySettings();
  bindSettings();
  bindReveal();

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


