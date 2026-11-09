# Bem-vindo ao Curso FortiGate 7.6

## Sobre o curso

Este curso ensina a **administrar um FortiGate no dia a dia** e prepara você para a certificação **Fortinet NSE 4 – FortiOS Administrator**, baseada no FortiOS 7.6.

Ao final, você vai saber instalar, configurar, proteger, manter e diagnosticar o FortiGate de uma matriz e de uma filial: policies, NAT, roteamento, autenticação, perfis de segurança, VPN IPsec, SD-WAN, Security Fabric e alta disponibilidade.

### Para quem é

Para profissionais de redes e segurança que vão administrar FortiGate em produção ou querem se certificar. Você não precisa de experiência anterior com produtos Fortinet. Ajuda conhecer o básico de redes: endereçamento IP, máscara, gateway, portas TCP e UDP e o que é um servidor DNS.

### Como o curso está organizado

O curso tem **17 módulos**. Cada módulo trata de um assunto do começo ao fim e se divide em **capítulos** (por exemplo, *01.4. Configurações do sistema*) e **seções** (por exemplo, *01.4.2. Acesso administrativo*). Os módulos seguem a ordem em que um FortiGate é colocado em produção, então cada um aproveita o que foi feito nos anteriores.

Depois dos 17 módulos vêm três apêndices, **Além do NSE 4**, com temas comuns na administração que não são o foco da prova.

Seções marcadas com *(Aprofundamento)* podem ser puladas na primeira leitura. Nenhum módulo seguinte depende delas.

## O cenário: Atlas Logística

Todo o curso acontece em uma mesma empresa fictícia, a **Atlas Logística**, que tem uma matriz em São Paulo e uma filial. A cada módulo, a rede da Atlas ganha uma parte nova, até chegar ao ambiente completo:

| Elemento | Descrição |
|---|---|
| FGT-MTZ | FortiGate da matriz |
| WAN1 (matriz) | Operadora A, endereço fixo 203.0.113.2/29, gateway 203.0.113.1 |
| WAN2 (matriz) | Operadora B, endereço por DHCP ou PPPoE |
| Gerência | Interface `mgmt`, rede 10.10.99.0/24 (FGT-MTZ em 10.10.99.1, estação do administrador em 10.10.99.10) |
| VLAN 10 – Usuários | 10.10.10.0/24 |
| VLAN 20 – Servidores | 10.10.20.0/24 (AD/DNS 10.10.20.10, RADIUS 10.10.20.11, FortiAnalyzer 10.10.20.50) |
| VLAN 30 – Convidados | 10.10.30.0/24 |
| DMZ | 172.16.10.0/24 (servidor web 172.16.10.10, publicado na Internet em 203.0.113.3) |
| FGT-FIL | FortiGate da filial, WAN 198.51.100.2/29, LAN 10.20.10.0/24 |
| Usuários remotos | FortiClient com VPN IPsec |
| FGT-MTZ-2 | Segundo FortiGate da matriz, que forma um cluster com o FGT-MTZ |

Os endereços públicos usam as faixas reservadas para documentação (203.0.113.0/24 e 198.51.100.0/24), que não existem na Internet.

## Sequência dos módulos

