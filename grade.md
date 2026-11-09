# Curso FortiGate 7.6 — grade do curso

Preparação para o NSE 4 – FortiOS Administrator (FortiOS 7.6) · Revisão 7 · 09/11/2026

## Visão geral

**Público:** profissionais que vão administrar FortiGate em produção e querem se preparar para a certificação NSE 4.

**Nome do curso:** **Curso FortiGate 7.6**. A prova NSE 4 vigente é baseada no FortiOS 7.6. Antes de fechar o material, confira o blueprint oficial do exame.

**Objetivo do curso:** ao final, o aluno instala, configura, protege, mantém e diagnostica um FortiGate de matriz e de filial. Isso inclui policies, NAT, roteamento, autenticação, perfis de segurança, VPN IPsec, SD-WAN, Security Fabric e alta disponibilidade.

**Estrutura:** a sequência tem 17 módulos temáticos, cada um com um assunto do início ao fim. Depois deles vêm três apêndices "Além do NSE 4", com temas frequentes na administração que não são o foco da prova. A hierarquia é **módulo → capítulo → seção**.

**Seções de aprofundamento:** as seções marcadas com *(Aprofundamento)* podem ser puladas na primeira leitura. Nenhum módulo posterior depende delas, exceto quando isso está indicado.

**Fora do escopo:** IPv6 e dual stack; OSPF, BGP e demais protocolos dinâmicos; ADVPN; GRE, VXLAN e EVPN; multicast; Central NAT avançado, PCP, full-cone, MAP-E e CGNAT; Hyperscale; FortiOS Carrier; DLP; Inline CASB; Email Filter; WAF; ICAP; VoIP; WAN Optimization; FortiGate VM em nuvem; SASE; FortiExtender; OT/Rugged; automação por API, Ansible e Terraform.

## Regras de produção do conteúdo

Este documento é de produção e **não é entregue aos alunos**. Os alunos recebem a introdução (`conteudo/00-introducao.md`) e os módulos (`conteudo/modulo-NN-*.md`). Produza o conteúdo na ordem da grade, em um arquivo `.md` por módulo. **As regras abaixo valem para todos os módulos.** O módulo 01 é a referência de como elas ficam na prática.

### Linguagem

- O material é escrito **para o aluno**. Nunca fale do curso como se o leitor fosse quem o produz: nada de "esta grade", "o conteúdo deve", "capturas pendentes", "roteiro", "laboratório do curso" no sentido de produção.
- O aluno **não usa o laboratório**. Ele vê as telas capturadas do laboratório. Não escreva instruções do tipo "no seu laboratório, faça".
- **Não coloque o número do módulo ou da seção ao lado de um assunto** ("(módulo 03)", "seção 01.4", colunas "Função (módulo)"). Se precisar apontar para outro ponto, use o nome do assunto ("no capítulo GUI e CLI", "mais adiante no curso").
- Não escreva quadros "Na prova (7.6)" nem compare versões do FortiOS no texto. Exemplos de versão usam 7.6.x.
- Linguagem fácil e didática, com termos técnicos quando necessários e explicados na primeira vez.

### Foco na GUI e regra de uso da CLI

O curso ensina principalmente pela GUI. No texto principal, a CLI só aparece em três casos:

1. **não há opção na GUI** para o que está sendo ensinado;
2. **a saída do comando é a ferramenta de diagnóstico** (debug flow, tabela de sessões, estado do HA, debug de IKE, saídas cobradas na prova);
3. **o tema é a própria CLI**.

Todo o resto vai para o **Guia de comandos CLI** do capítulo: o equivalente em CLI da configuração feita na GUI, os comandos de verificação e diagnóstico e as opções disponíveis só pela CLI. Todo comando que mostra informações traz a saída real, capturada no laboratório, em um bloco `saida` logo depois do comando (o visualizador mostra o botão **Mostrar saída**).

### Estrutura de cada módulo

1. **Antes de começar:** "O que você vai aprender", pré-requisitos e **Topologia atual** (o estado da rede da Atlas neste módulo, com o diagrama).
2. **Capítulos** (`## NN.N.`) com **seções** (`### NN.N.N.`). Cada seção segue: **conceito** (o que é e como o FortiGate processa), **na GUI** (passo a passo com imagens), **verificação** (onde ver o resultado e o que esperar) e, só nos três casos acima, **CLI no texto**.
3. Cada capítulo termina com **Erros comuns** e o bloco **Guia de comandos CLI**.
4. Os módulos **não têm questões de revisão**.

Não entram no material do aluno: laboratório do módulo, critério de conclusão, questões, lista de mídias e campos de produção. Os campos **Laboratório** e **Critério de conclusão** desta grade orientam o roteiro do modo aula.

Use títulos `####` numerados (como "1. ...") só quando não puderem ser confundidos com a numeração de capítulos e seções; prefira "Camada 1: ...", "Passo 1: ...".

### Mídias: quanto mais visual, melhor

- **Mostre o que o texto descreve.** Se o texto cita telas, passos ou estados (por exemplo, os passos de um assistente, as abas de uma página, um estado de erro ou de licença vencida), eles precisam aparecer em imagem.
- **Passo a passo de navegação:** mostre como se chega à tela (menu → submenu → diálogo), não só a tela final.
- **Carrossel com texto por imagem** (`:::slides`) em vez de telas interativas. Cada imagem tem o seu texto, que aparece no card abaixo dela. Telas interativas com hotspots não são usadas.
- **Destaque:** escureça o que não importa (menu lateral, barra superior, áreas vazias) e deixe o assunto em destaque. Em carrosséis, cada imagem destaca o elemento daquele passo.
- **Recorte:** não capture a tela inteira quando o assunto é uma janela, um diálogo, um widget ou um menu. Recorte e amplie para o necessário (a captura continua com pelo menos 1920 px de largura).
- **Sem vídeos.** Ações em sequência (um login com troca de senha, a digitação de comandos) viram carrossel, com uma imagem por etapa e o texto de cada uma.
- **Passo a passo completo:** antes de mostrar uma tela de um dispositivo, mostre onde ele está na topologia (com o cabo ou a conexão em destaque) e em qual dispositivo estamos (a área de trabalho do computador), até chegar à tela.
- **Ordem dos assuntos:** apresente um conceito antes de usá-lo (por exemplo, o FortiGuard antes dos serviços FortiGuard que são licenciados).
- Todas as mídias saem do laboratório (`fortigate-clone`), pelo roteiro do modo aula, com `node tools/captura/capturar.cjs --roteiro mNN --saida midia/mNN`. O passo do roteiro define o arquivo, o tipo (`imagem` ou `slides`), o recorte (`recorte`) e o destaque (`destaque`). Para estados que o laboratório precisa simular (licença vencida, por exemplo), use a `LabApi` do roteiro.
- Imagens no mínimo 1920x1080, ou 1920 px de largura quando recortadas.
- **Todo passo descrito tem imagem**, inclusive a navegação até a tela (menu → submenu → diálogo) e as etapas de assistentes. As imagens também servem de apoio visual para explicar conceitos.
- **Tema da GUI:** Jade em todo o curso.

### PDF dos módulos

Os alunos também recebem cada módulo em PDF, gerado direto do `.md`, sem edição manual:

```
node tools/pdf/gerar-pdf.cjs --modulo conteudo/modulo-NN-*.md --saida pdf/modulo-NN.pdf
```

O PDF tem capa, sumário, títulos em cards, cada carrossel como passo a passo numerado (**uma imagem por linha**, nunca lado a lado) e cada Guia de comandos CLI como um quadro com as saídas. Gere de novo sempre que o conteúdo ou as mídias mudarem.

### Blocos especiais

Os arquivos de mídia ficam em `midia/mNN/`, com nomes no formato `<seção>-<assunto>.ext`.

**Figura** (imagem, com legenda opcional):

```
:::figura midia/m01/01-6-updates.png "Descrição da imagem (texto alternativo)"
Legenda em markdown, exibida no card abaixo da imagem.
:::
```

**Carrossel** (uma imagem por linha; o texto depois de `|` aparece no card abaixo da imagem):

```
:::slides
midia/m01/01-7-backup-passo-1.png "Descrição" | Texto do passo 1.
midia/m01/01-7-backup-passo-2.png "Descrição" | Texto do passo 2.
:::
```

**Guia de comandos CLI** (markdown completo; a saída de um comando vai num bloco `saida` logo depois dele):

````
:::cli Título do capítulo
### Assunto
```
get system status
```
```saida
FGT-MTZ # get system status
Version: ...
```
Explicação.
:::
````

### Quadros

Use só três tipos, sempre começando pelo rótulo em negrito. O visualizador mostra cada um com seu ícone:

- `> **Na prática:**` dica de quem administra FortiGate no dia a dia;
- `> **Atenção:**` algo que pode causar perda de acesso, de configuração ou de segurança;
- `> **Dica para a prova:**` ponto que costuma ser cobrado no NSE 4.

## Cenário do curso

Todos os laboratórios usam a mesma empresa fictícia, a **Atlas Logística**. O ambiente cresce módulo a módulo.

| Elemento | Descrição |
|---|---|
| FGT-MTZ | FortiGate da matriz |
| WAN1 (matriz) | Operadora A, endereço fixo 203.0.113.2/29, gateway 203.0.113.1 |
| WAN2 (matriz) | Operadora B, DHCP ou PPPoE |
| Gerência (matriz) | Interface `mgmt`, rede 10.10.99.0/24 (FGT-MTZ 10.10.99.1, estação do administrador 10.10.99.10) |
| VLAN 10 – Usuários | 10.10.10.0/24 |
| VLAN 20 – Servidores | 10.10.20.0/24 (AD/DNS 10.10.20.10, RADIUS 10.10.20.11, FortiAnalyzer/syslog 10.10.20.50) |
| VLAN 30 – Convidados | 10.10.30.0/24 |
| DMZ | 172.16.10.0/24 (servidor web 172.16.10.10, publicado em 203.0.113.3) |
| FGT-FIL | FortiGate da filial, WAN 198.51.100.2/29, LAN 10.20.10.0/24 |
| Usuários remotos | FortiClient com VPN IPsec |
| FGT-MTZ-2 | Segundo FortiGate da matriz, usado no módulo 16 para formar o cluster |

Os endereços públicos usam as faixas de documentação 203.0.113.0/24 e 198.51.100.0/24.

## Sequência dos módulos

| # | Módulo |
|---|---|
| 01 | Primeiro acesso e administração básica |
| 02 | Interfaces e serviços de rede |
| 03 | Firewall policies |
| 04 | Logs, sessões e verificação |
| 05 | NAT |
| 06 | Roteamento |
| 07 | Autenticação |
| 08 | FSSO e SSO |
| 09 | Certificados e inspeção SSL/TLS |
| 10 | Security Profiles: fundamentos, Web Filter e DNS Filter |
| 11 | Application Control, IPS e DoS |
| 12 | Antivirus e inspeção de arquivos |
| 13 | VPN IPsec |
| 14 | SD-WAN |
| 15 | Security Fabric |
| 16 | Alta disponibilidade |
| 17 | Diagnóstico e projeto final |
| A | Além do NSE 4: FortiSwitch e FortiAP |
| B | Além do NSE 4: VDOMs |
| C | Além do NSE 4: ZTNA básico |

---

## 01. Primeiro acesso e administração básica

**Objetivo:** acessar um FortiGate novo, operar GUI e CLI, configurar identidade e acesso administrativo seguro, ativar licenças e FortiGuard e proteger a configuração com backup e firmware adequados.
**Pré-requisitos:** nenhum.
**No cenário:** o FGT-MTZ fica acessível, identificado, com hora correta, administradores definidos, FortiGuard ativo e um backup protegido.

