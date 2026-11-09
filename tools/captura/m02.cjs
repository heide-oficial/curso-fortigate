#!/usr/bin/env node
/*
 * Imagens do módulo 02 — Interfaces e serviços de rede.
 *
 * Uso: node tools/captura/m02.cjs [--saida midia/m02] [--ate <etapa>] [--so arquivo1,arquivo2]
 * Requer o laboratório em modo de desenvolvimento (npm run dev no fortigate-clone, porta 5173).
 *
 * Monta a rede da matriz da Atlas a partir do estado do fim do módulo 01 e configura, pela GUI, o que o
 * módulo ensina: WAN1 fixa, WAN2 por DHCP (e a tela do PPPoE), DDNS, VLANs, zone, tipos de interface,
 * loopback, rotas, DHCP, DNS server e NTP server. Também grava em saidas-cli.json as saídas dos comandos
 * usados no Guia de comandos CLI.
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

(async () => {
  const s = await lab.iniciar({ saida: SAIDA, so: args.so });
  const p = s.page;
  const saidas = {};
  const parar = (etapa) => ATE === etapa;

  /* ---------- Atalhos ---------- */
  const no = (nome) => p.locator('.react-flow__node', { hasText: nome }).first();
  const painel = () => p.locator('.edit-pane:visible').last();
  const form = () => painel().locator('.ep-main');
  const linha = (rotulo) => s.campo(rotulo, painel());
  const secao = (titulo) => painel().locator('.form-section-h', { hasText: new RegExp(`^\\s*${titulo}\\s*$`) }).first();
  const preencher = async (rotulo, valor) => { const i = linha(rotulo).locator('input').first(); await i.fill(''); await i.fill(String(valor)); };
  const escolher = async (rotulo, valor) => { await linha(rotulo).locator('select').first().selectOption(valor); await s.espera(250); };
  const seg = async (rotulo, opcao) => { await linha(rotulo).locator('.seg button, .seg span', { hasText: new RegExp(`^\\s*${opcao}\\s*$`) }).first().click(); await s.espera(250); };
  const marcar = async (texto, on = true) => {
    const cb = painel().locator('label', { hasText: new RegExp(`^\\s*${texto}\\s*$`) }).locator('input[type=checkbox]').first();
    if ((await cb.isChecked()) !== on) await cb.click();
  };
  const toggle = async (rotulo, on = true) => {
    const t = linha(rotulo).locator('.toggle').first();
    if ((await t.evaluate((e) => e.classList.contains('on'))) !== on) await t.click();
    await s.espera(300);
  };
  const ok = async () => { await painel().locator('button', { hasText: /^\s*OK\s*$/ }).first().click(); await s.espera(800); };
  const cancelar = async () => { await painel().locator('button', { hasText: /^\s*Cancel\s*$/ }).first().click(); await s.espera(600); };
  const rolarAte = async (loc) => { await loc.scrollIntoViewIfNeeded(); await s.espera(300); };
  const topoForm = (ate) => [painel().locator('.ep-h'), ate];
  /** Abre a edição de uma interface pela lista de Network > Interfaces. */
  const editarInterface = async (nome) => {
    await s.rota('/network/interfaces');
    const busca = p.locator('.content-scroll input[placeholder="Search"]:visible').first();
    await busca.fill(nome);
    await s.espera(400);
    await p.locator('td:visible', { hasText: new RegExp(`^\\s*(?:\\S+ \\()?${nome}\\)?\\s*$`) }).first().dblclick();
    await painel().waitFor();
    await s.espera(500);
  };
  const limparBusca = async () => { const b = p.locator('.content-scroll input[placeholder="Search"]:visible').first(); if (await b.count()) await b.fill(''); await s.espera(300); };
  /** Um item do seletor de entradas, pelo nome exato (o alias aparece ao lado). */
  const itemSel = (sel, nome) => sel.locator('.sel-item').filter({ has: p.locator('span', { hasText: new RegExp(`^\\s*${nome}\\s*$`) }) }).first();
  /** Adiciona itens a um campo de lista (chipbox) pelo seletor de entradas. */
  const adicionarItens = async (rotulo, itens) => {
    await linha(rotulo).locator('.chip-add').first().click();
    const sel = p.locator('.slide-pane:visible').last();
    await sel.waitFor();
    for (const i of itens) { await itemSel(sel, i).click(); await s.espera(200); }
    await sel.locator('button', { hasText: /^\s*Close\s*$/ }).click();
    await s.espera(300);
  };
  const guardarCli = async (comando, chave = comando) => {
    const antes = (await s.cli([])).length;
    const tela = await s.cli(comando);
    saidas[chave] = tela.slice(antes).trim();
  };

  /* ---------- Etapa A: rede da matriz ---------- */
  await s.novo({ id: 'curso-m02', nome: 'Curso – Módulo 02', site: SITE });
  await s.adicionar({ id: FGT, tipo: 'fortigate', nome: 'FGT-MTZ', x: 520, y: 160, serial: 'FG121GTK25000101' });
  await s.adicionar({ id: 'isp-a', tipo: 'isp', nome: 'Operadora A', x: 260, y: -160 });
  await s.adicionar({ id: 'isp-b', tipo: 'isp', nome: 'Operadora B', x: 820, y: -160 });
  const ispA = await p.evaluate(() => window.__cap.no('isp-a'));
  await s.patch('isp-a', { service: { ...ispA.service, gateway: '203.0.113.1', prefix: 29 } });
  await s.adicionar({ id: 'admin-pc', tipo: 'pc-windows', nome: 'ADMIN-PC', x: 40, y: 420 });
  await s.rede('admin-pc', { mode: 'static', ip: '10.10.99.10', mask: '255.255.255.0', gateway: '10.10.99.1' });
  await s.adicionar({ id: 'srv-web', tipo: 'server-linux', nome: 'SRV-WEB', x: 1020, y: 420 });
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
  await s.enquadrar();
  await s.foto('02-0-topologia-fisica', { recorte: NOS.map(no), margem: 70, descricao: 'Rede da matriz da Atlas com os cabos ligados e as interfaces ainda sem configuração' });

  // Estado do fim do módulo 01: senha, assistente concluído, gerência em 10.10.99.1 e NTP próprio.
  await s.setConfig(FGT, 'sys_adminPassword', SENHA);
  await s.setConfig(FGT, 'setup_wizard', { finished: true, step: 'begin', done: ['patch', 'password', 'policy'] });
  await s.gui(FGT, SENHA, '/dashboard/status');
  await s.limpo(true);
  await s.cli(['config system interface', 'edit mgmt', 'set ip 10.10.99.1 255.255.255.0', 'set allowaccess ping https ssh', 'next', 'end',
    'config system global', 'set hostname FGT-MTZ', 'set admintimeout 15', 'end',
    'config system ntp', 'set type custom', 'config ntpserver', 'edit 1', 'set server a.ntp.br', 'next', 'end', 'end',
    'config system console', 'set output standard', 'end']);
  await s.fecharCli();
  if (parar('A')) return s.fim();

  /* ---------- Etapa B: propriedades da interface (WAN1) ---------- */
  await s.rota('/network/interfaces');
  await s.foto('02-1-interfaces-1', { destaque: [p.locator('.content-scroll').first()], descricao: 'Network > Interfaces com o painel de portas e a lista de interfaces' });
  const faceplate = p.locator('.fp-card:visible').first();
  await s.foto('02-1-interfaces-2', { recorte: [faceplate], margem: 12, descricao: 'Painel de portas do FortiGate 121G com as portas conectadas' });

  await editarInterface('port1');
  await s.foto('02-1-wan1-1', { largura: FORM, recorte: topoForm(linha('Role')), margem: 16, destaque: [linha('Name'), linha('Type')], unir: true, descricao: 'Edição da port1: nome e tipo da interface' });
  await preencher('Alias', 'WAN1');
  await escolher('Role', 'WAN');
  await s.foto('02-1-wan1-2', { largura: FORM, recorte: topoForm(linha('Role')), margem: 16, destaque: [linha('Alias'), linha('Role')], unir: true, descricao: 'Alias WAN1 e role WAN na port1' });
  await seg('Addressing mode', 'Manual');
  await preencher('IP/Netmask', '203.0.113.2/255.255.255.248');
  await rolarAte(secao('Address'));
  await s.foto('02-1-wan1-3', { largura: FORM, recorte: [secao('Address'), linha('IP/Netmask')], margem: 20, destaque: [linha('Addressing mode'), linha('IP/Netmask')], unir: true, descricao: 'Endereço fixo 203.0.113.2/29 na WAN1' });
  for (const a of ['HTTPS', 'SSH', 'HTTP', 'FMG-Access', 'SNMP', 'Security Fabric Connection']) await marcar(a, false);
  await marcar('PING', true);
  await rolarAte(secao('Administrative Access'));
  await s.foto('02-1-wan1-4', { largura: FORM, recorte: [secao('Administrative Access'), linha('IPv4')], margem: 20, destaque: [linha('IPv4')], descricao: 'Administrative Access da WAN1 só com PING' });
  const status = linha('Status');
  if (await status.count()) { await rolarAte(status); await s.foto('02-1-wan1-5', { largura: FORM, recorte: [secao('Miscellaneous'), status], margem: 20, destaque: [status], descricao: 'Status administrativo da interface' }); }
  await s.foto('02-1-wan1-6', { recorte: [painel().locator('.ep-side').getByText('Status', { exact: true }).first(), painel().locator('.ep-side').getByText('Bytes sent').first()], margem: 24, descricao: 'Painel lateral com o estado do enlace, o MAC e os contadores de tráfego da port1' });
  await ok();
  await limparBusca();
  const linhaWan1 = p.locator('tr:visible', { hasText: 'WAN1' }).first();
  await s.foto('02-1-wan1-7', { largura: LISTA, recorte: [p.locator('.content-scroll thead:visible').first(), p.locator('tr:visible', { hasText: /port5/ }).first()], margem: 8, destaque: [linhaWan1], descricao: 'A port1 na lista, com o alias WAN1 e o endereço 203.0.113.2' });
  if (parar('B')) return s.fim();

  /* ---------- Etapa C: WAN2 por DHCP e a tela do PPPoE ---------- */
  await editarInterface('port2');
  await preencher('Alias', 'WAN2');
  await escolher('Role', 'WAN');
  for (const a of ['HTTPS', 'SSH', 'HTTP', 'PING', 'FMG-Access', 'SNMP', 'Security Fabric Connection']) await marcar(a, false);
  await seg('Addressing mode', 'DHCP');
  await ok();
  await editarInterface('port2');
  await s.espera(800);
  await rolarAte(secao('Address'));
  await s.foto('02-1-wan2-1', { largura: FORM, recorte: [secao('Address'), linha('Override internal DNS')], margem: 20, destaque: [linha('Addressing mode'), linha('Status'), linha('Retrieve default gateway from server'), linha('Distance')], unir: true, descricao: 'WAN2 como cliente DHCP: endereço recebido, rota padrão e distância 5' });
  await seg('Addressing mode', 'PPPoE');
  await preencher('Username', 'atlas@operadorab');
  await preencher('Password', 'Atlas#Pppoe26');
  await s.foto('02-1-pppoe', { largura: FORM, recorte: [linha('Addressing mode'), linha('Override internal DNS')], margem: 20, destaque: [linha('Username'), linha('Password')], unir: true, descricao: 'Tela do modo PPPoE com usuário e senha do provedor' });
  await cancelar();
  await limparBusca();
  await s.rota('/dashboard/network-monitor');
  await s.foto('02-1-rota-dhcp', { recorte: [p.locator('.content-scroll table').last()], margem: 16, destaque: [p.locator('tr:visible', { hasText: '0.0.0.0/0' }).first()], descricao: 'Network Monitor > Routing com a rota padrão aprendida pela WAN2 por DHCP' });
  if (parar('C')) return s.fim();

  /* ---------- Etapa D: DDNS na WAN2 ---------- */
  await s.rota('/network/dns');
  const ddnsSec = p.locator('.form-section-h:visible', { hasText: /^\s*Dynamic DNS\s*$/ }).first();
  await rolarAte(ddnsSec);
  await s.foto('02-1-ddns-1', { destaque: [ddnsSec, p.locator('.content-scroll button:visible', { hasText: /Create new/ }).last()], unir: true, descricao: 'Network > DNS com a seção Dynamic DNS' });
  await p.locator('.content-scroll button:visible', { hasText: /Create new/ }).last().click();
  await painel().waitFor();
  await s.espera(500);
  await linha('Interface').locator('.chip-add').first().click();
  const selDdns = p.locator('.slide-pane:visible').last();
  await itemSel(selDdns, 'port2').click();
  await s.espera(400);
  await escolher('Server', 'fortiddns.com');
  await preencher('Unique location', 'atlas-mtz');
  await s.foto('02-1-ddns-2', { largura: FORM, recorte: [painel().locator('.ep-h'), linha('Domain')], margem: 24, destaque: [linha('Interface'), linha('Server'), linha('Unique location'), linha('Domain')], unir: true, descricao: 'Novo registro DDNS FortiGuard para a WAN2 com o nome atlas-mtz.fortiddns.com' });
  await ok();
  await s.foto('02-1-ddns-3', { largura: LISTA, recorte: [ddnsSec, p.locator('tr:visible', { hasText: 'atlas-mtz' }).first()], margem: 30, destaque: [p.locator('tr:visible', { hasText: 'atlas-mtz' }).first()], descricao: 'Registro DDNS atlas-mtz.fortiddns.com na lista, com a interface e o IP público' });
  if (parar('D')) return s.fim();

  /* ---------- Etapa E: porta interna e VLANs ---------- */
  await s.cli(['config system interface', 'edit port5', 'set alias INTERNA', 'set role lan', 'next', 'end']);
  await s.fecharCli();
  await s.rota('/network/interfaces');
  await p.locator('button:visible', { hasText: /Create new/ }).first().click();
  await s.espera(400);
  await s.foto('02-2-vlan-1', { recorte: [p.locator('button:visible', { hasText: /Create new/ }).first(), p.locator('.menu:visible').last()], margem: 40, destaque: [p.locator('.menu-item:visible', { hasText: /^Interface$/ }).first()], descricao: 'Menu Create new com a opção Interface' });
  await p.locator('.menu-item:visible', { hasText: /^Interface$/ }).first().click();
  await painel().waitFor();
  await s.espera(500);
  await preencher('Name', 'vlan10');
  await escolher('Type', 'VLAN');
  await escolher('Interface', 'port5');
  await preencher('VLAN ID', '10');
  await escolher('Role', 'LAN');
  await s.foto('02-2-vlan-2', { largura: FORM, recorte: topoForm(linha('Role')), margem: 16, destaque: [linha('Type'), linha('Interface'), linha('VLAN ID')], unir: true, descricao: 'Nova interface vlan10: tipo VLAN, interface pai port5 e VLAN ID 10' });
  await seg('Addressing mode', 'Manual');
  await preencher('IP/Netmask', '10.10.10.1/255.255.255.0');
  for (const a of ['HTTPS', 'SSH', 'HTTP', 'FMG-Access', 'SNMP', 'Security Fabric Connection']) await marcar(a, false);
  await marcar('PING', true);
  await rolarAte(secao('Address'));
  await s.foto('02-2-vlan-3', { largura: FORM, recorte: [secao('Address'), linha('IPv4')], margem: 20, destaque: [linha('IP/Netmask'), linha('IPv4')], descricao: 'Endereço 10.10.10.1/24 e Administrative Access PING na vlan10' });
  await ok();
  await s.cli(['config system interface',
    'edit vlan10', 'set alias USUARIOS', 'next',
    'edit vlan20', 'set vdom root', 'set alias SERVIDORES', 'set interface port5', 'set vlanid 20', 'set role lan', 'set ip 10.10.20.1 255.255.255.0', 'set allowaccess ping', 'next',
    'edit vlan30', 'set vdom root', 'set alias VISITANTES', 'set interface port5', 'set vlanid 30', 'set role lan', 'set ip 10.10.30.1 255.255.255.0', 'set allowaccess ping', 'next',
    'edit port3', 'set alias DMZ', 'set role dmz', 'set ip 172.16.10.1 255.255.255.0', 'set allowaccess ping', 'next', 'end']);
  await s.fecharCli();
  await s.rota('/network/interfaces');
  const port5 = p.locator('tr:visible', { hasText: 'INTERNA' }).first();
  await s.foto('02-2-vlan-4', { largura: LISTA, recorte: [port5, p.locator('tr:visible', { hasText: 'vlan30' }).first()], margem: 50, destaque: [port5, p.locator('tr:visible', { hasText: 'vlan10' }).first(), p.locator('tr:visible', { hasText: 'vlan20' }).first(), p.locator('tr:visible', { hasText: 'vlan30' }).first()], unir: true, descricao: 'As VLANs 10, 20 e 30 abaixo da interface pai port5 (INTERNA)' });
  await s.voltar();
  await s.enquadrar();
  await s.foto('02-2-topologia', { limpo: false, recorte: [no('FGT-MTZ'), no('SW-CORE'), no('PC-USUARIO'), no('SRV-AD'), no('NOTEBOOK-VISITA')], margem: 60, destaque: [{ cabo: 'cabo-trunk' }, no('SW-CORE'), no('PC-USUARIO'), no('SRV-AD'), no('NOTEBOOK-VISITA')], descricao: 'Cabo entre a port5 e o SW-CORE, que leva as três VLANs, e os computadores de cada VLAN' });
  await s.gui(FGT, SENHA, '/network/interfaces');
  await s.limpo(true);
  if (parar('E')) return s.fim();

  /* ---------- Etapa F: zone ---------- */
  await p.locator('button:visible', { hasText: /Create new/ }).first().click();
  await p.locator('.menu-item:visible', { hasText: /^Zone$/ }).first().click();
  await painel().waitFor();
  await preencher('Name', 'INTERNAS');
  await adicionarItens('Interface members', ['vlan10', 'vlan20']);
  await s.foto('02-3-zone-1', { largura: FORM, recorte: topoForm(linha('Interface members')), margem: 24, destaque: [linha('Name'), linha('Block intra-zone traffic'), linha('Interface members')], unir: true, descricao: 'Nova zone INTERNAS com as interfaces vlan10 e vlan20' });
  await ok();
  await s.foto('02-3-zone-2', { largura: LISTA, recorte: [p.locator('tr:visible', { hasText: 'INTERNAS' }).first(), p.locator('tr:visible', { hasText: 'vlan20' }).first()], margem: 50, destaque: [p.locator('tr:visible', { hasText: 'INTERNAS' }).first(), p.locator('tr:visible', { hasText: 'vlan20' }).first()], unir: true, descricao: 'A zone INTERNAS na lista, com as VLANs 10 e 20 como membros' });
  if (parar('F')) return s.fim();

  /* ---------- Etapa G: outros tipos de interface (sem salvar) ---------- */
  const novaInterface = async (tipo) => {
    await p.locator('button:visible', { hasText: /Create new/ }).first().click();
    await p.locator('.menu-item:visible', { hasText: /^Interface$/ }).first().click();
    await painel().waitFor();
    await s.espera(400);
    await escolher('Type', tipo);
  };
  await novaInterface('Software Switch');
  await preencher('Name', 'sw-lab');
  await adicionarItens('Interface members', ['port10', 'port11']);
  await s.foto('02-3-software-switch', { largura: FORM, recorte: topoForm(linha('Interface members')), margem: 24, destaque: [linha('Type'), linha('Interface members')], unir: true, descricao: 'Formulário de software switch com as portas port10 e port11' });
  await cancelar();
  await novaInterface('802.3ad Aggregate');
  await preencher('Name', 'agg-srv');
  await adicionarItens('Interface members', ['port15', 'port16']);
  await s.foto('02-3-aggregate', { largura: FORM, recorte: topoForm(linha('Interface members')), margem: 24, destaque: [linha('Type'), linha('Interface members')], unir: true, descricao: 'Formulário de agregação 802.3ad com as portas port15 e port16' });
  await cancelar();
  await novaInterface('Redundant Interface');
  await preencher('Name', 'red-srv');
  await adicionarItens('Interface members', ['port15', 'port16']);
  await s.foto('02-3-redundante', { largura: FORM, recorte: topoForm(linha('Interface members')), margem: 24, destaque: [linha('Type'), linha('Interface members')], unir: true, descricao: 'Formulário de interface redundante com as portas port15 e port16' });
  await cancelar();
  if (parar('G')) return s.fim();

  /* ---------- Etapa H: loopback e endereço secundário ---------- */
  await novaInterface('Loopback Interface');
  await preencher('Name', 'loop-ger');
  await preencher('IP/Netmask', '10.10.255.1/255.255.255.255');
  await marcar('PING', true);
  await s.foto('02-3-loopback', { largura: FORM, recorte: [painel().locator('.ep-h'), linha('IPv4')], margem: 20, destaque: [linha('Type'), linha('IP/Netmask')], descricao: 'Nova interface loopback loop-ger com o endereço 10.10.255.1/32' });
  await ok();
  await editarInterface('port3');
  await toggle('Secondary IP address', true);
  const sec = painel().locator('.frow:visible').filter({ has: p.locator('.flabel', { hasText: /^\s*IP\/Netmask\s*$/ }) }).nth(1);
  await sec.locator('input').first().fill('172.16.11.1/255.255.255.0');
  await rolarAte(secao('Address'));
  await s.foto('02-3-secundario', { largura: FORM, recorte: [secao('Address'), sec], margem: 20, destaque: [linha('Secondary IP address'), sec], unir: true, descricao: 'Endereço secundário 172.16.11.1/24 na interface DMZ (port3)' });
  await cancelar();
  await limparBusca();
  if (parar('H')) return s.fim();

  /* ---------- Etapa I: rota padrão e a disputa com a rota do DHCP ---------- */
  await s.rota('/network/static-routes');
  await p.locator('button:visible', { hasText: /Create new/ }).first().click();
  await painel().waitFor();
  await s.espera(400);
  await seg('Destination', 'Subnet');
  await painel().locator('.frow:visible').filter({ has: p.locator('.flabel', { hasText: /^\s*$/ }) }).first().locator('input').first().fill('0.0.0.0/0.0.0.0');
  await linha('Interface').locator('.chip-add').first().click();
  await itemSel(p.locator('.slide-pane:visible').last(), 'port1').click();
  await s.espera(300);
  const fecharSel = p.locator('.slide-pane:visible').last().locator('button', { hasText: /^\s*Close\s*$/ });
  if (await fecharSel.count()) await fecharSel.click();
  await linha('Gateway Address').locator('input').last().fill('203.0.113.1');
  await s.foto('02-4-rota-1', { largura: FORM, recorte: [painel().locator('.ep-h'), linha('Administrative Distance')], margem: 24, destaque: [linha('Destination'), linha('Interface'), linha('Gateway Address'), linha('Administrative Distance')], unir: true, descricao: 'Nova rota estática 0.0.0.0/0 pela WAN1 (port1) com gateway 203.0.113.1 e distância 10' });
  await ok();
  await s.foto('02-4-rota-2', { largura: LISTA, recorte: [p.locator('.content-scroll thead:visible').first(), p.locator('tr:visible', { hasText: '203.0.113.1' }).first()], margem: 16, destaque: [p.locator('tr:visible', { hasText: '203.0.113.1' }).first()], descricao: 'A rota padrão pela WAN1 na lista de rotas estáticas' });
  await s.rota('/dashboard/network-monitor');
  await s.foto('02-4-rotas-antes', { recorte: [p.locator('.content-scroll table').last()], margem: 16, destaque: [p.locator('tr:visible', { hasText: '0.0.0.0/0' }).first()], descricao: 'Tabela de rotas: a rota padrão ativa ainda é a da WAN2, aprendida por DHCP com distância 5' });
  await guardarCli('get router info routing-table all', 'rotas-antes');
  await s.fecharCli();
  await editarInterface('port2');
  await preencher('Distance', '20');
  await rolarAte(secao('Address'));
  await s.foto('02-4-wan2-distancia', { largura: FORM, recorte: [secao('Address'), linha('Override internal DNS')], margem: 20, destaque: [linha('Distance')], descricao: 'Distância da rota recebida por DHCP na WAN2 alterada para 20' });
  await ok();
  await limparBusca();
  await s.rota('/dashboard/network-monitor');
  await s.foto('02-4-rotas-depois', { recorte: [p.locator('.content-scroll table').last()], margem: 16, destaque: [p.locator('tr:visible', { hasText: '0.0.0.0/0' }).first()], descricao: 'Tabela de rotas: agora a rota padrão ativa é a da WAN1, com distância 10' });
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
  await editarInterface('vlan10');
  const dhcpSec = painel().locator('.form-section-h', { hasText: /DHCP Server/ }).first();
  await rolarAte(dhcpSec);
  const dhcpToggle = dhcpSec.locator('.toggle').first();
  if (!(await dhcpToggle.evaluate((e) => e.classList.contains('on')))) await dhcpToggle.click();
  await s.espera(500);
  const faixa = linha('Address range');
  const faixaInput = faixa.locator('input').first();
  if (await faixaInput.count()) { await faixaInput.fill('10.10.10.100-10.10.10.200'); await faixaInput.press('Enter').catch(() => {}); }
  await seg('DNS server', 'Same as Interface IP');
  await rolarAte(dhcpSec);
  await s.foto('02-5-dhcp-1', { largura: FORM, recorte: [dhcpSec, linha('Lease time')], margem: 20, destaque: [linha('Address range'), linha('Netmask'), linha('Default gateway'), linha('DNS server'), linha('Lease time')], unir: true, descricao: 'DHCP Server da vlan10: faixa 10.10.10.100 a 10.10.10.200, gateway e DNS iguais ao endereço da interface' });
  const avancado = painel().getByText('Advanced', { exact: true }).first();
  if (await avancado.count()) {
    await avancado.click();
    await s.espera(400);
    await rolarAte(linha('Mode'));
    await s.foto('02-5-dhcp-2', { largura: FORM, recorte: [linha('Mode'), linha('IP Address Assignment Rules')], margem: 20, destaque: [linha('Mode'), linha('IP Address Assignment Rules')], descricao: 'Opções avançadas do DHCP Server: modo Server ou Relay e as regras de atribuição de endereço' });
  }
  await ok();
  await s.cli(['config system dhcp server', 'edit 0', 'set interface vlan30', 'set default-gateway 10.10.30.1', 'set netmask 255.255.255.0', 'set dns-service default',
    'config ip-range', 'edit 1', 'set start-ip 10.10.30.100', 'set end-ip 10.10.30.200', 'next', 'end', 'next', 'end']);
  await s.fecharCli();
  // Relay: a tela, sem salvar
  await editarInterface('vlan30');
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
  await limparBusca();
  // O PC da VLAN 10 pede um endereço
  await s.voltar();
  await s.abrir('pc-usuario');
  const terminal = async (cmds) => {
    if (!(await p.locator('.dk-win[data-app="terminal"]:visible').count())) {
      await p.locator('button.dk-tb:visible', { hasText: '' }).filter({ has: p.locator('[aria-label="Terminal"], [title="Terminal"]') }).first().click().catch(async () => {
        await p.locator('button.dk-tb.start:visible').click();
        await p.locator('.dk-start button:visible', { hasText: /^\s*Terminal\s*$/ }).first().click();
      });
      await p.locator('.dk-win[data-app="terminal"] input[aria-label="Command"]').waitFor();
    }
    const cmd = p.locator('.dk-win[data-app="terminal"] input[aria-label="Command"]:visible').last();
    for (const c of [].concat(cmds)) { await cmd.fill(c); await cmd.press('Enter'); await s.espera(1500); }
  };
  await terminal(['ipconfig /renew', 'cls', 'ipconfig /all']);
  const janelaTerm = p.locator('.dk-win[data-app="terminal"]:visible').last();
  await s.foto('02-5-pc-ipconfig', { recorte: [janelaTerm], margem: 8, descricao: 'ipconfig /all no PC-USUARIO: endereço 10.10.10.100, gateway e DNS 10.10.10.1 recebidos por DHCP' });
  await terminal(['cls', 'ping 10.10.10.1', 'ping 8.8.8.8']);
  await s.foto('02-4-pc-ping', { recorte: [janelaTerm], margem: 8, descricao: 'Ping do PC-USUARIO: responde o gateway 10.10.10.1, mas não a Internet, porque ainda não há firewall policy' });
  await s.gui(FGT, SENHA, '/dashboard/assets');
  await s.limpo(true);
  const abaDhcp = p.locator('.tab:visible, .page-tab:visible', { hasText: /^\s*DHCP\s*$/ }).first();
  if (await abaDhcp.count()) await abaDhcp.click();
  await s.espera(600);
  await s.foto('02-5-leases', { destaque: [p.locator('.content-scroll').first()], descricao: 'Dashboard > Asset and Identities, aba DHCP, com o lease do PC-USUARIO' });
  await guardarCli('execute dhcp lease-list', 'lease-list');
  await guardarCli('show system dhcp server', 'dhcp-server');
  await s.fecharCli();
  if (parar('J')) return s.fim();

  /* ---------- Etapa K: DNS server e DNS database ---------- */
  await s.rota('/network/dns-servers');
  await p.locator('.content-scroll button:visible', { hasText: /Create New|Create new/ }).first().click();
  await painel().waitFor();
  await escolher('Interface', 'vlan10');
  await escolher('Mode', 'Recursive');
  await s.foto('02-6-dns-servico', { recorte: [painel().locator('.ep-h'), linha('Mode')], margem: 30, destaque: [linha('Interface'), linha('Mode')], unir: true, descricao: 'Serviço DNS na vlan10 no modo Recursive' });
  await ok();
  await p.locator('.content-scroll button:visible', { hasText: /Create New|Create new/ }).nth(1).click();
  await painel().waitFor();
  await seg('Type', 'Primary');
  await seg('View', 'Shadow');
  await preencher('DNS Zone', 'atlas-local');
  await preencher('Domain Name', 'atlas.local');
  const entradas = painel().locator('.form-section-h', { hasText: /DNS Entries/ }).first();
  const novaEntrada = async (host, ip) => {
    await rolarAte(entradas);
    await painel().locator('button:visible', { hasText: /Create/ }).last().click();
    const dlg = p.locator('.net-modal:visible').last();
    await dlg.waitFor();
    await s.campo('Hostname', dlg).locator('input').first().fill(host);
    await s.campo('IP Address', dlg).locator('input').first().fill(ip);
    return dlg;
  };
  const dlg1 = await novaEntrada('srv-ad', '10.10.20.10');
  await s.foto('02-6-dns-registro', { recorte: [dlg1], margem: 12, descricao: 'Registro A srv-ad.atlas.local apontando para 10.10.20.10' });
  await dlg1.locator('button', { hasText: /^\s*OK\s*$/ }).click();
  const dlg2 = await novaEntrada('intranet', '172.16.10.10');
  await dlg2.locator('button', { hasText: /^\s*OK\s*$/ }).click();
  await s.espera(400);
  await s.foto('02-6-dns-zona', { largura: FORM, recorte: [painel().locator('.ep-h'), painel().locator('tr:visible', { hasText: '172.16.10.10' }).first()], margem: 24, destaque: [linha('Type'), linha('View'), linha('DNS Zone'), linha('Domain Name'), entradas], descricao: 'Zona atlas.local do tipo Primary, visão Shadow, com os registros srv-ad e intranet' });
  await ok();
  await s.foto('02-6-dns-servers', { destaque: [p.locator('.content-scroll').first()], descricao: 'Network > DNS Servers com o serviço DNS da vlan10 e a zona atlas.local' });
  // O PC usa o FortiGate como DNS
  await s.voltar();
  await s.abrir('pc-usuario');
  await terminal(['cls', 'nslookup srv-ad.atlas.local', 'nslookup www.google.com']);
  await s.foto('02-6-pc-nslookup', { recorte: [janelaTerm], margem: 8, descricao: 'nslookup no PC-USUARIO respondido pelo FortiGate (10.10.10.1): o nome interno e um nome da Internet' });
  if (parar('K')) return s.fim();

  /* ---------- Etapa L: NTP server ---------- */
  await s.gui(FGT, SENHA, '/system/settings');
  await s.limpo(true);
  const ntpToggle = s.campo('Setup device as local NTP server').locator('.toggle').first();
  if (!(await ntpToggle.evaluate((e) => e.classList.contains('on')))) await ntpToggle.click();
  await s.espera(400);
  const ntpIntf = s.campo('Listen on interfaces');
  await ntpIntf.locator('.chip-add').first().click();
  const selNtp = p.locator('.slide-pane:visible').last();
  for (const i of ['vlan10', 'vlan20']) await itemSel(selNtp, i).click();
  await selNtp.locator('button', { hasText: /^\s*Close\s*$/ }).click();
  await s.espera(400);
  await rolarAte(s.campo('Setup device as local NTP server'));
  await s.foto('02-6-ntp', { largura: FORM, recorte: [s.campo('Set time'), ntpIntf], margem: 24, destaque: [s.campo('Setup device as local NTP server'), ntpIntf], unir: true, descricao: 'System > Settings: o FGT-MTZ como servidor NTP nas interfaces vlan10 e vlan20' });
  await s.botao('Apply').click().catch(() => {});
  await s.espera(800);
  await guardarCli('show system ntp', 'ntp');
  await guardarCli('show system interface vlan10', 'vlan10');
  await guardarCli('show system zone', 'zone');
  await guardarCli('get system interface physical', 'interface-physical');
  await guardarCli('show system dns-server', 'dns-server');
  await s.fecharCli();

  /* ---------- Topologia final ---------- */
  await s.voltar();
  await s.limpo(false);
  await s.enquadrar();
  await s.foto('02-0-topologia', { recorte: NOS.map(no), margem: 70, descricao: 'Topologia do módulo 02: WAN1 e WAN2, DMZ, VLANs 10, 20 e 30 no SW-CORE e a gerência' });

  fs.writeFileSync(path.join(SAIDA, 'saidas-cli.json'), `${JSON.stringify(saidas, null, 2)}\n`);
  await s.fim();
})().catch((e) => { console.error(e); process.exit(1); });
