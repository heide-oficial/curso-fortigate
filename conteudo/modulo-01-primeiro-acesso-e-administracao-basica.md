# Módulo 01 — Primeiro acesso e administração básica

## Antes de começar

### O que você vai aprender

Ao final deste módulo, você será capaz de:

- explicar por que os firewalls evoluíram, o que um NGFW faz de diferente e onde o FortiGate é usado;
- reconhecer as plataformas do FortiGate e entender por que o hardware muda o desempenho e até os recursos disponíveis;
- acessar um FortiGate novo pela console e pela rede, fazer o primeiro login e passar pelo assistente de configuração;
- recuperar o acesso quando a senha se perde e saber quando o reset de fábrica é a única saída;
- navegar com segurança pela GUI, entender por que um recurso pode "não existir" e usar a CLI quando ela for necessária;
- configurar hostname, hora, NTP e DNS do sistema, e proteger o acesso administrativo em camadas;
- criar administradores com o privilégio mínimo necessário e testá-los com segurança;
- entender como o FortiGuard entrega a proteção, como o FortiGate é licenciado e o que acontece quando uma licença vence;
- fazer backup, restaurar a configuração e atualizar o firmware com um plano de retorno.

**Pré-requisitos:** nenhum. Este é o ponto de partida do curso.

### Topologia atual

Neste módulo, o FortiGate da matriz da Atlas Logística sai da caixa. Ainda não há redes de usuários, regras nem Internet. O objetivo é deixar o equipamento **acessível, identificado, com hora correta, administração protegida, licenças verificadas e um backup guardado**.

Para administrar o equipamento desde o primeiro dia, a Atlas usa uma **rede de gerência separada** (gerência *out-of-band*): uma rede só para administrar os equipamentos, que não depende das redes dos usuários. Se a rede de produção tiver um problema (um laço, um ataque, uma regra errada), a equipe continua alcançando o firewall pela gerência.

| Elemento | Valor |
|---|---|
| FortiGate da matriz | FortiGate 121G, número de série FG121GTK25000101; vai receber o nome **FGT-MTZ** |
| Interface de gerência | `mgmt` |
| Rede de gerência | 10.10.99.0/24 |
| Endereço do FortiGate na gerência | 10.10.99.1 |
| Estação do administrador (ADMIN-PC) | 10.10.99.10 |
| Notebook da console (NOTEBOOK-TI) | ligado à porta de console do FortiGate |

:::figura midia/m01/00-topologia-gerencia.png "Diagrama: ADMIN-PC ligado à porta mgmt do FortiGate e NOTEBOOK-TI ligado à porta de console"
O **ADMIN-PC** está ligado à porta **mgmt**, que ainda mostra o endereço de fábrica (192.168.1.99/24). O **NOTEBOOK-TI** está ligado à porta de **console**, para o primeiro acesso e para emergências. O FortiGate aparece com o nome de fábrica, o **número de série**: ele vai ganhar o nome FGT-MTZ ao longo do módulo.
:::

> **Na prática:** se o seu modelo não tiver uma porta `mgmt` dedicada, use uma porta livre e dê a ela o apelido (*alias*) `mgmt`. O raciocínio é o mesmo.

---

## 01.1. O FortiGate e o FortiOS

### 01.1.1. Por que os firewalls evoluíram

Para entender o que o FortiGate faz, vale olhar para os problemas que os firewalls antigos não resolviam. Eles nasceram para uma Internet bem mais simples, e foram ficando para trás:

- **Protegiam só a fronteira entre a rede interna e a Internet.** A lógica era "dentro é confiável, fora é perigoso". Tudo o que acontecia dentro da rede passava sem controle.
- **Decidiam só por portas e endereços IP.** Liberar a porta 443 liberava qualquer coisa que usasse a porta 443: um site legítimo, uma aplicação não autorizada ou um malware falando com o seu servidor de comando. O firewall não olhava o **conteúdo**.
- **Não consideravam ameaças internas.** Um computador infectado ou um funcionário mal-intencionado já estava "do lado de dentro" e podia alcançar qualquer servidor.
- **Dependiam de antivírus baseado só em assinaturas.** A assinatura reconhece um malware que já foi visto antes. Malwares **polimórficos** (que mudam o próprio código a cada cópia) e ataques **zero-day** (que exploram falhas ainda desconhecidas) passavam despercebidos.
- **Não acompanharam a explosão de vetores de ataque.** Hoje há trabalho remoto, nuvem, aplicativos web, dispositivos IoT e criptografia em quase todo o tráfego. A **superfície de ataque** ficou muito maior.
- **Davam uma falsa sensação de segurança às pequenas e médias empresas.** Muitas acreditavam que "ninguém vai atacar uma empresa pequena". Mas a maioria dos ataques é automatizada e não escolhe vítima pelo tamanho: **qualquer organização pode ser atacada**, e as menores costumam ter menos defesas.

A resposta da indústria foi o **firewall de próxima geração** (NGFW, *Next-Generation Firewall*). Ele continua controlando endereços e portas, mas acrescenta três capacidades que mudam o jogo:

- **Identificar a aplicação pelo conteúdo, não pela porta.** O NGFW compara os primeiros pacotes de cada conexão com assinaturas de aplicações. Assim ele reconhece o BitTorrent mesmo na porta 443, ou separa o Microsoft Teams do Skype, que usam portas parecidas. A regra passa a ser "liberar o Teams" em vez de "liberar a porta 443".
- **Identificar o usuário, não só o IP.** Integrado ao Active Directory ou a outro diretório, o NGFW sabe que o endereço 10.10.10.100 é a Carla, do financeiro, e aplica regras por pessoa ou por grupo. Quando a Carla troca de computador, a regra vai junto.
- **Inspecionar o conteúdo, inclusive o criptografado.** O NGFW procura ataques (IPS), vírus e sites maliciosos dentro do tráfego já permitido. Como quase toda a Internet é HTTPS, ele só enxerga esse conteúdo com **inspeção SSL**: o firewall abre a conexão criptografada, inspeciona e cifra de novo. Sem isso, boa parte das proteções fica cega.

Por trás de tudo, o NGFW consulta **inteligência de ameaças** atualizada, que diz quais sites, domínios e arquivos são maliciosos neste momento.

### 01.1.2. O que é o FortiGate e quais são seus diferenciais

O **FortiGate** é o NGFW da Fortinet. Ele reúne recursos avançados de **infraestrutura de rede** (roteamento, SD-WAN, VPN, switching) e de **segurança** (firewall, IPS, antivírus, filtro web, controle de aplicações) em um único equipamento.

#### Onde o FortiGate é usado

| Posição | O que protege | Exemplo real |
|---|---|---|
| **Borda (*edge*)** | A saída dos usuários para a Internet e os serviços publicados | O FortiGate da matriz entre a rede da empresa e os links das operadoras |
| **Segmentação interna** (ISFW, *Internal Segmentation Firewall*) | O tráfego entre redes internas, que nunca passa pela Internet | Entre a rede dos usuários e o data center, para que um computador infectado não alcance todos os servidores |
| **Data center** | Servidores e aplicações críticas, com muito tráfego | Modelos de alta capacidade na frente das aplicações da empresa |
| **Nuvem** | Redes em nuvens públicas e a ligação delas com as filiais | Um FortiGate-VM na AWS ou no Azure protegendo as redes da nuvem e fechando VPN com a matriz |
| **Filiais** | A rede local e a ligação com a matriz | Um modelo de mesa em cada loja, com SD-WAN e VPN até a matriz |

#### Formatos

- **Appliance físico:** desde modelos de mesa para filiais até chassis para data centers. Têm aceleração em hardware.
- **Máquina virtual (FortiGate-VM):** roda em VMware, Hyper-V, KVM e nas nuvens públicas (AWS, Azure, Google Cloud, OCI). A capacidade depende da licença (por número de vCPUs) e dos recursos dados à VM.
- **Como serviço na nuvem:** a Fortinet também entrega o firewall como serviço, sem que você administre a máquina por baixo. É usado, por exemplo, para proteger usuários remotos e aplicações em nuvem.

#### Diferenciais

- **UTM (*Unified Threat Management*):** várias camadas de segurança no mesmo equipamento e na mesma console. Em vez de um firewall, um IPS, um filtro web e um antivírus de fabricantes diferentes, você administra **um só produto**, com menos custo, menos complexidade e uma única visão dos logs.
- **Hardware dedicado da Fortinet:** os appliances têm processadores próprios, explicados logo abaixo, que tiram o trabalho pesado da CPU.
- **Integração com o ecossistema Fortinet:** o FortiGate é o centro do **Security Fabric**, integrando-se a FortiAnalyzer (logs), FortiManager (gerência central), FortiSwitch, FortiAP, FortiClient e outros produtos.
- **Compatibilidade com outros fabricantes:** o FortiGate usa protocolos e padrões abertos (IPsec, BGP, OSPF, LDAP, RADIUS, syslog, SAML, APIs REST) e tem conectores para nuvens e soluções de terceiros.

#### Como o hardware acelera o tráfego

Inspecionar tráfego custa processamento. Para não depender só da CPU, os FortiGates físicos têm processadores próprios, os **SPUs** (*Security Processing Units*):

- **NP** (*Network Processor*): encaminha os pacotes das conexões já aprovadas.
- **CP** (*Content Processor*): acelera a criptografia (VPN IPsec, inspeção SSL) e a comparação de padrões usada pelo IPS e pelo antivírus.
- **SoC** (*System on a Chip*): nos modelos menores e em algumas famílias mais novas, CPU, NP e CP ficam num chip só. As famílias recentes, como a 120G da Atlas, usam o SoC **SP5**.

O caminho de uma conexão mostra a divisão de trabalho. Os **primeiros pacotes** passam pela CPU: o FortiOS consulta a rota, procura a firewall policy, aplica o NAT e decide a inspeção. Se a conexão for aceita e o tipo de inspeção permitir, a sessão é **entregue ao NP** (*offload*), que encaminha o resto dos pacotes em hardware, sem gastar CPU. É por isso que um FortiGate físico mantém alto desempenho com muitas proteções ligadas.

Uma consequência que aparece na prática e na prova: os pacotes de uma sessão acelerada não passam pela CPU, então **não aparecem por completo nas ferramentas de diagnóstico** que rodam nela (o *sniffer* e o *debug flow*). Ao investigar um problema numa sessão acelerada, às vezes é preciso desligar a aceleração da policy para ver todos os pacotes.

#### O que o FortiGate faz

Na prática, o FortiGate é várias ferramentas trabalhando sobre o mesmo tráfego. Ele pode:

- **controlar o acesso entre redes** com firewall policies;
- **traduzir endereços** para dar acesso à Internet e publicar serviços (NAT);
- **rotear** o tráfego entre redes e links;
- **identificar usuários** e aplicar regras por pessoa ou grupo;
- **inspecionar o conteúdo** do tráfego permitido: sites, aplicações, ataques e vírus;
- **criar VPNs** entre sites e para usuários remotos;
- **escolher o melhor link** de Internet para cada aplicação (SD-WAN);
- **integrar-se** a outros produtos no Security Fabric;
- **trabalhar em par**, com um equipamento assumindo se o outro falhar (alta disponibilidade, HA).

O sistema operacional do FortiGate se chama **FortiOS**. É ele que define quais funções existem e como são configuradas. Quando este material fala em "versão", fala da versão do FortiOS, e não do hardware.

> **Na prática:** as funções do FortiGate dependem umas das outras e acontecem numa ordem. Um filtro web, por exemplo, só atua sobre um tráfego que uma firewall policy já permitiu, e a policy só é consultada depois que o FortiGate sabe por qual interface o tráfego vai sair, o que depende da rota. Entender essa ordem é a base de todo o curso.

### 01.1.3. Modelos e plataformas

O mesmo FortiOS roda em plataformas diferentes:

| Plataforma | Exemplos | Características |
|---|---|---|
| **Entry-level (desktop)** | FortiGate 40F, 60F, 70G, 90G | Pequenas empresas e filiais. SoC com CPU e aceleração no mesmo chip. Normalmente têm um switch interno (porta `lan` ou `internal`). |
| **Mid-range** | FortiGate 100F, 120G, 200G, 400F, 600F | Empresas médias e matrizes. Aceleração em hardware (NP e CP, ou o SoC SP5 nas famílias mais novas), mais portas e portas de 10 Gbps. |
| **High-end** | FortiGate 1000F, 3000F e superiores | Data centers e provedores. Grande capacidade e muitas portas de alta velocidade. |
| **VM** | FortiGate-VM (VMware, Hyper-V, KVM, AWS, Azure, GCP…) | Mesmo FortiOS, sem aceleração em hardware. A capacidade depende da licença (por vCPU) e dos recursos dados à VM. |
| **Rugged** | FortiGate Rugged | Ambientes industriais, com variação de temperatura, poeira e vibração. |

O FortiGate da Atlas é um **FortiGate 121G**, um modelo mid-range. O "1" no fim do nome indica a versão **com armazenamento interno** (o 120G não tem): é o que permite guardar logs no próprio equipamento.

:::figura midia/m01/01-1-fortigate-121g.png "Painel frontal do FortiGate 121G no diagrama do laboratório"
O FortiGate 121G tem portas de **console (CON)**, **HA** e **MGMT**, 16 portas de cobre (1 a 16), oito portas SFP (17 a 24) e quatro portas SFP+ de 10 Gbps (X1 a X4).
:::

Guarde a ideia: **dois FortiGates com a mesma versão de FortiOS podem ter capacidades e até recursos diferentes**, por causa do hardware. Exemplos concretos:

- **Memória:** modelos com pouca memória RAM não oferecem alguns recursos que exigem muito processamento. A lista fica na matriz de recursos por plataforma (*Feature / Platform Matrix*) e no release notes de cada versão.
- **Armazenamento:** só modelos com disco guardam logs localmente e permitem relatórios no próprio equipamento.
- **VDOMs:** o número máximo de domínios virtuais (firewalls lógicos dentro do mesmo equipamento) varia por modelo.
- **VMs:** a capacidade é a da licença; uma VM licenciada para 2 vCPUs não usa mais que isso, mesmo que a máquina tenha mais.

#### Como saber se o equipamento está sobrecarregado

O FortiGate mostra o uso de CPU e memória no dashboard e pela CLI (o comando está no Guia de comandos CLI). Dois pontos ajudam a interpretar:

- **CPU:** o tempo de CPU aparece dividido em *user*, *system*, *idle*, *irq* e *softirq*. Um valor alto em **softirq** costuma indicar muito tráfego sendo tratado pela CPU (sem aceleração em hardware).
- **Memória e *conserve mode*:** quando a memória fica alta demais, o FortiGate entra em **modo de conservação** (*conserve mode*) para se proteger: ele passa a economizar memória, e o tratamento das conexões que precisam de inspeção por proxy muda (por padrão, essas conexões passam **sem** a inspeção, para não derrubar o tráfego). O equipamento sai do modo sozinho quando a memória volta a um nível seguro. Se o *conserve mode* acontece com frequência, o equipamento está subdimensionado para o que faz.

#### Erros comuns

- Achar que o FortiGate só protege a fronteira com a Internet: ele também segmenta as redes internas.
- Esperar que uma VM tenha o mesmo desempenho de um appliance físico com aceleração em hardware.
- Comparar modelos só pela versão do FortiOS, sem olhar memória, disco e aceleração.
- Investigar uma sessão acelerada com o sniffer e concluir que "os pacotes não estão chegando".

:::cli O FortiGate e o FortiOS
### Desempenho e recursos

```
get system performance status
```

```saida
FGT-MTZ # get system performance status
CPU states: 1% user 1% system 0% nice 98% idle 0% iowait 0% irq 0% softirq
CPU0 states: 2% user 1% system 0% nice 97% idle 0% iowait 0% irq 0% softirq
CPU1 states: 2% user 1% system 0% nice 97% idle 0% iowait 0% irq 0% softirq
CPU2 states: 0% user 0% system 0% nice 100% idle 0% iowait 0% irq 0% softirq
CPU3 states: 0% user 0% system 0% nice 100% idle 0% iowait 0% irq 0% softirq
CPU4 states: 1% user 1% system 0% nice 98% idle 0% iowait 0% irq 0% softirq
CPU5 states: 1% user 1% system 0% nice 98% idle 0% iowait 0% irq 0% softirq
CPU6 states: 2% user 1% system 0% nice 97% idle 0% iowait 0% irq 0% softirq
CPU7 states: 0% user 0% system 0% nice 100% idle 0% iowait 0% irq 0% softirq
Memory: 8085452k total, 2263927k used (28.0%), 5821525k free (72.0%), 0k freeable (0.0%)
Average network usage: 962 / 8 kbps in 1 minute, 96 / 1 kbps in 10 minutes, 32 / 0 kbps in 30 minutes
Maximal network usage: 962 / 8 kbps in 1 minute, 96 / 1 kbps in 10 minutes, 32 / 0 kbps in 30 minutes
Average sessions: 0 sessions in 1 minute, 0 sessions in 10 minutes, 0 sessions in 30 minutes
Maximal sessions: 0 sessions in 1 minute, 0 sessions in 10 minutes, 0 sessions in 30 minutes
Average session setup rate: 0 sessions per second in last 1 minute, 0 sessions per second in last 10 minutes, 0 sessions per second in last 30 minutes
Maximal session setup rate: 0 sessions per second in last 1 minute, 0 sessions per second in last 10 minutes, 0 sessions per second in last 30 minutes
Average NPU sessions: 0 sessions in last 1 minute, 0 sessions in last 10 minutes, 0 sessions in last 30 minutes
Maximal NPU sessions: 0 sessions in last 1 minute, 0 sessions in last 10 minutes, 0 sessions in last 30 minutes
Virus caught: 0 total in 1 minute
IPS attacks blocked: 0 total in 1 minute
Uptime: 0 days,  0 hours,  1 minutes
```