### 01.1. O FortiGate e o FortiOS

**Aprendizado:** entender por que os firewalls evoluíram, o que diferencia o FortiGate, a organização da interface e por que um recurso pode não aparecer em um modelo.

- **01.1.1. Por que os firewalls evoluíram:** limites dos firewalls tradicionais (só interno x externo, só portas e IPs, sem ameaças internas, antivírus só por assinatura, superfície de ataque maior, falsa sensação de segurança das PMEs) e o surgimento do NGFW.
- **01.1.2. O que é o FortiGate e quais são seus diferenciais:** NGFW com recursos de infraestrutura e segurança; cenários (borda, segmentação, multi-cloud); formatos (appliance, VM, FGaaS); UTM; hardware dedicado (SPUs); integração com o ecossistema Fortinet e compatibilidade com outros fabricantes; funções do FortiGate.
- **01.1.3. Modelos e plataformas:** comparar famílias de appliances e VM; o FortiGate 121G da Atlas.

**Erros comuns:** esperar que uma VM tenha o desempenho de um appliance com aceleração em hardware.

### 01.2. Primeiro acesso e recuperação

**Aprendizado:** conectar-se a um equipamento novo e recuperar o acesso perdido.

- **01.2.1. Console, endereço padrão e primeiro login:** acessar pela console serial e pela interface de gerência padrão; o endereço e a porta variam por modelo e plataforma. Fazer login com o usuário padrão e a troca obrigatória de senha. Apresentar o assistente inicial e o FortiExplorer.
- **01.2.2. Reset de fábrica e recuperação de senha:** executar o reset de fábrica e entender o que é apagado. Apresentar a recuperação de senha pela console (conta maintainer, quando habilitada) e seus requisitos de acesso físico.

**Erros comuns:** fazer reset sem ter backup; esquecer que a recuperação pela console exige acesso físico e pode estar desabilitada.

### 01.3. GUI e CLI

**Aprendizado:** consultar e alterar a configuração pelas duas interfaces, entendendo que ambas operam a mesma configuração.

- **01.3.1. A GUI:** organização do menu e da barra superior, temas (System > Settings > Preference e Personalize; o curso usa o Jade), System Information, por que um recurso pode não aparecer e Feature Visibility, listas e objetos.
- **01.3.2. A CLI:** console, SSH e CLI Console da GUI; comparar `show`, `show full-configuration`, `get` e `diagnose` e distinguir valor configurado de valor padrão.
- **01.3.3. Estrutura de comandos:** usar `config`, `edit`, `set`, `unset`, `append`, `select`, `next`, `end` e `abort`, além da ajuda com `?` e Tab. Entender quando a alteração passa a valer e por que um objeto referenciado não pode ser apagado (contagem de referências).

**Erros comuns:** concluir que um recurso não existe quando ele só está oculto em Feature Visibility; sair com `end` quando a intenção era descartar a alteração (`abort`); tentar apagar um objeto em uso sem consultar suas referências.

### 01.4. Configurações do sistema

**Aprendizado:** deixar o equipamento identificável, com hora e resolução de nomes corretas e gerência restrita.

- **01.4.1. Hostname, hora, NTP e DNS do sistema:** configurar hostname, fuso, sincronização NTP e os servidores DNS que o próprio FortiGate usa. Explicar por que a hora correta é necessária para certificados, logs e autenticação.
- **01.4.2. Acesso administrativo:** habilitar por interface somente os protocolos de gerência necessários (HTTPS, SSH, PING). Ajustar portas administrativas, idle timeout e trusted hosts. Mostrar que o acesso administrativo é tráfego destinado ao equipamento, não tráfego que o atravessa.

**Erros comuns:** liberar HTTPS e SSH de gerência na WAN sem trusted hosts; restringir trusted hosts sem antes testar o acesso a partir da origem permitida.

### 01.5. Administradores e perfis

**Aprendizado:** aplicar privilégio mínimo à administração.

- **01.5.1. Contas e perfis administrativos:** criar administradores com o perfil super_admin e com perfis personalizados (leitura e leitura/escrita por área). Testar o novo acesso em uma segunda sessão antes de encerrar a primeira.
- **01.5.2. Proteção das contas:** configurar política de senha, bloqueio por tentativas e timeout de sessão. A autenticação remota de administradores (LDAP/RADIUS) fica para o módulo de autenticação.

**Erros comuns:** usar a conta padrão `admin` para todos; criar um perfil restrito e testá-lo na mesma sessão do super_admin.

### 01.6. FortiGuard e licenciamento

**Aprendizado:** entender de onde vem a proteção do FortiGate, como ela é licenciada, quais serviços estão ativos e se o equipamento consegue atualizar bases e consultar ratings.

- **01.6.1. FortiGuard: de onde vem a proteção:** FortiGuard Labs, FDN, download de pacotes por TCP x consultas em tempo real por UDP ou HTTPS, anycast, verificação de certificado com OCSP stapling, DoT com o DNS do FortiGuard. Agendamento das atualizações e pré-requisitos.
- **01.6.2. Como o FortiGate é licenciado:** equipamento, suporte e serviços como camadas separadas. Níveis do FortiCare (Essentials, Premium, Elite). Bundles FortiGuard (ATP, UTP, Enterprise) e serviços à la carte. Relacionar cada perfil de segurança ao serviço de que depende. Registro. Ver na GUI um equipamento só com FortiCare, com UTP e com UTP vencido (widget Licenses e abas Licensed, Expired e Available for purchase). Diferenciar licença vencida, base desatualizada e falha de rating.

**Erros comuns:** supor que o perfil protege mesmo com a licença vencida ou sem comunicação com o FortiGuard; confundir o contrato FortiCare com o dos serviços de segurança.

### 01.7. Backup, restauração e firmware

**Aprendizado:** proteger a configuração e atualizar o FortiOS com um caminho de retorno.

- **01.7.1. Backup e restauração:** gerar backup completo e criptografado e configurar revisões de configuração. Restaurar no mesmo modelo e entender as restrições ao restaurar em outro modelo ou versão.
- **01.7.2. Ciclo de firmware:** ler release notes, consultar o upgrade path recomendado, fazer backup antes da atualização e atualizar pela GUI ou CLI. Validar serviços depois e entender os riscos de downgrade.
- **01.7.3. Recuperação de firmware *(Aprofundamento)*:** instalar firmware pela console via TFTP no menu de boot, para o caso de imagem corrompida.

**Erros comuns:** pular versões fora do upgrade path; atualizar sem backup; usar backup sem criptografia para guardar a configuração com segredos.

**Laboratório:** acessar o FGT-MTZ pela console, trocar a senha, definir hostname, NTP e DNS e restringir a gerência à rede de gerência (10.10.99.0/24). Criar um administrador somente leitura e testá-lo, verificar licenças e versões das bases e gerar um backup criptografado.

**Critério de conclusão:** o aluno acessa um FortiGate novo, altera a configuração pela GUI e pela CLI, comprova o efeito, restringe a gerência sem perder o acesso e produz um backup restaurável.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** estrutura de comandos da CLI; acesso administrativo por interface e trusted hosts; perfis administrativos; dependência entre perfis e licenças FortiGuard; backup criptografado; upgrade path.

---

## 02. Interfaces e serviços de rede

**Objetivo:** configurar interfaces, VLANs, agrupamentos e conexões WAN, criar a rota padrão e oferecer DHCP, DNS e NTP aos clientes.
**Pré-requisitos:** 01.
**No cenário:** o FGT-MTZ recebe WAN1 fixa, WAN2 por DHCP/PPPoE, as VLANs 10, 20 e 30, a DMZ e a rota padrão, e passa a atender os clientes com DHCP e DNS.

### 02.1. Interfaces físicas e conexões WAN

**Aprendizado:** endereçar interfaces e obter conectividade WAN pelos métodos usuais.

- **02.1.1. Propriedades da interface:** configurar alias, role (LAN, WAN, DMZ), endereço, status administrativo e acesso administrativo. Consultar o estado do enlace e os contadores.
- **02.1.2. Endereço estático, DHCP e PPPoE:** configurar a WAN1 com endereço fixo e a WAN2 como cliente DHCP ou PPPoE. Verificar endereço, gateway e DNS recebidos e a rota instalada automaticamente, incluindo a distância administrativa da rota obtida.
- **02.1.3. DDNS:** configurar DDNS (FortiGuard DDNS ou provedor suportado) para uma WAN com endereço dinâmico e verificar a atualização do nome.

**Erros comuns:** esperar que a interface com link ativo já permita tráfego (é preciso policy); deixar duas rotas padrão concorrendo sem perceber, por causa do DHCP.

### 02.2. VLANs

**Aprendizado:** criar subinterfaces VLAN e entender a dependência da interface pai.

- **02.2.1. Subinterfaces VLAN:** criar as VLANs 10, 20 e 30 sobre a interface interna, com VLAN ID, endereço e serviços. Explicar a relação com o trunk no switch e verificar a recepção de quadros marcados.

**Erros comuns:** VLAN ID divergente do switch; confundir falta de tráfego na VLAN com bloqueio por policy.

### 02.3. Agrupamento e interfaces lógicas

**Aprendizado:** escolher o agrupamento pelo comportamento de encaminhamento e de disponibilidade.

- **02.3.1. Zones:** agrupar interfaces em zones para simplificar policies, controlar o tráfego entre membros da mesma zone (intrazone) e identificar referências que impedem mover uma interface.
- **02.3.2. Hardware switch e software switch:** comparar os dois tipos de switch com a zone pelo domínio de broadcast, pelo endereçamento e pela aplicação de policy.
- **02.3.3. Agregação (LACP) e interface redundante:** configurar agregação 802.3ad e interface redundante. Comparar distribuição de carga e failover e testar a falha de um membro.
- **02.3.4. Loopback e endereços secundários:** criar uma interface loopback e um endereço secundário e explicar seus usos comuns (gerência, origem de serviços, VPN).

**Erros comuns:** esperar que uma zone una as redes como um switch; esperar que LACP aumente a velocidade de uma única conexão.

### 02.4. Rotas iniciais e testes

**Aprendizado:** garantir uma saída válida e testar a conectividade com a origem correta.

- **02.4.1. Rotas conectadas e rota padrão:** consultar as rotas conectadas, criar a rota padrão pela WAN1 e conferir a tabela de rotas. Mostrar que ter rota não autoriza tráfego e que policy não substitui rota.
- **02.4.2. Ping e traceroute a partir do FortiGate:** testar com origem definida (`execute ping-options source`) e comparar com o teste feito por um cliente. Entender o que cada teste comprova.

**Erros comuns:** testar a partir do FortiGate e concluir que o cliente também alcança o destino.

### 02.5. DHCP

**Aprendizado:** entregar endereços pelo FortiGate ou encaminhar a solicitação a outro servidor.

- **02.5.1. DHCP server:** criar escopos por VLAN com gateway, DNS, lease, opções, reservas por MAC e exclusões. Consultar a lista de leases.
- **02.5.2. DHCP relay:** configurar relay para um servidor externo e comparar o papel do FortiGate em cada modo.

**Erros comuns:** escopo sem DNS; servidor DHCP e relay habilitados na mesma interface.

### 02.6. DNS e NTP para clientes

**Aprendizado:** distinguir o DNS que o FortiGate usa do DNS que ele oferece aos clientes.

- **02.6.1. DNS server do FortiGate:** habilitar o serviço DNS por interface nos modos recursivo, não recursivo e encaminhamento ao DNS do sistema. Criar uma base local (DNS database) com registros internos e testar resolução e cache.
- **02.6.2. NTP server:** oferecer NTP aos clientes em uma interface e verificar a sincronização do próprio equipamento.

