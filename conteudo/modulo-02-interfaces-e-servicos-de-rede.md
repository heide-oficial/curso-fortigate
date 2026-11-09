# Módulo 02 — Interfaces e serviços de rede

## Antes de começar

### O que você vai aprender

Ao final deste módulo, você será capaz de:

- configurar as propriedades de uma interface: alias, role, endereço, acesso administrativo e status;
- conectar o FortiGate à Internet com endereço fixo, DHCP ou PPPoE, e usar DDNS quando o endereço muda;
- criar VLANs sobre uma interface física e entender a relação com o switch;
- escolher entre zone, software switch, hardware switch, agregação e interface redundante;
- criar uma interface loopback e um endereço secundário;
- criar a rota padrão, ler a tabela de rotas e resolver a disputa entre duas rotas padrão;
- testar a conectividade a partir do FortiGate e de um computador da rede;
- entregar endereços por DHCP ou encaminhar os pedidos a outro servidor;
- oferecer DNS e NTP aos computadores da rede.

**Pré-requisitos:** módulo 01. O FGT-MTZ já tem senha, gerência em 10.10.99.1 e hora sincronizada.

### Topologia atual

No módulo anterior, o FGT-MTZ só tinha a rede de gerência. Agora ele ganha as duas conexões com a Internet, a DMZ e as redes internas da Atlas. Os cabos já estão ligados; neste módulo, você vai configurar cada interface:

:::slides
midia/m02/02-0-topologia-fisica.png "Rede da matriz com os cabos ligados e as interfaces sem configuração" | **Antes:** os cabos estão ligados, mas as portas do FGT-MTZ ainda não têm endereço. Os computadores das VLANs aparecem com "DHCP: no lease": ainda não há quem entregue endereços.
midia/m02/02-0-topologia.png "Rede da matriz ao fim do módulo, com os endereços de cada interface" | **Depois:** cada interface com seu endereço, a WAN2 recebendo o endereço da operadora por DHCP e os computadores das VLANs com endereços entregues pelo FGT-MTZ.
:::

| Rede | Interface do FGT-MTZ | Endereço | Quem está nela |
|---|---|---|---|
| Internet (Operadora A) | `port1`, alias **WAN1** | 203.0.113.2/29, gateway 203.0.113.1 | ONT da Operadora A |
| Internet (Operadora B) | `port2`, alias **WAN2** | recebido por DHCP | ONT da Operadora B |
| DMZ | `port3`, alias **DMZ** | 172.16.10.1/24 | SRV-WEB (172.16.10.10) |
| Interna (trunk) | `port5`, alias **INTERNA** | sem endereço | SW-CORE, com as três VLANs |
| VLAN 10 – Usuários | `vlan10`, alias **USUARIOS** | 10.10.10.1/24 | PC-USUARIO (DHCP) |
| VLAN 20 – Servidores | `vlan20`, alias **SERVIDORES** | 10.10.20.1/24 | SRV-AD (10.10.20.10) |
| VLAN 30 – Convidados | `vlan30`, alias **VISITANTES** | 10.10.30.1/24 | NOTEBOOK-VISITA (DHCP) |
| Gerência | `mgmt` | 10.10.99.1/24 | ADMIN-PC (10.10.99.10) |

> **Atenção:** ao fim deste módulo, os computadores da Atlas recebem endereço, alcançam o FortiGate e resolvem nomes, mas **ainda não navegam na Internet**. Para o tráfego atravessar o FortiGate, é preciso uma firewall policy, assunto do próximo módulo.

---

## 02.1. Interfaces físicas e conexões WAN

### 02.1.1. Propriedades da interface

#### Conceito: porta e interface

Cada porta física do FortiGate aparece na configuração como uma **interface**, com um nome fixo que vem do hardware: no FortiGate 121G, `port1` a `port24`, `x1` a `x4`, `mgmt` e `ha`. Sobre as interfaces físicas você pode criar interfaces **lógicas**: VLANs, agregações, switches, loopbacks e túneis VPN. Para o FortiGate, todas elas são iguais na hora de criar uma policy ou uma rota.

Em **Network > Interfaces** ficam todas as interfaces, agrupadas por tipo. No topo, o painel de portas mostra o estado de cada uma:

:::slides
midia/m02/02-1-interfaces-1.png "Network > Interfaces com o painel de portas e a lista de interfaces" | **Network > Interfaces** lista as interfaces agrupadas por tipo (802.3ad Aggregate, Physical Interface, VLAN…), com o endereço, o acesso administrativo e as referências de cada uma.
midia/m02/02-1-interfaces-2.png "Painel de portas do FortiGate 121G" | O **painel de portas** desenha a frente do equipamento. As portas em **verde** têm enlace (cabo ligado e o outro lado ativo). Passe o mouse sobre uma porta para ver o nome, o endereço e a velocidade; clique para editar a interface.
:::

Um FortiGate novo de mid-range costuma vir com uma interface `fortilink` (uma agregação das portas `x1` a `x4`). Ela serve para gerenciar FortiSwitches e pode ser desfeita se você não for usar FortiSwitch.

#### Na GUI: editando a WAN1

Para editar uma interface, dê um duplo clique nela na lista (ou selecione e clique em **Edit**). A Atlas usa a `port1` para a Operadora A:

:::slides
midia/m02/02-1-wan1-1.png "Edição da port1: nome e tipo" | **Name** e **Type** de uma interface física não mudam: vêm do hardware.
midia/m02/02-1-wan1-2.png "Alias WAN1 e role WAN na port1" | **Alias:** um apelido que aparece ao lado do nome em toda a GUI, como "WAN1 (port1)". Ajuda a saber o que está ligado em cada porta. **Role:** o papel da interface: **LAN**, **WAN**, **DMZ** ou **Undefined**.
midia/m02/02-1-wan1-3.png "Endereço fixo 203.0.113.2/29 na WAN1" | **Addressing mode Manual** e o endereço fornecido pela operadora: **203.0.113.2/255.255.255.248** (/29).
midia/m02/02-1-wan1-4.png "Administrative Access da WAN1 só com PING" | **Administrative Access:** na WAN, só **PING**, para testes. HTTPS e SSH de gerência não devem ficar expostos à Internet.
midia/m02/02-1-wan1-5.png "Status da interface Enabled" | **Status:** **Enabled** liga a interface; **Disabled** desliga, como se o cabo estivesse desconectado, sem perder a configuração. Clique em **OK** para salvar.
midia/m02/02-1-wan1-7.png "A port1 na lista com o alias WAN1" | Na lista, a interface aparece como **WAN1 (port1)**, com o endereço 203.0.113.2.
:::

O que o **role** muda:

| Role | Uso | O que a GUI faz |
|---|---|---|
| **LAN** | Redes internas | Mostra as opções de DHCP Server e de detecção de dispositivos e oferece criar um objeto de endereço com a sub-rede da interface |
| **WAN** | Conexão com a Internet | Mostra os campos de banda estimada e esconde o DHCP Server |
| **DMZ** | Servidores publicados | Semelhante à LAN |
| **Undefined** | Sem papel definido | Mostra todas as opções |

O role **não cria regras nem libera tráfego**: ele organiza a GUI e ajusta as opções oferecidas. Quem decide o que passa é a firewall policy.

#### Estado do enlace e contadores

No painel à direita da edição, a GUI mostra o estado da interface:

:::figura midia/m02/02-1-wan1-6.png "Painel lateral com o estado do enlace, o MAC e os contadores de tráfego da port1"
**Status** (Up ou Down), o **MAC address** e o tráfego: banda de entrada e de saída e bytes recebidos e enviados. **References** mostra quem usa a interface (policies, rotas, zones).
:::

> **Atenção:** um enlace **Up** só quer dizer que o cabo e o equipamento do outro lado estão funcionando. Ele não quer dizer que o tráfego passa: para isso, a interface precisa de endereço, rota e firewall policy.

### 02.1.2. Endereço estático, DHCP e PPPoE

Uma interface WAN pode receber o endereço de três formas, conforme o contrato com a operadora:

| Modo | Quando usar | O que o FortiGate recebe |
|---|---|---|
| **Manual** (estático) | Links empresariais com IP fixo | Nada: você configura endereço e máscara e cria a rota padrão |
| **DHCP** | Links com IP dinâmico (cabo, fibra residencial, 4G) | Endereço, máscara, gateway e DNS |
| **PPPoE** | Links que exigem autenticação (comum em DSL e fibra) | Endereço, gateway e DNS, depois de autenticar com usuário e senha |

A WAN1 da Atlas usa endereço fixo, como você viu acima. A WAN2, da Operadora B, recebe o endereço por DHCP:

:::slides
midia/m02/02-1-wan2-1.png "WAN2 como cliente DHCP com o endereço recebido" | Em **Addressing mode DHCP**, o **Status** mostra **Connected** e o endereço recebido (200.160.21.34), com a validade do lease. **Retrieve default gateway from server** instala uma rota padrão pelo gateway da operadora, com **Distance 5**. **Override internal DNS** passa a usar os servidores DNS da operadora como DNS do sistema.
midia/m02/02-1-rota-dhcp.png "Tabela de rotas com a rota padrão aprendida pela WAN2" | Em **Dashboard > Network Monitor**, aba **Routing**, a rota padrão **0.0.0.0/0** pela WAN2 aparece automaticamente, com distância **5**.
:::

Se a operadora usar PPPoE, o modo **PPPoE** pede o usuário e a senha fornecidos por ela:

:::figura midia/m02/02-1-pppoe.png "Tela do modo PPPoE com usuário e senha"
No modo **PPPoE**, informe **Username** e **Password** do contrato. As opções **Retrieve default gateway from server** (distância 5) e **Override internal DNS** funcionam como no DHCP. **Initial disc timeout** e **Initial PADT timeout** controlam a negociação com o concentrador da operadora e normalmente ficam no padrão.
:::

#### Distância administrativa

Quando o FortiGate conhece duas rotas para o mesmo destino, ele usa a de **menor distância administrativa**. As distâncias padrão mais comuns são:

| Origem da rota | Distância padrão |
|---|---|
| Rede conectada | 0 |
| Rota recebida por **DHCP** ou **PPPoE** | **5** |
| Rota **estática** | **10** |

Isso tem uma consequência importante: uma rota padrão recebida por DHCP (5) **ganha** de uma rota padrão estática (10). Você vai ver esse problema acontecendo no capítulo de rotas.

