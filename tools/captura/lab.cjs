/*
 * Biblioteca de captura do curso: monta um laboratório próprio no app fortigate-clone, navega pela GUI
 * e salva as imagens do material. Não depende do modo aula do laboratório.
 *
 * Uso (em um script de módulo, como tools/captura/m02.cjs):
 *   const lab = require('./lab.cjs');
 *   const s = await lab.iniciar({ saida: 'midia/m02' });
 *   await s.novo({ id: 'curso-m02', nome: 'Curso – Módulo 02', site: {...} });
 *   await s.adicionar({ id: 'fgt-mtz', tipo: 'fortigate', nome: 'FGT-MTZ', x: 400, y: 100 });
 *   await s.foto('02-1-interfaces', { limpo: true, destaque: [s.page.locator('.content-scroll')] });
 *   await s.fim();
 *
 * O laboratório precisa estar rodando em modo de desenvolvimento (npm run dev no fortigate-clone, porta 5173):
 * a biblioteca usa os módulos do app pelo servidor do Vite para montar a topologia.
 *
 * Imagens: a tela inteira em 1920x1080 ou, com `recorte`, só a área pedida, renderizada com mais pixels por
 * ponto para continuar com pelo menos 1920 px de largura. `destaque` escurece o resto da tela.
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const W = 1920;
const H = 1080;
/** Tamanho atual da janela do navegador (o diagrama pode usar uma janela maior). */
let VW = W;
let VH = H;
const ESCALA_MAX = 5;

/* Roda no navegador: expõe as operações do laboratório usando os próprios módulos do app. */
const PONTE = `
import { useSession } from '/src/lab/session.ts';
import { addDevice, addLink, patchDevice } from '/src/lab/ops.ts';
import { emptyPlan, plugIn } from '/src/lab/plan.ts';
import { makeSite } from '/src/lab/sites.ts';
import { buildLink, createNode, planPortLink } from '/src/lab/ui/topology/model.ts';
import { SCHEMA } from '/src/lab/isp.ts';
import { clearLogs } from '/src/lab/persistence.ts';
const S = () => useSession.getState();
const lab = () => { const l = S().lab; if (!l) throw new Error('Nenhum laboratório aberto.'); return l; };
const site = () => lab().sites?.[0];
window.__cap = {
  async novo({ id, nome, site: s }) {
    try { for (const k of Object.keys(sessionStorage)) if (k.startsWith('fgt-logged-') || k === 'fgt-splash-seen') sessionStorage.removeItem(k); } catch {}
    await clearLogs(id).catch(() => undefined);
    const place = { ...makeSite(s.nome, s.pais, s.cidade, s.lat, s.lon), id: s.id, plan: emptyPlan(), environment: { office: 'small' } };
    const doc = { id, name: nome, schema: SCHEMA, sites: [place], nodes: [], links: [], clock: { speed: 1, running: true, simTime: Date.now() }, configs: {}, updatedAt: Date.now() };
    S().openLab(doc);
    S().openSite(s.id);
  },
  adicionar({ id, tipo, nome, x, y, serial, extra }) {
    const base = createNode(tipo, lab(), x, y, site());
    const fgt = tipo === 'fortigate' ? { hostname: nome, serial: serial ?? base.serial } : {};
    S().commit((l) => addDevice(l, { ...base, ...fgt, ...(extra || {}), id, name: nome, x, y }));
  },
  conectar(a, b, id, wan) {
    const plan = planPortLink(lab(), { node: a[0], port: a[1] }, { node: b[0], port: b[1] });
    if ('error' in plan) throw new Error('Não foi possível conectar ' + a.join(':') + ' a ' + b.join(':') + ': ' + plan.error);
    S().commit((l) => { const link = { ...buildLink(l, plan), ...(id ? { id } : {}) }; if (wan && link.wan) Object.assign(link.wan, wan); return addLink(l, link); });
  },
  energia(ids) { S().commit((l) => ids.reduce((acc, id) => plugIn(acc, id), l)); },
  patch(id, campos) { S().commit((l) => patchDevice(l, id, campos)); },
  rede(id, rede) { const n = lab().nodes.find((x) => x.id === id); S().commit((l) => patchDevice(l, id, { net: { ...n.net, ...rede } })); },
  no(id) { return lab().nodes.find((x) => x.id === id); },
  link(id) { return lab().links.find((x) => x.id === id); },
  nos() { return lab().nodes.map((n) => ({ id: n.id, kind: n.kind, name: n.name, x: n.x, y: n.y })); },
  config(id) { return lab().configs[id]; },
  setConfig(id, chave, valor) { const c = lab().configs[id] || {}; S().setDeviceConfig(id, { ...c, [chave]: valor }); },
  abrirDispositivo(id, rota) { S().openDevice(id, rota); },
  voltar() { S().backToLab(); },
  site() { S().openSite(site().id); },
};
`;

