#!/usr/bin/env node
/*
 * Gera as mídias de um módulo a partir do roteiro do modo aula do laboratório (repositório fortigate-clone).
 *
 * Uso:
 *   node tools/captura/capturar.cjs --roteiro m01 --saida midia/m01 [--lab http://127.0.0.1:5173]
 *
 * O laboratório precisa estar rodando (npm run dev no fortigate-clone). O script percorre o roteiro do
 * início ao fim e, nos passos marcados com `captura`, salva:
 *   - imagem: <arquivo>.png (a tela inteira em 1920x1080 ou, com `recorte`, só a área pedida, renderizada
 *             com mais pixels por ponto para continuar com pelo menos 1920 px de largura)
 *   - slides: <arquivo>-1.png, -2.png... uma imagem por slide do foco do passo, cada uma com o elemento
 *             daquele slide em destaque (o resto escurecido), para os carrosséis do curso
 *   - video:  <arquivo>.mp4 com a ação do passo animada, como na aula (cursor visível)
 * e um capturas.json com a lista do que foi gerado. Com `destaque`, o resto da tela sai escurecido.
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
const ESCALA_MAX = 5;

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

/** Saves the screen, or the crop area rendered at a higher pixel density so it stays at least W px wide. */
async function fotografar(page, recorte, destino, slide) {
  if (!recorte) {
    await page.screenshot({ path: destino });
    return { w: W, h: H };
  }
  const ajustar = ({ x, y, w, h }) => {
    if (w * ESCALA_MAX < W) {
      const novo = Math.ceil(W / ESCALA_MAX);
      x = Math.max(0, Math.min(W - novo, Math.round(x - (novo - w) / 2)));
      w = novo;
    }
    return { x, y, w, h };
  };
  const antes = ajustar(recorte);
  const escala = Math.max(1, W / antes.w);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: escala, mobile: false });
  await page.waitForTimeout(500);
  // Some popups move a little when the pixel density changes: measure again at the new density.
  const depois = (await page.evaluate((k) => window.__guia.preparar(k), slide)).recorte;
  await page.waitForTimeout(150);
  let { x, y, w, h } = depois ? ajustar(depois) : antes;
  w = antes.w;
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x, y, width: w, height: h, scale: 1 } });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await cdp.detach();
  fs.writeFileSync(destino, Buffer.from(data, 'base64'));
  await page.waitForTimeout(200);
  return { w: Math.round(w * escala), h: Math.round(h * escala) };
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
    const tipo = cap.tipo || 'imagem';
    const imagens = tipo === 'slides' ? p.slides.map((s, i) => ({ slide: i, nome: `${cap.arquivo}-${i + 1}.png`, legenda: s })) : [{ nome: `${cap.arquivo}.png` }];
    const salvas = [];
    for (const img of imagens) {
      const prep = await page.evaluate((k) => window.__guia.preparar(k), img.slide);
      await page.waitForTimeout(150);
      const tam = await fotografar(page, prep.recorte, path.join(SAIDA, img.nome), img.slide);
      salvas.push({ arquivo: img.nome, largura: tam.w, altura: tam.h, ...(img.legenda ? { slide: img.legenda } : {}) });
    }
    await page.evaluate(() => window.__guia.captura(false));
    await page.waitForTimeout(200);
    const item = { arquivo: salvas.length === 1 ? salvas[0].arquivo : cap.arquivo, tipo, passo: p.numero, titulo: p.titulo, descricao: cap.descricao || '', ...(salvas.length > 1 ? { imagens: salvas } : { largura: salvas[0].largura, altura: salvas[0].altura }) };
    geradas.push(item);
    console.log(`  ${p.numero}. ${p.titulo} -> ${salvas.map((x) => `${x.arquivo} (${x.largura}x${x.altura})`).join(', ')}`);
  }

  if (!SO) fs.writeFileSync(path.join(SAIDA, 'capturas.json'), `${JSON.stringify({ roteiro: ROTEIRO, geradoEm: new Date().toISOString(), arquivos: geradas }, null, 2)}\n`);
  await browser.close();
  console.log(`${geradas.length} arquivos em ${SAIDA}`);
})().catch((e) => { console.error(e); process.exit(1); });