**Erros comuns:** apontar os clientes para o FortiGate como DNS sem habilitar o serviço na interface.

**Laboratório:** configurar a WAN1 fixa e a WAN2 por DHCP/PPPoE, criar as VLANs e a DMZ, agrupar as VLANs internas em uma zone e criar a rota padrão. Entregar DHCP e DNS à VLAN de usuários e comprovar lease, resolução e rota.

**Critério de conclusão:** o aluno identifica entrada, saída e endereçamento de cada rede e comprova que os clientes recebem endereço e DNS, sem confundir interface ativa ou rota existente com tráfego autorizado.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** interface roles; rota obtida por DHCP/PPPoE e sua distância; VLAN e interface pai; zone × software switch × hardware switch; LACP × redundante; modos do DNS server; DHCP relay.

---

## 03. Firewall policies

**Objetivo:** construir firewall policies com objetos adequados, prever qual regra atende cada conexão e manter a base de regras organizada.
**Pré-requisitos:** 02.
**No cenário:** as VLANs e a DMZ passam a ter regras de acesso entre si (ainda sem acesso à Internet, que depende de NAT).

### 03.1. Como as policies funcionam

**Aprendizado:** explicar o papel da policy no primeiro pacote e no restante da sessão.

- **03.1.1. Firewall stateful e sessão:** seguir uma conexão iniciada pelo cliente e mostrar que a resposta usa a sessão criada. Uma regra no sentido contrário só é necessária se o outro lado também iniciar conexões.
- **03.1.2. Ordem de avaliação e implicit deny:** avaliação de cima para baixo com a primeira regra correspondente vencendo, e implicit deny ao final. Distinguir o ID da policy de sua posição na lista.

**Erros comuns:** criar regras de retorno desnecessárias; confundir o ID com a ordem de avaliação.

### 03.2. Objetos

**Aprendizado:** representar origem, destino, serviço e horário com objetos reutilizáveis.

- **03.2.1. Endereços e grupos:** criar endereços dos tipos subnet, range, FQDN, wildcard FQDN, geografia e MAC, e grupos com exclusão. Ver como o FortiGate resolve e atualiza FQDNs.
- **03.2.2. Internet Service Database (ISDB):** usar serviços de Internet como destino de policy e comparar com FQDN e endereço fixo, incluindo a atualização da base.
- **03.2.3. Serviços e schedules:** criar serviços personalizados e grupos de serviços. Criar schedules recorrentes e pontuais e entender o efeito do schedule sobre sessões já existentes.

**Erros comuns:** usar FQDN para destinos com muitos IPs dinâmicos, quando a ISDB seria mais adequada; confundir porta de origem com porta de destino ao criar um serviço.

### 03.3. Construindo uma policy

**Aprendizado:** montar uma regra mínima e justificar cada campo.

- **03.3.1. Campos da policy:** nome, interfaces de entrada e saída, origem, destino, schedule, serviço, ação, NAT, inspeção, log e comentário. Os campos de NAT, usuários e perfis são aprofundados nos módulos 05, 07 e 10.
- **03.3.2. Organização da lista:** mover regras, ver a lista por sequência ou por par de interfaces, usar seções, comentários e labels. Avaliar o efeito de policies com `any`.

**Erros comuns:** usar `all`/`any` por conveniência; inserir uma regra específica abaixo de uma genérica que já a atende.

### 03.4. Validação

**Aprendizado:** comprovar qual regra atendeu cada conexão.

- **03.4.1. Contadores, hit count e policy lookup:** gerar uma conexão permitida e outra negada e ler contadores e último uso. Usar a ferramenta de policy lookup e diferenciar a previsão da ferramenta do resultado real.

**Erros comuns:** confiar só no policy lookup sem gerar tráfego real.

### 03.5. Manutenção da base de regras

**Aprendizado:** alterar policies com previsibilidade.

- **03.5.1. Sombreamento, duplicidade e regras sem uso:** identificar regras sombreadas, consolidar regras duplicadas e localizar regras e objetos sem uso com contadores e referências.
- **03.5.2. Alterações e sessões existentes:** alterar uma regra durante uma conexão ativa e comparar a sessão existente com uma nova. Explicar a opção que controla a reavaliação de sessões após mudanças (`firewall-session-dirty`).

**Erros comuns:** esperar que uma mudança de policy derrube sempre todas as sessões existentes, ou que nunca derrube nenhuma.

### 03.6. Tráfego local e local-in policies

**Aprendizado:** distinguir tráfego de trânsito de tráfego destinado ao FortiGate ou originado por ele.

- **03.6.1. Trânsito, local-in e local-out:** classificar uma conexão entre redes, um login na GUI e uma consulta DNS feita pelo FortiGate. Mostrar por que procurar tudo na lista de firewall policies leva a diagnósticos errados.
- **03.6.2. Local-in policies *(Aprofundamento)*:** criar regras local-in para restringir o acesso aos serviços do equipamento e compará-las com allowaccess e trusted hosts.

**Erros comuns:** tentar bloquear o acesso à GUI com uma firewall policy comum.

**Laboratório:** criar os objetos das redes da Atlas, liberar usuários → servidores (DNS, HTTP/HTTPS, RDP) e bloquear convidados → redes internas. Testar a ordem das regras e o implicit deny, comprovando com contadores e policy lookup.

**Critério de conclusão:** o aluno prevê qual regra e qual ação atendem uma conexão e comprova a previsão no equipamento.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** stateful e sessão; ordem e implicit deny; tipos de objeto (FQDN, geo, ISDB); schedules; policy lookup; sombreamento; reavaliação de sessões após mudanças; local-in × trânsito.

---

## 04. Logs, sessões e verificação

**Objetivo:** produzir e consultar logs, ler a tabela de sessões, capturar pacotes e usar o debug flow para explicar por que uma conexão passou ou não. Essas ferramentas são usadas em todos os módulos seguintes.
**Pré-requisitos:** 03.
**No cenário:** os acessos criados no módulo 03 passam a ser comprovados por log, sessão, sniffer e debug flow. Os logs são enviados ao FortiAnalyzer/syslog da VLAN de servidores.

### 04.1. O que é registrado

**Aprendizado:** saber qual log deveria existir para cada evento.

- **04.1.1. Tipos de log:** traffic (forward e local), event (sistema, usuário, VPN, HA…) e security (eventos dos perfis). Ler os campos principais: policy ID, interfaces, ação, sessão e tradução.
- **04.1.2. Configuração de log por policy:** comparar "Security Events" com "All Sessions", o registro no início da sessão e a habilitação de log no implicit deny. Explicar por que a ausência de log nem sempre significa ausência de tráfego.

**Erros comuns:** procurar o log de uma negação implícita sem ter habilitado esse registro; interpretar um log de accept como prova de que a aplicação funcionou.

### 04.2. Consulta de logs e FortiView

**Aprendizado:** transformar um sintoma em uma busca que encontre a conexão.

- **04.2.1. Log viewer e filtros:** filtrar por origem, destino, horário, ação e policy ID e abrir o registro completo.
- **04.2.2. FortiView e dashboards:** usar as visões de origens, destinos, aplicações e policies para achar volume e concentração. Diferenciar dados em tempo real de histórico e entender o que depende do destino de log.

**Erros comuns:** olhar a fonte de log errada (memória × disco × FortiAnalyzer) e concluir que o log não existe.

### 04.3. Destinos de log

**Aprendizado:** escolher onde guardar os logs e verificar se eles chegam.

- **04.3.1. Disco, memória, FortiAnalyzer e FortiGate Cloud:** comparar persistência, capacidade e recursos de análise. Configurar o FortiAnalyzer e verificar a conexão e a fila de envio.
- **04.3.2. Syslog e filtros:** enviar logs a um coletor syslog com filtro de severidade e formato. Confirmar o recebimento no coletor, não apenas a configuração no FortiGate.

**Erros comuns:** depender só do log em memória, que se perde no reboot.

### 04.4. Tabela de sessões

**Aprendizado:** localizar uma sessão e ler policy, tradução, estado e tempo restante.

- **04.4.1. Lendo uma sessão:** usar `diagnose sys session filter` e `diagnose sys session list`, ou o monitor da GUI. Ler protocolo, estado, policy_id, origem/destino originais e traduzidos, duração e expiração.
- **04.4.2. Limpeza seletiva:** limpar apenas as sessões filtradas (`diagnose sys session clear`) e entender o risco de limpar a tabela inteira.

**Erros comuns:** executar `diagnose sys session clear` sem filtro em produção.

### 04.5. Captura de pacotes

**Aprendizado:** comprovar a chegada, a saída e a resposta de pacotes.

- **04.5.1. Sniffer na CLI:** usar `diagnose sniffer packet` com interface, filtro, nível de detalhe e quantidade, e observar entrada, saída e ausência de retorno.
- **04.5.2. Packet capture na GUI:** criar uma captura filtrada e exportá-la para análise externa. Entender como o offload em hardware pode esconder pacotes da captura.

**Erros comuns:** capturar sem filtro; concluir que o pacote não passou quando a sessão foi acelerada em hardware.

### 04.6. Debug flow básico

**Aprendizado:** ver a decisão do FortiGate pacote a pacote.

- **04.6.1. Executar o debug flow:** configurar o filtro, iniciar o trace com quantidade limitada, habilitar a saída e encerrar ao final (`diagnose debug flow filter`, `diagnose debug flow trace start`, `diagnose debug enable`, `diagnose debug disable`, `diagnose debug reset`).
- **04.6.2. Interpretar as mensagens:** reconhecer criação de sessão, busca de rota, policy que permitiu e negação ("Denied by forward policy check (policy 0)"). Associar cada mensagem a uma etapa do caminho do pacote. Casos de NAT, RPF e VPN são retomados nos módulos 05, 06 e 13.

**Erros comuns:** deixar o debug habilitado depois do teste; não filtrar e se perder na saída.

**Laboratório:** gerar um acesso permitido e um negado no cenário e encontrar cada um no log. Localizar a sessão do acesso permitido, capturar o mesmo fluxo com o sniffer e explicar a negação pelo debug flow. Enviar os logs ao FortiAnalyzer/syslog e comprovar o recebimento.

**Critério de conclusão:** o aluno comprova o resultado de uma conexão por log, sessão, captura e debug flow e escolhe a ferramenta adequada a cada pergunta.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** tipos e subtipos de log; log no implicit deny; destinos de log; campos da sessão; níveis do sniffer; leitura do debug flow; offload e captura.

---

## 05. NAT

**Objetivo:** permitir a saída à Internet com SNAT, publicar serviços com VIP e comprovar as traduções nas ferramentas do módulo 04.
**Pré-requisitos:** 03, 04.
**No cenário:** as VLANs internas acessam a Internet pela WAN1 e o servidor web da DMZ é publicado em 203.0.113.3.

### 05.1. SNAT na firewall policy

**Aprendizado:** escolher a tradução de origem e prever o endereço que o destino verá.

- **05.1.1. NAT com o endereço da interface:** habilitar NAT na policy e observar a origem vista pelo destino, as portas traduzidas e o retorno pela sessão.
- **05.1.2. IP pools:** comparar os tipos overload, one-to-one, fixed port range e port block allocation e escolher o pool pelo número de usuários e pela necessidade de rastreabilidade.

**Erros comuns:** esquecer o NAT na policy de saída; usar pool one-to-one para muitos usuários.

### 05.2. DNAT com Virtual IP

