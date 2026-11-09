#!/usr/bin/env node
/*
 * Gera o PDF de um módulo para enviar aos alunos.
 *
 * Uso:
 *   node tools/pdf/gerar-pdf.cjs --modulo conteudo/modulo-01-primeiro-acesso-e-administracao-basica.md --saida pdf/modulo-01.pdf
 *
 * O PDF tem capa, sumário, o texto do módulo com as imagens (sempre uma por linha), cada carrossel
 * como um passo a passo numerado e cada Guia de comandos CLI como um quadro, com as saídas dos comandos.
 * Se o módulo tiver blocos :::quiz, as questões entram sem as respostas e o gabarito vai no fim.
 *
 * Requer Playwright (require('playwright')). Para numerar as páginas sem numerar a capa, usa o pacote
 * Python pypdf, se estiver instalado (pip install pypdf); sem ele, a capa também recebe o rodapé.
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []));
const RAIZ = path.resolve(__dirname, '..', '..');
const MODULO = path.resolve(RAIZ, args.modulo || 'conteudo/modulo-01-primeiro-acesso-e-administracao-basica.md');
const SAIDA = path.resolve(RAIZ, args.saida || `pdf/${path.basename(MODULO, '.md').replace(/^modulo-(\d+).*/, 'modulo-$1')}.pdf`);

/* Roda no navegador: transforma o markdown do módulo no documento de impressão. */
function montar({ md, raiz }) {
  const ICON = {
    tip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9L2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4.5M12 17h.01"/></svg>',
    exam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 9L12 4 2 9l10 5 10-5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6"/></svg>',
    note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.5h.01"/></svg>',
  };
  const parse = (t) => marked.parse(t, { gfm: true, headerIds: false, mangle: false });
  const inline = (t) => marked.parseInline(t, { gfm: true, mangle: false });
  const abs = (src) => (/^[a-z]+:/i.test(src) ? src : raiz + src);

  function preprocess(text) {
    const lines = text.split('\n');
    const out = [];
    const blocks = [];
    let fence = null;
    const toggle = (open, m) => (!open ? m : m[0] === open[0] && m.length >= open.length ? null : open);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const f = line.match(/^\s*(`{3,}|~{3,})/);
      if (!fence) {
        const c = line.match(/^:::(figura|slides|cli|quiz)\b\s*(.*)$/);
        if (c) {
          const body = [];
          let inner = null, j = i + 1;
          for (; j < lines.length; j++) {
            const g = lines[j].match(/^\s*(`{3,}|~{3,})/);
            if (g) inner = toggle(inner, g[1]);
            if (!inner && /^:::\s*$/.test(lines[j])) break;
            body.push(lines[j]);
          }
          blocks.push({ type: c[1], args: c[2].trim(), body: body.join('\n') });
          out.push('', `<div data-block="${blocks.length - 1}"></div>`, '');
          i = j;
          continue;
        }
      }
      if (f) fence = toggle(fence, f[1]);
      out.push(line);
    }
    return { md: out.join('\n'), blocks };
  }

  const spec = (t) => {
    const m = t.trim().match(/^(\S+)(?:\s+"([^"]*)")?(?:\s*\|\s*([\s\S]*))?$/);
    return m ? { src: m[1], alt: m[2] || '', cap: (m[3] || '').trim() } : null;
  };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  const img = (s) => { const i = document.createElement('img'); i.src = abs(s.src); i.alt = s.alt; return i; };

  const respostas = [];
  let nQuiz = 0;

  function figura(b) {
    const s = spec(b.args);
    const f = el('figure', 'fig');
    f.appendChild(img(s));
    if (b.body.trim()) f.appendChild(el('figcaption', 'cap', parse(b.body.trim())));
    return f;
  }

  function slides(b) {
    const itens = b.body.split('\n').filter((l) => l.trim()).map(spec).filter(Boolean);
    // Sempre uma imagem por linha, na largura toda, para as telas não ficarem pequenas.
    const wrap = el('div', 'steps');
    wrap.appendChild(el('div', 'steps-title', `Passo a passo · ${itens.length} ${itens.length === 1 ? 'imagem' : 'imagens'}`));
    itens.forEach((s, i) => {
      const f = el('figure', 'fig step');
      f.appendChild(img(s));
      const cap = el('figcaption', 'cap');
      cap.appendChild(el('span', 'num', String(i + 1)));
      cap.appendChild(el('div', '', s.cap ? `<p>${inline(s.cap)}</p>` : ''));
      f.appendChild(cap);
      wrap.appendChild(f);
    });
    return wrap;
  }

  function cli(b) {
    const box = el('section', 'cli');
    const head = el('div', 'cli-head', '<span class="ico">&gt;_</span><div><b>Guia de comandos CLI</b><br><span></span></div>');
    head.querySelector('span:not(.ico)').textContent = b.args || 'Comandos deste capítulo';
    box.appendChild(head);
    const corpo = el('div', 'cli-body');
    const pre = preprocess(b.body);
    corpo.innerHTML = parse(pre.md);
    montarBlocos(corpo, pre.blocks);
    acabamento(corpo);
    box.appendChild(corpo);
    return box;
  }

  function quiz(b) {
    const stem = [], opts = [], why = [];
    b.body.split('\n').forEach((l) => {
      const o = l.match(/^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/);
      if (o) { opts.push({ text: o[2], right: o[1].toLowerCase() === 'x' }); return; }
      const w = l.match(/^>\s?(.*)$/);
      if (w) { why.push(w[1]); return; }
      if (!opts.length) stem.push(l); else if (l.trim()) why.push(l);
    });
    const n = ++nQuiz;
    const letras = 'ABCDEFGH';
    const multi = opts.filter((o) => o.right).length > 1;
    const box = el('section', 'quiz' + (multi ? ' multi' : ''));
    box.appendChild(el('div', 'qn', `Questão ${n}`));
    const st = el('div', 'stem', parse(stem.join('\n').trim()));
    st.querySelectorAll('img').forEach((i) => { i.src = abs(i.getAttribute('src')); });
    box.appendChild(st);
    opts.forEach((o, i) => box.appendChild(el('div', 'opt', `<span class="l">${letras[i]}</span><span>${inline(o.text)}</span>`)));
    respostas.push({ n, certas: opts.map((o, i) => (o.right ? letras[i] : null)).filter(Boolean), why: parse(why.join('\n').trim()) });
    return box;
  }

  function montarBlocos(container, blocks) {
    container.querySelectorAll('div[data-block]').forEach((d) => {
      const b = blocks[Number(d.dataset.block)];
      const node = b.type === 'figura' ? figura(b) : b.type === 'slides' ? slides(b) : b.type === 'cli' ? cli(b) : quiz(b);
      d.replaceWith(node);
    });
  }

  function acabamento(container) {
    container.querySelectorAll('pre').forEach((pre) => {
      if (pre.closest('.codeblock')) return;
      const code = pre.querySelector('code');
      const saida = !!(code && /\blanguage-saida\b/.test(code.className));
      const first = (code ? code.textContent : pre.textContent).split('\n')[0].trim();
      const rotulo = saida ? 'Saída' : /^#config-version/.test(first) ? 'Arquivo de configuração' : /^(config|execute|diagnose|get|show|set|edit|append|unselect|FGT-?\S* #)/.test(first) ? 'CLI' : 'Texto';
      const box = el('div', 'codeblock' + (saida ? ' output' : ''));
      box.appendChild(el('div', 'head', rotulo));
      pre.parentNode.insertBefore(box, pre);
      box.appendChild(pre);
    });
    container.querySelectorAll('blockquote').forEach((bq) => {
      const first = bq.firstElementChild;
      const strong = first && first.tagName === 'P' && first.firstElementChild && first.firstElementChild.tagName === 'STRONG' && first.firstChild === first.firstElementChild ? first.firstElementChild : null;
      const label = strong ? strong.textContent.trim().replace(/:$/, '') : '';
      const k = label.toLowerCase();
      const tipo = k.startsWith('atenção') ? 'warn' : k.startsWith('na prática') ? 'tip' : k.startsWith('dica para a prova') ? 'exam' : 'note';
      const box = el('div', 'callout ' + tipo);
      if (strong) {
        box.appendChild(el('div', 'ch', ICON[tipo] + label));
        strong.remove();
        if (first.firstChild && first.firstChild.nodeType === 3) first.firstChild.textContent = first.firstChild.textContent.replace(/^\s*:?\s*/, '');
        if (!first.textContent.trim()) first.remove();
      }
      while (bq.firstChild) box.appendChild(bq.firstChild);
      bq.replaceWith(box);
    });
  }

  const pre = preprocess(md);
  const doc = el('main', 'doc');
  doc.innerHTML = parse(pre.md);
  montarBlocos(doc, pre.blocks);
  acabamento(doc);

  // Capa e sumário
  const h1 = doc.querySelector('h1');
  const m = (h1 ? h1.textContent : '').match(/^(Módulo|Apêndice)\s+(\S+)\s+[—-]\s+(.*)$/);
  const cover = el('section', 'cover', `
    <div class="brand">Curso FortiGate <b>7.6</b></div>
    <div><div class="eyebrow">${m ? `${m[1]} ${m[2]}` : ''}</div><h1></h1>
    <div class="sub">Administração de FortiGate e preparação para a certificação Fortinet NSE 4 – FortiOS Administrator.</div></div>
    <div class="foot">Material do aluno</div>`);
  cover.querySelector('h1').textContent = m ? m[3] : h1 ? h1.textContent : '';
  const toc = el('section', 'toc', '<h2>Sumário</h2><ol></ol>');
  const ol = toc.querySelector('ol');
  [...doc.querySelectorAll('h2, h3')].filter((h) => !h.closest('.cli')).forEach((h) => {
    const li = el('li', h.tagName === 'H2' ? 'l2' : 'l3');
    li.textContent = h.textContent;
    ol.appendChild(li);
  });
  const fim = el('li', 'l2');
  fim.textContent = 'Gabarito comentado';
  if (respostas.length) ol.appendChild(fim);

  // Gabarito
  if (respostas.length) {
    const ans = el('section', 'answers doc');
    ans.appendChild(el('h2', '', 'Gabarito comentado'));
    respostas.forEach((r) => {
      const a = el('div', 'ans', `<div class="h">Questão ${r.n} · <span>${r.certas.join(' e ')}</span></div>`);
      a.insertAdjacentHTML('beforeend', r.why);
      ans.appendChild(a);
    });
    doc.appendChild(ans);
  }

  const root = document.getElementById('root');
  root.append(cover, toc, doc);
  return { titulo: cover.querySelector('h1').textContent, modulo: m ? `${m[1]} ${m[2]}` : '' };
}

(async () => {
  const md = fs.readFileSync(MODULO, 'utf8');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.join(__dirname, 'modelo.html')).href);
  await page.addScriptTag({ path: path.join(RAIZ, 'tools', 'vendor', 'marked.min.js') });
  const info = await page.evaluate(montar, { md, raiz: pathToFileURL(RAIZ + path.sep).href });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = r; i.onerror = r; }))));
  });
  const quebradas = await page.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.getAttribute('src')));
  if (quebradas.length) console.warn('Imagens não encontradas:\n  ' + quebradas.join('\n  '));

  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  const rodape = `<div style="width:100%;font-family:Arial,sans-serif;font-size:7.5pt;color:#8a929c;padding:0 16mm;display:flex;justify-content:space-between">
    <span>Curso FortiGate 7.6 · ${info.modulo} — ${info.titulo}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`;
  const opcoes = { format: 'A4', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true, headerTemplate: '<div></div>', footerTemplate: rodape };

  // Capa sem rodapé: gera a capa e o miolo separados e junta com pypdf, se houver.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-'));
  const capa = path.join(tmp, 'capa.pdf');
  const miolo = path.join(tmp, 'miolo.pdf');
  await page.pdf({ ...opcoes, path: capa, pageRanges: '1', displayHeaderFooter: false });
  await page.addStyleTag({ content: '.cover { display: none !important; } @page :first { margin: 18mm 16mm 20mm; }' });
  await page.pdf({ ...opcoes, path: miolo });
  let juntou = false;
  try {
    execFileSync('python3', ['-c', 'import sys\nfrom pypdf import PdfWriter\nw = PdfWriter()\nfor f in sys.argv[2:]:\n    w.append(f)\nw.write(sys.argv[1])', SAIDA, capa, miolo], { stdio: 'pipe' });
    juntou = true;
  } catch (e) { /* sem pypdf */ }
  if (!juntou) {
    await page.addStyleTag({ content: '.cover { display: flex !important; } @page :first { margin: 0; }' });
    await page.pdf({ ...opcoes, path: SAIDA });
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  await browser.close();
  console.log(`${SAIDA} (${(fs.statSync(SAIDA).size / 1048576).toFixed(1)} MB)`);
})().catch((e) => { console.error(e); process.exit(1); });