Como ler:

- **CPU states:** uso total e por núcleo. *idle* alto é bom; *softirq* alto indica muita CPU gasta com pacotes.
- **Memory:** total, usada e livre. Acima do limite configurado, o equipamento entra em *conserve mode*.
- **Average network usage** e **Average sessions:** volume de tráfego e de sessões nos últimos 1, 10 e 30 minutos.
- **Average session setup rate:** sessões novas por segundo, útil para perceber picos (um ataque, um vírus se espalhando).
- **Uptime:** há quanto tempo o equipamento está ligado. Um *uptime* curto inesperado indica que ele reiniciou.
:::

---

## 01.2. Primeiro acesso e recuperação

### 01.2.1. Primeiro acesso pela console

#### Conceito: o acesso que não depende da rede

Um FortiGate novo pode ser acessado de duas formas: pela **console** (um cabo serial) e pela **rede**, usando a interface que vem configurada de fábrica.

A console é o acesso "de último recurso". Ela é uma linha serial direta até a CLI do equipamento: não usa endereço IP, não passa por nenhuma interface de rede e não depende de nenhuma configuração. Por isso funciona num equipamento recém-tirado da caixa, num equipamento com a rede mal configurada e num equipamento em que você perdeu a senha. Toda equipe que administra firewalls precisa saber usá-la.

- **Cabo:** a maioria dos modelos tem uma porta `CONSOLE` RJ-45; o cabo liga essa porta a uma porta serial do computador ou, mais comum hoje, a um adaptador USB-serial. Alguns modelos também oferecem console por USB.
- **Software:** qualquer emulador de terminal (PuTTY, SecureCRT, Tera Term, `screen` no Linux e no macOS).
- **Parâmetros:** **9600 bps**, 8 bits de dados, sem paridade, 1 bit de parada, sem controle de fluxo. É o famoso **9600 8N1**. Com outra velocidade, aparecem caracteres sem sentido na tela.

> **Na prática:** em uma VM, a "console" é a janela de console do hipervisor (VMware, Hyper-V, KVM) ou do portal da nuvem. Ela tem o mesmo papel do cabo de console.

#### No notebook: abrindo a console

Na Atlas, o primeiro acesso é feito pelo **NOTEBOOK-TI**, o notebook da equipe de TI, ligado à porta de console do FortiGate:

:::slides
midia/m01/01-2-topologia-console.png "Diagrama com o cabo de console entre o FortiGate e o NOTEBOOK-TI em destaque" | O **cabo de console** liga a porta **CON** do FortiGate ao adaptador USB-serial do **NOTEBOOK-TI**. Ele não transporta tráfego de rede: é uma linha serial direta até a CLI.
midia/m01/01-2-notebook.png "Barra de tarefas do NOTEBOOK-TI com o botão Iniciar em destaque" | Na área de trabalho do **NOTEBOOK-TI**, clique no botão **Iniciar** da barra de tarefas.
midia/m01/01-2-menu-iniciar.png "Menu Iniciar com o PuTTY em destaque" | No menu **Iniciar**, abra o **PuTTY**, um emulador de terminal gratuito.
midia/m01/01-2-putty-1.png "PuTTY com Connection type Serial em destaque" | O PuTTY abre na tela de configuração da sessão. Em **Connection type**, confirme **Serial**: a console é uma conexão serial. (O mesmo PuTTY abre sessões SSH, que você vai usar mais adiante.)
midia/m01/01-2-putty-2.png "Campo Serial line com COM3" | **Serial line:** a porta serial do computador. No Windows, o adaptador USB-serial aparece como uma porta **COM**; o número (aqui, **COM3**) aparece no Gerenciador de Dispositivos.
midia/m01/01-2-putty-3.png "Campo Speed com 9600" | **Speed:** **9600** bps, a velocidade da console do FortiGate.
midia/m01/01-2-putty-4.png "Botão Open em destaque" | Clique em **Open** para abrir a console.
:::

#### Primeiro login

Num FortiGate de fábrica:

- **Usuário:** `admin`
- **Senha:** em branco (apenas Enter)

O prompt de login mostra o **hostname** do equipamento. De fábrica, o hostname de um FortiGate físico é o **número de série**, que também está na etiqueta do equipamento.

No primeiro login, o FortiOS **obriga a troca da senha** do `admin` antes de liberar qualquer outra ação. Isso fecha uma porta clássica: equipamentos instalados com a senha de fábrica e esquecidos assim. A senha não aparece enquanto é digitada e precisa ser repetida. Escolha uma senha forte e guarde-a num cofre de senhas: essa conta é o acesso total ao equipamento.

:::slides
midia/m01/01-2-console-1.png "Console no PuTTY com o prompt de login do FortiGate de fábrica" | A console mostra o prompt **`FG121GTK25000101 login:`**: o hostname de fábrica é o número de série. Digite `admin` e Enter.
midia/m01/01-2-console-2.png "Login com senha em branco e pedido de troca de senha" | Na senha, apenas Enter (em branco). O FortiOS responde *You are forced to change your password* e pede a **New Password**.
midia/m01/01-2-console-3.png "Nova senha confirmada e o prompt" | Digite a nova senha em **New Password** e repita em **Confirm Password**. O FortiGate mostra **Welcome!** e o prompt terminado em **`#`**: você está na CLI.
:::

#### Configurando o endereço de gerência pela console

De fábrica, a porta `mgmt` responde em 192.168.1.99/24, e o ADMIN-PC está na rede 10.10.99.0/24: os dois não se falam. Como ainda não há acesso pela rede, este primeiro passo é feito pela console, na CLI. É um dos casos em que a CLI é necessária.

Os comandos formam uma pequena frase: "na tabela de interfaces, edite a interface `mgmt`, use endereço fixo, coloque 10.10.99.1/24, aceite PING, HTTPS e SSH de gerência e salve". A estrutura desses comandos é explicada em detalhe no capítulo **GUI e CLI**; por enquanto, acompanhe cada linha:

:::slides
midia/m01/01-2-mgmt-1.png "config system interface na console" | **`config system interface`**: entra na tabela de interfaces. O prompt muda para mostrar onde você está.
midia/m01/01-2-mgmt-2.png "edit mgmt na console" | **`edit mgmt`**: seleciona a interface `mgmt` para alterar.
midia/m01/01-2-mgmt-3.png "set mode static na console" | **`set mode static`**: endereço fixo, digitado por você (e não recebido por DHCP).
midia/m01/01-2-mgmt-4.png "set ip 10.10.99.1 255.255.255.0 na console" | **`set ip 10.10.99.1 255.255.255.0`**: o endereço e a máscara da gerência.
midia/m01/01-2-mgmt-5.png "set allowaccess ping https ssh na console" | **`set allowaccess ping https ssh`**: os serviços de gerência que a interface aceita: PING para testes, HTTPS para a GUI e SSH para a CLI pela rede.
midia/m01/01-2-mgmt-6.png "end na console" | **`end`**: salva e sai. Só agora a alteração passa a valer.
midia/m01/01-2-mgmt-show.png "show system interface mgmt na console" | **`show system interface mgmt`** confere o resultado: endereço **10.10.99.1** e acessos **ping https ssh**.
:::

### 01.2.2. Primeiro acesso pela GUI

#### Conceito: o que muda em relação à console

A **GUI** é a interface web de administração, acessada por **HTTPS** pela rede. Diferente da console, ela depende de três coisas que você acabou de configurar: a interface ter **endereço**, aceitar **HTTPS** em Administrative Access e o computador do administrador conseguir **alcançar** esse endereço.

Num FortiGate novo, o acesso pela rede costuma estar pronto de fábrica, mas o endereço muda conforme o modelo:

- **Modelos de mesa:** a interface interna (`lan` ou `internal`) em 192.168.1.99/24, com HTTPS e PING liberados e um servidor DHCP entregando endereços a quem se conectar. Basta ligar o notebook e abrir o navegador.
- **Modelos com porta `mgmt`:** essa porta costuma vir com 192.168.1.99/24.
- **VMs:** a `port1` normalmente recebe a gerência; dependendo da plataforma, por DHCP ou configurada pela console.

Consulte o *Quick Start Guide* do seu modelo.

#### No ADMIN-PC: o navegador

Com o endereço de gerência configurado, o trabalho passa para o **ADMIN-PC**, a estação do administrador (10.10.99.10), ligada à porta `mgmt`:

:::slides
midia/m01/01-2-topologia-mgmt.png "Diagrama com o cabo de rede entre a porta mgmt e o ADMIN-PC em destaque" | O cabo de rede liga a porta **mgmt** (agora **10.10.99.1/24**) ao **ADMIN-PC** (**10.10.99.10/24**): os dois estão na mesma rede. É por esse caminho que a GUI é acessada.
midia/m01/01-2-admin-pc.png "Barra de tarefas do ADMIN-PC com o Microsoft Edge em destaque" | Na área de trabalho do **ADMIN-PC**, abra o **Microsoft Edge** pela barra de tarefas.
midia/m01/01-2-edge-url.png "Endereço https://10.10.99.1 digitado no Edge" | Na barra de endereços, digite **https://10.10.99.1** e Enter. Use **https**: a GUI não responde por HTTP sem redirecionamento.
midia/m01/01-2-login-gui.png "Página de login da GUI no Edge" | A página de login aparece porque a interface `mgmt` agora tem endereço e aceita HTTPS.
midia/m01/01-2-login-dados.png "Usuário admin, senha e o botão Login" | Digite **admin** e a senha definida na console, e clique em **Login**.
:::

> **Na prática:** num FortiGate real, antes da página de login o navegador mostra um alerta de que **a conexão não é privada**. Isso é esperado: de fábrica, a GUI usa um **certificado autoassinado**, que o navegador não reconhece. Confira que o endereço é o do seu FortiGate e prossiga pelo botão de detalhes ou "avançado" do navegador. Em produção, troque esse certificado por um emitido por uma autoridade confiável da empresa: assim o alerta desaparece, e um alerta inesperado volta a significar algo (alguém se passando pelo firewall). A troca fica em **System > Settings**, aba **Access**, no campo **HTTPS server certificate**.

#### O assistente de configuração inicial

No primeiro login pela GUI, o FortiOS abre o **assistente de configuração inicial** (*FortiGate Setup*). Cada passo é uma decisão que vale entender:

:::slides
midia/m01/01-2-assistente-1.png "Assistente FortiGate Setup com o botão Begin em destaque" | O assistente lista três passos em **Setup Progress**: **Automatic Patch Upgrades**, **Change Your Password** e **Initial Policy Configuration**. Clique em **Begin**.
midia/m01/01-2-assistente-2.png "Automatic Patch Upgrades desativado e o botão OK" | **Automatic Patch Upgrades:** a Atlas **desativa** a atualização automática de patches e clica em **OK**. Os motivos estão logo abaixo.
midia/m01/01-2-assistente-3.png "Initial Policy Configuration com Do not create firewall policy now e Save" | **Change Your Password** aparece concluído, porque a senha já foi definida na console. Em **Initial Policy Configuration**, a Atlas escolhe **Do not create firewall policy now** e clica em **Save**.
midia/m01/01-2-assistente-4.png "Confirmação I acknowledge e OK" | O FortiGate avisa que, sem policy, nenhum tráfego vai atravessar o equipamento. Marque **I acknowledge** e clique em **OK**.
midia/m01/01-2-dashboard.png "Dashboard da GUI no Edge do ADMIN-PC" | Assistente concluído: o **Dashboard** da GUI, dentro do navegador do ADMIN-PC.
:::

**Automatic Patch Upgrades.** Com a opção ligada, o FortiGate procura e instala sozinho os **patches** da versão em uso (por exemplo, de 7.6.3 para 7.6.4), sem mudar de família de versão, e **reinicia** para aplicar. É uma boa escolha para equipamentos sem equipe de TI por perto, como uma pequena filial: correções de segurança chegam rápido. Em ambientes com controle de mudanças, como a matriz da Atlas, a equipe prefere desligar e atualizar na **janela de manutenção**, depois de ler o release notes e com um backup feito: um reinício automático em horário de trabalho derruba toda a rede. Depender de atualização automática também exige contrato de suporte válido.

**Initial Policy Configuration.** O FortiGate bloqueia todo tráfego que nenhuma policy permite (**implicit deny**). O assistente oferece criar uma policy de saída inicial, para que os computadores atrás do FortiGate naveguem desde o primeiro dia. A Atlas ainda não tem redes configuradas e vai construir as policies com cuidado, no módulo de firewall policies. Por isso, **nenhuma policy agora**.

Outra opção para a configuração inicial é o **FortiExplorer**, aplicativo da Fortinet para computador e celular. Nos modelos compatíveis, ele se conecta ao FortiGate por USB e oferece um assistente de instalação, sem precisar de rede nem de terminal: é útil para técnicos de campo instalando o equipamento de uma filial.

### 01.2.3. Reset de fábrica

#### Conceito: o que o reset apaga e o que mantém

O reset de fábrica apaga a configuração e devolve o equipamento ao estado original. Use quando for reaproveitar um equipamento em outro lugar, quando a configuração estiver irrecuperável ou quando a senha se perdeu e não há outra saída.

| O reset apaga | O reset mantém |
|---|---|
| Interfaces, policies, objetos, VPNs, rotas | A versão do firmware |
| Administradores criados (o `admin` volta com senha em branco) | O número de série e o registro no portal da Fortinet |
| Certificados importados e configurações de log | As licenças vinculadas ao número de série (elas voltam a ser lidas do FortiGuard) |

Pela GUI, o reset fica no **menu do administrador** (o nome do administrador, no canto superior direito):

:::slides
midia/m01/01-2-reset-0.png "Botão do administrador na barra superior em destaque" | Na barra superior, clique no **nome do administrador** (aqui, **admin**).
midia/m01/01-2-reset-1.png "Menu do administrador com o item Configuration em destaque" | No menu, clique em **Configuration**.
midia/m01/01-2-reset-2.png "Submenu Configuration com Reset to factory defaults em destaque" | No submenu **Configuration**, clique em **Reset to factory defaults**.
midia/m01/01-2-reset-3.png "Confirmação do reset de fábrica com o botão OK" | O FortiGate pede confirmação: todas as alterações de configuração serão perdidas. **OK** apaga a configuração e reinicia o equipamento. (A Atlas clicou em **Cancel**.)
:::

Pela CLI, o comando é `execute factory-reset`. Há também uma variante, `execute factory-reset2`, que apaga a configuração mas **preserva** as interfaces, o VDOM e as rotas estáticas: útil para limpar um equipamento remoto sem perder o acesso a ele.

> **Atenção:** o reset de fábrica é irreversível. **Faça backup antes.** Em equipamentos remotos, o reset comum também apaga a configuração que permite acessá-los: você vai precisar de alguém no local, com a console.

### 01.2.4. Recuperação da senha: a conta maintainer

#### Conceito: acesso físico como prova

Se ninguém sabe a senha de um administrador `super_admin`, os FortiGates físicos oferecem a **conta maintainer**. Ela só funciona com duas condições, e as duas comprovam que a pessoa está **diante do equipamento**:

1. **Pela console.** Não funciona por SSH nem pela GUI.
2. **Logo depois de ligar o equipamento na energia** (*hard reboot*). Uma reinicialização por comando não serve: é preciso desligar e ligar na tomada. A janela para o login é curta, de cerca de um minuto depois que o prompt aparece.

A senha é `bcpb` seguida do **número de série em letras maiúsculas**, que está na etiqueta do equipamento. Por que isso é aceitável em termos de segurança? Porque quem tem acesso físico ao equipamento já poderia fazer o reset de fábrica; a conta maintainer só permite recuperar o acesso **sem apagar a configuração**.

:::slides
midia/m01/01-2-maintainer-1.png "Topologia com o FortiGate desligado e o notebook na console" | Com o notebook ligado à **console**, **desligue o FortiGate da energia**. No diagrama, o equipamento aparece desligado.
midia/m01/01-2-maintainer-2.png "Boot do FortiGate na console" | **Ligue** o equipamento de novo. A console mostra o boot: modelo, número de série, versão do firmware e o carregamento do sistema.
midia/m01/01-2-maintainer-3.png "Login como maintainer com bcpb mais o número de série" | Assim que o prompt de login aparecer, entre com o usuário **`maintainer`** e a senha **`bcpb`** seguida do número de série em maiúsculas (aqui, `bcpbFG121GTK25000101`). A senha não aparece enquanto é digitada.
midia/m01/01-2-maintainer-4.png "Senha do admin redefinida pela CLI" | Já logado, redefina a senha do `admin` com `config system admin`, `edit admin`, `set password` e `end`. A configuração continua intacta.
:::

Pontos importantes:

