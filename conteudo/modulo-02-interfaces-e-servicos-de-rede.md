# Módulo 02 — Interfaces e serviços de rede

## Antes de começar

### O que você vai aprender

Ao final deste módulo, você será capaz de:

- explicar a diferença entre porta física, interface e interface lógica, e configurar as propriedades de uma interface: alias, role, endereço, acesso administrativo e status;
- conectar o FortiGate à Internet com endereço fixo, DHCP ou PPPoE, entender o que cada modo negocia com a operadora e usar DDNS quando o endereço muda;
- explicar como uma VLAN separa redes no mesmo cabo, o que muda no quadro Ethernet e como o FortiGate e o switch precisam combinar;
- escolher entre zone, software switch, hardware switch, agregação (LACP) e interface redundante, sabendo o que cada um faz com o tráfego;
- criar uma interface loopback e um endereço secundário, e saber quando usá-los;
- explicar como o FortiGate escolhe uma rota (prefixo, distância, prioridade) e resolver a disputa entre duas rotas padrão;
- testar a conectividade a partir do FortiGate e de um computador, e interpretar o que cada teste prova;
- entregar endereços por DHCP, entender as quatro mensagens da negociação e encaminhar os pedidos a outro servidor (relay);
- oferecer DNS e NTP aos computadores da rede.

**Pré-requisitos:** módulo 01. O FGT-MTZ já tem senha, gerência em 10.10.99.1 e hora sincronizada com o NTP.br.

### Topologia atual

No módulo anterior, o FGT-MTZ só tinha a rede de gerência. Agora ele ganha as duas conexões com a Internet, a DMZ e as redes internas da Atlas. Os cabos já estão ligados; neste módulo, você vai configurar cada interface e os serviços que os computadores usam para entrar na rede:

:::slides
midia/m02/02-0-topologia-fisica.png "Rede da matriz com os cabos ligados e as interfaces sem configuração" | **Antes:** os cabos estão ligados, mas as portas do FGT-MTZ ainda não têm endereço ("No address"). Os computadores das VLANs aparecem com "DHCP: no lease": pedem um endereço, mas ninguém responde.
midia/m02/02-0-topologia.png "Rede da matriz ao fim do módulo, com os endereços de cada interface" | **Depois:** cada interface com seu endereço, a WAN2 recebendo o endereço da Operadora B por DHCP, a port5 levando as VLANs 10, 20 e 30 até o SW-CORE e os computadores das VLANs com endereços entregues pelo FGT-MTZ.
:::

| Rede | Interface do FGT-MTZ | Endereço | Quem está nela |
|---|---|---|---|
| Internet (Operadora A) | `port1`, alias **WAN1** | 203.0.113.2/29, gateway 203.0.113.1 | ONT da Operadora A |
| Internet (Operadora B) | `port2`, alias **WAN2** | recebido por DHCP | ONT da Operadora B |
| DMZ | `port3`, alias **DMZ** | 172.16.10.1/24 | SRV-WEB (172.16.10.10) |
| Interna (trunk) | `port5`, alias **INTERNA** | sem endereço | SW-CORE, com as três VLANs |
| VLAN 10 – Usuários | `vlan10` | 10.10.10.1/24 | PC-USUARIO (DHCP) |
| VLAN 20 – Servidores | `vlan20` | 10.10.20.1/24 | SRV-AD (10.10.20.10) |
| VLAN 30 – Convidados | `vlan30` | 10.10.30.1/24 | NOTEBOOK-VISITA (DHCP) |
| Gerência | `mgmt` | 10.10.99.1/24 | ADMIN-PC (10.10.99.10) |

> **Atenção:** ao fim deste módulo, os computadores da Atlas recebem endereço, alcançam o FortiGate e resolvem nomes, mas **ainda não navegam na Internet**. Para o tráfego **atravessar** o FortiGate, de uma interface para outra, é preciso uma firewall policy, assunto do próximo módulo. Guarde essa ideia: ela explica vários testes deste módulo.

---

## 02.1. Interfaces físicas e conexões WAN

### 02.1.1. Interfaces no FortiGate

#### Conceito: porta, interface e interface lógica

Uma **porta** é o conector físico na frente do equipamento, onde você liga o cabo. Para o FortiOS, cada porta é uma **interface física**, com um nome fixo que vem do hardware. No FortiGate 121G, as portas de cobre se chamam `port1` a `port16`, as de fibra `port17` a `port24` e as de 10 Gbps `x1` a `x4`; há ainda `mgmt` (gerência) e `ha` (ligação entre dois FortiGates em cluster).

A interface é o ponto onde o FortiGate **recebe e envia** tráfego. Toda decisão do firewall começa por ela: o pacote **chegou** por qual interface e vai **sair** por qual? As firewall policies, as rotas e os serviços (DHCP, DNS) são configurados em cima das interfaces.

Além das físicas, você pode criar **interfaces lógicas**, que não têm conector próprio, mas funcionam do mesmo jeito para as policies e as rotas:

| Interface lógica | O que é | Exemplo de uso |
|---|---|---|
| **VLAN** | Uma rede separada que passa por dentro de uma interface física, identificada por um número | Usuários, servidores e convidados no mesmo cabo até o switch |
| **802.3ad Aggregate** | Duas ou mais portas físicas funcionando como um só link | Mais banda e tolerância a falha até o switch central |
| **Redundant Interface** | Duas ou mais portas, uma ativa e as outras de reserva | Failover para um switch que não fala LACP |
| **Software switch** / **Hardware switch** | Várias portas na mesma rede, como um switch | Ligar mais equipamentos na mesma rede sem um switch externo |
| **Loopback** | Uma interface que não depende de porta nem de cabo | Endereço estável para gerência, VPN e roteamento |
| **Túnel** (IPsec, por exemplo) | A ponta de uma VPN | Ligar filiais e usuários remotos |

Há também a **zone**, que não é uma interface, mas um **agrupamento** de interfaces para simplificar as policies. Tudo isso aparece neste módulo, menos os túneis, que têm módulos próprios.

#### Na GUI: a lista de interfaces

As interfaces ficam em **Network > Interfaces**:

:::slides
midia/m02/02-1-menu-interfaces.png "Menu Network com o item Interfaces em destaque" | No menu lateral, abra **Network** e clique em **Interfaces**.
midia/m02/02-1-interfaces-1.png "Network > Interfaces com o painel de portas e a lista de interfaces" | A página tem dois blocos: no alto, o **painel de portas**; embaixo, a **lista de interfaces**, agrupada por tipo (802.3ad Aggregate, Physical Interface, VLAN…), com o endereço, o acesso administrativo, o servidor DHCP e o número de **referências** de cada uma.
midia/m02/02-1-interfaces-2.png "Painel de portas do FortiGate 121G" | O **painel de portas** desenha a frente do equipamento. As portas em **verde** têm enlace (cabo ligado e o equipamento do outro lado ativo). Passe o mouse sobre uma porta para ver o nome, o endereço e a velocidade; clique nela para editar a interface.
:::

O grupo **802.3ad Aggregate** já traz uma interface: a `fortilink`, uma agregação das portas `x1` a `x4` que vem de fábrica nos modelos de médio porte. Ela serve para o FortiGate gerenciar **FortiSwitches** (o FortiGate vira o "controlador" dos switches). Se você não for usar FortiSwitch, ela pode ser desfeita para liberar as portas.

A coluna **Ref.** (referências) diz quantos objetos usam a interface: policies, rotas, zones, servidores DHCP. Uma interface com referências não pode ser apagada nem colocada em uma zone; você vai ver isso acontecer mais adiante.

#### Propriedades de uma interface: a WAN1

A Atlas liga a `port1` à Operadora A, que entregou um link empresarial com **endereço fixo**: a rede 203.0.113.0/29, com o FortiGate em 203.0.113.2 e o roteador da operadora (o **gateway**) em 203.0.113.1. Uma /29 tem 8 endereços, dos quais 6 utilizáveis; é o tamanho comum de bloco de IP fixo para empresas.

Para editar uma interface, selecione a linha e clique em **Edit** (um duplo clique na linha faz o mesmo):

:::slides
midia/m02/02-1-wan1-0.png "Linha da port1 selecionada e o botão Edit em destaque" | Em **Network > Interfaces**, clique na linha da **port1** para selecioná-la. O botão **Edit**, que estava apagado, fica disponível. Clique nele.
midia/m02/02-1-wan1-1.png "Edição da port1: nome e tipo" | **Name** e **Type** de uma interface física não mudam: vêm do hardware.
midia/m02/02-1-wan1-2.png "Alias WAN1 e role WAN na port1" | **Alias:** um apelido que aparece ao lado do nome em toda a GUI, como "WAN1 (port1)". **Role:** o papel da interface. Escolha **WAN**. Os dois campos são explicados logo abaixo.
midia/m02/02-1-wan1-3.png "Endereço fixo 203.0.113.2/29 na WAN1" | Em **Addressing mode**, **Manual**, e em **IP/Netmask** o endereço fornecido pela operadora: **203.0.113.2/255.255.255.248**. A GUI aceita a máscara com pontos ou no formato /29.
midia/m02/02-1-wan1-4.png "Administrative Access da WAN1 só com PING" | Em **Administrative Access**, deixe só **PING**. HTTPS, SSH e os outros protocolos de gerência não devem ficar abertos para a Internet.
midia/m02/02-1-wan1-5.png "Status da interface Enabled" | No fim do formulário, **Status**: **Enabled** liga a interface; **Disabled** desliga, sem perder a configuração.
midia/m02/02-1-wan1-ok.png "Botão OK do formulário" | Clique em **OK** para salvar.
midia/m02/02-1-wan1-7.png "A port1 na lista com o alias WAN1" | Na lista, a interface aparece como **WAN1 (port1)**, com o endereço 203.0.113.2/255.255.255.248 e PING em Administrative Access.
:::

Cada campo tem um porquê:

**Alias.** O nome da interface (`port1`) não pode ser trocado, e não diz nada sobre o que está ligado nela. O alias resolve isso: em toda a GUI, nas listas de policies, nos logs e nos relatórios, você lê "WAN1 (port1)" em vez de só "port1". Em um equipamento com 30 interfaces, é o que evita escolher a porta errada numa policy. Use nomes que digam a função (WAN1, DMZ, INTERNA), não o nome do fornecedor, que muda.

**Role.** O role diz à GUI para que a interface serve, e a GUI ajusta as opções que oferece:

| Role | Uso | O que muda na GUI |
|---|---|---|
| **LAN** | Redes internas | Mostra o DHCP Server, a detecção de dispositivos e a opção de criar um objeto de endereço com a sub-rede da interface |
| **WAN** | Conexão com a Internet | Mostra a banda estimada (usada em SD-WAN e nos relatórios) e esconde o DHCP Server |
| **DMZ** | Servidores publicados | Semelhante à LAN |
| **Undefined** | Sem papel definido | Mostra todas as opções |

O role **não cria regras nem libera tráfego**: ele organiza a GUI. Quem decide o que passa é a firewall policy. Uma interface com role WAN e sem policy não deixa nada entrar nem sair.

**Administrative Access.** São os protocolos que o FortiGate aceita **quando o destino do pacote é o próprio FortiGate**, naquele endereço da interface. Marcar HTTPS na WAN1 significa: "aceite conexões HTTPS para 203.0.113.2 vindas da Internet". Não tem relação com o tráfego que **atravessa** o FortiGate (um usuário navegando), que é controlado pelas policies.

| Opção | O que permite |
|---|---|
| **HTTPS** / **HTTP** | Acesso à GUI. HTTP só redireciona para HTTPS |
| **SSH** | Acesso à CLI pela rede |
| **PING** | Responder a ping (ICMP echo), útil para testes |
| **SNMP** | Consultas de monitoramento por SNMP |
| **FMG-Access** | Gerência pelo FortiManager |
| **Security Fabric Connection** | Ligação com outros produtos Fortinet da Security Fabric (FortiAnalyzer, FortiSwitch, FortiAP, outros FortiGates) |
| **FTM** | Notificações push do FortiToken Mobile (autenticação de dois fatores) |
| **RADIUS Accounting** | Receber accounting de um servidor RADIUS, para identificar usuários (RSSO) |
| **Speed Test** | Servir como ponto de teste de velocidade |

A regra prática é: em interfaces voltadas para a Internet, **só PING** (ou nada); gerência só na rede de gerência ou por VPN. Um FortiGate com a GUI exposta na Internet é alvo de varredura e de tentativas de senha o tempo todo, e qualquer vulnerabilidade da GUI vira um risco direto.