async function iniciar({ saida, lab = process.env.LAB || 'http://127.0.0.1:5173', so } = {}) {
  const SAIDA = path.resolve(saida);
  fs.mkdirSync(SAIDA, { recursive: true });
  const filtro = so ? new Set(String(so).split(',')) : null;
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, timezoneId: 'America/Sao_Paulo', locale: 'pt-BR' });
  const page = await context.newPage();
  page.setDefaultTimeout(Number(process.env.TIMEOUT || 12000));
  page.on('pageerror', (e) => { if (!/earth-blue-marble/.test(e.message)) console.warn('  erro na página:', e.message); });
  await page.goto(lab);
  await page.waitForFunction(() => document.querySelector('#root')?.children.length, null, { timeout: 60000 });
  await page.addScriptTag({ type: 'module', content: PONTE });
  await page.waitForFunction(() => window.__cap, null, { timeout: 30000 });
  const geradas = [];

  const espera = (ms) => page.waitForTimeout(ms);
  const cap = (fn, ...a) => page.evaluate(([f, args]) => window.__cap[f](...args), [fn, a]);

  /* ---------- Montagem do laboratório ---------- */
  const s = {
    page, browser, geradas, espera,
    async novo(o) { await cap('novo', o); await espera(800); await s.diagrama2d(); },
    async adicionar(o) { await cap('adicionar', o); await espera(250); },
    async conectar(a, b, id, wan) { await cap('conectar', a, b, id, wan); await espera(250); },
    async energia(ids) { await cap('energia', ids); await espera(400); },
    async rede(id, r) { await cap('rede', id, r); await espera(200); },
    async patch(id, campos) { await cap('patch', id, campos); await espera(200); },
    config: (id) => cap('config', id),
    async setConfig(id, chave, valor) { await cap('setConfig', id, chave, valor); await espera(300); },
    async diagrama2d() {
      const b = page.locator('.tp-mode button', { hasText: '2D diagram' });
      await b.waitFor({ timeout: 15000 });
      if (!(await b.evaluate((e) => e.classList.contains('on')))) await b.click();
      await espera(400);
    },
    async enquadrar({ folga = 0 } = {}) {
      for (let i = 0; i < 2; i++) { const b = page.locator('.react-flow__controls-fitview'); if (await b.count()) await b.click(); await espera(900); }
      for (let i = 0; i < folga; i++) { const b = page.locator('.react-flow__controls-zoomout'); if (await b.count()) await b.click(); await espera(500); }
    },
    nos: () => cap('nos'),
    /** Muda o tamanho da janela (sem argumentos, volta a 1920x1080). */
    async tela(w = W, h = H) { VW = w; VH = h; await page.setViewportSize({ width: w, height: h }); await espera(600); },
    /** Todos os elementos visíveis de um seletor, um locator para cada (para recortes e destaques). */
    async todos(sel) { return page.locator(sel).filter({ visible: true }).all(); },
    async voltar() { await cap('voltar'); await espera(600); },
    async abrir(id, rota) { await cap('abrirDispositivo', id, rota); await espera(900); },
    /** Abre a GUI de um FortiGate em tela cheia, faz login e fecha o aviso de novidades. */
    async gui(id, senha, rota = '/dashboard/status') {
      await s.abrir(id, rota);
      const login = page.locator('.login-in');
      if (await login.first().isVisible({ timeout: 4000 }).catch(() => false)) {
        await login.nth(0).fill('admin');
        await login.nth(1).fill(senha);
        await page.locator('.login-btn').click();
        await page.locator('.login-btn').waitFor({ state: 'detached', timeout: 10000 });
        await s.fecharNovidades();
      }
    },
    async fecharNovidades() {
      const splash = page.locator('div', { hasText: "Don't show again" }).filter({ hasText: "What's new" }).last();
      if (await splash.isVisible({ timeout: 2500 }).catch(() => false)) {
        const t = splash.locator('.toggle').first();
        if (await t.count()) await t.click();
        await splash.getByRole('button', { name: 'OK' }).click();
        await espera(400);
      }
    },
    /** Vai para uma página da GUI pelo hash (mais rápido que pelo menu). */
    async rota(r) { await page.evaluate((x) => { location.hash = x; }, r); await espera(900); },
    /** Abre uma página pelo menu lateral, como uma pessoa faria. */
    async menu(grupo, item) {
      const sub = page.locator('.nav-item:visible', { hasText: new RegExp(`^\\s*${esc(item)}\\s*$`) });
      if (!(await sub.count())) await page.locator('.nav-item:visible', { hasText: new RegExp(`^\\s*${esc(grupo)}\\s*$`) }).first().click();
      await sub.first().click();
      await espera(700);
    },
    /** Linha de formulário da GUI (.frow) pelo rótulo. */
    campo(rotulo, dentro) {
      const base = dentro ? (typeof dentro === 'string' ? page.locator(dentro) : dentro) : page;
      return base.locator('.frow:visible').filter({ has: page.locator('.flabel', { hasText: new RegExp(`^\\s*${esc(rotulo)}\\s*$`) }) }).first();
    },
    botao(texto, dentro) {
      const base = dentro ? (typeof dentro === 'string' ? page.locator(dentro) : dentro) : page;
      return base.locator('button:visible', { hasText: new RegExp(`^\\s*${esc(texto)}\\s*$`) }).first();
    },
    texto(t, sel = '*') { return page.locator(`${sel}:visible`, { hasText: t }); },
    /** Esconde a barra lateral do laboratório, deixando só a tela do dispositivo. */
    async limpo(on = true) { await page.evaluate((v) => document.documentElement.classList.toggle('guia-limpo', v), on); await espera(300); },

    /* ---------- CLI Console da GUI ---------- */
    async cli(comandos, { novo = false } = {}) {
      if (!(await page.locator('.cli-modal').count())) {
        await page.locator('header.banner button[title="CLI"]:visible').click();
        await page.getByText('CLI Console', { exact: true }).first().click();
        await page.locator('.cli-modal .cli-screen').last().waitFor();
      } else if (novo) {
        await page.locator('.cli-modal button[title="New terminal"]').click();
        await espera(300);
      }
      const tela = page.locator('.cli-modal .cli-screen').last();
      const prompt = async () => {
        for (let i = 0; i < 50; i++) { if (/[#$]\s*$/.test((await tela.innerText()).trimEnd() + ' ') || /[#$]$/.test((await tela.innerText()).trimEnd())) return; await espera(100); }
      };
      for (const c of [].concat(comandos)) {
        await prompt();
        await tela.click();
        await page.keyboard.type(c);
        await page.keyboard.press('Enter');
        await espera(500);
        for (let i = 0; i < 40 && /--More--\s*$/.test(await tela.innerText()); i++) { await page.keyboard.press(' '); await espera(120); }
      }
      return tela.innerText();
    },
    async fecharCli() { const b = page.locator('.cli-modal button[title="Close"]'); if (await b.count()) await b.click(); await espera(300); },

    /* ---------- Imagens ---------- */
    /**
     * Salva uma imagem. Opções:
     *   recorte: locators (ou seletores CSS) cuja área, somada, é recortada;
     *   margem: espaço em volta do recorte (padrão 16);
     *   destaque: locators que ficam claros, com o resto escurecido; cabos do diagrama: { cabo: 'id-do-link' };
     *   unir: junta os destaques numa área só;
     *   largura: limita a largura do recorte, a partir da esquerda (formulários largos com campos à esquerda);
     *   limpo: esconde a barra lateral do laboratório.
     */
    async foto(nome, o = {}) {
      if (filtro && !filtro.has(nome)) return;
      if (o.limpo !== undefined) await s.limpo(o.limpo);
      await espera(o.espera ?? 400);
      const destino = path.join(SAIDA, `${nome}.png`);
      const medir = async () => {
        const destaques = await caixas(o.destaque || []);
        const unidas = o.unir && destaques.length ? [uniao(destaques)] : destaques;
        const cabos = [].concat(o.destaque || []).filter((d) => d && d.cabo).map((d) => d.cabo);
        await page.evaluate(escurecer, { buracos: unidas, cabos });
        const area = uniao(await caixas(o.recorte || []));
        if (!area) return null;
        const m = o.margem ?? 16;
        const x = Math.max(0, area.x - m), y = Math.max(0, area.y - m);
        let w = Math.min(VW, area.x + area.w + m) - x;
        if (o.largura) w = Math.min(w, o.largura);
        return { x, y, w, h: Math.min(VH, area.y + area.h + m) - y };
      };
      const recorte = await medir();
      let tam;
      if (!recorte) {
        await page.screenshot({ path: destino });
        tam = { w: VW, h: VH };
      } else {
        const ajustar = ({ x, y, w, h }) => {
          if (w * ESCALA_MAX < W) { const novo = Math.ceil(W / ESCALA_MAX); x = Math.max(0, Math.min(VW - novo, Math.round(x - (novo - w) / 2))); w = novo; }
          return { x, y, w, h };
        };
        const antes = ajustar(recorte);
        const escala = Math.max(1, W / antes.w);
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Emulation.setDeviceMetricsOverride', { width: VW, height: VH, deviceScaleFactor: escala, mobile: false });
        await espera(500);
        const depois = await medir();
        const { x, y, h } = depois ? ajustar(depois) : antes;
        const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x, y, width: antes.w, height: h, scale: 1 } });
        await cdp.send('Emulation.setDeviceMetricsOverride', { width: VW, height: VH, deviceScaleFactor: 1, mobile: false });
        await cdp.detach();
        fs.writeFileSync(destino, Buffer.from(data, 'base64'));
        tam = { w: Math.round(antes.w * escala), h: Math.round(h * escala) };
      }
      await page.evaluate(() => document.getElementById('captura-escuro')?.remove());
      geradas.push({ arquivo: `${nome}.png`, largura: tam.w, altura: tam.h, descricao: o.descricao || '' });
      console.log(`  ${nome}.png (${tam.w}x${tam.h})`);
      await espera(200);
    },

    async fim() {
      if (!filtro) fs.writeFileSync(path.join(SAIDA, 'capturas.json'), `${JSON.stringify({ geradoEm: new Date().toISOString(), arquivos: geradas }, null, 2)}\n`);
      await browser.close();
      console.log(`${geradas.length} imagens em ${SAIDA}`);
    },
  };

  async function caixas(lista) {
    const out = [];
    for (const item of [].concat(lista)) {
      if (!item || item.cabo) continue;
      const loc = typeof item === 'string' ? page.locator(item).first() : item;
      const b = await loc.boundingBox().catch(() => null);
      if (b && b.width > 0 && b.height > 0) out.push({ x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) });
      else console.warn('  aviso: elemento não encontrado para recorte/destaque:', String(item));
    }
    return out;
  }
  return s;
}