> **Dica para a prova:** a rota padrão aprendida por DHCP ou PPPoE tem distância **5** por padrão, menor que a da rota estática (**10**). Ela pode ser ajustada no campo **Distance** da interface ou desligada em **Retrieve default gateway from server**.

### 02.1.3. DDNS

Com endereço dinâmico, o IP público da WAN2 pode mudar a qualquer momento. Se a Atlas precisar alcançar o FortiGate por essa WAN (por exemplo, para uma VPN), um nome que acompanhe o endereço resolve o problema. É o **DDNS** (*Dynamic DNS*): o FortiGate avisa um serviço de DNS sempre que o endereço da interface muda.

:::slides
midia/m02/02-1-ddns-1.png "Network > DNS com a seção Dynamic DNS" | O DDNS fica em **Network > DNS**, seção **Dynamic DNS**. Clique em **Create new**.
midia/m02/02-1-ddns-2.png "Novo registro DDNS para a WAN2" | Escolha a **Interface** (WAN2), o **Server** do FortiGuard DDNS (**fortiddns.com**) e um **Unique location**: o nome que vai virar **atlas-mtz.fortiddns.com**. A GUI avisa se o nome está disponível.
midia/m02/02-1-ddns-3.png "Registro DDNS atlas-mtz na lista" | O registro aparece na lista com a interface monitorada e o IP público atual. Quando o IP da WAN2 mudar, o FortiGate atualiza o nome.
:::

**Use public IP address** serve para quando o FortiGate fica atrás de outro equipamento com NAT: em vez do endereço da interface, ele publica o IP público visto pelo FortiGuard.

> **Na prática:** o FortiGuard DDNS depende do contrato FortiCare do equipamento. Além dele, o FortiGate suporta outros provedores de DDNS pela CLI.

#### Erros comuns

- Esperar que uma interface com enlace ativo já deixe o tráfego passar: ainda faltam rota e firewall policy.
- Deixar HTTPS e SSH em Administrative Access na WAN.
- Ter duas rotas padrão (uma estática e uma de DHCP) concorrendo sem perceber.
- Achar que o role da interface cria regras de segurança.

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
- `distance`: distância dessa rota.
- `dns-server-override`: usa os DNS da operadora como DNS do sistema.

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
...
```

Mostra, para cada porta física, o modo de endereçamento, o endereço em uso (inclusive o recebido por DHCP), o estado do enlace e a velocidade negociada.

Para os contadores de uma interface (pacotes, erros, descartes):

```
diagnose hardware deviceinfo nic port1
```

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
:::

---

## 02.2. VLANs

### 02.2.1. Subinterfaces VLAN

#### Conceito: várias redes em um só cabo

Uma **VLAN** (*Virtual LAN*) separa uma rede física em várias redes lógicas. Para que várias VLANs passem pelo mesmo cabo, cada quadro Ethernet recebe uma **etiqueta** (*tag*) **802.1Q** com o número da VLAN, o **VLAN ID** (de 1 a 4094).

No FortiGate, cada VLAN é uma **interface VLAN** criada sobre uma interface física, a **interface pai**. Ela tem endereço, acesso administrativo e DHCP próprios, e aparece nas policies como qualquer outra interface. Do outro lado do cabo, a porta do switch precisa estar configurada como **trunk** (ou *tagged*) com as mesmas VLANs.

Na Atlas, a `port5` (alias INTERNA) vai até o SW-CORE e leva as três VLANs:

:::figura midia/m02/02-2-topologia.png "Cabo entre a port5 e o SW-CORE em destaque, com os computadores de cada VLAN"
Um único cabo (em destaque) liga a **port5** ao **SW-CORE** e transporta as VLANs **10**, **20** e **30**. Cada computador está em uma VLAN: PC-USUARIO na 10, SRV-AD na 20 e NOTEBOOK-VISITA na 30.
:::

#### Na GUI: criando a VLAN 10

:::slides
midia/m02/02-2-vlan-1.png "Menu Create new com a opção Interface" | Em **Network > Interfaces**, clique em **Create new > Interface**.
midia/m02/02-2-vlan-2.png "Nova interface vlan10 do tipo VLAN sobre a port5" | **Name:** `vlan10`. **Type:** **VLAN**. **Interface:** a interface pai, **port5** (INTERNA). **VLAN ID:** **10**, o mesmo número configurado no switch. **Role:** LAN.
midia/m02/02-2-vlan-3.png "Endereço e Administrative Access da vlan10" | Endereço **10.10.10.1/255.255.255.0**, que será o gateway dos usuários, e **PING** em Administrative Access. A opção **Create address object matching subnet** cria um objeto de endereço com a sub-rede, útil nas policies. Clique em **OK**.
midia/m02/02-2-vlan-4.png "As VLANs 10, 20 e 30 abaixo da port5" | Com as VLANs 20 e 30 criadas do mesmo jeito, a lista mostra as três abaixo da interface pai **INTERNA (port5)**.
:::

Pontos importantes:

- A interface pai **não precisa de endereço**. Na Atlas, a `port5` só transporta as VLANs.
- Se a interface pai cair (cabo desligado ou status Disabled), **todas as VLANs dela caem** junto.
- Duas VLANs com o mesmo VLAN ID não podem existir na mesma interface pai, mas podem existir em interfaces pai diferentes.
- O VLAN ID e o nome não podem ser alterados depois de criados. Para mudar, crie outra interface.

> **Dica para a prova:** uma interface VLAN depende da interface física pai. O VLAN ID precisa ser igual dos dois lados do cabo: no FortiGate e na porta trunk do switch.

#### Erros comuns

- VLAN ID diferente no FortiGate e no switch: os quadros chegam com uma etiqueta que o FortiGate não espera e são descartados.
- Porta do switch configurada como acesso (*untagged*) em vez de trunk.
- Concluir que a VLAN não funciona quando, na verdade, falta a firewall policy.

:::cli VLANs
### Criar uma VLAN

```
config system interface
    edit "vlan10"
        set vdom "root"
        set alias "USUARIOS"
        set interface "port5"
        set vlanid 10
        set role lan
        set ip 10.10.10.1 255.255.255.0
        set allowaccess ping
    next