**Status.** É o estado **administrativo**: você decide se a interface está ligada. Com **Disabled**, o FortiGate desliga a porta como se o cabo tivesse sido tirado, mas a configuração continua lá. É útil para isolar um segmento numa emergência ou deixar uma porta configurada desligada até o dia da ativação. Se a interface tiver VLANs, todas elas caem junto.

#### Estado do enlace e contadores

O estado administrativo não é o único. No painel à direita da edição, a GUI mostra o estado **do enlace**, que você não controla, e o tráfego:

:::figura midia/m02/02-1-wan1-6.png "Painel lateral com o estado do enlace, o MAC e os contadores de tráfego da port1"
**Status** (Up ou Down) é o enlace físico: Up quando o cabo está ligado e o equipamento do outro lado está ativo e negociou velocidade. Abaixo, o **MAC address** da porta, o botão **References** (quem usa a interface) e o tráfego: banda de entrada e de saída e bytes recebidos e enviados.
:::

Quando algo não funciona, confira os dois estados nesta ordem:

| Status administrativo | Enlace | Significado |
|---|---|---|
| Enabled | Up | Interface pronta. Se o tráfego não passa, o problema está em endereço, rota ou policy |
| Enabled | Down | Problema físico: cabo, porta do outro lado desligada, transceiver ou velocidade incompatível |
| Disabled | Down | Você (ou outro administrador) desligou a interface |

> **Atenção:** um enlace **Up** só quer dizer que o cabo e o equipamento do outro lado estão funcionando. Ele não quer dizer que o tráfego passa: para isso, a interface precisa de endereço, de rota e de firewall policy.

### 02.1.2. Conexão com a Internet: estático, DHCP e PPPoE

#### Conceito: três formas de receber o endereço

O endereço da interface WAN depende do contrato com a operadora. O FortiGate oferece três modos de endereçamento para isso:

| Modo | Quando usar | O que o FortiGate recebe da operadora |
|---|---|---|
| **Manual** (estático) | Links empresariais com IP fixo | Nada: você digita endereço e máscara e cria a rota padrão |
| **DHCP** | Links com IP dinâmico (cabo, fibra sem IP fixo, 4G/5G) e muitos links de operadora que entregam o IP por DHCP | Endereço, máscara, gateway e servidores DNS |
| **PPPoE** | Links que exigem usuário e senha (comum em fibra e DSL residencial e de pequenas empresas) | Endereço, gateway e DNS, depois de autenticar |

Os três podem conviver no mesmo FortiGate: é comum ter um link empresarial com IP fixo e um link de banda larga mais barato, com IP dinâmico, como reserva. É exatamente o caso da Atlas.

**Manual.** Você digita tudo. O endereço nunca muda, o que é necessário para publicar serviços (um site, uma VPN que as filiais procuram pelo IP) e para que parceiros liberem o seu IP nos firewalls deles. Em troca, a rota padrão também é sua responsabilidade: o FortiGate não sabe qual é o gateway até você criar a rota (você vai fazer isso no capítulo de rotas).

**DHCP.** O FortiGate se comporta como um computador comum: ao ligar a interface, ele **pede** um endereço à operadora e recebe uma "concessão" (*lease*) com prazo de validade. Antes de o prazo vencer, ele renova. O endereço pode mudar quando a concessão vence sem renovação, quando o equipamento da operadora reinicia ou quando a operadora muda o plano de endereços. Além do endereço, a resposta traz o **gateway** e os **servidores DNS** da operadora, e o FortiGate pode usar os dois automaticamente. O funcionamento do DHCP, com as quatro mensagens da negociação, está explicado no capítulo de DHCP deste módulo.

**PPPoE** (*Point-to-Point Protocol over Ethernet*). Antes de receber o endereço, o FortiGate precisa **se autenticar** com o usuário e a senha do contrato. A negociação tem duas fases:

1. **Descoberta:** o FortiGate procura um concentrador da operadora (mensagem PADI, enviada para toda a rede), recebe ofertas (PADO), escolhe uma (PADR) e recebe um número de sessão (PADS).
2. **Sessão PPP:** dentro dessa sessão, o FortiGate se autentica (por PAP ou CHAP) e recebe o endereço, o gateway e o DNS.

Quando a sessão acaba, um dos lados envia um PADT. Como o PPPoE acrescenta um cabeçalho de 8 bytes a cada pacote, o tamanho máximo de pacote (MTU) cai de 1500 para **1492** bytes; o FortiGate já ajusta isso, mas é a causa clássica de sites que "carregam pela metade" quando algum equipamento no caminho não ajusta.

#### Na GUI: a WAN2 por DHCP

A Operadora B entrega o endereço por DHCP. A configuração começa como a da WAN1:

:::slides
midia/m02/02-1-wan2-0.png "Linha da port2 selecionada e o botão Edit" | Em **Network > Interfaces**, selecione a **port2** e clique em **Edit**.
midia/m02/02-1-wan2-a.png "Alias WAN2 e role WAN na port2" | **Alias:** **WAN2**. **Role:** **WAN**.
midia/m02/02-1-wan2-b.png "Addressing mode DHCP na WAN2, sem Administrative Access" | Em **Addressing mode**, escolha **DHCP**. Aparecem as opções do cliente DHCP: **Retrieve default gateway from server** (instalar a rota padrão recebida), **Distance** (5, a distância dessa rota) e **Override internal DNS** (usar os DNS da operadora como DNS do sistema). Em **Administrative Access**, nada marcado. Clique em **OK**.
midia/m02/02-1-wan2-1.png "WAN2 como cliente DHCP com o endereço recebido" | Abra a WAN2 de novo: o **Status** mostra **Connected**, o endereço recebido (**200.160.21.34**) e a validade da concessão.
:::

As três opções do cliente DHCP têm consequências que vale entender:

- **Retrieve default gateway from server:** o FortiGate cria sozinho uma **rota padrão** pelo gateway informado pela operadora. Sem ela, a WAN2 teria endereço, mas nenhum tráfego para a Internet sairia por ela.
- **Distance:** a distância administrativa dessa rota, **5** por padrão. Você vai entender o peso desse número logo abaixo.
- **Override internal DNS:** os servidores DNS recebidos da operadora **substituem** os servidores DNS do sistema, que você configurou no módulo 01. Se o link da Operadora B cair, o FortiGate pode ficar consultando DNS de uma operadora que ele não alcança mais. Em um FortiGate com dois links, a prática comum é **desligar** essa opção e manter DNS fixos que funcionam pelos dois links.

A rota recebida aparece no monitor de rotas:

:::slides
midia/m02/02-1-menu-monitor.png "Menu Dashboard com o item Network Monitor" | Abra **Dashboard > Network Monitor**.
midia/m02/02-1-rota-dhcp.png "Network Monitor, aba Routing, com a rota padrão pela WAN2" | Na aba **Routing**, a rota padrão **0.0.0.0/0** pela WAN2 (port2) aparece com distância **5** e tipo **Static**. As redes das interfaces aparecem como **Connected**.
:::

#### A tela do PPPoE

Se o contrato fosse PPPoE, o modo pede o usuário e a senha fornecidos pela operadora:

:::figura midia/m02/02-1-pppoe.png "Tela do modo PPPoE com usuário e senha"
Em **Addressing mode**, **PPPoE**, informe **Username** e **Password** do contrato. **Retrieve default gateway from server** (distância 5) e **Override internal DNS** funcionam como no DHCP. **Unnumbered IP** serve para quando a operadora entrega um bloco de endereços fixos pelo PPPoE: a interface usa um endereço desse bloco. **Initial disc timeout** e **Initial PADT timeout** controlam os tempos de nova tentativa da descoberta e do encerramento da sessão, e normalmente ficam no padrão.
:::

Quando o PPPoE não conecta, as causas mais comuns são, nesta ordem: usuário ou senha errados (a operadora costuma exigir o domínio, como `usuario@operadora`), a ONT da operadora configurada como roteador (ela mesma faz o PPPoE, e o FortiGate deveria usar DHCP ou endereço fixo) e VLAN de serviço exigida pela operadora (algumas entregam o PPPoE numa VLAN específica, e a interface PPPoE precisa ficar sobre uma interface VLAN).

#### Distância administrativa: a primeira pista

A distância administrativa é o critério que o FortiGate usa para escolher entre **duas rotas para o mesmo destino**, aprendidas de formas diferentes: vence a de **menor distância**.

| Origem da rota | Distância padrão |
|---|---|
| Rede conectada (a rede da própria interface) | 0 |
| Rota recebida por **DHCP** ou **PPPoE** | **5** |
| Rota **estática** | **10** |

A consequência: uma rota padrão recebida por DHCP (5) **ganha** de uma rota padrão estática (10). Se a Atlas criar a rota padrão da WAN1 sem cuidado, todo o tráfego vai sair pelo link mais barato, a WAN2. Você vai ver esse problema acontecer e resolvê-lo no capítulo de rotas.

> **Dica para a prova:** a rota padrão aprendida por DHCP ou PPPoE tem distância **5** por padrão, menor que a da rota estática (**10**). Ela pode ser ajustada no campo **Distance** da interface ou desligada em **Retrieve default gateway from server**.

### 02.1.3. DDNS

#### Conceito: um nome que acompanha o endereço

Com endereço dinâmico, o IP público da WAN2 pode mudar a qualquer momento. Isso não atrapalha quem **sai** para a Internet, mas atrapalha quem precisa **chegar** ao FortiGate por esse link: um funcionário que conecta a VPN de casa, uma filial que monta uma VPN com a matriz, um parceiro que acessa um serviço publicado. Todos precisariam saber o IP novo a cada mudança.

O **DDNS** (*Dynamic DNS*) resolve isso com um nome. O FortiGate monitora o endereço da interface e, sempre que ele muda, avisa um provedor de DNS dinâmico, que atualiza o registro do nome. Quem acessa usa sempre o nome (por exemplo, `atlas-mtz.fortiddns.com`), e o DNS responde com o IP atual. O registro usa um TTL curto, para que a mudança chegue rápido a quem consulta.

Casos reais:

- **Filial com banda larga:** a filial tem só um link com IP dinâmico e precisa de VPN com a matriz. A matriz aponta a VPN para o nome DDNS da filial.
- **Link reserva:** a matriz recebe VPNs pelo link principal (IP fixo), e o nome DDNS do link reserva permite que os usuários reconectem por ele se o principal cair.
- **Acesso remoto em empresa pequena,** sem orçamento para IP fixo.

#### Na GUI: DDNS na WAN2

:::slides
midia/m02/02-1-menu-dns.png "Menu Network com o item DNS" | Abra **Network > DNS**.
midia/m02/02-1-ddns-1.png "Seção Dynamic DNS e o botão Create new" | Role a página até a seção **Dynamic DNS** e clique em **Create new**.
midia/m02/02-1-ddns-sel.png "Seletor de interfaces com a port2 (WAN2)" | No campo **Interface**, clique em **+** e escolha a **port2** (WAN2), a interface que tem o endereço dinâmico.
midia/m02/02-1-ddns-2.png "Novo registro DDNS para a WAN2" | **Server:** o serviço DDNS do FortiGuard (**fortiddns.com**). **Unique location:** a parte do nome que é sua; aqui, **atlas-mtz**, que forma **atlas-mtz.fortiddns.com** (campo **Domain**). A GUI avisa se o nome está disponível. Clique em **OK**.
midia/m02/02-1-ddns-3.png "Registro DDNS atlas-mtz na lista" | O registro aparece na lista com a interface monitorada e o IP público publicado.
:::

**Use public IP address** serve para quando o FortiGate **não tem** o IP público na própria interface, porque fica atrás de outro equipamento que faz NAT (um modem roteador da operadora, por exemplo). Nesse caso, o endereço da interface é privado e não serviria para nada no DNS; com a opção ligada, o FortiGate publica o IP público com que ele aparece na Internet, descoberto pelo FortiGuard.

> **Na prática:** o FortiGuard DDNS depende do contrato de suporte (FortiCare) do equipamento e só oferece nomes nos domínios da Fortinet. Pela CLI, o FortiGate também atualiza outros provedores de DNS dinâmico. Lembre que DDNS resolve o **nome**, não o NAT: se houver um roteador fazendo NAT na frente do FortiGate, ele ainda precisa encaminhar as portas da VPN.

### 02.1.4. A interface da DMZ

#### Conceito: por que uma rede só para servidores publicados

