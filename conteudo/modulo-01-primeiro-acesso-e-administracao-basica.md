# Módulo 01 — Primeiro acesso e administração básica

## Antes de começar

### O que você vai aprender

Ao final deste módulo, você será capaz de:

- explicar por que os firewalls evoluíram e o que diferencia o FortiGate;
- reconhecer as funções do FortiGate e onde cada uma fica na interface;
- identificar modelo, versão do FortiOS e licenças, e entender por que um recurso pode não aparecer no seu equipamento;
- acessar um FortiGate novo pela console e pela rede, fazer o primeiro login e recuperar o acesso quando a senha se perde;
- navegar com segurança pela GUI e usar a CLI quando ela for necessária;
- configurar hostname, hora, DNS e o acesso administrativo de forma segura;
- criar administradores com o privilégio mínimo necessário;
- entender os tipos de licenciamento e o funcionamento do FortiGuard;
- fazer backup, restaurar a configuração e atualizar o firmware com um plano de retorno.

**Pré-requisitos:** nenhum. Este é o ponto de partida do curso.

### Topologia atual

Neste módulo, o FortiGate da matriz da Atlas Logística (FGT-MTZ) sai da caixa. Ainda não há redes de usuários, regras nem Internet. O objetivo é deixar o equipamento **acessível, identificado, com hora correta, administração protegida, licenças verificadas e um backup guardado**.

Para administrar o equipamento desde o primeiro dia, a Atlas usa uma **rede de gerência separada** (gerência *out-of-band*), que não depende das redes dos usuários:

| Elemento | Valor |
|---|---|
| Interface de gerência do FGT-MTZ | `mgmt` |
| Rede de gerência | 10.10.99.0/24 |
| Endereço do FGT-MTZ na gerência | 10.10.99.1 |
| Estação do administrador (ADMIN-PC) | 10.10.99.10 |
| Notebook da console (NOTEBOOK-TI) | ligado à porta de console do FGT-MTZ |

:::figura midia/m01/00-topologia-gerencia.png "Diagrama: ADMIN-PC ligado à porta mgmt do FGT-MTZ e NOTEBOOK-TI ligado à porta de console"
O **ADMIN-PC** acessa o FGT-MTZ pela porta **mgmt**. O **NOTEBOOK-TI** fica ligado à porta de **console**, para o primeiro acesso e para emergências. A porta mgmt ainda mostra o endereço de fábrica (192.168.1.99/24), que vamos trocar logo no primeiro acesso.
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

A resposta da indústria foi o **firewall de próxima geração** (NGFW, *Next-Generation Firewall*): um equipamento que continua controlando endereços e portas, mas que também **identifica aplicações e usuários, inspeciona o conteúdo** do tráfego, inclusive o criptografado, e consulta inteligência de ameaças atualizada.

### 01.1.2. O que é o FortiGate e quais são seus diferenciais

O **FortiGate** é o NGFW da Fortinet. Ele reúne recursos avançados de **infraestrutura de rede** (roteamento, SD-WAN, VPN, switching) e de **segurança** (firewall, IPS, antivírus, filtro web, controle de aplicações) em um único equipamento.

#### Onde o FortiGate é usado

- **Borda da rede (*edge*):** entre a empresa e a Internet, protegendo a saída dos usuários e os serviços publicados.
- **Segmentação interna:** entre redes internas (usuários, servidores, convidados, OT), controlando o tráfego que nunca sai para a Internet. É a resposta às ameaças internas.
- **Multi-cloud:** protegendo redes em nuvens públicas e privadas e ligando a nuvem às filiais.

#### Formatos

- **Appliance físico:** desde modelos de mesa para filiais até chassis para data centers.
- **Máquina virtual (FortiGate-VM):** roda em VMware, Hyper-V, KVM e nas nuvens públicas.
- **FortiGate as a Service (FGaaS):** o FortiGate entregue como serviço em nuvem, sem você administrar a infraestrutura por baixo.

#### Diferenciais

- **UTM (*Unified Threat Management*):** várias camadas de segurança no mesmo equipamento e na mesma console. Em vez de um firewall, um IPS, um filtro web e um antivírus de fabricantes diferentes, você administra **um só produto**, com menos custo e menos complexidade.
- **Hardware dedicado da Fortinet:** os appliances têm processadores próprios (os **SPUs**: NP para o tráfego e CP para criptografia e inspeção), que tiram esse trabalho da CPU. O resultado é **alto desempenho** mesmo com várias proteções ativas, sem sobrecarregar a CPU.
- **Integração com o ecossistema Fortinet:** o FortiGate é o centro do **Security Fabric**, integrando-se facilmente a FortiAnalyzer, FortiManager, FortiSwitch, FortiAP, FortiClient e outros produtos.
- **Compatibilidade com outros fabricantes:** o FortiGate usa protocolos e padrões abertos (IPsec, BGP, LDAP, RADIUS, syslog, SAML, APIs REST) e tem conectores para nuvens e soluções de terceiros.

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

O sistema operacional do FortiGate se chama **FortiOS**. É ele que define quais funções existem e como são configuradas. Quando este material fala em "versão", fala da versão do FortiOS (por exemplo, 7.6.4), e não do hardware.

> **Na prática:** as funções do FortiGate dependem umas das outras. Um filtro web, por exemplo, só atua sobre um tráfego que uma firewall policy já permitiu. Entender essa ordem é a base de todo o curso.

### 01.1.3. Como a GUI está organizada

A **GUI** (*Graphical User Interface*) é a interface web de administração, acessada por HTTPS. O menu lateral é organizado por **função**:

:::slides
midia/m01/01-1-menu-gui-1.png "GUI do FortiGate com o menu lateral em destaque" | O **menu lateral** organiza o FortiGate por função. Cada item abre um grupo de páginas.
midia/m01/01-1-menu-gui-2.png "Menu Dashboard em destaque" | **Dashboard:** visão do estado do equipamento, com CPU, memória, sessões, licenças e as visões do **FortiView**.
midia/m01/01-1-menu-gui-3.png "Menu Network em destaque" | **Network:** conectividade. Interfaces, DNS, rotas estáticas, policy routes e SD-WAN.
midia/m01/01-1-menu-gui-4.png "Menu Policy & Objects em destaque" | **Policy & Objects:** quem pode falar com quem. As **firewall policies** e os objetos que elas usam: endereços, serviços, schedules, Virtual IPs e IP pools.
midia/m01/01-1-menu-gui-5.png "Menu Security Profiles em destaque" | **Security Profiles:** o que é inspecionado no tráfego **já permitido** pela policy. Antivirus, Web Filter, DNS Filter, Application Control, IPS e inspeção SSL.
midia/m01/01-1-menu-gui-6.png "Menu VPN em destaque" | **VPN:** túneis IPsec e acesso remoto. Logo abaixo, **User & Authentication** reúne usuários, grupos, servidores LDAP e RADIUS e FortiTokens.
midia/m01/01-1-menu-gui-7.png "Menu System em destaque" | **System:** o próprio equipamento. Administradores, perfis administrativos, firmware, configurações gerais, HA, certificados, FortiGuard e Feature Visibility.
midia/m01/01-1-menu-gui-8.png "Menu Security Fabric em destaque" | **Security Fabric:** integração com outros produtos (topologia, Security Rating, automação, conectores). **Log & Report:** os registros de tráfego, eventos e segurança.
:::

| Menu | Para que serve |
|---|---|
| **Dashboard** | Visão do estado do equipamento |
| **Network** | Conectividade: interfaces, DNS, rotas, SD-WAN |
| **Policy & Objects** | Quem pode falar com quem: policies e objetos |
| **Security Profiles** | O que é inspecionado no tráfego permitido |
| **VPN** | Túneis IPsec e acesso remoto |
| **User & Authentication** | Usuários, grupos, servidores de autenticação, FortiTokens |
| **WiFi & Switch Controller** | Gerência de FortiAP e FortiSwitch (aparece quando o recurso está habilitado) |
| **System** | Administradores, firmware, configurações gerais, HA, certificados, FortiGuard |
| **Security Fabric** | Integração com outros produtos Fortinet |
| **Log & Report** | Logs de tráfego, eventos e segurança |

Repare na separação entre **Policy & Objects** e **Security Profiles**. A firewall policy decide se a conexão é **permitida**. O Security Profile decide o que acontece **com o conteúdo** da conexão permitida. Um perfil nunca libera algo que a policy bloqueou.

Algumas funções são **nativas** do FortiGate (firewall, VPN, filtros). Outras são **integrações** com outros produtos: FortiAnalyzer para logs centralizados, FortiClient EMS para dados dos computadores, FortiSandbox para análise de arquivos. As integrações ficam em **Security Fabric > Fabric Connectors** e exigem o outro produto funcionando, não só a configuração no FortiGate.

#### A barra superior

A barra superior traz ferramentas disponíveis em qualquer página:

:::slides
midia/m01/01-1-elementos-gui-1.png "Barra superior da GUI em destaque" | A **barra superior** acompanha todas as páginas da GUI.
midia/m01/01-1-elementos-gui-2.png "Botão de busca em destaque" | **Busca:** digite parte do nome ("dns", "admin", "firmware") para ir direto à página. Ajuda muito quando o menu muda entre versões.
midia/m01/01-1-elementos-gui-3.png "Botão FortiAI em destaque" | **FortiAI:** o assistente de IA da Fortinet, que responde perguntas sobre a configuração. Depende de licença.
midia/m01/01-1-elementos-gui-4.png "Botão CLI em destaque" | **CLI:** abre a **CLI Console**, um terminal da CLI dentro do navegador, sem precisar de SSH.
midia/m01/01-1-elementos-gui-5.png "Botão de notificações em destaque" | **Notificações:** avisos do sistema, como firmware novo, licenças a vencer e problemas de configuração.
midia/m01/01-1-elementos-gui-6.png "Menu do administrador em destaque" | **Menu do administrador:** **Configuration** (backup, restauração e reset de fábrica), troca de senha e logout.
:::

Além da barra superior, repare em outros elementos comuns:

- **Dashboards:** painéis com widgets (System Information, Licenses, CPU, Memory, Sessions, Interfaces, Administrators). Você pode criar dashboards próprios e escolher os widgets.
- **Listas:** a maioria das páginas tem busca, filtros por coluna e a coluna **Ref.** (referências), que mostra se um objeto está em uso.

### 01.1.4. Modelos, plataformas e recursos disponíveis

#### Famílias de FortiGate

O mesmo FortiOS roda em plataformas diferentes:

| Plataforma | Exemplos | Características |
|---|---|---|
| **Entry-level (desktop)** | FortiGate 40F, 60F, 70G, 90G | Pequenas empresas e filiais. Processador SoC (*System on a Chip*), que reúne CPU e aceleração em um só chip. Normalmente têm um switch interno (porta `lan` ou `internal`). |
| **Mid-range** | FortiGate 100F, 120G, 200G, 400F, 600F | Empresas médias e matrizes. Processadores dedicados de aceleração (NP para tráfego, CP para criptografia e inspeção). |
| **High-end** | FortiGate 1000F, 3000F e superiores | Data centers e provedores. Grande capacidade e muitas portas de alta velocidade. |
| **VM** | FortiGate-VM (VMware, Hyper-V, KVM, AWS, Azure, GCP…) | Mesmo FortiOS, sem aceleração em hardware. A capacidade depende da licença e dos recursos (vCPU, memória) alocados. |
| **Rugged** | FortiGate Rugged | Ambientes industriais, com variação de temperatura e vibração. |

O FGT-MTZ da Atlas é um **FortiGate 121G**, um modelo mid-range:

:::figura midia/m01/01-1-fortigate-121g.png "Painel frontal do FortiGate 121G no diagrama do laboratório"
O FortiGate 121G tem portas de **console (CON)**, **HA** e **MGMT**, 16 portas de cobre (1 a 16), oito portas SFP (17 a 24) e quatro portas SFP+ de 10 Gbps (X1 a X4).
:::

Guarde a ideia: **dois FortiGates com a mesma versão de FortiOS podem ter capacidades e até recursos diferentes**, por causa do hardware.

#### Conhecendo o seu equipamento pela GUI

O widget **System Information**, no dashboard **Status**, resume a identidade do equipamento:

:::slides
midia/m01/01-1-system-information-1.png "Widget System Information do FGT-MTZ" | O widget **System Information** resume a identidade do equipamento.
midia/m01/01-1-system-information-2.png "Linha Hostname em destaque" | **Hostname:** o nome do equipamento. Ele aparece no prompt da CLI, nos logs e no Security Fabric.
midia/m01/01-1-system-information-3.png "Linha Serial number em destaque" | **Serial number:** o número de série, usado no **registro** do equipamento e no suporte.
midia/m01/01-1-system-information-4.png "Linha Firmware em destaque" | **Firmware:** versão do FortiOS e **build**, que identifica exatamente a imagem instalada. O destaque em vermelho indica que há uma versão mais nova disponível.
midia/m01/01-1-system-information-5.png "Linha Mode em destaque" | **Mode:** **NAT** é o modo roteado, o padrão e o usado neste curso. O outro modo é o **Transparent**, em que o FortiGate funciona como uma ponte entre segmentos de rede.
midia/m01/01-1-system-information-6.png "Linha System time em destaque" | **System time** e **Uptime:** a hora do equipamento e há quanto tempo ele está ligado. Você vai ver por que a hora correta é tão importante.
:::

A mesma informação, com mais detalhes, aparece no comando `get system status`. Esse comando é muito cobrado na prova: veja a saída completa no **Guia de comandos CLI** deste capítulo.

#### Por que um recurso pode "não existir" no seu FortiGate

É comum ler a documentação, procurar um recurso na GUI e não encontrar. Há quatro motivos principais:

1. **Feature Visibility:** para deixar a GUI mais limpa, o FortiOS esconde vários recursos por padrão. Eles existem e funcionam, só não aparecem no menu. Exemplos: DNS Database, Load Balance, Explicit Proxy, Local-In Policy.
2. **Modelo e memória:** alguns recursos dependem do hardware. Modelos com pouca memória RAM podem não ter recursos que exigem muito processamento. A matriz de recursos por plataforma (*Feature / Platform Matrix*) e o release notes informam essas restrições.
3. **Licença:** o recurso aparece, mas não funciona sem o serviço FortiGuard correspondente.
4. **Versão do FortiOS:** o recurso foi incluído, renomeado ou removido em determinada versão.

#### Na GUI: habilitando um recurso em Feature Visibility

:::slides
midia/m01/01-1-feature-visibility-1.png "Página System > Feature Visibility com os recursos agrupados por área" | Em **System > Feature Visibility**, os recursos aparecem agrupados por área (*Network*, *Policy & objects* e outras). A chave de cada um indica se ele aparece no menu.
midia/m01/01-1-feature-visibility-2.png "Chave DNS Database ativada em Feature Visibility" | Localize **DNS Database**, ative a chave e clique em **Apply**. A alteração vale na hora.
midia/m01/01-1-feature-visibility-3.png "Menu Network com o novo item DNS Servers" | O item **Network > DNS Servers** passa a aparecer no menu.
:::

Feature Visibility só altera a **interface**. Desabilitar a visibilidade de um recurso **não desliga** uma configuração que já está em uso. Ela continua funcionando, apenas fica fora da vista na GUI.

> **Atenção:** "não está no menu" não significa "não existe". Antes de concluir que o equipamento não suporta algo, confira Feature Visibility, a matriz de plataforma, a licença e o release notes.

#### Erros comuns

- Concluir que um recurso não existe porque o menu não aparece, quando ele só está oculto em Feature Visibility.
- Achar que um perfil de segurança pode liberar um tráfego que a firewall policy não permitiu.
- Esperar que uma VM tenha o mesmo desempenho de um appliance físico com aceleração em hardware.

:::cli O FortiGate e o FortiOS
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
Virus-DB: 94.09321(2026-11-09 13:22)
Extended DB: 94.09321(2026-11-09 13:22)
AV AI/ML Model: 4.00124(2026-11-09 13:22)
IPS-DB: 34.00512(2026-11-08 13:22)
IPS-ETDB: 34.00512(2026-11-08 13:22)
APP-DB: 32.00821(2026-11-08 13:22)
Serial-Number: FG121GTK25000101
BIOS version: 06000102
System Part-Number: P29447-02
Log hard disk: Available
Hostname: FGT-MTZ
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
FortiGuard contract: UTP (expired)
System time: Mon Nov  9 10:22:06 2026
Last reboot reason: warm reboot
```

| Campo | O que indica |
|---|---|
| `Version` | Modelo, versão do FortiOS e build. |
| `Firmware Signature` | Se a imagem é assinada pela Fortinet (`certified`). |
| `Virus-DB`, `IPS-DB`, `APP-DB` | Versões das bases de assinaturas e a data da última atualização. |
| `Serial-Number` | Número de série. |
| `Log hard disk` | Se há disco para logs locais. |
| `Operation Mode` | `NAT` ou `Transparent`. |
| `Virtual domain configuration` | Se o equipamento usa VDOMs. |
| `Current HA mode` | `standalone` (sozinho) ou o modo do cluster. |
| `FortiGuard contract` | O pacote de serviços FortiGuard e se ele está válido. |

> **Dica para a prova:** `get system status` reúne versão, número de série, modo de operação, estado de VDOM e de HA em uma única saída.

### Feature Visibility pela CLI

As opções de visibilidade ficam em `config system settings`, com nomes que começam com `gui-`:

```
config system settings
    set gui-dns-database enable
end
```

Para ver todas as opções disponíveis na sua versão:

```
config system settings
    set gui-?
end
```

### Desempenho e recursos

```
get system performance status
```

```saida
FGT-MTZ # get system performance status
CPU states: 1% user 1% system 0% nice 98% idle 0% iowait 0% irq 0% softirq
CPU0 states: 2% user 1% system 0% nice 97% idle 0% iowait 0% irq 0% softirq
CPU1 states: 2% user 1% system 0% nice 97% idle 0% iowait 0% irq 0% softirq
...
Memory: 8085452k total, 2263927k used (28.0%), 5821525k free (72.0%), 0k freeable (0.0%)
Average network usage: 1360 / 9 kbps in 1 minute, 136 / 1 kbps in 10 minutes, 45 / 0 kbps in 30 minutes
Average sessions: 0 sessions in 1 minute, 0 sessions in 10 minutes, 0 sessions in 30 minutes
Average session setup rate: 0 sessions per second in last 1 minute, 0 sessions per second in last 10 minutes, 0 sessions per second in last 30 minutes
Virus caught: 0 total in 1 minute
IPS attacks blocked: 0 total in 1 minute
Uptime: 0 days,  0 hours,  9 minutes
```

Mostra o uso de CPU (geral e por núcleo) e de memória, a quantidade de sessões e a taxa de criação de sessões. É o primeiro comando para saber se o equipamento está sobrecarregado.
:::

---

## 01.2. Primeiro acesso e recuperação

### 01.2.1. Console, endereço padrão e primeiro login

Um FortiGate novo pode ser acessado de duas formas: pela **console** (cabo serial) e pela **rede**, usando a interface que vem configurada de fábrica.

#### Acesso pela console

A console é o acesso "de último recurso". Funciona mesmo sem nenhuma configuração de rede, e é por ela que você recupera o equipamento quando perde o acesso pela rede.

- **Cabo:** a maioria dos modelos tem uma porta `CONSOLE` RJ-45 (cabo RJ-45 para serial ou USB). Alguns modelos também oferecem console por USB.
- **Software:** qualquer emulador de terminal (PuTTY, SecureCRT, Tera Term, `screen` no Linux e no macOS).
- **Parâmetros:** 9600 bps, 8 bits de dados, sem paridade, 1 bit de parada, sem controle de fluxo. É o famoso **9600 8N1**.

:::slides
midia/m01/01-2-putty-serial-1.png "Janela do PuTTY configurada para conexão serial" | No notebook, o **PuTTY** é configurado para a console. A console é uma conexão **serial**: funciona mesmo sem nenhuma configuração de rede.
midia/m01/01-2-putty-serial-2.png "Campo Serial line com COM3" | **Serial line:** a porta serial do computador. No Windows, o adaptador USB-serial aparece como uma porta **COM** (aqui, COM3).
midia/m01/01-2-putty-serial-3.png "Campo Speed com 9600" | **Speed:** **9600** bps. Com outra velocidade, aparecem caracteres sem sentido na tela.
midia/m01/01-2-putty-serial-4.png "Connection type Serial selecionado" | **Connection type:** **Serial**. O mesmo PuTTY também abre conexões SSH, úteis quando o FortiGate já tem endereço de gerência.
:::

> **Na prática:** em uma VM, a "console" é a janela de console do hipervisor (VMware, Hyper-V, KVM) ou da nuvem. Ela tem o mesmo papel do cabo console.

#### Acesso pela rede com a configuração de fábrica

A configuração de fábrica muda conforme o modelo. Em geral:

- **Modelos desktop:** costumam vir com a interface interna (`lan` ou `internal`) em 192.168.1.99/24, com HTTPS e PING liberados e um servidor DHCP entregando endereços aos computadores conectados.
- **Modelos com porta `mgmt`:** essa porta costuma vir com 192.168.1.99/24 para gerência.
- **VMs:** a `port1` normalmente recebe a gerência. Dependendo da plataforma, usa DHCP ou precisa ser configurada pela console.

Consulte o *Quick Start Guide* do seu modelo. Com o endereço em mãos, acesse `https://192.168.1.99` (ou o endereço correspondente). O navegador vai alertar que o certificado não é confiável. Isso é esperado: de fábrica, o FortiGate usa um certificado autoassinado, que pode ser trocado por um certificado confiável.