- A conta maintainer pode ser **desabilitada** (`set admin-maintainer disable`). Em ambientes com alta exigência de segurança, isso impede que alguém com acesso físico entre sem apagar a configuração. A consequência: com a conta desabilitada e a senha perdida, sobra o **reset de fábrica**, seguido da restauração de um backup.
- Em VMs, não existe a conta maintainer: a recuperação é feita pela console do hipervisor, conforme o guia da plataforma.
- O uso da conta fica registrado nos logs de eventos, como qualquer login.

> **Dica para a prova:** a recuperação pela conta maintainer exige **console** e **reinicialização por energia** (*hard reboot*), usa a senha `bcpb` + número de série, e pode ser **desabilitada** pelo administrador.

#### Erros comuns

- Fazer reset de fábrica sem backup.
- Tentar a conta maintainer depois de reiniciar por comando, em vez de desligar e ligar na energia, ou demorar demais para digitar.
- Digitar o número de série em letras minúsculas.
- Deixar a senha do `admin` em local inseguro ou compartilhada entre várias pessoas.
- Esquecer que a recuperação pela console pode ter sido desabilitada.

:::cli Primeiro acesso e recuperação
### Configuração inicial pela console, linha a linha

```
config system interface
    edit "mgmt"
        set mode static
        set ip 10.10.99.1 255.255.255.0
        set allowaccess ping https ssh
    next
end
```

| Linha | Função |
|---|---|
| `config system interface` | Entra na tabela de interfaces. |
| `edit "mgmt"` | Seleciona a interface `mgmt`. |
| `set mode static` | Endereço fixo, em vez de DHCP. |
| `set ip ...` | Endereço e máscara. |
| `set allowaccess ping https ssh` | Serviços de gerência aceitos. |
| `next` / `end` | Salvam a alteração. |

Para conferir:

```
show system interface mgmt
```

```saida
FG121GTK25000101 # show system interface mgmt
config system interface
    edit "mgmt"
        set vdom "root"
        set ip 10.10.99.1 255.255.255.0
        set allowaccess ping https ssh
        set type physical
        set role lan
        set macaddr 04:d5:90:6a:21:48
    next
end
```

O `show` mostra só o que é diferente do padrão. `set mode static` não aparece porque endereço fixo já é o padrão da `mgmt`.

### Reset de fábrica e variantes

```
execute factory-reset
```

Apaga a configuração e reinicia.

```
execute factory-reset2
```

Apaga a configuração, mas preserva as interfaces, o VDOM e as rotas estáticas.

### Redefinir senha (após login como maintainer)

```
config system admin
    edit "admin"
        set password <nova-senha>
    next
end
```

### Desabilitar a conta maintainer

```
config system global
    set admin-maintainer disable
end
```

> **Atenção:** com a conta maintainer desabilitada, a única saída para uma senha perdida é o reset de fábrica. Mantenha uma conta de emergência com senha guardada em cofre.

### Reiniciar e desligar

```
execute reboot
execute shutdown
```

Prefira desligar com `execute shutdown` antes de cortar a energia, para não corromper o disco ou a memória flash.
:::

---

## 01.3. GUI e CLI

A GUI e a CLI são **duas janelas para a mesma configuração**. Tudo o que você muda na GUI aparece na CLI, e vice-versa: as duas leem e gravam o mesmo arquivo de configuração. O trabalho do dia a dia acontece principalmente na GUI. A CLI entra em três situações:

- quando **não existe opção na GUI** para o que você precisa;
- quando a **saída de um comando é a ferramenta de diagnóstico** (debugs, tabela de sessões, estado do cluster);
- quando é **mais rápido ou mais seguro** consultar e comparar, como ao ver a configuração completa de um objeto.

Por isso, mesmo trabalhando pela GUI, você precisa entender como a CLI está organizada.

### 01.3.1. A GUI

#### Como a GUI está organizada

O menu lateral da GUI é organizado por **função**:

:::slides
midia/m01/01-1-menu-gui-1.png "GUI do FortiGate com o menu lateral em destaque" | O **menu lateral** organiza o FortiGate por função. Cada item abre um grupo de páginas.
midia/m01/01-1-menu-gui-2.png "Menu Dashboard em destaque" | **Dashboard:** visão do estado do equipamento, com CPU, memória, sessões, licenças e as visões do **FortiView** (quem está usando a rede, para quê e quanto).
midia/m01/01-1-menu-gui-3.png "Menu Network em destaque" | **Network:** conectividade. Interfaces, DNS, rotas estáticas, policy routes e SD-WAN.
midia/m01/01-1-menu-gui-4.png "Menu Policy & Objects em destaque" | **Policy & Objects:** quem pode falar com quem. As **firewall policies** e os objetos que elas usam: endereços, serviços, schedules, Virtual IPs e IP pools.
midia/m01/01-1-menu-gui-5.png "Menu Security Profiles em destaque" | **Security Profiles:** o que é inspecionado no tráfego **já permitido** pela policy. Antivirus, Web Filter, DNS Filter, Application Control, IPS e inspeção SSL.
midia/m01/01-1-menu-gui-6.png "Menu VPN em destaque" | **VPN:** túneis IPsec entre sites e acesso remoto de usuários.
midia/m01/01-1-menu-gui-7.png "Menu User & Authentication em destaque" | **User & Authentication:** usuários, grupos, servidores LDAP e RADIUS, FortiTokens e contas de convidados.
midia/m01/01-1-menu-gui-8.png "Menu WiFi & Switch Controller em destaque" | **WiFi & Switch Controller:** gerência de access points (FortiAP) e switches (FortiSwitch) pelo próprio FortiGate.
midia/m01/01-1-menu-gui-9.png "Menu System em destaque" | **System:** o próprio equipamento. Administradores, perfis administrativos, firmware, configurações gerais, HA, certificados, FortiGuard e Feature Visibility.
midia/m01/01-1-menu-gui-10.png "Menu Security Fabric em destaque" | **Security Fabric:** integração com outros produtos Fortinet: topologia, Security Rating, automação e conectores.
midia/m01/01-1-menu-gui-11.png "Menu Log & Report em destaque" | **Log & Report:** os registros de tráfego, eventos e segurança, e a configuração dos destinos de log.
:::

Repare na separação entre **Policy & Objects** e **Security Profiles**, que reflete a ordem de processamento. A firewall policy decide se a conexão é **permitida**. O Security Profile, ligado a essa policy, decide o que acontece **com o conteúdo** da conexão permitida. Um perfil nunca libera algo que a policy bloqueou: se a policy nega, o perfil nem é consultado.

O menu não é igual em todo FortiGate: itens aparecem e somem conforme os recursos visíveis (Feature Visibility, explicada adiante), as **permissões do administrador logado** (uma área com permissão None some do menu), o modo de operação e o uso de VDOMs.

#### Funções nativas e integrações

Algumas funções são **nativas** do FortiGate (firewall, VPN, filtros). Outras são **integrações** com outros produtos: FortiAnalyzer para logs centralizados e relatórios, FortiClient EMS para dados dos computadores, FortiSandbox para análise de arquivos suspeitos, conectores para nuvens públicas. As integrações ficam em **Security Fabric > Fabric Connectors**:

:::slides
midia/m01/01-1-menu-fabric.png "Menu Security Fabric com Fabric Connectors em destaque" | Abra **Security Fabric > Fabric Connectors**.
midia/m01/01-1-fabric-connectors.png "Página Fabric Connectors" | A página lista os conectores: produtos Fortinet (FortiAnalyzer, FortiClient EMS, FortiSandbox) e serviços externos (nuvens públicas, diretórios, threat feeds).
:::

Uma integração exige o outro produto funcionando, não só a configuração no FortiGate. Se o FortiAnalyzer ficar fora do ar, por exemplo, o FortiGate guarda os logs localmente (se tiver disco) até a comunicação voltar.

#### A barra superior

A barra superior traz ferramentas disponíveis em qualquer página:

:::slides
midia/m01/01-1-elementos-gui-1.png "Barra superior da GUI em destaque" | A **barra superior** acompanha todas as páginas da GUI.
midia/m01/01-1-elementos-gui-2.png "Botão de busca em destaque" | **Busca:** encontra páginas e objetos de configuração.
midia/m01/01-1-elementos-gui-3.png "Botão FortiAI em destaque" | **FortiAI:** o assistente de IA da Fortinet, que responde perguntas sobre a configuração. Depende de licença.
midia/m01/01-1-elementos-gui-4.png "Botão CLI em destaque" | **CLI:** abre a **CLI Console**, um terminal da CLI dentro do navegador, sem precisar de SSH.
midia/m01/01-1-elementos-gui-5.png "Botão de notificações em destaque" | **Notificações:** avisos do sistema, como firmware novo, licenças a vencer e problemas de configuração.
midia/m01/01-1-elementos-gui-6.png "Menu do administrador em destaque" | **Menu do administrador:** **Configuration** (backup, restauração e reset de fábrica), **Personalize** (preferências do administrador), troca de senha e logout.
:::

A **busca** é a forma mais rápida de chegar a uma página, principalmente quando o menu muda entre versões:

:::slides
midia/m01/01-1-busca-0.png "Menu da busca com Jump to page em destaque" | Clique na **lupa**. O menu tem **Jump to page** (ir a uma página), **Open**, **CLI diagnostics** (rodar um comando de diagnóstico) e **Search configuration** (encontrar um objeto pelo nome, como um endereço ou uma policy). Clique em **Jump to page**.
midia/m01/01-1-busca.png "Busca da GUI com dns digitado e os resultados" | Digite parte do nome: com "dns", aparecem as páginas **Network > DNS** e **DNS Servers**, entre outras. Clique no resultado para ir direto à página.
:::

#### Dashboards e widgets

O dashboard **Status** reúne **widgets**: System Information, Licenses, CPU, Memory, Sessions, Interfaces, Administrators e outros. Você pode acrescentar widgets e criar dashboards próprios, por exemplo um dashboard de VPN para a equipe que cuida das filiais:

:::slides
midia/m01/01-1-add-widget-0.png "Botão Add widget do dashboard em destaque" | No dashboard, clique em **Add widget**.
midia/m01/01-1-add-widget.png "Lista de widgets para acrescentar ao dashboard" | Escolha o widget na lista. Cada widget pode ser movido, redimensionado e removido.
:::

#### Temas da GUI

A aparência da GUI pode ser personalizada com **temas**, que mudam as cores do menu e da barra superior. O tema padrão, o **Jade** (verde), é o usado em todo o curso.

:::slides
midia/m01/01-3-menu-settings.png "Menu System com o item Settings em destaque" | Abra **System > Settings**.
midia/m01/01-3-tema-0.png "Abas de System > Settings com Preference em destaque" | Clique na aba **Preference**.
midia/m01/01-3-tema-1.png "Seção Theming da aba Preference" | Na seção **Theming**, o **System theme** vale para todos os administradores. **Restrict user override** impede que administradores sem perfil `super_admin` troquem o próprio tema.
midia/m01/01-3-tema-2.png "Lista de temas da GUI com o Jade selecionado" | A lista traz os temas prontos, como **Jade**, **Graphite**, **Jet Stream** e os escuros **Dark Matter** e **Eclipse**, e permite criar um tema próprio.
midia/m01/01-3-tema-apply.png "Botão Apply" | Depois de escolher, clique em **Apply**.
midia/m01/01-3-tema-pers-0.png "Menu do administrador com Personalize em destaque" | Cada administrador também pode escolher o próprio tema: no **menu do administrador**, clique em **Personalize**.
midia/m01/01-3-tema-3.png "Painel Personalize do administrador" | Em **Personalize**, **Inherit from system** segue o tema do sistema; **Customize** escolhe outro, só para você.
:::

> **Na prática:** com vários FortiGates, um tema diferente por ambiente (produção, homologação, laboratório) ou por cliente ajuda a perceber na hora em qual equipamento você está, antes de uma alteração no lugar errado.

#### Conhecendo o seu equipamento pela GUI

O widget **System Information**, no dashboard **Status**, resume a identidade do equipamento:

:::slides
midia/m01/01-1-system-information-1.png "Widget System Information" | O widget **System Information** resume a identidade do equipamento.
midia/m01/01-1-system-information-2.png "Linha Hostname em destaque" | **Hostname:** o nome do equipamento. Ele aparece no prompt da CLI, nos logs e no Security Fabric. Ainda é o número de série: vamos trocá-lo no capítulo de configurações do sistema.
midia/m01/01-1-system-information-3.png "Linha Serial number em destaque" | **Serial number:** o número de série, usado no **registro** do equipamento e no suporte.
midia/m01/01-1-system-information-4.png "Linha Firmware em destaque" | **Firmware:** versão do FortiOS e **build**, que identifica exatamente a imagem instalada. O destaque indica que há uma versão mais nova disponível.
midia/m01/01-1-system-information-5.png "Linha Mode em destaque" | **Mode:** **NAT** é o modo roteado, o padrão e o usado neste curso.
midia/m01/01-1-system-information-6.png "Linha System time em destaque" | **System time** e **Uptime:** a hora do equipamento e há quanto tempo ele está ligado.
:::

Sobre o **modo de operação**:

- **NAT** (o padrão): o FortiGate funciona como um **roteador**. Cada interface tem seu endereço e sua rede, o FortiGate roteia entre elas e pode traduzir endereços (NAT).
- **Transparent:** o FortiGate funciona como uma **ponte** (*bridge*) de camada 2, como um switch inteligente. As interfaces não têm endereço (só um endereço de gerência), não há roteamento entre elas, e o equipamento pode ser colocado no meio de um cabo existente **sem reendereçar a rede**. É usado para inserir inspeção numa rede que não pode mudar de endereçamento.

O modo é definido por **VDOM**: num equipamento com vários domínios virtuais, um pode estar em NAT e outro em Transparent.

A mesma informação do widget, com mais detalhes, aparece no comando `get system status`. Esse comando é muito cobrado na prova: veja a saída completa no **Guia de comandos CLI** deste capítulo.

#### Por que um recurso pode "não existir" no seu FortiGate

É comum ler a documentação, procurar um recurso na GUI e não encontrar. Antes de concluir que o equipamento não suporta algo, confira estes motivos:

1. **Feature Visibility:** para deixar a GUI mais limpa, o FortiOS esconde vários recursos por padrão. Eles existem e funcionam, só não aparecem no menu. Exemplos: DNS Database, Load Balance, Explicit Proxy, Local-In Policy.
2. **Permissões do administrador:** uma área com permissão **None** no perfil administrativo some do menu para aquela conta.
3. **Modo de inspeção e de operação:** algumas opções só aparecem em determinados modos (inspeção por proxy, modo NAT, VDOMs).
4. **Modelo e memória:** alguns recursos dependem do hardware. A matriz de recursos por plataforma e o release notes informam essas restrições.
5. **Licença:** o recurso aparece, mas não funciona sem o serviço FortiGuard correspondente.
6. **Versão do FortiOS:** o recurso foi incluído, renomeado ou removido em determinada versão.

#### Na GUI: habilitando um recurso em Feature Visibility

A Atlas vai usar o FortiGate como servidor DNS das redes internas, e a página para isso (DNS Servers) está escondida. Para habilitá-la:

:::slides
midia/m01/01-1-fv-menu.png "Menu System com Feature Visibility em destaque" | Abra **System > Feature Visibility**.
midia/m01/01-1-feature-visibility-1.png "Página Feature Visibility com os recursos agrupados por área" | Os recursos aparecem agrupados por área (*Core Features*, *Network*, *Policy & objects* e outras). A chave de cada um indica se ele aparece no menu.
midia/m01/01-1-feature-visibility-2.png "Chave DNS Database ativada" | Localize **DNS Database** e ligue a chave.
midia/m01/01-1-fv-apply.png "Botão Apply" | Clique em **Apply**. A alteração vale na hora.
midia/m01/01-1-feature-visibility-3.png "Menu Network com o novo item DNS Servers" | O item **Network > DNS Servers** passa a aparecer no menu.
:::

Feature Visibility só altera a **interface**. Desligar a visibilidade de um recurso **não desliga** uma configuração que já está em uso: ela continua funcionando, apenas fica fora da vista na GUI. Isso pode confundir quem herda um equipamento: uma configuração "invisível" pode estar ativa. Pela CLI, toda a configuração aparece, visível ou não.

> **Atenção:** "não está no menu" não significa "não existe". Antes de concluir que o equipamento não suporta algo, confira Feature Visibility, as permissões da conta, a matriz de plataforma, a licença e o release notes.

#### Trabalhando com listas e objetos na GUI

Quase toda página de configuração da GUI segue o mesmo padrão. A lista de endereços mostra todos os elementos:

:::slides
midia/m01/01-3-menu-addresses.png "Menu Policy & Objects com Addresses em destaque" | Abra **Policy & Objects > Addresses**.
midia/m01/01-3-lista-objetos-1.png "Lista Policy & Objects > Addresses" | A lista de endereços mostra o padrão que se repete em quase toda a GUI: uma **lista** de objetos com botões de ação, busca e colunas.
midia/m01/01-3-lista-objetos-2.png "Botão Create new em destaque" | **Create new** cria um objeto.
midia/m01/01-3-lista-objetos-3.png "Campo de busca em destaque" | A **busca** filtra a lista pelo texto digitado em qualquer coluna.
midia/m01/01-3-lista-objetos-4.png "Coluna Ref. em destaque" | A coluna **Ref.** mostra quantos objetos **usam** cada item.
midia/m01/01-3-lista-objetos-5.png "Objeto gmail.com selecionado com os botões Edit e Clone, sem Delete" | Clique em uma linha para selecioná-la: os botões de ação aparecem logo abaixo dela. O **gmail.com** mostra **Edit** e **Clone**, mas **não Delete**: ele tem uma referência. Um duplo clique na linha também abre a edição.
midia/m01/01-3-lista-objetos-6.png "Referências do objeto gmail.com" | Clique no número da coluna **Ref.** para ver **quem** usa o objeto: o gmail.com faz parte do grupo **G Suite**.
midia/m01/01-3-lista-objetos-7.png "Objeto sem referências com o botão Delete" | Já o **wildcard.dropbox.com**, que ninguém usa (Ref. 0), mostra o botão **Delete**.
:::

#### Referências entre objetos

Objetos do FortiOS se referenciam: um endereço é usado por uma policy e por um grupo, uma interface por uma rota, um perfil por uma policy. O FortiOS mantém a contagem dessas referências e **não deixa apagar um objeto em uso**. Isso evita que uma regra fique "apontando para nada", o que poderia abrir ou fechar tráfego sem ninguém perceber.

O fluxo correto para remover um objeto é: consultar as referências, remover ou alterar quem o usa, e só então apagar o objeto. Já **renomear** um objeto em uso é permitido: as referências acompanham o novo nome.

### 01.3.2. A CLI

#### Abrindo a CLI

Você pode acessar a CLI por três caminhos, cada um com o seu uso:

| Caminho | Quando usar | Exige |
|---|---|---|
| **Console** (cabo serial) | Primeiro acesso, emergências, recuperação | Acesso físico |
| **SSH** | Administração remota do dia a dia, scripts, ferramentas de automação | `ssh` em Administrative Access na interface e rota até ela |
| **CLI Console da GUI** | Consultas e comandos rápidos sem sair da GUI | Sessão na GUI |

Por **SSH**, a partir do ADMIN-PC:

:::slides
midia/m01/01-3-ssh-1.png "PuTTY no ADMIN-PC configurado para SSH em 10.10.99.1" | No PuTTY do ADMIN-PC, escolha **SSH** em **Connection type**, digite o endereço **10.10.99.1** em **Host Name** e mantenha a porta **22**. Clique em **Open**.
midia/m01/01-3-ssh-2.png "Sessão SSH no FortiGate a partir do ADMIN-PC" | Depois do login com usuário e senha, a mesma CLI da console, agora pela rede.
:::

Pela **CLI Console** da GUI:

:::slides
midia/m01/01-3-cli-menu.png "Botão da CLI e a opção CLI Console em destaque" | Na barra superior, clique no botão **>_** e em **CLI Console**.
midia/m01/01-3-cli-console-gui.png "CLI Console aberta dentro da GUI" | A **CLI Console** abre um terminal dentro do navegador, com abas para várias sessões. Ela usa a sessão e as permissões do administrador logado na GUI.
:::

#### Comandos de consulta

Quatro famílias de comandos dominam a CLI:

| Comando | Para que serve | Exemplo |
|---|---|---|
| `show` | Mostra a **configuração**, só com o que é **diferente do padrão** | `show system interface mgmt` |
| `show full-configuration` | Mostra a configuração **completa**, incluindo os valores padrão | `show full-configuration system interface mgmt` |
| `get` | Mostra valores de configuração (com os padrão) e **informações de estado** | `get system status`, `get system interface` |
| `diagnose` | Ferramentas de diagnóstico: tabelas internas, debugs, estatísticas | `diagnose sys session list` |
| `execute` | Executa ações: ping, backup, reinício | `execute ping 8.8.8.8` |

A diferença entre `show` e `show full-configuration` é uma das coisas mais úteis de entender cedo. Compare as duas saídas para a interface `mgmt`:

:::slides
midia/m01/01-3-cli-console-gui.png "Saída curta de show system interface mgmt" | **`show system interface mgmt`**: só o que foi alterado em relação ao padrão. É a forma de ver **o que alguém configurou**.
midia/m01/01-3-show-full.png "Saída longa de show full-configuration system interface mgmt" | **`show full-configuration system interface mgmt`**: dezenas de linhas, incluindo `mtu`, `speed` e `status up`, que estão no valor padrão. Use quando precisar saber **qual valor está valendo**.
:::

Um atributo que não aparece no `show` não "falta": ele está no valor padrão. Para saber qual é esse valor, use `show full-configuration` ou `get` dentro do objeto.

### 01.3.3. Estrutura de comandos

#### A árvore de configuração

A configuração do FortiOS é uma **árvore**. Você entra em um ramo com `config`, escolhe um item com `edit`, altera atributos com `set` e sai salvando com `next` e `end`.

Existem dois tipos de ramo:

- **Objetos únicos** (*settings*), como `config system global` e `config system dns`. Só existe um, então você entra e altera, sem `edit`.
- **Tabelas**, como `config system interface`, `config system admin` e `config firewall address`. Há vários itens, e cada um é selecionado com `edit <nome>`.

Exemplo de objeto único:

```
config system global
    set hostname "FGT-MTZ"
end
```

Exemplo de tabela:

```
config system admin
    edit "ana.silva"
        set accprofile "super_admin"
        set password <senha>
    next
end
```

Compare com a GUI: `config system global` corresponde a **System > Settings**, e `config system admin` corresponde à lista de **System > Administrators**, com `edit "ana.silva"` equivalendo a abrir (ou criar) a conta.

#### Comandos dentro da árvore

| Comando | Efeito |
|---|---|
| `config <ramo>` | Entra em um ramo. |
| `edit <item>` | Seleciona um item da tabela. **Se não existir, cria.** |
| `set <atributo> <valor>` | Define um valor. Em listas, `set` **substitui a lista inteira**. |
| `append <atributo> <valor>` | Acrescenta um valor a uma lista, sem apagar os existentes. |
| `select <atributo> <valor>` | Escolhe valores de uma lista (como `set`, substitui). |
| `unselect <atributo> <valor>` | Remove um valor de uma lista. |
| `unset <atributo>` | Devolve o atributo ao valor padrão. |
| `get` / `show` | Dentro de um item, mostram o item em edição. |
| `next` | Salva o item atual e continua na tabela. |
| `end` | Salva e sai do ramo. |
| `abort` | Sai **sem salvar** as alterações feitas no item desde que você entrou nele. |
| `delete <item>` | Apaga um item da tabela. |

A diferença entre `set` e `append` causa muitos acidentes. Veja na porta port10, que tem `allowaccess ping https ssh`:

:::slides
midia/m01/01-3-set-0.png "port10 com allowaccess ping https ssh" | A `port10` aceita **ping https ssh**, como mostra o `show` dentro do `edit`.
midia/m01/01-3-set-1.png "set allowaccess snmp substitui a lista" | **`set allowaccess snmp`** e `show`: a lista virou **só snmp**. O `set` substituiu tudo; ping, https e ssh se perderam.
midia/m01/01-3-set-2.png "append allowaccess snmp acrescenta" | Com a lista refeita (`set allowaccess ping https ssh`), **`append allowaccess snmp`** acrescenta: **ping https ssh snmp**.
midia/m01/01-3-set-3.png "unselect allowaccess ssh retira" | **`unselect allowaccess ssh`** retira só o ssh: **ping https snmp**. No fim, `abort` descarta tudo, e a port10 volta ao que era.
:::

> **Atenção:** se você está conectado por HTTPS ou SSH através de uma interface e usa `set allowaccess` sem incluir o protocolo que está usando, **perde o acesso** ao salvar.

#### Ajuda e atalhos

A CLI ajuda a descobrir comandos e valores:

:::slides
midia/m01/01-3-ajuda.png "O ponto de interrogação lista as opções de allowaccess" | **`?`** lista as opções possíveis naquele ponto, com a descrição de cada uma. Aqui, `set allowaccess ?` mostra todos os protocolos de gerência. O `?` aparece sem precisar de Enter.
midia/m01/01-3-tab.png "Tab completa o comando" | **Tab** completa o comando ou o nome: `get system stat` + Tab vira `get system status`.
:::

Outros atalhos: a **seta para cima** recupera comandos anteriores, e os comandos aceitam **abreviação** quando não há ambiguidade (`conf sys int` = `config system interface`).

#### Quando a alteração passa a valer

- **Na CLI:** quando você salva o item com `next` ou `end`. Enquanto você digita `set` dentro do `edit`, nada mudou ainda no equipamento. É por isso que `abort` consegue descartar.
- **Na GUI:** quando você clica em **OK** ou **Apply**.

E quando a alteração é **gravada** para sobreviver a um reinício? Isso depende do **modo de gravação da configuração** (*Configuration save mode*, em **System > Settings**, aba **Preference**):

| Modo | Comportamento | Uso |
|---|---|---|
| **Automatic** (padrão) | Cada alteração salva vai direto para a memória permanente | O dia a dia |
| **Manual** | As alterações valem, mas só são gravadas com `execute cfg save`; num reinício, as não gravadas se perdem | Testes em que você quer poder desfazer reiniciando |
| **Revert** | Como o manual, mas se você não gravar dentro de um tempo, o FortiGate **volta sozinho** à última configuração gravada (reiniciando) | Mudanças remotas arriscadas: se a alteração cortar o seu acesso, o equipamento se desfaz dela sozinho |

> **Na prática:** antes de mudar remotamente algo que pode cortar o seu acesso (a interface por onde você entra, uma rota, os trusted hosts), use o modo **Revert**. Se tudo der certo, grave com `execute cfg save`; se você perder o acesso, basta esperar o tempo configurado.

#### Erros comuns

- Concluir que um recurso não existe porque o menu não aparece, quando ele só está oculto em Feature Visibility ou bloqueado pelo perfil da conta.
- Achar que um perfil de segurança pode liberar um tráfego que a firewall policy não permitiu.
- Usar `set` em uma lista (como `allowaccess`) achando que vai acrescentar um valor, e com isso apagar os outros.
- Sair com `end` quando a intenção era descartar a alteração (`abort`).
- Achar que um atributo "não existe" porque não aparece no `show` (ele está no valor padrão).
- Tentar apagar um objeto em uso sem consultar as referências.

:::cli GUI e CLI
### `get system status`: a identidade do equipamento

É o comando de referência para conhecer um FortiGate.

```
get system status
```

```saida
FGT-MTZ # get system status
Version: FGT121G v8.0.1,build0215,260305 (GA.F)
First GA patch build date: 260115
Security Level: 2
Firmware Signature: certified
Virus-DB: 1.00000(2026-11-09 19:42)
Extended DB: 1.00000(2026-11-09 19:42)
AV AI/ML Model: 0.00000(2026-11-09 19:42)
IPS-DB: 6.00741(2026-11-08 19:42)
IPS-ETDB: 6.00741(2026-11-08 19:42)
APP-DB: 32.00821(2026-11-08 19:42)
ISDB-DB: 0.00000(2026-11-06 19:42)
Serial-Number: FG121GTK25000101
BIOS version: 06000102
System Part-Number: P29447-02
Log hard disk: Available
Hostname: FG121GTK25000101
Private Encryption: Disable
Operation Mode: NAT
Current virtual domain: root
Max number of virtual domains: 10
Virtual domains status: 1 in NAT mode, 0 in TP mode
Virtual domain configuration: disable
FIPS-CC mode: disable
Current HA mode: standalone
Branch point: 0215
Release Version Information: GA
FortiGuard contract: FortiCare
System time: Mon Nov  9 16:42:02 2026
Last reboot reason: warm reboot
```

| Campo | O que indica |
|---|---|
| `Version` | Modelo, versão do FortiOS, build e o tipo de versão: **GA.F** (*Feature*) ou **GA.M** (*Mature*). |
| `Firmware Signature` | Se a imagem é assinada pela Fortinet (`certified`). |
| `Virus-DB`, `IPS-DB`, `APP-DB` | Versões das bases de assinaturas e a data da última atualização. |
| `Serial-Number` | Número de série. |
| `Log hard disk` | Se há disco para logs locais. |
| `Hostname` | O nome do equipamento. |
| `Private Encryption` | Se a cifragem dos segredos da configuração usa uma chave própria do equipamento (veja o capítulo de backup). |
| `Operation Mode` | `NAT` ou `Transparent`. |
| `Max number of virtual domains` | Quantos VDOMs o modelo suporta. |
| `Virtual domain configuration` | Se o equipamento usa VDOMs. |
| `Current HA mode` | `standalone` (sozinho) ou o modo do cluster. |
| `FortiGuard contract` | O pacote de serviços FortiGuard e se ele está válido. |
| `Last reboot reason` | Por que o equipamento reiniciou pela última vez. |

> **Dica para a prova:** `get system status` reúne versão, número de série, modo de operação, estado de VDOM e de HA em uma única saída.

### Feature Visibility pela CLI

As opções de visibilidade ficam em `config system settings`, com nomes que começam com `gui-`:

```
config system settings
    set gui-dns-database enable
end
```

Para ver todas as opções disponíveis, use `set gui-?` dentro de `config system settings`.

### Filtrando saídas com `grep`

A saída da CLI pode ser enorme. O FortiOS aceita `grep` com opções úteis:

```
show full-configuration system global | grep admintimeout
```

```saida
FGT-MTZ # show full-configuration system global | grep admintimeout
    set admintimeout 15
```

- `grep <texto>`: mostra só as linhas que contêm o texto.
- `grep -i`: não diferencia maiúsculas de minúsculas.
- `grep -v`: mostra as linhas que **não** contêm o texto.
- `grep -f`: mostra o **bloco de configuração inteiro** onde o texto aparece. Muito útil para saber em qual objeto a linha está.

### Desligando a paginação

Por padrão, a CLI pausa saídas longas com `--More--`. Para copiar saídas longas ou usar scripts:

```
config system console
    set output standard
end
```

Para voltar ao padrão: `set output more`.

### Mais comandos de tabela

| Comando | Efeito |
|---|---|
| `rename <item> to <novo>` | Renomeia um item. |
| `move <id> before/after <id>` | Reordena itens (muito usado com firewall policies). |
| `clone <item> to <novo>` | Duplica um item. |
| `purge` | **Apaga todos os itens da tabela.** Use com extremo cuidado. |
| `edit 0` | Em tabelas numeradas (como firewall policies), cria um item com o próximo número livre. |

### Modo de gravação Revert

```
config system global
    set cfg-save revert
    set cfg-revert-timeout 600
end
```

No modo `revert`, se você não gravar com `execute cfg save` dentro do tempo definido (em segundos), o equipamento volta à última configuração gravada, reiniciando. O valor `manual` grava só com `execute cfg save`; `automatic` é o padrão.
:::

---

## 01.4. Configurações do sistema

### 01.4.1. Hostname, hora, NTP e DNS do sistema

#### Por que essas configurações vêm primeiro

**Hostname.** O hostname identifica o equipamento no prompt da CLI, na GUI, nos logs, no FortiAnalyzer, no Security Fabric, no SNMP e nos alertas. Com vários FortiGates, um bom padrão de nomes evita alterar o equipamento errado e facilita ler os logs. Um padrão comum junta o tipo, o local e um número: **FGT-MTZ** (FortiGate da matriz), FGT-FIL01, FGT-DC-01. O número de série, que vem de fábrica, não diz nada para quem lê.

**Hora.** A hora precisa estar correta por vários motivos:

- **Certificados** têm validade. Com a hora errada, certificados válidos parecem expirados, e a inspeção SSL, as VPNs com certificado e a própria comunicação com o FortiGuard falham.
- **Logs** precisam de horário correto para investigar incidentes e correlacionar eventos com outros sistemas.
- **Tokens de MFA** (FortiToken) usam códigos baseados em tempo. Com a hora errada, o código é recusado.
- **Autenticação no Active Directory** (Kerberos) e o **FSSO** dependem de hora sincronizada.
- **Schedules** de firewall policies dependem do relógio do equipamento.

**NTP.** Ninguém acerta o relógio à mão em produção: o **NTP** (*Network Time Protocol*, UDP porta 123) sincroniza a hora pela rede, de tempos em tempos (o **Sync interval**, padrão de 60 minutos). O FortiGate pode usar os servidores NTP da Fortinet (**FortiGuard**, o padrão) ou servidores próprios, como o **NTP.br** usado pela Atlas.

**DNS do sistema.** É o DNS usado pelo **próprio FortiGate** para resolver nomes: falar com o FortiGuard, sincronizar NTP por nome, resolver objetos FQDN (endereços definidos por nome, como `login.microsoft.com`), enviar alertas por e-mail. Se ele falhar, essas funções param, mesmo que a rede esteja funcionando. Ele é diferente do serviço DNS que o FortiGate pode oferecer aos computadores da rede, visto no módulo de serviços de rede.

#### Na GUI: hostname e hora