**Aprendizado:** publicar um serviço interno com VIP e policy.

- **05.2.1. VIP estático e port forwarding:** criar o VIP do servidor web com endereço externo, endereço mapeado e portas. Usar o VIP como destino da policy da WAN para a DMZ e criar VIP groups.
- **05.2.2. Comportamento do VIP:** entender a resposta ARP do endereço externo, a tradução de retorno e a diferença entre a resposta a uma conexão publicada e uma conexão nova iniciada pelo servidor.

**Erros comuns:** criar o VIP e esquecer a policy; esperar que um VIP com port forwarding traduza também as conexões que o servidor inicia.

### 05.3. Verificação das traduções

**Aprendizado:** comprovar a tradução nos dois sentidos.

- **05.3.1. Sessão, sniffer e debug flow com NAT:** ler os campos de tradução na sessão, capturar antes e depois da tradução e identificar SNAT e DNAT nas mensagens do debug flow.

**Erros comuns:** capturar só em uma interface e concluir que a tradução não ocorreu.

### 05.4. Hairpin NAT

**Aprendizado:** permitir que clientes internos acessem o servidor publicado pelo endereço público.

- **05.4.1. Acesso interno ao endereço público:** configurar a policy interna com o VIP e decidir quando é preciso SNAT para manter o retorno pelo FortiGate. Comparar com DNS interno (split DNS).

**Erros comuns:** retorno assimétrico porque o servidor responde diretamente ao cliente interno.

### 05.5. Central NAT e session helpers *(Aprofundamento)*

**Aprendizado:** reconhecer o modelo central de NAT e os protocolos que precisam de tratamento especial.

- **05.5.1. Central NAT:** habilitar o modo central e mostrar a separação entre a tabela de SNAT e as firewall policies, a ordem das regras e o tratamento de VIPs.
- **05.5.2. Session helpers e ALG:** explicar por que protocolos com canal secundário (FTP, SIP) precisam de helper e como identificar quando ele atrapalha.

**Erros comuns:** habilitar Central NAT em um ambiente existente sem planejar a migração das regras.

**Laboratório:** liberar a saída das VLANs pela WAN1 com NAT, usar um IP pool para a VLAN de convidados e publicar o servidor web da DMZ. Testar o acesso externo e o acesso interno com hairpin, comprovando as traduções com sessão, sniffer e debug flow.

**Critério de conclusão:** o aluno explica o papel de policy, SNAT e VIP e comprova a tradução nos dois sentidos.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** tipos de IP pool; VIP e policy; ARP do VIP; hairpin; Central NAT; session helpers.

---

## 06. Roteamento

**Objetivo:** controlar a escolha de caminhos com rotas estáticas, contingência, roteamento por policy e ECMP e diagnosticar descartes por RPF e roteamento assimétrico.
**Pré-requisitos:** 02, 04, 05.
**No cenário:** a matriz passa a ter contingência entre WAN1 e WAN2 e um direcionamento específico de tráfego. O roteamento dinâmico está fora do escopo.

### 06.1. Tabelas de rotas

**Aprendizado:** entender como uma rota passa de configurada a usada.

- **06.1.1. Routing table, database e FIB:** comparar rotas configuradas, candidatas, ativas e instaladas (`get router info routing-table all`, `get router info routing-table database`, `get router info kernel`) e consultar a rota de um destino.

**Erros comuns:** procurar uma rota inativa na tabela de rotas ativas e concluir que ela não foi configurada.

### 06.2. Seleção de rota

**Aprendizado:** prever qual rota será usada.

- **06.2.1. Prefixo, distância, prioridade e métrica:** demonstrar que o prefixo mais específico vence. Entre prefixos iguais vence a menor distância administrativa, e para rotas estáticas com mesma distância a prioridade decide sem retirar a outra da tabela. Mudar um critério por vez e verificar.

**Erros comuns:** usar a prioridade achando que ela retira a rota concorrente da tabela.

### 06.3. Rotas estáticas

**Aprendizado:** construir as rotas necessárias para cada destino.

- **06.3.1. Tipos de rota estática:** rota por gateway e interface, por objeto de endereço e por serviço de Internet (ISDB), rota padrão e rota blackhole.

**Erros comuns:** rota pela interface sem gateway em uma rede multiacesso.

### 06.4. Contingência

**Aprendizado:** trocar de caminho quando o enlace deixa de alcançar o destino.

- **06.4.1. Floating route e link health monitor:** configurar a rota de contingência com distância maior e o link monitor (`config system link-monitor`). Testar a falha além do gateway e observar a retirada da rota e o comportamento de sessões novas e existentes.

**Erros comuns:** depender só do estado físico da interface quando a falha está na operadora.

### 06.5. Policy-based routing

**Aprendizado:** direcionar tráfego por critérios além do destino.

- **06.5.1. Policy routes:** criar policy routes por origem, destino e serviço. Mostrar que elas são avaliadas antes da tabela de rotas e explicar a ação "stop policy routing".

**Erros comuns:** esquecer que uma policy route também captura tráfego que não deveria; não prever o que acontece quando o gateway da policy route cai.

### 06.6. ECMP

**Aprendizado:** distribuir sessões entre caminhos de mesmo custo.

- **06.6.1. Condições e métodos de ECMP:** criar rotas com mesmo destino, distância e prioridade e comparar os métodos de distribuição (source IP, source-destination IP, peso, uso). A distribuição pode ser verificada sessão a sessão. Quando SD-WAN está habilitada, a configuração de distribuição passa a ser feita na SD-WAN (módulo 14).

**Erros comuns:** esperar que uma única conexão use os dois links.

### 06.7. RPF e roteamento assimétrico

**Aprendizado:** entender os descartes por verificação de origem.

- **06.7.1. Reverse path forwarding:** explicar a verificação de origem, os modos loose e strict e onde configurá-los. Reproduzir um descarte por RPF e reconhecê-lo no debug flow.
- **06.7.2. Roteamento assimétrico:** investigar o retorno por outro caminho. Explicar por que permitir roteamento assimétrico reduz a inspeção e não deve ser a primeira solução.

**Erros comuns:** desabilitar o RPF globalmente para esconder uma rota de retorno errada.

**Laboratório:** criar a rota padrão de contingência pela WAN2 com link monitor e simular a falha da operadora A. Direcionar a VLAN de convidados sempre pela WAN2 com policy route, provocar um descarte por RPF e explicá-lo no debug flow.

**Critério de conclusão:** o aluno prevê o caminho de um destino, comprova a troca em falha e distingue seleção de rota, RPF e autorização por policy.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** distância × prioridade; floating route; link monitor; ordem PBR × tabela de rotas; métodos de ECMP; RPF; roteamento assimétrico.

---

## 07. Autenticação

**Objetivo:** identificar usuários com contas locais e servidores remotos, aplicar grupos às policies e controlar o estado da autenticação.
**Pré-requisitos:** 03, 04.
**No cenário:** a navegação da VLAN de usuários passa a exigir usuário do AD, e os convidados usam um portal.

### 07.1. Conceitos

**Aprendizado:** separar autenticação de autorização e conhecer os métodos.

- **07.1.1. Autenticação ativa e passiva:** comparar login solicitado ao usuário com identificação transparente (SSO, módulo 08). Explicar que autenticar não autoriza; quem autoriza é a policy com o grupo.
- **07.1.2. Tipos de usuários e grupos:** usuários locais, remotos e de convidados; grupos de firewall, FSSO, RSSO e guest.

**Erros comuns:** tratar login aceito como acesso autorizado.

### 07.2. Usuários locais e convidados

**Aprendizado:** criar identidades locais com finalidade e validade definidas.

- **07.2.1. Usuários e grupos locais:** criar usuários e grupos, definir senha e expiração e adicionar usuários aos grupos.
- **07.2.2. Gerenciamento de convidados:** criar contas de convidado com validade e um administrador restrito à gestão de convidados.

**Erros comuns:** contas locais sem expiração para acessos temporários.

### 07.3. Servidores remotos

**Aprendizado:** consultar diretório e RADIUS e distinguir falha de autenticação de falha de grupo.

- **07.3.1. LDAP:** configurar servidor, porta, DN base, atributo de usuário e tipo de bind (simple, anonymous, regular) com uma conta de menor privilégio. Usar LDAPS ou STARTTLS e testar com `diagnose test authserver ldap`.
- **07.3.2. Grupos remotos:** mapear grupos do AD em grupos do FortiGate e verificar o grupo recebido para um usuário.
- **07.3.3. RADIUS:** configurar servidor, segredo e NAS IP. Mapear grupos por atributo (por exemplo, Fortinet-Group-Name) e testar com `diagnose test authserver radius`.

**Erros comuns:** DN base ou tipo de bind incorretos; segredo RADIUS divergente; servidor RADIUS que não reconhece o FortiGate como cliente.

### 07.4. Autenticação na policy

**Aprendizado:** transformar uma regra por IP em uma regra por grupo.

- **07.4.1. Policy com grupo:** adicionar o grupo à origem da policy e testar usuário dentro e fora do grupo. Identificar os protocolos que disparam o login (HTTP, HTTPS, FTP, Telnet) e o comportamento de tráfego não interativo, como o DNS.
- **07.4.2. Captive portal:** habilitar o portal na interface da VLAN de convidados e comparar com a autenticação disparada pela policy. Configurar certificado, mensagens de substituição e exceções.

**Erros comuns:** esquecer a policy que libera DNS antes da autenticação; o portal apresenta certificado não confiável ao cliente.

### 07.5. Autenticação multifator

**Aprendizado:** adicionar um segundo fator ao login.

- **07.5.1. FortiToken e outros fatores:** ativar o FortiToken Mobile para um usuário e testar o login. Comparar com token por e-mail e SMS e com autenticação por certificado. Distinguir o que é configurado no FortiGate do que depende do FortiAuthenticator.

**Erros comuns:** hora do FortiGate errada, que faz o token ser recusado.

### 07.6. Estado da autenticação

**Aprendizado:** acompanhar quem está autenticado e até quando.

- **07.6.1. Monitor e timers:** consultar o monitor de usuários e `diagnose firewall auth list`. Comparar os tipos de timeout (idle, hard, new-session) e testar logout e expiração.

**Erros comuns:** timeout curto demais, que exige login repetido; não saber derrubar a autenticação de um usuário específico.

### 07.7. Autenticação de administradores

**Aprendizado:** aplicar a identidade remota à gerência do FortiGate.

- **07.7.1. Administradores remotos:** autenticar administradores via LDAP ou RADIUS, usar administrador wildcard por grupo e manter uma conta local de recuperação. Mencionar TACACS+.

**Erros comuns:** depender só do servidor remoto e perder o acesso quando ele cai.

**Laboratório:** integrar o FGT-MTZ ao AD por LDAPS e exigir o grupo "Usuários-Internet" para navegar. Criar portal com contas de convidado para a VLAN 30 e ativar o FortiToken para um usuário. Testar usuário fora do grupo e expiração da sessão.

**Critério de conclusão:** o aluno mostra a identidade recebida, o grupo reconhecido e a policy aplicada e separa falha de autenticação de negação de acesso.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** tipos de bind LDAP; testes de servidor pela CLI; grupos remotos; protocolos que disparam autenticação; captive portal; tipos de timeout; administrador wildcard.

---

## 08. FSSO e SSO

**Objetivo:** identificar usuários sem pedir login, usando os eventos de logon do AD (FSSO), e conhecer as alternativas RSSO e SAML.
**Pré-requisitos:** 07.
**No cenário:** os usuários do AD passam a ser reconhecidos automaticamente e a autenticação ativa fica apenas como fallback.

