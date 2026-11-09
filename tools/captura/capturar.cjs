#!/usr/bin/env node
/*
 * Gera as mídias de um módulo a partir do roteiro do modo aula do laboratório (repositório fortigate-clone).
 *
 * Uso:
 *   node tools/captura/capturar.cjs --roteiro m01 --saida midia/m01 [--lab http://127.0.0.1:5173]
 *
 * O laboratório precisa estar rodando (npm run dev no fortigate-clone). O script percorre o roteiro do
 * início ao fim e, nos passos marcados com `captura`, salva:
 *   - imagem:     <arquivo>.png em 1920x1080
 *   - interativo: <arquivo>.png e <arquivo>.json com a área e a explicação de cada elemento
 *   - video:      <arquivo>.mp4 com a ação do passo animada, como na aula (cursor visível)
 * e um capturas.json com a lista do que foi gerado.
 *
 * Requer Playwright (require('playwright')) e ffmpeg com libx264.
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []));
const LAB = args.lab || 'http://127.0.0.1:5173';
const ROTEIRO = args.roteiro || 'm01';
const SAIDA = path.resolve(args.saida || `midia/${ROTEIRO}`);
const SO = args.so ? new Set(args.so.split(',')) : null; // gerar só alguns arquivos

const W = 1920;
const H = 1080;

fs.mkdirSync(SAIDA, { recursive: true });

async function gravar(page, acao) {
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', (f) => {
    frames.push({ data: f.data, ts: f.metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  await page.waitForTimeout(600);
  await acao();
  await page.waitForTimeout(1500);
  const fim = Date.now() / 1000;
  await cdp.send('Page.stopScreencast');
  await cdp.detach();
  return { frames, fim };
}

function codificar({ frames, fim }, destino) {
  if (!frames.length) throw new Error('Nenhum quadro gravado.');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'captura-'));
  const linhas = ['ffconcat version 1.0'];
  frames.forEach((f, i) => {
    const nome = `f${String(i).padStart(5, '0')}.jpg`;
    fs.writeFileSync(path.join(dir, nome), Buffer.from(f.data, 'base64'));
    const dur = Math.max(0.01, (frames[i + 1]?.ts ?? fim) - f.ts);
    linhas.push(`file ${nome}`, `duration ${dur.toFixed(3)}`);
  });
  linhas.push(`file f${String(frames.length - 1).padStart(5, '0')}.jpg`);
  fs.writeFileSync(path.join(dir, 'lista.txt'), linhas.join('\n'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'lista.txt'),
    '-vf', `fps=30,scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,format=yuv420p`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-movflags', '+faststart', '-an', destino]);
  fs.rmSync(dir, { recursive: true, force: true });
}

(async () => {
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, timezoneId: 'America/Sao_Paulo', locale: 'pt-BR' });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.warn('  erro na página:', e.message));
  await page.goto(LAB);
  await page.waitForFunction(() => window.__guia, null, { timeout: 60000 });
  await page.evaluate((id) => window.__guia.carregar(id), ROTEIRO);
  const passos = await page.evaluate(() => window.__guia.passos());
  console.log(`Roteiro ${ROTEIRO}: ${passos.length} passos`);

  const geradas = [];
  for (let n = 0; n < passos.length; n++) {
    const p = passos[n];
    const cap = p.captura;
    const quer = cap && (!SO || SO.has(cap.arquivo));

    if (quer && cap.tipo === 'video') {
      await page.evaluate((c) => window.__guia.captura(true, { limpo: !!c.limpo, cursor: true }), cap);
      await page.evaluate(() => window.__guia.velocidade(1));
      // A video can span several steps: from this one up to the step named in `ate`.
      const ultimo = cap.ate ? passos.findIndex((q) => q.id === cap.ate) : n;
      if (ultimo < n) throw new Error(`Passo final do vídeo não encontrado: ${cap.ate}`);
      const gravacao = await gravar(page, async () => {
        for (let i = n; i <= ultimo; i++) {
          const r = await page.evaluate((k) => window.__guia.ir(k, true), i);
          if (r.erro) throw new Error(r.erro);
          await page.waitForTimeout(500);
        }
      });
      const destino = path.join(SAIDA, `${cap.arquivo}.mp4`);
      codificar(gravacao, destino);
      await page.evaluate(() => window.__guia.captura(false));
      geradas.push({ arquivo: path.basename(destino), tipo: 'video', passo: p.numero, titulo: p.titulo, descricao: cap.descricao || '' });
      console.log(`  ${p.numero}. ${p.titulo} -> ${path.basename(destino)}`);
      n = ultimo;
      continue;
    }

    const r = await page.evaluate(() => window.__guia.passo());
    if (r.erro) throw new Error(r.erro);
    if (!quer) continue;

    await page.evaluate((c) => window.__guia.captura(true, { limpo: !!c.limpo, comFoco: !!c.comFoco }), cap);
    await page.waitForTimeout(900);
    const png = path.join(SAIDA, `${cap.arquivo}.png`);
    await page.screenshot({ path: png });
    const item = { arquivo: path.basename(png), tipo: cap.tipo || 'imagem', passo: p.numero, titulo: p.titulo, descricao: cap.descricao || '' };
    if (cap.tipo === 'interativo') {
      const alvos = await page.evaluate(() => window.__guia.alvos());
      const pontos = alvos.map((a) => ({ titulo: a.titulo, texto: a.texto, principal: !a.proprio, ...(a.area && a.area.w > 0 ? { x: a.area.x, y: a.area.y, w: a.area.w, h: a.area.h } : {}) }));
      const json = { imagem: path.basename(png), largura: W, altura: H, descricao: cap.descricao || '', pontos };
      fs.writeFileSync(path.join(SAIDA, `${cap.arquivo}.json`), `${JSON.stringify(json, null, 2)}\n`);
      item.pontos = pontos.length;
    }
    await page.evaluate(() => window.__guia.captura(false));
    await page.waitForTimeout(200);
    geradas.push(item);
    console.log(`  ${p.numero}. ${p.titulo} -> ${path.basename(png)}${item.pontos ? ` (+${item.pontos} pontos)` : ''}`);
  }

  if (!SO) fs.writeFileSync(path.join(SAIDA, 'capturas.json'), `${JSON.stringify({ roteiro: ROTEIRO, geradoEm: new Date().toISOString(), arquivos: geradas }, null, 2)}\n`);
  await browser.close();
  console.log(`${geradas.length} arquivos em ${SAIDA}`);
})().catch((e) => { console.error(e); process.exit(1); });