A **DMZ** (*zona desmilitarizada*) é uma rede separada para os servidores que recebem conexões da Internet, como o site da Atlas no SRV-WEB. A ideia é conter o dano: um servidor exposto à Internet é o equipamento com mais chance de ser invadido. Se ele estiver na mesma rede dos usuários e servidores internos, o invasor ganha acesso direto a eles. Na DMZ, tudo o que o servidor tenta fazer em direção à rede interna passa pelo FortiGate e precisa de uma policy, que normalmente é bem restrita (ou não existe).

O desenho típico de policies, que você vai montar nos próximos módulos:

| Origem → destino | Normalmente |
|---|---|
| Internet → DMZ | Liberado só para o serviço publicado (HTTPS do site) |
| DMZ → rede interna | Bloqueado, ou só o estritamente necessário (um banco de dados específico) |
| Rede interna → DMZ | Liberado para quem administra e usa os servidores |
| DMZ → Internet | Só o necessário (atualizações) |

#### Na GUI: a port3 como DMZ

:::slides
midia/m02/02-1-dmz-0.png "Linha da port3 selecionada e o botão Edit" | Em **Network > Interfaces**, selecione a **port3** e clique em **Edit**.
midia/m02/02-1-dmz-1.png "Alias DMZ e role DMZ na port3" | **Alias:** **DMZ**. **Role:** **DMZ**.
midia/m02/02-1-dmz-2.png "Endereço 172.16.10.1/24 e PING na DMZ" | **Addressing mode Manual**, **IP/Netmask** **172.16.10.1/255.255.255.0** (o gateway do SRV-WEB) e só **PING** em Administrative Access. **Create address object matching subnet** cria um objeto de endereço com a rede 172.16.10.0/24, que você vai usar nas policies. Clique em **OK**.
:::

#### Verificação: a topologia das conexões externas

:::figura midia/m02/02-1-topologia-wan.png "Topologia com WAN1, WAN2 e DMZ em destaque"
Os cabos das duas operadoras e da DMZ em destaque. Os cards mostram o resultado: **port1 (WAN1)** com 203.0.113.2/29, ligada ao gateway 203.0.113.1 da Operadora A; **port2 (WAN2)** com 200.160.21.34/29 recebido por **DHCP** da Operadora B; **port3 (DMZ)** com 172.16.10.1/24, ligada ao SRV-WEB (172.16.10.10).
:::

#### Erros comuns

- Esperar que uma interface com enlace ativo já deixe o tráfego passar: ainda faltam rota e firewall policy.
- Deixar HTTPS e SSH em Administrative Access na WAN, expondo a gerência à Internet.
- Ter duas rotas padrão (uma estática e uma de DHCP) concorrendo sem perceber.
- Deixar **Override internal DNS** ligado num link reserva e perder o DNS quando esse link cai.
- Achar que o role da interface cria regras de segurança.
- Colocar o servidor publicado na rede dos usuários em vez da DMZ.

:::cli Interfaces físicas e conexões WAN
### Interface com endereço fixo

```
config system interface
    edit "port1"
        set alias "WAN1"
        set role wan
        set mode static
        set ip 203.0.113.2 255.255.255.248
        set allowaccess ping
    next
end
```

`allowaccess` substitui a lista inteira. Para acrescentar um protocolo sem apagar os que já estão, use `append allowaccess ssh`; para tirar um, `unselect allowaccess ssh`.

### Cliente DHCP

```
config system interface
    edit "port2"
        set alias "WAN2"
        set role wan
        set mode dhcp
        set defaultgw enable
        set distance 5
        set dns-server-override enable
    next
end
```

- `defaultgw`: instala a rota padrão recebida (*Retrieve default gateway from server*).
- `distance`: distância administrativa dessa rota.
- `dns-server-override`: usa os DNS da operadora como DNS do sistema (*Override internal DNS*).

### Cliente PPPoE

```
config system interface
    edit "port2"
        set mode pppoe
        set username "atlas@operadorab"
        set password <senha>
    next
end
```

### Ligar e desligar uma interface

```
config system interface
    edit "port1"
        set status down
    next
end
```

`set status up` liga de novo.

### Estado das interfaces

```
get system interface physical
```

```saida
FGT-MTZ # get system interface physical
== [onboard]
        ==[port1]
                mode: static
                ip: 203.0.113.2 255.255.255.248
                ipv6: ::/0
                status: up
                speed: 1000Mbps (Duplex: full)
        ==[port2]
                mode: dhcp
                ip: 200.160.21.34 255.255.255.248
                ipv6: ::/0
                status: up
                speed: 1000Mbps (Duplex: full)
        ==[port3]
                mode: static
                ip: 172.16.10.1 255.255.255.0
                ipv6: ::/0
                status: up
                speed: 1000Mbps (Duplex: full)
        ==[port4]
                mode: static
                ip: 0.0.0.0 0.0.0.0
                ipv6: ::/0
                status: down
                speed: n/a
        ==[port5]
                mode: static
                ip: 0.0.0.0 0.0.0.0
                ipv6: ::/0
                status: up
                speed: 1000Mbps (Duplex: full)
...
```

Para cada porta física: o modo de endereçamento, o endereço em uso (inclusive o recebido por DHCP, como na port2), o estado do enlace e a velocidade negociada. A port4 está `down` porque não tem cabo; a port5 está `up` e sem endereço, porque só vai transportar VLANs.

### DDNS

```
config system ddns
    edit 1
        set ddns-server FortiGuardDDNS
        set ddns-domain "atlas-mtz.fortiddns.com"
        set monitor-interface "port2"
    next
end
```

### DMZ

```
config system interface
    edit "port3"
        set alias "DMZ"
        set role dmz
        set ip 172.16.10.1 255.255.255.0
        set allowaccess ping
    next
end
```
:::

---

## 02.2. VLANs

### 02.2.1. Conceito: várias redes no mesmo cabo

#### O problema que a VLAN resolve

Sem VLANs, cada rede precisa do seu próprio switch e do seu próprio cabo até o firewall. A Atlas teria três switches (usuários, servidores, convidados) e usaria três portas do FortiGate só para isso. Se a empresa criar uma rede para câmeras e outra para telefones, mais dois switches.

Uma **VLAN** (*Virtual LAN*) divide um switch físico em vários switches lógicos. Cada VLAN é um **domínio de broadcast** separado: um computador da VLAN 10 não enxerga os broadcasts da VLAN 20, não descobre os vizinhos dela e não fala com ela diretamente. Para ir de uma VLAN para outra, o tráfego **precisa passar por um roteador**, e na Atlas esse roteador é o FortiGate. Esse é o ponto que interessa para segurança: **todo tráfego entre VLANs atravessa o firewall e depende de uma policy**. Separar usuários, servidores e convidados em VLANs é a base da segmentação da rede.

Casos reais de segmentação por VLAN:

- **Convidados:** acesso só à Internet, nunca à rede interna.
- **Servidores:** só as portas necessárias liberadas a partir dos usuários.
- **Câmeras, impressoras e IoT:** dispositivos difíceis de atualizar, isolados para não servirem de porta de entrada.
- **Telefonia IP:** separada para receber prioridade de tráfego.
- **Ambientes regulados** (cartão de pagamento, área de saúde): isolados para limitar o escopo de auditoria.

#### Como a VLAN viaja no cabo: a tag 802.1Q

Dentro de um switch, cada porta pertence a uma VLAN. O problema aparece quando várias VLANs precisam passar pelo **mesmo cabo**, como entre o switch e o FortiGate. A solução é marcar cada quadro Ethernet com o número da VLAN. O padrão **IEEE 802.1Q** insere no quadro, logo depois dos endereços MAC, uma **etiqueta** (*tag*) de 4 bytes com:

- **TPID** (0x8100): avisa que o quadro tem tag;
- **prioridade** (3 bits), usada em qualidade de serviço;
- **VLAN ID** (12 bits): o número da VLAN, de **1 a 4094** (0 e 4095 são reservados).

Com isso, as portas do switch ficam de dois tipos:

| Tipo de porta | Também chamada | O que passa | Onde se usa |
|---|---|---|---|
| **Acesso** | *untagged* | Uma VLAN só, **sem** tag. O computador nem sabe que está numa VLAN | Portas dos computadores, impressoras, servidores |
| **Trunk** | *tagged* | Várias VLANs, cada quadro **com** a tag do seu VLAN ID | Ligação entre switches e entre o switch e o FortiGate |

O caminho de um quadro do PC-USUARIO até o FortiGate é este:

1. O PC envia um quadro comum, sem tag.
2. A porta 2 do SW-CORE é de acesso na VLAN 10: o switch sabe que o quadro é da VLAN 10.
3. Para sair pela porta 1 (trunk), o switch insere a tag com o VLAN ID 10.
4. O FortiGate recebe na port5, lê a tag 10 e entrega o quadro à **interface VLAN** com ID 10, a `vlan10`.
5. Na volta, o caminho é o inverso: a `vlan10` envia com a tag 10, e o switch tira a tag antes de entregar ao PC.

Um trunk também pode levar uma VLAN **sem** tag, a chamada **VLAN nativa**. No FortiGate, o que chega sem tag numa porta trunk é tratado pela **própria interface física** (a port5). A Atlas deixa a port5 **sem endereço**: quadros sem tag não têm para onde ir, o que evita que um equipamento ligado por engano a uma porta mal configurada caia numa rede válida.

#### No FortiGate: interface VLAN e interface pai

No FortiGate, cada VLAN é uma **interface VLAN** criada sobre uma interface física (ou uma agregação), chamada **interface pai**. Para todo o resto do FortiOS, a interface VLAN é uma interface comum: tem endereço, acesso administrativo, DHCP, e aparece nas policies e nas rotas. Esse desenho, um roteador ligado por um único trunk a várias VLANs, é chamado de *router on a stick*.

Na Atlas, a `port5` (alias INTERNA) vai até o SW-CORE e leva as três VLANs. O SW-CORE, administrado pela equipe de redes, já está configurado: porta 1 em trunk com as VLANs 10, 20 e 30; porta 2 em acesso na VLAN 10, porta 3 na VLAN 20 e porta 4 na VLAN 30.

:::figura midia/m02/02-2-topologia.png "Cabo trunk entre a port5 e o SW-CORE e os computadores de cada VLAN, com os cards em destaque"
O cabo entre a **port5** e o **SW-CORE** é o **trunk**: o card da port5 mostra **INTERNA**, sem endereço, com as **VLAN 10, 20, 30**, e o card do SW-CORE mostra **Trunk · INTERNA** com as mesmas VLANs. Cada computador está numa porta de acesso: PC-USUARIO na **VLAN 10**, SRV-AD na **VLAN 20** e NOTEBOOK-VISITA na **VLAN 30**. Os dois que usam DHCP ainda aparecem sem endereço.
:::

Detalhes que mudam o projeto:

- **A banda da interface pai é dividida.** As três VLANs compartilham o 1 Gbps da port5. Se o tráfego entre VLANs for grande (usuários copiando arquivos dos servidores, por exemplo), esse link vira gargalo. A solução usual é criar as VLANs sobre uma **agregação** de portas.
- **Tráfego entre VLANs entra e sai pela mesma porta física.** Um arquivo do SRV-AD para o PC-USUARIO chega à port5 com a tag 20 e sai pela port5 com a tag 10: conta duas vezes na banda da porta.
- **Cada VLAN precisa de uma sub-rede própria.** O FortiGate recusa duas interfaces com redes sobrepostas.

### 02.2.2. Na GUI: interface pai e VLANs

#### Passo 1: preparar a interface pai

A port5 não terá endereço, mas recebe alias e role para ficar identificada:

:::slides
midia/m02/02-2-interna-0.png "Linha da port5 selecionada e o botão Edit" | Em **Network > Interfaces**, selecione a **port5** e clique em **Edit**. Defina **Alias** **INTERNA** e **Role** **LAN**.
midia/m02/02-2-interna-1.png "port5 sem endereço e sem Administrative Access" | Deixe **IP/Netmask** em **0.0.0.0/0.0.0.0** e nenhum protocolo em **Administrative Access**: a port5 só transporta as VLANs. Clique em **OK**.
:::

#### Passo 2: criar a VLAN 10 (usuários)

:::slides
midia/m02/02-2-vlan-1.png "Menu Create new com a opção Interface" | Em **Network > Interfaces**, clique em **Create new > Interface**.
midia/m02/02-2-vlan-2.png "Nova interface vlan10 do tipo VLAN sobre a port5" | **Name:** `vlan10`. **Type:** **VLAN**. **Interface:** a interface pai, **INTERNA (port5)**. **VLAN ID:** **10**, o mesmo número configurado no switch. **Role:** **LAN**.
midia/m02/02-2-vlan-3.png "Endereço e Administrative Access da vlan10" | **IP/Netmask** **10.10.10.1/255.255.255.0**: esse é o **gateway** dos computadores da VLAN 10. **Create address object matching subnet** ligado, para criar o objeto da rede 10.10.10.0/24. Em **Administrative Access**, só **PING**. Clique em **OK**.
:::