:::slides
midia/m01/01-4-menu-settings.png "Menu System com o item Settings em destaque" | Abra **System > Settings**.
midia/m01/01-4-system-settings-1.png "Página System > Settings, aba General" | **System > Settings** tem quatro abas: **General** (nome, hora, modo de operação), **Access** (portas, timeout e política de senha dos administradores), **Device** e **Preference** (temas e modo de gravação).
midia/m01/01-4-system-settings-2.png "Campo Hostname com FGT-MTZ" | **Hostname:** troque o número de série por **FGT-MTZ**, o padrão de nomes da Atlas.
midia/m01/01-4-system-settings-3.png "Campo Time zone com America/Sao_Paulo" | **Time zone:** o fuso horário da matriz, **America/Sao_Paulo**.
midia/m01/01-4-system-settings-4.png "Set time NTP, servidor e intervalo" | **Set time:** **NTP**, sincronização automática. **Select server** mostra o servidor em uso, e **Sync interval** o intervalo de sincronização, em minutos.
midia/m01/01-4-system-settings-apply.png "Botão Apply" | Clique em **Apply**. O novo nome aparece na hora no prompt da CLI e no navegador.
:::

#### Servidor NTP próprio: pela CLI

Na GUI, o seletor de servidor NTP mostra se o FortiGate usa os servidores do FortiGuard ou servidores próprios, mas os servidores próprios são cadastrados **pela CLI**. É um dos casos em que a CLI é necessária:

:::slides
midia/m01/01-4-ntp-cli.png "CLI Console com a configuração do servidor NTP a.ntp.br" | Na **CLI Console**: `config system ntp`, `set type custom` (servidores próprios), o servidor **a.ntp.br** em `config ntpserver` e `end`.
midia/m01/01-4-ntp-gui.png "System > Settings mostrando o servidor NTP Custom a.ntp.br" | Em **System > Settings**, **Select server** passa a mostrar **Custom**, com o servidor **a.ntp.br**.
:::

Por que um servidor próprio? Para usar uma referência de hora nacional ou a da própria empresa, e para não depender de saída para os servidores da Fortinet. Em redes isoladas, aponte para um servidor NTP interno.

> **Na prática:** sem acesso à Internet, a sincronização NTP só vai funcionar depois que houver rota e conectividade. Até lá, o FortiGate usa o próprio relógio.

#### Na GUI: DNS do sistema

:::slides
midia/m01/01-4-menu-dns.png "Menu Network com o item DNS em destaque" | Abra **Network > DNS**.
midia/m01/01-4-dns-1.png "Página Network > DNS" | Em **Network > DNS** fica o DNS usado pelo **próprio FortiGate**.
midia/m01/01-4-dns-2.png "Servidores DNS do FortiGuard em destaque" | **DNS servers:** **Use FortiGuard Servers** usa os servidores DNS da Fortinet (96.45.45.45 e 96.45.46.46).
midia/m01/01-4-dns-3.png "Protocolos de DNS em destaque" | **DNS Protocols:** o FortiGate pode consultar o DNS com transporte cifrado, **DNS over TLS** (DoT, porta 853) ou **DNS over HTTPS** (DoH), quando o servidor suporta. Com os servidores do FortiGuard, o padrão é DoT. **Server hostname** e **SSL certificate** são usados para validar o servidor na conexão cifrada.
midia/m01/01-4-dns-specify.png "Opção Specify com os campos de servidor" | **Specify** permite indicar servidores próprios, como o DNS do Active Directory. Depois de preencher, clique em **Apply**. (A Atlas manteve os servidores do FortiGuard.)
:::

Ao usar **Specify** com um servidor interno, confira os protocolos: muitos servidores DNS internos (como o do Windows Server) só respondem no DNS comum (UDP 53). Se o FortiGate tentar DoT com um servidor que não suporta, a resolução falha.

#### Verificação

:::figura midia/m01/01-4-sysinfo-depois.png "System Information com o hostname FGT-MTZ e a hora"
No widget **System Information**, o **Hostname** já é **FGT-MTZ** e o **System time** está no fuso de São Paulo.
:::

- **NTP:** com conectividade, o horário do widget deve coincidir com a hora real. O estado detalhado da sincronização é visto pela CLI.
- **DNS:** a forma mais simples de testar é pela CLI, pedindo um ping para um nome. Se o nome for resolvido para um endereço, o DNS está funcionando, mesmo que o ping não responda.

> **Dica para a prova:** diferencie o **DNS do sistema** (usado pelo próprio FortiGate) do **DNS server** em uma interface (o FortiGate respondendo às consultas dos computadores da rede).

### 01.4.2. Acesso administrativo

#### Conceito: gerência é tráfego destinado ao FortiGate

Quando você acessa a GUI por HTTPS ou a CLI por SSH, a conexão tem como **destino o próprio FortiGate**. Esse tipo de tráfego é chamado de **local-in**. Ele **não** é controlado pelas firewall policies comuns, que controlam o tráfego que **atravessa** o equipamento de uma rede para outra.

Quando uma conexão de gerência chega, o FortiGate confere, nesta ordem:

1. **A interface aceita esse protocolo?** (Administrative Access da interface). Se não, a conexão é descartada.
2. **A origem está entre as permitidas?** (trusted hosts dos administradores). Se não, a conexão é descartada, sem nem mostrar a tela de login.
3. **Usuário e senha estão corretos?** E, se a conta tiver trusted hosts, o login vem de uma origem permitida **para essa conta**?

Essas verificações formam as **camadas** de proteção da gerência:

1. **Administrative Access da interface:** quais protocolos de gerência a interface aceita.
2. **Configurações de administração:** portas, tempo de inatividade, certificado da GUI.
3. **Trusted hosts:** de quais origens cada administrador pode fazer login.
4. **Local-in policies** (opcional): regras específicas para o tráfego destinado ao equipamento, com origem, destino, serviço e horário. Permitem, por exemplo, liberar SSH só da rede de gerência e só em horário comercial, ou bloquear o acesso de um país inteiro à interface da Internet.

#### Camada 1: Administrative Access por interface

Cada interface tem a lista de serviços administrativos que aceita, cada um numa porta:

| Opção | Uso | Porta |
|---|---|---|
| **PING** | Responder ICMP echo, útil para testes | ICMP |
| **HTTPS** | GUI | TCP 443 |
| **SSH** | CLI remota | TCP 22 |
| **HTTP** | GUI sem criptografia; normalmente só redireciona para HTTPS. Evite | TCP 80 |
| **SNMP** | Monitoramento por SNMP | UDP 161 |
| **FMG-Access** | Gerência pelo FortiManager. Só na interface que fala com ele | TCP 541 |
| **Security Fabric Connection** | Comunicação com os outros produtos do Security Fabric | TCP 8013 |
| **FTM** | Notificações push do FortiToken Mobile | — |
| **RADIUS Accounting** | Receber accounting RADIUS, para identificar usuários | UDP 1813 |
| **Speed Test** | Servir como ponto de teste de banda | — |

A Atlas confere a `mgmt`:

:::slides
midia/m01/01-4-mgmt-0.png "Linha da mgmt selecionada e o botão Edit" | Em **Network > Interfaces**, selecione a **mgmt** e clique em **Edit**.
midia/m01/01-4-admin-access.png "Administrative Access da mgmt com HTTPS, SSH e PING" | Na seção **Administrative Access**, só **HTTPS**, **SSH** e **PING** estão marcados: exatamente o que foi configurado pela console.
midia/m01/01-4-mgmt-ok.png "Botão OK da edição da mgmt" | Clique em **OK** para fechar.
:::

Regra de ouro: **habilite somente o necessário, somente nas interfaces necessárias**. A interface WAN, especialmente, não deveria aceitar HTTPS e SSH de gerência vindos de qualquer lugar da Internet: é por ali que chegam as varreduras automáticas e as tentativas de senha. Se a gerência remota for necessária, prefira acessar por VPN ou restrinja com trusted hosts e local-in policies.

> **Atenção:** se você está acessando a GUI por uma interface e desmarca o **HTTPS** dela, perde o acesso ao clicar em **OK**. Antes de alterar a interface que você está usando, tenha outro caminho (outra interface ou a console).

#### Camada 2: Configurações de administração

Ficam em **System > Settings**, aba **Access**, seção **Administration settings**:

:::slides
midia/m01/01-4-administration-settings-0.png "Aba Access de System > Settings em destaque" | Em **System > Settings**, clique na aba **Access**.
midia/m01/01-4-administration-settings-1.png "Portas da GUI e do SSH" | **HTTP port**, **HTTPS port** e **SSH port:** as portas da administração (padrão 80, 443 e 22). O HTTP é redirecionado para HTTPS.
midia/m01/01-4-administration-settings-2.png "Idle timeout com 15 minutos" | **Idle timeout:** a Atlas mudou de 5 para **15 minutos**. Depois desse tempo sem uso, a sessão é encerrada.
midia/m01/01-4-administration-settings-3.png "Certificado da GUI e sessões simultâneas" | **HTTPS server certificate:** o certificado que a GUI apresenta (de fábrica, autoassinado). **Allow concurrent sessions:** permite que a mesma conta tenha várias sessões ao mesmo tempo.
midia/m01/01-4-administration-apply.png "Botão Apply" | Clique em **Apply**.
:::

**Mudar a porta protege?** Não de verdade: um varredor de portas encontra o serviço em qualquer porta. Mudar reduz o ruído de ataques automatizados que só tentam as portas padrão e, principalmente, libera a porta 443 quando outro serviço do FortiGate precisa dela, como um portal de VPN ou um servidor publicado no mesmo endereço. A proteção real vem de não expor a gerência e de restringir as origens.

**Idle timeout** vale para a GUI e para o SSH. Sessões esquecidas abertas são um risco, principalmente em computadores compartilhados. O valor vai de 1 a 480 minutos, e um perfil administrativo pode definir um valor diferente para as contas que o usam.

**Allow concurrent sessions** desligado impede que a mesma conta entre duas vezes ao mesmo tempo: um segundo login derruba o primeiro. Isso ajuda a perceber o uso indevido de uma conta, mas atrapalha quem trabalha em duas janelas.

> **Atenção:** ao mudar a porta HTTPS, o acesso passa a ser `https://10.10.99.1:<nova-porta>`. Mantenha a sessão atual aberta e teste em outra aba antes de encerrá-la.

#### Camada 3: Trusted hosts

Trusted hosts são as **redes de origem permitidas para cada administrador**. São configurados na conta do administrador, em **System > Administrators**, com a opção **Restrict login to trusted hosts** (até dez redes IPv4 e dez IPv6).

:::figura midia/m01/01-5-admin-conta-3.png "Opção Restrict login to trusted hosts com a rede de gerência"
Na conta do administrador, **Restrict login to trusted hosts** limita as origens de login. Na Atlas, a rede de gerência **10.10.99.0/24**. A criação da conta está no capítulo de administradores.
:::

Como funciona na prática:

- O FortiGate junta os trusted hosts de **todas** as contas numa lista única de origens aceitas para os serviços de gerência.
- Uma conexão de uma origem **fora** dessa lista é descartada antes de qualquer tela de login.
- Uma conta **sem** trusted hosts equivale a "qualquer origem": basta uma conta assim para a lista única virar "qualquer origem", e a página de login volta a responder para todos (embora as contas restritas continuem recusando login de fora das suas redes).
- **Por isso, para que o FortiGate deixe de responder ao serviço de gerência para origens não autorizadas, todos os administradores precisam ter trusted hosts.**

> **Dica para a prova:** trusted hosts são configurados **por administrador**. Para restringir de fato o acesso aos serviços de gerência, todas as contas precisam de trusted hosts.

> **Atenção:** antes de restringir trusted hosts, confirme o endereço de onde você está acessando. Configure primeiro em uma conta de teste, valide e só então aplique à sua conta. Em caso de erro, o acesso pela console continua disponível.

#### Banner de login (opcional)

Muitas políticas de segurança e alguns requisitos legais exigem um aviso antes do login, do tipo "acesso restrito a pessoas autorizadas; as atividades são registradas". Ele dá base para medidas contra quem acessar sem autorização. O FortiOS tem dois avisos:

- **Pre-login disclaimer:** aparece **antes** do login, e o usuário precisa aceitá-lo para continuar;
- **Post-login disclaimer:** aparece **depois** do login.

O texto dos avisos é editado em **System > Replacement Messages**, no grupo **Administration**. Os avisos são ligados pela CLI (veja o Guia de comandos CLI).

#### Verificação: os logs de login

Todo login administrativo, com sucesso ou não, gera um evento:

:::slides
midia/m01/01-4-menu-eventos.png "Menu Log & Report com System Events em destaque" | Abra **Log & Report > System Events**.
midia/m01/01-4-log-resumo.png "System Events, aba Summary" | A aba **Summary** resume os eventos por categoria, com os mais frequentes.
midia/m01/01-4-log-aba.png "Aba Logs em destaque" | Clique na aba **Logs** para ver cada evento.
midia/m01/01-4-log-login.png "Logs de eventos com os logins administrativos" | Cada login aparece com a data, o usuário e a mensagem: **Admin login successful** ou **Admin login failed**.
midia/m01/01-4-log-detalhe.png "Detalhes do evento de login" | Clique em um evento para abrir o painel **Log Details**: o usuário, a origem (**srcip**), o método (**ui**: `console`, `ssh` ou `https(IP)`), o perfil e o resultado.
:::

É a primeira evidência a consultar quando alguém não consegue entrar: o evento mostra se a senha estava errada ou se a origem não era permitida. Tentativas falhas repetidas, vindas de origens desconhecidas, são sinal de ataque.

#### Erros comuns

- Hora errada causando erros de certificado, MFA e FSSO, que parecem problemas de outra coisa.
- Configurar o DNS do sistema achando que isso faz o FortiGate responder DNS aos computadores.
- Apontar o DNS do sistema para um servidor interno sem conferir o protocolo (DoT x UDP 53).
- Liberar HTTPS e SSH de gerência na WAN sem nenhuma restrição.
- Configurar trusted hosts em uma única conta e achar que a página de login deixou de responder para todos.
- Desmarcar o protocolo da sessão atual em Administrative Access e perder o acesso.
- Considerar a troca da porta de gerência uma medida de segurança suficiente.

:::cli Configurações do sistema
### Hostname

```
config system global
    set hostname "FGT-MTZ"
end
```

### Fuso horário

```
config system global
    set timezone ?
end
```

O `?` lista os fusos disponíveis com o código de cada um.

### NTP

```
config system ntp
    set ntpsync enable
    set type custom
    config ntpserver
        edit 1
            set server "a.ntp.br"
        next
        edit 2
            set server "b.ntp.br"
        next
    end
    set syncinterval 60
end
```

- `type fortiguard`: usa os servidores NTP da Fortinet (o padrão).
- `type custom`: usa os servidores listados em `ntpserver`. Ter dois ou mais servidores mantém a hora se um deles falhar.
- `syncinterval`: intervalo de sincronização, em minutos (1 a 1440).

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

Para conferir o estado da sincronização:

```
diagnose sys ntp status
```

```saida
FGT-MTZ # diagnose sys ntp status
synchronized: no, ntpsync: enabled, server-mode: disabled
 
ipv4 server(a.ntp.br) 0.0.0.0 -- unreachable(0x0) S:1 T:23 selected
server-version=4, stratum=2
```

Mostra os servidores configurados, se estão alcançáveis, o *stratum* (a distância até a fonte de referência) e qual está sendo usado. Nesta saída, o servidor ainda está `unreachable`: o FGT-MTZ ainda não tem acesso à Internet.

### DNS do sistema

```
config system dns
    set primary 96.45.45.45
    set secondary 96.45.46.46
end
```

96.45.45.45 e 96.45.46.46 são os servidores DNS do FortiGuard. Para conferir:

```
get system dns
```

```saida
FGT-MTZ # get system dns
alt-primary         : 0.0.0.0
alt-secondary       : 0.0.0.0
cache-notfound-responses: disable
cert-verify         : enable
dns-cache-limit     : 5000
dns-cache-ttl       : 1800
domain              : 
fqdn-cache-ttl      : 0
fqdn-max-refresh    : 3600
fqdn-min-refresh    : 60
hostname-limit      : 5000
hostname-ttl        : 86400
interface           : 
interface-select-method: auto
ip6-primary         : ::
ip6-secondary       : ::
log                 : disable
ocsp-stapling-request: enable
primary             : 96.45.45.45
protocol            : dot
retry               : 2
root-servers        : 
secondary           : 96.45.46.46
server-hostname     : 
server-select-method: least-rtt
source-ip           : 0.0.0.0
source-ip-interface : 
ssl-certificate     : Fortinet_Factory
timeout             : 5
vrf-select          : 0
```

Como ler:

- `protocol: dot`: as consultas vão por DNS over TLS. `cert-verify` e `ocsp-stapling-request` mostram que o FortiGate valida o certificado do servidor.
- `server-select-method: least-rtt`: entre os servidores, usa o que responde mais rápido (a alternativa é `failover`, sempre o primário enquanto ele responder).
- `dns-cache-limit` e `dns-cache-ttl`: o FortiGate guarda até 5000 respostas, por até 1800 segundos, para não perguntar de novo.

Para testar a resolução:

```
execute ping update.fortiguard.net
```

```saida
FGT-MTZ # execute ping update.fortiguard.net
Unable to resolve hostname.
```

Se o nome for resolvido para um endereço, o DNS está funcionando, mesmo que o ping não responda. Aqui, sem acesso à Internet, a resolução ainda falha.

### Administrative Access por interface

```
config system interface
    edit "mgmt"
        set allowaccess ping https ssh
    next
end
```