end
```

`set interface` define a interface pai e `set vlanid` o número da VLAN. Para conferir:

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
        set alias "USUARIOS"
        set role lan
        set interface "port5"
        set vlanid 10
    next
end
```

### Ver as VLANs de uma interface pai

```
show system interface | grep -f "port5"
```
:::

---

## 02.3. Agrupamento e interfaces lógicas

### 02.3.1. Zones

#### Conceito: agrupar interfaces para simplificar policies

Uma **zone** junta várias interfaces sob um único nome. Nas firewall policies, você usa a zone em vez de cada interface, e uma regra passa a valer para todas elas. Cada interface continua com seu endereço e sua rede: a zone **não une as redes**, só agrupa as interfaces para as regras.

A Atlas agrupa as VLANs de usuários e de servidores na zone **INTERNAS**:

:::slides
midia/m02/02-3-zone-1.png "Nova zone INTERNAS com vlan10 e vlan20" | Em **Network > Interfaces > Create new > Zone**, dê um nome (**INTERNAS**) e adicione os membros em **Interface members**: **vlan10** e **vlan20**.
midia/m02/02-3-zone-2.png "Zone INTERNAS na lista com os dois membros" | A lista mostra a zone com as duas VLANs abaixo dela.
:::

**Block intra-zone traffic** controla o tráfego **entre membros da mesma zone** (de uma VLAN da zone para outra):

- **desativado:** o tráfego entre os membros é permitido sem precisar de policy;
- **ativado:** o tráfego entre os membros é bloqueado, a não ser que uma policy da zone para ela mesma o permita.

> **Atenção:** uma interface só entra em uma zone se **não estiver em uso** em policies, rotas ou outros objetos. Se estiver, a GUI recusa e mostra as referências. Remova primeiro as referências, monte a zone e depois use a zone nos objetos.

### 02.3.2. Hardware switch e software switch

Às vezes você quer o contrário da zone: várias portas na **mesma rede**, com um endereço só, como em um switch. O FortiGate oferece dois tipos:

- **Hardware switch:** as portas formam um switch no próprio chip do equipamento. O encaminhamento entre elas é feito em hardware, sem passar pela CPU. Só existe nos modelos que têm esse chip (é o caso da interface `lan` ou `internal` dos modelos de mesa).
- **Software switch:** o FortiGate une as interfaces em uma ponte feita pela CPU. Pode juntar tipos diferentes, como uma porta física e uma rede Wi-Fi. É mais flexível, mas usa mais processamento.

:::figura midia/m02/02-3-software-switch.png "Formulário de software switch com as portas port10 e port11"
Em **Create new > Interface**, o tipo **Software Switch** pede os **Interface members**. O switch recebe um único endereço, que vale para todas as portas.
:::

Compare com a zone:

| | Zone | Software switch | Hardware switch |
|---|---|---|---|
| Endereçamento | Cada membro com sua rede | Um endereço para todos | Um endereço para todos |
| Domínio de broadcast | Separado por membro | Um só | Um só |
| Tráfego entre membros | Pode ser bloqueado ou exigir policy | Passa direto, sem policy | Passa direto, sem policy |
| Encaminhamento | Roteado pelo FortiGate | CPU | Chip de switch |
| Uso típico | Agrupar redes nas policies | Unir porta e Wi-Fi na mesma rede | Portas de LAN de modelos de mesa |

> **Dica para a prova:** zone agrupa interfaces **para as policies**; software e hardware switch juntam portas **em uma mesma rede**. Uma zone não cria um domínio de broadcast comum.

### 02.3.3. Agregação (LACP) e interface redundante

Duas ou mais portas físicas também podem formar um **único link lógico** com o switch, para ter mais banda ou tolerância a falhas:

:::slides
midia/m02/02-3-aggregate.png "Formulário de agregação 802.3ad com port15 e port16" | **802.3ad Aggregate:** todas as portas membro trabalham ao mesmo tempo. O FortiGate e o switch negociam a agregação com **LACP**.
midia/m02/02-3-redundante.png "Formulário de interface redundante com port15 e port16" | **Redundant Interface:** só uma porta trabalha por vez. Se ela cair, outra assume. O switch não precisa de LACP.
:::