O nome da interface VLAN é livre (até 15 caracteres). Usar o número da VLAN no nome (`vlan10`) facilita a leitura das policies e dos logs; algumas empresas preferem a função (`usuarios`). O que importa é manter um padrão.

#### Passo 3: VLAN 20 (servidores) e VLAN 30 (convidados)

As outras duas VLANs seguem o mesmo caminho: **Create new > Interface**, tipo VLAN sobre a port5, com o VLAN ID e o endereço de cada uma.

:::slides
midia/m02/02-2-vlan20-1.png "Nova interface vlan20 do tipo VLAN sobre a port5 com VLAN ID 20" | **VLAN 20:** **Name** `vlan20`, **Type** VLAN, **Interface** INTERNA (port5), **VLAN ID** **20**, **Role** LAN.
midia/m02/02-2-vlan20-2.png "Endereço 10.10.20.1/24 e PING na vlan20" | **IP/Netmask** **10.10.20.1/255.255.255.0** e **PING**. Clique em **OK**.
midia/m02/02-2-vlan30-1.png "Nova interface vlan30 do tipo VLAN sobre a port5 com VLAN ID 30" | **VLAN 30:** **Name** `vlan30`, **Type** VLAN, **Interface** INTERNA (port5), **VLAN ID** **30**, **Role** LAN.
midia/m02/02-2-vlan30-2.png "Endereço 10.10.30.1/24 e PING na vlan30" | **IP/Netmask** **10.10.30.1/255.255.255.0** e **PING**. Clique em **OK**.
midia/m02/02-2-vlan-4.png "As VLANs 10, 20 e 30 abaixo da port5" | A lista mostra as três VLANs **abaixo** da interface pai **INTERNA (port5)**, cada uma com seu endereço.
:::

Pontos importantes:

- A interface pai **não precisa de endereço**. Na Atlas, a `port5` só transporta as VLANs.
- Se a interface pai cair (cabo desligado ou status Disabled), **todas as VLANs dela caem** junto.
- Na mesma interface pai, cada VLAN ID só pode ser usado uma vez. Em interfaces pai diferentes, o mesmo ID pode se repetir, mas são redes diferentes (cada uma num trunk diferente).
- O **nome** da interface VLAN não pode ser alterado depois de criado. O VLAN ID pode ser editado, mas a comunicação para até o switch ser ajustado para o mesmo número.

> **Dica para a prova:** uma interface VLAN depende da interface física pai e **não muda o comportamento do firewall**: tráfego entre VLANs é tráfego entre interfaces e precisa de policy. O VLAN ID precisa ser igual dos dois lados do trunk: no FortiGate e na porta do switch.

#### Erros comuns

- VLAN ID diferente no FortiGate e no switch: os quadros chegam com uma tag que o FortiGate não espera e são descartados.
- Porta do switch que liga ao FortiGate configurada como acesso (*untagged*) em vez de trunk.
- VLAN que não foi incluída na lista de VLANs permitidas do trunk no switch.
- Concluir que a VLAN não funciona quando, na verdade, falta a firewall policy.
- Esquecer que todas as VLANs dividem a banda da interface pai.

:::cli VLANs
### Criar uma VLAN

```
config system interface
    edit "vlan10"
        set vdom "root"
        set interface "port5"
        set vlanid 10
        set role lan
        set ip 10.10.10.1 255.255.255.0
        set allowaccess ping
    next
end
```

`set interface` define a interface pai e `set vlanid` o número da VLAN. `set vdom` é obrigatório ao criar uma interface pela CLI. Para conferir:

```
show system interface vlan10
```

```saida
FGT-MTZ # show system interface vlan10
config system interface
    edit "vlan10"
        set vdom "root"
        set ip 10.10.10.1 255.255.255.0
        set allowaccess ping
        set role lan
        set interface "port5"
        set vlanid 10
    next
end
```

:::

---

## 02.3. Agrupamento e interfaces lógicas

### 02.3.1. Zones

#### Conceito: agrupar interfaces para simplificar as policies

Imagine que a Atlas tenha 10 VLANs internas e queira que todas acessem a Internet com as mesmas regras de segurança. Sem agrupamento, seriam 10 policies iguais, uma por VLAN, e cada mudança teria que ser repetida 10 vezes. Uma **zone** junta várias interfaces sob um único nome. Nas firewall policies, você usa a zone como interface de origem ou de destino, e a regra passa a valer para todas as interfaces dela.

O que a zone **não** faz:

- **não une as redes:** cada interface continua com seu endereço e sua sub-rede, e os broadcasts continuam separados;
- **não muda as rotas:** as rotas continuam apontando para as interfaces, não para a zone.

Regras de uso:

- Uma interface pertence a **no máximo uma** zone.
- Depois que a interface entra na zone, as policies passam a usar a **zone**; a interface sozinha deixa de aparecer como opção nas policies.
- Uma interface só entra em uma zone se **não estiver em uso** em policies, rotas ou outros objetos. Se estiver, a GUI recusa e mostra as referências. Por isso, planeje as zones **antes** de criar as policies.

**Block intra-zone traffic** controla o tráfego **entre membros da mesma zone** (de uma VLAN da zone para outra):

- **ligado:** o tráfego entre os membros é bloqueado, a não ser que uma policy da zone para ela mesma (INTERNAS → INTERNAS) o permita. É o padrão na CLI (`intrazone deny`);
- **desligado:** o tráfego entre os membros passa **sem nenhuma policy**, e por isso sem inspeção de segurança e sem log.

A Atlas agrupa usuários e servidores na zone **INTERNAS** e deixa o bloqueio **ligado**: o acesso dos usuários aos servidores vai ser controlado por policies, com as portas necessárias e com log. A VLAN de convidados fica de fora, porque terá regras próprias.

#### Na GUI: a zone INTERNAS

:::slides
midia/m02/02-3-zone-0.png "Botão Create new com a opção Zone" | Em **Network > Interfaces**, clique em **Create new > Zone**.
midia/m02/02-3-zone-sel.png "Seletor de interfaces com vlan10 e vlan20" | Dê o nome **INTERNAS**. Em **Interface members**, clique em **+** e escolha **vlan10** e **vlan20** (as duas ficam marcadas). Feche o seletor.
midia/m02/02-3-zone-1.png "Nova zone INTERNAS com Block intra-zone traffic ligado" | Confira: **Name** INTERNAS, **Block intra-zone traffic** **ligado** e os dois membros. Clique em **OK**.
midia/m02/02-3-zone-2.png "Zone INTERNAS na lista com os dois membros" | A zone aparece no grupo **Zone** da lista, com **vlan10** e **vlan20** como membros.
:::

> **Atenção:** desligar **Block intra-zone traffic** para "facilitar" é um erro comum de segurança. Todo o tráfego entre os membros passa a fluir sem policy, sem IPS, sem antivírus e sem log. Use zones com bloqueio desligado só quando os membros forem, de fato, a mesma rede de confiança.

### 02.3.2. Hardware switch e software switch

#### Conceito: várias portas na mesma rede

Às vezes você quer o contrário da zone: várias portas do FortiGate na **mesma rede**, com um endereço só, como num switch. É comum em escritórios pequenos, onde o FortiGate de mesa tem algumas portas de LAN e não há switch separado. O FortiGate oferece dois tipos:

- **Hardware switch:** as portas formam um switch no **chip** do equipamento. O tráfego entre elas é encaminhado pelo hardware, sem passar pela CPU nem pelo firewall. Só existe nos modelos que têm esse chip; nos modelos de mesa, é a interface que vem de fábrica com o nome `lan` ou `internal`.
- **Software switch:** o FortiGate une as interfaces numa ponte feita pela **CPU**. Pode juntar tipos diferentes, como uma porta física e uma rede Wi-Fi do próprio FortiGate, para que os computadores com fio e sem fio fiquem na mesma rede. É mais flexível, mas todo o tráfego entre os membros passa pela CPU.

:::figura midia/m02/02-3-software-switch.png "Formulário de software switch com as portas port10 e port11"
Em **Create new > Interface**, o tipo **Software Switch** pede os **Interface members** (aqui, port10 e port11). O switch recebe **um único endereço**, que vale para todas as portas, e os computadores ligados a elas ficam na mesma rede. (A Atlas não usa software switch; a tela foi cancelada.)
:::

Compare com a zone:

| | Zone | Software switch | Hardware switch |
|---|---|---|---|
| Endereçamento | Cada membro com sua rede | Um endereço para todos | Um endereço para todos |
| Domínio de broadcast | Separado por membro | Um só | Um só |
| Tráfego entre membros | Bloqueado ou exige policy (com Block intra-zone ligado) | Passa direto, sem policy | Passa direto, sem policy |
| Quem encaminha | O FortiGate roteia entre os membros | A CPU, como ponte | O chip de switch |
| Uso típico | Agrupar redes nas policies | Unir porta com fio e Wi-Fi | Portas de LAN dos modelos de mesa |

> **Dica para a prova:** zone agrupa interfaces **para as policies**; software e hardware switch juntam portas **numa mesma rede**. Uma zone não cria um domínio de broadcast comum.

### 02.3.3. Agregação (LACP) e interface redundante

#### Conceito: um link lógico feito de vários cabos

Duas ou mais portas físicas também podem formar **um único link lógico** com o switch. Há dois motivos: **banda** (somar a capacidade de vários cabos) e **disponibilidade** (continuar funcionando se um cabo, uma porta ou um transceiver falhar). O caso típico é a ligação entre o FortiGate e o switch central, por onde passa todo o tráfego entre VLANs.

**802.3ad Aggregate (LACP).** Todas as portas membro trabalham **ao mesmo tempo**. O FortiGate e o switch conversam pelo protocolo **LACP** (*Link Aggregation Control Protocol*): trocam mensagens periódicas para confirmar que cada cabo liga as duas pontas certas e tiram do grupo o membro que parar de responder. Do lado do switch, as portas precisam estar configuradas como um grupo LACP (o nome varia por fabricante: port-channel, LAG, trunk).

Como o tráfego é dividido entre os cabos? Por **fluxo**, não por pacote. O FortiGate calcula um *hash* com os endereços e as portas de cada conexão e escolhe um membro; todos os pacotes daquela conexão usam o mesmo membro, o que evita que cheguem fora de ordem. A consequência é importante: com duas portas de 1 Gbps, **uma** transferência de arquivo continua limitada a 1 Gbps. O ganho aparece com **muitas conexões** ao mesmo tempo, que é o caso real de uma empresa.

**Redundant Interface.** Só **uma** porta trabalha por vez; as outras ficam de reserva. Se a ativa cair, a seguinte assume. Não precisa de LACP, então funciona com switches simples, e até com dois switches diferentes que não formam um grupo, um em cada porta.

:::slides
midia/m02/02-3-aggregate.png "Formulário de agregação 802.3ad com port15 e port16" | **802.3ad Aggregate:** em **Create new > Interface**, o tipo **802.3ad Aggregate** com os **Interface members** port15 e port16.
midia/m02/02-3-redundante.png "Formulário de interface redundante com port15 e port16" | **Redundant Interface:** o mesmo formulário com o tipo **Redundant Interface**. A ordem dos membros define a porta preferida. (A Atlas não usa nenhum dos dois por enquanto; as telas foram canceladas.)
:::

| | 802.3ad Aggregate (LACP) | Redundant Interface |
|---|---|---|
| Portas ativas | Todas | Uma por vez |
| Banda total | Soma das portas (distribuída por conexão) | A de uma porta |
| Falha de uma porta | As outras continuam | A seguinte assume |
| Exigência no switch | Grupo LACP configurado nas portas | Portas na mesma rede, sem LACP |

Sobre uma agregação você pode criar VLANs, exatamente como sobre uma porta física. É o desenho mais comum em redes médias: um trunk com as VLANs internas sobre uma agregação até o switch central, com banda e redundância.

> **Dica para a prova:** LACP aumenta a banda total e a disponibilidade, mas não a velocidade de uma única conexão. A interface redundante só oferece failover.

### 02.3.4. Loopback e endereços secundários

#### Loopback: um endereço que não cai

Toda interface física depende de um cabo e de uma porta. Se o cabo da port1 sair, o endereço 203.0.113.2 deixa de responder. Uma **interface loopback** é uma interface lógica que **não depende de nenhuma porta**: enquanto o FortiGate estiver ligado, ela está no ar. Isso a torna útil sempre que você precisa de um endereço que continue alcançável por qualquer caminho:

