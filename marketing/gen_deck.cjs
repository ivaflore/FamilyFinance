const pptxgen = require('pptxgenjs');
const path = require('path');

const ICON = (name, tone = 'white') => path.join(__dirname, 'icons', `${name}-${tone}.png`);
const SHOT = (name) =>
  path.join('/tmp/claude-0/-home-user-FamilyFinance/8f348b48-48f6-5ba9-b7e2-31b7059ecb53/scratchpad', `${name}.png`);

const C = {
  teal: '1D9E75',
  tealDark: '085041',
  tealMid: '0F6E56',
  tealLight: 'E1F5EE',
  amber: 'BA7517',
  amberLight: 'FAEEDA',
  coral: 'D85A30',
  coralLight: 'FAECE7',
  cream: 'F7F6F2',
  white: 'FFFFFF',
  text: '1A1916',
  text2: '5C5A54',
  text3: '9B9890',
  border: 'E8E6DF',
};

const FONT_HEAD = 'Cambria';
const FONT_BODY = 'Calibri';

function iconCircle(slide, { x, y, d = 0.62, bg, icon, iconD = 0.32 }) {
  slide.addShape('ellipse', { x, y, w: d, h: d, fill: { color: bg }, line: { type: 'none' } });
  slide.addImage({ path: icon, x: x + (d - iconD) / 2, y: y + (d - iconD) / 2, w: iconD, h: iconD });
}