Use `set allowaccess ?` para ver as opções. Lembre da diferença entre `set` (substitui a lista) e `append` (acrescenta).

### Portas e timeout de administração

```
config system global
    set admin-sport 8443
    set admin-ssh-port 2222
    set admin-https-redirect enable
    set admintimeout 15
end
```

| Opção | Efeito |
|---|---|
| `admin-sport` | Porta HTTPS da GUI (padrão 443). |
| `admin-port` | Porta HTTP (padrão 80). |
| `admin-ssh-port` | Porta SSH (padrão 22). |
| `admin-https-redirect` | Redireciona HTTP para HTTPS. |
| `admintimeout` | Minutos de inatividade até a sessão expirar (padrão 5). |

```
show system global
```

```saida
FGT-MTZ # show system global
config system global
    set admintimeout 15
    set hostname "FGT-MTZ"
end
```

### Trusted hosts

```
config system admin
    edit "admin"
        set trusthost1 10.10.99.0 255.255.255.0
    next
end
```

Para conferir os trusted hosts de todas as contas de uma vez, use `show system admin | grep -f trusthost`. O `grep` filtra as linhas da saída, e o `-f` mostra o bloco inteiro de cada conta que tem a linha procurada, para você saber a qual conta cada trusted host pertence. No laboratório, só a conta `carla.suporte` tem trusted host; o `admin` ainda não tem, por isso não aparece:

```
show system admin | grep -f trusthost
```

```saida
FGT-MTZ # show system admin | grep -f trusthost
config system admin
    edit "carla.suporte"
        set trusthost1 10.10.99.0 255.255.255.0
    next
end
```

Uma conta que não aparece nessa saída não tem nenhum trusted host e aceita login de qualquer origem que alcance uma interface com acesso administrativo liberado.

### Banner de login

```
config system global
    set pre-login-banner enable
    set post-login-banner enable
end
```
:::

---

## 01.5. Administradores e perfis

### 01.5.1. Contas e perfis administrativos

#### Conceito: quem pode fazer o quê

No FortiGate, cada administrador tem duas partes:

- **A conta** (**System > Administrators**): nome, senha ou método de autenticação, trusted hosts e qual perfil usa.
- **O perfil administrativo** (*admin profile*, **System > Admin Profiles**): o que a conta pode **ver** e **alterar**.

Separar conta e perfil permite criar perfis por função, como "Somente leitura", "Operador de firewall" ou "Analista de segurança", e associá-los a várias pessoas. Quando alguém muda de função, você troca o perfil da conta; quando a função muda, você altera um perfil e todas as contas que o usam acompanham.

O princípio que guia tudo é o do **privilégio mínimo**: cada pessoa recebe só o que precisa para o seu trabalho. Um analista de suporte que só consulta não precisa poder alterar policies; uma conta comprometida com permissão mínima faz pouco estrago.

#### Perfis padrão

| Perfil | Permissões |
|---|---|
| `super_admin` | Acesso total, inclusive configurações globais, administradores e firmware. Não pode ser editado nem apagado. |
| `prof_admin` | Leitura e escrita em todas as áreas, mas **sem** as configurações globais do equipamento e sem poder administrar contas `super_admin`. Em equipamentos com VDOMs, fica limitado aos VDOMs atribuídos à conta. |

:::slides
midia/m01/01-5-menu-perfis.png "Menu System com Admin Profiles em destaque" | Abra **System > Admin Profiles**.
midia/m01/01-5-admin-profiles.png "Lista com os perfis padrão super_admin e prof_admin" | Num FortiGate de fábrica, a lista traz só os perfis padrão: **super_admin** e **prof_admin**.
:::

#### Como um perfil é organizado

Um perfil define, por **área** da GUI, o nível de permissão:

- **None:** a área nem aparece para a conta.
- **Read:** a conta vê, mas não altera.
- **Read/Write:** a conta vê e altera.
- **Custom:** algumas áreas permitem permissões mais finas. Em *Firewall*, por exemplo, é possível dar escrita em policies e só leitura em objetos.

As áreas são: Security Fabric, FortiView, User & Device, Firewall, Log & Report, Network, System, Security Profile, VPN, WAN Opt & Cache e WiFi & Switch.

Exemplos de perfis por função:

| Perfil | Firewall | Log & Report | System | Demais áreas |
|---|---|---|---|---|
| Suporte (somente leitura) | Read | Read | Read | Read |
| Operador de firewall | Read/Write | Read | None | Read |
| Auditor | Read | Read | Read | None |

#### Na GUI: criando um perfil somente leitura

A Atlas cria o perfil **Atlas-Leitura** para a equipe de suporte, que precisa consultar a configuração e os logs para atender chamados, mas não deve alterar nada:

:::slides
midia/m01/01-5-admin-profile-0.png "Botão Create new da lista de perfis" | Em **System > Admin Profiles**, clique em **Create new**.
midia/m01/01-5-admin-profile-1.png "Novo perfil Atlas-Leitura com as permissões padrão" | Dê o nome **Atlas-Leitura**. A tabela **Access Control** mostra cada área com o seu nível.
midia/m01/01-5-admin-profile-2.png "Set All > Read: leitura em todas as áreas" | No alto da coluna, o atalho **Set All > Read** coloca todas as áreas em **Read**.
midia/m01/01-5-admin-profile-3.png "Outras opções do perfil" | Abaixo, outras opções: **Permit usage of CLI commands** controla quais famílias de comandos (get, show, execute, diagnose, config) a conta pode usar na CLI; **Override Idle Timeout** define um tempo de inatividade próprio para as contas deste perfil.
midia/m01/01-5-admin-profile-ok.png "Botão OK do perfil" | Clique em **OK**.
midia/m01/01-5-admin-profile-lista.png "Perfil Atlas-Leitura na lista" | O perfil **Atlas-Leitura** aparece na lista, pronto para ser usado.
:::

#### Na GUI: criando a conta

:::slides
midia/m01/01-5-menu-admins.png "Menu System com Administrators em destaque" | Abra **System > Administrators**.
midia/m01/01-5-admin-conta-0.png "Create new > Administrator" | Clique em **Create new > Administrator**. A outra opção, **REST API Admin**, cria uma conta para sistemas que se integram ao FortiGate pela API (com uma chave, em vez de senha).
midia/m01/01-5-admin-conta-1.png "Username, Type, Password e Confirm Password" | **Username:** **carla.suporte**, uma conta **por pessoa**. **Type:** **Local User** (a senha fica no próprio FortiGate). **Password** e **Confirm Password:** a senha inicial.
midia/m01/01-5-admin-conta-2.png "Administrator profile Atlas-Leitura" | **Administrator profile:** **Atlas-Leitura**. Um administrador **não pode conceder mais privilégios do que tem**: uma conta `prof_admin` não consegue criar uma conta `super_admin`.
midia/m01/01-5-admin-conta-3.png "Trusted hosts com a rede de gerência" | Ligue **Restrict login to trusted hosts** e informe a rede de gerência, **10.10.99.0/24**. A Carla só consegue entrar a partir dela.
midia/m01/01-5-admin-conta-4.png "Two-factor Authentication" | **Two-factor Authentication:** exige um segundo fator (um token FortiToken ou um código por e-mail) além da senha. É altamente recomendado para administradores; o assunto tem um módulo próprio.
midia/m01/01-5-admin-conta-ok.png "Botão OK da conta" | Clique em **OK**.
midia/m01/01-5-admin-conta-senha.png "Confirmação com a senha do administrador logado" | O FortiGate pede a **sua** senha (a do administrador logado) para confirmar a criação. É uma proteção: se alguém encontrar uma sessão aberta e esquecida, não consegue criar uma conta para si sem saber a senha. Digite e clique em **OK**.
midia/m01/01-5-admin-conta-lista.png "Conta carla.suporte na lista" | A conta **carla.suporte** aparece na lista, com o perfil e os trusted hosts.
:::

O campo **Type** também aceita contas que **não guardam senha no FortiGate**: **Match a user on a remote server group** (a senha é conferida num servidor LDAP ou RADIUS, como o Active Directory) e **Match all users in a remote server group** (qualquer membro de um grupo do diretório entra com o perfil escolhido). Em empresas maiores, isso centraliza o controle: quando a pessoa sai da empresa e a conta do AD é desativada, o acesso ao firewall acaba junto.

#### Testando a conta sem perder o acesso

Nunca teste uma conta nova (ou uma restrição nova) fechando a sua sessão de `super_admin`: se algo estiver errado, você pode ficar sem acesso. Teste numa **segunda sessão**, com outro navegador ou uma janela anônima, e só feche a sessão principal depois de confirmar. A Atlas testa a conta da Carla:

:::slides
midia/m01/01-5-logout.png "Menu do administrador com Logout em destaque" | Para mostrar o teste em uma tela só, aqui a sessão do `admin` foi encerrada pelo **menu do administrador > Logout**. No dia a dia, use uma segunda janela.
midia/m01/01-5-login-carla.png "Login como carla.suporte" | Entre com **carla.suporte** e a senha definida.
midia/m01/01-5-carla-leitura.png "GUI como carla.suporte, em somente leitura" | A Carla vê a configuração, mas os botões de alteração (**Create new**, **Edit**, **Delete**) não estão disponíveis: o perfil é somente leitura.
:::

Para acompanhar quem está conectado e o que foi feito:

:::figura midia/m01/01-5-log-alteracoes.png "Eventos de login dos administradores, inclusive o da carla.suporte"
Em **Log & Report > System Events**, aba **Logs**, o login da **carla.suporte** aparece junto com os do `admin`: cada conta deixa o seu rastro. Os eventos de alteração de configuração também ficam aqui, com o administrador e o que foi alterado.
:::

Quem está conectado agora aparece no widget **Administrators**, que pode ser acrescentado ao dashboard (grupo System, em **Add widget**), e pelo comando `get system admin list`.

#### Regras importantes

- **Um administrador não pode conceder mais do que tem.** Uma conta sem permissão de escrita em System não consegue criar outros administradores.
- **Use uma conta por pessoa.** Assim os logs mostram quem fez cada alteração. Contas compartilhadas tornam impossível uma investigação.
- **Mantenha pelo menos duas contas `super_admin`** com senhas guardadas separadamente, ou uma conta de emergência em cofre. Se a única conta `super_admin` for bloqueada, restam a conta maintainer ou o reset.
- **Teste em uma segunda sessão**, como visto acima.

### 01.5.2. Proteção das contas

#### Política de senha

A política de senha dos administradores fica em **System > Settings**, aba **Access**, seção **Security**:

:::figura midia/m01/01-5-password-policy.png "Seção Security da aba Access com a política de senha"
Com a política ligada, você define o **tamanho mínimo**, os **tipos de caracteres** exigidos (maiúsculas, minúsculas, números, símbolos), o **histórico** (quantas senhas antigas não podem ser reusadas) e a **expiração** (em dias). **Password scope** define se a política vale para as senhas dos administradores, para as chaves pré-compartilhadas de VPN IPsec ou para as duas. Depois de ajustar, clique em **Apply**.
:::

A política vale para as **próximas** definições de senha: ela não invalida as senhas que já existem. Quando uma senha expira, o administrador precisa trocá-la no próximo login.

#### Bloqueio por tentativas

Para dificultar ataques de força bruta, o FortiGate bloqueia temporariamente a **origem** (o endereço IP) depois de várias tentativas de login falhas. Por padrão, são **3 tentativas** e **60 segundos** de bloqueio. Durante o bloqueio, aquela origem não consegue fazer login, nem com a senha correta. Os valores são ajustados **somente pela CLI** (veja o Guia de comandos CLI). Cada tentativa falha aparece nos logs de eventos.

#### Timeout de sessão

O **Idle timeout** encerra sessões inativas, como visto no capítulo de configurações do sistema. Com o perfil administrativo, contas de um perfil podem ter um tempo diferente do padrão.

#### E a conta `admin`?

A conta `admin` é conhecida por todos, inclusive por quem ataca: é o primeiro nome tentado nas varreduras. Boas práticas:

- crie contas nominais `super_admin` para as pessoas responsáveis;
- depois de testá-las, considere **remover** a conta `admin` (o FortiOS permite apagá-la desde que exista outro `super_admin`) ou, no mínimo, mantê-la com senha forte, trusted hosts restritos e guardada como conta de emergência;
- **nunca** use a conta `admin` no dia a dia.

> **Dica para a prova:** diferencie conta (System > Administrators) de perfil (System > Admin Profiles), conheça os perfis padrão `super_admin` e `prof_admin` e as proteções disponíveis: trusted hosts, bloqueio por tentativas, política de senha e autenticação de dois fatores.

#### Erros comuns

- Usar a conta `admin` para todos os administradores, o que impede saber quem fez cada alteração.
- Criar um perfil restrito e testá-lo encerrando a sessão do `super_admin`.
- Deixar só uma conta com perfil `super_admin`.
- Dar permissão de escrita em System "para facilitar", permitindo que a conta crie outros administradores.
- Esquecer contas de pessoas que saíram da empresa (com contas no AD, o acesso acompanha o diretório).

:::cli Administradores e perfis
### Perfil administrativo

Cada área da GUI tem um atributo na CLI:

| Área na GUI | Atributo na CLI |
|---|---|
| Security Fabric | `secfabgrp` |
| FortiView | `ftviewgrp` |
| User & Device | `authgrp` |
| Firewall | `fwgrp` |
| Log & Report | `loggrp` |
| Network | `netgrp` |
| System | `sysgrp` |
| Security Profile | `utmgrp` |
| VPN | `vpngrp` |
| WAN Opt & Cache | `wanoptgrp` |
| WiFi & Switch | `wifi` |

Os valores são `none`, `read`, `read-write` e, em algumas áreas, `custom`. O perfil somente leitura criado pela GUI aparece assim na CLI:

```
show system accprofile Atlas-Leitura
```

```saida
FGT-MTZ # show system accprofile Atlas-Leitura
config system accprofile
    edit "Atlas-Leitura"
        set secfabgrp read
        set ftviewgrp read
        set authgrp read
        set sysgrp read
        set netgrp read
        set loggrp read
        set fwgrp read
        set vpngrp read
        set utmgrp read
        set wanoptgrp read
        set wifi read
    next
end
```

Como o `show` só lista o que é diferente do padrão, e o padrão de cada área é `none`, uma área que não aparece na saída está sem acesso. O `super_admin` não aparece no `show system accprofile`: é um perfil fixo do FortiOS, que não pode ser editado nem apagado. Um perfil em uso por alguma conta também não pode ser apagado.


### Conta de administrador

```
config system admin
    edit "carla.suporte"
        set accprofile "Atlas-Leitura"
        set password <senha-forte>
        set trusthost1 10.10.99.0 255.255.255.0
    next
end
```

No `show system admin`, a senha aparece cifrada (`ENC ...`), nunca em texto aberto. A conta criada pela GUI, conferida na CLI:

```
show system admin carla.suporte
```

```saida
FGT-MTZ # show system admin carla.suporte
config system admin
    edit "carla.suporte"
        set accprofile "Atlas-Leitura"
        set password ENC 1cxogem1d7o23l1cdp90o1cnoupn1e1mv6i1ebmgvh1dhnnsk1drn9hj==
        set trusthost1 10.10.99.0 255.255.255.0
    next
end
```

### Quem está conectado

```
get system admin list
```

```saida
FGT-MTZ # get system admin list
username       local        device       remote                 started
admin          console      n/a          n/a                    2026-11-09 16:41:03
admin          https        mgmt         10.10.99.10:45762      2026-11-09 16:41:14
admin          ssh          mgmt         10.10.99.10:56039      2026-11-09 16:41:44
admin          jsconsole    n/a          n/a                    2026-11-09 16:41:47
```

Cada linha é uma sessão aberta: o usuário, o método de acesso (`https` para a GUI, `ssh`, `console` ou `jsconsole`, que é o CLI Console aberto dentro da GUI), a interface por onde a sessão chegou, o endereço de origem com a porta e o horário em que começou. É o primeiro comando a rodar quando você suspeita de um acesso indevido: uma sessão de origem desconhecida aparece aqui na hora.



### Política de senha

```
config system password-policy
    set status enable
    set apply-to admin-password
    set minimum-length 12
    set min-upper-case-letter 1
    set min-lower-case-letter 1
    set min-number 1
    set min-non-alphanumeric 1
    set expire-status enable
    set expire-day 90
    set reuse-password disable
end
```

### Bloqueio por tentativas (somente pela CLI)

```
config system global
    set admin-lockout-threshold 3
    set admin-lockout-duration 300
end
```

- `admin-lockout-threshold`: tentativas falhas antes do bloqueio (padrão 3).
- `admin-lockout-duration`: duração do bloqueio em segundos (padrão 60).
:::

---

## 01.6. FortiGuard e licenciamento

As proteções do FortiGate dependem de informação atualizada sobre ameaças: assinaturas de vírus e ataques, categorias de sites, listas de botnets. Essa informação vem do **FortiGuard**, e o acesso a ela depende das **licenças** do equipamento. Primeiro, veja de onde vem a proteção; depois, como ela é licenciada.

### 01.6.1. FortiGuard: de onde vem a proteção

#### FortiGuard Labs