const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function uniao(rs) {
  if (!rs.length) return null;
  const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y));
  return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y };
}

/* Roda no navegador: escurece a tela, deixando claros os retângulos e o traçado dos cabos pedidos. */
function escurecer({ buracos, cabos }) {
  document.getElementById('captura-escuro')?.remove();
  const tracos = cabos.map((id) => {
    const g = document.querySelector(`.react-flow__edge[data-id="${id}"]`);
    const p = g && g.querySelector('path');
    const m = p && p.getScreenCTM();
    return p && m ? { d: p.getAttribute('d'), m } : null;
  }).filter(Boolean);
  if (!buracos.length && !tracos.length) return;
  const vw = innerWidth, vh = innerHeight, folga = 6, r = 8;
  const furo = ({ x, y, w, h }) => {
    const X = x - folga, Y = y - folga, Wd = w + 2 * folga, Hd = h + 2 * folga;
    return `M${X + r},${Y} h${Wd - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${Hd - 2 * r} a${r},${r} 0 0 1 -${r},${r} h-${Wd - 2 * r} a${r},${r} 0 0 1 -${r},-${r} v-${Hd - 2 * r} a${r},${r} 0 0 1 ${r},-${r} z`;
  };
  const furos = buracos.map(furo).join(' ');
  const mt = (m) => `matrix(${m.a},${m.b},${m.c},${m.d},${m.e},${m.f})`;
  const esc = (m) => Math.hypot(m.a, m.b) || 1;
  const cortes = tracos.map((t) => `<path d="${t.d}" transform="${mt(t.m)}" fill="none" stroke="#000" stroke-width="${18 / esc(t.m)}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const linhas = tracos.map((t) => `<path d="${t.d}" transform="${mt(t.m)}" fill="none" stroke="#3d8bfd" stroke-width="${4 / esc(t.m)}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'captura-escuro';
  svg.setAttribute('width', vw); svg.setAttribute('height', vh); svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  svg.setAttribute('style', 'position:fixed;left:0;top:0;z-index:2147483646;pointer-events:none');
  svg.innerHTML = `<defs><mask id="captura-mascara" maskUnits="userSpaceOnUse" x="0" y="0" width="${vw}" height="${vh}"><rect width="${vw}" height="${vh}" fill="#fff"/>${furos ? `<path d="${furos}" fill="#000"/>` : ''}${cortes}</mask></defs>`
    + `<rect width="${vw}" height="${vh}" fill="rgba(8,10,14,0.62)" mask="url(#captura-mascara)"/>`
    + (furos ? `<path d="${furos}" fill="none" stroke="#3d8bfd" stroke-width="2.5" style="filter:drop-shadow(0 0 6px rgba(61,139,253,.55))"/>` : '')
    + `<g style="filter:drop-shadow(0 0 5px rgba(61,139,253,.7))">${linhas}</g>`;
  document.documentElement.appendChild(svg);
}

module.exports = { iniciar };