### 08.1. Conceitos e modos do FSSO

**Aprendizado:** escolher o modo de coleta pelos requisitos do ambiente.

- **08.1.1. Como o FSSO funciona:** evento de logon → coleta → associação usuário/IP/grupo → envio ao FortiGate → policy. Explicar por que o mapeamento é feito por IP.
- **08.1.2. Modos de coleta:** comparar DC Agent mode, polling pelo Collector Agent, polling feito pelo próprio FortiGate (agentless) e uso do FortiAuthenticator. Listar vantagens, limitações e requisitos de cada um.

**Erros comuns:** escolher o polling pelo FortiGate em um ambiente grande com muitos DCs.

### 08.2. Configuração do Collector Agent

**Aprendizado:** preparar o lado Windows no essencial.

- **08.2.1. Collector e DC Agent:** instalar e configurar os agentes, escolher os DCs monitorados e definir as portas de comunicação. Configurar o modo de acesso (standard × advanced) e os grupos monitorados.

**Erros comuns:** firewall do Windows bloqueando a comunicação entre agentes e FortiGate.

### 08.3. Configuração no FortiGate

**Aprendizado:** consumir os grupos FSSO nas policies.

- **08.3.1. Conector FSSO e grupos:** criar o conector no Security Fabric, selecionar os grupos e criar grupos de usuários do tipo FSSO.
- **08.3.2. Policies com FSSO e fallback:** aplicar os grupos FSSO às policies e definir o tratamento de usuários não identificados com autenticação ativa como fallback.

**Erros comuns:** grupo selecionado no agente que não aparece no FortiGate por causa do filtro de grupos.

### 08.4. Operação e manutenção dos mapeamentos

**Aprendizado:** manter o mapeamento usuário/IP correto ao longo do tempo.

- **08.4.1. Logon, logoff e workstation check:** demonstrar atualização e expiração do mapeamento (workstation check, dead entry timeout) e a troca de IP do usuário.
- **08.4.2. Vários usuários no mesmo IP:** mostrar por que servidores de terminal exigem o TS Agent e não devem ser tratados como um único usuário.

**Erros comuns:** contas de serviço sobrescrevendo o usuário real no mesmo IP; mapeamento antigo mantido depois da troca de IP.

### 08.5. Troubleshooting de FSSO

**Aprendizado:** localizar em qual etapa o usuário deixou de ser identificado.

- **08.5.1. Verificações no FortiGate e nos agentes:** usar `diagnose debug authd fsso list`, o estado do conector e os logs do Collector Agent. Separar falha de coleta, de comunicação, de grupo e de policy.

**Erros comuns:** mexer na policy quando o problema é o usuário que não aparece na lista FSSO.

### 08.6. RSSO e SAML *(Aprofundamento)*

**Aprendizado:** conhecer outras fontes de identidade.

- **08.6.1. RSSO:** receber accounting RADIUS (start, interim, stop) e criar grupos RSSO.
- **08.6.2. SAML:** configurar o FortiGate como SP integrado a um IdP para autenticação de firewall e usar o claim de grupo na policy.

**Erros comuns:** confundir RSSO, que recebe accounting, com a autenticação RADIUS ativa do módulo 07.

**Laboratório:** configurar o Collector Agent em DC Agent mode ou polling e o conector FSSO no FGT-MTZ. Trocar o grupo da policy de navegação para FSSO com fallback ativo. Demonstrar logon, logoff e troca de IP e diagnosticar um usuário não identificado.

**Critério de conclusão:** o aluno mostra a origem do mapeamento, o grupo recebido e a policy que o usou e localiza a etapa de uma falha.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** modos do FSSO; standard × advanced; workstation check; TS Agent; comandos de verificação; RSSO × RADIUS; SAML como SP.

---

## 09. Certificados e inspeção SSL/TLS

**Objetivo:** gerenciar certificados no FortiGate e escolher entre certificate inspection e deep inspection, com as exceções e a confiança necessárias.
**Pré-requisitos:** 03, 04.
**No cenário:** a GUI do FGT-MTZ passa a usar um certificado confiável, a navegação dos usuários recebe deep inspection com a CA distribuída e as exceções ficam definidas.

### 09.1. Certificados no FortiGate

**Aprendizado:** identificar certificados, CAs e chaves e usá-los nos serviços do equipamento.

- **09.1.1. Cadeia, CA e chave privada:** listar certificados locais, CAs e certificados remotos e ler emissor, validade, SAN e uso. Explicar por que importar uma CA não fornece a chave privada de um servidor.
- **09.1.2. CSR, importação e ACME:** gerar CSR, importar o certificado assinado com a cadeia, usar ACME quando suportado e aplicar o certificado à GUI e ao portal de autenticação.
- **09.1.3. Revogação:** configurar a verificação por CRL e OCSP e entender o efeito de hora errada sobre a validação.

**Erros comuns:** importar o certificado sem a cadeia intermediária; certificado sem o SAN correto.

### 09.2. Certificate inspection

**Aprendizado:** saber o que se vê sem decriptar.

- **09.2.1. SNI e certificado:** usar o perfil certificate-inspection e mostrar que é possível filtrar por categoria e domínio, mas não analisar conteúdo, URL completa ou arquivos.

**Erros comuns:** esperar que o AV encontre malware em HTTPS só com certificate inspection.

### 09.3. Deep inspection

**Aprendizado:** decriptar com segurança e distribuir a confiança aos clientes.

- **09.3.1. CA de reassinatura e confiança do cliente:** configurar o perfil deep-inspection com a CA de reassinatura e distribuí-la aos clientes (GPO, MDM). Testar com e sem confiança.
- **09.3.2. Certificados inválidos e não confiáveis:** configurar as ações para certificado expirado, revogado ou não confiável e explicar o papel da CA usada para certificados não confiáveis.

**Erros comuns:** ativar deep inspection sem distribuir a CA; permitir certificados inválidos para "resolver" erros.

### 09.4. Exceções e compatibilidade

**Aprendizado:** decidir o que não será decriptado e por quê.

- **09.4.1. Exceções por categoria, endereço e ISDB:** isentar categorias sensíveis (saúde, finanças) e serviços incompatíveis e mostrar o efeito da isenção sobre os outros perfis.
- **09.4.2. Pinning, mTLS, HSTS e QUIC:** explicar por que certas aplicações quebram com interceptação e qual é o tratamento de QUIC/HTTP3 no perfil.

**Erros comuns:** isentar tudo que falha e deixar a inspeção sem efeito.

### 09.5. Inspeção de servidor *(Aprofundamento)*

**Aprendizado:** inspecionar tráfego que chega a um servidor publicado.

- **09.5.1. Proteção de servidor SSL:** usar o certificado do servidor no perfil para inspecionar o HTTPS de entrada do servidor publicado na DMZ.

**Erros comuns:** usar o perfil de reassinatura de clientes para tráfego de entrada.

### 09.6. Diagnóstico de TLS

**Aprendizado:** separar erro de certificado de bloqueio por perfil.

- **09.6.1. Logs e sintomas:** usar os logs SSL e o certificado apresentado ao navegador para diferenciar falha de confiança, bloqueio de perfil e aplicação incompatível.

**Erros comuns:** tratar qualquer erro de navegador como bloqueio de policy.

**Laboratório:** aplicar à GUI um certificado emitido pela CA da Atlas. Comparar o mesmo acesso com certificate e deep inspection, antes e depois de distribuir a CA aos clientes, e criar exceções para categorias sensíveis.

**Critério de conclusão:** o aluno identifica a CA e o certificado usados, explica o que fica visível em cada modo e separa erro de confiança de bloqueio.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** certificate × deep inspection; CA de reassinatura; certificados não confiáveis; exceções; CSR e cadeia; inspeção de servidor.

---

## 10. Security Profiles: fundamentos, Web Filter e DNS Filter

**Objetivo:** entender como os perfis atuam sobre o tráfego permitido pela policy, escolher o modo de inspeção e controlar navegação e resolução de nomes.
**Pré-requisitos:** 01.6, 03, 07, 09.
**No cenário:** a navegação dos usuários e dos convidados recebe perfis Web Filter e DNS Filter diferentes, com exceções por grupo.

### 10.1. Fundamentos dos Security Profiles

**Aprendizado:** associar perfis à policy e escolher o modo de inspeção.

- **10.1.1. Policy, perfil e evento:** mostrar que a policy autoriza e o perfil inspeciona o tráfego permitido. Associar um perfil, gerar um evento e localizá-lo no log de segurança.
- **10.1.2. Flow-based × proxy-based:** comparar os modos na policy pelo tratamento do tráfego, pelos recursos disponíveis em cada um e pelo consumo. Consultar a matriz de recursos por modo.
- **10.1.3. Protocol options e mensagens de substituição:** configurar portas e protocolos inspecionados, opções de tamanho e as páginas apresentadas ao usuário em um bloqueio.
- **10.1.4. Modo NGFW policy-based *(Aprofundamento)*:** comparar o modo profile-based com o policy-based, em que aplicações e categorias entram direto na regra, e entender que a troca é feita por VDOM.

**Erros comuns:** achar que o modo proxy é sempre "melhor"; esquecer a inspeção SSL e achar que o perfil não funciona.

### 10.2. Web Filter por categorias FortiGuard

**Aprendizado:** controlar navegação por categoria e entender a dependência do serviço de rating.

- **10.2.1. Categorias e ações:** configurar as ações allow, monitor, block, warning e authenticate por categoria e testar cada uma.
- **10.2.2. Rating e indisponibilidade:** entender a consulta de rating, o cache e o comportamento quando o FortiGuard não responde ou o site não tem classificação.

**Erros comuns:** bloquear categorias sem monitorar antes; não definir o comportamento para erros de rating.

### 10.3. Filtro estático de URL

**Aprendizado:** tratar URLs específicas antes das categorias.

- **10.3.1. Entradas, tipos e ações:** criar entradas simple, wildcard e regex com as ações allow, block, monitor e exempt. Entender a ordem de avaliação em relação às categorias e o efeito de "exempt" nas demais inspeções.

**Erros comuns:** usar "exempt" quando a intenção era só permitir, e com isso desligar outras inspeções.

### 10.4. Controles adicionais do Web Filter

**Aprendizado:** aplicar exceções e controles finos com escopo definido.

- **10.4.1. Rating overrides e categorias locais:** reclassificar um site em uma categoria local ou em outra categoria e comprovar qual classificação prevalece.
- **10.4.2. Overrides por usuário e grupo:** usar o web profile override e a ação authenticate para permitir exceções a um grupo do módulo 07 ou 08.
- **10.4.3. SafeSearch, quotas e filtro de conteúdo:** forçar SafeSearch, configurar quotas de uso por categoria e filtrar por palavras. Verificar o modo de inspeção que cada recurso exige.

**Erros comuns:** criar override sem prazo de validade; configurar quota em um modo que não a suporta.

### 10.5. DNS Filter

**Aprendizado:** filtrar domínios na resolução DNS e escolher o ponto de aplicação.

- **10.5.1. Categorias, botnet C&C e domínios locais:** configurar as categorias FortiGuard, o bloqueio de domínios de botnet e uma lista local de domínios. Comparar as respostas de bloqueio e de redirecionamento ao portal.
- **10.5.2. Ponto de aplicação:** aplicar o perfil na firewall policy e no DNS server do FortiGate. Explicar o que acontece quando o cliente usa outro resolvedor ou DNS cifrado (DoH/DoT).
- **10.5.3. DNS Filter × Web Filter:** comparar os dois filtros pela etapa em que atuam, pelo que conseguem ver e pela mensagem que o usuário recebe.