O **FortiGuard Labs** é a área de inteligência e pesquisa de ameaças da Fortinet. Seus pesquisadores e sistemas de IA analisam amostras de ameaças do mundo todo (inclusive as coletadas pelos próprios equipamentos dos clientes) e produzem as assinaturas de antivírus e IPS, as categorias de sites, as listas de botnets e as demais bases que o FortiGate usa. Quando uma ameaça nova aparece, a proteção chega a todos os FortiGates com serviço ativo, sem que você altere nada.

Para o FortiGate usar esses serviços, são necessárias duas coisas: **uma assinatura ativa** e **acesso à Internet**.

#### FortiGuard Distribution Network (FDN)

As atualizações chegam pela **FortiGuard Distribution Network (FDN)**, a rede de servidores da Fortinet espalhada pelo mundo. O FortiGate fala com a FDN de duas formas diferentes, e é importante distingui-las:

1. **Download de pacotes (AV, IPS, aplicações, ISDB):** as bases são **baixadas** por **HTTPS** e ficam no equipamento, conforme o agendamento. Os perfis consultam essa cópia local. Se o FortiGuard ficar inacessível por um tempo, o antivírus e o IPS continuam funcionando com a última base baixada, só que desatualizados.
2. **Consultas em tempo real (Web Filtering, DNS Filtering, Antispam):** a cada novo site, domínio ou e-mail, o FortiGate **pergunta** ao FortiGuard qual é a classificação. A resposta fica em **cache** por um tempo (o *Web filter cache*, padrão de 60 minutos), para não perguntar de novo sobre o mesmo site. Sem a consulta, sites novos ficam sem categoria, e o perfil aplica a ação configurada para **erro de rating**: por padrão, **bloquear**.

Essa diferença explica sintomas diferentes: sem comunicação com o FortiGuard, o antivírus continua bloqueando vírus conhecidos, mas o Web Filter pode bloquear todos os sites sem classificação (ou deixá-los passar, se a opção de permitir em caso de erro estiver ligada).

#### Como o FortiGate alcança os servidores

- **Anycast:** por padrão, o FortiGate acessa os servidores do FortiGuard por endereços **anycast**. O mesmo endereço é anunciado em vários pontos do mundo, e a rede encaminha cada consulta ao **servidor mais próximo**, com menor latência. Com o anycast, a comunicação usa **HTTPS na porta 443**. Sem o anycast, as consultas de rating podem usar **UDP nas portas 53 ou 8888**: num firewall de borda que restringe a saída, é isso que precisa ser liberado.
- **Certificados verificados:** na comunicação com o FortiGuard, o FortiGate **valida o certificado** apresentado pelo servidor e confere se ele não foi revogado usando **OCSP stapling**. Isso impede que alguém se passe pelo FortiGuard. É também por isso que a **hora** precisa estar correta.
- **DNS com DoT:** quando o FortiGate usa o FortiGuard como servidor DNS (96.45.45.45 e 96.45.46.46), as consultas vão por **DNS over TLS (DoT)**, criptografadas.

#### Na GUI: atualizações

:::slides
midia/m01/01-6-menu-fortiguard.png "Menu System com FortiGuard em destaque" | Abra **System > FortiGuard**.
midia/m01/01-6-fortiguard-aba.png "Aba FortiGuard settings em destaque" | Clique na aba **FortiGuard settings**.
midia/m01/01-6-updates.png "Aba FortiGuard settings com o agendamento e os servidores" | Aqui ficam o agendamento das atualizações (**Scheduled updates**), as opções de filtragem (cache e disponibilidade do serviço de rating) e os servidores do FortiGuard.
:::

As principais opções dessa página:

- **Scheduled updates:** com que frequência o FortiGate procura bases novas (a cada tantas horas, diariamente, semanalmente ou **Automatic**, em que o próprio FortiGuard define o ritmo).
- **Update server location:** de quais servidores baixar: os de menor latência ou só os de uma região, como os Estados Unidos ou a Europa. É usado quando há exigência de que os dados não saiam de uma região.
- **Improve IPS quality** e **Use extended IPS signature package:** enviar dados anônimos de detecção ao FortiGuard e usar um pacote maior de assinaturas de IPS (que consome mais memória).
- **Atualizar agora:** depois de renovar um contrato, não é preciso esperar o agendamento: a atualização pode ser forçada (pela CLI, com `execute update-now`).
- **Override FortiGuard servers:** usar servidores próprios em vez dos da Fortinet. O caso real é uma rede isolada da Internet, em que um **FortiManager** baixa as bases e as distribui aos FortiGates.

#### Pré-requisitos para funcionar

Para o FortiGuard funcionar, o FortiGate precisa:

1. **de rota** até a Internet;
2. **de DNS do sistema** funcionando;
3. **de hora correta**, porque a comunicação usa certificados;
4. **de saída liberada** no caminho, se houver outro firewall ou proxy antes da Internet;
5. **de licença válida** para o serviço (veja a próxima seção).

Quando a atualização falha, verifique nessa ordem. A verificação de cada item e o acompanhamento detalhado da atualização são feitos pela CLI (veja o Guia de comandos CLI).

### 01.6.2. Como o FortiGate é licenciado

#### O equipamento e os serviços são coisas separadas

Comprar um FortiGate não é a mesma coisa que ter todas as proteções funcionando. Há três camadas:

1. **O equipamento e o FortiOS:** firewall, roteamento, NAT, VPN e SD-WAN funcionam sem assinaturas de segurança.
2. **O suporte (FortiCare):** suporte técnico, substituição de hardware e direito a atualizações de firmware.
3. **Os serviços de segurança (FortiGuard):** bases de assinaturas e consultas em nuvem que alimentam os perfis de segurança.

#### Suporte FortiCare

O contrato **FortiCare** é o que dá direito a abrir chamados no suporte da Fortinet (TAC), trocar o equipamento com defeito (RMA) e baixar novas versões de firmware. Ele também inclui algumas bases essenciais, como a de aplicações (Application Control), a de serviços de Internet (ISDB) e a de GeoIP.

Os níveis de FortiCare mudam com o tempo, mas em linhas gerais são três:

| Nível | Para quem | Em linhas gerais |
|---|---|---|
| **FortiCare Essentials** | Modelos de entrada, ambientes menos críticos | Suporte básico e troca do equipamento após o envio do defeituoso. |
| **FortiCare Premium** | A maioria dos ambientes de produção | Suporte 24x7 para problemas críticos e troca antecipada do equipamento (*advance replacement*). |
| **FortiCare Elite** | Ambientes muito críticos | Tudo do Premium, com tempo de resposta mais curto e atendimento com mais prioridade. |

> **Na prática:** confira os tempos de resposta e as condições de troca no datasheet ou com o seu distribuidor. Sem contrato FortiCare válido, você não baixa firmware novo nem abre chamado, mesmo que o equipamento continue funcionando. Para um equipamento que é o único caminho da empresa para a Internet, a troca antecipada costuma valer o custo.

#### Serviços FortiGuard: bundles e à la carte

Os serviços FortiGuard podem ser comprados de duas formas:

- **Em pacotes (*bundles*):** um conjunto de serviços com um único contrato. É a forma mais comum e costuma sair mais barato do que comprar os mesmos serviços separadamente.
- **À la carte:** cada serviço comprado individualmente. É útil quando a empresa precisa de um serviço específico, por exemplo só IPS num FortiGate de data center que não navega na Internet, ou quer **acrescentar** a um bundle um serviço que ele não inclui.

Os bundles mais conhecidos são três, em níveis crescentes:

| Bundle | O que inclui |
|---|---|
| **ATP** (*Advanced Threat Protection*) | FortiCare + **IPS** + **Advanced Malware Protection** (antivírus, bases de botnet, prevenção de surtos e consulta ao sandbox em nuvem). |
| **UTP** (*Unified Threat Protection*) | Tudo do ATP + **filtragem de URL, DNS e vídeo** (Web Filter e DNS Filter) + **antispam**. |
| **Enterprise Protection** | Tudo do UTP + serviços avançados, como prevenção de malware com IA em linha (*inline*), **DLP**, **IoT Security** e **Security Rating**. |

> **Atenção:** a Fortinet revisa periodicamente os nomes e a composição dos pacotes. Antes de recomendar uma licença, confira o datasheet atual do modelo. O que não muda é a lógica: **cada função de segurança depende de um serviço FortiGuard**.

O importante é saber **qual função depende de qual serviço**:

| Função | Serviço de que depende |
|---|---|
| Antivirus | Advanced Malware Protection (bases de antivírus e prevenção de surtos) |
| IPS | Intrusion Prevention |
| Application Control | Base de aplicações, incluída no FortiCare |
| Web Filter | URL, DNS & Video Filtering (consulta de categoria em nuvem) |
| DNS Filter | URL, DNS & Video Filtering |
| Internet Service Database (ISDB) | Base ISDB, incluída no FortiCare |
| Security Rating, IoT, DLP | Serviços específicos, conforme o pacote |

#### Registro

O equipamento é registrado no portal **FortiCloud** (support.fortinet.com), pelo número de série, numa conta da empresa. É no registro que os contratos são vinculados ao equipamento: depois de registrar (ou renovar), o FortiGate recebe os contratos na próxima conexão com o FortiGuard.

:::slides
midia/m01/01-7-menu-firmware.png "Menu System com Firmware & Registration em destaque" | Abra **System > Firmware & Registration**.
midia/m01/01-6-registro.png "Botão Register do FGT-MTZ em destaque" | Selecione o equipamento e clique em **Register**. O FortiGate pede o login da conta FortiCloud da empresa e registra o número de série nela.
:::

Em VMs, a licença é aplicada por um arquivo de licença ou por um token, conforme o modelo de licenciamento contratado.

#### Na GUI: verificando as licenças

O widget **Licenses** do dashboard e a página **System > FortiGuard** mostram o que o equipamento tem, o que pode comprar e o que venceu. Acompanhe o FGT-MTZ em três situações: só com FortiCare, com o bundle UTP e com o UTP vencido.

:::slides
midia/m01/01-6-licencas-widget.png "Widget Licenses com Support e Updates em verde e os serviços de segurança em cinza" | **Só FortiCare:** no widget **Licenses**, **Support** e **Updates** estão verdes (o contrato FortiCare). IPS, AntiVirus, Web Filter e Rating estão **cinza**: não licenciados.
midia/m01/01-6-fortiguard.png "Página System > FortiGuard, aba Subscriptions" | Em **System > FortiGuard**, a aba **Subscriptions** detalha o que está ativo: aqui, só as assinaturas da base FortiCare, com o status e a data de expiração.
midia/m01/01-6-fortiguard-disponiveis-0.png "Aba Available for purchase em destaque" | Clique em **Available for purchase**.
midia/m01/01-6-fortiguard-disponiveis.png "Serviços disponíveis para compra" | A lista mostra os serviços que o equipamento **não tem** e que podem ser comprados: IPS, Advanced Malware Protection, URL, DNS & Video Filtering e outros.
midia/m01/01-6-licencas-utp.png "Widget Licenses com o bundle UTP" | **Com o bundle UTP:** IPS, AntiVirus e Web Filter ficam **verdes**. Rating continua cinza, porque o Security Rating faz parte do bundle Enterprise, não do UTP.
midia/m01/01-6-licencas-expiradas.png "Widget Licenses com o UTP vencido" | **UTP vencido:** os serviços do bundle ficam **vermelhos**. Support e Updates continuam verdes, porque o contrato FortiCare é separado e ainda está válido.
midia/m01/01-6-fortiguard-expiradas.png "Aba Expired com as assinaturas vencidas" | Na aba **Expired**, cada assinatura vencida e a data em que expirou. É aqui que você confirma o que precisa ser renovado.
:::

O que acontece quando uma licença vence:

- as **bases locais** (antivírus, IPS) **param de ser atualizadas**, mas a última versão baixada continua em uso: a proteção fica cada dia mais desatualizada;
- as **consultas em tempo real** (Web Filter, DNS Filter) **deixam de responder**, e os sites ficam sem categoria, sujeitos à ação de erro de rating;
- os perfis continuam configurados e aplicados às policies, o que dá uma **falsa sensação de proteção**.

#### Diferencie três situações

| Situação | Como identificar | Efeito |
|---|---|---|
| **Licença vencida** | Serviço em vermelho no widget Licenses e na aba Expired | As bases deixam de ser atualizadas; o rating de Web Filter para de responder |
| **Base desatualizada** (licença válida) | Licença verde, mas data da última atualização antiga | Proteção desatualizada, por problema de comunicação (rota, DNS, hora, saída bloqueada) |
| **Falha de rating** | Web Filter registra erros de rating; as atualizações podem estar funcionando | Sites sem categoria; o perfil aplica a ação de erro de rating |

> **Dica para a prova:** as bases de AV e IPS são locais (baixadas). Web Filter, DNS Filter e Antispam dependem de consulta em tempo real ao FortiGuard. Com o anycast, tudo usa HTTPS na porta 443.

#### Erros comuns

- Supor que o perfil protege mesmo com a licença vencida ou sem comunicação com o FortiGuard.
- Achar que vencer o bundle de segurança também tira o suporte FortiCare, ou o contrário: são contratos separados.
- Investigar o FortiGuard sem antes verificar rota, DNS e hora do equipamento.
- Confundir falha de download de bases com falha de consulta de rating.
- Renovar o contrato e esperar o ciclo de atualização em vez de forçar a atualização.

:::cli FortiGuard e licenciamento
### Versões das bases e contratos

```
diagnose autoupdate versions
```

```saida
FGT-MTZ # diagnose autoupdate versions
AV Engine
---------
Version: 7.00041
Contract Expiry Date: 2027/06/30
Last Updated using scheduled update on Mon Nov  9 15:43:16 2026
Last Update Attempt: Mon Nov  9 16:33:16 2026
Result: No Updates
 
Virus Definitions
---------
Version: 94.09321
Contract Expiry Date: 2027/06/30
Last Updated using scheduled update on Mon Nov  9 15:43:16 2026
Last Update Attempt: Mon Nov  9 16:33:16 2026
Result: No Updates
 
Extended set
---------
Version: 94.09321
Contract Expiry Date: 2027/06/30
Last Updated using scheduled update on Mon Nov  9 15:43:16 2026
Last Update Attempt: Mon Nov  9 16:33:16 2026
Result: No Updates
 
Mobile Malware Definitions
---------
Version: 94.09321
Contract Expiry Date: 2027/06/30
Last Updated using scheduled update on Mon Nov  9 15:43:16 2026
Last Update Attempt: Mon Nov  9 16:33:16 2026
Result: No Updates
 
AI/Machine Learning Malware Model
---------
Version: 4.00124
Contract Expiry Date: 2027/06/30
Last Updated using scheduled update on Mon Nov  9 15:43:16 2026
Last Update Attempt: Mon Nov  9 16:33:16 2026
Result: No Updates
 
Botnet Domain Database
---------
Version: 5.00447
...
```

Lista cada base (AV, IPS, aplicações, ISDB e outras) com a versão, a data da última atualização, o resultado da última tentativa e a **data de expiração do contrato**. É o comando para responder "minha base está atualizada?" e "minha licença venceu?".

### Estado do Web Filter

```
get webfilter status
```

```saida
FGT-MTZ # get webfilter status
Locale       : english
Service      : Web-filter
Status       : Enable
License      : Contract
Expiration   : 2027/06/30
```

Mostra se o serviço de Web Filter está ativo e licenciado.

### Como o FortiGate encontra o FortiGuard

```
get system fortiguard
```

```saida
FGT-MTZ # get system fortiguard
FDS-license-expiring-days: 15
antispam-cache      : enable
antispam-cache-mpermille: 1
antispam-cache-ttl  : 1800
antispam-expiration : 0
antispam-force-off  : disable
antispam-license    : 4294967295
antispam-timeout    : 7
anycast-sdns-server-ip: 0.0.0.0
anycast-sdns-server-port: 853
auto-firmware-upgrade: enable
auto-firmware-upgrade-day: 
auto-firmware-upgrade-delay: 3
auto-firmware-upgrade-end-hour: 4
auto-firmware-upgrade-start-hour: 2
auto-join-forticloud: enable
ddns-server-ip      : 0.0.0.0
ddns-server-ip6     : ::
ddns-server-port    : 443
fortiguard-anycast  : enable
fortiguard-anycast-source: fortinet
fortiguard-server-location: automatic
interface           : 
interface-select-method: auto
load-balance-servers: 5
outbreak-prevention-cache: enable
outbreak-prevention-cache-mpermille: 1
outbreak-prevention-cache-ttl: 300
outbreak-prevention-expiration: 0
outbreak-prevention-force-off: disable
outbreak-prevention-license: 4294967295
outbreak-prevention-timeout: 7
persistent-connection: disable
port                : 443
protocol            : https
proxy-fqdn-host     : enable
proxy-password      : 
proxy-server-ip     : 
proxy-server-port   : 0
proxy-username      : 
sandbox-inline-scan : disable
sandbox-region      : 
sdns-options        : 
...
```

Os campos mais importantes:

- `fortiguard-anycast`: o uso dos servidores anycast (padrão `enable`);
- `protocol` e `port`: como as consultas são feitas;
- `update-server-location`: de quais servidores baixar as bases;
- `webfilter-cache-ttl` e afins: por quanto tempo as respostas de rating ficam em cache.

### Agendamento e atualização imediata