#### Primeiro login

- **Usuário:** `admin`
- **Senha:** em branco (apenas Enter)

Num FortiGate de fábrica, o primeiro login do `admin` **obriga a troca da senha** antes de liberar qualquer outra ação. Na console, o FortiOS mostra *You are forced to change your password* e pede a nova senha duas vezes: **New Password** e **Confirm Password**. A senha não aparece enquanto é digitada. Escolha uma senha forte e guarde-a em um cofre de senhas: essa conta é o seu acesso total ao equipamento.

:::figura midia/m01/01-2-console-troca-senha.mp4 "Primeiro login pela console: admin com senha em branco, troca obrigatória de senha e prompt FGT-MTZ #"
O primeiro login pela console do FGT-MTZ: usuário `admin`, senha em branco, troca obrigatória de senha e o prompt **`FGT-MTZ #`**. O `#` indica um administrador com acesso total.
:::

#### Configurando o endereço de gerência pela console

Muitas vezes o primeiro passo precisa ser feito pela console, porque ainda não há acesso pela rede. Este é um dos casos em que a CLI é necessária. No cenário da Atlas:

```
config system interface
    edit "mgmt"
        set mode static
        set ip 10.10.99.1 255.255.255.0
        set allowaccess ping https ssh
    next
end
```

Em palavras: "na tabela de interfaces, edite a interface `mgmt`, use endereço fixo 10.10.99.1/24, aceite PING, HTTPS e SSH de gerência e salve". A estrutura desses comandos é explicada no capítulo **GUI e CLI**.

:::figura midia/m01/01-2-console-mgmt.png "Configuração do endereço 10.10.99.1/24 na interface mgmt pela console, no PuTTY do notebook"
A configuração da interface `mgmt` digitada na console, logo depois da troca de senha.
:::

#### Primeiro acesso pela GUI e o assistente de configuração

Da estação 10.10.99.10, acesse `https://10.10.99.1`. A página de login aparece porque a interface `mgmt` agora tem endereço e aceita HTTPS.

:::figura midia/m01/01-2-login-gui.png "Página de login da GUI do FGT-MTZ aberta no navegador do ADMIN-PC em https://10.10.99.1"
A página de login da GUI no navegador do ADMIN-PC. Num FortiGate real, antes dela o navegador alerta que o certificado não é confiável.
:::

No primeiro login pela GUI, o FortiOS abre o **assistente de configuração inicial** (*FortiGate Setup*):

:::slides
midia/m01/01-2-assistente-1.png "Tela inicial do assistente FortiGate Setup com os três passos" | O assistente lista três passos em **Setup Progress**: **Automatic Patch Upgrades**, **Change Your Password** e **Initial Policy Configuration**. Clique em **Begin**.
midia/m01/01-2-assistente-2.png "Passo Automatic Patch Upgrades com a opção ativada" | **Automatic Patch Upgrades:** com a opção ativada, o FortiGate instala sozinho novos **patches** da versão atual (por exemplo, de 7.6.3 para 7.6.4). Em produção, muitas equipes preferem desativar e atualizar na janela de manutenção.
midia/m01/01-2-assistente-3.png "Passo Initial Policy Configuration com Change Your Password concluído" | **Change Your Password** aparece concluído, porque a senha já foi definida na console. Em **Initial Policy Configuration**, o assistente oferece criar uma policy de saída inicial. Como ainda não há redes configuradas, a Atlas escolhe **Do not create firewall policy now**.
:::

Lembre que o FortiGate bloqueia todo tráfego que nenhuma policy permite (**implicit deny**). Por isso o assistente oferece uma policy inicial: sem ela, nenhum computador atrás do FortiGate navega.

Outra opção para a configuração inicial é o **FortiExplorer**, aplicativo da Fortinet (computador e celular) que se conecta ao FortiGate por USB nos modelos compatíveis e facilita a instalação em campo.

### 01.2.2. Reset de fábrica e recuperação de senha

#### Reset de fábrica

O reset de fábrica apaga a configuração e devolve o equipamento ao estado original: mesma versão de firmware, configuração padrão. Use quando for reaproveitar um equipamento ou quando a configuração estiver irrecuperável.

Pela GUI, o reset fica no **menu do administrador > Configuration > Reset to factory defaults**. Pela CLI, o comando é `execute factory-reset`. Depois do reset:

- todas as policies, interfaces, VPNs, usuários e administradores criados são **apagados**;
- a senha do `admin` volta a ser em branco;
- o firmware **não** muda.

> **Atenção:** o reset de fábrica é irreversível. **Faça backup antes.** Em equipamentos remotos, o reset também apaga a configuração que permite acessá-los: você vai precisar de alguém no local.

#### Recuperação da senha do administrador

Se ninguém sabe a senha de um administrador com perfil `super_admin`, o FortiOS oferece a **conta maintainer** nos equipamentos físicos:

1. Conecte-se pela **console**.
2. **Desligue e ligue** o equipamento na energia. Uma reinicialização por software não serve: o procedimento exige o ciclo de energia, justamente para comprovar o acesso físico.
3. Logo que o prompt de login aparecer, faça login com o usuário `maintainer` e a senha `bcpb` seguida do **número de série em letras maiúsculas** (por exemplo, `bcpbFG121GTK25000101`). A janela de tempo é curta, então tenha o número de série anotado (ele fica na etiqueta do equipamento).
4. Já logado, redefina a senha do administrador (o comando está no Guia de comandos CLI).

Pontos importantes:

- A conta maintainer **exige acesso físico** (console e ciclo de energia). É uma proteção: quem tem acesso físico ao equipamento já poderia fazer o reset de fábrica.
- Ela pode ser **desabilitada** pelo administrador. Em ambientes com alta exigência de segurança, isso impede que alguém com acesso físico entre sem apagar a configuração.
- Com a conta maintainer desabilitada e a senha perdida, sobra o **reset de fábrica**, seguido da restauração de um backup.
- Em VMs, o procedimento é diferente (normalmente pela console do hipervisor). Consulte o guia da plataforma.

> **Dica para a prova:** a recuperação pela conta maintainer exige console e reinicialização por energia (*hard reboot*), e pode ser desabilitada pelo administrador.

#### Erros comuns

- Fazer reset de fábrica sem backup.
- Tentar a conta maintainer depois de reiniciar por software, em vez de desligar e ligar na energia.
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
FGT-MTZ # show system interface mgmt
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

### Reset de fábrica e variantes

```
execute factory-reset
```

Apaga a configuração e reinicia. Variantes (confira o comportamento exato no guia da sua versão antes de usar):

- `execute factory-reset2`: preserva parte da configuração, como interfaces e rotas.
- Em VMs, há opção para preservar a licença da VM (use `execute factory-reset ?` para ver as opções).

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

A GUI e a CLI são **duas janelas para a mesma configuração**. Tudo o que você muda na GUI aparece na CLI, e vice-versa. O trabalho do dia a dia acontece principalmente na GUI. A CLI entra em três situações:

- quando **não existe opção na GUI** para o que você precisa;
- quando a **saída de um comando é a ferramenta de diagnóstico** (debugs, tabela de sessões, estado do cluster);
- quando é **mais rápido ou mais seguro** consultar e comparar, como ao ver a configuração completa de um objeto.

Por isso, mesmo trabalhando pela GUI, você precisa entender como a CLI está organizada.

### 01.3.1. Navegação na GUI e acesso à CLI

#### Trabalhando com listas e objetos na GUI

Quase toda página de configuração da GUI segue o mesmo padrão:

:::slides
midia/m01/01-3-lista-objetos-1.png "Lista Policy & Objects > Addresses" | A lista **Policy & Objects > Addresses** mostra o padrão que se repete em quase toda a GUI: uma **lista** de objetos com botões de ação, busca e colunas.
midia/m01/01-3-lista-objetos-2.png "Botão Create new em destaque" | **Create new** cria um objeto. Os botões **Edit**, **Clone** e **Delete** ficam ativos quando um item é selecionado.
midia/m01/01-3-lista-objetos-3.png "Campo de busca em destaque" | A **busca** filtra a lista pelo texto digitado em qualquer coluna.
midia/m01/01-3-lista-objetos-4.png "Coluna Ref. em destaque" | A coluna **Ref.** mostra quantos objetos **usam** cada item. Clique no número para ver quem o referencia.
:::

#### Abrindo a CLI

Você pode acessar a CLI por três caminhos:

- **Console** (cabo serial);
- **SSH**, para um endereço com `ssh` habilitado em *Administrative Access*;
- **CLI Console da GUI**, pelo botão **CLI** (`>_`) da barra superior, opção **CLI Console**.

:::figura midia/m01/01-3-cli-console-gui.png "CLI Console aberta dentro da GUI, mostrando o prompt FGT-MTZ # e a saída de um comando"
A **CLI Console** abre um terminal dentro do navegador, com abas para várias sessões (botão **+**). Ela usa a sessão e as permissões do administrador logado na GUI.
:::

#### Comandos de consulta

Quatro famílias de comandos dominam a CLI:

| Comando | Para que serve |
|---|---|
| `show` | Mostra a **configuração**, só com os valores **diferentes do padrão**. |
| `show full-configuration` | Mostra a configuração **completa**, incluindo os valores padrão. |
| `get` | Mostra valores de configuração (incluindo os padrão) **e** informações de estado, como `get system status`. |
| `diagnose` / `execute` | `diagnose` faz diagnóstico (debugs, tabelas internas). `execute` executa ações (ping, backup, reboot). |

A diferença entre `show` e `show full-configuration` é uma das coisas mais úteis de entender cedo. Compare as duas saídas para a interface `mgmt`:

:::slides
midia/m01/01-3-cli-console-gui.png "Saída curta de show system interface mgmt" | **`show system interface mgmt`**: só o que foi alterado em relação ao padrão. É a forma de ver **o que alguém configurou**.
midia/m01/01-3-show-full.png "Saída longa de show full-configuration system interface mgmt" | **`show full-configuration system interface mgmt`**: dezenas de linhas, incluindo `mtu`, `speed` e `status up`, que estão no valor padrão. Use quando precisar saber **qual valor está valendo**.
:::

Os recursos que facilitam o uso no dia a dia, como filtrar saídas com `grep` e desligar a paginação, estão no Guia de comandos CLI deste capítulo.

### 01.3.2. Estrutura de comandos

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
| `unselect <atributo> <valor>` | Remove um valor de uma lista. |
| `unset <atributo>` | Devolve o atributo ao valor padrão. |
| `next` | Salva o item atual e continua na tabela. |
| `end` | Salva e sai do ramo. |
| `abort` | Sai **sem salvar** as alterações do item em edição. |
| `delete <item>` | Apaga um item da tabela. |

