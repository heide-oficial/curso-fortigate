#!/usr/bin/env node
/*
 * Imagens do módulo 02 — Interfaces e serviços de rede.
 *
 * Uso: node tools/captura/m02.cjs [--saida midia/m02] [--ate <etapa>] [--so arquivo1,arquivo2]
 * Requer o laboratório em modo de desenvolvimento (npm run dev no fortigate-clone, porta 5173).
 *
 * Monta a rede da matriz da Atlas a partir do estado do fim do módulo 01 e configura, pela GUI, o que o
 * módulo ensina, fotografando cada passo: a navegação pelo menu, a seleção na lista, o botão clicado, o
 * formulário e o resultado. Também grava em saidas-cli.json as saídas dos comandos do Guia de comandos CLI.
 */
const fs = require('node:fs');
const path = require('node:path');
const lab = require('./lab.cjs');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []));
const SAIDA = path.resolve(args.saida || 'midia/m02');
const ATE = args.ate || null;
const SENHA = 'Atlas#2026';
const FGT = 'fgt-mtz';
const SITE = { id: 'site-matriz', nome: 'Matriz', pais: 'BR', cidade: 'São Paulo', lat: -23.55, lon: -46.63 };
const FORM = 900;
const LISTA = 1250;
const NOS = ['FGT-MTZ', 'Operadora A', 'Operadora B', 'ADMIN-PC', 'SW-CORE', 'PC-USUARIO', 'SRV-AD', 'NOTEBOOK-VISITA', 'SRV-WEB'];
const ACESSOS = ['HTTPS', 'SSH', 'HTTP', 'PING', 'FMG-Access', 'SNMP', 'Security Fabric Connection', 'Speed Test', 'RADIUS Accounting', 'FTM'];