| | 802.3ad Aggregate (LACP) | Redundant Interface |
|---|---|---|
| Portas ativas | Todas | Uma por vez |
| Banda total | Soma das portas | A de uma porta |
| Falha de uma porta | As outras continuam | A seguinte assume |
| Exigência no switch | LACP configurado nas portas | Portas na mesma rede, sem LACP |

A agregação distribui as **conexões** entre as portas por um cálculo (*hash*) feito com endereços e portas de cada fluxo. Uma conexão sozinha sempre usa **uma única porta**: com duas portas de 1 Gbps, uma transferência de arquivo continua limitada a 1 Gbps. O ganho aparece com muitas conexões ao mesmo tempo.

> **Dica para a prova:** LACP aumenta a banda total e a disponibilidade, mas não a velocidade de uma única conexão. A interface redundante só oferece failover.

### 02.3.4. Loopback e endereços secundários

#### Loopback

Uma **interface loopback** é uma interface lógica que **nunca cai**: ela não depende de cabo nem de porta. Por isso é usada como endereço estável para gerência, como origem de serviços (logs, consultas RADIUS) e em VPNs e roteamento.

:::figura midia/m02/02-3-loopback.png "Nova interface loopback com o endereço 10.10.255.1/32"
Em **Create new > Interface**, o tipo **Loopback Interface** recebe um endereço, normalmente com máscara /32 (**10.10.255.1/255.255.255.255**), e os protocolos de gerência que ela aceita.
:::

> **Atenção:** diferente das outras interfaces, uma loopback é alcançada **atravessando** o FortiGate. Para acessar a loopback a partir de outra rede, além do Administrative Access, é preciso uma **firewall policy** da interface de origem para a loopback.

#### Endereço secundário

Uma interface pode ter mais de um endereço. O **endereço secundário** é útil em migrações (a rede antiga e a nova convivem na mesma porta) ou quando uma DMZ ganha uma segunda sub-rede:

:::figura midia/m02/02-3-secundario.png "Endereço secundário 172.16.11.1/24 na interface DMZ"
Na edição da interface, ative **Secondary IP address** e informe o endereço adicional (aqui, **172.16.11.1/255.255.255.0** na DMZ). Cada endereço secundário tem seu próprio Administrative Access.
:::

#### Erros comuns

- Esperar que uma zone una as redes dos membros, como um switch.
- Esperar que LACP aumente a velocidade de uma única conexão.
- Tentar colocar em uma zone uma interface que já é usada por policies ou rotas.
- Esquecer a firewall policy para alcançar uma loopback a partir de outra rede.

:::cli Agrupamento e interfaces lógicas
### Zone

```
config system zone
    edit "INTERNAS"
        set interface "vlan10" "vlan20"
        set intrazone allow
    next
end
```

`intrazone allow` permite o tráfego entre os membros; `intrazone deny` bloqueia (*Block intra-zone traffic*).

```
show system zone
```

```saida
FGT-MTZ # show system zone
config system zone
    edit "INTERNAS"
        set interface "vlan10" "vlan20"
        set intrazone allow
    next
end
```

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

- `lacp-mode active`: o FortiGate inicia a negociação LACP; `passive`: só responde; `static`: agrega sem LACP.

Para ver o estado da agregação e de cada membro:

```
diagnose netlink aggregate name agg-srv
```

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

## 02.4. Rotas iniciais e testes

### 02.4.1. Rotas conectadas e rota padrão

#### Conceito: o FortiGate só envia para onde conhece um caminho

Para encaminhar um pacote, o FortiGate consulta a **tabela de rotas**. Há três tipos de rota nesta etapa:

- **Rotas conectadas:** criadas automaticamente para a rede de cada interface com endereço e enlace ativo (10.10.10.0/24 pela vlan10, por exemplo).
- **Rotas estáticas:** criadas por você, em **Network > Static Routes**.
- **Rotas dinâmicas** recebidas por DHCP ou PPPoE, como a rota padrão da WAN2.

A **rota padrão** (0.0.0.0/0) é usada para todo destino que não tem rota mais específica: na prática, a Internet.

#### Na GUI: rota padrão pela WAN1

:::slides
midia/m02/02-4-rota-1.png "Nova rota estática 0.0.0.0/0 pela WAN1" | Em **Network > Static Routes > Create new**: **Destination** do tipo **Subnet** com **0.0.0.0/0.0.0.0**, **Interface** WAN1 (port1), **Gateway Address** 203.0.113.1 (o gateway da Operadora A) e **Administrative Distance** 10, o padrão.
midia/m02/02-4-rota-2.png "Rota padrão pela WAN1 na lista de rotas estáticas" | A rota aparece na lista, com o gateway e a interface.
:::

#### A disputa entre as duas rotas padrão

Agora o FGT-MTZ tem **duas** rotas padrão: a estática pela WAN1 (distância 10) e a recebida por DHCP pela WAN2 (distância 5). Veja qual vence:

:::slides
midia/m02/02-4-rotas-antes.png "Tabela de rotas com a rota padrão ativa pela WAN2" | Em **Dashboard > Network Monitor > Routing**, a rota padrão ativa continua sendo a da **WAN2**, com distância **5**. A rota estática pela WAN1 existe, mas fica fora da tabela de rotas ativas: ela perdeu pela distância.
midia/m02/02-4-wan2-distancia.png "Distância da rota DHCP da WAN2 alterada para 20" | Para a WAN1 ser a principal, a Atlas aumenta a **Distance** da rota recebida por DHCP na WAN2 para **20**.
midia/m02/02-4-rotas-depois.png "Tabela de rotas com a rota padrão ativa pela WAN1" | Agora a rota padrão ativa é a da **WAN1** (distância 10). A rota da WAN2 continua configurada, como reserva: se a WAN1 cair, ela volta para a tabela.
:::

Se a WAN2 não deve ser usada como saída automática, outra opção é desligar **Retrieve default gateway from server** na interface. O uso dos dois links ao mesmo tempo, com escolha por aplicação e qualidade, é feito com SD-WAN, mais adiante no curso.

> **Atenção:** ter rota **não autoriza** o tráfego, e uma firewall policy **não substitui** uma rota. Para uma conexão atravessar o FortiGate, ela precisa de uma rota para o destino **e** de uma policy que a permita.

### 02.4.2. Ping e traceroute a partir do FortiGate

O FortiGate tem ferramentas de teste na CLI: `execute ping` e `execute traceroute`. Elas mostram se o **próprio FortiGate** alcança um destino. Pela CLI Console da GUI:

:::figura midia/m02/02-4-ping.png "Ping e traceroute a partir do FortiGate na CLI Console"
Na CLI Console, a tabela de rotas, um `execute ping 8.8.8.8`, o mesmo ping com **origem** 10.10.10.1 e um `execute traceroute 8.8.8.8`, que mostra cada salto até o destino, começando pelo gateway da WAN1.
:::

Por padrão, o FortiGate usa como origem o endereço da interface de saída (aqui, a WAN1). Com `execute ping-options source`, você escolhe outra origem, como o endereço da vlan10. Isso ajuda a testar se as respostas conseguem **voltar** para aquela rede.

Os comandos estão no Guia de comandos CLI deste capítulo, com as saídas.

Agora compare com o teste feito por um **computador** da rede:

:::figura midia/m02/02-4-pc-ping.png "Ping do PC-USUARIO: responde o gateway, mas não a Internet"
No PC-USUARIO, o ping para o gateway **10.10.10.1** responde: o tráfego é destinado ao próprio FortiGate e o PING está liberado na vlan10. O ping para **8.8.8.8** falha: esse tráfego precisa **atravessar** o FortiGate, e ainda não existe firewall policy para isso.
:::

| Teste | O que comprova |
|---|---|
| Ping do FortiGate para a Internet | O FortiGate tem rota e conectividade |
| Ping do FortiGate com origem na rede interna | As respostas conseguem voltar para a rede interna |
| Ping do computador para o gateway | O computador está na rede certa e o FortiGate responde |
| Ping do computador para a Internet | Rota **e** firewall policy (e NAT) estão funcionando |

> **Dica para a prova:** um teste a partir do FortiGate não prova que o cliente alcança o destino: o tráfego do próprio FortiGate não passa pelas firewall policies.

#### Erros comuns

- Testar a partir do FortiGate e concluir que o cliente também alcança o destino.
- Criar a rota padrão estática e não perceber que a rota do DHCP continua vencendo.
- Achar que uma rota libera o tráfego.

:::cli Rotas iniciais e testes
### Rota padrão estática

```
config router static
    edit 0
        set dst 0.0.0.0 0.0.0.0
        set gateway 203.0.113.1
        set device "port1"
        set distance 10
    next
end
```

### Distância da rota recebida por DHCP

```
config system interface
    edit "port2"
        set distance 20
    next
end
```

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

Leia cada linha assim: **S** é rota estática (a recebida por DHCP também aparece como S), **C** é conectada e **\*** marca a rota padrão candidata. Entre colchetes, **[distância/métrica]**.

Para ver também as rotas que existem mas não estão ativas (como a que perdeu pela distância):

```
get router info routing-table database
```

### Ping e traceroute

```
execute ping 8.8.8.8
```

```saida
FGT-MTZ # execute ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8): 56 data bytes
64 bytes from 8.8.8.8: icmp_seq=0 ttl=55 time=127.5 ms
64 bytes from 8.8.8.8: icmp_seq=1 ttl=55 time=127.2 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=55 time=127.4 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=55 time=127.6 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=55 time=127.2 ms

--- 8.8.8.8 ping statistics ---
5 packets transmitted, 5 packets received, 0% packet loss
round-trip min/avg/max = 127.2/127.4/127.6 ms
```

Com origem na vlan10:

```
execute ping-options source 10.10.10.1
execute ping 8.8.8.8
execute ping-options reset
```

`execute ping-options reset` volta às opções padrão. Outras opções úteis: `repeat-count` (quantidade de pacotes), `data-size` (tamanho) e `df-bit` (não fragmentar).

```
execute traceroute 8.8.8.8
```

```saida
FGT-MTZ # execute traceroute 8.8.8.8
traceroute to 8.8.8.8 (8.8.8.8), 32 hops max, 3 probe packets per hop, 84 byte packets
 1  203.0.113.1  19.566 ms  19.810 ms  19.253 ms
 2  100.64.1.1  43.776 ms  44.702 ms  44.555 ms
 3  100.65.34.9  89.692 ms  88.678 ms  88.723 ms
 4  8.8.8.8  127.796 ms  126.700 ms  126.100 ms
```
:::