```
config system autoupdate schedule
    set status enable
    set frequency automatic
end
```

Para forçar a atualização:

```
execute update-now
```

### Diagnóstico de falha de atualização

Verifique os pré-requisitos na ordem:

```
get router info routing-table all
execute ping update.fortiguard.net
diagnose autoupdate versions
```

O primeiro mostra se existe rota padrão; o segundo, se o nome é resolvido e alcançado; o terceiro, o resultado da última tentativa e a expiração.

Para ver a atualização acontecendo em detalhe, ligue o debug do processo de atualização, force a atualização e acompanhe a saída. Ao terminar, **desligue o debug**:

```
diagnose debug application update -1
diagnose debug enable
execute update-now
diagnose debug disable
diagnose debug reset
```

> **Atenção:** debugs consomem recursos e geram muita saída. Sempre os desligue ao terminar.
:::

---

## 01.7. Backup, restauração e firmware

### 01.7.1. Backup e restauração

#### Conceito: o que é o arquivo de configuração

Toda a configuração do FortiGate (interfaces, policies, objetos, VPNs, usuários, certificados) fica em **um único arquivo de texto**, com os mesmos comandos que você digita na CLI. O backup é a cópia desse arquivo.

O arquivo começa com um cabeçalho de linhas iniciadas por `#`, que identificam de onde ele veio. Este é o cabeçalho do backup do FGT-MTZ feito pela GUI do laboratório:

```saida
#config-version=FGT121G-8.00-FW-build0215-260305:opmode=0:vdom=0:user=admin
#conf_file_ver=25000101
#buildno=0215
#global_vdom=1
```

| Linha | O que informa |
|---|---|
| `#config-version` | O **modelo** (`FGT121G`), a **versão** do FortiOS (`8.00`), o **build** (`build0215`) e a data do build; depois, o modo de operação (`opmode=0` é NAT, `1` seria transparente), se há VDOMs (`vdom=0`: não há) e o **administrador** que gerou o backup (`user=admin`). |
| `#conf_file_ver` | Um número de controle da versão do arquivo de configuração. |
| `#buildno` | O build do firmware, repetido sozinho. |
| `#global_vdom` | Indica que o arquivo começa pela configuração global do equipamento. |

Depois do cabeçalho vêm os blocos `config ... end`, na mesma forma do `show` da CLI. Na restauração, o FortiGate lê o cabeçalho para decidir se aceita o arquivo: um backup de outro modelo é recusado, e um backup de outra versão do FortiOS passa por conversão, com risco de perder ou alterar trechos da configuração.

#### Backup comum e backup criptografado

O arquivo contém informações sensíveis: hashes de senhas de administradores, segredos de VPN, senhas de servidores LDAP e RADIUS e chaves privadas de certificados. Mesmo em um backup comum, esses segredos não aparecem em texto aberto: são armazenados cifrados ou como hash (você verá linhas como `set password ENC ...`). Mas essa cifragem usa, por padrão, uma chave que é a mesma em todos os FortiGates. Por isso, **o arquivo deve ser tratado como segredo**: com ele, alguém pode recriar o seu firewall em outro equipamento ou tentar quebrar os segredos offline.

Há duas proteções adicionais:

- **Backup criptografado:** ao gerar o backup, você define uma senha, e o arquivo **inteiro** é cifrado. Para restaurar, a senha é obrigatória.
- **Private data encryption:** o FortiGate passa a cifrar os segredos da configuração com uma **chave própria do equipamento**, definida por você, em vez da chave padrão. O campo `Private Encryption` do `get system status` mostra se ela está ligada. A consequência: restaurar o backup em outro equipamento exige a mesma chave.

| Tipo | Vantagem | Cuidado |
|---|---|---|
| Comum | Legível; fácil de comparar e consultar | Guardar com o mesmo cuidado de uma senha |
| Criptografado | Protege o arquivo inteiro | Sem a senha, o backup é inútil; guarde a senha separada do arquivo |

#### Na GUI: fazendo o backup

O backup fica no **menu do administrador**:

:::slides
midia/m01/01-7-backup-passo-0.png "Botão do administrador em destaque" | Na barra superior, clique no **nome do administrador**.
midia/m01/01-7-backup-passo-1.png "Menu do administrador com o item Configuration em destaque" | Clique em **Configuration**.
midia/m01/01-7-backup-passo-2.png "Submenu Configuration com o item Backup em destaque" | O submenu **Configuration** tem **Backup**, **Restore** e **Reset to factory defaults**. Clique em **Backup**.
midia/m01/01-7-backup-1.png "Tela Backup System Configuration com Backup to em destaque" | **Backup to:** o computador do administrador (**Local PC**) ou um pendrive ligado ao FortiGate (**USB Disk**).
midia/m01/01-7-backup-2.png "Opção Encryption ativada em destaque" | **Encryption:** ligue para cifrar o arquivo inteiro com uma senha.
midia/m01/01-7-backup-3.png "Campos de senha do backup em destaque" | **Password** e **Confirm password:** a senha do backup. Guarde-a **separada** do arquivo, num cofre de senhas.
midia/m01/01-7-backup-4.png "Botão OK para baixar o backup" | Clique em **OK**: o navegador baixa o arquivo `.conf`.
:::

O nome do arquivo baixado segue o padrão `<hostname>_<versão>_<build>_<data>_<hora>.conf`, neste caso `FGT-MTZ_8-0-1_0215_20261109_1643.conf`. Com **Encryption** ligada, só o cabeçalho continua legível; o resto vira um bloco cifrado, que só a senha do backup abre:

```saida
#config-version=FGT121G-8.00-FW-build0215-260305:opmode=0:vdom=0:user=admin
#conf_file_ver=25000101
#buildno=0215
#global_vdom=1
IREzUGCMuev1CCNDK4WX3PwGOlFF6v6FqQdxBwaDpcf84UkVRXKUv57hZWE9OMfh
090fNQ1w1+z+6AQjVDODpvPnsiNaNxryvtLnb3R9aJu42/xIF1l9h7CXrCokSnGU
...
```

> **Na prática:** mantenha cópias **fora do equipamento**, feitas antes de toda mudança relevante e, idealmente, automatizadas (por exemplo, pelo FortiManager ou por um script que use a API). Um backup que só existe no notebook do administrador some com o notebook.

#### Revisões de configuração

Além do backup manual, o FortiGate pode guardar **revisões** internas da configuração nos modelos com armazenamento, por exemplo uma revisão a cada vez que um administrador sai:

:::figura midia/m01/01-7-revisao.png "Opção Create a configuration revision on logout"
Em **System > Settings**, a opção **Create a configuration revision on logout** guarda uma revisão da configuração cada vez que um administrador encerra a sessão. Com isso, dá para comparar o antes e o depois de cada sessão de trabalho e voltar a um ponto anterior.
:::

Revisões internas não substituem o backup externo: se o equipamento queimar, as revisões vão com ele.

#### Na GUI: restauração

A restauração fica no mesmo menu do backup:

:::slides
midia/m01/01-7-backup-passo-1.png "Menu do administrador com o item Configuration" | No **menu do administrador**, clique em **Configuration**.
midia/m01/01-7-restore-passo-1.png "Submenu Configuration com o item Restore em destaque" | Clique em **Restore**.
midia/m01/01-7-restore.png "Tela Restore System Configuration com o botão Upload em destaque" | Em **Restore System Configuration**, clique em **Upload** para escolher o arquivo do backup.
midia/m01/01-7-restore-2.png "Arquivo escolhido, senha e o botão OK" | Com o arquivo escolhido, preencha **Password** se o backup for criptografado e clique em **OK**. A configuração atual é **substituída** e o equipamento **reinicia**. (Aqui, a Atlas cancelou.)
:::

Regras de restauração:

- **Mesmo modelo:** a restauração é direta. É o caso de um equipamento substituído pela garantia (RMA): o novo recebe o backup do antigo.
- **Modelo diferente:** o FortiOS recusa o arquivo, porque os nomes das interfaces e os recursos de hardware diferem. A migração para um modelo maior exige adaptar a configuração (nomes de portas, interfaces inexistentes), manualmente ou com ferramentas de conversão da Fortinet, sempre como um procedimento planejado.
- **Versão diferente de firmware:** o ideal é restaurar no mesmo build em que o backup foi gerado. Restaurar um backup de versão mais antiga numa mais nova pode funcionar com conversão, mas com risco de perder ou alterar configurações.

> **Atenção:** a restauração **substitui** toda a configuração atual e reinicia o equipamento. Se o backup tiver outro endereço de gerência ou outras restrições de acesso, você pode perder o acesso pela rede, então tenha a console à mão.

### 01.7.2. Ciclo de firmware

#### Versões do FortiOS

O FortiOS segue o formato **major.minor.patch**, por exemplo 7.6.4:

- **major.minor** (7.6): a "família" da versão, com seu conjunto de recursos;
- **patch** (.4): correções e alguns ajustes dentro da família;
- **build**: o número exato da imagem compilada (aparece no widget System Information e no `get system status`).

A Fortinet classifica as versões como **Feature** (com recursos novos, ainda amadurecendo) e **Mature** (estáveis, recomendadas para produção). A classificação aparece no fim da versão: **GA.F** é *Feature*, **GA.M** é *Mature*. Em produção, a recomendação geral é usar versões Mature, a menos que você precise de um recurso específico.

#### O que ler antes de atualizar: o release notes

Antes de qualquer atualização, leia o **release notes** da versão de destino. Ele traz:

- **Supported upgrade path:** de quais versões é possível atualizar diretamente;
- **Changes in default behavior / changes in CLI:** o que muda de comportamento ou de comando;
- **Known issues:** problemas conhecidos que podem afetar o seu ambiente;
- **Resolved issues:** o que foi corrigido;
- **Product integration and support:** compatibilidade com FortiAnalyzer, FortiManager, FortiClient, FortiSwitch, FortiAP e outros;
- **Recursos removidos ou alterados**, inclusive limitações por modelo.

#### Upgrade path

Não se deve "pular" livremente de uma versão antiga para uma muito nova. A cada versão, o FortiOS converte a configuração para o formato novo, e algumas conversões só funcionam a partir de versões intermediárias. A Fortinet oferece a ferramenta **Upgrade Path** no portal de documentação e suporte: você informa o modelo, a versão atual e a de destino, e ela mostra a sequência de versões intermediárias recomendada.

> **Dica para a prova:** atualizar fora do caminho recomendado pode causar perda ou corrupção de configuração. Siga o upgrade path e faça backup antes.

#### Procedimento de atualização

1. **Planeje:** escolha a versão, leia o release notes, consulte o upgrade path e verifique a compatibilidade dos produtos integrados.
2. **Faça backup** da configuração e guarde fora do equipamento.
3. **Registre o estado atual:** versão, recursos em uso e alguns testes de referência (acesso à Internet, VPN ativa, autenticação), para comparar depois.
4. **Agende uma janela de manutenção:** o equipamento reinicia e a rede fica fora do ar por alguns minutos.
5. **Atualize pela GUI**, como mostrado abaixo.
6. **Valide:** confira a versão no widget System Information, repita os testes de referência, verifique os logs de eventos e compare a configuração com o backup.

:::figura midia/m01/01-7-firmware.png "Página System > Firmware & Registration"
**System > Firmware & Registration** mostra a versão de cada equipamento, o registro e o status de atualização.
:::

Para atualizar pela GUI, use o assistente **FortiGate Upgrade**:

:::slides
midia/m01/01-7-upgrade-1.png "FGT-MTZ selecionado na lista, com o botão Upgrade" | Em **System > Firmware & Registration**, selecione o equipamento e clique em **Upgrade**.
midia/m01/01-7-upgrade-2.png "Passo Choose Upgrade Type" | **Choose Upgrade Type:** **FortiGate only** atualiza só este equipamento; **Full Fabric upgrade** atualiza também os dispositivos do Security Fabric (FortiSwitch, FortiAP), na ordem certa.
midia/m01/01-7-upgrade-next.png "Botão Next do assistente" | Em cada passo, o botão **Next**, no rodapé do assistente, avança para o próximo.
midia/m01/01-7-upgrade-3.png "Passo Select Firmware com a versão de destino" | **Select Firmware:** a aba **Recommended** traz as versões recomendadas para o modelo, cada uma com o link do **release notes**. Escolha a versão e clique em **Next**. **File Upload** permite enviar uma imagem baixada do portal de suporte.
midia/m01/01-7-upgrade-4.png "Passo de agendamento e backup com Specify" | **Agendamento e backup:** **Immediate** atualiza na hora; **Specify** agenda para a janela de manutenção. Antes do upgrade, o FortiGate faz um **backup** da configuração, protegido pela senha informada. Clique em **Next**.
midia/m01/01-7-upgrade-5.png "Passo Review" | **Review:** confira o equipamento, a versão atual, a de destino e o agendamento.
midia/m01/01-7-upgrade-confirm.png "Botão Confirm and Backup Config" | **Confirm and Backup Config** faz o backup e inicia (ou agenda) o upgrade. (A Atlas cancelou: o upgrade fica para a janela de manutenção.)
:::

Durante o upgrade, o FortiGate grava a imagem nova, reinicia e, no primeiro boot, converte a configuração para o formato da versão nova. Depois, confirme a nova versão no widget **System Information** e execute os testes de validação.

O FortiOS verifica a **assinatura digital** da imagem e alerta se ela não for oficial da Fortinet. Baixe imagens somente do FortiGuard ou do portal de suporte.

#### Plano de retorno: as duas partições

A maioria dos FortiGates físicos tem **duas partições de firmware**. Ao atualizar, a nova imagem é gravada em uma partição e a anterior fica preservada na outra. Isso permite voltar rapidamente à versão anterior escolhendo de qual partição o equipamento vai iniciar no próximo boot, pela CLI.

Mesmo assim, **mantenha o backup** feito na versão anterior: ao voltar, você pode precisar restaurar a configuração exata daquele momento.

#### Downgrade

Voltar para uma versão mais antiga (downgrade) é possível, mas a configuração convertida para a versão nova pode não ser compreendida pela antiga, e parte dela pode se perder. O procedimento recomendado é instalar a versão antiga e **restaurar o backup gerado naquela versão**.

### 01.7.3. Recuperação de firmware *(Aprofundamento)*

Se o firmware estiver corrompido e o equipamento não inicializar, ainda é possível instalar uma imagem pelo **menu de boot** (BIOS), acessado pela console. É um procedimento de emergência, raro, e por isso aparece aqui só em linhas gerais:

1. Prepare um **servidor TFTP** com a imagem do modelo, ligado diretamente à porta que o menu de boot usa para TFTP (varia por modelo).
2. Conectado à console, reinicie o equipamento e **interrompa o boot** pressionando uma tecla quando a mensagem *Press any key to display configuration menu* aparecer.
3. No menu, configure os parâmetros TFTP (IP do servidor, IP local temporário, máscara, nome do arquivo) e inicie a transferência. A opção de ajuda do menu lista as letras de cada opção.
4. Ao final, o equipamento grava a imagem e reinicia.

O menu de boot também tem a opção de **formatar** o dispositivo de boot, que apaga firmware e configuração. Use somente quando for essa a recomendação do suporte, e com o backup em mãos.

#### Erros comuns

- Atualizar sem backup, ou com o backup guardado só dentro do próprio equipamento.
- Pular versões fora do upgrade path.
- Não ler o release notes e ser surpreendido por mudança de comportamento ou recurso removido.
- Guardar backups sem criptografia em local compartilhado.
- Tentar restaurar o backup de um modelo em outro modelo sem adaptação.
- Fazer downgrade sem o backup da versão de destino.

:::cli Backup, restauração e firmware
### Backup pela CLI

```
execute backup config tftp FGT-MTZ-backup.conf 10.10.99.10 <senha-opcional>
```

Quando a senha é informada, o arquivo é criptografado. Além de TFTP, há destinos como FTP, SFTP e USB (`execute backup config ?` lista as opções).

### Restauração pela CLI

```
execute restore config tftp FGT-MTZ-backup.conf 10.10.99.10 <senha-se-houver>
```

O equipamento reinicia ao final.

### Revisões automáticas

```
config system global
    set revision-backup-on-logout enable
    set revision-image-auto-backup enable
end
```

- `revision-backup-on-logout`: cria uma revisão quando um administrador sai.
- `revision-image-auto-backup`: cria uma revisão antes de uma atualização de firmware.

### Atualização de firmware pela CLI

```
execute restore image tftp FGT_121G-v7.6.x-buildXXXX-FORTINET.out 10.10.99.10
```

### Partições e retorno à versão anterior (somente pela CLI)

Consultar as partições e qual está ativa:

```
diagnose sys flash list
```

```saida
FGT-MTZ # diagnose sys flash list
Partition  Image                                     TotalSize(KB)  Used(KB)  Use%  Active
1          FGT121G-8.00-FW-build0215-260305           1787600        425380    24%   Yes
2          ETDB-2026-11-09                                  1787600        147200     8%   No
Image build at 2026-11-09 for b0215
```

Cada linha é uma partição, com a imagem gravada nela. A coluna `Active` mostra a que está em uso.

Iniciar pela outra partição no próximo boot:

```
execute set-next-reboot secondary
execute reboot
```

Em VMs, a saída e o comportamento podem ser diferentes.
:::