**Erros comuns:** aplicar o DNS Filter só em um caminho e deixar outro resolvedor sem filtro.

### 10.6. Diagnóstico de Web e DNS Filter

**Aprendizado:** encontrar o critério que gerou a ação.

- **10.6.1. Logs, rating e cache:** usar o log de Web Filter, `diagnose debug rating` e o estado do serviço para identificar categoria, regra e ação. Verificar conectividade com o FortiGuard e cache.

**Erros comuns:** mudar a categoria quando o problema é falta de inspeção SSL.

**Laboratório:** criar perfis diferentes para usuários e convidados, bloquear categorias e criar uma URL específica permitida. Reclassificar um site, liberar uma categoria só para um grupo do AD e aplicar DNS Filter com bloqueio de botnet. Comprovar cada decisão pelos logs.

**Critério de conclusão:** o aluno identifica a classificação, a regra e a ação de cada acesso e explica onde cada filtro atuou.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** flow × proxy; protocol options; ações do Web Filter; ordem URL estática × categorias; exempt; rating override; web profile override; DNS Filter × Web Filter; erros de rating.

---

## 11. Application Control, IPS e DoS

**Objetivo:** identificar e controlar aplicações independentemente da porta, proteger serviços com IPS e conter anomalias de tráfego com DoS policies.
**Pré-requisitos:** 09, 10.
**No cenário:** a Atlas bloqueia categorias de aplicações para convidados, protege a DMZ e os servidores com IPS e cria uma DoS policy para o serviço publicado.

### 11.1. Application Control

**Aprendizado:** reconhecer a aplicação além de IP e porta e controlar seu uso.

- **11.1.1. Identificação de aplicações:** mostrar que a aplicação é identificada ao longo da sessão por assinaturas e entender a dependência da inspeção SSL. Comparar a aplicação detectada com o serviço permitido na policy.
- **11.1.2. Sensor, categorias e overrides:** configurar ações por categoria, overrides por aplicação e filtros por risco, popularidade e tecnologia, e conhecer as ações disponíveis.
- **11.1.3. Aplicações desconhecidas e enforcement:** tratar tráfego não identificado e entender port/protocol enforcement.

**Erros comuns:** bloquear uma aplicação que o usuário acessa pela porta permitida e esperar efeito sem inspeção SSL.

### 11.2. Application Control × ISDB

**Aprendizado:** escolher entre controlar a aplicação na policy ou no perfil.

- **11.2.1. Quando usar cada mecanismo:** comparar ISDB na policy (decisão no primeiro pacote, por IP e porta) com Application Control (decisão após a identificação). Mostrar o impacto disso em SD-WAN e no consumo do equipamento.

**Erros comuns:** esperar decisão no primeiro pacote com Application Control.

### 11.3. IPS

**Aprendizado:** montar um sensor coerente com os ativos protegidos.

- **11.3.1. Engine, assinaturas e atualização:** explicar o papel do engine e da base de assinaturas e a dependência da inspeção SSL e da licença.
- **11.3.2. Sensores, filtros e overrides:** criar sensores por severidade, alvo (cliente/servidor), sistema operacional e aplicação. Ajustar uma assinatura com override e comparar a ação padrão com monitor, block, reset e quarantine.
- **11.3.3. Exceções e quarentena:** criar uma exceção por IP para um falso positivo e configurar quarentena do atacante com duração definida.

**Erros comuns:** aplicar um sensor com todas as assinaturas a tudo; isentar uma assinatura inteira para todos os ativos por um único falso positivo.

### 11.4. Proteções complementares do IPS

**Aprendizado:** usar os recursos do IPS além das assinaturas comuns.

- **11.4.1. Botnet C&C e fail-open:** habilitar o bloqueio de conexões a servidores de botnet. Explicar o comportamento de fail-open do IPS quando o engine fica sobrecarregado.

**Erros comuns:** desconhecer que, com fail-open, o tráfego passa sem inspeção em sobrecarga.

### 11.5. DoS policies

**Aprendizado:** proteger recursos contra anomalias volumétricas.

- **11.5.1. Anomalias, limiares e ações:** criar uma DoS policy para o servidor publicado com anomalias (SYN flood, UDP flood, port scan) e limiares. Começar em monitor e entender que a DoS policy é avaliada antes da firewall policy.

**Erros comuns:** limiares baixos demais bloqueando tráfego legítimo; esperar da DoS policy a função de um sensor IPS.

### 11.6. Diagnóstico

**Aprendizado:** confirmar qual mecanismo e qual critério geraram o evento.

- **11.6.1. Logs e falsos positivos:** ler os logs de Application Control, IPS e anomalia, identificar a assinatura e o sensor e ajustar no menor escopo possível.

**Erros comuns:** desabilitar o perfil inteiro em vez de criar uma exceção.

**Laboratório:** bloquear categorias de aplicações para convidados, aplicar IPS na policy da DMZ e simular um evento de validação benigno. Criar exceção para um falso positivo e uma DoS policy em modo monitor para o servidor publicado.

**Critério de conclusão:** o aluno explica por que uma porta permitida pode transportar uma aplicação bloqueada e mostra qual sensor e qual ação geraram cada evento.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** identificação de aplicações; overrides; Application Control × ISDB; filtros de IPS; ações do IPS; quarentena; fail-open; ordem da DoS policy.

---

## 12. Antivirus e inspeção de arquivos

**Objetivo:** analisar arquivos em trânsito com Antivirus, entender os modos e limites de inspeção e complementar com File Filter e serviços externos.
**Pré-requisitos:** 09, 10.
**No cenário:** a navegação e os downloads dos usuários passam por AV, e tipos de arquivo de risco são bloqueados para convidados.

### 12.1. Funcionamento do Antivirus

**Aprendizado:** entender o que é analisado e como.

- **12.1.1. Bases e engine:** explicar assinaturas, heurística e as bases disponíveis e verificar versão e atualização.
- **12.1.2. Flow-based × proxy-based no AV:** comparar como cada modo trata o arquivo, a experiência do usuário e os recursos exclusivos de cada um.

**Erros comuns:** achar que AV sem inspeção SSL protege downloads HTTPS.

### 12.2. Configuração do perfil

**Aprendizado:** aplicar AV aos protocolos certos e tratar o que não pode ser analisado.

- **12.2.1. Protocolos e ações:** habilitar AV por protocolo e testar com o arquivo EICAR, por HTTP e por HTTPS com deep inspection.
- **12.2.2. Arquivos grandes, compactados e protegidos:** configurar o tratamento de arquivos acima do limite (oversize), arquivos protegidos por senha e níveis de compactação.

**Erros comuns:** confundir bloqueio por limite técnico com detecção de malware.

### 12.3. Proteções complementares

**Aprendizado:** conhecer os recursos que ampliam o AV.

- **12.3.1. Outbreak prevention e listas de hash:** usar a consulta ao FortiGuard para ameaças recentes e listas externas de hash.
- **12.3.2. Content Disarm and Reconstruction:** reconstruir documentos removendo conteúdo ativo, nos modos e formatos suportados.
- **12.3.3. Sandbox *(Aprofundamento)*:** enviar arquivos ao FortiSandbox ou ao serviço de sandbox em nuvem e comparar a análise inline com a posterior.

**Erros comuns:** supor que o veredito do sandbox bloqueia o primeiro download em qualquer modo.

### 12.4. File Filter

**Aprendizado:** bloquear arquivos por características, sem veredito de malware.

- **12.4.1. Tipo real, direção e protocolo:** criar regras de upload e download por tipo de arquivo reconhecido (e não pela extensão) e definir a ação.

**Erros comuns:** bloquear por extensão achando que o File Filter não reconhece o tipo real.

### 12.5. Diagnóstico

**Aprendizado:** saber o que aconteceu com cada arquivo.

- **12.5.1. Logs e quarentena:** diferenciar arquivo analisado e limpo, detectado, bloqueado por limite e bloqueado por File Filter. Consultar a quarentena quando houver disco ou FortiAnalyzer.

**Erros comuns:** não encontrar o evento por procurar no log do perfil errado.

**Laboratório:** aplicar AV à navegação dos usuários e testar EICAR por HTTP e por HTTPS, com e sem deep inspection. Configurar o tratamento de arquivos oversize e protegidos e bloquear executáveis para convidados com File Filter.

**Critério de conclusão:** o aluno identifica se um arquivo foi analisado, detectado, bloqueado por condição técnica ou bloqueado por tipo.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** AV flow × proxy; protocolos inspecionados; oversize; arquivos protegidos; outbreak prevention; CDR; File Filter × AV.

---

## 13. VPN IPsec

**Objetivo:** interligar matriz e filial e dar acesso a usuários remotos com IPsec, comprovando negociação, rotas e policies e diagnosticando cada etapa.
**Pré-requisitos:** 03, 05, 06, 07, 09.
**No cenário:** FGT-MTZ e FGT-FIL são interligados por um túnel site-to-site e os usuários remotos acessam os servidores com FortiClient.
**Atenção à versão:** o SSL VPN mudou bastante nas versões recentes do FortiOS: o tunnel mode foi descontinuado e o web mode se tornou Agentless VPN. Confira no blueprint 7.6 o que é cobrado.

### 13.1. Conceitos de IPsec

**Aprendizado:** relacionar cada parâmetro à negociação ou à proteção do tráfego.

- **13.1.1. IKE, Phase 1 e Phase 2:** explicar IKEv1 e IKEv2, autenticação por PSK ou certificado, propostas, DH, lifetimes, Phase 2 com seletores e PFS, e DPD.
- **13.1.2. ESP e NAT-T:** explicar o encapsulamento, a detecção de NAT no caminho e o efeito do overhead na MTU.

**Erros comuns:** achar que a Phase 1 ativa prova que o tráfego passa.

### 13.2. Modos e topologias no FortiGate

**Aprendizado:** escolher o modo de VPN e a topologia.

- **13.2.1. Route-based × policy-based:** comparar a VPN por interface (padrão) com a VPN por policy (ação IPsec) e explicar por que a route-based é a recomendada.
- **13.2.2. Site-to-site, hub-and-spoke e dial-up:** comparar topologias e explicar peer estático e dinâmico.

**Erros comuns:** misturar VPN policy-based e route-based no mesmo cenário sem necessidade.

### 13.3. VPN site-to-site

**Aprendizado:** interligar redes e mostrar o que depende do túnel, da rota e da policy.

- **13.3.1. Wizard e configuração personalizada:** comparar o que o assistente cria com a configuração manual equivalente e identificar os objetos gerados.
- **13.3.2. Rotas e policies:** criar a rota para a rede remota pela interface do túnel, uma rota blackhole de proteção e policies nas direções que iniciam conexões. Decidir se é preciso NAT.

**Erros comuns:** esquecer a rota ou a policy de um dos lados; seletores de Phase 2 que não batem com as redes reais.

### 13.4. VPN de acesso remoto

**Aprendizado:** dar acesso a usuários remotos com identidade e autorização.

- **13.4.1. Dial-up com FortiClient:** configurar o servidor dial-up com IKEv2, mode-config, pool de endereços, DNS e split tunnel × full tunnel.
- **13.4.2. Autenticação do usuário remoto:** usar os grupos LDAP/RADIUS e o MFA do módulo 07 (EAP no IKEv2, XAuth no IKEv1) e limitar os recursos acessíveis com policies.
- **13.4.3. Agentless VPN:** apresentar o acesso por portal web (bookmarks, realms) que substitui o antigo SSL VPN web mode e compará-lo com a VPN de rede.

**Erros comuns:** pool de endereços sobreposto a redes internas; split tunnel sem as rotas das redes internas.