async function build() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE'; // 13.3 x 7.5
  pres.defineLayout({ name: 'FF', width: 13.333, height: 7.5 });
  pres.layout = 'FF';

  // ── Slide 1: Portada ──────────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.tealDark };
    iconCircle(s, { x: 5.87, y: 1.15, d: 1.6, bg: C.teal, icon: ICON('users'), iconD: 0.85 });
    s.addText('FamilyFinance', {
      x: 0, y: 3.0, w: 13.333, h: 1.2, align: 'center', fontFace: FONT_HEAD, fontSize: 54, bold: true,
      color: C.white, isTextBox: true, margin: 0,
    });
    s.addText('Las finanzas de tu familia, compartidas y al día — en un solo lugar', {
      x: 1.5, y: 4.15, w: 10.333, h: 0.7, align: 'center', fontFace: FONT_BODY, fontSize: 18, italic: true,
      color: C.tealLight, isTextBox: true, margin: 0,
    });
    s.addText('Gestión financiera familiar', {
      x: 0, y: 6.6, w: 13.333, h: 0.4, align: 'center', fontFace: FONT_BODY, fontSize: 12, color: C.teal,
      charSpacing: 3, isTextBox: true, margin: 0,
    });
    s.addNotes('Portada. FamilyFinance: la app para llevar las finanzas de la familia entre todos.');
  }

  // ── Slide 2: El problema ─────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    s.addText('El problema', {
      x: 0.7, y: 0.55, w: 8, h: 0.7, fontFace: FONT_HEAD, fontSize: 34, bold: true, color: C.text, isTextBox: true, margin: 0,
    });
    s.addText('Hoy, organizar las finanzas del hogar significa hacer malabares entre apps, chats y memoria', {
      x: 0.7, y: 1.28, w: 11.5, h: 0.5, fontFace: FONT_BODY, fontSize: 15, color: C.text2, isTextBox: true, margin: 0,
    });

    const items = [
      { icon: 'card', title: 'Gastos por separado', text: 'Cada uno anota (o no anota) sus gastos en su propio celular, sin una visión conjunta.', bg: C.coral },
      { icon: 'cart', title: 'Compras duplicadas', text: 'Sin una lista compartida, es fácil comprar dos veces lo mismo — o quedarse sin nada.', bg: C.amber },
      { icon: 'pie', title: 'Presupuesto a ciegas', text: 'Nadie sabe con certeza cuánto se ha gastado del presupuesto del mes hasta que ya es tarde.', bg: C.tealMid },
    ];
    items.forEach((it, i) => {
      const x = 0.7 + i * 4.05;
      s.addShape('roundRect', {
        x, y: 2.35, w: 3.7, h: 3.6, rectRadius: 0.12, fill: { color: C.cream }, line: { color: C.border, width: 1 },
      });
      iconCircle(s, { x: x + 0.35, y: 2.75, d: 0.78, bg: it.bg, icon: ICON(it.icon), iconD: 0.4 });
      s.addText(it.title, {
        x: x + 0.35, y: 3.75, w: 3.0, h: 0.5, fontFace: FONT_HEAD, fontSize: 17, bold: true, color: C.text, isTextBox: true, margin: 0,
      });
      s.addText(it.text, {
        x: x + 0.35, y: 4.28, w: 3.0, h: 1.5, fontFace: FONT_BODY, fontSize: 12.5, color: C.text2, isTextBox: true, margin: 0, lineSpacingMultiple: 1.25,
      });
    });
    s.addNotes('El problema: gastos separados, compras duplicadas, presupuesto a ciegas.');
  }

  // ── Slide 3: La solución ─────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.tealLight };
    s.addText('La solución', {
      x: 0.9, y: 0.9, w: 6.2, h: 0.7, fontFace: FONT_HEAD, fontSize: 34, bold: true, color: C.tealDark, isTextBox: true, margin: 0,
    });
    s.addText(
      'FamilyFinance es el lugar único donde tu familia registra, comparte y controla sus finanzas — juntos, en tiempo real.',
      { x: 0.9, y: 1.75, w: 6.0, h: 2.0, fontFace: FONT_BODY, fontSize: 17, color: C.text, isTextBox: true, margin: 0, lineSpacingMultiple: 1.35 },
    );
    const bullets = [
      'Cada familia crea su propio grupo privado',
      'Todos ven y registran los mismos datos, al instante',
      'Se usa desde el celular, en el momento que ocurre el gasto',
    ];
    let by = 3.9;
    bullets.forEach((b) => {
      s.addShape('ellipse', { x: 0.9, y: by + 0.06, w: 0.14, h: 0.14, fill: { color: C.teal }, line: { type: 'none' } });
      s.addText(b, { x: 1.25, y: by - 0.12, w: 5.7, h: 0.5, fontFace: FONT_BODY, fontSize: 14.5, color: C.text2, isTextBox: true, margin: 0 });
      by += 0.62;
    });

    s.addShape('roundRect', { x: 7.6, y: 1.0, w: 5.0, h: 5.5, rectRadius: 0.18, fill: { color: C.white }, line: { type: 'none' }, shadow: { type: 'outer', color: '000000', opacity: 0.18, blur: 12, offset: 4, angle: 90 } });
    iconCircle(s, { x: 9.35, y: 1.55, d: 1.5, bg: C.teal, icon: ICON('users'), iconD: 0.8 });
    s.addText('1 grupo', { x: 7.8, y: 3.35, w: 4.6, h: 0.5, align: 'center', fontFace: FONT_HEAD, fontSize: 22, bold: true, color: C.text, isTextBox: true, margin: 0 });
    s.addText('= toda tu familia viendo lo mismo', { x: 7.8, y: 3.9, w: 4.6, h: 0.4, align: 'center', fontFace: FONT_BODY, fontSize: 13, color: C.text2, isTextBox: true, margin: 0 });
    s.addShape('line', { x: 8.1, y: 4.55, w: 4.0, h: 0, line: { color: C.border, width: 1 } });
    [['Administrador', 'crea el grupo, invita y administra'], ['Miembros', 'registran y consultan los datos del día a día']].forEach((row, i) => {
      const yy = 4.85 + i * 0.85;
      s.addText(row[0], { x: 7.9, y: yy, w: 4.4, h: 0.35, fontFace: FONT_BODY, bold: true, fontSize: 13, color: C.tealDark, isTextBox: true, margin: 0 });
      s.addText(row[1], { x: 7.9, y: yy + 0.34, w: 4.4, h: 0.5, fontFace: FONT_BODY, fontSize: 11.5, color: C.text2, isTextBox: true, margin: 0 });
    });
    s.addNotes('La solución: un grupo familiar privado y compartido.');
  }

  // ── Slide 4: Cómo funciona ────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    s.addText('Cómo funciona', {
      x: 0.7, y: 0.55, w: 8, h: 0.7, fontFace: FONT_HEAD, fontSize: 34, bold: true, color: C.text, isTextBox: true, margin: 0,
    });
    s.addText('Tres pasos y tu familia ya está organizada', {
      x: 0.7, y: 1.28, w: 10, h: 0.5, fontFace: FONT_BODY, fontSize: 15, color: C.text2, isTextBox: true, margin: 0,
    });

    const steps = [
      { n: '1', icon: 'login', title: 'Inicia sesión con Google', text: 'Sin crear ni recordar otra contraseña más.' },
      { n: '2', icon: 'users', title: 'Crea tu grupo familiar', text: 'E invita a los demás con un link.' },
      { n: '3', icon: 'phone', title: 'Úsala en el día a día', text: 'Gastos, alacena, compras y menú, compartidos.' },
    ];
    steps.forEach((st, i) => {
      const x = 0.9 + i * 4.0;
      if (i < 2) {
        s.addShape('rect', { x: x + 3.05, y: 3.05, w: 0.85, h: 0.03, fill: { color: C.border }, line: { type: 'none' } });
      }
      iconCircle(s, { x: x + 0.85, y: 2.35, d: 1.4, bg: C.teal, icon: ICON(st.icon), iconD: 0.7 });
      s.addShape('ellipse', { x: x + 1.85, y: 2.35, w: 0.4, h: 0.4, fill: { color: C.amber }, line: { color: C.white, width: 2 } });
      s.addText(st.n, { x: x + 1.85, y: 2.35, w: 0.4, h: 0.4, align: 'center', valign: 'middle', fontFace: FONT_BODY, bold: true, fontSize: 13, color: C.white, isTextBox: true, margin: 0 });
      s.addText(st.title, { x, y: 4.0, w: 3.4, h: 0.65, align: 'center', fontFace: FONT_HEAD, fontSize: 16, bold: true, color: C.text, isTextBox: true, margin: 0 });
      s.addText(st.text, { x, y: 4.6, w: 3.4, h: 0.7, align: 'center', fontFace: FONT_BODY, fontSize: 12.5, color: C.text2, isTextBox: true, margin: 0 });
    });
    s.addNotes('Tres pasos: login con Google, crear grupo, usar la app.');
  }

  // ── Slide 5: Funcionalidades (grid) ───────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };
    s.addText('Todo lo que tu familia necesita', {
      x: 0.7, y: 0.5, w: 11, h: 0.7, fontFace: FONT_HEAD, fontSize: 32, bold: true, color: C.text, isTextBox: true, margin: 0,
    });
    const feats = [
      { icon: 'card', title: 'Gastos y presupuesto', text: 'Registra gastos y sigue el presupuesto por categoría, al instante.', bg: C.teal },
      { icon: 'package', title: 'Alacena compartida', text: 'Todos ven qué hay en casa y qué está por acabarse.', bg: C.amber },
      { icon: 'cart', title: 'Lista de compras', text: 'Se arma sola desde el menú de la semana. Nadie compra dos veces lo mismo.', bg: C.coral },
      { icon: 'book', title: 'Recetario y menú', text: 'Planifica las comidas del mes con las recetas de tu familia.', bg: C.tealMid },
      { icon: 'layers', title: 'Oportunidades de ahorro', text: 'Detecta qué productos son prescindibles y cuánto podrías ahorrar.', bg: C.amber },
      { icon: 'zap', title: 'Asistente familiar', text: 'Responde preguntas usando los datos reales de tu familia.', bg: C.coral },
    ];
    const cols = 3;
    const cw = 3.95, ch = 2.55, gx = 0.15, gy = 0.2;
    feats.forEach((f, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = 0.7 + col * (cw + gx);
      const y = 1.5 + row * (ch + gy);
      s.addShape('roundRect', { x, y, w: cw, h: ch, rectRadius: 0.1, fill: { color: C.white }, line: { type: 'none' }, shadow: { type: 'outer', color: '000000', opacity: 0.1, blur: 6, offset: 2, angle: 90 } });
      iconCircle(s, { x: x + 0.28, y: y + 0.28, d: 0.62, bg: f.bg, icon: ICON(f.icon), iconD: 0.32 });
      s.addText(f.title, { x: x + 0.28, y: y + 1.02, w: cw - 0.56, h: 0.4, fontFace: FONT_HEAD, fontSize: 14.5, bold: true, color: C.text, isTextBox: true, margin: 0 });
      s.addText(f.text, { x: x + 0.28, y: y + 1.42, w: cw - 0.56, h: 1.0, fontFace: FONT_BODY, fontSize: 11, color: C.text2, isTextBox: true, margin: 0, lineSpacingMultiple: 1.2 });
    });
    s.addNotes('Grid de funcionalidades clave.');
  }

  // ── Slide 6: Screenshot — todo compartido ─────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    s.addText('Todo se actualiza para toda la familia', {
      x: 0.7, y: 0.7, w: 5.6, h: 1.3, fontFace: FONT_HEAD, fontSize: 28, bold: true, color: C.text, isTextBox: true, margin: 0, lineSpacingMultiple: 1.1,
    });
    s.addText(
      'Cuando alguien registra un gasto o marca algo en la lista de compras, todos los miembros del grupo lo ven al instante — sin mensajes de WhatsApp para avisar.',
      { x: 0.7, y: 2.1, w: 5.4, h: 1.8, fontFace: FONT_BODY, fontSize: 14.5, color: C.text2, isTextBox: true, margin: 0, lineSpacingMultiple: 1.35 },
    );
    [['Gasto del mes en tiempo real', 'card'], ['Presupuesto disponible al día', 'pie'], ['Aporte de cada miembro visible', 'users']].forEach((row, i) => {
      const y = 4.2 + i * 0.62;
      iconCircle(s, { x: 0.7, y, d: 0.44, bg: C.tealLight, icon: ICON(row[1], 'teal'), iconD: 0.24 });
      s.addText(row[0], { x: 1.3, y: y + 0.02, w: 4.6, h: 0.4, fontFace: FONT_BODY, fontSize: 12.5, color: C.text, isTextBox: true, margin: 0, valign: 'middle' });
    });

    s.addShape('roundRect', { x: 6.85, y: 0.75, w: 5.9, h: 6.0, rectRadius: 0.1, fill: { color: C.cream }, line: { color: C.border, width: 1 } });
    s.addImage({ path: SHOT('dashboard'), x: 7.05, y: 2.15, sizing: { type: 'contain', w: 5.6, h: 3.15 } });
    s.addNotes('Captura real del dashboard de la app.');
  }

  // ── Slide 7: Mobile-first (screenshot) ────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.tealDark };
    s.addText('Pensada para el celular, desde el día uno', {
      x: 0.7, y: 0.75, w: 6.0, h: 1.5, fontFace: FONT_HEAD, fontSize: 28, bold: true, color: C.white, isTextBox: true, margin: 0, lineSpacingMultiple: 1.1,
    });
    s.addText(
      'FamilyFinance está diseñada mobile-first: se usa cómodamente desde el navegador del celular, en el momento exacto en que ocurre el gasto — en el supermercado, en la feria, donde sea.',
      { x: 0.7, y: 2.3, w: 5.6, h: 2.0, fontFace: FONT_BODY, fontSize: 14.5, color: C.tealLight, isTextBox: true, margin: 0, lineSpacingMultiple: 1.35 },
    );
    iconCircle(s, { x: 0.7, y: 4.6, d: 0.6, bg: C.teal, icon: ICON('phone'), iconD: 0.32 });
    s.addText('Sin descargar nada — funciona desde el navegador', { x: 1.45, y: 4.6, w: 5.0, h: 0.6, valign: 'middle', fontFace: FONT_BODY, fontSize: 12.5, color: C.white, isTextBox: true, margin: 0 });

    s.addShape('roundRect', { x: 8.9, y: 0.55, w: 3.6, h: 6.4, rectRadius: 0.28, fill: { color: '063D33' }, line: { color: C.teal, width: 2 } });
    s.addImage({ path: SHOT('mobile'), x: 9.08, y: 0.73, sizing: { type: 'contain', w: 3.24, h: 6.04 } });
    s.addNotes('Captura real en formato celular: el asistente respondiendo con datos reales.');
  }

  // ── Slide 8: Seguridad y privacidad ───────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.tealDark };
    s.addText('Tus datos, solo de tu familia', {
      x: 0, y: 0.85, w: 13.333, h: 0.8, align: 'center', fontFace: FONT_HEAD, fontSize: 32, bold: true, color: C.white, isTextBox: true, margin: 0,
    });
    const feats = [
      { icon: 'shield', title: 'Grupos aislados', text: 'Ninguna otra familia puede ver tus datos financieros — nunca, bajo ninguna circunstancia.' },
      { icon: 'login', title: 'Sin contraseñas', text: 'Inicias sesión con tu cuenta de Google — una credencial menos que gestionar o filtrar.' },
      { icon: 'users', title: 'Roles claros', text: 'El administrador del grupo decide quién entra; los miembros usan la app con confianza.' },
    ];
    feats.forEach((f, i) => {
      const x = 1.0 + i * 3.85;
      iconCircle(s, { x: x + 1.2, y: 2.15, d: 1.1, bg: C.teal, icon: ICON(f.icon), iconD: 0.56 });
      s.addText(f.title, { x, y: 3.5, w: 3.5, h: 0.5, align: 'center', fontFace: FONT_HEAD, fontSize: 16, bold: true, color: C.white, isTextBox: true, margin: 0 });
      s.addText(f.text, { x: x + 0.2, y: 4.05, w: 3.1, h: 1.7, align: 'center', fontFace: FONT_BODY, fontSize: 12, color: C.tealLight, isTextBox: true, margin: 0, lineSpacingMultiple: 1.3 });
    });
    s.addNotes('Seguridad: aislamiento total entre grupos familiares, login con Google, roles.');
  }

  // ── Slide 9: Por qué FamilyFinance ────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    s.addText('¿Por qué FamilyFinance?', {
      x: 0.7, y: 0.55, w: 9, h: 0.7, fontFace: FONT_HEAD, fontSize: 32, bold: true, color: C.text, isTextBox: true, margin: 0,
    });

    const rows = [
      ['Datos compartidos en tiempo real', 'Toda la familia ve lo mismo, al instante'],
      ['Sin contraseñas que gestionar', 'Solo tu cuenta de Google'],
      ['Privacidad total entre familias', 'Tu grupo, completamente aislado'],
      ['Pensada para el celular', 'Ideal para usar en el supermercado'],
      ['Presupuesto siempre al día', 'Calculado en tiempo real, nunca desactualizado'],
    ];
    let y = 1.75;
    rows.forEach((r, i) => {
      s.addShape('roundRect', { x: 0.7, y, w: 11.9, h: 0.85, rectRadius: 0.08, fill: { color: i % 2 === 0 ? C.cream : C.white }, line: { type: 'none' } });
      s.addShape('ellipse', { x: 1.0, y: y + 0.28, w: 0.28, h: 0.28, fill: { color: C.teal }, line: { type: 'none' } });
      s.addText(r[0], { x: 1.5, y: y + 0.08, w: 4.7, h: 0.7, valign: 'middle', fontFace: FONT_BODY, bold: true, fontSize: 14, color: C.text, isTextBox: true, margin: 0 });
      s.addText(r[1], { x: 6.3, y: y + 0.08, w: 6.1, h: 0.7, valign: 'middle', fontFace: FONT_BODY, fontSize: 13, color: C.text2, isTextBox: true, margin: 0 });
      y += 1.0;
    });
    s.addNotes('Tabla comparativa de diferenciadores.');
  }

  // ── Slide 10: Cierre / CTA ─────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.tealDark };
    iconCircle(s, { x: 5.87, y: 0.9, d: 1.3, bg: C.teal, icon: ICON('users'), iconD: 0.68 });
    s.addText('Organiza las finanzas de tu familia, juntos', {
      x: 1.0, y: 2.55, w: 11.333, h: 1.1, align: 'center', fontFace: FONT_HEAD, fontSize: 30, bold: true, color: C.white, isTextBox: true, margin: 0,
    });
    s.addText('Crea tu grupo familiar hoy — es gratis empezar', {
      x: 1.0, y: 3.75, w: 11.333, h: 0.6, align: 'center', fontFace: FONT_BODY, fontSize: 16, italic: true, color: C.tealLight, isTextBox: true, margin: 0,
    });
    s.addShape('roundRect', { x: 5.37, y: 4.7, w: 2.6, h: 0.62, rectRadius: 0.31, fill: { color: C.amber }, line: { type: 'none' } });
    s.addText('Empezar ahora', { x: 5.37, y: 4.7, w: 2.6, h: 0.62, align: 'center', valign: 'middle', fontFace: FONT_BODY, bold: true, fontSize: 14, color: C.white, isTextBox: true, margin: 0 });
    s.addText('FamilyFinance', { x: 0, y: 6.7, w: 13.333, h: 0.4, align: 'center', fontFace: FONT_BODY, fontSize: 11, color: C.teal, charSpacing: 3, isTextBox: true, margin: 0 });
    s.addNotes('Cierre y llamado a la acción.');
  }

  await pres.writeFile({ fileName: path.join(__dirname, 'FamilyFinance-Presentacion.pptx') });
  console.log('Deck written');
}

build().catch((e) => { console.error(e); process.exit(1); });