A diferença entre `set` e `append` causa muitos acidentes. Imagine uma interface com `allowaccess ping https ssh`:

```
set allowaccess snmp          # resultado: somente snmp (perdeu ping, https e ssh!)
append allowaccess snmp       # resultado: ping https ssh snmp
unselect allowaccess ssh      # resultado: ping https snmp
```

> **Atenção:** se você está conectado por HTTPS ou SSH através dessa interface e usa `set allowaccess` sem incluir o protocolo que está usando, **perde o acesso** ao salvar.

Para descobrir comandos e valores, use `?` (lista as opções naquele ponto) e **Tab** (completa o nome).

#### Quando a alteração passa a valer

- **Na CLI:** quando você salva o item com `next` ou `end`. Enquanto você digita `set` dentro do `edit`, nada mudou ainda no equipamento. É por isso que `abort` consegue descartar.
- **Na GUI:** quando você clica em **OK** ou **Apply**.

#### Referências entre objetos

Objetos do FortiOS se referenciam: um endereço é usado por uma policy, uma interface por uma rota, um perfil por uma policy. O FortiOS **não deixa apagar um objeto em uso**.

- **Na GUI:** a coluna **Ref.** mostra quantas referências o objeto tem, e clicar no número mostra quem o usa. O botão **Delete** fica indisponível ou retorna erro para objetos referenciados.
- **Fluxo correto:** para remover um objeto, primeiro remova ou altere quem o referencia; depois apague o objeto.

Esse comportamento evita que uma regra fique "apontando para nada", mas exige planejar a ordem das alterações.

#### Erros comuns

- Usar `set` em uma lista (como `allowaccess`) achando que vai acrescentar um valor, e com isso apagar os outros.
- Sair com `end` quando a intenção era descartar a alteração (`abort`).
- Achar que um atributo "não existe" porque não aparece no `show` (ele está no valor padrão).
- Tentar apagar um objeto em uso sem consultar as referências.

:::cli GUI e CLI
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
| `tree` | Mostra a estrutura de atributos do ramo atual. |

### Atalhos

- `?`: lista comandos ou valores possíveis. Exemplo: `set allowaccess ?`.
- **Tab:** completa comandos e nomes de objetos.
- **Abreviações:** `conf sys int` = `config system interface`, desde que não haja ambiguidade.
- **Seta para cima:** recupera comandos anteriores.

### Rede de segurança para mudanças remotas *(Aprofundamento)*

O FortiOS tem um modo em que as alterações não são gravadas automaticamente:

```
config system global
    set cfg-save revert
    set cfg-revert-timeout 600
end
```

No modo `revert`, se você não salvar explicitamente com `execute cfg save` dentro do tempo definido (em segundos), o equipamento volta à última configuração salva. É útil para mudanças remotas arriscadas. Teste o comportamento antes de usar em produção, porque a reversão envolve reinício.
:::

---

## 01.4. Configurações do sistema

### 01.4.1. Hostname, hora, NTP e DNS do sistema

#### Por que essas configurações vêm primeiro

- O **hostname** identifica o equipamento no prompt da CLI, na GUI, nos logs, no FortiAnalyzer, no Security Fabric e nos alertas. Com vários FortiGates, um bom padrão de nomes evita alterar o equipamento errado.
- A **hora** precisa estar correta por vários motivos:
  - **Certificados** têm validade. Com a hora errada, certificados válidos parecem expirados, e a inspeção SSL, as VPNs com certificado e a própria comunicação com o FortiGuard falham.
  - **Logs** precisam de horário correto para investigar incidentes e correlacionar eventos com outros sistemas.
  - **Tokens de MFA** (FortiToken) usam códigos baseados em tempo. Com a hora errada, o código é recusado.
  - **Autenticação no Active Directory** (Kerberos) e o **FSSO** dependem de hora sincronizada.
  - **Schedules** de firewall policies dependem do relógio do equipamento.
- O **DNS do sistema** é usado pelo **próprio FortiGate** para resolver nomes: falar com o FortiGuard, sincronizar NTP por nome, resolver objetos FQDN, enviar alertas por e-mail. Ele é diferente do serviço DNS que o FortiGate pode oferecer aos computadores da rede.

#### Na GUI: hostname e hora

:::slides
midia/m01/01-4-system-settings-1.png "Página System > Settings, aba General" | **System > Settings** tem quatro abas: **General** (hora, e-mail, modo de operação), **Access** (portas, timeout e política de senha dos administradores), **Device** e **Preference**.
midia/m01/01-4-system-settings-2.png "Campo Hostname em destaque" | **Hostname:** FGT-MTZ, o padrão de nomes da Atlas.
midia/m01/01-4-system-settings-3.png "Campo Time zone em destaque" | **Time zone:** o fuso horário da matriz, **America/Sao_Paulo**.
midia/m01/01-4-system-settings-4.png "Campo Set time em destaque" | **Set time:** a hora vem de **NTP**, sincronizada automaticamente.
midia/m01/01-4-system-settings-5.png "Campo Select server em destaque" | **Select server:** na GUI, o servidor NTP é o do **FortiGuard**. Servidores próprios são configurados pela CLI.
:::

#### Servidor NTP próprio: só pela CLI

Para usar servidores NTP próprios, como o **NTP.br** usado pela Atlas, a configuração é feita **pela CLI**. É um dos casos em que a CLI é necessária:

```
config system ntp
    set type custom
    config ntpserver
        edit 1
            set server "a.ntp.br"
        next
    end
end
```

:::figura midia/m01/01-4-ntp-cli.png "CLI Console com a configuração do servidor NTP a.ntp.br"
O servidor NTP da Atlas configurado pela CLI Console da GUI.
:::

> **Na prática:** sem acesso à Internet, a sincronização NTP só vai funcionar depois que houver rota e conectividade. Em redes isoladas, aponte para um servidor NTP interno.

#### Na GUI: DNS do sistema

:::slides
midia/m01/01-4-dns-1.png "Página Network > DNS" | Em **Network > DNS** fica o DNS usado pelo **próprio FortiGate**.
midia/m01/01-4-dns-2.png "Campo DNS servers em destaque" | **DNS servers:** **Use FortiGuard Servers** usa os servidores da Fortinet (96.45.45.45 e 96.45.46.46). **Specify** permite indicar servidores próprios, como o DNS do Active Directory.
midia/m01/01-4-dns-3.png "Protocolos de DNS em destaque" | **Protocolos:** o FortiGate pode consultar o DNS com transporte cifrado, **DNS over TLS** (DoT, porta 853) ou **DNS over HTTPS** (DoH), quando o servidor suporta. Com os servidores do FortiGuard, o padrão é DoT.
:::

#### Verificação

- **Hostname e hora:** confira no widget **System Information** do dashboard.
- **NTP:** com conectividade, o horário do widget deve coincidir com a hora real. O estado detalhado da sincronização é visto pela CLI.
- **DNS:** a forma mais simples de testar é pela CLI, pedindo um ping para um nome. Se o nome for resolvido para um endereço, o DNS está funcionando, mesmo que o ping não responda.

> **Dica para a prova:** diferencie o **DNS do sistema** (usado pelo próprio FortiGate) do **DNS server** em uma interface (o FortiGate respondendo às consultas dos computadores da rede).

### 01.4.2. Acesso administrativo

#### Conceito: gerência é tráfego destinado ao FortiGate

Quando você acessa a GUI por HTTPS ou a CLI por SSH, a conexão tem como **destino o próprio FortiGate**. Esse tipo de tráfego é chamado de **local-in**. Ele **não** é controlado pelas firewall policies comuns, que controlam o tráfego que **atravessa** o equipamento de uma rede para outra.

O acesso administrativo é controlado em camadas:

1. **Administrative Access da interface:** quais protocolos de gerência a interface aceita.
2. **Configurações de administração:** portas e tempo de inatividade.
3. **Trusted hosts:** de quais origens cada administrador pode fazer login.
4. **Local-in policies** (opcional): regras específicas para o tráfego destinado ao equipamento.

#### 1. Administrative Access por interface

Cada interface tem a lista de serviços administrativos que aceita:

| Opção | Uso |
|---|---|
| **PING** | Responder ICMP echo, útil para testes. |
| **HTTPS** | GUI. |
| **SSH** | CLI remota. |
| **HTTP** | GUI sem criptografia. Normalmente apenas redireciona para HTTPS; evite habilitar. |
| **SNMP** | Monitoramento por SNMP. |
| **FMG-Access** | Gerência pelo FortiManager. |
| **Security Fabric Connection** | Comunicação do Security Fabric. |
| **RADIUS Accounting** | Receber accounting RADIUS. |
| **Speed Test / Probe Response** | Testes de banda e probes de qualidade de link. |

:::figura midia/m01/01-4-admin-access.png "Edição da interface mgmt com Administrative Access HTTPS, SSH e PING marcados"
Em **Network > Interfaces**, na edição da interface **mgmt**, a seção **Administrative Access** tem só **HTTPS**, **SSH** e **PING** marcados: exatamente o que foi configurado pela console.
:::

Regra de ouro: **habilite somente o necessário, somente nas interfaces necessárias**. A interface WAN, especialmente, não deveria aceitar HTTPS e SSH de gerência vindos de qualquer lugar da Internet. Se a gerência remota for necessária, prefira acessar por VPN ou restrinja com trusted hosts e local-in policies.

> **Atenção:** se você está acessando a GUI por uma interface e desmarca o **HTTPS** dela, perde o acesso ao clicar em **OK**. Antes de alterar a interface que você está usando, tenha outro caminho (outra interface ou a console).

#### 2. Configurações de administração

Ficam em **System > Settings**, aba **Access**, seção **Administration settings**:

:::slides
midia/m01/01-4-administration-settings-1.png "Seção Administration settings da aba Access" | A seção **Administration settings** reúne as portas da GUI e do SSH e o tempo de inatividade da sessão administrativa.
midia/m01/01-4-administration-settings-2.png "Campo HTTPS port em destaque" | **HTTPS port:** a porta da GUI (padrão 443). Mudar a porta **não é** proteção real: um varredor de portas encontra o serviço em qualquer porta.
midia/m01/01-4-administration-settings-3.png "Campo Idle timeout com 15 minutos" | **Idle timeout:** a Atlas mudou de 5 para **15 minutos**. Depois desse tempo sem uso, a sessão é encerrada.
:::

| Opção | Efeito |
|---|---|
| **HTTPS port** | Porta da GUI (padrão 443). |
| **HTTP port** e **Redirect to HTTPS** | O acesso por HTTP é redirecionado para HTTPS. |
| **SSH port** | Porta do SSH (padrão 22). |
| **Idle timeout** | Minutos de inatividade até a sessão administrativa expirar (padrão 5). |