### 13.5. Redundância *(Aprofundamento)*

**Aprendizado:** manter a interligação quando um link falha.

- **13.5.1. Túneis redundantes:** criar um segundo túnel pela WAN2, usar distância e prioridade nas rotas e detectar falha com DPD e link monitor. Esse cenário prepara o uso de túneis como membros de SD-WAN (módulo 14).

**Erros comuns:** dois túneis ativos sem controle de rota, causando tráfego assimétrico.

### 13.6. Diagnóstico de VPN

**Aprendizado:** investigar cada etapa antes de alterar parâmetros.

- **13.6.1. Negociação:** usar o monitor de IPsec, `diagnose vpn ike gateway list`, `diagnose vpn tunnel list` e o debug do IKE com filtro (`diagnose debug application ike -1`). Diferenciar peer inalcançável, proposta incompatível, PSK errada e seletores incompatíveis.
- **13.6.2. Túnel ativo sem comunicação:** verificar seletores, rota, policy, NAT e retorno com sessão, sniffer e debug flow.

**Erros comuns:** trocar vários parâmetros ao mesmo tempo; deixar o debug do IKE habilitado.

**Laboratório:** criar a VPN route-based entre FGT-MTZ e FGT-FIL e comprovar SAs, rotas e policies nos dois sentidos. Configurar o acesso remoto com FortiClient, grupo do AD e MFA. Provocar e diagnosticar uma falha de proposta e uma de seletor.

**Critério de conclusão:** o aluno explica por que um túnel estabelecido não comprova o acesso entre as redes e localiza a etapa de uma falha.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** Phase 1 × Phase 2; IKEv1 × IKEv2; route-based × policy-based; NAT-T; mode-config; split tunnel; rotas blackhole; comandos de diagnóstico; Agentless VPN.

---

## 14. SD-WAN

**Objetivo:** usar vários links WAN com medição de qualidade, escolher o caminho por regras e estratégias e controlar o consumo com traffic shaping básico.
**Pré-requisitos:** 05, 06, 11, 13.
**No cenário:** WAN1 e WAN2 do FGT-MTZ passam a formar a SD-WAN, com regras para aplicações críticas e para a navegação. Os túneis com a filial entram como membros no aprofundamento.

### 14.1. Membros e zones

**Aprendizado:** transformar interfaces em membros de SD-WAN sem quebrar a configuração.

- **14.1.1. Membros, zones e migração:** adicionar membros com gateway, custo e prioridade e organizar as zones, incluindo a zone padrão. Remover antes as referências que impedem usar a interface como membro.

**Erros comuns:** tentar adicionar uma interface já referenciada em rotas e policies.

### 14.2. Rotas, policies e NAT

**Aprendizado:** integrar a SD-WAN ao encaminhamento e à autorização.

- **14.2.1. Rota padrão e policies pela zone:** criar a rota padrão para a zone SD-WAN e policies com a zone como interface de saída. Verificar o NAT por membro e a origem vista pelo destino.

**Erros comuns:** esquecer a rota pela zone e achar que a regra SD-WAN substitui a rota.

### 14.3. Performance SLA

**Aprendizado:** definir quando um link está disponível e adequado.

- **14.3.1. Health checks:** configurar o servidor e o protocolo de probe (ping, HTTP, DNS…) e acompanhar latência, jitter e perda. Entender o efeito do destino escolhido.
- **14.3.2. Limiares, falha e recuperação:** definir SLA targets, failtime e recoverytime, ver o estado dos membros e ligar o SLA à atualização de rotas.

**Erros comuns:** usar o gateway da operadora como destino de probe e não detectar falhas além dele.

### 14.4. Regras SD-WAN

**Aprendizado:** prever o membro escolhido para cada fluxo.

- **14.4.1. Regra implícita:** entender o comportamento quando nenhuma regra corresponde e os métodos de balanceamento da regra implícita.
- **14.4.2. Estratégias:** comparar manual, best quality, lowest cost (SLA) e maximize bandwidth (SLA) e testar o mesmo fluxo com cada uma.
- **14.4.3. Critérios de correspondência:** usar origem, destino, ISDB, aplicação e usuário/grupo e conhecer as limitações da identificação por aplicação no primeiro pacote.

**Erros comuns:** achar que lowest cost escolhe o link de menor latência; esperar que a regra por aplicação atue desde o primeiro pacote.

### 14.5. Operação e diagnóstico

**Aprendizado:** validar a decisão e o comportamento em falha.

- **14.5.1. Monitores e comandos:** usar os monitores de SD-WAN e SLA e os comandos `diagnose sys sdwan health-check`, `diagnose sys sdwan member` e `diagnose sys sdwan service`.
- **14.5.2. Falha e sessões existentes:** provocar degradação e falha e comparar sessões novas e existentes. Conhecer as opções que controlam a migração das sessões.

**Erros comuns:** validar só pelo gráfico de SLA, sem conferir a sessão real.

### 14.6. Traffic shaping básico

**Aprendizado:** limitar ou garantir banda para tipos de tráfego.

- **14.6.1. Shapers e traffic shaping policies:** comparar shared shaper e per-IP shaper e configurar limite máximo, garantia e prioridade. Criar uma shaping policy por aplicação ou serviço.

**Erros comuns:** configurar garantia maior que a banda real do link.

### 14.7. Túneis IPsec como membros *(Aprofundamento)*

**Aprendizado:** escolher caminhos entre sites.

- **14.7.1. Overlays na SD-WAN:** adicionar os túneis do módulo 13 a uma zone, medir SLA pelo túnel e criar regras para o tráfego entre matriz e filial.

**Erros comuns:** medir o SLA do overlay pela Internet em vez de por dentro do túnel.

**Laboratório:** criar a SD-WAN com WAN1 e WAN2 e um health check para um destino público. Regras: aplicações críticas por best quality, navegação por lowest cost e convidados só pela WAN2. Simular perda e latência, comprovar a troca e aplicar um shaper à VLAN de convidados.

**Critério de conclusão:** o aluno prevê o membro escolhido para um fluxo e comprova a decisão em condição normal e em falha.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** membros e zones; regra implícita; estratégias; SLA, failtime e recoverytime; critérios de regra; comandos de diagnóstico; shared × per-IP shaper.

---

## 15. Security Fabric

**Objetivo:** integrar o FortiGate a outros produtos Fortinet, usar a topologia e o Security Rating e automatizar respostas a eventos.
**Pré-requisitos:** 04, 07, 13.
**No cenário:** FGT-MTZ (root), FGT-FIL (downstream) e FortiAnalyzer formam o Fabric da Atlas. Uma automação responde a um host comprometido.

### 15.1. Conceitos

**Aprendizado:** entender os papéis e requisitos do Fabric.

- **15.1.1. Componentes e papéis:** explicar root e downstream, os produtos participantes (FortiAnalyzer, FortiClient EMS, FortiSwitch, FortiAP, FortiSandbox) e os requisitos de log e de versão para formar o Fabric.

**Erros comuns:** tentar formar o Fabric sem o requisito de log atendido; usar versões incompatíveis entre os membros.

### 15.2. Formação do Fabric

**Aprendizado:** autorizar os participantes e ler a topologia.

- **15.2.1. Root e downstream:** habilitar o Fabric no root, conectar e autorizar o downstream e verificar o estado da conexão.
- **15.2.2. Topologias:** ler as visões física e lógica e identificar dispositivos, conexões e alertas.

**Erros comuns:** esquecer de autorizar o downstream no root.

### 15.3. Conectores do Fabric

**Aprendizado:** receber contexto de outras fontes.

- **15.3.1. FortiClient EMS:** conectar o EMS e consultar as informações de endpoint recebidas. O uso de tags em ZTNA está no apêndice C.
- **15.3.2. Threat feeds:** consumir listas externas de IP, domínio e URL e usá-las em policies e perfis.
- **15.3.3. Outros conectores *(Aprofundamento)*:** apresentar SDN connectors e objetos de endereço dinâmicos.

**Erros comuns:** threat feed com formato inválido ou inacessível, sem que se perceba que a lista está vazia.

### 15.4. Security Rating

**Aprendizado:** usar a avaliação para melhorar a configuração.

- **15.4.1. Executar e interpretar:** rodar o Security Rating, interpretar achados e recomendações e aplicar uma correção, distinguindo recomendação de alteração efetiva.

**Erros comuns:** aplicar uma recomendação sem avaliar o impacto na operação.

### 15.5. Automation stitches

**Aprendizado:** transformar um evento em ação controlada.

- **15.5.1. Triggers e ações:** criar automações com gatilho (evento de log, host comprometido, reboot, conserve mode, agenda) e ações (e-mail, IP ban, quarentena, script CLI, webhook).
- **15.5.2. Teste e controle:** testar a automação, verificar a execução e evitar disparos repetidos ou reações amplas demais.

**Erros comuns:** criar uma ação de bloqueio disparada por um evento genérico demais.

**Laboratório:** formar o Fabric com FGT-MTZ, FGT-FIL e FortiAnalyzer. Executar o Security Rating e corrigir um achado. Criar uma automação que envia e-mail e bloqueia o IP de um host comprometido e consumir um threat feed de teste em uma policy.

**Critério de conclusão:** o aluno identifica os participantes, a informação recebida de cada um e o efeito de uma automação.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** root × downstream; requisitos do Fabric; conectores; threat feeds; Security Rating; triggers e ações de automação.

---

## 16. Alta disponibilidade

**Objetivo:** formar um cluster FGCP, entender eleição, sincronização e failover e manter o cluster com segurança.
**Pré-requisitos:** 02, 04, 13.
**No cenário:** FGT-MTZ e FGT-MTZ-2 formam um cluster active-passive na matriz.

### 16.1. Conceitos do FGCP

**Aprendizado:** conhecer os modos e requisitos do cluster.

- **16.1.1. Active-passive e active-active:** comparar os modos pelo encaminhamento e pela distribuição de sessões. Explicar que active-active distribui principalmente inspeção, não todo o tráfego.
- **16.1.2. Requisitos e parâmetros:** mesmo modelo, firmware e licenças, além de group ID, group name, senha, interfaces de heartbeat e MAC virtual.

**Erros comuns:** tentar formar cluster com firmware ou licenças diferentes.

### 16.2. Eleição do primário

**Aprendizado:** prever qual membro será o primário.

- **16.2.1. Critérios com override desabilitado e habilitado:** com override desabilitado, a ordem é interfaces monitoradas, uptime de HA, prioridade e serial. Com override habilitado, a prioridade vem antes do uptime. Demonstrar o efeito do override na volta de um membro.

**Erros comuns:** esperar que a maior prioridade volte a ser primário sem override habilitado.

### 16.3. Formação e sincronização

**Aprendizado:** formar o cluster e verificar a sincronização.

- **16.3.1. Configuração do cluster:** configurar os dois membros, formar o cluster e verificar papéis e heartbeat com `get system ha status`.
- **16.3.2. Sincronização e checksums:** entender o que é sincronizado e o que não é (hostname, prioridade de HA, interface de gerência reservada…). Comparar checksums com `diagnose sys ha checksum cluster` e corrigir divergências.

**Erros comuns:** heartbeat por um único enlace; esperar que hostname e prioridade sejam sincronizados.

### 16.4. Gerência dos membros

**Aprendizado:** acessar cada membro individualmente.

- **16.4.1. Interface de gerência reservada e acesso ao secundário:** configurar a interface de gerência reservada e acessar o secundário pela CLI do primário (`execute ha manage`).

**Erros comuns:** ficar sem acesso ao secundário para diagnóstico.

### 16.5. Failover