- **Gerência:** em um FortiGate com vários links, a loopback é alcançável por qualquer um deles. Se um link cair, o monitoramento continua pelo outro.
- **Origem de serviços:** o FortiGate pode usar o endereço da loopback como origem dos logs, das consultas RADIUS e LDAP, das mensagens SNMP. O servidor de destino libera um único endereço, independentemente da interface de saída.
- **VPN e roteamento dinâmico:** VPNs terminadas na loopback e sessões BGP entre loopbacks sobrevivem à queda de uma das interfaces físicas.

:::slides
midia/m02/02-3-loopback.png "Nova interface loopback com o endereço 10.10.255.1/32" | Em **Create new > Interface**, **Name** `loop-ger`, **Type** **Loopback Interface**, **IP/Netmask** **10.10.255.1/255.255.255.255** e **PING**. A máscara /32 é a usual: a loopback representa um único endereço, não uma rede. Clique em **OK**.
midia/m02/02-3-loopback-lista.png "A loopback loop-ger na lista de interfaces" | A loopback aparece no grupo **Loopback Interface** da lista.
:::

> **Atenção:** diferente das outras interfaces, uma loopback é alcançada **atravessando** o FortiGate: o pacote chega por uma interface física (a vlan10, por exemplo) e vai para a loopback, que é outra interface. Por isso, para acessar a loopback a partir de outra rede, além do Administrative Access, é preciso uma **firewall policy** da interface de origem para a loopback. Quem vem de outro roteador também precisa de **rota** para o endereço da loopback.

#### Endereço secundário

Uma interface pode ter mais de um endereço. O **endereço secundário** resolve situações reais como:

- **Migração de endereçamento:** a DMZ vai mudar de 172.16.10.0/24 para 172.16.11.0/24. Com as duas redes na mesma interface, os servidores migram um a um, sem uma janela de parada para todos.
- **Rede que cresceu:** a sub-rede acabou e uma segunda sub-rede entra na mesma porta enquanto não se refaz o endereçamento.

:::slides
midia/m02/02-3-secundario-0.png "Linha da DMZ (port3) selecionada e o botão Edit" | Em **Network > Interfaces**, selecione a **DMZ (port3)** e clique em **Edit**.
midia/m02/02-3-secundario.png "Endereço secundário 172.16.11.1/24 na interface DMZ" | Ative **Secondary IP address** e informe o endereço adicional: **172.16.11.1/255.255.255.0**. Cada endereço secundário tem o seu próprio Administrative Access. (A Atlas não migrou a DMZ; a tela foi cancelada.)
:::

Os dois endereços ficam na mesma interface, e o FortiGate roteia entre as duas sub-redes. Como o tráfego entre elas entra e sai pela **mesma interface**, ele também precisa de uma policy da DMZ para a DMZ. O endereço secundário é uma solução de transição; para separar redes de forma permanente, use VLANs.

#### Erros comuns

- Esperar que uma zone una as redes dos membros, como um switch.
- Desligar **Block intra-zone traffic** sem perceber que o tráfego entre os membros passa sem policy e sem log.
- Tentar colocar em uma zone uma interface que já é usada por policies ou rotas.
- Esperar que LACP aumente a velocidade de uma única conexão.
- Configurar a agregação no FortiGate e esquecer o grupo LACP no switch.
- Esquecer a firewall policy (e a rota, vindo de outro roteador) para alcançar uma loopback.

:::cli Agrupamento e interfaces lógicas
### Zone

```
config system zone
    edit "INTERNAS"
        set interface "vlan10" "vlan20"
        set intrazone deny
    next
end
```

`intrazone deny` bloqueia o tráfego entre os membros (*Block intra-zone traffic*) e é o padrão; `intrazone allow` permite sem policy.

```
show system zone
```

```saida
FGT-MTZ # show system zone
config system zone
    edit "INTERNAS"
        set interface "vlan10" "vlan20"
        set uuid 9b1fe590-9e1f-ea49-9d1f-e8b6a01f
    next
end
```

O `show` só mostra o que é diferente do padrão: como a zone usa `intrazone deny`, a linha não aparece. O `uuid` é o identificador interno do objeto, usado em logs e na integração com outros produtos.

### Software switch

```
config system switch-interface
    edit "sw-lab"
        set member "port10" "port11"
    next
end
```

O endereço do software switch é configurado em `config system interface`, na interface `sw-lab`.

### Agregação 802.3ad

```
config system interface
    edit "agg-srv"
        set vdom "root"
        set type aggregate
        set member "port15" "port16"
        set lacp-mode active
    next
end
```

- `lacp-mode active`: o FortiGate inicia a negociação LACP; `passive`: só responde; `static`: agrega sem LACP (os dois lados precisam estar fixos, sem detecção de falha pelo protocolo).

### Interface redundante

```
config system interface
    edit "red-srv"
        set vdom "root"
        set type redundant
        set member "port15" "port16"
    next
end
```

A ordem dos membros define a porta preferida.

### Loopback

```
config system interface
    edit "loop-ger"
        set vdom "root"
        set type loopback
        set ip 10.10.255.1 255.255.255.255
        set allowaccess ping
    next
end
```

### Endereço secundário

```
config system interface
    edit "port3"
        set secondary-IP enable
        config secondaryip
            edit 1
                set ip 172.16.11.1 255.255.255.0
                set allowaccess ping
            next
        end
    next
end
```
:::

---

## 02.4. Roteamento: rotas iniciais e testes

### 02.4.1. Como o FortiGate escolhe o caminho

#### A tabela de rotas

Para encaminhar um pacote, o FortiGate olha o **endereço de destino** e consulta a **tabela de rotas**: a lista de redes que ele sabe alcançar, com a interface de saída e o próximo salto (*gateway*) de cada uma. Se não houver rota para o destino, o pacote é descartado. Isso vale antes de qualquer firewall policy: a rota define a **interface de saída**, e só então o FortiGate procura uma policy da interface de entrada para essa interface de saída.

As rotas vêm de quatro fontes:

| Tipo | De onde vem | Exemplo na Atlas |
|---|---|---|
| **Conectada** | Criada automaticamente para a rede de cada interface com endereço e enlace ativo | 10.10.10.0/24 pela vlan10 |
| **Estática** | Criada por você, em **Network > Static Routes** | A rota padrão pela WAN1 |
| **Recebida por DHCP ou PPPoE** | O gateway informado pela operadora | A rota padrão pela WAN2 |
| **Dinâmica** | Aprendida de outros roteadores por OSPF, BGP ou RIP | Usada com filiais e grandes redes, em módulos próprios |

A **rota padrão** (0.0.0.0/0) casa com **qualquer** destino. Ela é usada quando não há rota mais específica e, na prática, aponta para a Internet: "tudo o que eu não conheço, mande para a operadora".

#### Rota estática: quando e por que criar

Uma **rota estática** é uma instrução fixa que você escreve: "para chegar à rede X, saia pela interface Y e entregue ao roteador Z". O FortiGate não descobre sozinho as redes que estão **atrás** de outros roteadores; só conhece as redes das próprias interfaces. Tudo o que fica além precisa de uma rota estática ou de um protocolo de roteamento dinâmico.

Casos reais de rota estática:

- **Rota padrão para a Internet** por um link com IP fixo, como a WAN1 da Atlas.
- **Rede atrás de outro roteador interno:** um laboratório ou uma rede de automação industrial atrás de um roteador ligado à VLAN de servidores. O FortiGate precisa de uma rota para 192.168.50.0/24 pelo IP desse roteador.
- **Rede de um parceiro por um link dedicado** (MPLS, ponto a ponto): rota para a rede do parceiro pelo roteador do link.
- **Redes de filiais por VPN:** rota para a rede da filial pela interface do túnel.
- **Rota de descarte** (*blackhole*): rotas para faixas privadas que não existem na empresa, com interface **Blackhole**, para que esse tráfego seja descartado em vez de ir para a Internet pela rota padrão. Em VPNs, garante que o tráfego da filial seja descartado (e não vazado pela Internet) enquanto o túnel estiver fora.

A rota estática é simples e previsível, mas **não percebe falhas além da interface**. Se o roteador da Operadora A continuar com o cabo ligado e a Internet dele parar, a interface continua Up e a rota continua ativa, levando o tráfego para um link sem saída. Para isso existem o *link monitor* (o FortiGate testa um destino pelo gateway e desativa a rota se o teste falhar) e o SD-WAN, assunto mais adiante no curso.

#### Como o FortiGate decide entre várias rotas

Quando mais de uma rota casa com o destino, o FortiGate decide nesta ordem:

1. **Prefixo mais específico** (*longest prefix match*). Para o destino 10.20.5.9, uma rota para 10.20.5.0/24 ganha de uma rota para 10.20.0.0/16, que ganha da rota padrão 0.0.0.0/0. A mais específica vence **sempre**, qualquer que seja a distância.
2. **Menor distância administrativa**, entre rotas para o **mesmo** prefixo. Só a vencedora entra na tabela de rotas ativa; as outras ficam guardadas em uma base separada, inativas, prontas para assumir se a vencedora sumir (a interface cair, por exemplo).
3. **Menor prioridade**, entre rotas com o **mesmo prefixo e a mesma distância**. Diferente da distância, rotas com a mesma distância **ficam todas** na tabela ativa; a prioridade (padrão 1 nas rotas estáticas, quanto menor, melhor) escolhe qual é usada.
4. **ECMP** (*Equal-Cost Multi-Path*): mesmo prefixo, mesma distância e mesma prioridade. O FortiGate divide as conexões entre as rotas, por padrão pelo endereço de origem.

| Origem da rota | Distância padrão |
|---|---|
| Rede conectada | 0 |
| Rota recebida por DHCP ou PPPoE | 5 |
| Rota estática | 10 |
| eBGP | 20 |
| OSPF | 110 |
| iBGP | 200 |

> **Dica para a prova:** distância decide **qual rota entra** na tabela ativa; prioridade decide **qual rota ativa é usada** quando as distâncias empatam. Uma rota com distância maior não aparece na tabela ativa; uma rota com prioridade maior aparece, mas não é usada enquanto a de prioridade menor existir.

### 02.4.2. Na GUI: rota padrão pela WAN1

:::slides
midia/m02/02-4-menu-rotas.png "Menu Network com o item Static Routes" | Abra **Network > Static Routes**.
midia/m02/02-4-rota-0.png "Lista de rotas estáticas vazia e o botão Create new" | A lista ainda está vazia. Clique em **Create new**.
midia/m02/02-4-rota-sel.png "Seletor de interfaces com a port1 (WAN1)" | **Destination:** **Subnet**, com **0.0.0.0/0.0.0.0** (a rota padrão). Em **Interface**, clique em **+** e escolha a **port1** (WAN1).
midia/m02/02-4-rota-1.png "Nova rota estática 0.0.0.0/0 pela WAN1" | Confira: **Destination** 0.0.0.0/0.0.0.0, **Interface** WAN1 (port1), **Gateway Address** **203.0.113.1** (o roteador da Operadora A) e **Administrative Distance** **10**, o padrão.
midia/m02/02-4-rota-prioridade.png "Advanced Options com o campo Priority" | Em **Advanced Options** fica a **Priority** (padrão **1**), usada para desempatar rotas com a mesma distância. Clique em **OK**.
midia/m02/02-4-rota-2.png "A rota padrão pela WAN1 na lista" | A rota aparece na lista, com o gateway, a interface e o status **Enabled**.
:::

O campo **Destination** tem outras duas opções: **Named Address**, que usa um objeto de endereço como destino, e **Internet Service**, que usa a base de serviços de Internet do FortiGuard (por exemplo, todas as redes do Microsoft 365) para mandar o tráfego de um serviço por um link específico. O **Gateway Address** é obrigatório em interfaces Ethernet: o FortiGate precisa saber a qual equipamento entregar o pacote. Em interfaces ponto a ponto, como PPPoE e túneis VPN, ele não é necessário.

### 02.4.3. A disputa entre as duas rotas padrão

Agora o FGT-MTZ tem **duas** rotas padrão: a estática pela WAN1 (distância 10) e a recebida por DHCP pela WAN2 (distância 5). Mesmo prefixo, distâncias diferentes: vence a menor.