---

## 02.5. DHCP

### 02.5.1. DHCP server

#### Conceito

O **DHCP** entrega aos computadores, automaticamente, o endereço IP, a máscara, o gateway e os servidores DNS. O FortiGate pode ser o servidor DHCP de cada rede: cada interface com DHCP Server ativo tem a sua faixa de endereços (o **escopo**).

#### Na GUI: DHCP na VLAN de usuários

O DHCP Server fica na própria edição da interface. Na vlan10:

:::slides
midia/m02/02-5-dhcp-1.png "DHCP Server da vlan10 com faixa, gateway e DNS" | Ative **DHCP Server** e defina: **Address range** 10.10.10.100 a 10.10.10.200; **Netmask** 255.255.255.0; **Default gateway** *Same as Interface IP* (10.10.10.1); **DNS server** *Same as Interface IP*, porque o FortiGate também vai responder DNS para essa rede; **Lease time**, o tempo de validade de cada endereço (padrão de 7 dias).
midia/m02/02-5-dhcp-2.png "Opções avançadas do DHCP Server" | Em **Advanced** ficam o **Mode** (**Server** ou **Relay**), o NTP e o fuso entregues aos clientes, as **opções DHCP** adicionais (por código) e as **IP Address Assignment Rules**, que reservam endereços por MAC ou bloqueiam clientes.
:::

A Atlas também ativa o DHCP na vlan30 (convidados), com a faixa 10.10.30.100 a 10.10.30.200. A vlan20 (servidores) fica sem DHCP: servidores usam endereço fixo.

#### Verificação

No PC-USUARIO, o comando `ipconfig /all` mostra o que ele recebeu. E no FortiGate, a lista de leases mostra quem recebeu cada endereço:

:::slides
midia/m02/02-5-pc-ipconfig.png "ipconfig /all no PC-USUARIO" | O PC-USUARIO recebeu **10.10.10.100**, máscara 255.255.255.0, gateway **10.10.10.1** e DNS **10.10.10.1**.
midia/m02/02-5-leases.png "Lista de leases DHCP no FortiGate" | Em **Dashboard > Asset and Identities**, aba **DHCP**, o FortiGate lista cada lease: dispositivo, IP, interface, MAC e validade. Clicando com o botão direito em um lease, **Create DHCP Reservation** fixa aquele endereço para aquele MAC.
:::

> **Na prática:** use reservas por MAC para impressoras, câmeras e outros dispositivos que precisam manter o endereço, mas não têm IP fixo configurado. A reserva fica no escopo do DHCP e é exibida como **Reserved** na lista de leases.

### 02.5.2. DHCP relay

Muitas empresas já têm um servidor DHCP central, como o do Active Directory. Nesse caso, o FortiGate não entrega os endereços: ele **encaminha** (*relay*) os pedidos dos computadores para o servidor. O pedido DHCP é um broadcast, que não atravessa redes; o relay recebe esse broadcast na interface e o envia ao servidor como um pacote comum.

:::figura midia/m02/02-5-relay.png "DHCP no modo Relay encaminhando para 10.10.20.10"
No DHCP Server da interface, em **Advanced**, mude o **Mode** para **Relay** e informe o **DHCP Server IP**: o endereço do servidor DHCP (aqui, o SRV-AD, 10.10.20.10). O servidor precisa ter um escopo para a rede da interface.
:::

| | DHCP Server | DHCP Relay |
|---|---|---|
| Quem entrega o endereço | O FortiGate | Outro servidor |
| Onde ficam escopo, reservas e leases | No FortiGate | No servidor |
| O que o FortiGate faz | Responde ao pedido | Encaminha o pedido e a resposta |

> **Atenção:** em uma interface, use **um** dos dois: DHCP Server **ou** relay. Com os dois ativos, os clientes podem receber respostas conflitantes. E lembre que o tráfego entre o FortiGate e o servidor DHCP pode precisar de rota e, se atravessar outro firewall, de liberação.

#### Erros comuns

- Escopo sem DNS: o computador recebe endereço, mas não resolve nomes.
- DHCP Server e relay ativos na mesma interface.
- Faixa de endereços que inclui o próprio endereço do FortiGate ou endereços fixos de servidores.

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

- `dns-service local`: o DNS entregue é o próprio FortiGate (*Same as Interface IP*); `default`: o DNS do sistema; `specify`: os servidores de `dns-server1` a `dns-server4`.

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

### Leases

```
execute dhcp lease-list
```

```saida
FGT-MTZ # execute dhcp lease-list
vlan10
  IP                 MAC-Address        Hostname            VCI              SSID   AP   Expiry
  10.10.10.100       00:09:0f:03:f7:56  PC-USUARIO          Windows          -      -    Mon, 16 Nov 2026 15:39:14
vlan30
  IP                 MAC-Address        Hostname            VCI              SSID   AP   Expiry
  10.10.30.100       00:09:0f:83:cf:b6  NOTEBOOK-VISITA     Windows          -      -    Mon, 16 Nov 2026 15:39:14
```