(async () => {
  const s = await lab.iniciar({ saida: SAIDA, so: args.so });
  const p = s.page;
  const saidas = {};
  const parar = (etapa) => ATE === etapa;
  // O botão "Cable organiser" do diagrama não faz parte do assunto.
  await p.addStyleTag({ content: '.tp-tool { visibility: hidden !important; }' });

  /* ---------- Atalhos ---------- */
  const no = (nome) => p.locator('.react-flow__node', { hasText: nome }).first();
  const card = (chave) => p.locator(`.ld-card[data-card="${chave}"]`).first();
  const painel = () => p.locator('.edit-pane:visible').last();
  const linha = (rotulo) => s.campo(rotulo, painel());
  const secao = (titulo) => painel().locator('.form-section-h', { hasText: new RegExp(`^\\s*${titulo}\\s*$`) }).first();
  const preencher = async (rotulo, valor) => { const i = linha(rotulo).locator('input').first(); await i.fill(''); await i.fill(String(valor)); };
  const escolher = async (rotulo, valor) => { await linha(rotulo).locator('select').first().selectOption(valor); await s.espera(250); };
  const seg = async (rotulo, opcao) => { await linha(rotulo).locator('.seg button, .seg span', { hasText: new RegExp(`^\\s*${opcao}\\s*$`) }).first().click(); await s.espera(250); };
  const marcar = async (texto, on = true) => {
    const cb = painel().locator('label', { hasText: new RegExp(`^\\s*${texto}\\s*$`) }).locator('input[type=checkbox]').first();
    if (!(await cb.count())) return;
    if ((await cb.isChecked()) !== on) await cb.click();
  };
  const soPing = async () => { for (const a of ACESSOS) await marcar(a, a === 'PING'); };
  const nenhumAcesso = async () => { for (const a of ACESSOS) await marcar(a, false); };
  const botaoPainel = (texto) => painel().locator('button', { hasText: new RegExp(`^\\s*${texto}\\s*$`) }).first();
  const ok = async () => { await botaoPainel('OK').click(); await s.espera(800); };
  const cancelar = async () => { await botaoPainel('Cancel').click(); await s.espera(600); };
  const rolarAte = async (loc) => { await loc.scrollIntoViewIfNeeded(); await s.espera(300); };
  const topoForm = (ate) => [painel().locator('.ep-h'), ate];
  const conteudo = () => p.locator('.content-scroll').first();
  const criar = (n = 0) => p.locator('.content-scroll button:visible', { hasText: /^\s*Create [Nn]ew\s*$/ }).nth(n);
  const btnEdit = () => p.locator('.content-scroll button.btn:not(.sm):visible', { hasText: /^\s*Edit\s*$/ }).first();
  const linhaInterface = (nome) => p.locator('tr:visible').filter({ has: p.locator('td', { hasText: new RegExp(`^\\s*(?:\\S+ \\()?${nome}\\)?\\s*$`) }) }).first();
  const fotoOk = async (nome, descricao) => { await s.foto(nome, { largura: FORM, recorte: [botaoPainel('OK'), botaoPainel('Cancel')], margem: 40, destaque: [botaoPainel('OK')], descricao }); };
  const toggle = async (rotulo, on = true) => {
    const t = linha(rotulo).locator('.toggle').first();
    if ((await t.evaluate((e) => e.classList.contains('on'))) !== on) await t.click();
    await s.espera(300);
  };

  /** Abre uma página pelo menu lateral, fotografando o grupo aberto com o item em destaque. */
  const menu = async (nome, grupo, item, descricao) => {
    const sub = () => p.locator('.nav-item:visible', { hasText: new RegExp(`^\\s*${item}\\s*$`) }).first();
    const g = p.locator('.nav-item:visible', { hasText: new RegExp(`^\\s*${grupo}\\s*$`) }).first();
    if (!(await sub().isVisible().catch(() => false))) { await g.click(); await s.espera(500); }
    await s.foto(nome, { recorte: [g, sub()], margem: 30, destaque: [g, sub()], descricao });
    await sub().click();
    await s.espera(900);
  };
  /** Seleciona uma linha da lista de interfaces e fotografa a linha e o botão Edit, antes de clicar nele. */
  const abrirEdicao = async (nome, foto) => {
    await s.rota('/network/interfaces');
    const l = linhaInterface(nome);
    await rolarAte(l);
    // Deixa só esta linha selecionada (um clique numa linha já selecionada tira a seleção).
    for (const outra of await p.locator('tr.sel:visible').all()) await outra.locator('td').nth(2).click();
    if (!(await l.evaluate((e) => e.classList.contains('sel')))) await l.locator('td').nth(2).click();
    await s.espera(400);
    if (foto) await s.foto(foto, { largura: LISTA, recorte: [btnEdit(), l], margem: 16, destaque: [l, btnEdit()], descricao: `${nome} selecionada na lista e o botão Edit` });
    await btnEdit().click();
    await painel().waitFor();
    await s.espera(600);
  };
  /** Um item do seletor de entradas, pelo nome exato (o alias aparece ao lado). */
  const itemSel = (sel, nome) => sel.locator('.sel-item').filter({ has: p.locator('span', { hasText: new RegExp(`^\\s*${nome}\\s*$`) }) }).first();
  /** Adiciona itens a um campo de lista (chipbox) pelo seletor de entradas; a foto mostra o seletor com os itens escolhidos. */
  const adicionarItens = async (campo, itens, foto) => {
    await campo.locator('.chip-add').first().click();
    const sel = p.locator('.slide-pane:visible').last();
    await sel.waitFor();
    // Seletor de escolha única fecha no clique: a foto vem antes. No de várias escolhas, depois.
    const unica = itens.length === 1;
    const recSel = () => [sel.locator('.sel-item').first(), ...itens.map((i) => itemSel(sel, i))];
    if (foto && unica) await s.foto(foto.nome, { recorte: recSel(), margem: 40, destaque: itens.map((i) => itemSel(sel, i)), descricao: foto.descricao });
    for (const i of itens) { await itemSel(sel, i).click(); await s.espera(200); }
    if (foto && !unica) await s.foto(foto.nome, { recorte: recSel(), margem: 40, destaque: itens.map((i) => itemSel(sel, i)), descricao: foto.descricao });
    if (!(await sel.isVisible().catch(() => false))) return;
    const fechar = sel.locator('button', { hasText: /^\s*Close\s*$/ });
    if (await fechar.count()) await fechar.click();
    await s.espera(300);
  };
  const guardarCli = async (comando, chave = comando) => {
    const antes = (await s.cli([])).length;
    const tela = await s.cli(comando);
    saidas[chave] = tela.slice(antes).trim();
  };
  /** Diagrama enquadrado com folga, para os cards das portas caberem na tela. */
  const diagrama = async () => { await s.voltar(); await s.limpo(false); await s.tela(2400, 1500); await s.enquadrar(); };
  // Janela maior só no diagrama (os cards aparecem completos); a GUI e os computadores voltam a 1920x1080.
  const abrirOrig = s.abrir;
  s.abrir = async (...a) => { await s.tela(); return abrirOrig(...a); };
  const todosNos = () => NOS.map(no);
  const todosCards = () => s.todos('.ld-card');
  /** Terminal do Windows no PC-USUARIO; a primeira vez mostra o dispositivo na topologia e o botão do Terminal. */
  let terminalAberto = false;
  const terminal = async (cmds, fotosAbertura) => {
    if (!terminalAberto && fotosAbertura) {
      await diagrama();
      await s.foto(fotosAbertura.topo, { recorte: [no('SW-CORE'), no('PC-USUARIO'), card('pc-usuario|eth0')], margem: 60, destaque: [no('PC-USUARIO'), card('pc-usuario|eth0'), { cabo: 'cabo-pc' }], descricao: 'O PC-USUARIO na topologia, ligado à porta 2 do SW-CORE, na VLAN 10' });
    }
    await s.abrir('pc-usuario');
    await s.limpo(true);
    if (!(await p.locator('.dk-win[data-app="terminal"]:visible').count())) {
      const btn = p.locator('button.dk-tb[title="Terminal"]:visible').first();
      if (!terminalAberto && fotosAbertura) await s.foto(fotosAbertura.desktop, { recorte: [btn], margem: 200, destaque: [btn], descricao: 'Área de trabalho do PC-USUARIO com o Terminal na barra de tarefas' });
      await btn.click();
      await p.locator('.dk-win[data-app="terminal"] input[aria-label="Command"]').waitFor();
    }
    terminalAberto = true;
    const cmd = p.locator('.dk-win[data-app="terminal"] input[aria-label="Command"]:visible').last();
    for (const c of [].concat(cmds)) { await cmd.fill(c); await cmd.press('Enter'); await s.espera(1500); }
  };
  const janelaTerm = () => p.locator('.dk-win[data-app="terminal"]:visible').last();

  /* ---------- Etapa A: rede da matriz ---------- */
  await s.novo({ id: 'curso-m02', nome: 'Curso – Módulo 02', site: SITE });
  await s.adicionar({ id: FGT, tipo: 'fortigate', nome: 'FGT-MTZ', x: 520, y: 160, serial: 'FG121GTK25000101' });
  await s.adicionar({ id: 'isp-a', tipo: 'isp', nome: 'Operadora A', x: 260, y: -160 });
  await s.adicionar({ id: 'isp-b', tipo: 'isp', nome: 'Operadora B', x: 820, y: -160 });
  const ispA = await p.evaluate(() => window.__cap.no('isp-a'));
  await s.patch('isp-a', { service: { ...ispA.service, gateway: '203.0.113.1', prefix: 29 } });
  await s.adicionar({ id: 'admin-pc', tipo: 'pc-windows', nome: 'ADMIN-PC', x: 40, y: 420 });
  await s.rede('admin-pc', { mode: 'static', ip: '10.10.99.10', mask: '255.255.255.0', gateway: '10.10.99.1' });
  await s.adicionar({ id: 'srv-web', tipo: 'server-linux', nome: 'SRV-WEB', x: 1100, y: 420 });
  await s.rede('srv-web', { mode: 'static', ip: '172.16.10.10', mask: '255.255.255.0', gateway: '172.16.10.1', dns: '172.16.10.1' });
  await s.adicionar({ id: 'sw-core', tipo: 'switch', nome: 'SW-CORE', x: 520, y: 470 });
  await s.adicionar({ id: 'pc-usuario', tipo: 'pc-windows', nome: 'PC-USUARIO', x: 260, y: 760 });
  await s.rede('pc-usuario', { mode: 'dhcp', vlan: 10 });
  await s.adicionar({ id: 'srv-ad', tipo: 'server-windows', nome: 'SRV-AD', x: 560, y: 760 });
  await s.rede('srv-ad', { mode: 'static', ip: '10.10.20.10', mask: '255.255.255.0', gateway: '10.10.20.1', dns: '10.10.20.1', vlan: 20 });
  await s.adicionar({ id: 'notebook-visita', tipo: 'pc-mac', nome: 'NOTEBOOK-VISITA', x: 860, y: 760 });
  await s.rede('notebook-visita', { mode: 'dhcp', vlan: 30 });
  await s.conectar([FGT, 'port1'], ['isp-a', '1'], 'cabo-wan1');
  await s.conectar([FGT, 'port2'], ['isp-b', '1'], 'cabo-wan2');
  await s.conectar([FGT, 'mgmt'], ['admin-pc', 'eth0'], 'cabo-mgmt');
  await s.conectar([FGT, 'port3'], ['srv-web', 'eth0'], 'cabo-dmz');
  await s.conectar([FGT, 'port5'], ['sw-core', '1'], 'cabo-trunk');
  await s.conectar(['sw-core', '2'], ['pc-usuario', 'eth0'], 'cabo-pc');
  await s.conectar(['sw-core', '3'], ['srv-ad', 'eth0'], 'cabo-ad');
  await s.conectar(['sw-core', '4'], ['notebook-visita', 'eth0'], 'cabo-visita');
  await s.energia([FGT, 'isp-a', 'isp-b', 'admin-pc', 'srv-web', 'sw-core', 'pc-usuario', 'srv-ad', 'notebook-visita']);
  // O nobreak e a régua de energia (criados ao ligar os equipamentos) não fazem parte do assunto: ficam ocultos no diagrama.
  const extras = (await s.nos()).filter((n) => n.kind === 'ups' || n.kind === 'power-strip');
  await p.addStyleTag({ content: extras.map((n) => `.react-flow__node[data-id="${n.id}"]`).join(', ') + ' { visibility: hidden !important; }' });
  await s.tela(2400, 1500);
  await s.enquadrar();
  await s.foto('02-0-topologia-fisica', { recorte: [...todosNos(), ...(await todosCards())], margem: 40, descricao: 'Rede da matriz da Atlas com os cabos ligados e as interfaces ainda sem configuração' });

  // Estado do fim do módulo 01: senha, assistente concluído, gerência em 10.10.99.1 e NTP próprio.
  await s.setConfig(FGT, 'sys_adminPassword', SENHA);
  await s.setConfig(FGT, 'setup_wizard', { finished: true, step: 'begin', done: ['patch', 'password', 'policy'] });
  await s.setConfig(FGT, 'featureVisibility', { dnsDatabase: true });
  await s.gui(FGT, SENHA, '/dashboard/status');
  await s.limpo(true);
  await s.cli(['config system interface', 'edit mgmt', 'set ip 10.10.99.1 255.255.255.0', 'set allowaccess ping https ssh', 'next', 'end',
    'config system global', 'set hostname FGT-MTZ', 'set admintimeout 15', 'end',
    'config system ntp', 'set type custom', 'config ntpserver', 'edit 1', 'set server a.ntp.br', 'next', 'end', 'end',
    'config system console', 'set output standard', 'end']);
  await s.fecharCli();
  if (parar('A')) return s.fim();

  /* ---------- Etapa B: propriedades da interface (WAN1) ---------- */
  await menu('02-1-menu-interfaces', 'Network', 'Interfaces', 'Menu Network > Interfaces');
  await s.foto('02-1-interfaces-1', { destaque: [conteudo()], descricao: 'Network > Interfaces com o painel de portas e a lista de interfaces' });
  const faceplate = p.locator('.fp-card:visible').first();
  await s.foto('02-1-interfaces-2', { recorte: [faceplate], margem: 12, descricao: 'Painel de portas do FortiGate 121G com as portas conectadas' });

  await abrirEdicao('port1', '02-1-wan1-0');
  await s.foto('02-1-wan1-1', { largura: FORM, recorte: topoForm(linha('Role')), margem: 16, destaque: [linha('Name'), linha('Type')], unir: true, descricao: 'Edição da port1: nome e tipo da interface' });
  await preencher('Alias', 'WAN1');
  await escolher('Role', 'WAN');
  await s.foto('02-1-wan1-2', { largura: FORM, recorte: topoForm(linha('Role')), margem: 16, destaque: [linha('Alias'), linha('Role')], unir: true, descricao: 'Alias WAN1 e role WAN na port1' });
  await seg('Addressing mode', 'Manual');
  await preencher('IP/Netmask', '203.0.113.2/255.255.255.248');
  await rolarAte(secao('Address'));
  await s.foto('02-1-wan1-3', { largura: FORM, recorte: [secao('Address'), linha('IP/Netmask')], margem: 20, destaque: [linha('Addressing mode'), linha('IP/Netmask')], unir: true, descricao: 'Endereço fixo 203.0.113.2/29 na WAN1' });
  await soPing();
  await rolarAte(secao('Administrative Access'));
  await s.foto('02-1-wan1-4', { largura: FORM, recorte: [secao('Administrative Access'), linha('IPv4')], margem: 20, destaque: [linha('IPv4')], descricao: 'Administrative Access da WAN1 só com PING' });
  const status = linha('Status');
  if (await status.count()) { await rolarAte(status); await s.foto('02-1-wan1-5', { largura: FORM, recorte: [secao('Miscellaneous'), status], margem: 20, destaque: [status], descricao: 'Status administrativo da interface' }); }
  await s.foto('02-1-wan1-6', { recorte: [painel().locator('.ep-side').getByText('Status', { exact: true }).first(), painel().locator('.ep-side').getByText('Bytes sent').first()], margem: 24, descricao: 'Painel lateral com o estado do enlace, o MAC e os contadores de tráfego da port1' });
  await fotoOk('02-1-wan1-ok', 'Botão OK do formulário da port1');
  await ok();
  const linhaWan1 = p.locator('tr:visible', { hasText: 'WAN1' }).first();
  await s.foto('02-1-wan1-7', { largura: LISTA, recorte: [p.locator('.content-scroll thead:visible').first(), p.locator('tr:visible', { hasText: /port5/ }).first()], margem: 8, destaque: [linhaWan1], descricao: 'A port1 na lista, com o alias WAN1 e o endereço 203.0.113.2' });
  if (parar('B')) return s.fim();

  /* ---------- Etapa C: WAN2 por DHCP e a tela do PPPoE ---------- */
  await abrirEdicao('port2', '02-1-wan2-0');
  await preencher('Alias', 'WAN2');
  await escolher('Role', 'WAN');
  await s.foto('02-1-wan2-a', { largura: FORM, recorte: topoForm(linha('Role')), margem: 16, destaque: [linha('Alias'), linha('Role')], unir: true, descricao: 'Alias WAN2 e role WAN na port2' });
  await seg('Addressing mode', 'DHCP');
  await nenhumAcesso();
  await rolarAte(secao('Address'));
  await s.foto('02-1-wan2-b', { largura: FORM, recorte: [secao('Address'), linha('IPv4')], margem: 20, destaque: [linha('Addressing mode'), linha('Retrieve default gateway from server'), linha('Distance'), linha('Override internal DNS'), linha('IPv4')], descricao: 'Addressing mode DHCP na WAN2, sem Administrative Access' });
  await ok();
  await abrirEdicao('port2');
  await s.espera(800);
  await rolarAte(secao('Address'));
  await s.foto('02-1-wan2-1', { largura: FORM, recorte: [secao('Address'), linha('Override internal DNS')], margem: 20, destaque: [linha('Status')], descricao: 'WAN2 reaberta: status Connected com o endereço recebido da operadora' });
  await seg('Addressing mode', 'PPPoE');
  await preencher('Username', 'atlas@operadorab');
  await preencher('Password', 'Atlas#Pppoe26');
  await s.foto('02-1-pppoe', { largura: FORM, recorte: [linha('Addressing mode'), linha('Override internal DNS')], margem: 20, destaque: [linha('Addressing mode'), linha('Username'), linha('Password')], descricao: 'Tela do modo PPPoE com usuário e senha do provedor' });
  await cancelar();
  await menu('02-1-menu-monitor', 'Dashboard', 'Network Monitor', 'Menu Dashboard > Network Monitor');
  const abaRouting = p.locator('.page-tab:visible', { hasText: /^\s*Routing\s*$/ }).first();
  await s.foto('02-1-rota-dhcp', { recorte: [abaRouting, p.locator('.content-scroll table').last()], margem: 16, destaque: [abaRouting, p.locator('tr:visible', { hasText: '0.0.0.0/0' }).first()], descricao: 'Network Monitor, aba Routing, com a rota padrão aprendida pela WAN2 por DHCP' });
  if (parar('C')) return s.fim();

  /* ---------- Etapa D: DDNS na WAN2 ---------- */
  await menu('02-1-menu-dns', 'Network', 'DNS', 'Menu Network > DNS');
  const ddnsSec = p.locator('.form-section-h:visible', { hasText: /^\s*Dynamic DNS\s*$/ }).first();
  await rolarAte(ddnsSec);
  const criarDdns = p.locator('.content-scroll button:visible', { hasText: /Create new/ }).last();
  await s.foto('02-1-ddns-1', { largura: LISTA, recorte: [ddnsSec, p.locator('.content-scroll table:visible').last()], margem: 30, destaque: [ddnsSec, criarDdns], descricao: 'Network > DNS com a seção Dynamic DNS e o botão Create new' });
  await criarDdns.click();
  await painel().waitFor();
  await s.espera(500);
  await adicionarItens(linha('Interface'), ['port2'], { nome: '02-1-ddns-sel', descricao: 'Seletor de interfaces do DDNS com a port2 (WAN2)' });
  await escolher('Server', 'fortiddns.com');
  await preencher('Unique location', 'atlas-mtz');
  await s.foto('02-1-ddns-2', { largura: FORM, recorte: [painel().locator('.ep-h'), linha('Domain')], margem: 24, destaque: [linha('Interface'), linha('Server'), linha('Unique location'), linha('Domain')], unir: true, descricao: 'Novo registro DDNS FortiGuard para a WAN2 com o nome atlas-mtz.fortiddns.com' });
  await ok();
  await s.foto('02-1-ddns-3', { largura: LISTA, recorte: [ddnsSec, p.locator('tr:visible', { hasText: 'atlas-mtz' }).first()], margem: 30, destaque: [p.locator('tr:visible', { hasText: 'atlas-mtz' }).first()], descricao: 'Registro DDNS atlas-mtz.fortiddns.com na lista, com a interface e o IP público' });
  if (parar('D')) return s.fim();

  /* ---------- Etapa D2: DMZ ---------- */
  await abrirEdicao('port3', '02-1-dmz-0');
  await preencher('Alias', 'DMZ');
  await escolher('Role', 'DMZ');
  await s.foto('02-1-dmz-1', { largura: FORM, recorte: topoForm(linha('Role')), margem: 16, destaque: [linha('Alias'), linha('Role')], unir: true, descricao: 'Alias DMZ e role DMZ na port3' });
  await seg('Addressing mode', 'Manual');
  await preencher('IP/Netmask', '172.16.10.1/255.255.255.0');
  await soPing();
  await rolarAte(secao('Address'));
  await s.foto('02-1-dmz-2', { largura: FORM, recorte: [secao('Address'), linha('IPv4')], margem: 20, destaque: [linha('IP/Netmask'), linha('IPv4')], descricao: 'Endereço 172.16.10.1/24 e PING na DMZ' });
  await ok();
  await diagrama();
  const cardsWan = [card(`${FGT}|port1`), card(`${FGT}|port2`), card(`${FGT}|port3`), card('isp-a|1'), card('isp-b|1'), card('srv-web|eth0')];
  await s.foto('02-1-topologia-wan', { recorte: [no('Operadora A'), no('Operadora B'), no('FGT-MTZ'), no('SRV-WEB'), ...cardsWan], margem: 40,
    destaque: [{ cabo: 'cabo-wan1' }, { cabo: 'cabo-wan2' }, { cabo: 'cabo-dmz' }, no('Operadora A'), no('Operadora B'), no('SRV-WEB'), ...cardsWan],
    descricao: 'Topologia: WAN1 e WAN2 ligadas às operadoras e a DMZ ligada ao SRV-WEB, com os endereços configurados' });
  await s.gui(FGT, SENHA, '/network/interfaces');
  await s.limpo(true);
  if (parar('D2')) return s.fim();

  /* ---------- Etapa E: porta interna e VLANs ---------- */
  await abrirEdicao('port5', '02-2-interna-0');
  await preencher('Alias', 'INTERNA');
  await escolher('Role', 'LAN');
  await nenhumAcesso();
  await rolarAte(secao('Address'));
  await s.foto('02-2-interna-1', { largura: FORM, recorte: [secao('Address'), linha('IPv4')], margem: 16, destaque: [linha('IP/Netmask'), linha('IPv4')], descricao: 'port5 sem endereço e sem Administrative Access: ela só transporta as VLANs' });
  await ok();
  const novaVlan = async (id, ip, fotos) => {
    await s.rota('/network/interfaces');
    await criar().click();
    await s.espera(400);
    if (fotos.menu) await s.foto(fotos.menu, { recorte: [criar(), p.locator('.menu:visible').last()], margem: 40, destaque: [criar(), p.locator('.menu-item:visible', { hasText: /^Interface$/ }).first()], descricao: 'Botão Create new e a opção Interface' });
    await p.locator('.menu-item:visible', { hasText: /^Interface$/ }).first().click();
    await painel().waitFor();
    await s.espera(500);
    await preencher('Name', `vlan${id}`);
    await escolher('Type', 'VLAN');
    await escolher('Interface', 'port5');
    await preencher('VLAN ID', String(id));
    await escolher('Role', 'LAN');
    await s.foto(fotos.form, { largura: FORM, recorte: topoForm(linha('Role')), margem: 16, destaque: [linha('Name'), linha('Type'), linha('Interface'), linha('VLAN ID'), linha('Role')], unir: true, descricao: `Nova interface vlan${id}: tipo VLAN, interface pai port5 e VLAN ID ${id}` });
    await seg('Addressing mode', 'Manual');
    await preencher('IP/Netmask', `${ip}/255.255.255.0`);
    await soPing();
    await rolarAte(secao('Address'));
    await s.foto(fotos.end, { largura: FORM, recorte: [secao('Address'), linha('IPv4')], margem: 20, destaque: [linha('IP/Netmask'), linha('Create address object matching subnet'), linha('IPv4')], descricao: `Endereço ${ip}/24 e PING na vlan${id}` });
    await ok();
  };
  await novaVlan(10, '10.10.10.1', { menu: '02-2-vlan-1', form: '02-2-vlan-2', end: '02-2-vlan-3' });
  await novaVlan(20, '10.10.20.1', { form: '02-2-vlan20-1', end: '02-2-vlan20-2' });
  await novaVlan(30, '10.10.30.1', { form: '02-2-vlan30-1', end: '02-2-vlan30-2' });
  await s.rota('/network/interfaces');
  const port5 = p.locator('tr:visible', { hasText: 'INTERNA' }).first();
  await s.foto('02-2-vlan-4', { largura: LISTA, recorte: [port5, p.locator('tr:visible', { hasText: 'vlan30' }).first()], margem: 50, destaque: [port5, p.locator('tr:visible', { hasText: 'vlan10' }).first(), p.locator('tr:visible', { hasText: 'vlan20' }).first(), p.locator('tr:visible', { hasText: 'vlan30' }).first()], unir: true, descricao: 'As VLANs 10, 20 e 30 abaixo da interface pai port5 (INTERNA)' });
  await diagrama();
  const cardsVlan = [card(`${FGT}|port5`), card('sw-core|segment'), card('pc-usuario|eth0'), card('srv-ad|eth0'), card('notebook-visita|eth0')];
  await s.foto('02-2-topologia', { recorte: [no('FGT-MTZ'), no('SW-CORE'), no('PC-USUARIO'), no('SRV-AD'), no('NOTEBOOK-VISITA'), ...cardsVlan], margem: 40,
    destaque: [{ cabo: 'cabo-trunk' }, { cabo: 'cabo-pc' }, { cabo: 'cabo-ad' }, { cabo: 'cabo-visita' }, no('SW-CORE'), no('PC-USUARIO'), no('SRV-AD'), no('NOTEBOOK-VISITA'), ...cardsVlan],
    descricao: 'O cabo entre a port5 e o SW-CORE leva as VLANs 10, 20 e 30 (trunk); cada computador está em uma VLAN' });
  await s.gui(FGT, SENHA, '/network/interfaces');
  await s.limpo(true);
  if (parar('E')) return s.fim();

  /* ---------- Etapa F: zone ---------- */
  await criar().click();
  await s.espera(400);
  await s.foto('02-3-zone-0', { recorte: [criar(), p.locator('.menu:visible').last()], margem: 40, destaque: [criar(), p.locator('.menu-item:visible', { hasText: /^Zone$/ }).first()], descricao: 'Botão Create new e a opção Zone' });
  await p.locator('.menu-item:visible', { hasText: /^Zone$/ }).first().click();
  await painel().waitFor();
  await preencher('Name', 'INTERNAS');
  await toggle('Block intra-zone traffic', true);
  await adicionarItens(linha('Interface members'), ['vlan10', 'vlan20'], { nome: '02-3-zone-sel', descricao: 'Seletor de interfaces com vlan10 e vlan20 escolhidas' });
  await s.foto('02-3-zone-1', { largura: FORM, recorte: topoForm(linha('Interface members')), margem: 24, destaque: [linha('Name'), linha('Block intra-zone traffic'), linha('Interface members')], unir: true, descricao: 'Nova zone INTERNAS com as interfaces vlan10 e vlan20' });
  await ok();
  const linhaZona = p.locator('tr:visible', { hasText: 'INTERNAS' }).first();
  await rolarAte(linhaZona);
  await s.foto('02-3-zone-2', { largura: LISTA, recorte: [linhaZona], margem: 60, destaque: [linhaZona], descricao: 'A zone INTERNAS na lista, com as VLANs 10 e 20 como membros' });
  if (parar('F')) return s.fim();

  /* ---------- Etapa G: outros tipos de interface (sem salvar) ---------- */
  const novaInterface = async (tipo) => {
    await criar().click();
    await p.locator('.menu-item:visible', { hasText: /^Interface$/ }).first().click();
    await painel().waitFor();
    await s.espera(400);
    await escolher('Type', tipo);
  };
  await novaInterface('Software Switch');
  await preencher('Name', 'sw-lab');
  await adicionarItens(linha('Interface members'), ['port10', 'port11']);
  await s.foto('02-3-software-switch', { largura: FORM, recorte: topoForm(linha('Interface members')), margem: 24, destaque: [linha('Type'), linha('Interface members')], unir: true, descricao: 'Formulário de software switch com as portas port10 e port11' });
  await cancelar();
  await novaInterface('802.3ad Aggregate');
  await preencher('Name', 'agg-srv');
  await adicionarItens(linha('Interface members'), ['port15', 'port16']);
  await s.foto('02-3-aggregate', { largura: FORM, recorte: topoForm(linha('Interface members')), margem: 24, destaque: [linha('Type'), linha('Interface members')], unir: true, descricao: 'Formulário de agregação 802.3ad com as portas port15 e port16' });
  await cancelar();
  await novaInterface('Redundant Interface');
  await preencher('Name', 'red-srv');
  await adicionarItens(linha('Interface members'), ['port15', 'port16']);
  await s.foto('02-3-redundante', { largura: FORM, recorte: topoForm(linha('Interface members')), margem: 24, destaque: [linha('Type'), linha('Interface members')], unir: true, descricao: 'Formulário de interface redundante com as portas port15 e port16' });
  await cancelar();
  if (parar('G')) return s.fim();

  /* ---------- Etapa H: loopback e endereço secundário ---------- */
  await novaInterface('Loopback Interface');
  await preencher('Name', 'loop-ger');
  await preencher('IP/Netmask', '10.10.255.1/255.255.255.255');
  await soPing();
  await s.foto('02-3-loopback', { largura: FORM, recorte: [painel().locator('.ep-h'), linha('IPv4')], margem: 20, destaque: [linha('Name'), linha('Type'), linha('IP/Netmask'), linha('IPv4')], descricao: 'Nova interface loopback loop-ger com o endereço 10.10.255.1/32' });
  await ok();
  await s.rota('/network/interfaces');
  const linhaLoop = p.locator('tr:visible', { hasText: 'loop-ger' }).first();
  await rolarAte(linhaLoop);
  await s.foto('02-3-loopback-lista', { largura: LISTA, recorte: [linhaLoop], margem: 60, destaque: [linhaLoop], descricao: 'A loopback loop-ger na lista de interfaces' });
  await abrirEdicao('port3', '02-3-secundario-0');
  await toggle('Secondary IP address');
  const sec = painel().locator('.frow:visible').filter({ has: p.locator('.flabel', { hasText: /^\s*IP\/Netmask\s*$/ }) }).nth(1);
  await sec.locator('input').first().fill('172.16.11.1/255.255.255.0');
  await rolarAte(secao('Address'));
  await s.foto('02-3-secundario', { largura: FORM, recorte: [secao('Address'), sec], margem: 20, destaque: [linha('Secondary IP address'), sec], unir: true, descricao: 'Endereço secundário 172.16.11.1/24 na interface DMZ (port3)' });
  await cancelar();
  if (parar('H')) return s.fim();

  /* ---------- Etapa I: rota padrão e a disputa com a rota do DHCP ---------- */
  await menu('02-4-menu-rotas', 'Network', 'Static Routes', 'Menu Network > Static Routes');
  await s.foto('02-4-rota-0', { largura: LISTA, recorte: [criar(), p.locator('.content-scroll thead:visible').first()], margem: 24, destaque: [criar()], descricao: 'Network > Static Routes, ainda vazia, e o botão Create new' });
  await criar().click();
  await painel().waitFor();
  await s.espera(400);
  await seg('Destination', 'Subnet');
  await painel().locator('.frow:visible').filter({ has: p.locator('.flabel', { hasText: /^\s*$/ }) }).first().locator('input').first().fill('0.0.0.0/0.0.0.0');
  await adicionarItens(linha('Interface'), ['port1'], { nome: '02-4-rota-sel', descricao: 'Seletor de interfaces da rota com a port1 (WAN1)' });
  await linha('Gateway Address').locator('input').last().fill('203.0.113.1');
  await s.foto('02-4-rota-1', { largura: FORM, recorte: [painel().locator('.ep-h'), linha('Administrative Distance')], margem: 24, destaque: [linha('Destination'), linha('Interface'), linha('Gateway Address'), linha('Administrative Distance')], unir: true, descricao: 'Nova rota estática 0.0.0.0/0 pela WAN1 (port1) com gateway 203.0.113.1 e distância 10' });
  const avancadoRota = painel().getByText('Advanced Options', { exact: false }).first();
  if (await avancadoRota.count()) {
    await avancadoRota.click().catch(() => {});
    await s.espera(400);
    if (await linha('Priority').count()) { await rolarAte(linha('Priority')); await s.foto('02-4-rota-prioridade', { largura: FORM, recorte: [avancadoRota, linha('Priority')], margem: 24, destaque: [linha('Priority')], descricao: 'Advanced Options da rota estática com o campo Priority' }); }
  }
  await ok();
  await s.foto('02-4-rota-2', { largura: LISTA, recorte: [p.locator('.content-scroll thead:visible').first(), p.locator('tr:visible', { hasText: '203.0.113.1' }).first()], margem: 16, destaque: [p.locator('tr:visible', { hasText: '203.0.113.1' }).first()], descricao: 'A rota padrão pela WAN1 na lista de rotas estáticas' });
  await s.rota('/dashboard/network-monitor');
  await s.foto('02-4-rotas-antes', { recorte: [p.locator('.content-scroll table').last()], margem: 16, destaque: [p.locator('tr:visible', { hasText: '0.0.0.0/0' }).first()], descricao: 'Tabela de rotas: a rota padrão ativa ainda é a da WAN2, aprendida por DHCP com distância 5' });
  await guardarCli('get router info routing-table all', 'rotas-antes');
  await s.fecharCli();
  await abrirEdicao('port2', '02-4-wan2-0');
  await preencher('Distance', '20');
  await rolarAte(secao('Address'));
  await s.foto('02-4-wan2-distancia', { largura: FORM, recorte: [secao('Address'), linha('Override internal DNS')], margem: 20, destaque: [linha('Distance')], descricao: 'Distância da rota recebida por DHCP na WAN2 alterada para 20' });
  await ok();
  await s.rota('/dashboard/network-monitor');
  await s.foto('02-4-rotas-depois', { recorte: [p.locator('.content-scroll table').last()], margem: 16, destaque: [p.locator('tr:visible', { hasText: '0.0.0.0/0' }).first()], descricao: 'Tabela de rotas: agora a rota padrão ativa é a da WAN1, com distância 10' });
  // Abrindo a CLI Console pela barra superior
  const btnCli = p.locator('header.banner button[title="CLI"]:visible').first();
  await btnCli.click();
  await s.espera(400);
  const opCli = p.getByText('CLI Console', { exact: true }).first();
  await s.foto('02-4-cli-0', { recorte: [btnCli, opCli], margem: 40, destaque: [btnCli, opCli], descricao: 'Botão da CLI na barra superior e a opção CLI Console' });
  await opCli.click();
  await p.locator('.cli-modal .cli-screen').last().waitFor();
  await guardarCli('get router info routing-table all', 'rotas-depois');
  await guardarCli('execute ping 8.8.8.8', 'ping');
  await guardarCli('execute ping-options source 10.10.10.1', 'ping-options');
  await guardarCli('execute ping 8.8.8.8', 'ping-origem');
  await guardarCli('execute ping-options reset', 'ping-reset');
  await guardarCli('execute traceroute 8.8.8.8', 'traceroute');
  await s.foto('02-4-ping', { recorte: [p.locator('.cli-modal .cli-frame')], margem: 10, descricao: 'Ping e traceroute a partir do FortiGate na CLI Console' });
  await s.fecharCli();
  if (parar('I')) return s.fim();

  /* ---------- Etapa J: DHCP server ---------- */
  const dhcp = async (intf, faixa, dns, fotos) => {
    await abrirEdicao(intf, fotos.abrir);
    const dhcpSec = painel().locator('.form-section-h', { hasText: /DHCP Server/ }).first();
    await rolarAte(dhcpSec);
    const dhcpToggle = dhcpSec.locator('.toggle').first();
    if (fotos.toggle) await s.foto(fotos.toggle, { largura: FORM, recorte: [linha('IPv4'), dhcpSec], margem: 30, destaque: [dhcpSec], descricao: `Seção DHCP Server da ${intf}, ainda desligada` });
    if (!(await dhcpToggle.evaluate((e) => e.classList.contains('on')))) await dhcpToggle.click();
    await s.espera(500);
    const faixaInput = linha('Address range').locator('input').first();
    if (await faixaInput.count()) { await faixaInput.fill(faixa); await faixaInput.press('Enter').catch(() => {}); }
    await seg('DNS server', dns);
    await rolarAte(dhcpSec);
    await s.foto(fotos.form, { largura: FORM, recorte: [dhcpSec, linha('Lease time')], margem: 20, destaque: [linha('Address range'), linha('Netmask'), linha('Default gateway'), linha('DNS server'), linha('Lease time')], unir: true, descricao: `DHCP Server da ${intf}: faixa ${faixa}` });
    if (fotos.avancado) {
      const avancado = painel().getByText('Advanced', { exact: true }).first();
      await rolarAte(avancado);
      await s.foto(`${fotos.avancado}-0`, { largura: FORM, recorte: [linha('Lease time'), avancado], margem: 30, destaque: [avancado], descricao: 'Link Advanced do DHCP Server' });
      await avancado.click();
      await s.espera(400);
      await rolarAte(linha('Mode'));
      await s.foto(fotos.avancado, { largura: FORM, recorte: [linha('Mode'), linha('IP Address Assignment Rules')], margem: 20, destaque: [linha('Mode'), linha('NTP server'), linha('Additional DHCP Options'), linha('IP Address Assignment Rules')], descricao: 'Opções avançadas do DHCP Server' });
    }
    await ok();
  };
  await dhcp('vlan10', '10.10.10.100-10.10.10.200', 'Same as Interface IP', { abrir: '02-5-dhcp-0', toggle: '02-5-dhcp-toggle', form: '02-5-dhcp-1', avancado: '02-5-dhcp-2' });
  await dhcp('vlan30', '10.10.30.100-10.10.30.200', 'Same as System DNS', { abrir: '02-5-dhcp-vlan30-0', form: '02-5-dhcp-vlan30' });
  // Relay: a tela, sem salvar
  await abrirEdicao('vlan30');
  const dhcpSec30 = painel().locator('.form-section-h', { hasText: /DHCP Server/ }).first();
  await rolarAte(dhcpSec30);
  const avancado30 = painel().getByText('Advanced', { exact: true }).first();
  if (await avancado30.count()) await avancado30.click();
  if (await linha('Mode').count()) {
    await seg('Mode', 'Relay');
    const ipRelay = linha('DHCP Server IP').locator('input').first();
    if (await ipRelay.count()) await ipRelay.fill('10.10.20.10');
    await rolarAte(linha('Mode'));
    await s.foto('02-5-relay', { largura: FORM, recorte: [linha('Mode'), linha('DHCP Server IP')], margem: 30, destaque: [linha('Mode'), linha('DHCP Server IP')], unir: true, descricao: 'DHCP no modo Relay, encaminhando os pedidos ao servidor 10.10.20.10' });
  }
  await cancelar();
  // O PC da VLAN 10 pede um endereço
  await terminal(['ipconfig /renew', 'cls', 'ipconfig /all'], { topo: '02-5-pc-topo', desktop: '02-5-pc-desktop' });
  await s.foto('02-5-pc-ipconfig', { recorte: [janelaTerm()], margem: 8, descricao: 'ipconfig /all no PC-USUARIO: endereço 10.10.10.100, gateway e DNS 10.10.10.1 recebidos por DHCP' });
  await terminal(['cls', 'ping 10.10.10.1', 'ping 8.8.8.8']);
  await s.foto('02-4-pc-ping', { recorte: [janelaTerm()], margem: 8, descricao: 'Ping do PC-USUARIO: responde o gateway 10.10.10.1, mas não a Internet, porque ainda não há firewall policy' });
  await s.gui(FGT, SENHA, '/dashboard/status');
  await s.limpo(true);
  await menu('02-5-menu-assets', 'Dashboard', 'Asset and Identities', 'Menu Dashboard > Asset and Identities');
  const abaDhcp = p.locator('.page-tab:visible', { hasText: /^\s*DHCP\s*$/ }).first();
  await abaDhcp.click();
  await s.espera(600);
  await s.foto('02-5-leases', { destaque: [abaDhcp, conteudo().locator('table').last()], descricao: 'Asset and Identities, aba DHCP, com os leases do PC-USUARIO e do NOTEBOOK-VISITA' });
  const lease = p.locator('tr:visible', { hasText: '10.10.10.100' }).first();
  if (await lease.count()) {
    await lease.click({ button: 'right' });
    await s.espera(400);
    const ctx = p.locator('.menu:visible').last();
    if (await ctx.count()) {
      const item = ctx.locator('.menu-item', { hasText: /Reservation/ }).first();
      await s.foto('02-5-reserva', { recorte: [ctx], margem: 90, destaque: [lease, item], descricao: 'Menu do botão direito no lease, com Create DHCP Reservation' });
      await p.keyboard.press('Escape');
    }
  }
  await guardarCli('execute dhcp lease-list', 'lease-list');
  await guardarCli('show system dhcp server', 'dhcp-server');
  await s.fecharCli();
  if (parar('J')) return s.fim();

  /* ---------- Etapa K: DNS server e DNS database ---------- */
  await menu('02-6-menu-dns-servers', 'Network', 'DNS Servers', 'Menu Network > DNS Servers');
  await s.foto('02-6-dns-servers-0', { largura: LISTA, recorte: [p.locator('.content-scroll').first().getByText('DNS Service on Interface').first(), p.locator('.content-scroll table:visible').last()], margem: 30, destaque: [criar(0)], descricao: 'Network > DNS Servers: as seções DNS Service on Interface e DNS Database, e o Create New do serviço' });
  await criar(0).click();
  await painel().waitFor();
  await escolher('Interface', 'vlan10');
  await escolher('Mode', 'Recursive');
  await s.foto('02-6-dns-servico', { recorte: [painel().locator('.ep-h'), linha('Mode')], margem: 30, destaque: [linha('Interface'), linha('Mode')], unir: true, descricao: 'Serviço DNS na vlan10 no modo Recursive' });
  await ok();
  await s.foto('02-6-dns-database-0', { largura: LISTA, recorte: [p.locator('.content-scroll').first().getByText('DNS Service on Interface').first(), p.locator('.content-scroll table:visible').last()], margem: 30, destaque: [conteudo().locator('tr:visible', { hasText: 'vlan10' }).first(), criar(1)], descricao: 'O serviço DNS da vlan10 criado e o Create New da seção DNS Database' });
  await criar(1).click();
  await painel().waitFor();
  await seg('Type', 'Primary');
  await seg('View', 'Shadow');
  await preencher('DNS Zone', 'atlas-local');
  await preencher('Domain Name', 'atlas.local');
  await s.foto('02-6-dns-zona-1', { largura: FORM, recorte: [painel().locator('.ep-h'), linha('Domain Name')], margem: 24, destaque: [linha('Type'), linha('View'), linha('DNS Zone'), linha('Domain Name')], unir: true, descricao: 'Nova zona: Primary, Shadow, atlas-local, atlas.local' });
  const entradas = painel().locator('.form-section-h', { hasText: /DNS Entries/ }).first();
  const novaEntrada = async (host, ip, fotoBotao) => {
    await rolarAte(entradas);
    const b = painel().locator('button:visible', { hasText: /Create/ }).last();
    if (fotoBotao) await s.foto(fotoBotao, { largura: FORM, recorte: [entradas, b], margem: 40, destaque: [b], descricao: 'Botão Create New da seção DNS Entries' });
    await b.click();
    const dlg = p.locator('.net-modal:visible').last();
    await dlg.waitFor();
    await s.campo('Hostname', dlg).locator('input').first().fill(host);
    await s.campo('IP Address', dlg).locator('input').first().fill(ip);
    return dlg;
  };
  const dlg1 = await novaEntrada('srv-ad', '10.10.20.10', '02-6-dns-entrada-0');
  await s.foto('02-6-dns-registro', { recorte: [dlg1], margem: 12, destaque: [s.campo('Type', dlg1), s.campo('Hostname', dlg1), s.campo('IP Address', dlg1)], descricao: 'Registro A srv-ad.atlas.local apontando para 10.10.20.10' });
  await dlg1.locator('button', { hasText: /^\s*OK\s*$/ }).click();
  const dlg2 = await novaEntrada('intranet', '172.16.10.10');
  await s.foto('02-6-dns-registro-2', { recorte: [dlg2], margem: 12, destaque: [s.campo('Hostname', dlg2), s.campo('IP Address', dlg2)], descricao: 'Registro A intranet.atlas.local apontando para 172.16.10.10' });
  await dlg2.locator('button', { hasText: /^\s*OK\s*$/ }).click();
  await s.espera(400);
  await rolarAte(entradas);
  await s.foto('02-6-dns-zona', { largura: FORM, recorte: [entradas, painel().locator('tr:visible', { hasText: '172.16.10.10' }).first()], margem: 24, destaque: [painel().locator('tr:visible', { hasText: '10.10.20.10' }).first(), painel().locator('tr:visible', { hasText: '172.16.10.10' }).first()], unir: true, descricao: 'Os registros srv-ad e intranet na zona atlas.local' });
  await ok();
  await s.foto('02-6-dns-servers', { largura: LISTA, recorte: [p.locator('.content-scroll').first().getByText('DNS Service on Interface').first(), p.locator('.content-scroll table:visible').last()], margem: 30, destaque: [conteudo().locator('tr:visible', { hasText: 'vlan10' }).first(), conteudo().locator('tr:visible', { hasText: 'atlas.local' }).first()], descricao: 'Network > DNS Servers com o serviço DNS da vlan10 e a zona atlas.local' });
  // O PC usa o FortiGate como DNS
  await terminal(['cls', 'nslookup srv-ad.atlas.local', 'nslookup www.google.com']);
  await s.foto('02-6-pc-nslookup', { recorte: [janelaTerm()], margem: 8, descricao: 'nslookup no PC-USUARIO respondido pelo FortiGate (10.10.10.1): o nome interno e um nome da Internet' });
  if (parar('K')) return s.fim();

  /* ---------- Etapa L: NTP server ---------- */
  await s.gui(FGT, SENHA, '/dashboard/status');
  await s.limpo(true);
  await menu('02-6-menu-settings', 'System', 'Settings', 'Menu System > Settings');
  const ntpToggle = s.campo('Setup device as local NTP server').locator('.toggle').first();
  if (!(await ntpToggle.evaluate((e) => e.classList.contains('on')))) await ntpToggle.click();
  await s.espera(400);
  const ntpIntf = s.campo('Listen on interfaces');
  await adicionarItens(ntpIntf, ['vlan10', 'vlan20'], { nome: '02-6-ntp-sel', descricao: 'Seletor de interfaces do servidor NTP com vlan10 e vlan20' });
  await rolarAte(s.campo('Setup device as local NTP server'));
  await s.foto('02-6-ntp', { largura: FORM, recorte: [s.campo('Set time'), ntpIntf], margem: 24, destaque: [s.campo('Set time'), s.campo('Select server'), s.campo('Server'), s.campo('Setup device as local NTP server'), ntpIntf], descricao: 'System > Settings: o FGT-MTZ sincronizado com a.ntp.br e como servidor NTP nas interfaces vlan10 e vlan20' });
  const aplicar = s.botao('Apply');
  await rolarAte(aplicar);
  await s.foto('02-6-ntp-apply', { largura: FORM, recorte: [aplicar], margem: 60, destaque: [aplicar], descricao: 'Botão Apply de System > Settings' });
  await aplicar.click().catch(() => {});
  await s.espera(800);
  await guardarCli('show system ntp', 'ntp');
  await guardarCli('show system interface vlan10', 'vlan10');
  await guardarCli('show system zone', 'zone');
  await guardarCli('get system interface physical', 'interface-physical');
  await guardarCli('show system dns-server', 'dns-server');
  await s.fecharCli();

  /* ---------- Topologia final ---------- */
  await diagrama();
  await s.foto('02-0-topologia', { recorte: [...todosNos(), ...(await todosCards())], margem: 40, descricao: 'Topologia do módulo 02: WAN1 e WAN2, DMZ, VLANs 10, 20 e 30 no SW-CORE e a gerência' });

  fs.writeFileSync(path.join(SAIDA, 'saidas-cli.json'), `${JSON.stringify(saidas, null, 2)}\n`);
  await s.fim();
})().catch((e) => { console.error(e); process.exit(1); });