:::slides
midia/m02/02-4-rotas-antes.png "Tabela de rotas com a rota padrão ativa pela WAN2" | Em **Dashboard > Network Monitor > Routing**, a rota padrão ativa continua sendo a da **WAN2**, com distância **5**. A estática pela WAN1 foi criada, mas perdeu e está fora da tabela ativa. Todo o tráfego para a Internet sairia pelo link reserva.
midia/m02/02-4-wan2-0.png "Linha da WAN2 selecionada e o botão Edit" | Para a WAN1 ser a principal, a Atlas aumenta a distância da rota recebida pela WAN2. Em **Network > Interfaces**, selecione a **WAN2 (port2)** e clique em **Edit**.
midia/m02/02-4-wan2-distancia.png "Distância da rota DHCP da WAN2 alterada para 20" | Em **Distance**, digite **20** e clique em **OK**.
midia/m02/02-4-rotas-depois.png "Tabela de rotas com a rota padrão ativa pela WAN1" | Agora a rota padrão ativa é a da **WAN1** (distância 10). A da WAN2 (distância 20) continua configurada, guardada como reserva: se a WAN1 cair, ela volta para a tabela ativa.
:::

Há três formas de resolver a disputa, cada uma com um efeito diferente:

| Solução | Efeito |
|---|---|
| Aumentar a **distância** da rota da WAN2 (a escolha da Atlas) | Só a WAN1 é usada. A WAN2 assume se a **interface** WAN1 cair |
| Desligar **Retrieve default gateway from server** na WAN2 | A WAN2 nunca é usada como saída para a Internet |
| Mesma distância nas duas e **prioridades** diferentes | As duas rotas ficam ativas; a de menor prioridade é usada. Útil quando outras funções precisam ver as duas rotas ativas |

Lembre a limitação da rota estática: o failover acima só acontece se a **interface** WAN1 cair. Uma falha no meio do caminho, dentro da operadora, não derruba a interface. Por isso, num ambiente real com dois links, use *link monitor* ou SD-WAN. O SD-WAN também permite usar os dois links ao mesmo tempo, com escolha por aplicação e qualidade do link.

> **Atenção:** ter rota **não autoriza** o tráfego, e uma firewall policy **não substitui** uma rota. Para uma conexão atravessar o FortiGate, ela precisa de uma rota para o destino **e** de uma policy que a permita. E a **volta** também precisa de rota: o FortiGate confere se a origem de um pacote é alcançável pela interface por onde ele chegou (*reverse path check*). Se não for, o pacote é descartado, mesmo com policy.

### 02.4.4. Ping e traceroute a partir do FortiGate

O FortiGate tem ferramentas de teste na CLI. Para usá-las sem sair da GUI, abra a **CLI Console**:

:::slides
midia/m02/02-4-cli-0.png "Botão da CLI na barra superior e a opção CLI Console" | Na barra superior, clique no botão **>_** e em **CLI Console**.
midia/m02/02-4-ping.png "Ping e traceroute a partir do FortiGate na CLI Console" | Na CLI Console: a tabela de rotas, um `execute ping 8.8.8.8`, o mesmo ping com **origem** 10.10.10.1 e um `execute traceroute 8.8.8.8`, que mostra cada salto até o destino, começando pelo gateway da WAN1 (203.0.113.1).
:::

O que cada teste prova:

- **`execute ping`** envia pacotes ICMP a partir do próprio FortiGate. A resposta prova que o FortiGate tem rota para o destino e que o caminho funciona **para ele**.
- **`execute ping-options source`** muda o endereço de origem. Por padrão, o FortiGate usa o endereço da interface de saída (aqui, 203.0.113.2). Com origem 10.10.10.1 (a vlan10), a resposta precisa **voltar** para a rede dos usuários; se falhar, o problema está no caminho de volta (rota do outro lado, NAT, policy).
- **`execute traceroute`** mostra cada roteador do caminho e o tempo até ele. Serve para ver **onde** o caminho para: se o primeiro salto (o gateway da operadora) responde e o segundo não, o problema está na operadora, não no FortiGate.

Os comandos e as saídas completas estão no Guia de comandos CLI deste capítulo. O teste a partir de um computador da rede vem no capítulo de DHCP, assim que o computador receber um endereço.

> **Dica para a prova:** o tráfego **gerado pelo próprio FortiGate** (ping, traceroute, consultas ao FortiGuard) não passa pelas firewall policies. Por isso, um teste a partir do FortiGate não prova que um cliente alcança o mesmo destino.

#### Erros comuns

- Criar a rota padrão estática e não perceber que a rota do DHCP (distância 5) continua vencendo.
- Esperar que a rota estática mude de link quando a Internet da operadora falha, mas a interface continua Up.
- Achar que uma rota libera o tráfego, ou que uma policy dispensa a rota.
- Esquecer a rota de volta quando há outro roteador no caminho.
- Testar a partir do FortiGate e concluir que o cliente também alcança o destino.

:::cli Rotas iniciais e testes
### Rota padrão estática

```
config router static
    edit 0
        set dst 0.0.0.0 0.0.0.0
        set gateway 203.0.113.1
        set device "port1"
        set distance 10
        set priority 1
    next
end
```

`edit 0` cria uma entrada com o próximo número livre.

### Distância da rota recebida por DHCP

```
config system interface
    edit "port2"
        set distance 20
    next
end
```

### Rota de descarte

```
config router static
    edit 0
        set dst 10.0.0.0 255.0.0.0
        set blackhole enable
        set distance 254
    next
end
```

Com distância 254, a rota de descarte só é usada quando não existe nenhuma outra rota para a faixa.

### Monitorar o gateway (link monitor)

```
config system link-monitor
    edit "mon-wan1"
        set srcintf "port1"
        set server "8.8.8.8"
        set gateway-ip 203.0.113.1
    next
end
```

Se o destino parar de responder pelo gateway, o FortiGate desativa as rotas que usam esse gateway, e a rota reserva assume.

### Tabela de rotas

```
get router info routing-table all
```

Antes de ajustar a distância da WAN2:

```saida
FGT-MTZ # get router info routing-table all
Codes: K - kernel, C - connected, S - static, R - RIP, B - BGP
       O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, L1 - IS-IS level-1, L2 - IS-IS level-2, ia - IS-IS inter area
       V - BGP VPNv4
       * - candidate default

Routing table for VRF=0
S*      0.0.0.0/0 [5/0] via 200.160.21.33, port2, [1/0]
C       10.10.10.0/24 is directly connected, vlan10
C       10.10.20.0/24 is directly connected, vlan20
C       10.10.30.0/24 is directly connected, vlan30
C       10.10.99.0/24 is directly connected, mgmt
C       172.16.10.0/24 is directly connected, port3
C       200.160.21.32/29 is directly connected, port2
C       203.0.113.0/29 is directly connected, port1
```

Depois:

```saida
FGT-MTZ # get router info routing-table all
...
Routing table for VRF=0
S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0]
C       10.10.10.0/24 is directly connected, vlan10
C       10.10.20.0/24 is directly connected, vlan20
C       10.10.30.0/24 is directly connected, vlan30
C       10.10.99.0/24 is directly connected, mgmt
C       172.16.10.0/24 is directly connected, port3
C       200.160.21.32/29 is directly connected, port2
C       203.0.113.0/29 is directly connected, port1
```

Como ler cada linha:

- A letra do começo é o tipo: **S** estática (a recebida por DHCP também aparece como S), **C** conectada. O **\*** marca a rota padrão candidata.
- **[10/0]** é **[distância/métrica]**.
- **via 203.0.113.1, port1** é o gateway e a interface de saída.
- **[1/0]** no fim é **[prioridade/peso]**.

Repare que a rota da WAN2 some da tabela ativa depois do ajuste: com distância 20, ela perdeu e ficou guardada como reserva.

### Ping e traceroute

```
execute ping 8.8.8.8
```

```saida
FGT-MTZ # execute ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8): 56 data bytes
64 bytes from 8.8.8.8: icmp_seq=0 ttl=55 time=126.6 ms
64 bytes from 8.8.8.8: icmp_seq=1 ttl=55 time=126.4 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=55 time=126.7 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=55 time=126.2 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=55 time=127.5 ms

--- 8.8.8.8 ping statistics ---
5 packets transmitted, 5 packets received, 0% packet loss
round-trip min/avg/max = 126.2/126.7/127.5 ms
```

Com origem na vlan10:

```
execute ping-options source 10.10.10.1
execute ping 8.8.8.8
execute ping-options reset
```

```saida
FGT-MTZ # execute ping-options source 10.10.10.1
FGT-MTZ # execute ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8): 56 data bytes
64 bytes from 8.8.8.8: icmp_seq=0 ttl=55 time=126.1 ms
64 bytes from 8.8.8.8: icmp_seq=1 ttl=55 time=126.3 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=55 time=127.7 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=55 time=127.6 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=55 time=127.8 ms

--- 8.8.8.8 ping statistics ---
5 packets transmitted, 5 packets received, 0% packet loss
round-trip min/avg/max = 126.1/127.1/127.8 ms
FGT-MTZ # execute ping-options reset
```

As opções valem para os próximos pings da sessão até o `reset`. Outras opções úteis: `repeat-count` (quantidade de pacotes), `data-size` (tamanho, útil para testar MTU) e `df-bit` (não fragmentar).

```
execute traceroute 8.8.8.8
```

```saida
FGT-MTZ # execute traceroute 8.8.8.8
traceroute to 8.8.8.8 (8.8.8.8), 32 hops max, 3 probe packets per hop, 84 byte packets
 1  203.0.113.1  19.694 ms  19.420 ms  18.655 ms
 2  100.64.1.1  43.484 ms  43.490 ms  44.947 ms
 3  100.65.34.9  89.463 ms  89.221 ms  89.314 ms
 4  8.8.8.8  127.371 ms  127.648 ms  127.187 ms
```

Cada linha é um roteador do caminho, com três medições de tempo. O primeiro salto é o gateway da WAN1, o que confirma que o tráfego está saindo pela Operadora A.
:::

---

## 02.5. DHCP

### 02.5.1. Como o DHCP funciona

#### Por que DHCP

Cada computador precisa de quatro informações para usar a rede: **endereço IP**, **máscara**, **gateway** e **servidores DNS**. Configurar isso à mão em centenas de computadores é lento e gera erros: endereços duplicados, gateway errado, notebook que não funciona quando muda de sala. O **DHCP** (*Dynamic Host Configuration Protocol*) entrega essas informações automaticamente, a partir de uma faixa de endereços que o administrador define (o **escopo**).

O FortiGate pode ser o servidor DHCP de cada rede: cada interface com o DHCP Server ligado tem o seu escopo. É a escolha comum em filiais e empresas sem servidor dedicado; empresas com Active Directory costumam usar o DHCP do Windows Server e configurar o FortiGate como **relay** (você vai ver isso no fim do capítulo).

#### As quatro mensagens: DORA

Quando o computador liga, ele não tem endereço, não sabe quem é o servidor e não sabe qual é a rede. A negociação acontece com mensagens UDP (portas 67 no servidor e 68 no cliente) e segue quatro passos, conhecidos pela sigla **DORA**:

1. **Discover:** o computador envia um pedido para **toda a rede** (broadcast, destino 255.255.255.255): "existe algum servidor DHCP aqui?".
2. **Offer:** o servidor (o FortiGate, na interface vlan10) responde com uma oferta: um endereço livre da faixa e as opções (máscara, gateway, DNS, tempo de concessão).
3. **Request:** o computador aceita a oferta, de novo por broadcast. Isso avisa outros servidores que tenham feito ofertas de que elas foram recusadas.
4. **Acknowledge:** o servidor confirma e registra a **concessão** (*lease*): aquele endereço é daquele MAC até o fim do prazo.

O endereço não é do computador para sempre. Ao chegar à **metade** do prazo, o computador pede a renovação diretamente ao servidor; se o servidor não responder, ele tenta de novo perto do fim do prazo e, se nada funcionar, perde o endereço. Um prazo longo (o padrão do FortiGate é **7 dias**) funciona bem para computadores fixos; redes de visitantes, onde os aparelhos vêm e vão, usam prazos curtos (algumas horas) para que a faixa não se esgote com aparelhos que já foram embora.

Como o Discover é um broadcast, ele **não atravessa roteadores**: só chega ao servidor que está na mesma rede. É por isso que o DHCP é configurado **por interface** no FortiGate, e é por isso que existe o relay.

### 02.5.2. Na GUI: DHCP nas VLANs de usuários e convidados

O DHCP Server fica na própria edição da interface. Na vlan10:

:::slides
midia/m02/02-5-dhcp-0.png "Linha da vlan10 selecionada e o botão Edit" | Em **Network > Interfaces**, selecione a **vlan10** e clique em **Edit**.
midia/m02/02-5-dhcp-toggle.png "Seção DHCP Server da vlan10, ainda desligada" | Role até a seção **DHCP Server**, que está desligada, e ligue a chave.
midia/m02/02-5-dhcp-1.png "DHCP Server da vlan10 com faixa, gateway e DNS" | **Address range:** **10.10.10.100** a **10.10.10.200**. **Netmask:** 255.255.255.0. **Default gateway:** *Same as Interface IP* (10.10.10.1). **DNS server:** *Same as Interface IP*, porque o FortiGate também vai responder DNS para essa rede. **Lease time:** 604800 segundos (7 dias).
midia/m02/02-5-dhcp-2-0.png "Link Advanced do DHCP Server" | Clique em **Advanced** para ver as opções avançadas.
midia/m02/02-5-dhcp-2.png "Opções avançadas do DHCP Server" | **Mode:** **Server** (o FortiGate entrega os endereços) ou **Relay** (encaminha a outro servidor). **NTP server**, **Time zone** e **Next bootstrap server**/**TFTP server(s)** são opções extras entregues aos clientes. **Additional DHCP Options** permite enviar qualquer opção pelo número. Clique em **OK**.
:::

Por que a faixa vai de .100 a .200 e não de .1 a .254? Porque o começo da rede fica reservado para endereços fixos: o próprio FortiGate (.1), impressoras, equipamentos de rede. Um erro comum é incluir na faixa um endereço já usado por um equipamento fixo: o DHCP entrega o mesmo endereço a outro aparelho, e os dois param de funcionar de forma intermitente.

O campo **DNS server** tem três opções, com efeitos bem diferentes:

| Opção | O que o computador recebe | Quando usar |
|---|---|---|
| **Same as System DNS** | Os mesmos servidores que o FortiGate usa (os do módulo 01) | Redes que só precisam de DNS da Internet, como convidados |
| **Same as Interface IP** | O endereço do próprio FortiGate na interface | Quando o FortiGate responde DNS para a rede (exige o serviço DNS ligado na interface) |
| **Specify** | Servidores que você digita | Redes com Active Directory: os computadores do domínio precisam usar o DNS do AD |

As **opções adicionais** são usadas por equipamentos específicos. Exemplos reais: a opção 66 informa o servidor TFTP de onde os telefones IP baixam a configuração; a opção 43 informa aos access points onde está o controlador; a opção 42 informa o servidor NTP.

A vlan30, de convidados, também recebe DHCP, com a faixa 10.10.30.100 a 10.10.30.200:

:::slides
midia/m02/02-5-dhcp-vlan30-0.png "Linha da vlan30 selecionada e o botão Edit" | Selecione a **vlan30** e clique em **Edit**. Ligue o **DHCP Server**.
midia/m02/02-5-dhcp-vlan30.png "DHCP Server da vlan30 com DNS do sistema" | **Address range** **10.10.30.100** a **10.10.30.200**, gateway *Same as Interface IP* e **DNS server** **Same as System DNS**: os convidados usam os servidores DNS públicos que o FortiGate usa, e não enxergam os nomes internos da Atlas. Clique em **OK**.
:::

A vlan20, de servidores, fica sem DHCP: servidores usam endereço fixo, porque outros equipamentos e as policies apontam para eles pelo endereço.

### 02.5.3. Verificação: o computador recebe o endereço

Para ver o resultado do lado do cliente, use o PC-USUARIO, na VLAN 10:

:::slides
midia/m02/02-5-pc-topo.png "PC-USUARIO na topologia, ligado à porta 2 do SW-CORE, na VLAN 10" | O **PC-USUARIO** está ligado à porta 2 do SW-CORE, em acesso na **VLAN 10**. O card mostra o endereço recebido por **DHCP**.
midia/m02/02-5-pc-desktop.png "Barra de tarefas do PC-USUARIO com o Terminal em destaque" | Na área de trabalho do PC-USUARIO, abra o **Terminal** pela barra de tarefas.
midia/m02/02-5-pc-ipconfig.png "ipconfig /all no PC-USUARIO" | `ipconfig /all` mostra o que o PC recebeu: endereço **10.10.10.100** (o primeiro da faixa), máscara 255.255.255.0, gateway **10.10.10.1** e DNS **10.10.10.1**.
midia/m02/02-4-pc-ping.png "Ping do PC-USUARIO: responde o gateway, mas não a Internet" | `ping 10.10.10.1` responde: o pacote é **destinado ao próprio FortiGate**, e o PING está liberado na vlan10. `ping 8.8.8.8` falha: esse pacote precisa **atravessar** o FortiGate, da vlan10 para a WAN1, e ainda não existe firewall policy para isso.
:::

Compare os testes deste módulo e o que cada um prova:

| Teste | O que comprova |
|---|---|
| Ping do FortiGate para a Internet | O FortiGate tem rota e conectividade |
| Ping do FortiGate com origem na rede interna | As respostas conseguem voltar para a rede interna |
| `ipconfig` no computador | O DHCP funcionou: endereço, gateway e DNS corretos |
| Ping do computador para o gateway | O computador está na rede certa e o FortiGate responde |
| Ping do computador para a Internet | Rota **e** firewall policy (e NAT) estão funcionando |

No FortiGate, a lista de concessões mostra quem recebeu cada endereço:

:::slides
midia/m02/02-5-menu-assets.png "Menu Dashboard com o item Asset and Identities" | Abra **Dashboard > Asset and Identities**.
midia/m02/02-5-leases.png "Aba DHCP com os leases do PC-USUARIO e do NOTEBOOK-VISITA" | Na aba **DHCP**, cada concessão: o dispositivo, o **IP**, a **interface**, o **MAC**, se é reservado e quando expira. O PC-USUARIO recebeu 10.10.10.100 na vlan10 e o NOTEBOOK-VISITA, 10.10.30.100 na vlan30.
midia/m02/02-5-reserva.png "Menu do botão direito no lease com Create DHCP Reservation" | Clique com o botão direito em uma concessão para **Revoke Lease(s)** (liberar o endereço) ou **Create DHCP Reservation**, que fixa aquele endereço para aquele MAC.
:::

> **Na prática:** use **reservas** para impressoras, câmeras, coletores e outros equipamentos que precisam manter sempre o mesmo endereço, mas não têm (ou não convém ter) IP fixo configurado no próprio aparelho. A configuração fica centralizada no FortiGate, e trocar o endereço de uma impressora vira uma alteração em um lugar só.

### 02.5.4. DHCP relay

#### Conceito: levar o pedido até um servidor em outra rede

Muitas empresas já têm um servidor DHCP central, como o do Windows Server com Active Directory: ele registra os computadores no DNS do domínio e mantém o histórico de endereços em um lugar só. Mas, como o Discover é um broadcast, ele não chega a um servidor que está em outra rede.

O **DHCP relay** resolve isso. A interface do FortiGate escuta o broadcast do computador e o reencaminha ao servidor como um pacote comum (unicast). No pedido encaminhado, o FortiGate escreve o próprio endereço daquela interface (no campo *gateway address*, ou *giaddr*). É por esse campo que o servidor sabe **de qual rede** veio o pedido e escolhe o escopo certo; a resposta volta para o FortiGate, que a entrega ao computador.

Casos reais:

- **Active Directory:** os computadores dos usuários recebem endereço do DHCP do Windows Server, que atualiza o DNS do domínio.
- **Filiais pela VPN:** o DHCP fica centralizado na matriz, e o FortiGate de cada filial faz relay pelo túnel (o tipo **IPsec** do relay existe para isso).

:::figura midia/m02/02-5-relay.png "DHCP no modo Relay encaminhando para 10.10.20.10"
Na edição da interface, em **DHCP Server > Advanced**, mude o **Mode** para **Relay** e informe o **DHCP Server IP**: o endereço do servidor DHCP (aqui, o SRV-AD, 10.10.20.10). O servidor precisa ter um escopo para a rede da interface. (A Atlas mantém o DHCP no FortiGate; a tela foi cancelada.)
:::

| | DHCP Server | DHCP Relay |
|---|---|---|
| Quem entrega o endereço | O FortiGate | Outro servidor |
| Onde ficam escopo, reservas e concessões | No FortiGate | No servidor |
| O que o FortiGate faz | Responde ao pedido | Encaminha o pedido e a resposta |
| O que o servidor precisa ter | — | Um escopo para cada rede atendida |

> **Atenção:** em uma interface, use **um** dos dois: DHCP Server **ou** relay. E o caminho entre o FortiGate e o servidor DHCP precisa funcionar: rota até o servidor e, se houver outro firewall no meio, a liberação das portas UDP 67 e 68.

#### Erros comuns

- Escopo sem DNS, ou com o DNS errado: o computador recebe endereço, mas não resolve nomes.
- Entregar o FortiGate como DNS (*Same as Interface IP*) sem ligar o serviço DNS na interface.
- Faixa de endereços que inclui o endereço do FortiGate ou de equipamentos com IP fixo.
- Prazo de concessão longo numa rede de visitantes, esgotando a faixa.
- DHCP Server e relay na mesma interface.
- Relay configurado sem escopo correspondente no servidor.

:::cli DHCP
### DHCP server

```
config system dhcp server
    edit 0
        set interface "vlan10"
        set default-gateway 10.10.10.1
        set netmask 255.255.255.0
        set dns-service local
        set lease-time 604800
        config ip-range
            edit 1
                set start-ip 10.10.10.100
                set end-ip 10.10.10.200
            next
        end
    next
end
```

- `dns-service local`: o DNS entregue é o próprio FortiGate (*Same as Interface IP*); `default`: o DNS do sistema (*Same as System DNS*); `specify`: os servidores de `dns-server1` a `dns-server4`.
- `lease-time` em segundos: 604800 = 7 dias.

Para ver os escopos:

```
show system dhcp server
```

```saida
FGT-MTZ # show system dhcp server
config system dhcp server
    edit 1
        set default-gateway 10.255.1.1
        set netmask 255.255.255.0
        set interface "fortilink"
        config ip-range
            edit 1
                set end-ip 10.255.1.254
                set start-ip 10.255.1.2
            next
        end
    next
    edit 2
        set dns-service local
        set default-gateway 10.10.10.1
        set netmask 255.255.255.0
        set interface "vlan10"
        config ip-range
            edit 1
                set end-ip 10.10.10.200
                set start-ip 10.10.10.100
            next
        end
    next
    edit 3
        set default-gateway 10.10.30.1
        set netmask 255.255.255.0
        set interface "vlan30"
        config ip-range
            edit 1
                set end-ip 10.10.30.200
                set start-ip 10.10.30.100
            next
        end
    next
end
```

O escopo 1 já vem de fábrica, na interface `fortilink`, para os FortiSwitches. Os escopos 2 (vlan10) e 3 (vlan30) são os da Atlas. No escopo da vlan30 não aparecem `dns-service` nem `lease-time` porque estão no padrão (DNS do sistema e 7 dias).

### Reserva por MAC

```
config system dhcp server
    edit 2
        config reserved-address
            edit 1
                set ip 10.10.10.50
                set mac 00:09:0f:aa:bb:cc
            next
        end
    next
end
```

### Concessões

```
execute dhcp lease-list
```

```saida
FGT-MTZ # execute dhcp lease-list
vlan10
  IP                 MAC-Address        Hostname            VCI              SSID   AP   Expiry
  10.10.10.100       00:09:0f:9c:e3:43  PC-USUARIO          Windows          -      -    Mon, 16 Nov 2026 17:00:31
vlan30
  IP                 MAC-Address        Hostname            VCI              SSID   AP   Expiry
  10.10.30.100       00:09:0f:2b:ef:14  NOTEBOOK-VISITA     Windows          -      -    Mon, 16 Nov 2026 17:00:31
```

Por interface: o endereço, o MAC, o nome que o computador informou, o identificador do fabricante (VCI) e a validade. Para liberar uma concessão: `execute dhcp lease-clear <ip>`.

### DHCP relay

```
config system interface
    edit "vlan30"
        set dhcp-relay-service enable
        set dhcp-relay-ip "10.10.20.10"
    next
end
```

Ao ativar o relay, remova o escopo de DHCP server da mesma interface.
:::

---

## 02.6. DNS e NTP para clientes

### 02.6.1. Como o DNS funciona

#### Do nome ao endereço

As pessoas usam nomes (`intranet.atlas.local`, `www.google.com`); os pacotes usam endereços. O **DNS** (*Domain Name System*) faz a tradução. Quando o PC-USUARIO precisa acessar um nome:

1. Ele consulta o **servidor DNS** que recebeu do DHCP, normalmente por UDP na porta 53.
2. Esse servidor responde com o endereço, se souber (porque o nome é dele ou porque está guardado em cache).
3. Se não souber, ele faz a resolução **recursiva**: consulta outros servidores DNS (ou encaminha a pergunta a um servidor que faça isso), recebe a resposta e a devolve ao computador.
4. A resposta tem um **TTL** (tempo de vida): por esse tempo, o computador e o servidor guardam o resultado em cache e não perguntam de novo.

Dois papéis aparecem aqui:

- **Servidor autoritativo:** é o dono de uma zona (um domínio) e responde com certeza sobre os nomes dela.
- **Servidor recursivo:** busca a resposta para o cliente, perguntando a outros servidores.

#### Dois DNS diferentes no FortiGate

No módulo 01, você configurou o **DNS do sistema**: os servidores que o **próprio FortiGate** consulta para resolver nomes (FortiGuard, NTP por nome, objetos FQDN). Agora o FortiGate também vai ser **servidor DNS** para os computadores da rede. São coisas separadas:

| | DNS do sistema | DNS server em uma interface |
|---|---|---|
| Para quem | O próprio FortiGate | Os computadores da rede |
| Onde fica | **Network > DNS** | **Network > DNS Servers** |
| O que faz | Consulta outros servidores | Responde às consultas dos clientes |

O serviço DNS é ligado **por interface**, em um de três modos:

| Modo | O que faz |
|---|---|
| **Recursive** | Procura o nome na **base local** (DNS Database) do FortiGate; se não encontrar, pergunta ao **DNS do sistema** e devolve a resposta |
| **Non-Recursive** | Responde **só** com a base local; nomes de fora dela não são resolvidos |
| **Forward to System DNS** | Encaminha **todas** as consultas ao DNS do sistema, sem usar a base local |

A **base local** (DNS Database) é onde o FortiGate guarda zonas próprias, das quais é autoritativo. Cada zona tem:

- **Type:** **Primary**, quando o FortiGate é a fonte da zona e você cria os registros nele; **Secondary**, quando ele mantém uma cópia de uma zona de outro servidor, transferida automaticamente.
- **View:** para quem a zona responde. **Shadow** responde às consultas que chegam pelas interfaces internas; **Public**, às que chegam de fora. Com uma zona Shadow e uma Public para o mesmo domínio, o mesmo nome pode ter um endereço para quem está dentro (o IP privado do servidor) e outro para quem está fora (o IP público). É o chamado *split DNS*.
- **Registros:** **A** (nome → IPv4), **AAAA** (nome → IPv6), **CNAME** (apelido para outro nome), **MX** (servidor de e-mail do domínio), **PTR** (endereço → nome), **NS** (servidor da zona).

Quando o FortiGate como servidor DNS faz sentido:

- **Filiais sem servidor:** os computadores usam o FortiGate como DNS, e ele resolve a Internet com cache local.
- **Nomes internos simples:** a intranet, a impressora, um sistema interno, sem precisar de um servidor de DNS dedicado.
- **Split DNS** para um site publicado na DMZ, com endereço privado para quem está dentro.
- **Filtro de DNS:** com o serviço DNS na interface, o FortiGate pode aplicar um perfil de **DNS Filter** e bloquear domínios maliciosos, assunto dos módulos de segurança.

> **Na prática:** em empresas com Active Directory, os computadores do domínio usam o DNS dos controladores de domínio: o login, as políticas de grupo e a localização dos serviços dependem dos registros do AD. O FortiGate como DNS dos usuários é comum em filiais pequenas, redes de visitantes e redes sem domínio; nas redes do domínio, ele costuma ser o DNS do sistema dos próprios servidores AD, ou nenhum dos dois.

> **Dica para a prova:** conheça os modos do DNS server. Só o **Recursive** usa a base local **e** consulta o DNS do sistema para o restante; o **Non-Recursive** só responde com a base local; o **Forward to System DNS** ignora a base local.

### 02.6.2. Na GUI: serviço DNS e base local

A Atlas quer que os usuários da VLAN 10 resolvam os nomes internos (como `srv-ad.atlas.local` e `intranet.atlas.local`) e os da Internet usando o FortiGate. A página **Network > DNS Servers** aparece no menu porque o **DNS Database** foi ativado em **Feature Visibility** no módulo 01.

#### Passo 1: ligar o serviço DNS na vlan10

:::slides
midia/m02/02-6-menu-dns-servers.png "Menu Network com o item DNS Servers" | Abra **Network > DNS Servers**.
midia/m02/02-6-dns-servers-0.png "Seções DNS Service on Interface e DNS Database" | A página tem duas seções: **DNS Service on Interface** (em quais interfaces o FortiGate responde DNS) e **DNS Database** (as zonas locais). Na primeira, clique em **Create New**.
midia/m02/02-6-dns-servico.png "Serviço DNS na vlan10 no modo Recursive" | **Interface:** **vlan10**. **Mode:** **Recursive**. Clique em **OK**.
:::

#### Passo 2: criar a zona atlas.local

:::slides
midia/m02/02-6-dns-database-0.png "Serviço da vlan10 criado e o Create New da seção DNS Database" | O serviço da vlan10 aparece na primeira seção. Na seção **DNS Database**, clique em **Create New**.
midia/m02/02-6-dns-zona-1.png "Nova zona Primary, Shadow, atlas.local" | **Type:** **Primary** (o FortiGate é o dono da zona). **View:** **Shadow** (a zona só responde para a rede interna). **DNS Zone:** `atlas-local` (o nome do objeto). **Domain Name:** **atlas.local** (o domínio).
midia/m02/02-6-dns-entrada-0.png "Botão Create New da seção DNS Entries" | Role até **DNS Entries** e clique em **Create New** para criar o primeiro registro.
midia/m02/02-6-dns-registro.png "Registro A srv-ad apontando para 10.10.20.10" | **Type:** **Address (A)**. **Hostname:** `srv-ad`; o FQDN completo, **srv-ad.atlas.local**, aparece abaixo. **IP Address:** **10.10.20.10**. **TTL:** *Use Zone TTL*. Clique em **OK**.
midia/m02/02-6-dns-registro-2.png "Registro A intranet apontando para 172.16.10.10" | Crie o segundo registro: **intranet** → **172.16.10.10**, o servidor da DMZ. Clique em **OK**.
midia/m02/02-6-dns-zona.png "Os registros srv-ad e intranet na zona atlas.local" | A zona tem os dois registros. Clique em **OK** para salvar a zona.
midia/m02/02-6-dns-servers.png "DNS Servers com o serviço da vlan10 e a zona atlas.local" | A página mostra o serviço na **vlan10** (Recursive) e a zona **atlas.local** (Primary, Shadow, 2 registros).
:::

### 02.6.3. Verificação: nslookup

O DHCP da vlan10 já entrega o FortiGate (10.10.10.1) como DNS. No Terminal do PC-USUARIO:

:::figura midia/m02/02-6-pc-nslookup.png "nslookup no PC-USUARIO respondido pelo FortiGate"
`nslookup srv-ad.atlas.local`: o **Server** que respondeu é o 10.10.10.1 (o FortiGate), e a resposta, 10.10.20.10, veio da **base local**. `nslookup www.google.com`: o nome não está na base local; no modo **Recursive**, o FortiGate perguntou ao DNS do sistema e devolveu a resposta. "Non-authoritative answer" significa que a resposta veio de uma consulta repassada, não de uma zona da qual o servidor é dono.
:::

> **Atenção:** se você apontar os clientes para o FortiGate como DNS sem ligar o serviço DNS **naquela interface**, as consultas não são respondidas e os usuários "ficam sem Internet", mesmo com rota e policy corretas: nenhum nome é resolvido.

### 02.6.4. NTP server

#### Conceito: todos com a mesma hora

Hora errada parece um detalhe, mas quebra coisas importantes:

- **Autenticação Kerberos** (Active Directory): por padrão, o Windows recusa o login se a diferença entre o computador e o servidor passar de 5 minutos.
- **Certificados:** um certificado é válido entre duas datas; com a data errada, sites e VPNs são recusados.
- **Tokens de dois fatores** (como o FortiToken): os códigos dependem da hora.
- **Logs:** para reconstruir um incidente, os registros do firewall, dos servidores e dos computadores precisam estar na mesma linha do tempo.
- **Policies com horário:** uma regra que vale "das 8h às 18h" depende de o FortiGate saber que horas são.

O **NTP** (*Network Time Protocol*, UDP porta 123) sincroniza a hora pela rede. Os servidores se organizam em níveis, chamados **stratum**: o stratum 1 está ligado a uma fonte de referência (GPS, relógio atômico), o stratum 2 sincroniza com um stratum 1, e assim por diante. Os servidores do NTP.br (como `a.ntp.br`) são servidores públicos de baixo stratum.

O FGT-MTZ já sincroniza com o `a.ntp.br` desde o módulo 01. Agora ele também passa a **servir** a hora para a rede: os computadores e servidores da Atlas sincronizam com o FortiGate, que fica um stratum abaixo da fonte. Vantagens: os computadores internos não precisam de acesso à Internet para NTP, e todos usam a mesma referência.

#### Na GUI: o FortiGate como servidor NTP

:::slides
midia/m02/02-6-menu-settings.png "Menu System com o item Settings" | Abra **System > Settings** (aba **General**).
midia/m02/02-6-ntp-sel.png "Seletor de interfaces do servidor NTP com vlan10 e vlan20" | Ative **Setup device as local NTP server**. Em **Listen on interfaces**, clique em **+** e escolha **vlan10** e **vlan20**: só essas interfaces vão responder às consultas NTP.
midia/m02/02-6-ntp.png "O FGT-MTZ sincronizado com a.ntp.br e servindo NTP na vlan10 e na vlan20" | Confira: **Set time** **NTP**, **Select server** **Custom**, com o servidor **a.ntp.br** configurado no módulo 01, **Setup device as local NTP server** ligado e as interfaces **vlan10** e **vlan20**.
midia/m02/02-6-ntp-apply.png "Botão Apply" | Clique em **Apply**.
:::

A Atlas oferece NTP para usuários e servidores, mas não para convidados, que não precisam dele. O FortiGate só deve ser servidor NTP se **ele mesmo** estiver sincronizado: confira a hora no widget **System Information**. Para entregar o FortiGate como servidor NTP aos computadores automaticamente, use a opção **NTP server: Local** em **Advanced** no DHCP Server da interface.

> **Na prática:** em domínios Active Directory, os computadores sincronizam a hora com os controladores de domínio, e o controlador principal sincroniza com uma fonte externa. Um bom desenho é: FortiGate sincronizado com o NTP.br, controlador de domínio sincronizado com o FortiGate, computadores com o controlador.

#### Erros comuns

- Apontar os clientes para o FortiGate como DNS sem ligar o serviço DNS na interface.
- Usar o modo **Non-Recursive** e esperar que nomes da Internet sejam resolvidos.
- Confundir o DNS do sistema com o DNS server oferecido aos clientes.
- Criar a zona com a view **Public** e esperar que os clientes internos a usem.
- Oferecer NTP aos clientes com o próprio FortiGate dessincronizado.
- Ligar o servidor NTP sem escolher as interfaces em **Listen on interfaces**.

:::cli DNS e NTP para clientes
### Serviço DNS em uma interface

```
config system dns-server
    edit "vlan10"
        set mode recursive
    next
end
```

`mode` aceita `recursive`, `non-recursive` e `forward-only` (*Forward to System DNS*).

```
show system dns-server
```

```saida
FGT-MTZ # show system dns-server
config system dns-server
    edit "vlan10"
    next
end
```

Como `recursive` é o padrão, ele não aparece no `show`.

### Base local (DNS database)

```
config system dns-database
    edit "atlas-local"
        set domain "atlas.local"
        set type primary
        set view shadow
        config dns-entry
            edit 1
                set hostname "srv-ad"
                set ip 10.10.20.10
            next
            edit 2
                set hostname "intranet"
                set ip 172.16.10.10
            next
        end
    next
end
```

O tipo de registro padrão de `dns-entry` é `A`. Para outros tipos, use `set type` (`aaaa`, `cname`, `mx`, `ptr`, `ns`).

### Servidor NTP

```
config system ntp
    set server-mode enable
    set interface "vlan10" "vlan20"
end
```

A sincronização do próprio FortiGate com o NTP.br, feita no módulo 01:

```
show system ntp
```

```saida
FGT-MTZ # show system ntp
config system ntp
    set type custom
    config ntpserver
        edit 1
            set server "a.ntp.br"
        next
    end
end
```
:::