Para liberar um lease: `execute dhcp lease-clear <ip>`.

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

### 02.6.1. DNS server do FortiGate

#### Conceito: dois DNS diferentes

No módulo 01, você configurou o **DNS do sistema**: os servidores que o **próprio FortiGate** usa. Agora o FortiGate também vai ser **servidor DNS** para os computadores da rede. São coisas separadas:

| | DNS do sistema | DNS server em uma interface |
|---|---|---|
| Para quem | O próprio FortiGate | Os computadores da rede |
| Onde fica | **Network > DNS** | **Network > DNS Servers** |
| O que faz | Consulta outros servidores | Responde às consultas dos clientes |

O serviço DNS é ativado **por interface**, em um de três modos:

| Modo | O que faz |
|---|---|
| **Recursive** | Procura o nome na **base local** (DNS database) do FortiGate; se não encontrar, consulta o **DNS do sistema** e devolve a resposta |
| **Non-Recursive** | Responde **só** com a base local; nomes de fora dela não são resolvidos |
| **Forward to System DNS** | Encaminha **todas** as consultas ao DNS do sistema, sem usar a base local |

> **Dica para a prova:** conheça os modos do DNS server. Só o **Recursive** usa a base local **e** consulta o DNS do sistema para o restante; o **Non-Recursive** só responde com a base local.

#### Na GUI: serviço DNS e base local

A Atlas quer que os usuários resolvam os nomes internos (como `srv-ad.atlas.local`) e os da Internet usando o FortiGate. A página **Network > DNS Servers** aparece no menu porque o **DNS Database** foi ativado em Feature Visibility no módulo 01.

:::slides
midia/m02/02-6-dns-servico.png "Serviço DNS na vlan10 no modo Recursive" | Em **Network > DNS Servers**, seção **DNS Service on Interface**, clique em **Create New**: **Interface** vlan10 (USUARIOS) e **Mode** **Recursive**.
midia/m02/02-6-dns-zona.png "Zona atlas.local com os registros srv-ad e intranet" | Na seção **DNS Database**, **Create New** cria uma zona: **Type** **Primary** (o FortiGate é o dono da zona), **View** **Shadow** (a zona só é respondida para a rede interna), **DNS Zone** atlas-local e **Domain Name** **atlas.local**. Em **DNS Entries**, os registros da zona.
midia/m02/02-6-dns-registro.png "Registro A srv-ad apontando para 10.10.20.10" | Cada registro tem um **Type**, como **Address (A)**, um **Hostname** e o **IP Address**. Aqui, **srv-ad.atlas.local** aponta para 10.10.20.10.
midia/m02/02-6-dns-servers.png "Network > DNS Servers com o serviço e a zona" | A página mostra o serviço DNS na vlan10 e a zona atlas.local.
:::

**View** define para quem a zona responde: **Shadow** para consultas que chegam pelas interfaces internas e **Public** para consultas vindas de fora. Isso permite responder o mesmo nome com endereços diferentes por dentro e por fora (o chamado *split DNS*).

#### Verificação

O DHCP da vlan10 já entrega o FortiGate (10.10.10.1) como DNS. No PC-USUARIO:

:::figura midia/m02/02-6-pc-nslookup.png "nslookup no PC-USUARIO respondido pelo FortiGate"
`nslookup srv-ad.atlas.local` é respondido pela **base local** (10.10.20.10). `nslookup www.google.com` não está na base local: no modo **Recursive**, o FortiGate consulta o DNS do sistema e devolve a resposta.
:::

> **Atenção:** se você apontar os clientes para o FortiGate como DNS sem ativar o serviço DNS naquela interface, as consultas não são respondidas e os clientes "ficam sem Internet", mesmo com rota e policy corretas.

### 02.6.2. NTP server

Assim como o DNS, o FortiGate pode oferecer **hora** aos computadores da rede, como servidor **NTP**. Com isso, todos os equipamentos da Atlas usam a mesma referência de tempo, o que importa para logs, autenticação e certificados.

:::figura midia/m02/02-6-ntp.png "O FGT-MTZ como servidor NTP nas interfaces vlan10 e vlan20"
Em **System > Settings**, aba **General**, ative **Setup device as local NTP server** e escolha as interfaces em **Listen on interfaces** (aqui, **vlan10** e **vlan20**). Clique em **Apply**.
:::

O FortiGate só deve ser servidor NTP se ele mesmo estiver sincronizado. Confira a sincronização no widget **System Information** (o horário correto) e pela CLI, no Guia de comandos CLI. O DHCP Server também pode entregar o FortiGate como servidor NTP aos clientes (opção **NTP server: Local**, em **Advanced**).

#### Erros comuns

- Apontar os clientes para o FortiGate como DNS sem habilitar o serviço DNS na interface.
- Usar o modo **Non-Recursive** e esperar que nomes da Internet sejam resolvidos.
- Confundir o DNS do sistema com o DNS server oferecido aos clientes.
- Oferecer NTP aos clientes com o próprio FortiGate dessincronizado.

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

### Servidor NTP

```
config system ntp
    set server-mode enable
    set interface "vlan10" "vlan20"
end
```

Para conferir a sincronização do próprio FortiGate e o modo servidor:

```
diagnose sys ntp status
```
:::