| Módulo | O que você aprende |
|---|---|
| **01. Primeiro acesso e administração básica** | O que é o FortiGate e por que ele existe, primeiro acesso pela console e pela GUI, GUI e CLI, hostname, hora e DNS, acesso administrativo seguro, administradores, licenciamento, FortiGuard, backup e firmware. |
| **02. Interfaces e serviços de rede** | Interfaces físicas e WAN, VLANs, agregação de links, zonas, rota padrão, DHCP e os serviços de DNS e NTP para os computadores da rede. |
| **03. Firewall policies** | Como o FortiGate decide se uma conexão passa, objetos de endereço e serviço, criação e teste de policies e organização da base de regras. |
| **04. Logs, sessões e verificação** | Onde ver o que aconteceu: logs, FortiView, tabela de sessões, captura de pacotes e o debug flow. |
| **05. NAT** | Acesso à Internet com NAT de origem, publicação de servidores com Virtual IP e verificação das traduções. |
| **06. Roteamento** | Tabela de rotas, rotas estáticas, contingência entre links, policy routes, ECMP e o motivo de alguns pacotes serem descartados (RPF). |
| **07. Autenticação** | Usuários locais, LDAP e RADIUS, autenticação nas policies, MFA com FortiToken e login de administradores com contas do diretório. |
| **08. FSSO e SSO** | Identificar o usuário do Active Directory sem pedir senha de novo e aplicar regras por grupo. |
| **09. Certificados e inspeção SSL/TLS** | Certificados no FortiGate e como inspecionar tráfego criptografado sem quebrar aplicações. |
| **10. Security Profiles: fundamentos, Web Filter e DNS Filter** | Como os perfis de segurança atuam e como controlar o acesso a sites por categoria, URL e DNS. |
| **11. Application Control, IPS e DoS** | Controlar aplicações, bloquear ataques e se proteger de inundações de tráfego. |
| **12. Antivirus e inspeção de arquivos** | Modos de inspeção, antivírus, sandbox e controle de tipos de arquivo. |
| **13. VPN IPsec** | Túneis entre a matriz e a filial e acesso remoto com FortiClient. |
| **14. SD-WAN** | Usar os dois links de Internet ao mesmo tempo, medir a qualidade de cada um e escolher o melhor caminho para cada aplicação. |
| **15. Security Fabric** | Integrar o FortiGate a outros produtos Fortinet, como o FortiAnalyzer, e automatizar respostas. |
| **16. Alta disponibilidade** | Montar um cluster de dois FortiGates, sincronizar a configuração e garantir que um assuma se o outro falhar. |
| **17. Diagnóstico e projeto final** | Um método para resolver problemas e um projeto que junta tudo o que você aprendeu. |
| **A. FortiSwitch e FortiAP** | Gerenciar switches e access points Fortinet pelo FortiGate. |
| **B. VDOMs** | Dividir um FortiGate em vários firewalls lógicos independentes. |
| **C. ZTNA básico** | Liberar o acesso a aplicações verificando quem é o usuário e em que estado está o computador dele. |

## Como ler este material

O texto principal ensina pela **GUI**, a interface web do FortiGate, que é onde o administrador passa a maior parte do tempo. As telas foram capturadas de um FortiGate de laboratório montado para o curso, com a rede da Atlas.

### Imagens e passo a passo

- Clique em qualquer imagem para **ampliá-la**. Na imagem ampliada, role o mouse para dar zoom e arraste para mover.
- Os **passo a passo** mostram várias telas em sequência, do começo ao fim de cada tarefa. Use as setas abaixo da imagem (ou as setas do teclado) para avançar, e leia o texto de cada passo.
- Nas imagens, as partes **escurecidas** são contexto: o que importa naquele momento fica em destaque.

### Quadros especiais

> **Na prática:** dicas de quem administra FortiGate no dia a dia.

> **Atenção:** algo que pode causar perda de acesso, de configuração ou de segurança. Leia com calma.

> **Dica para a prova:** um ponto que costuma ser cobrado no exame NSE 4.

### Guia de comandos CLI

Ao final de cada capítulo há um botão **Guia de comandos CLI**. Ele abre uma janela com os comandos equivalentes ao que foi feito na GUI, os comandos de verificação e as opções que só existem na CLI. Nos comandos que mostram informações, o botão **Mostrar saída** exibe um exemplo do que o FortiGate responde.

A CLI aparece no texto principal só quando é necessária: quando não existe opção na GUI, quando a saída de um comando é a melhor forma de diagnosticar um problema ou quando o assunto é a própria CLI.

### Progresso

No fim de cada módulo, use **Marcar como concluído**. O índice à esquerda mostra um visto nos módulos concluídos e a barra de **Progresso** acompanha o seu avanço. O progresso fica salvo neste navegador.

## Sobre menus e comandos

Nomes de menus, opções e comandos mudam entre versões do FortiOS e entre modelos de FortiGate. Se algo não aparecer igual no seu equipamento:

- use a **busca** da GUI (o ícone de lupa no topo) para encontrar a página pelo nome;
- confira se o recurso não está oculto em **Feature Visibility** (você vai aprender isso no módulo 01);
- consulte o *Administration Guide* e o *release notes* da sua versão em [docs.fortinet.com](https://docs.fortinet.com).