Se mudar a porta não protege, por que mudar? Para reduzir o ruído de ataques automatizados e, principalmente, para liberar a porta 443 quando outro serviço do FortiGate precisa dela, como um portal de VPN ou um servidor publicado. A proteção real vem de não expor a gerência e de restringir as origens.

> **Atenção:** ao mudar a porta HTTPS, o acesso passa a ser `https://10.10.99.1:<nova-porta>`. Mantenha a sessão atual aberta e teste em outra aba antes de encerrá-la.

#### 3. Trusted hosts

Trusted hosts são as **redes de origem permitidas para cada administrador**. São configurados na conta do administrador, em **System > Administrators**, com a opção **Restrict login to trusted hosts** (até dez redes).

:::figura midia/m01/01-5-admin-conta-3.png "Opção Restrict login to trusted hosts na criação de um administrador"
Na conta do administrador, **Restrict login to trusted hosts** limita as origens de login. Na Atlas, a rede de gerência `10.10.99.0/24`.
:::

Como funciona na prática:

- Um administrador com trusted hosts só consegue fazer login a partir dessas redes.
- Um administrador **sem** trusted hosts aceita login de qualquer origem.
- **Para que o FortiGate deixe de responder ao serviço de gerência para origens não autorizadas, todos os administradores precisam ter trusted hosts.** Se apenas uma conta estiver sem restrição, a página de login continua respondendo para todos, mesmo que as contas restritas sejam recusadas.

> **Dica para a prova:** trusted hosts são configurados **por administrador**. Para restringir de fato o acesso aos serviços de gerência, todas as contas precisam de trusted hosts.

> **Atenção:** antes de restringir trusted hosts, confirme o endereço de onde você está acessando. Configure primeiro em uma conta de teste, valide e só então aplique à sua conta. Em caso de erro, o acesso pela console continua disponível.

#### Banner de login (opcional)

Muitas políticas de segurança exigem um aviso legal antes do login. O FortiOS oferece um banner de pré-login, cujo texto é editado em **System > Replacement Messages**. Se a opção de habilitar o banner não aparecer na GUI da sua versão, use o comando do Guia de comandos CLI.

#### Verificação

1. Da estação 10.10.99.10, acesse a GUI e o SSH: devem funcionar.
2. De outra origem, ou por uma interface sem HTTPS em Administrative Access, tente acessar: não deve funcionar.
3. Consulte os eventos de login em **Log & Report > System Events**.

:::figura midia/m01/01-4-log-login.png "Log & Report > System Events com os eventos de login administrativo"
Os eventos de login administrativo mostram o usuário, o endereço de origem, o método (na console, `console`; pela GUI, `https(IP de origem)`) e o resultado. É a primeira evidência a consultar quando alguém não consegue entrar.
:::

#### Erros comuns

- Hora errada causando erros de certificado, MFA e FSSO, que parecem problemas de outra coisa.
- Configurar o DNS do sistema achando que isso faz o FortiGate responder DNS aos computadores.
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

O `?` lista os fusos disponíveis. A forma de representar o fuso pode variar entre versões; use a lista exibida.

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

- `type fortiguard`: usa os servidores NTP da Fortinet.
- `type custom`: usa os servidores listados em `ntpserver`.
- `syncinterval`: intervalo de sincronização, em minutos.

Para conferir o estado da sincronização:

```
diagnose sys ntp status
```

```saida
FGT-MTZ # diagnose sys ntp status
synchronized: no, ntpsync: enabled, server-mode: disabled

ipv4 server(a.ntp.br) 0.0.0.0 -- unreachable(0x0) S:1 T:1 selected
server-version=4, stratum=2
```

Mostra os servidores configurados, se estão alcançáveis e qual está sendo usado. Nesta saída, o servidor ainda está `unreachable`: o FGT-MTZ ainda não tem acesso à Internet.

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
...
log                 : disable
ocsp-stapling-request: enable
primary             : 96.45.45.45
protocol            : dot
retry               : 2
secondary           : 96.45.46.46
server-hostname     :
server-select-method: least-rtt
ssl-certificate     : Fortinet_Factory
timeout             : 5
```

Repare em `protocol: dot` (DNS over TLS) e em `cert-verify` e `ocsp-stapling-request`: o FortiGate valida o certificado do servidor DNS.

Para testar a resolução:

```
execute ping www.fortinet.com
```

Se o `execute ping` mostrar o endereço resolvido, a resolução está funcionando, mesmo que o ping não responda.

### Administrative Access por interface

```
config system interface
    edit "mgmt"
        set allowaccess ping https ssh
    next
end
```

Use `set allowaccess ?` para ver as opções da sua versão. Lembre da diferença entre `set` (substitui a lista) e `append` (acrescenta).

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

### Trusted hosts

```
config system admin
    edit "admin"
        set trusthost1 10.10.99.0 255.255.255.0
        set trusthost2 10.10.20.0 255.255.255.0
    next
end
```

Para conferir os trusted hosts de todas as contas de uma vez:

```
show system admin | grep -f trusthost
```

### Banner de pré-login

```
config system global
    set pre-login-banner enable
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

Separar conta e perfil permite criar perfis por função, como "Somente leitura", "Operador de firewall" ou "Analista de segurança", e associá-los a várias pessoas.

#### Perfis padrão

| Perfil | Permissões |
|---|---|
| `super_admin` | Acesso total, inclusive configurações globais, administradores e firmware. Não pode ser editado. |
| `prof_admin` | Acesso de leitura e escrita amplo, mas sem algumas configurações globais. Em equipamentos com VDOMs, limitado ao VDOM atribuído. |

:::figura midia/m01/01-5-admin-profiles.png "Lista System > Admin Profiles com os perfis padrão super_admin e prof_admin"
Num FortiGate de fábrica, **System > Admin Profiles** traz só os perfis padrão: **super_admin** e **prof_admin**.
:::

#### Como um perfil é organizado

Um perfil define, por **área** da GUI, o nível de permissão:

- **None:** a área nem aparece para a conta.
- **Read:** a conta vê, mas não altera.
- **Read/Write:** a conta vê e altera.
- **Custom:** algumas áreas permitem permissões mais finas. Em *Firewall*, por exemplo, é possível dar escrita em policies e só leitura em objetos.

As áreas são: Security Fabric, FortiView, User & Device, Firewall, Log & Report, Network, System, Security Profile, VPN, WAN Opt & Cache e WiFi & Switch.

#### Na GUI: criando um perfil somente leitura

:::slides
midia/m01/01-5-admin-profile-1.png "Novo perfil administrativo com as permissões por área" | Em **System > Admin Profiles > Create new**, cada **área** da GUI recebe um nível: **None**, **Read** ou **Read/Write**. Algumas áreas aceitam **Custom**.
midia/m01/01-5-admin-profile-2.png "Perfil Atlas-Leitura com Read em todas as áreas" | Com o atalho **Set All > Read**, a Atlas cria o perfil **Atlas-Leitura**, somente leitura em todas as áreas, para a equipe de suporte. Clique em **OK** para salvar.
:::

#### Na GUI: criando a conta

:::slides
midia/m01/01-5-admin-conta-1.png "Campo Username do novo administrador em destaque" | Em **System > Administrators > Create new > Administrator**, a conta **carla.suporte**. Use uma conta **por pessoa**: assim os logs mostram quem fez cada alteração.
midia/m01/01-5-admin-conta-2.png "Campo Administrator profile em destaque" | **Administrator profile:** a conta usa o perfil **Atlas-Leitura**. Um administrador **não pode conceder mais privilégios do que tem**.
midia/m01/01-5-admin-conta-3.png "Opção Restrict login to trusted hosts em destaque" | **Restrict login to trusted hosts:** limita as origens de login desta conta à rede de gerência.
:::

Contas autenticadas em servidores externos (LDAP, RADIUS) ou por certificado também são possíveis. Elas dependem dos servidores de autenticação, assunto de um módulo próprio.

#### Regras importantes

- **Um administrador não pode conceder mais do que tem.** Uma conta sem permissão de escrita em System não consegue criar outros administradores.
- **Use uma conta por pessoa.** Assim os logs mostram quem fez cada alteração.
- **Mantenha pelo menos duas contas `super_admin`** com senhas guardadas separadamente, ou uma conta de emergência em cofre. Se a única conta `super_admin` for bloqueada, restam a conta maintainer ou o reset.
- **Teste em uma segunda sessão.** Ao criar ou restringir uma conta, faça login com ela em uma janela anônima do navegador, **sem fechar** a sessão atual de `super_admin`. Se algo estiver errado, você corrige pela sessão que continua aberta.

#### Verificação

- Faça login com `carla.suporte` em uma janela anônima: ela vê a configuração, mas não consegue alterar.
- O widget **Administrators** do dashboard mostra quem está conectado e por qual método (HTTPS, SSH, console).
- Toda alteração gera um log com o administrador, a origem e o que foi alterado, em **Log & Report > System Events**.

### 01.5.2. Proteção das contas

#### Política de senha

A política de senha dos administradores fica em **System > Settings**, aba **Access**, seção **Security**:

:::figura midia/m01/01-5-password-policy.png "Seção Security da aba Access com a política de senha dos administradores"
Na seção **Security**, você define o tamanho mínimo, os tipos de caracteres exigidos, o histórico de senhas e a expiração. A política pode valer para senhas de administradores e para chaves pré-compartilhadas de VPN (**Password scope**).
:::

A política vale para as **próximas** definições de senha. Senhas existentes que não atendem à regra serão exigidas na próxima troca.

#### Bloqueio por tentativas

Para dificultar ataques de força bruta, o FortiGate bloqueia temporariamente a origem depois de várias tentativas de login falhas. Por padrão, são **3 tentativas** e **60 segundos** de bloqueio. Esses valores são ajustados **somente pela CLI** (veja o Guia de comandos CLI).

#### Timeout de sessão

O **Idle timeout** encerra sessões inativas. Sessões esquecidas abertas são um risco, principalmente em computadores compartilhados.

#### E a conta `admin`?

A conta `admin` é conhecida por todos, inclusive por quem ataca. Boas práticas:

- crie contas nominais `super_admin` para as pessoas responsáveis;
- depois de testá-las, considere **remover** a conta `admin` (o FortiOS permite apagá-la desde que exista outro `super_admin`) ou, no mínimo, mantê-la com senha forte, trusted hosts restritos e guardada como conta de emergência;
- **nunca** use a conta `admin` no dia a dia.

> **Dica para a prova:** diferencie conta (System > Administrators) de perfil (System > Admin Profiles), conheça os perfis padrão `super_admin` e `prof_admin` e as proteções disponíveis: trusted hosts, bloqueio por tentativas e política de senha.

#### Erros comuns

- Usar a conta `admin` para todos os administradores, o que impede saber quem fez cada alteração.
- Criar um perfil restrito e testá-lo na mesma sessão do `super_admin`.
- Deixar só uma conta com perfil `super_admin`.
- Dar permissão de escrita em System "para facilitar", permitindo que a conta crie outros administradores.

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