**Aprendizado:** medir o que continua funcionando após a troca de primário.

- **16.5.1. Interfaces monitoradas e remote link monitor:** configurar o monitoramento de interfaces e de caminho remoto e testar cada condição de failover separadamente.
- **16.5.2. Session pickup:** habilitar session pickup e as opções para tráfego sem conexão. Testar sessões TCP, UDP e VPN durante o failover e entender o que não é preservado.
- **16.5.3. Split brain:** explicar o que acontece na perda total do heartbeat e como prevenir.

**Erros comuns:** testar failover só desligando o equipamento; esperar que toda sessão sobreviva ao failover.

### 16.6. Manutenção do cluster

**Aprendizado:** atualizar e substituir membros com previsibilidade.

- **16.6.1. Upgrade do cluster:** comparar o uninterruptible upgrade com o upgrade simultâneo e verificar os serviços depois da atualização.
- **16.6.2. Substituição de membro:** remover e reintegrar um membro e conferir sincronização e papéis.

**Erros comuns:** atualizar sem verificar a sincronização antes.

### 16.7. Outras opções de HA *(Aprofundamento)*

**Aprendizado:** conhecer alternativas ao FGCP.

- **16.7.1. FGSP e VRRP:** comparar o compartilhamento de sessões entre equipamentos independentes (FGSP) e a redundância de gateway (VRRP) com o FGCP pelo estado preservado. Virtual clustering com VDOMs está no apêndice B.

**Erros comuns:** esperar que o VRRP sincronize configuração ou sessões.

**Laboratório:** formar o cluster FGT-MTZ/FGT-MTZ-2 em active-passive com interfaces monitoradas e gerência reservada. Testar failover por interface e por caminho remoto com sessões ativas, demonstrar o efeito do override e atualizar o firmware do cluster.

**Critério de conclusão:** o aluno prevê o primário eleito, comprova sincronização e continuidade e executa manutenção com critérios de sucesso.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** modos FGCP; critérios de eleição com e sem override; o que não sincroniza; checksums; gerência reservada; session pickup; split brain; upgrade do cluster; FGSP × VRRP.

---

## 17. Diagnóstico e projeto final

**Objetivo:** aplicar um método de diagnóstico, entender o consumo de recursos e a aceleração em hardware, coletar evidências para o suporte e integrar o curso em um projeto completo.
**Pré-requisitos:** todos os módulos anteriores.
**No cenário:** o ambiente da Atlas recebe falhas propositais para diagnóstico e uma lista de requisitos para o projeto final.

### 17.1. Metodologia

**Aprendizado:** investigar um problema por etapas, com uma hipótese por vez.

- **17.1.1. Do sintoma à causa:** delimitar o problema (quem, o quê, desde quando) e escolher a ferramenta por pergunta: log, sessão, sniffer, debug flow ou debug de aplicação. Mudar uma coisa de cada vez e registrar.

**Erros comuns:** alterar vários parâmetros ao mesmo tempo; tirar conclusão sem evidência.

### 17.2. Recursos do sistema

**Aprendizado:** relacionar consumo a serviços configurados.

- **17.2.1. CPU, memória e sessões:** usar `get system performance status`, `diagnose sys top` e os dashboards e relacionar processos ao serviço que os consome.
- **17.2.2. Conserve mode:** explicar os limiares de memória, o que muda no comportamento do equipamento e as opções de fail-open do AV e do IPS.

**Erros comuns:** desconhecer que, em conserve mode, o tráfego pode passar sem inspeção, conforme a configuração.

### 17.3. Aceleração em hardware

**Aprendizado:** entender quando o tráfego é acelerado e o efeito disso no diagnóstico.

- **17.3.1. NP, CP e SoC:** identificar os processadores do modelo e os critérios de offload. Consultar se uma sessão está acelerada.
- **17.3.2. Offload e visibilidade:** entender por que o sniffer e o debug flow podem não ver pacotes acelerados e quando desabilitar o offload temporariamente, na policy de teste e só durante o teste.

**Erros comuns:** desabilitar o offload globalmente para diagnosticar.

### 17.4. Debug por componente

**Aprendizado:** escolher o debug do processo certo.

- **17.4.1. Processos e debugs:** apresentar os debugs de autenticação (authd/fnbamd), IKE, proxy (WAD), IPS e rating. Sempre limitar por filtro e duração e encerrar com `diagnose debug disable` e `diagnose debug reset`.

**Erros comuns:** habilitar vários debugs ao mesmo tempo em produção.

### 17.5. Suporte

**Aprendizado:** preparar um caso de suporte útil.

- **17.5.1. Crash logs e coleta:** consultar `diagnose debug crashlog read` e gerar o relatório de diagnóstico (`execute tac report`). Registrar modelo, build, horário, sintoma e passos de reprodução e revisar dados sensíveis antes de enviar.

**Erros comuns:** abrir chamado sem informar build e passos de reprodução.

### 17.6. Projeto final

**Aprendizado:** implantar e diagnosticar o ambiente completo.

- **17.6.1. Implantação integrada:** a partir de uma lista de requisitos da Atlas, configurar a matriz em cluster com SD-WAN, a filial com VPN, usuários com FSSO, perfis de segurança com deep inspection, publicação na DMZ e Fabric com automação.
- **17.6.2. Diagnóstico de falhas injetadas:** resolver um conjunto de falhas (policy, rota, NAT, VPN, autenticação, rating, HA) apresentando a evidência de cada causa.

**Erros comuns:** validar só o "funcionou" sem registrar a evidência exigida.

**Laboratório:** o próprio projeto final.

**Critério de conclusão:** o aluno entrega o ambiente atendendo aos requisitos e explica, com evidência, a causa de cada falha injetada.

**Pontos cobrados na prova (para os quadros "Dica para a prova"):** metodologia de diagnóstico; conserve mode; fail-open; offload e captura; debugs por processo; coleta para suporte. Gerar também um simulado completo com questões de todos os módulos.

---

## Apêndice A. Além do NSE 4: FortiSwitch e FortiAP

**Objetivo:** gerenciar switches e access points pelo FortiGate e aplicar segmentação e autenticação na LAN e no Wi-Fi.
**Pré-requisitos:** 02, 03, 07.

### A.1. FortiSwitch via FortiLink

**Aprendizado:** autorizar o switch e distribuir VLANs pelo FortiGate.

- **A.1.1. FortiLink e autorização:** configurar a interface FortiLink, autorizar o FortiSwitch e verificar a comunicação de controle.
- **A.1.2. VLANs e portas:** criar VLANs pelo FortiGate e configurar modo de porta, VLAN nativa e permitidas e PoE.
- **A.1.3. Proteções e admissão:** aplicar STP, loop guard e DHCP snooping e configurar 802.1X e MAB com VLAN dinâmica.

**Erros comuns:** confundir gerência do switch com o caminho do tráfego dos clientes.

### A.2. FortiAP pelo controlador wireless

**Aprendizado:** publicar SSIDs e identificar o caminho do tráfego.

- **A.2.1. Descoberta e autorização:** autorizar o FortiAP via CAPWAP e associar um perfil de AP.
- **A.2.2. SSIDs tunnel e bridge:** comparar os modos pelo caminho do tráfego e pela aplicação de policy.
- **A.2.3. Segurança do SSID:** configurar WPA2/WPA3 Personal e Enterprise (RADIUS) e SSID de convidados com portal.

**Erros comuns:** esperar que a policy do FortiGate inspecione um SSID em bridge que não passa por ele.

**Laboratório:** autorizar um FortiSwitch e um FortiAP, levar as VLANs da Atlas às portas e publicar os SSIDs corporativo (802.1X) e de convidados (portal).

**Critério de conclusão:** o aluno distingue gerência do dispositivo, configuração da porta ou do SSID e autorização na policy.

---

## Apêndice B. Além do NSE 4: VDOMs

**Objetivo:** separar contextos de configuração e administração em um mesmo FortiGate.
**Pré-requisitos:** 01, 03, 06, 16.
**Atenção à versão:** confira no blueprint 7.6 se VDOMs são cobrados; versões anteriores da prova cobravam.

### B.1. Conceitos e configuração

**Aprendizado:** entender o que é global e o que é por VDOM.

- **B.1.1. Multi-VDOM, global e management VDOM:** habilitar VDOMs, atribuir interfaces e administradores e explicar o papel do management VDOM.
- **B.1.2. Inter-VDOM links:** criar o link entre VDOMs com rotas e policies e comprovar o tráfego.
- **B.1.3. Virtual clustering:** distribuir VDOMs entre os membros de um cluster.

**Erros comuns:** esquecer que alguns parâmetros são globais e afetam todos os VDOMs.

**Laboratório:** criar um VDOM para a rede de convidados e controlar a comunicação com o VDOM principal por inter-VDOM link.

**Critério de conclusão:** o aluno mostra em qual contexto cada configuração e cada decisão ocorreu.

---

## Apêndice C. Além do NSE 4: ZTNA básico

**Objetivo:** publicar uma aplicação por ZTNA, autorizando por usuário e postura do dispositivo, e compará-la com a VPN de acesso remoto.
**Pré-requisitos:** 07, 09, 13, 15.3.1.

### C.1. Componentes e configuração

**Aprendizado:** entender quem identifica o dispositivo, quem informa a postura e onde a decisão é tomada.

- **C.1.1. FortiClient, EMS, certificados e tags:** relacionar cliente, EMS, certificado de dispositivo e tags de postura recebidas pelo FortiGate.
- **C.1.2. Access proxy e ZTNA rules:** publicar uma aplicação HTTPS e uma TCP e criar regras com grupo de usuários e tags.
- **C.1.3. ZTNA × VPN:** comparar acesso por aplicação com acesso à rede e testar usuário fora do grupo e dispositivo fora de conformidade.

**Erros comuns:** confundir identidade do usuário com identidade do dispositivo.

**Laboratório:** publicar o servidor interno da Atlas por ZTNA e testar três combinações de usuário e postura.

**Critério de conclusão:** o aluno explica como identidade, postura e regra determinaram cada acesso.

---

## Correspondência com a revisão 5

| Revisão 6 | Origem na revisão 5 |
|---|---|
| 01 | 01, 65.1, 65.3, 65.5–65.7 (+ primeiro acesso e recuperação, novos) |
| 02 | 02, 04, 21.1, 29.1–29.4, 29.6 (+ DDNS, novo) |
| 03 | 03, 40.1, 40.2, 40.4, 65.4 |
| 04 | 06, 07, 22.1 |
| 05 | 05, 41.1, 41.2, 67.5 |
| 06 | 21 |
| 07 | 15, 65.2 |
| 08 | 16, 17 |
| 09 | 09, 42.1–42.3 |
| 10 | 08, 10, 11, 40.6, 44, 46 (parcial) |
| 11 | 12, 14, 40.5, 49.1.1 (parcial) |
| 12 | 13, 47 |
| 13 | 25, 26.1–26.3 (+ route-based × policy-based, novo) |
| 14 | 23, 24, 39.1 |
| 15 | 48, 56, 57, 68.1 |
| 16 | 28, 66 (+ gerência reservada, novo) |
| 17 | 22.1.2, 67 (+ projeto final, novo) |
| A | 60, 61 |
| B | 31.1, 31.3 |
| C | 18, 19 |

**Removidos por estarem fora do escopo do administrador/NSE 4:** 20, 26.4, 27, 29.5, 30, 31.2, 32–38, 39.2–39.3, 40.3, 40.7, 40.8, 41.3–41.7, 42.4, 43, 45, 49.1.2, 50–55, 58, 59, 62, 63, 64, 65.8, 68.2–68.5, 69–72.