Os valores são `none`, `read`, `read-write` e, em algumas áreas, `custom`.

Perfil somente leitura:

```
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

As áreas não citadas ficam no valor padrão. Confira com:

```
show full-configuration system accprofile "Atlas-Leitura"
```

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

### Quem está conectado

```
get system admin list
```

Lista as sessões administrativas ativas, com usuário, método de acesso, interface e origem.

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

## 01.6. Licenciamento e FortiGuard

### 01.6.1. Como o FortiGate é licenciado

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
| **FortiCare Essentials** | Modelos de entrada, ambientes menos críticos | Suporte em horário comercial e troca do equipamento após o envio do defeituoso. |
| **FortiCare Premium** | A maioria dos ambientes de produção | Suporte 24x7 para problemas críticos e troca antecipada do equipamento (*advance replacement*). |
| **FortiCare Elite** | Ambientes muito críticos | Tudo do Premium, com tempo de resposta mais curto para problemas críticos e atendimento com mais prioridade. |

> **Na prática:** confira os tempos de resposta e as condições de troca no datasheet ou com o seu distribuidor. Sem contrato FortiCare válido, você não baixa firmware novo nem abre chamado, mesmo que o equipamento continue funcionando.

#### Serviços FortiGuard: bundles e à la carte

Os serviços FortiGuard podem ser comprados de duas formas:

- **Em pacotes (*bundles*):** um conjunto de serviços com um único contrato. É a forma mais comum e costuma sair mais barato do que comprar os mesmos serviços separadamente.
- **À la carte:** cada serviço comprado individualmente, por exemplo só o IPS ou só o Web Filter. É útil quando a empresa precisa de um serviço específico ou quer **acrescentar** a um bundle um serviço que ele não inclui.

Os bundles mais conhecidos são três, em níveis crescentes:

| Bundle | O que inclui |
|---|---|
| **ATP** (*Advanced Threat Protection*) | FortiCare + **IPS** + **Advanced Malware Protection** (antivírus, bases de botnet, prevenção de surtos e consulta ao sandbox em nuvem). |
| **UTP** (*Unified Threat Protection*) | Tudo do ATP + **filtragem de URL, DNS e vídeo** (Web Filter e DNS Filter) + **antispam**. |
| **Enterprise Protection** | Tudo do UTP + serviços avançados, como prevenção de malware com IA em linha (*inline*), **DLP**, **IoT Security**, **Security Rating** e FortiConverter. |

Alguns serviços são vendidos **só à la carte**, fora dos bundles: por exemplo, OT Security, FortiAnalyzer Cloud, FortiManager Cloud, FortiGate Cloud, monitoramento de qualidade de links SD-WAN e o SOC como serviço (SOCaaS).

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

O equipamento é registrado no portal **FortiCloud** (support.fortinet.com) pelo número de série. É no registro que os contratos são vinculados ao equipamento. Em VMs, a licença é aplicada por um arquivo de licença ou por um token, conforme o modelo de licenciamento.

#### Na GUI: verificando as licenças

O widget **Licenses** do dashboard e a página **System > FortiGuard** mostram o que o equipamento tem, o que pode comprar e o que venceu. Acompanhe o FGT-MTZ em três situações: só com FortiCare, com o bundle UTP e com o UTP vencido.

:::slides
midia/m01/01-6-licencas-widget.png "Widget Licenses com Support e Updates em verde e os serviços de segurança em cinza" | **Só FortiCare:** no widget **Licenses**, **Support** e **Updates** estão verdes (o contrato FortiCare). IPS, AntiVirus, Web Filter e Rating estão **cinza**: não licenciados.
midia/m01/01-6-fortiguard.png "Página System > FortiGuard, aba Licensed" | Em **System > FortiGuard**, a aba **Licensed** detalha o que está ativo. Aqui, só as assinaturas da base FortiCare, com o status e a data de expiração.
midia/m01/01-6-fortiguard-disponiveis.png "Página System > FortiGuard, aba Available for purchase" | A aba **Available for purchase** lista os serviços que o equipamento **não tem** e que podem ser comprados: IPS, Advanced Malware Protection, URL, DNS & Video Filtering e outros.
midia/m01/01-6-licencas-utp.png "Widget Licenses com o bundle UTP: IPS, AntiVirus e Web Filter em verde" | **Com o bundle UTP:** IPS, AntiVirus e Web Filter ficam **verdes**. Rating continua cinza, porque o Security Rating faz parte do bundle Enterprise, não do UTP.
midia/m01/01-6-licencas-expiradas.png "Widget Licenses com IPS, AntiVirus e Web Filter em vermelho" | **UTP vencido:** os serviços do bundle ficam **vermelhos**. Support e Updates continuam verdes, porque o contrato FortiCare é separado e ainda está válido.
midia/m01/01-6-fortiguard-expiradas.png "Página System > FortiGuard, aba Expired, com as assinaturas vencidas" | A aba **Expired** mostra cada assinatura vencida e a data em que expirou. É aqui que você confirma o que precisa ser renovado.
:::

O que acontece quando uma licença vence:

- as **bases locais** (antivírus, IPS) **param de ser atualizadas**, mas a última versão baixada continua em uso;
- as **consultas em tempo real** (Web Filter, DNS Filter) **deixam de responder**, e os sites ficam sem categoria;
- os perfis continuam configurados, mas protegem cada vez menos.

### 01.6.2. FortiGuard: de onde vem a proteção

#### FortiGuard Labs

O **FortiGuard Labs** é a organização de inteligência e pesquisa de ameaças da Fortinet, com sede no Canadá. Seus pesquisadores e sistemas de IA analisam ameaças do mundo todo e produzem as assinaturas de antivírus e IPS, as categorias de sites, as listas de botnets e as demais bases que o FortiGate usa.

Para o FortiGate usar esses serviços, são necessárias duas coisas: **uma assinatura ativa** e **acesso à Internet**.

#### FortiGuard Distribution Network (FDN)

As atualizações chegam pela **FortiGuard Distribution Network (FDN)**, a rede de servidores da Fortinet espalhada pelo mundo. O FortiGate fala com a FDN de duas formas diferentes, e é importante distingui-las:

1. **Download de pacotes (AV, IPS, aplicações, ISDB):** as bases são **baixadas** por **TCP** (HTTPS) e ficam no equipamento, normalmente uma vez por dia ou conforme o agendamento. Os perfis consultam essa cópia local. Se o FortiGuard ficar inacessível por um tempo, o antivírus e o IPS continuam funcionando com a última base baixada, só que desatualizados.
2. **Consultas em tempo real (Web Filtering, DNS Filtering, Antispam):** a cada novo site, domínio ou e-mail, o FortiGate **pergunta** ao FortiGuard qual é a classificação, por **UDP** ou **HTTPS**. Existe cache, mas sem a consulta não há categoria para sites novos. O perfil então aplica a ação configurada para **erro de rating** (permitir ou bloquear).

Essa diferença explica sintomas diferentes: sem comunicação com o FortiGuard, o antivírus continua bloqueando vírus conhecidos, mas o Web Filter pode deixar passar (ou bloquear) todos os sites sem classificação.

#### Como o FortiGate alcança os servidores

- **Anycast:** por padrão, o FortiGate acessa os servidores do FortiGuard por endereços **anycast**. O mesmo endereço é anunciado em vários pontos do mundo, e a rede encaminha cada consulta ao **servidor mais próximo**, com menor latência.
- **Certificados verificados:** na comunicação com o FortiGuard, o FortiGate **valida o certificado SSL** apresentado pelo servidor, emitido por uma autoridade certificadora de terceiros, e confere se ele não foi revogado usando **OCSP stapling**. Isso impede que alguém se passe pelo FortiGuard.
- **DNS com DoT:** quando o FortiGate usa o FortiGuard como servidor DNS (96.45.45.45 e 96.45.46.46), as consultas vão por **DNS over TLS (DoT)**, criptografadas.

#### Na GUI: atualizações

:::figura midia/m01/01-6-updates.png "Aba FortiGuard settings com o agendamento das atualizações e as opções de filtragem e servidores"
Na aba **FortiGuard settings** ficam o agendamento das atualizações (**Scheduled updates**), as opções de consulta de rating (protocolo e porta) e os servidores FortiGuard usados.
:::

Em redes que restringem a saída, essas opções definem o que precisa ser liberado no firewall de borda.

#### Pré-requisitos para funcionar

Para o FortiGuard funcionar, o FortiGate precisa:

1. **de rota** até a Internet;
2. **de DNS do sistema** funcionando;
3. **de hora correta**, porque a comunicação usa certificados;
4. **de saída liberada** no caminho, se houver outro firewall ou proxy antes da Internet;
5. **de licença válida** para o serviço.

Quando a atualização falha, verifique nessa ordem. A verificação de rota, DNS e hora e o acompanhamento detalhado da atualização são feitos pela CLI (veja o Guia de comandos CLI).

#### Diferencie três situações

| Situação | Como identificar | Efeito |
|---|---|---|
| **Licença vencida** | Serviço em vermelho no widget Licenses e na aba Expired | As bases deixam de ser atualizadas; o rating de Web Filter para de responder |
| **Base desatualizada** (licença válida) | Licença verde, mas data da última atualização antiga | Proteção desatualizada, por problema de comunicação |
| **Falha de rating** | Web Filter registra erros de rating; as atualizações podem estar funcionando | Sites sem categoria; o perfil aplica a ação de erro de rating |

> **Dica para a prova:** as bases de AV e IPS são locais (baixadas por TCP). Web Filter, DNS Filter e Antispam dependem de consulta em tempo real ao FortiGuard (UDP ou HTTPS).

#### Erros comuns

- Supor que o perfil protege mesmo com a licença vencida ou sem comunicação com o FortiGuard.
- Achar que vencer o bundle de segurança também tira o suporte FortiCare, ou o contrário: são contratos separados.
- Investigar o FortiGuard sem antes verificar rota, DNS e hora do equipamento.
- Confundir falha de download de bases com falha de consulta de rating.

:::cli Licenciamento e FortiGuard
### Versões das bases e contratos

```
diagnose autoupdate versions
```

```saida
FGT-MTZ # diagnose autoupdate versions
AV Engine
---------
Version: 7.00041
Contract Expiry Date: 2026/10/31
Last Updated using scheduled update on Fri Oct 30 10:22:12 2026
Last Update Attempt: Mon Nov  9 10:12:12 2026
Result: Unauthorized

Virus Definitions
---------
Version: 94.09321
Contract Expiry Date: 2026/10/31
Last Updated using scheduled update on Fri Oct 30 10:22:12 2026
Last Update Attempt: Mon Nov  9 10:12:12 2026
Result: Unauthorized
...
```

Lista cada base (AV, IPS, aplicações, ISDB e outras) com a versão, a data da última atualização, o resultado da última tentativa e a **data de expiração do contrato**. É o comando para responder "minha base está atualizada?" e "minha licença venceu?". Nesta saída, o contrato venceu em 2026/10/31: a base continua na versão 94.09321, e as novas tentativas de atualização são recusadas (`Unauthorized`).

### Estado do Web Filter

```
get webfilter status
```

```saida
FGT-MTZ # get webfilter status
Locale       : english
Service      : Web-filter
Status       : Disable
License      : Unlicensed
```

### Agendamento e atualização imediata

```
config system autoupdate schedule
    set status enable
    set frequency automatic
end
```

Use `set frequency ?` para ver as opções. Para forçar a atualização:

```
execute update-now
```

### Como o FortiGate encontra o FortiGuard

```
config system fortiguard
    show full-configuration
end
```

Mostra, entre outras opções, `fortiguard-anycast`, o protocolo e a porta usados para atualizações e consultas.

### Diagnóstico de falha de atualização

Verifique os pré-requisitos na ordem:

```
get router info routing-table all     # existe rota padrão?
execute ping update.fortiguard.net    # resolve o nome e alcança?
execute time                          # a hora está correta?
diagnose autoupdate versions          # resultado da última tentativa e expiração
```

Para ver a atualização acontecendo em detalhe:

```
diagnose debug application update -1
diagnose debug enable
execute update-now
```

A saída mostra a conexão com o servidor, a validação do contrato e o download de cada base. Ao terminar, **desligue o debug**:

```
diagnose debug disable
diagnose debug reset
```

> **Atenção:** debugs consomem recursos e geram muita saída. Sempre os desligue ao terminar.
:::

---

## 01.7. Backup, restauração e firmware

### 01.7.1. Backup e restauração

#### Conceito: o que é o arquivo de configuração

Toda a configuração do FortiGate (interfaces, policies, objetos, VPNs, usuários, certificados) fica em **um único arquivo de texto**. O backup é a cópia desse arquivo.

A primeira linha do arquivo identifica de onde ele veio:

```
#config-version=FGT121G-7.06-FW-buildXXXX-XXXXXX:opmode=0:vdom=0:user=admin
```

Ela informa o **modelo**, a **versão e o build** do FortiOS, o modo de operação, se há VDOMs e quem gerou o backup. Essas informações importam na hora de restaurar.

#### Backup comum e backup criptografado

O arquivo contém informações sensíveis: hashes de senhas de administradores, segredos de VPN, senhas de servidores LDAP e RADIUS e chaves privadas de certificados. Mesmo em um backup comum, esses segredos não aparecem em texto aberto: são armazenados de forma cifrada ou como hash (você verá linhas como `set password ENC ...`). Ainda assim, **o arquivo deve ser tratado como segredo**: com ele, alguém pode recriar o seu firewall em outro equipamento ou tentar quebrar os segredos offline.

Por isso existe o **backup criptografado**: ao gerar o backup, você define uma senha, e o arquivo inteiro é cifrado. Para restaurar, a senha é obrigatória.

| Tipo | Vantagem | Cuidado |
|---|---|---|
| Comum | Legível; fácil de comparar e consultar | Guardar com o mesmo cuidado de uma senha |
| Criptografado | Protege o arquivo inteiro | Sem a senha, o backup é inútil; guarde a senha separada do arquivo |

#### Na GUI: fazendo o backup

:::slides
midia/m01/01-7-backup-passo-1.png "Menu do administrador aberto com o item Configuration em destaque" | Clique no **nome do administrador**, no canto superior direito, e depois em **Configuration**.
midia/m01/01-7-backup-passo-2.png "Submenu Configuration com o item Backup em destaque" | O submenu **Configuration** tem **Backup**, **Restore** e **Reset to factory defaults**. Clique em **Backup**.
midia/m01/01-7-backup-1.png "Tela Backup System Configuration" | A tela **Backup System Configuration** define o destino e a criptografia do arquivo.
midia/m01/01-7-backup-2.png "Opção Backup to em destaque" | **Backup to:** o computador do administrador (**Local PC**) ou um pendrive ligado ao FortiGate (**USB Disk**).
midia/m01/01-7-backup-3.png "Opção Encryption ativada em destaque" | **Encryption:** com a opção ativada, o arquivo inteiro é cifrado com uma senha. Sem ela, o backup não pode ser restaurado.
midia/m01/01-7-backup-4.png "Campos de senha do backup em destaque" | **Password** e **Confirm password:** a senha do backup. Guarde-a **separada** do arquivo e clique em **OK** para baixar.
:::

> **Na prática:** mantenha cópias **fora do equipamento**, feitas antes de toda mudança relevante e, idealmente, automatizadas (por exemplo, pelo FortiManager).

#### Revisões de configuração

Além do backup manual, o FortiGate pode guardar **revisões** internas da configuração, quando há armazenamento disponível. Em **Configuration > Revisions** (menu do administrador), você vê as revisões, compara duas delas e restaura uma revisão. O FortiGate também pode criar revisões automaticamente quando um administrador sai e antes de uma atualização de firmware. Essas opções são ativadas pela CLI.

Revisões internas não substituem o backup externo: se o equipamento queimar, as revisões vão com ele.

#### Na GUI: restauração

No **menu do administrador > Configuration > Restore**, selecione o arquivo e informe a senha, se o backup for criptografado:

:::figura midia/m01/01-7-restore.png "Tela Restore System Configuration com o botão Upload e o campo Password"
Em **Restore System Configuration**, clique em **Upload** para escolher o arquivo e preencha **Password** se o backup for criptografado. Ao clicar em **OK**, a configuração atual é substituída e o equipamento reinicia.
:::

Regras de restauração:

- **Mesmo modelo:** a restauração é direta.
- **Modelo diferente:** o FortiOS normalmente recusa o arquivo, porque os nomes das interfaces e os recursos de hardware diferem. A migração entre modelos exige adaptar a configuração (nomes de portas, interfaces inexistentes) ou usar ferramentas de conversão, sempre como um procedimento planejado.
- **Versão diferente de firmware:** restaurar um backup de outra versão pode funcionar com conversão, mas há risco de perder ou alterar configurações. O ideal é restaurar no mesmo build em que o backup foi gerado.

> **Atenção:** a restauração **substitui** toda a configuração atual e reinicia o equipamento. Se o backup tiver outro endereço de gerência ou outras restrições de acesso, você pode perder o acesso pela rede, então tenha a console à mão.

### 01.7.2. Ciclo de firmware

#### Versões do FortiOS

O FortiOS segue o formato **major.minor.patch**, por exemplo 7.6.4:

- **major.minor** (7.6): a "família" da versão, com seu conjunto de recursos;
- **patch** (.4): correções e alguns ajustes dentro da família;
- **build**: o número exato da imagem compilada (aparece no widget System Information).

A Fortinet classifica as versões como **Feature** (com recursos novos, ainda amadurecendo) e **Mature** (estáveis, recomendadas para produção). Em produção, a recomendação geral é usar versões Mature, a menos que você precise de um recurso específico.

#### O que ler antes de atualizar: o release notes

Antes de qualquer atualização, leia o **release notes** da versão de destino. Ele traz:

- **Supported upgrade path:** de quais versões é possível atualizar diretamente;
- **Changes in default behavior / changes in CLI:** o que muda de comportamento ou de comando;
- **Known issues:** problemas conhecidos que podem afetar o seu ambiente;
- **Resolved issues:** o que foi corrigido;
- **Product integration and support:** compatibilidade com FortiAnalyzer, FortiManager, FortiClient, FortiSwitch, FortiAP e outros;
- **Recursos removidos ou alterados**, inclusive limitações por modelo.

#### Upgrade path

Não se deve "pular" livremente de uma versão antiga para uma muito nova. Cada salto converte a configuração, e algumas conversões só funcionam a partir de versões intermediárias. A Fortinet oferece a ferramenta **Upgrade Path** no portal de suporte: você informa o modelo, a versão atual e a de destino, e ela mostra a sequência de versões intermediárias recomendada.

> **Dica para a prova:** atualizar fora do caminho recomendado pode causar perda ou corrupção de configuração. Siga o upgrade path e faça backup antes.

#### Procedimento de atualização

1. **Planeje:** escolha a versão, leia o release notes, consulte o upgrade path e verifique a compatibilidade dos produtos integrados.
2. **Faça backup** da configuração e guarde fora do equipamento.
3. **Registre o estado atual:** versão, recursos em uso e alguns testes de referência (acesso à Internet, VPN ativa, autenticação), para comparar depois.
4. **Agende uma janela de manutenção:** o equipamento reinicia.
5. **Atualize pela GUI.**
6. **Valide:** confira a versão no widget System Information, repita os testes de referência, verifique os logs de eventos e compare a configuração com o backup.

:::figura midia/m01/01-7-firmware.png "Página System > Firmware & Registration com o FGT-MTZ, sua versão e o status de atualização"
**System > Firmware & Registration** mostra a versão de cada equipamento, o registro e o status de atualização.
:::

Para atualizar pela GUI:

1. Selecione o equipamento e clique em **Upgrade**.
2. Escolha a versão. As imagens oficiais vêm do FortiGuard, ou você pode enviar um arquivo baixado do portal de suporte.
3. A GUI mostra o caminho de atualização, inclusive versões intermediárias, e oferece fazer o **backup** antes. Confirme.
4. Após o reinício, confirme a nova versão no widget **System Information** e execute os testes de validação.

O FortiOS verifica a **assinatura digital** da imagem e alerta se ela não for oficial da Fortinet. Baixe imagens somente do FortiGuard ou do portal de suporte.

#### Plano de retorno: as duas partições

A maioria dos FortiGates físicos tem **duas partições de firmware**. Ao atualizar, a nova imagem é gravada em uma partição e a anterior fica preservada na outra. Isso permite voltar rapidamente à versão anterior escolhendo de qual partição o equipamento vai iniciar no próximo boot. Essa operação é feita pela CLI.

Mesmo assim, **mantenha o backup** feito na versão anterior: ao voltar, você pode precisar restaurar a configuração exata daquele momento.

#### Downgrade

Voltar para uma versão mais antiga (downgrade) é possível, mas a configuração convertida para a versão nova pode não ser compreendida pela antiga, e parte dela pode se perder. O procedimento recomendado é instalar a versão antiga e **restaurar o backup gerado naquela versão**.

### 01.7.3. Recuperação de firmware *(Aprofundamento)*

Se o firmware estiver corrompido e o equipamento não inicializar, ainda é possível instalar uma imagem pelo **menu de boot** (BIOS), acessado pela console:

1. Prepare um **servidor TFTP** com a imagem, conectado diretamente à porta que o menu de boot usa para TFTP (normalmente a porta de gerência ou uma porta interna; varia por modelo).
2. Conectado à console, reinicie o equipamento e **interrompa o boot** pressionando uma tecla quando a mensagem aparecer.
3. No menu, configure os parâmetros TFTP (IP do servidor, IP local temporário, máscara, nome do arquivo) e inicie a transferência. As letras e opções do menu variam entre modelos e versões de BIOS; a opção de ajuda do menu lista todas.
4. Ao final, o equipamento grava a imagem e reinicia.

O menu de boot também tem a opção de **formatar** o dispositivo de boot, que apaga firmware e configuração. Use somente quando for essa a recomendação, e com o backup em mãos.

> **Atenção:** a recuperação pelo menu de boot é um procedimento de emergência. Faça com calma, pela console, com a imagem correta para o seu modelo e um backup disponível.

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

Quando a senha é informada, o arquivo é criptografado. Além de TFTP, há outros destinos, como FTP e USB, conforme a versão. Use `execute backup config ?` para ver as opções.

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

Iniciar pela outra partição no próximo boot:

```
execute set-next-reboot secondary
execute reboot
```

Em VMs, a saída e o comportamento podem ser diferentes.
:::

---

## Questões de revisão

:::quiz
Um administrador executa `show system interface port1` e não vê a linha `set mtu`. O que isso significa?

- [ ] A interface não suporta configuração de MTU.
- [x] O MTU está no valor padrão; para vê-lo, é preciso usar `show full-configuration` ou `get`.
- [ ] O MTU foi apagado e a interface está sem MTU.
- [ ] O comando `show` só exibe atributos de interfaces lógicas.
> O `show` exibe somente os valores **diferentes do padrão**. O MTU existe e está valendo, só que no valor padrão. `show full-configuration` e `get` mostram também os valores padrão.
:::

:::quiz
Uma interface tem `allowaccess ping https ssh`. O administrador entra na interface, executa `set allowaccess snmp` e salva. Qual é o resultado?

- [ ] `ping https ssh snmp`
- [x] `snmp`
- [ ] `ping https ssh`, porque o SNMP precisa ser habilitado globalmente antes
- [ ] O comando é rejeitado por conflito com os valores existentes
> Em atributos que são listas, `set` **substitui a lista inteira**. Para acrescentar o SNMP mantendo os demais, o comando correto seria `append allowaccess snmp`. Se o administrador estivesse conectado por HTTPS ou SSH através dessa interface, perderia o acesso ao salvar.
:::

:::quiz
Todos os administradores de um FortiGate, exceto um, têm trusted hosts configurados para 10.10.99.0/24. O que acontece quando alguém de fora dessa rede acessa a GUI?

- [ ] A conexão é bloqueada antes de exibir a página de login.
- [x] A página de login responde, e só a conta sem trusted hosts consegue fazer login de fora dessa rede.
- [ ] Ninguém consegue fazer login, porque basta uma conta com trusted hosts para restringir todas.
- [ ] Todos conseguem fazer login, porque trusted hosts só valem para SSH.
> Trusted hosts são configurados **por administrador**. Como uma conta não tem restrição, o FortiGate continua respondendo à página de login para qualquer origem, e essa conta consegue entrar de qualquer lugar. Para o serviço deixar de responder a origens não autorizadas, **todas** as contas precisam de trusted hosts.
:::

:::quiz
Sobre a recuperação de senha com a conta `maintainer` em um FortiGate físico, quais afirmações estão corretas? (Escolha duas.)

- [x] Exige acesso pela console e um reinício por ciclo de energia.
- [ ] Funciona por SSH a partir de qualquer interface com SSH habilitado.
- [x] Pode ser desabilitada pelo administrador.
- [ ] Apaga toda a configuração do equipamento.
> A conta maintainer exige **acesso físico**: console e desligar e ligar o equipamento na energia (*hard reboot*). Ela não apaga a configuração, apenas permite redefinir a senha. Como é um risco em ambientes muito sensíveis, pode ser desabilitada; nesse caso, sobra o reset de fábrica.
:::

:::quiz
Observe o widget Licenses de um FortiGate:

![Widget Licenses com Support e Updates em verde e IPS, AntiVirus e Web Filter em vermelho](midia/m01/01-6-licencas-expiradas.png)

Qual afirmação descreve corretamente a situação?

- [ ] O equipamento perdeu o suporte FortiCare e não pode mais baixar firmware.
- [x] O contrato dos serviços de segurança venceu: as bases de antivírus e IPS param de ser atualizadas e as consultas do Web Filter deixam de responder.
- [ ] O antivírus e o IPS param de funcionar imediatamente, sem nenhuma base.
- [ ] O equipamento nunca teve licença de Web Filter.
> Os blocos em vermelho indicam serviços **expirados**. As bases locais de antivírus e IPS continuam na última versão baixada, mas não recebem atualizações. O Web Filter depende de consulta em tempo real e deixa de classificar sites. **Support** e **Updates** estão verdes porque o contrato FortiCare é separado e continua válido. Um serviço que nunca foi contratado aparece em cinza, não em vermelho.
:::

:::quiz
Um FortiGate com licenças válidas perdeu a comunicação com o FortiGuard há dois dias. Qual é o efeito mais provável?

- [ ] O antivírus e o IPS param de funcionar imediatamente.
- [x] O antivírus e o IPS continuam funcionando com as últimas bases baixadas; o Web Filter pode falhar ao classificar sites novos e aplica a ação de erro de rating.
- [ ] Nada muda, porque todas as funções usam somente bases locais.
- [ ] O FortiGate bloqueia todo o tráfego até a comunicação voltar.
> As bases de AV e IPS são **baixadas** e usadas localmente, então continuam funcionando (desatualizadas). O Web Filter depende de **consulta em tempo real** ao FortiGuard: sem resposta, os sites novos ficam sem categoria e o perfil aplica a ação configurada para erro de rating.
:::

:::quiz
Como o FortiGate se comunica com a FortiGuard Distribution Network (FDN)? (Escolha duas.)

- [x] Os pacotes de antivírus e IPS são baixados por TCP.
- [ ] Os pacotes de antivírus e IPS são consultados em tempo real a cada arquivo inspecionado.
- [x] As consultas de Web Filtering e DNS Filtering usam UDP ou HTTPS.
- [ ] Todas as comunicações com o FortiGuard usam apenas ICMP.
> O FortiGate **baixa** os pacotes de AV e IPS por TCP (HTTPS) e os usa localmente. Já as classificações de Web Filtering, DNS Filtering e Antispam são **consultas em tempo real**, feitas por UDP ou HTTPS. Por padrão, os servidores são acessados por endereços anycast, que levam ao servidor mais próximo.
:::

:::quiz
Uma empresa precisa de IPS, antivírus e filtragem web por categorias, sem os serviços avançados como DLP e IoT Security. Qual bundle FortiGuard atende com o menor nível?

- [ ] ATP (Advanced Threat Protection)
- [x] UTP (Unified Threat Protection)
- [ ] Enterprise Protection
- [ ] Apenas o FortiCare Premium
> O **ATP** inclui IPS e proteção contra malware, mas não a filtragem web. O **UTP** acrescenta a filtragem de URL, DNS e vídeo e o antispam, atendendo à necessidade. O **Enterprise** inclui serviços avançados que a empresa não precisa. O FortiCare sozinho dá suporte e algumas bases essenciais, mas não IPS, antivírus nem Web Filter.
:::

:::quiz
Qual comando mostra, em uma única saída, a versão do FortiOS, o número de série, o modo de operação e o modo de HA?

- [ ] `get system performance status`
- [ ] `show system global`
- [x] `get system status`
- [ ] `diagnose autoupdate versions`
> `get system status` reúne versão e build, número de série, modo de operação (NAT ou Transparent), estado de VDOM, modo de HA e as versões das bases. `get system performance status` mostra CPU, memória e sessões; `diagnose autoupdate versions` mostra as bases e os contratos.
:::

:::quiz
Um administrador entrou em `config firewall address`, editou um objeto, alterou dois atributos e percebeu que estava no objeto errado. Como sair sem gravar as alterações desse objeto?

- [ ] `end`
- [ ] `next`
- [x] `abort`
- [ ] `unset all`
> Na CLI, a alteração só é gravada quando o item é salvo com `next` ou `end`. O `abort` sai do item **sem gravar**. `unset` devolve atributos ao valor padrão, o que também alteraria o objeto.
:::

:::quiz
Um administrador tenta apagar um objeto de endereço e a GUI não permite. A coluna **Ref.** do objeto mostra o número 2. O que ele deve fazer?

- [ ] Fazer o backup e restaurar a configuração sem o objeto.
- [x] Clicar no número da coluna Ref. para ver quem usa o objeto, remover essas referências e depois apagar o objeto.
- [ ] Apagar o objeto pela CLI, que não verifica referências.
- [ ] Desabilitar o objeto em Feature Visibility.
> O FortiOS não deixa apagar um objeto em uso, nem pela GUI nem pela CLI. A coluna **Ref.** mostra quantos objetos o referenciam, e clicar no número mostra quais. O fluxo correto é alterar ou remover quem usa o objeto e só então apagá-lo.
:::

:::quiz
Um recurso descrito no Administration Guide não aparece no menu da GUI. Qual deve ser a primeira verificação?

- [ ] Fazer upgrade para a versão mais recente.
- [x] Conferir se o recurso está oculto em Feature Visibility.
- [ ] Fazer reset de fábrica para restaurar os menus.
- [ ] Reinstalar o firmware pelo menu de boot.
> Muitos recursos ficam **ocultos por padrão** em System > Feature Visibility para deixar a GUI mais limpa. Eles existem e funcionam, só não aparecem no menu. Depois disso, vale conferir o modelo, a licença e o release notes da versão.
:::

:::quiz
Um administrador com um perfil sem permissão de escrita em System tenta criar uma nova conta `super_admin`. O que acontece?

- [ ] A conta é criada, mas fica desabilitada.
- [x] A operação é negada: um administrador não pode conceder mais privilégios do que tem.
- [ ] A conta é criada com o mesmo perfil do criador.
- [ ] A conta é criada e precisa da aprovação de outro `super_admin`.
> O FortiOS não permite que um administrador crie contas ou atribua perfis com privilégios acima dos seus. Sem escrita em System, a conta nem consegue criar administradores.
:::

:::quiz
Após um upgrade, um serviço crítico passou a falhar. Qual recurso permite voltar rapidamente à versão anterior em muitos FortiGates físicos?

- [ ] Fazer reset de fábrica.
- [x] Iniciar pela outra partição de firmware, que mantém a imagem anterior.
- [ ] Restaurar uma revisão de configuração gerada na versão nova.
- [ ] Desabilitar a atualização automática do FortiGuard.
> A maioria dos FortiGates físicos tem **duas partições de firmware**: a imagem anterior fica preservada na outra, e a CLI permite escolher a partição do próximo boot. Mantenha também o backup gerado na versão anterior.
:::
