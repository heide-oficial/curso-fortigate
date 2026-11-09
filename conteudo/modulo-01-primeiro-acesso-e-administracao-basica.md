# Módulo 01 — Primeiro acesso e administração básica

## Antes de começar

**O que você vai aprender neste módulo**

Ao final deste módulo, você será capaz de:

- explicar o que o FortiGate faz e onde cada função fica na interface;
- identificar modelo, versão do FortiOS, licenças e por que um recurso pode não aparecer no seu equipamento;
- acessar um FortiGate novo pela console e pela rede, fazer o primeiro login e recuperar o acesso quando a senha se perde;
- navegar com segurança pela GUI e usar a CLI quando ela for necessária;
- configurar hostname, hora, DNS e o acesso administrativo de forma segura;
- criar administradores com o privilégio mínimo necessário;
- verificar licenças e o funcionamento do FortiGuard;
- fazer backup, restaurar a configuração e atualizar o firmware com um plano de retorno.

**Pré-requisitos:** nenhum. Este é o ponto de partida do curso.

**Onde estamos no cenário Atlas Logística**

Neste módulo, o FortiGate da matriz (FGT-MTZ) sai da caixa. Ainda não há redes de usuários, regras nem Internet. O objetivo é deixar o equipamento **acessível, identificado, com hora correta, administração protegida, licenças verificadas e um backup guardado**.

Para administrar o equipamento desde o primeiro dia, a Atlas usa uma rede de gerência separada (gerência *out-of-band*):

| Elemento | Valor |
|---|---|
| Interface de gerência do FGT-MTZ | `mgmt` (ou uma porta livre, com alias `mgmt`, se o seu modelo ou VM não tiver porta dedicada) |
| Rede de gerência | 10.10.99.0/24 |
| Endereço do FGT-MTZ na gerência | 10.10.99.1 |
| Estação do administrador | 10.10.99.10 |
| Rede de servidores (usada a partir do módulo 02) | 10.10.20.0/24 |

:::figura midia/m01/00-topologia-gerencia.png "Diagrama: estação do administrador (10.10.99.10) ligada à porta mgmt do FGT-MTZ (10.10.99.1) e notebook ligado à porta CONSOLE"
Topologia deste módulo: a estação do administrador acessa o FGT-MTZ pela rede de gerência, e um notebook fica ligado à console para o primeiro acesso e para emergências.
:::

> **Como ler este material**
> - **Na prática:** dica de quem administra FortiGate no dia a dia.
> - **Atenção:** algo que pode causar perda de acesso, de configuração ou de segurança.
> - **Dica para a prova:** ponto que costuma ser cobrado no exame NSE 4.
> - **Na prova (7.6):** diferença entre o FortiOS 8.0 usado no curso e o 7.6 cobrado no exame.
> - **Guia de comandos CLI:** botão ao final de cada seção, com os comandos equivalentes ao que foi feito na GUI, os comandos de verificação e as opções extras.

> **Sobre menus e comandos:** os caminhos de menu deste material foram escritos para FortiOS 8.0.x. Nomes de menus e opções mudam entre versões e modelos. Se algo não aparecer igual no seu equipamento, use a busca da GUI e consulte o *Administration Guide* da sua versão.

---

## 01.1. O FortiGate e o FortiOS

### 01.1.1. Funções do FortiGate e organização da GUI

#### O que é o FortiGate

O FortiGate é o firewall de próxima geração (NGFW, *Next-Generation Firewall*) da Fortinet. Um firewall tradicional decide se uma conexão passa olhando principalmente **endereços IP e portas**. O FortiGate também faz isso, mas vai além. Ele pode:

- **controlar o acesso entre redes** com firewall policies (módulo 03);
- **traduzir endereços** para dar acesso à Internet e publicar serviços (NAT, módulo 05);
- **rotear** o tráfego entre redes e links (módulo 06);
- **identificar usuários** e aplicar regras por pessoa ou grupo (módulos 07 e 08);
- **inspecionar o conteúdo** do tráfego permitido: sites, aplicações, ataques, vírus (módulos 09 a 12);
- **criar VPNs** entre sites e para usuários remotos (módulo 13);
- **escolher o melhor link** de Internet para cada aplicação (SD-WAN, módulo 14);
- **integrar-se** com outros produtos Fortinet no Security Fabric (módulo 15);
- **trabalhar em par**, com um equipamento assumindo se o outro falhar (HA, módulo 16).

O sistema operacional que roda no FortiGate se chama **FortiOS**. É ele que define quais funções existem e como são configuradas. Por isso, neste curso, quando falamos "a versão", estamos falando da versão do FortiOS (por exemplo, 8.0.2), e não do hardware.

> **Na prática:** pense no FortiGate como várias ferramentas em um só equipamento: firewall, roteador, concentrador VPN, filtro web, IPS e mais. Todas trabalham sobre o mesmo tráfego e dependem umas das outras. Por exemplo, um filtro web só atua sobre tráfego que uma firewall policy já permitiu. Entender essa ordem é a base de todo o curso.

#### Como a GUI está organizada

A GUI (*Graphical User Interface*) é a interface web de administração, acessada por HTTPS. O menu lateral é organizado por **função**:

| Menu | Para que serve | Exemplos |
|---|---|---|
| **Dashboard** | Visão do estado do equipamento | CPU, memória, sessões, licenças, FortiView |
| **Network** | Conectividade | Interfaces, DNS, rotas estáticas, policy routes, SD-WAN, captura de pacotes |
| **Policy & Objects** | Quem pode falar com quem | Firewall policies, endereços, serviços, schedules, Virtual IPs, IP pools |
| **Security Profiles** | O que é inspecionado no tráfego permitido | Antivirus, Web Filter, DNS Filter, Application Control, IPS, SSL/SSH Inspection |
| **VPN** | Túneis | IPsec, assistente de VPN, acesso remoto |
| **User & Authentication** | Identidade | Usuários, grupos, servidores LDAP/RADIUS, FortiTokens, convidados |
| **WiFi & Switch Controller** | Gerência de FortiAP e FortiSwitch | Aparece quando o recurso está habilitado |
| **System** | O próprio equipamento | Administradores, perfis administrativos, firmware, configurações gerais, HA, certificados, FortiGuard, Feature Visibility |
| **Security Fabric** | Integração com outros produtos | Topologia, Security Rating, automação, conectores |
| **Log & Report** | Registros | Logs de tráfego, eventos e segurança; configuração de logs |

:::figura midia/m01/01-1-tour-gui.mp4 "Vídeo curto percorrendo o menu lateral da GUI do FGT-MTZ, abrindo cada menu principal e usando a busca do menu"
Um passeio pelo menu lateral. Repare que cada menu agrupa uma função e que a **busca** no topo do menu leva direto à página procurada.
:::

Repare na separação entre **Policy & Objects** e **Security Profiles**. A firewall policy decide se a conexão é **permitida**. O Security Profile decide o que acontece **com o conteúdo** da conexão permitida. Um perfil nunca libera algo que a policy bloqueou.

Algumas funções são **nativas** do FortiGate (firewall, VPN, filtros). Outras são **integrações** com outros produtos: FortiAnalyzer para logs centralizados, FortiClient EMS para dados de endpoint, FortiSandbox para análise de arquivos. As integrações costumam aparecer em **Security Fabric > Fabric Connectors** e exigem o outro produto funcionando, não só a configuração no FortiGate.

#### Elementos que aparecem em todas as telas

:::figura midia/m01/01-1-elementos-gui.png "Tela da GUI com destaques numerados: (1) busca do menu, (2) ícone da console CLI, (3) notificações, (4) menu do administrador, (5) coluna Ref. em uma lista"
Os elementos que você vai usar o tempo todo: (1) **busca do menu**, (2) **console CLI** dentro da GUI, (3) **notificações**, (4) **menu do administrador**, onde ficam backup, restauração e logout, e (5) a coluna **Ref.**, que mostra quantos objetos usam um item.
:::

- **Dashboards:** painéis com widgets (System Information, Licenses, CPU, Memory, Sessions, Interfaces, Administrators). Você pode criar dashboards próprios e escolher os widgets.
- **Busca do menu:** digite parte do nome ("dns", "admin", "firmware") para ir direto à página. Ajuda muito quando o menu muda entre versões.
- **Console CLI:** abre um terminal da CLI dentro do navegador, sem precisar de SSH.
- **Menu do administrador** (canto superior direito): **Configuration** (backup, restauração e revisões), troca de senha e logout.
- **Listas:** a maioria das páginas tem busca, filtros por coluna e a coluna **Ref.** (referências), essencial para saber se um objeto pode ser apagado (seção 01.3).

### 01.1.2. Modelos, plataformas e recursos disponíveis

#### Famílias de FortiGate

O mesmo FortiOS roda em plataformas diferentes:

| Plataforma | Exemplos | Características |
|---|---|---|
| **Entry-level (desktop)** | FortiGate 40F, 60F, 70F, 90G | Pequenas empresas e filiais. Processador SoC (*System on a Chip*), que reúne CPU e aceleração em um só chip. Normalmente têm um switch interno (porta `lan` ou `internal`). |
| **Mid-range** | FortiGate 100F, 200F, 400F, 600F | Empresas médias e matrizes. Processadores dedicados de aceleração (NP para tráfego, CP para criptografia e inspeção). |
| **High-end** | FortiGate 1000F, 3000F e superiores | Data centers e provedores. Grande capacidade e muitas portas de alta velocidade. |
| **VM** | FortiGate-VM (VMware, Hyper-V, KVM, AWS, Azure, GCP…) | Mesmo FortiOS, sem aceleração em hardware. A capacidade depende da licença e dos recursos (vCPU, memória) alocados. |
| **Rugged** | FortiGate Rugged | Ambientes industriais (temperatura, vibração). |

Os processadores de aceleração são explicados no módulo 17. Por enquanto, guarde a ideia: **dois FortiGates com a mesma versão de FortiOS podem ter capacidades e até recursos diferentes**, por causa do hardware.

#### Conhecendo o seu equipamento pela GUI

O widget **System Information**, no dashboard **Status**, resume a identidade do equipamento:

:::figura midia/m01/01-1-system-information.png "Dashboard Status com o widget System Information do FGT-MTZ: hostname, número de série, firmware, modo de operação, uptime e horário do sistema"
O widget **System Information** mostra hostname, número de série, versão de firmware, modo de operação e horário. Ao lado, o widget **Licenses** mostra o estado de cada serviço FortiGuard (seção 01.6).
:::

| Campo | O que indica |
|---|---|
| **Hostname** | Nome do equipamento (você vai alterá-lo na seção 01.4). |
| **Serial Number** | Número de série, usado no registro e no suporte. |
| **Firmware** | Versão do FortiOS e build. O build identifica exatamente a imagem instalada. |
| **Mode** | `NAT` (modo roteado, o padrão) ou `Transparent` (o FortiGate funciona como uma "ponte" entre segmentos). Este curso usa o modo NAT. |
| **System Time** | Hora atual do equipamento (seção 01.4). |
| **Uptime** | Há quanto tempo o equipamento está ligado. |

A mesma informação, com mais detalhes, aparece no comando `get system status`. Esse comando é muito cobrado na prova; a leitura completa da saída está no **Guia de comandos CLI** desta seção.

#### Por que um recurso pode "não existir" no seu FortiGate

É comum ler a documentação, procurar um recurso na GUI e não encontrar. Há quatro motivos principais:

1. **Feature Visibility:** para deixar a GUI mais limpa, o FortiOS esconde vários recursos por padrão. Eles existem e funcionam, só não aparecem no menu. Exemplos: DNS Database, VPN policy-based, Load Balance, Explicit Proxy.
2. **Modelo e memória:** alguns recursos dependem do hardware. Modelos com pouca memória RAM podem não ter recursos que exigem muito processamento. A matriz de recursos por plataforma (*Feature / Platform Matrix*) e o release notes informam essas restrições.
3. **Licença:** o recurso aparece, mas não funciona sem o serviço FortiGuard correspondente (seção 01.6).
4. **Versão do FortiOS:** o recurso foi incluído, renomeado ou removido em determinada versão.

#### Na GUI: habilitando um recurso em Feature Visibility

:::slides
midia/m01/01-1-feature-visibility-1.png "Menu System com o item Feature Visibility destacado" | Acesse **System > Feature Visibility**.
midia/m01/01-1-feature-visibility-2.png "Página Feature Visibility com a lista de recursos e a chave DNS Database destacada" | A página lista os recursos em grupos (*Core Features*, *Additional Features*). Localize **DNS Database** e ative a chave.
midia/m01/01-1-feature-visibility-3.png "Botão Apply no rodapé da página Feature Visibility" | Clique em **Apply**. A alteração vale na hora.
midia/m01/01-1-feature-visibility-4.png "Menu Network mostrando o novo item DNS Servers" | O item **Network > DNS Servers** passa a aparecer no menu. Ele será usado no módulo 02.
:::

Feature Visibility só altera a **interface**. Desabilitar a visibilidade de um recurso **não desliga** uma configuração que já está em uso. Ela continua funcionando, apenas fica fora da vista na GUI.

> **Atenção:** "não está no menu" não significa "não existe". Antes de concluir que o equipamento não suporta algo, confira Feature Visibility, a matriz de plataforma, a licença e o release notes.

#### Erros comuns da seção 01.1

- Concluir que um recurso não existe porque o menu não aparece, quando ele só está oculto em Feature Visibility.
- Achar que um perfil de segurança pode liberar um tráfego que a firewall policy não permitiu.
- Esperar que uma VM tenha o mesmo desempenho de um appliance físico com aceleração em hardware.

:::cli O FortiGate e o FortiOS
### `get system status` — a identidade do equipamento

É o comando de referência para conhecer um FortiGate. Saída resumida (os valores variam):

```
FGT-MTZ # get system status
Version: FortiGate-60F v8.0.x,buildXXXX,XXXXXX (GA.F)
Firmware Signature: certified
Virus-DB: ...
IPS-DB: ...
Serial-Number: FGT60FTK2XXXXXXX
BIOS version: ...
Log hard disk: Not available
Hostname: FGT-MTZ
Operation Mode: NAT
Current virtual domain: root
Max number of virtual domains: 10
Virtual domain configuration: disable
Current HA mode: standalone
System time: ...
```

| Campo | O que indica |
|---|---|
| `Version` | Modelo, versão do FortiOS e build. |
| `Firmware Signature` | Se a imagem é assinada pela Fortinet (`certified`). |
| `Virus-DB`, `IPS-DB` | Versões das bases de assinaturas (seção 01.6). |
| `Serial-Number` | Número de série. |
| `Log hard disk` | Se há disco para logs locais (módulo 04). |
| `Operation Mode` | `NAT` ou `Transparent`. |
| `Virtual domain configuration` | Se o equipamento usa VDOMs (apêndice B). |
| `Current HA mode` | `standalone` ou o modo de cluster (módulo 16). |

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

### Desempenho e recursos (prévia do módulo 17)

```
get system performance status
```

Mostra uso de CPU e memória, número de sessões e taxa de criação de sessões. Útil para saber se o equipamento está sobrecarregado.
:::

---

## 01.2. Primeiro acesso e recuperação

### 01.2.1. Console, endereço padrão e primeiro login

Um FortiGate novo pode ser acessado de duas formas: pela **console** (cabo serial) e pela **rede**, usando a interface que vem configurada de fábrica.

#### Acesso pela console

A console é o acesso "de último recurso". Funciona mesmo sem nenhuma configuração de rede, e é por ela que você recupera o equipamento quando perde o acesso pela rede.

- **Cabo:** a maioria dos modelos tem uma porta `CONSOLE` RJ-45 (cabo RJ-45 para serial/USB). Alguns modelos também oferecem console por USB.
- **Software:** qualquer emulador de terminal (PuTTY, SecureCRT, Tera Term, `screen` no Linux/macOS).
- **Parâmetros:** 9600 bps, 8 bits de dados, sem paridade, 1 bit de parada, sem controle de fluxo (o famoso **9600 8N1**).

:::figura midia/m01/01-2-putty-serial.png "Janela de configuração do PuTTY com Connection type Serial, porta COM3 e velocidade 9600"
Configuração do emulador de terminal para a console: tipo **Serial**, porta COM do adaptador e velocidade **9600**.
:::

> **Na prática:** em uma VM, a "console" é a janela de console do hipervisor (VMware, Hyper-V, KVM) ou da nuvem. Ela tem o mesmo papel do cabo console.

#### Acesso pela rede com a configuração de fábrica

A configuração de fábrica muda conforme o modelo. Em geral:

- **Modelos desktop:** costumam vir com a interface interna (`lan`/`internal`) em 192.168.1.99/24, com HTTPS e PING liberados e um servidor DHCP entregando endereços aos computadores conectados.
- **Modelos com porta `mgmt`:** essa porta costuma vir com 192.168.1.99/24 para gerência.
- **VMs:** a `port1` normalmente recebe a gerência. Dependendo da plataforma, usa DHCP ou precisa ser configurada pela console.

Consulte o *Quick Start Guide* do seu modelo. Com o endereço em mãos, acesse `https://192.168.1.99` (ou o endereço correspondente). O navegador vai alertar que o certificado não é confiável. Isso é esperado: o FortiGate usa um certificado autoassinado de fábrica, que você trocará por um certificado confiável no módulo 09.

#### Primeiro login

- **Usuário:** `admin`
- **Senha:** em branco (apenas Enter)

No primeiro login, o FortiOS **obriga a troca da senha** do `admin`. Escolha uma senha forte e guarde-a em um cofre de senhas. Essa conta é o seu acesso total ao equipamento.

:::figura midia/m01/01-2-primeiro-login.gif "Animação: tela de login da GUI, login como admin com senha em branco, tela obrigatória de troca de senha e entrada no assistente inicial"
O primeiro login pela GUI: depois de entrar com `admin` e senha em branco, o FortiOS exige uma nova senha antes de qualquer outra ação.
:::

Na GUI, o primeiro login abre um **assistente de configuração inicial**. Ele ajuda com hostname, registro no FortiCare, verificação de firmware e escolha do dashboard. Você pode usá-lo, mas neste módulo faremos cada passo separadamente, para entender o que cada um faz.

Outra opção é o **FortiExplorer**, aplicativo da Fortinet (computador e celular) que se conecta ao FortiGate por USB nos modelos compatíveis e facilita a configuração inicial em campo.

#### Configurando o endereço de gerência pela console

Muitas vezes o primeiro passo precisa ser feito pela console, porque ainda não há acesso pela rede. Este é um dos casos em que a CLI é necessária. No cenário Atlas:

```
config system interface
    edit "mgmt"
        set mode static
        set ip 10.10.99.1 255.255.255.0
        set allowaccess ping https ssh
    next
end
```

Em palavras: "na tabela de interfaces, edite a interface `mgmt`, use endereço fixo 10.10.99.1/24, aceite PING, HTTPS e SSH de gerência e salve". Se o seu equipamento não tiver uma porta `mgmt`, use uma porta livre, como `port8`. A estrutura desses comandos é explicada na seção 01.3.

Da estação 10.10.99.10, acesse `https://10.10.99.1`. A partir daqui, o trabalho segue pela GUI.

### 01.2.2. Reset de fábrica e recuperação de senha

#### Reset de fábrica

O reset de fábrica apaga a configuração e devolve o equipamento ao estado original (mesma versão de firmware, configuração padrão). Use quando for reaproveitar um equipamento ou quando a configuração estiver irrecuperável.

A forma universal de fazer o reset é pela CLI:

```
execute factory-reset
```

O FortiGate pede confirmação e reinicia. Depois disso:

- todas as policies, interfaces, VPNs, usuários e administradores criados são **apagados**;
- a senha do `admin` volta a ser em branco;
- o firmware **não** muda.

As variantes do comando (preservar parte da configuração ou, em VMs, a licença) estão no Guia de comandos CLI desta seção.

> **Atenção:** o reset de fábrica é irreversível. **Faça backup antes** (seção 01.7). Em equipamentos remotos, o reset também apaga a configuração que permite acessá-los: você vai precisar de alguém no local.

#### Recuperação da senha do administrador

Se ninguém sabe a senha de um administrador com perfil `super_admin`, o FortiOS oferece a **conta maintainer** nos equipamentos físicos:

1. Conecte-se pela **console**.
2. **Desligue e ligue** o equipamento na energia. Uma reinicialização por software não serve: o procedimento exige o ciclo de energia, justamente para comprovar o acesso físico.
3. Logo que o prompt de login aparecer, faça login com o usuário `maintainer` e a senha `bcpb` seguida do **número de série em letras maiúsculas** (por exemplo, `bcpbFGT60FTK2XXXXXXX`). A janela de tempo é curta, então tenha o número de série anotado (ele fica na etiqueta do equipamento).
4. Já logado, redefina a senha do administrador (o comando está no Guia de comandos CLI desta seção).

Pontos importantes:

- A conta maintainer **exige acesso físico** (console + ciclo de energia). É uma proteção: quem tem acesso físico ao equipamento já poderia fazer o reset de fábrica.
- Ela pode ser **desabilitada** pelo administrador. Em ambientes com alta exigência de segurança, isso impede que alguém com acesso físico entre sem apagar a configuração.
- Com a conta maintainer desabilitada e a senha perdida, sobra o **reset de fábrica**, seguido da restauração de um backup.
- Em VMs, o procedimento é diferente (normalmente pela console do hipervisor e reset). Consulte o guia da plataforma.

> **Dica para a prova:** a recuperação pela conta maintainer exige console e reinicialização por energia (*hard reboot*), e pode ser desabilitada pelo administrador.

#### Erros comuns da seção 01.2

- Fazer reset de fábrica sem backup.
- Tentar a conta maintainer depois de reiniciar por software em vez de desligar e ligar na energia.
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
| `set allowaccess ping https ssh` | Serviços de gerência aceitos (seção 01.4). |
| `next` / `end` | Salvam a alteração. |

Verificação:

```
show system interface mgmt
execute ping 10.10.99.10
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

Prefira desligar com `execute shutdown` antes de cortar a energia, para evitar corromper o disco ou a flash.
:::

---

## 01.3. GUI e CLI

A GUI e a CLI são **duas janelas para a mesma configuração**. Tudo o que você muda na GUI aparece na CLI, e vice-versa. Neste curso, o trabalho é feito principalmente pela GUI, que é onde o administrador passa a maior parte do tempo. A CLI entra em três situações:

- quando **não existe opção na GUI** para o que você precisa;
- quando a **saída de um comando é a ferramenta de diagnóstico** (logs de debug, tabela de sessões, estado do cluster);
- quando é **mais rápido ou mais seguro** consultar e comparar, como ao ver a configuração completa de um objeto.

Por isso, mesmo focando na GUI, você precisa entender como a CLI está organizada. É o que esta seção ensina.

### 01.3.1. Navegação na GUI e acesso à CLI

#### Trabalhando com listas e objetos na GUI

Quase toda página de configuração da GUI segue o mesmo padrão: uma **lista** de objetos com botões **Create New**, **Edit**, **Clone** e **Delete**, uma busca e colunas que podem ser filtradas e reorganizadas.

:::slides
midia/m01/01-3-lista-objetos-1.png "Página Policy & Objects > Addresses com a barra de botões Create New, Edit, Clone e Delete destacada" | Em qualquer lista, a barra superior traz **Create New**, **Edit**, **Clone** e **Delete**. Os botões que dependem de seleção ficam ativos quando você seleciona um item.
midia/m01/01-3-lista-objetos-2.png "Busca da lista filtrando objetos pelo texto digitado" | A **busca** filtra a lista pelo texto digitado em qualquer coluna.
midia/m01/01-3-lista-objetos-3.png "Menu de configuração de colunas aberto, com a opção de exibir a coluna Ref." | Clique com o botão direito no cabeçalho para **escolher colunas**. A coluna **Ref.** mostra quantos objetos usam cada item.
midia/m01/01-3-lista-objetos-4.png "Janela de referências aberta ao clicar no número da coluna Ref., listando as policies que usam o objeto" | Clicar no número da coluna **Ref.** mostra **quem usa** o objeto. Antes de apagar ou alterar algo, confira aqui.
:::

#### Abrindo a CLI

Você pode acessar a CLI por três caminhos:

- **Console** (cabo serial), seção 01.2;
- **SSH** para um endereço com `ssh` habilitado em *Administrative Access*;
- **CLI Console da GUI**, pelo ícone `>_` na barra superior.

:::figura midia/m01/01-3-cli-console-gui.png "CLI Console aberta dentro da GUI, mostrando o prompt FGT-MTZ # e a saída de um comando"
A **CLI Console** abre um terminal dentro do navegador. Ela usa a sessão e as permissões do administrador logado na GUI.
:::

#### Comandos de consulta

Quatro famílias de comandos dominam a CLI:

| Comando | Para que serve |
|---|---|
| `show` | Mostra a **configuração**, só com os valores **diferentes do padrão**. |
| `show full-configuration` | Mostra a configuração **completa**, incluindo os valores padrão. |
| `get` | Mostra valores de configuração (incluindo os padrão) **e** informações de estado, como `get system status`. |
| `diagnose` / `execute` | `diagnose` faz diagnóstico (debugs, tabelas internas). `execute` executa ações (ping, backup, reboot). |

A diferença entre `show` e `show full-configuration` é uma das coisas mais úteis de entender cedo. Veja a interface `mgmt`:

```
FGT-MTZ # show system interface mgmt
config system interface
    edit "mgmt"
        set ip 10.10.99.1 255.255.255.0
        set allowaccess ping https ssh
        set type physical
        set role lan
        set snmp-index 1
    next
end
```

O `show` exibe só o que foi alterado em relação ao padrão. Já o `show full-configuration system interface mgmt` exibe dezenas de linhas, incluindo `mtu`, `speed` e `status up`. Use:

- `show` para entender **o que alguém configurou**;
- `show full-configuration` ou `get` para descobrir **qual valor está valendo**, mesmo que seja o padrão.

Recursos que facilitam o uso no dia a dia, como filtrar saídas com `grep` e desligar a paginação, estão no Guia de comandos CLI desta seção.

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

Para descobrir comandos e valores, use `?` (lista as opções naquele ponto) e **Tab** (completa o nome). Os demais comandos de tabela (`rename`, `move`, `clone`, `purge`) estão no Guia de comandos CLI.

#### Quando a alteração passa a valer

- **Na CLI:** quando você salva o item com `next` ou `end`. Enquanto você digita `set` dentro do `edit`, nada mudou ainda no equipamento. É por isso que `abort` consegue descartar.
- **Na GUI:** quando você clica em **OK** ou **Apply**.

#### Referências entre objetos

Objetos do FortiOS se referenciam: um endereço é usado por uma policy, uma interface por uma rota, um perfil por uma policy. O FortiOS **não deixa apagar um objeto em uso**.

- **Na GUI:** a coluna **Ref.** mostra quantas referências o objeto tem, e clicar no número mostra quem o usa (slides da seção 01.3.1). O botão **Delete** fica indisponível ou retorna erro para objetos referenciados.
- **Fluxo correto:** para remover um objeto, primeiro remova ou altere quem o referencia; depois apague o objeto.

Esse comportamento evita que uma regra fique "apontando para nada", mas exige planejar a ordem das alterações, principalmente ao mudar interfaces (módulo 02).

#### Erros comuns da seção 01.3

- Usar `set` em uma lista (como `allowaccess`) achando que vai acrescentar um valor, e com isso apagar os outros.
- Sair com `end` quando a intenção era descartar a alteração (`abort`).
- Achar que um atributo "não existe" porque não aparece no `show` (ele está no valor padrão).
- Tentar apagar um objeto em uso sem consultar as referências.

:::cli GUI e CLI
### Filtrando saídas com `grep`

A saída da CLI pode ser enorme. O FortiOS aceita `grep` com opções úteis:

```
show full-configuration system global | grep admintimeout
show system admin | grep -f trusthost
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
| `move <id> before/after <id>` | Reordena itens (muito usado com policies, módulo 03). |
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

No modo `revert`, se você não salvar explicitamente com `execute cfg save` dentro do tempo definido (em segundos), o equipamento volta à última configuração salva. É útil para mudanças remotas arriscadas. Teste o comportamento no seu build antes de usar em produção, porque a reversão envolve reinício.
:::

---

## 01.4. Configurações do sistema

### 01.4.1. Hostname, hora, NTP e DNS do sistema

#### Por que essas configurações vêm primeiro

- O **hostname** identifica o equipamento no prompt da CLI, na GUI, nos logs, no FortiAnalyzer, no Security Fabric e nos alertas. Com vários FortiGates, um bom padrão de nomes evita alterar o equipamento errado.
- A **hora** precisa estar correta por vários motivos:
  - **Certificados** têm validade. Com a hora errada, certificados válidos parecem expirados, e a inspeção SSL, as VPNs com certificado e a própria GUI geram erros (módulo 09).
  - **Logs** precisam de horário correto para investigar incidentes e correlacionar eventos com outros sistemas.
  - **Tokens de MFA** (FortiToken) usam códigos baseados em tempo. Com a hora errada, o código é recusado (módulo 07).
  - **Autenticação no Active Directory** (Kerberos) e o **FSSO** (módulo 08) dependem de hora sincronizada.
  - **Schedules** de firewall policies (módulo 03) dependem do relógio do equipamento.
- O **DNS do sistema** é usado pelo **próprio FortiGate** para resolver nomes: falar com o FortiGuard, sincronizar NTP por nome, resolver objetos FQDN, enviar alertas por e-mail, consultar servidores por nome. Ele é diferente do serviço DNS que o FortiGate pode oferecer aos clientes (módulo 02).

#### Na GUI: hostname e hora

:::slides
midia/m01/01-4-system-settings-1.png "Página System > Settings com o campo Host name preenchido com FGT-MTZ" | Em **System > Settings**, preencha **Host name** com `FGT-MTZ`.
midia/m01/01-4-system-settings-2.png "Seção System Time da página System > Settings com o seletor de Time Zone aberto" | Na seção **System Time**, escolha o **Time Zone** da sua localidade.
midia/m01/01-4-system-settings-3.png "Seção System Time com Set Time em NTP, opção Custom e servidor a.ntp.br preenchido, e campo Sync interval" | Em **Set Time**, escolha **NTP**. Use os servidores do FortiGuard ou selecione **Custom** e informe servidores próprios (na Atlas, `a.ntp.br`). Ajuste o **Sync interval** se necessário.
midia/m01/01-4-system-settings-4.png "Botão Apply e o prompt da CLI Console mostrando FGT-MTZ # após a alteração" | Clique em **Apply**. O novo hostname aparece no topo da GUI e no prompt da CLI.
:::

Neste módulo, o FortiGate é **cliente** NTP. No módulo 02 ele passa a ser também **servidor** NTP para os clientes da rede (a opção que permite isso também fica nesta página).

> **Na prática:** se o FortiGate ainda não tem acesso à Internet, a sincronização NTP só vai funcionar depois que houver rota e conectividade (módulo 02). Em redes isoladas, aponte para um servidor NTP interno.

#### Na GUI: DNS do sistema

:::slides
midia/m01/01-4-dns-1.png "Página Network > DNS com a opção Use FortiGuard Servers selecionada" | Em **Network > DNS**, a opção padrão é **Use FortiGuard Servers**, que usa os servidores DNS da Fortinet.
midia/m01/01-4-dns-2.png "Página Network > DNS com a opção Specify selecionada e campos Primary DNS Server e Secondary DNS Server" | Para usar servidores próprios, escolha **Specify** e preencha **Primary** e **Secondary DNS Server**. Em ambientes com Active Directory, é comum apontar para o DNS interno, para que o FortiGate resolva nomes da rede local.
midia/m01/01-4-dns-3.png "Opções de protocolo do DNS do sistema, com DNS over TLS destacado" | O DNS do sistema pode usar transporte cifrado (**DNS over TLS** ou **HTTPS**) quando o servidor suporta. Clique em **Apply**.
:::

#### Verificação

- **Hostname e hora:** confira no widget **System Information** do dashboard.
- **NTP:** depois que houver conectividade (módulo 02), o horário do widget deve coincidir com a hora real. O estado detalhado da sincronização é visto pela CLI (Guia de comandos CLI).
- **DNS:** a forma mais simples de testar é pela CLI, pedindo um ping para um nome (Guia de comandos CLI). Se o nome for resolvido para um endereço, o DNS está funcionando, mesmo que o ping não responda.

> **Dica para a prova:** diferencie o **DNS do sistema** (usado pelo próprio FortiGate) do **DNS server** em uma interface (o FortiGate respondendo consultas dos clientes, módulo 02).

### 01.4.2. Acesso administrativo

#### Conceito: gerência é tráfego destinado ao FortiGate

Quando você acessa a GUI por HTTPS ou a CLI por SSH, a conexão tem como **destino o próprio FortiGate**. Esse tipo de tráfego é chamado de **local-in** (módulo 03). Ele **não** é controlado pelas firewall policies comuns, que controlam o tráfego que **atravessa** o equipamento de uma rede para outra.

O acesso administrativo é controlado em camadas:

1. **Administrative Access da interface:** quais protocolos de gerência a interface aceita.
2. **Configurações de administração:** portas e tempo de inatividade.
3. **Trusted hosts:** de quais origens cada administrador pode fazer login.
4. **Local-in policies** (opcional, módulo 03): regras específicas para o tráfego destinado ao equipamento.

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
| **Security Fabric Connection** | Comunicação do Security Fabric (módulo 15). |
| **RADIUS Accounting** | Receber accounting RADIUS (RSSO, módulo 08). |
| **Speed Test / Probe Response** | Testes de banda e probes de SLA (módulo 14). |

:::slides
midia/m01/01-4-admin-access-1.png "Lista Network > Interfaces com a interface mgmt selecionada e o botão Edit destacado" | Em **Network > Interfaces**, selecione a interface e clique em **Edit**.
midia/m01/01-4-admin-access-2.png "Tela de edição da interface mgmt com a seção Administrative Access e as caixas PING, HTTPS e SSH marcadas" | Na seção **Administrative Access**, marque somente o necessário. Na interface de gerência da Atlas: **PING**, **HTTPS** e **SSH**.
midia/m01/01-4-admin-access-3.png "Tela de edição da interface WAN com todas as caixas de Administrative Access desmarcadas" | Em interfaces voltadas para a Internet (módulo 02), deixe as opções de gerência **desmarcadas**.
:::

Regra de ouro: **habilite somente o necessário, somente nas interfaces necessárias**. A interface WAN, especialmente, não deveria aceitar HTTPS e SSH de gerência vindos de qualquer lugar da Internet. Se a gerência remota for necessária, prefira acessar por VPN (módulo 13) ou restrinja com trusted hosts e local-in policies.

> **Atenção:** se você está acessando a GUI por uma interface e desmarca o **HTTPS** dela, perde o acesso ao clicar em **OK**. Antes de alterar a interface que você está usando, tenha outro caminho (outra interface ou a console).

#### 2. Configurações de administração

Ficam em **System > Settings**, seção **Administration Settings**:

:::figura midia/m01/01-4-administration-settings.png "Seção Administration Settings de System > Settings com os campos HTTP port, HTTPS port, Redirect to HTTPS, SSH port e Idle timeout"
Em **Administration Settings**, você define as portas da GUI e do SSH, o redirecionamento de HTTP para HTTPS e o **Idle timeout**.
:::

| Opção | Efeito |
|---|---|
| **HTTPS port** | Porta da GUI (padrão 443). |
| **HTTP port** e **Redirect to HTTPS** | O acesso por HTTP é redirecionado para HTTPS. |
| **SSH port** | Porta do SSH (padrão 22). |
| **Idle timeout** | Minutos de inatividade até a sessão administrativa expirar (padrão 5). |

Mudar a porta **não é** uma proteção real: um varredor de portas encontra o serviço em qualquer porta. A mudança serve para reduzir ruído de ataques automatizados e, principalmente, para liberar a porta 443 quando outro serviço do FortiGate precisa dela (por exemplo, um portal VPN ou um VIP). A proteção real vem de não expor a gerência e de restringir as origens.

> **Atenção:** ao mudar a porta HTTPS, o acesso passa a ser `https://10.10.99.1:<nova-porta>`. Mantenha a sessão atual aberta e teste em outra aba antes de encerrá-la.

#### 3. Trusted hosts

Trusted hosts são as **redes de origem permitidas para cada administrador**. São configurados na conta do administrador, com até dez entradas:

:::slides
midia/m01/01-4-trusted-hosts-1.png "Lista System > Administrators com a conta admin selecionada e o botão Edit destacado" | Em **System > Administrators**, edite o administrador.
midia/m01/01-4-trusted-hosts-2.png "Tela de edição do administrador com a opção Restrict login to trusted hosts ativada e Trusted Host 1 igual a 10.10.99.0/24" | Ative **Restrict login to trusted hosts** e informe a rede em **Trusted Host 1** (na Atlas, `10.10.99.0/24`). Use o **+** para adicionar mais redes.
midia/m01/01-4-trusted-hosts-3.png "Mensagem de falha de login ao tentar acessar a partir de uma origem fora dos trusted hosts" | Um login a partir de uma origem fora da lista é recusado, e o evento fica registrado nos logs de sistema.
:::

Como funciona na prática:

- Um administrador com trusted hosts só consegue fazer login a partir dessas redes.
- Um administrador **sem** trusted hosts definidos aceita login de qualquer origem.
- **Para que o FortiGate deixe de responder ao serviço de gerência para origens não autorizadas, todos os administradores precisam ter trusted hosts.** Se apenas uma conta estiver sem restrição, a página de login continua respondendo para todos, mesmo que as contas restritas sejam recusadas.

> **Dica para a prova:** trusted hosts são configurados **por administrador**. Para restringir de fato o acesso aos serviços de gerência, todas as contas precisam de trusted hosts.

> **Atenção:** antes de restringir trusted hosts, confirme o endereço de onde você está acessando. Configure primeiro em uma conta de teste, valide e só então aplique à sua conta. Em caso de erro, o acesso pela console continua disponível.

#### Banner de login (opcional)

Muitas políticas de segurança exigem um aviso legal antes do login. O FortiOS oferece um banner de pré-login, cujo texto é editado em **System > Replacement Messages**. Se a opção de habilitar o banner não aparecer na GUI da sua versão, use o comando do Guia de comandos CLI.

#### Verificação

1. Da estação 10.10.99.10, acesse a GUI e o SSH: devem funcionar.
2. De outra origem, ou por uma interface sem HTTPS em Administrative Access, tente acessar: não deve funcionar.
3. Consulte os eventos de login em **Log & Report > System Events** (em algumas versões, **Log & Report > Events**, filtro *System Events*). Logins bem-sucedidos e recusados aparecem com usuário, origem e método.

:::figura midia/m01/01-4-log-login.png "Log & Report > System Events filtrado por logins administrativos, com uma linha de login bem-sucedido e outra de login recusado"
Os eventos de login administrativo mostram o usuário, o endereço de origem, a interface e o resultado. É a primeira evidência a consultar quando alguém não consegue entrar.
:::

#### Erros comuns da seção 01.4

- Hora errada causando erros de certificado, MFA e FSSO, que parecem problemas de outra coisa.
- Configurar o DNS do sistema achando que isso faz o FortiGate responder DNS aos clientes.
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

Verificação:

```
diagnose sys ntp status
execute time
execute date
```

O `diagnose sys ntp status` mostra os servidores configurados, se estão alcançáveis e qual está sendo usado para sincronizar.

### DNS do sistema

```
config system dns
    set primary 96.45.45.45
    set secondary 96.45.46.46
end
```

96.45.45.45 e 96.45.46.46 são os servidores DNS do FortiGuard. Verificação:

```
get system dns
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

Use `set allowaccess ?` para ver as opções da sua versão. Lembre da diferença entre `set` (substitui a lista) e `append` (acrescenta), explicada na seção 01.3.

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

#### Como um perfil é organizado

Um perfil define, por **área** da GUI, o nível de permissão:

- **None:** a área nem aparece para a conta.
- **Read:** a conta vê, mas não altera.
- **Read/Write:** a conta vê e altera.
- **Custom:** algumas áreas permitem permissões mais finas. Em *Firewall*, por exemplo, é possível dar escrita em policies e só leitura em objetos.

As áreas são: Security Fabric, FortiView, User & Device, Firewall, Log & Report, Network, System, Security Profile, VPN, WAN Opt & Cache e WiFi & Switch.

#### Na GUI: criando um perfil somente leitura

:::slides
midia/m01/01-5-admin-profile-1.png "Lista System > Admin Profiles com os perfis super_admin e prof_admin e o botão Create New destacado" | Em **System > Admin Profiles**, clique em **Create New**.
midia/m01/01-5-admin-profile-2.png "Formulário New Admin Profile com Name Atlas-Leitura e a tabela Access Permissions com a coluna Read marcada em todas as áreas" | Dê o nome `Atlas-Leitura`. Na tabela **Access Permissions**, use o atalho do cabeçalho para marcar **Read** em todas as áreas.
midia/m01/01-5-admin-profile-3.png "Formulário de perfil Atlas-Operador-Firewall com Firewall em Custom, Policy em Read/Write e os demais objetos em Read" | Para um operador que só altera policies, crie `Atlas-Operador-Firewall` com **Firewall** em **Custom**: *Policy* em **Read/Write**, os demais itens em **Read**. As outras áreas ficam em **Read** ou **None**.
midia/m01/01-5-admin-profile-4.png "Opção Override Idle Timeout no rodapé do formulário de perfil" | Opcionalmente, **Override Idle Timeout** define um tempo de inatividade diferente para as contas desse perfil. Clique em **OK**.
:::

#### Na GUI: criando a conta

:::slides
midia/m01/01-5-admin-conta-1.png "Lista System > Administrators com o menu Create New aberto e a opção Administrator destacada" | Em **System > Administrators**, clique em **Create New > Administrator**.
midia/m01/01-5-admin-conta-2.png "Formulário New Administrator com Username carla.suporte, Type Local User e campos de senha" | Informe o **Username** (`carla.suporte`), escolha o tipo **Local User** e defina a senha.
midia/m01/01-5-admin-conta-3.png "Campo Administrator profile com Atlas-Leitura selecionado e Restrict login to trusted hosts ativado com 10.10.99.0/24" | Selecione o perfil **Atlas-Leitura** e restrinja os trusted hosts a `10.10.99.0/24`. Clique em **OK**.
:::

Os outros tipos de conta (autenticadas em LDAP, RADIUS ou por certificado) são configurados no módulo 07, depois que você aprender os servidores de autenticação.

#### Regras importantes

- **Um administrador não pode conceder mais do que tem.** Uma conta sem permissão de escrita em System não consegue criar outros administradores.
- **Use uma conta por pessoa.** Assim os logs mostram quem fez cada alteração.
- **Mantenha pelo menos duas contas `super_admin`** com senhas guardadas separadamente, ou uma conta de emergência em cofre. Se a única conta `super_admin` for bloqueada, restam a conta maintainer ou o reset.
- **Teste em uma segunda sessão.** Ao criar ou restringir uma conta, faça login com ela em uma janela anônima do navegador, **sem fechar** a sessão atual de `super_admin`. Se algo estiver errado, você corrige pela sessão que continua aberta.

#### Verificação

:::figura midia/m01/01-5-teste-leitura.png "GUI aberta com a conta carla.suporte em janela anônima, mostrando a lista de interfaces sem os botões de criar e editar"
Com a conta `carla.suporte` (perfil somente leitura), a GUI mostra a configuração, mas os botões de criação e edição ficam indisponíveis.
:::

- Faça login com `carla.suporte` em uma janela anônima: ela vê a configuração, mas não consegue alterar.
- O widget **Administrators** do dashboard mostra quem está conectado e por qual método (HTTPS, SSH, console).
- Toda alteração gera um log com o administrador, a origem e o que foi alterado, em **Log & Report > System Events**.

### 01.5.2. Proteção das contas

#### Política de senha

Por padrão, o FortiOS não impõe complexidade nas senhas de administradores. Defina uma política em **System > Settings**, seção **Password Policy**:

:::figura midia/m01/01-5-password-policy.png "Seção Password Policy de System > Settings com Minimum length 12, exigência de maiúsculas, minúsculas, números e caracteres especiais e expiração em 90 dias"
Na **Password Policy**, defina tamanho mínimo, tipos de caracteres exigidos e expiração. Ela pode valer para senhas de administradores e para chaves pré-compartilhadas de VPN.
:::

A política vale para as **próximas** definições de senha. Senhas existentes que não atendem à regra serão exigidas na próxima troca.

#### Bloqueio por tentativas

Para dificultar ataques de força bruta, o FortiGate bloqueia temporariamente a origem depois de várias tentativas de login falhas. Por padrão, são **3 tentativas** e **60 segundos** de bloqueio. Esses valores são ajustados pela CLI (Guia de comandos CLI).

#### Timeout de sessão

O **Idle timeout** (seção 01.4.2) encerra sessões inativas. Sessões esquecidas abertas são um risco, principalmente em computadores compartilhados.

#### E a conta `admin`?

A conta `admin` é conhecida por todos, inclusive por quem ataca. Boas práticas:

- crie contas nominais `super_admin` para as pessoas responsáveis;
- depois de testá-las, considere **remover** a conta `admin` (o FortiOS permite apagá-la desde que exista outro `super_admin`) ou, no mínimo, mantê-la com senha forte, trusted hosts restritos e guardada como conta de emergência;
- **nunca** use a conta `admin` no dia a dia.

> **Dica para a prova:** diferencie conta (System > Administrators) de perfil (System > Admin Profiles), conheça os perfis padrão `super_admin` e `prof_admin` e as proteções disponíveis: trusted hosts, bloqueio por tentativas e política de senha.

#### Erros comuns da seção 01.5

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

Lista as sessões administrativas ativas, com usuário, método de acesso e origem.

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

### 01.6.1. Registro, contratos e serviços FortiGuard

#### Conceito: o equipamento e os serviços são coisas separadas

Comprar um FortiGate não é a mesma coisa que ter todas as proteções funcionando. Há três camadas:

1. **O equipamento e o FortiOS:** firewall, roteamento, NAT, VPN e SD-WAN funcionam sem assinaturas de segurança.
2. **O suporte (FortiCare):** suporte técnico, substituição de hardware e acesso a atualizações de firmware.
3. **Os serviços de segurança (FortiGuard):** bases de assinaturas e consultas em nuvem que alimentam os perfis de segurança.

Os serviços FortiGuard normalmente são vendidos em **pacotes** (*bundles*). Os nomes e o conteúdo dos pacotes mudam ao longo do tempo, então consulte o datasheet atual. O importante é saber **qual função depende de qual serviço**:

| Função (módulo) | Serviço FortiGuard de que depende |
|---|---|
| Antivirus (12) | Serviço de Antivirus (bases de assinaturas e outbreak prevention) |
| IPS (11) | Serviço de IPS |
| Application Control (11) | Base de aplicações (costuma acompanhar o suporte FortiCare; confira no seu contrato) |
| Web Filter (10) | Serviço de Web Filtering (consulta de rating em nuvem) |
| DNS Filter (10) | Serviço de filtragem por DNS (normalmente associado ao Web Filtering) |
| Internet Service Database (03) | Base ISDB, atualizada pelo FortiGuard |
| Security Rating, IoT detection, sandbox em nuvem etc. | Serviços específicos, conforme o pacote |

#### Registro

O equipamento é registrado no portal **FortiCare** (support.fortinet.com) pelo número de série. É no registro que os contratos são vinculados ao equipamento. Em VMs, a licença é aplicada por um arquivo de licença ou por um token, conforme o modelo de licenciamento.

#### Na GUI: verificando licenças

:::slides
midia/m01/01-6-licencas-1.png "Widget Licenses no dashboard Status mostrando FortiCare Support, Firmware & General Updates, IPS, AntiVirus e Web Filtering com ícones de status" | No dashboard **Status**, o widget **Licenses** mostra cada serviço com um ícone de status: licenciado, expirando, expirado ou não licenciado.
midia/m01/01-6-licencas-2.png "Página System > FortiGuard com a tabela License Information listando cada serviço, versão da base e data de expiração" | Em **System > FortiGuard**, a tabela **License Information** detalha cada serviço, a versão da base e a **data de expiração** do contrato.
midia/m01/01-6-licencas-3.png "Linha de um serviço expandida em License Information, mostrando versões de engine e base e data da última atualização" | Expanda um serviço para ver as versões de engine e de base e quando foi a última atualização.
:::

### 01.6.2. Atualização de bases e consulta de rating

#### Dois tipos de comunicação com o FortiGuard

O FortiGate fala com o FortiGuard de duas formas diferentes, e é importante distingui-las:

1. **Download de atualizações:** bases de AV, IPS, aplicações e ISDB são **baixadas** e ficam no equipamento. Os perfis consultam essa cópia local. Se o FortiGuard ficar inacessível por um tempo, o AV e o IPS continuam funcionando com a última base baixada, só que ficam desatualizados.
2. **Consulta em tempo real (rating):** o Web Filter e o DNS Filter **perguntam** ao FortiGuard, a cada novo site ou domínio, em qual categoria ele está. Existe cache, mas sem a consulta não há categoria para sites novos. O perfil então aplica a ação configurada para **erro de rating** (permitir ou bloquear, módulo 10).

:::figura midia/m01/01-6-diagrama-fortiguard.png "Diagrama comparando download periódico de bases (AV, IPS, aplicações, ISDB) do FortiGuard para o FortiGate com consultas de rating em tempo real feitas pelo Web Filter e DNS Filter"
À esquerda, as bases baixadas periodicamente e usadas localmente. À direita, as consultas feitas em tempo real a cada novo site ou domínio.
:::

Essa diferença explica sintomas diferentes: sem comunicação com o FortiGuard, o AV continua bloqueando vírus conhecidos, mas o Web Filter pode deixar passar (ou bloquear) todos os sites sem classificação.

#### Na GUI: configurando as atualizações

:::slides
midia/m01/01-6-updates-1.png "Seção FortiGuard Updates de System > FortiGuard com Scheduled updates ativado e frequência Automatic" | Em **System > FortiGuard**, seção **FortiGuard Updates**, mantenha **Scheduled updates** ativado e escolha a frequência (automática, a cada X horas, diária ou semanal).
midia/m01/01-6-updates-2.png "Botão Update Licenses & Definitions Now destacado" | Para forçar uma atualização na hora, use **Update Licenses & Definitions Now**.
midia/m01/01-6-updates-3.png "Tabela License Information após a atualização, com a data da última atualização recente em AntiVirus e IPS" | Depois da atualização, confira em **License Information** se as versões e a data da última atualização mudaram.
:::

Nas versões atuais, o FortiGate usa por padrão os servidores **anycast** do FortiGuard, com comunicação por HTTPS. Em redes que restringem a saída, essas informações definem o que precisa ser liberado no firewall de borda (detalhes no Guia de comandos CLI).

#### Pré-requisitos para funcionar

Para o FortiGuard funcionar, o FortiGate precisa:

1. **de rota** até a Internet (módulo 02);
2. **de DNS do sistema** funcionando (seção 01.4);
3. **de hora correta**, porque a comunicação usa certificados (seção 01.4);
4. **de saída liberada** no caminho, se houver outro firewall ou proxy antes da Internet;
5. **de licença válida** para o serviço.

Quando a atualização falha, verifique nessa ordem. A verificação de rota, DNS e hora e o acompanhamento detalhado da atualização são feitos pela CLI (Guia de comandos CLI).

#### Diferencie três situações

| Situação | Como identificar | Efeito |
|---|---|---|
| **Licença vencida** | License Information mostra contrato expirado | As bases deixam de ser atualizadas; o rating de Web Filter para de responder |
| **Base desatualizada** (licença válida) | Licença válida, mas data da última atualização antiga | Proteção desatualizada, por problema de comunicação |
| **Falha de rating** | Web Filter registra erros de rating; as atualizações podem estar funcionando | Sites sem categoria; o perfil aplica a ação de erro de rating |

> **Dica para a prova:** as bases de AV e IPS são locais (baixadas). O Web Filter depende de consulta em tempo real ao FortiGuard.

#### Erros comuns da seção 01.6

- Supor que o perfil protege mesmo com a licença vencida ou sem comunicação com o FortiGuard.
- Investigar o FortiGuard sem antes verificar rota, DNS e hora do equipamento.
- Confundir falha de download de bases com falha de consulta de rating.

:::cli Licenciamento e FortiGuard
### Versões das bases e contratos

```
diagnose autoupdate versions
```

Lista cada base (AV, IPS, aplicações, ISDB etc.) com a versão, a data da última atualização, o resultado da última tentativa e a **data de expiração do contrato**. É o comando para responder "minha base está atualizada?" e "minha licença venceu?".

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
get router info routing-table all     # existe rota padrão? (módulo 02)
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

> **Atenção:** debugs consomem recursos e geram muita saída. Sempre os desligue ao terminar. Esse hábito vale para todo o curso.
:::

---

## 01.7. Backup, restauração e firmware

### 01.7.1. Backup e restauração

#### Conceito: o que é o arquivo de configuração

Toda a configuração do FortiGate (interfaces, policies, objetos, VPNs, usuários, certificados) fica em **um único arquivo de texto**. O backup é a cópia desse arquivo.

A primeira linha do arquivo identifica de onde ele veio:

```
#config-version=FGT60F-8.0.x-FW-buildXXXX-XXXXXX:opmode=0:vdom=0:user=admin
```

Ela informa o **modelo**, a **versão e o build** do FortiOS, o modo de operação, se há VDOMs e quem gerou o backup. Essas informações importam na hora de restaurar.

#### Backup comum e backup criptografado

O arquivo contém informações sensíveis: hashes de senhas de administradores, segredos de VPN, senhas de servidores LDAP e RADIUS e chaves privadas de certificados. Mesmo em um backup comum, esses segredos não aparecem em texto aberto: são armazenados de forma cifrada ou como hash (você verá linhas como `set password ENC ...`). Ainda assim, **o arquivo deve ser tratado como segredo**: com ele, alguém pode recriar o seu firewall em outro equipamento ou tentar atacar os segredos offline.

Por isso existe o **backup criptografado**: ao gerar o backup, você define uma senha, e o arquivo inteiro é cifrado. Para restaurar, a senha é obrigatória.

| Tipo | Vantagem | Cuidado |
|---|---|---|
| Comum | Legível; fácil de comparar e consultar | Guardar com o mesmo cuidado de uma senha |
| Criptografado | Protege o arquivo inteiro | Sem a senha, o backup é inútil; guarde a senha separada do arquivo |

#### Na GUI: fazendo o backup

:::slides
midia/m01/01-7-backup-1.png "Menu do administrador aberto no canto superior direito, com Configuration expandido e a opção Backup destacada" | Abra o **menu do administrador** (canto superior direito) e escolha **Configuration > Backup**.
midia/m01/01-7-backup-2.png "Janela Backup System Configuration com destino Local PC e a opção Encryption ativada com campos de senha" | Escolha o destino (**Local PC** ou **USB**), ative **Encryption** e defina a senha.
midia/m01/01-7-backup-3.png "Navegador mostrando o download do arquivo de backup .conf concluído" | Clique em **OK**. O arquivo `.conf` é baixado. Guarde-o fora do equipamento e a senha em outro lugar.
:::

#### Revisões de configuração

Além do backup manual, o FortiGate pode guardar **revisões** internas da configuração, quando há armazenamento disponível. Em **Configuration > Revisions** (menu do administrador), você vê as revisões, compara duas delas e restaura uma revisão.

:::figura midia/m01/01-7-revisions-diff.png "Tela Configuration > Revisions com duas revisões selecionadas e a comparação (diff) mostrando a linha do hostname alterada"
A comparação entre revisões mostra exatamente o que mudou de uma para outra. É uma forma rápida de descobrir "o que alguém alterou ontem".
:::

O FortiGate também pode criar revisões automaticamente quando um administrador sai e antes de uma atualização de firmware. Essas opções são ativadas pela CLI (Guia de comandos CLI).

> **Na prática:** revisões internas não substituem o backup externo. Se o equipamento queimar, as revisões vão com ele. Mantenha cópias fora do FortiGate, idealmente automatizadas (por exemplo, pelo FortiManager), e faça uma cópia antes de toda mudança relevante.

#### Na GUI: restauração

:::slides
midia/m01/01-7-restore-1.png "Menu do administrador com Configuration > Restore destacado" | No **menu do administrador**, escolha **Configuration > Restore**.
midia/m01/01-7-restore-2.png "Janela Restore System Configuration com o arquivo selecionado e o campo de senha preenchido" | Selecione o arquivo e informe a senha, se for criptografado. Clique em **OK**. O FortiGate **reinicia** ao final.
:::

Regras de restauração:

- **Mesmo modelo:** a restauração é direta.
- **Modelo diferente:** o FortiOS normalmente recusa o arquivo, porque nomes de interfaces e recursos de hardware diferem. A migração entre modelos exige adaptar a configuração (nomes de portas, interfaces inexistentes) ou usar ferramentas de conversão, sempre como um procedimento planejado.
- **Versão diferente de firmware:** restaurar um backup de outra versão pode funcionar com conversão, mas há risco de perder ou alterar configurações. O ideal é restaurar no mesmo build em que o backup foi gerado.

> **Atenção:** a restauração **substitui** toda a configuração atual e reinicia o equipamento. Se o backup tiver outro endereço de gerência ou outras restrições de acesso, você pode perder o acesso pela rede, então tenha a console à mão.

### 01.7.2. Ciclo de firmware

#### Versões do FortiOS

O FortiOS segue o formato **major.minor.patch**, por exemplo 8.0.2:

- **major.minor** (8.0): a "família" da versão, com seu conjunto de recursos;
- **patch** (.2): correções e alguns ajustes dentro da família;
- **build**: o número exato da imagem compilada (aparece no widget System Information).

A Fortinet classifica as versões como **Feature** (com recursos novos, ainda amadurecendo) e **Mature** (estáveis, recomendadas para produção). Em produção, a recomendação geral é usar versões Mature, a menos que você precise de um recurso específico.

#### O que ler antes de atualizar: o release notes

Antes de qualquer atualização, leia o **release notes** da versão de destino. Ele traz:

- **Supported upgrade path:** de quais versões é possível atualizar diretamente;
- **Changes in default behavior / changes in CLI:** o que muda de comportamento ou de comando;
- **Known issues:** problemas conhecidos que podem afetar o seu ambiente;
- **Resolved issues:** o que foi corrigido;
- **Product integration and support:** compatibilidade com FortiAnalyzer, FortiManager, FortiClient, FortiSwitch, FortiAP etc.;
- **Recursos removidos ou alterados**, inclusive limitações por modelo.

#### Upgrade path

Não se deve "pular" livremente de uma versão antiga para uma muito nova. Cada salto converte a configuração, e algumas conversões só funcionam a partir de versões intermediárias. A Fortinet oferece a ferramenta **Upgrade Path** no portal de suporte: você informa o modelo, a versão atual e a de destino, e ela mostra a sequência de versões intermediárias recomendada.

:::figura midia/m01/01-7-upgrade-path-tool.png "Ferramenta Upgrade Path do portal de suporte Fortinet com modelo, versão atual e versão de destino preenchidos e a sequência recomendada exibida"
A ferramenta **Upgrade Path** mostra os saltos intermediários recomendados entre a versão atual e a de destino.
:::

> **Dica para a prova:** atualizar fora do caminho recomendado pode causar perda ou corrupção de configuração. Siga o upgrade path e faça backup antes.

#### Procedimento de atualização

1. **Planeje:** escolha a versão, leia o release notes, consulte o upgrade path e verifique a compatibilidade dos produtos integrados.
2. **Faça backup** da configuração e guarde fora do equipamento.
3. **Registre o estado atual:** versão, recursos em uso e alguns testes de referência (acesso à Internet, VPN ativa, autenticação), para comparar depois.
4. **Agende uma janela de manutenção:** o equipamento reinicia.
5. **Atualize pela GUI** (passo a passo abaixo).
6. **Valide:** confira a versão no widget System Information, repita os testes de referência, verifique os logs de eventos e compare a configuração com o backup.

:::slides
midia/m01/01-7-firmware-1.png "Página System > Firmware & Registration com o FGT-MTZ listado, versão atual e botão Upgrade" | Acesse **System > Firmware & Registration** (o nome do menu pode variar entre versões), selecione o equipamento e clique em **Upgrade**.
midia/m01/01-7-firmware-2.png "Janela de upgrade com as abas Latest, All Upgrades e File Upload e uma versão Mature selecionada" | Escolha a versão. As imagens oficiais vêm do FortiGuard (**Latest** ou **All Upgrades**), ou você pode enviar um arquivo baixado do portal de suporte (**File Upload**).
midia/m01/01-7-firmware-3.png "Tela de confirmação do upgrade mostrando o caminho de atualização com versões intermediárias e a opção de backup da configuração" | A GUI mostra o caminho de atualização, inclusive versões intermediárias, e oferece fazer o **backup** antes. Confirme.
midia/m01/01-7-firmware-4.png "Widget System Information após o reboot mostrando a nova versão de firmware" | Após o reinício, confirme a nova versão no widget **System Information** e execute os testes de validação.
:::

O FortiOS verifica a **assinatura digital** da imagem e alerta se ela não for oficial da Fortinet. Baixe imagens somente do FortiGuard ou do portal de suporte.

#### Plano de retorno: as duas partições

A maioria dos FortiGates físicos tem **duas partições de firmware**. Ao atualizar, a nova imagem é gravada em uma partição e a anterior fica preservada na outra. Isso permite voltar rapidamente à versão anterior escolhendo de qual partição o equipamento vai iniciar no próximo boot. Essa operação é feita pela CLI (Guia de comandos CLI).

Mesmo assim, **mantenha o backup** feito na versão anterior: ao voltar, você pode precisar restaurar a configuração exata daquele momento.

#### Downgrade

Voltar para uma versão mais antiga (downgrade) é possível, mas a configuração convertida para a versão nova pode não ser compreendida pela antiga, e parte dela pode se perder. O procedimento recomendado é instalar a versão antiga e **restaurar o backup gerado naquela versão**.

### 01.7.3. Recuperação de firmware *(Aprofundamento)*

Se o firmware estiver corrompido e o equipamento não inicializar, ainda é possível instalar uma imagem pelo **menu de boot** (BIOS), acessado pela console:

1. Prepare um **servidor TFTP** com a imagem, conectado diretamente à porta que o menu de boot usa para TFTP (normalmente a porta de gerência ou uma porta interna; varia por modelo).
2. Conectado à console, reinicie o equipamento e **interrompa o boot** pressionando uma tecla quando a mensagem aparecer.
3. No menu, configure os parâmetros TFTP (IP do servidor, IP local temporário, máscara, nome do arquivo) e inicie a transferência. As letras e opções do menu variam entre modelos e versões de BIOS; a opção de ajuda do menu lista todas.
4. Ao final, o equipamento grava a imagem e reinicia.

:::figura midia/m01/01-7-menu-boot.png "Console serial exibindo o menu de boot do FortiGate com as opções de configurar TFTP, iniciar transferência, formatar e sair"
O menu de boot, acessado pela console ao interromper a inicialização. As opções variam conforme o modelo e a versão da BIOS.
:::

O menu de boot também tem a opção de **formatar** o dispositivo de boot, que apaga firmware e configuração. Use somente quando for essa a recomendação, e com o backup em mãos.

> **Atenção:** a recuperação pelo menu de boot é um procedimento de emergência. Faça com calma, pela console, com a imagem correta para o seu modelo e um backup disponível.

#### Erros comuns da seção 01.7

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
execute restore image tftp FGT_60F-v8-buildXXXX-FORTINET.out 10.10.99.10
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

## Laboratório do módulo 01 — preparando o FGT-MTZ

**Objetivo:** deixar o FGT-MTZ acessível pela rede de gerência, identificado, com administração protegida, licenças verificadas e backup.

**Você vai precisar de:** o FGT-MTZ (físico ou VM) com configuração de fábrica, acesso à console e a estação de administração 10.10.99.10 conectada à interface de gerência.

> A sincronização NTP, a verificação do FortiGuard e o download de bases exigem acesso à Internet, que será configurado no módulo 02. Neste laboratório você deixa tudo configurado; a confirmação desses itens é refeita ao final do módulo 02.

### Parte 1 — Primeiro acesso pela console

1. Conecte-se à console (9600 8N1).
2. Faça login com `admin` e senha em branco e defina uma senha forte.
3. Configure a interface de gerência com os comandos da seção 01.2.1 (endereço 10.10.99.1/24, com PING, HTTPS e SSH).
4. Da estação 10.10.99.10, acesse `https://10.10.99.1`.

### Parte 2 — Conhecendo o equipamento

1. No dashboard **Status**, anote do widget **System Information**: modelo, versão, build, número de série e modo de operação.
2. Abra a **CLI Console** da GUI e execute `get system status`. Compare com o widget e anote o modo de HA.
3. Na CLI Console, compare `show system interface mgmt` com `show full-configuration system interface mgmt` e identifique três atributos que só aparecem no segundo.
4. Em **System > Feature Visibility**, habilite **DNS Database** e confirme que **Network > DNS Servers** apareceu.

### Parte 3 — Hostname, hora e DNS

1. Em **System > Settings**, defina o hostname `FGT-MTZ`, o fuso horário e o NTP com o servidor `a.ntp.br`.
2. Confirme o novo hostname no topo da GUI e no prompt da CLI Console.
3. Em **Network > DNS**, mantenha os servidores FortiGuard ou especifique os servidores da Atlas.

### Parte 4 — Acesso administrativo seguro

1. Em **System > Settings > Administration Settings**, defina o **Idle timeout** em 15 minutos e confirme o redirecionamento para HTTPS.
2. Na interface `mgmt`, confirme que apenas **PING**, **HTTPS** e **SSH** estão marcados em **Administrative Access**.
3. Ative a **Password Policy** (mínimo de 12 caracteres, com maiúsculas, minúsculas, números e caracteres especiais).
4. Pelo Guia de comandos CLI da seção 01.5, ajuste o bloqueio por tentativas para 300 segundos.

### Parte 5 — Administradores e perfis

1. Crie o perfil `Atlas-Leitura` (somente leitura em todas as áreas).
2. Crie o administrador nominal `joao.admin` com perfil `super_admin` e trusted host 10.10.99.0/24.
3. Crie o administrador `carla.suporte` com perfil `Atlas-Leitura` e trusted host 10.10.99.0/24.
4. **Sem fechar a sessão atual**, abra uma janela anônima e faça login com `joao.admin`. Depois, faça login com `carla.suporte` e tente alterar o hostname: a alteração não deve ser possível.
5. Restrinja o `admin` com trusted host 10.10.99.0/24, ou remova-o após validar o `joao.admin`.
6. Em **Log & Report > System Events**, encontre o login de cada conta e a alteração de hostname da Parte 3.

### Parte 6 — Licenças e FortiGuard

1. Consulte o widget **Licenses** e a tabela **License Information** em **System > FortiGuard**.
2. Anote, para AV e IPS, a versão da base e a data de expiração do contrato.
3. Confirme que **Scheduled updates** está ativado. A atualização efetiva será testada no módulo 02.

### Parte 7 — Backup e plano de firmware

1. Gere um **backup criptografado** pela GUI e guarde a senha separadamente.
2. Gere também um backup **não** criptografado e abra em um editor de texto: identifique a linha `#config-version`, o bloco de administradores e o formato das senhas (`ENC`). Depois, apague esse arquivo.
3. Em **Configuration > Revisions**, compare duas revisões e localize a alteração de hostname.
4. Escreva um **plano de atualização** para a próxima versão disponível do seu FortiOS: versão de destino, upgrade path, itens do release notes que afetam a Atlas, testes de validação e procedimento de retorno. (A execução do upgrade é opcional neste módulo.)

---

## Critério de conclusão

Você concluiu o módulo 01 se consegue:

- [ ] acessar um FortiGate novo pela console e pela rede e trocar a senha inicial;
- [ ] identificar modelo, versão, build, número de série e modo de operação na GUI e com `get system status`;
- [ ] explicar a diferença entre `show`, `show full-configuration` e `get`;
- [ ] explicar a diferença entre `set`, `append` e `unselect` em listas e entre `end` e `abort`;
- [ ] configurar hostname, fuso, NTP e DNS do sistema e explicar por que a hora importa;
- [ ] restringir a gerência por interface e por trusted hosts **sem perder o acesso**;
- [ ] criar um perfil administrativo e uma conta e comprovar a restrição em outra sessão;
- [ ] verificar licenças e versões das bases e explicar a diferença entre bases locais e consulta de rating;
- [ ] gerar um backup criptografado e explicar o que ele contém e como restaurá-lo;
- [ ] apresentar um plano de atualização de firmware com upgrade path e retorno.

---

## Questões de revisão

**1.** Um administrador executa `show system interface port1` e não vê a linha `set mtu`. O que isso significa?

- a) A interface não suporta configuração de MTU.
- b) O MTU está no valor padrão; para vê-lo, use `show full-configuration` ou `get`.
- c) O MTU foi apagado e a interface está sem MTU.
- d) O comando `show` só exibe atributos de interfaces físicas.

**2.** Uma interface tem `allowaccess ping https ssh`. O administrador executa `set allowaccess snmp` e salva. Qual é o resultado?

- a) `ping https ssh snmp`
- b) `snmp`
- c) `ping https ssh`, porque o SNMP precisa ser habilitado globalmente antes
- d) O comando é rejeitado por conflito

**3.** Todos os administradores, exceto um, têm trusted hosts configurados para 10.10.99.0/24. O que acontece quando alguém de fora dessa rede acessa a GUI?

- a) A conexão é bloqueada antes de exibir a página de login.
- b) A página de login responde, mas só a conta sem trusted hosts consegue logar de fora dessa rede.
- c) Ninguém consegue logar, porque basta uma conta com trusted hosts para restringir todas.
- d) Todos conseguem logar, porque os trusted hosts só valem para SSH.

**4.** Sobre a recuperação de senha com a conta maintainer em um FortiGate físico, qual afirmação está correta?

- a) Funciona por SSH a partir de qualquer interface com SSH habilitado.
- b) Exige acesso pela console e reinício por ciclo de energia, e pode ser desabilitada pelo administrador.
- c) Apaga toda a configuração do equipamento.
- d) Funciona após `execute reboot`, desde que o login seja feito em até 10 minutos.

**5.** Um FortiGate com licenças válidas perdeu a comunicação com o FortiGuard há dois dias. Qual é o efeito mais provável?

- a) O AV e o IPS param de funcionar imediatamente.
- b) O AV e o IPS continuam funcionando com as últimas bases baixadas; o Web Filter pode falhar ao classificar sites novos e aplica a ação de erro de rating.
- c) Nada muda, porque todas as funções usam somente bases locais.
- d) O firewall bloqueia todo o tráfego até a comunicação voltar.

**6.** Qual comando mostra, em uma única saída, a versão do FortiOS, o número de série, o modo de operação e o modo de HA?

- a) `get system performance status`
- b) `show system global`
- c) `get system status`
- d) `diagnose autoupdate versions`

**7.** Um administrador entrou em `config firewall address`, editou um objeto, alterou dois atributos e percebeu que estava no objeto errado. Como sair sem gravar as alterações desse objeto?

- a) `end`
- b) `next`
- c) `abort`
- d) `unset all`

**8.** Um administrador quer restaurar o backup de um FortiGate 60F em um FortiGate 100F. O que é esperado?

- a) A restauração é direta, porque o FortiOS é o mesmo.
- b) O arquivo tende a ser recusado ou exigir adaptação, porque o modelo (e os nomes de interfaces) é diferente.
- c) Só funciona se o backup for criptografado.
- d) Funciona se ambos tiverem a mesma licença FortiGuard.

**9.** Um recurso descrito no Administration Guide não aparece no menu da GUI. Qual deve ser a primeira verificação?

- a) Fazer upgrade para a versão mais recente.
- b) Conferir se o recurso está oculto em Feature Visibility.
- c) Fazer reset de fábrica para restaurar os menus.
- d) Reinstalar o firmware pelo menu de boot.

**10.** Ao planejar a atualização de firmware, qual prática é recomendada?

- a) Ir direto à versão mais nova para reduzir o número de reinícios.
- b) Seguir o upgrade path recomendado, ler o release notes e fazer backup antes.
- c) Atualizar primeiro e fazer o backup depois, para que ele já esteja na versão nova.
- d) Fazer downgrade antes do upgrade para limpar a configuração.

**11.** Um administrador com perfil sem permissão de escrita em System tenta criar uma nova conta `super_admin`. O que acontece?

- a) A conta é criada, mas fica desabilitada.
- b) A operação é negada: um administrador não pode conceder mais privilégios do que tem.
- c) A conta é criada com o mesmo perfil do criador.
- d) A conta é criada e precisa de aprovação de outro `super_admin`.

**12.** Após um upgrade, um serviço crítico passou a falhar. Qual recurso permite voltar rapidamente à versão anterior em muitos FortiGates físicos?

- a) Fazer reset de fábrica.
- b) Iniciar pela outra partição de firmware, que mantém a imagem anterior.
- c) Restaurar uma revisão de configuração da versão nova.
- d) Desabilitar a atualização automática do FortiGuard.

### Gabarito comentado

1. **b** — o `show` exibe só valores diferentes do padrão. O MTU existe, mas está no padrão.
2. **b** — `set` substitui a lista inteira. Para acrescentar, use `append allowaccess snmp`.
3. **b** — trusted hosts são por administrador. Como uma conta não tem restrição, o serviço continua respondendo e essa conta consegue logar de qualquer origem.
4. **b** — a conta maintainer exige console e ciclo de energia e pode ser desabilitada. Ela não apaga a configuração.
5. **b** — as bases de AV e IPS são locais e continuam em uso (desatualizadas). O Web Filter depende de consulta em tempo real.
6. **c** — `get system status` reúne versão, série, modo de operação, VDOM e HA.
7. **c** — `abort` sai do item sem gravar. `next` e `end` gravam.
8. **b** — o arquivo de configuração identifica o modelo, e as interfaces diferem; a migração entre modelos é um procedimento planejado.
9. **b** — muitos recursos ficam ocultos por padrão em Feature Visibility.
10. **b** — upgrade path, release notes e backup são a base de uma atualização segura.
11. **b** — o FortiOS não permite que um administrador conceda privilégios acima dos seus.
12. **b** — a imagem anterior fica na outra partição, e a CLI permite escolher a partição do próximo boot. Mantenha também o backup da versão anterior.

---

## Lista de capturas do módulo

Capturas a produzir no laboratório para este módulo. Enquanto o arquivo não existir, o visualizador mostra um quadro de captura pendente com esta descrição.

| Seção | Arquivo | Tipo | O que mostrar |
|---|---|---|---|
| Abertura | `midia/m01/00-topologia-gerencia.png` | Imagem | Diagrama: estação do administrador (10.10.99.10) ligada à porta mgmt do FGT-MTZ (10.10.99.1) e notebook ligado à porta CONSOLE |
| 01.1 | `midia/m01/01-1-tour-gui.mp4` | Vídeo | Vídeo curto percorrendo o menu lateral da GUI do FGT-MTZ, abrindo cada menu principal e usando a busca do menu |
| 01.1 | `midia/m01/01-1-elementos-gui.png` | Imagem | Tela da GUI com destaques numerados: (1) busca do menu, (2) ícone da console CLI, (3) notificações, (4) menu do administrador, (5) coluna Ref. em uma lista |
| 01.1 | `midia/m01/01-1-system-information.png` | Imagem | Dashboard Status com o widget System Information do FGT-MTZ: hostname, número de série, firmware, modo de operação, uptime e horário do sistema |
| 01.1 | `midia/m01/01-1-feature-visibility-1.png` | Imagem | Menu System com o item Feature Visibility destacado |
| 01.1 | `midia/m01/01-1-feature-visibility-2.png` | Imagem | Página Feature Visibility com a lista de recursos e a chave DNS Database destacada |
| 01.1 | `midia/m01/01-1-feature-visibility-3.png` | Imagem | Botão Apply no rodapé da página Feature Visibility |
| 01.1 | `midia/m01/01-1-feature-visibility-4.png` | Imagem | Menu Network mostrando o novo item DNS Servers |
| 01.2 | `midia/m01/01-2-putty-serial.png` | Imagem | Janela de configuração do PuTTY com Connection type Serial, porta COM3 e velocidade 9600 |
| 01.2 | `midia/m01/01-2-primeiro-login.gif` | GIF | Animação: tela de login da GUI, login como admin com senha em branco, tela obrigatória de troca de senha e entrada no assistente inicial |
| 01.3 | `midia/m01/01-3-lista-objetos-1.png` | Imagem | Página Policy & Objects > Addresses com a barra de botões Create New, Edit, Clone e Delete destacada |
| 01.3 | `midia/m01/01-3-lista-objetos-2.png` | Imagem | Busca da lista filtrando objetos pelo texto digitado |
| 01.3 | `midia/m01/01-3-lista-objetos-3.png` | Imagem | Menu de configuração de colunas aberto, com a opção de exibir a coluna Ref. |
| 01.3 | `midia/m01/01-3-lista-objetos-4.png` | Imagem | Janela de referências aberta ao clicar no número da coluna Ref., listando as policies que usam o objeto |
| 01.3 | `midia/m01/01-3-cli-console-gui.png` | Imagem | CLI Console aberta dentro da GUI, mostrando o prompt FGT-MTZ # e a saída de um comando |
| 01.4 | `midia/m01/01-4-system-settings-1.png` | Imagem | Página System > Settings com o campo Host name preenchido com FGT-MTZ |
| 01.4 | `midia/m01/01-4-system-settings-2.png` | Imagem | Seção System Time da página System > Settings com o seletor de Time Zone aberto |
| 01.4 | `midia/m01/01-4-system-settings-3.png` | Imagem | Seção System Time com Set Time em NTP, opção Custom e servidor a.ntp.br preenchido, e campo Sync interval |
| 01.4 | `midia/m01/01-4-system-settings-4.png` | Imagem | Botão Apply e o prompt da CLI Console mostrando FGT-MTZ # após a alteração |
| 01.4 | `midia/m01/01-4-dns-1.png` | Imagem | Página Network > DNS com a opção Use FortiGuard Servers selecionada |
| 01.4 | `midia/m01/01-4-dns-2.png` | Imagem | Página Network > DNS com a opção Specify selecionada e campos Primary DNS Server e Secondary DNS Server |
| 01.4 | `midia/m01/01-4-dns-3.png` | Imagem | Opções de protocolo do DNS do sistema, com DNS over TLS destacado |
| 01.4 | `midia/m01/01-4-admin-access-1.png` | Imagem | Lista Network > Interfaces com a interface mgmt selecionada e o botão Edit destacado |
| 01.4 | `midia/m01/01-4-admin-access-2.png` | Imagem | Tela de edição da interface mgmt com a seção Administrative Access e as caixas PING, HTTPS e SSH marcadas |
| 01.4 | `midia/m01/01-4-admin-access-3.png` | Imagem | Tela de edição da interface WAN com todas as caixas de Administrative Access desmarcadas |
| 01.4 | `midia/m01/01-4-administration-settings.png` | Imagem | Seção Administration Settings de System > Settings com os campos HTTP port, HTTPS port, Redirect to HTTPS, SSH port e Idle timeout |
| 01.4 | `midia/m01/01-4-trusted-hosts-1.png` | Imagem | Lista System > Administrators com a conta admin selecionada e o botão Edit destacado |
| 01.4 | `midia/m01/01-4-trusted-hosts-2.png` | Imagem | Tela de edição do administrador com a opção Restrict login to trusted hosts ativada e Trusted Host 1 igual a 10.10.99.0/24 |
| 01.4 | `midia/m01/01-4-trusted-hosts-3.png` | Imagem | Mensagem de falha de login ao tentar acessar a partir de uma origem fora dos trusted hosts |
| 01.4 | `midia/m01/01-4-log-login.png` | Imagem | Log & Report > System Events filtrado por logins administrativos, com uma linha de login bem-sucedido e outra de login recusado |
| 01.5 | `midia/m01/01-5-admin-profile-1.png` | Imagem | Lista System > Admin Profiles com os perfis super_admin e prof_admin e o botão Create New destacado |
| 01.5 | `midia/m01/01-5-admin-profile-2.png` | Imagem | Formulário New Admin Profile com Name Atlas-Leitura e a tabela Access Permissions com a coluna Read marcada em todas as áreas |
| 01.5 | `midia/m01/01-5-admin-profile-3.png` | Imagem | Formulário de perfil Atlas-Operador-Firewall com Firewall em Custom, Policy em Read/Write e os demais objetos em Read |
| 01.5 | `midia/m01/01-5-admin-profile-4.png` | Imagem | Opção Override Idle Timeout no rodapé do formulário de perfil |
| 01.5 | `midia/m01/01-5-admin-conta-1.png` | Imagem | Lista System > Administrators com o menu Create New aberto e a opção Administrator destacada |
| 01.5 | `midia/m01/01-5-admin-conta-2.png` | Imagem | Formulário New Administrator com Username carla.suporte, Type Local User e campos de senha |
| 01.5 | `midia/m01/01-5-admin-conta-3.png` | Imagem | Campo Administrator profile com Atlas-Leitura selecionado e Restrict login to trusted hosts ativado com 10.10.99.0/24 |
| 01.5 | `midia/m01/01-5-teste-leitura.png` | Imagem | GUI aberta com a conta carla.suporte em janela anônima, mostrando a lista de interfaces sem os botões de criar e editar |
| 01.5 | `midia/m01/01-5-password-policy.png` | Imagem | Seção Password Policy de System > Settings com Minimum length 12, exigência de maiúsculas, minúsculas, números e caracteres especiais e expiração em 90 dias |
| 01.6 | `midia/m01/01-6-licencas-1.png` | Imagem | Widget Licenses no dashboard Status mostrando FortiCare Support, Firmware & General Updates, IPS, AntiVirus e Web Filtering com ícones de status |
| 01.6 | `midia/m01/01-6-licencas-2.png` | Imagem | Página System > FortiGuard com a tabela License Information listando cada serviço, versão da base e data de expiração |
| 01.6 | `midia/m01/01-6-licencas-3.png` | Imagem | Linha de um serviço expandida em License Information, mostrando versões de engine e base e data da última atualização |
| 01.6 | `midia/m01/01-6-diagrama-fortiguard.png` | Imagem | Diagrama comparando download periódico de bases (AV, IPS, aplicações, ISDB) do FortiGuard para o FortiGate com consultas de rating em tempo real feitas pelo Web Filter e DNS Filter |
| 01.6 | `midia/m01/01-6-updates-1.png` | Imagem | Seção FortiGuard Updates de System > FortiGuard com Scheduled updates ativado e frequência Automatic |
| 01.6 | `midia/m01/01-6-updates-2.png` | Imagem | Botão Update Licenses & Definitions Now destacado |
| 01.6 | `midia/m01/01-6-updates-3.png` | Imagem | Tabela License Information após a atualização, com a data da última atualização recente em AntiVirus e IPS |
| 01.7 | `midia/m01/01-7-backup-1.png` | Imagem | Menu do administrador aberto no canto superior direito, com Configuration expandido e a opção Backup destacada |
| 01.7 | `midia/m01/01-7-backup-2.png` | Imagem | Janela Backup System Configuration com destino Local PC e a opção Encryption ativada com campos de senha |
| 01.7 | `midia/m01/01-7-backup-3.png` | Imagem | Navegador mostrando o download do arquivo de backup .conf concluído |
| 01.7 | `midia/m01/01-7-revisions-diff.png` | Imagem | Tela Configuration > Revisions com duas revisões selecionadas e a comparação (diff) mostrando a linha do hostname alterada |
| 01.7 | `midia/m01/01-7-restore-1.png` | Imagem | Menu do administrador com Configuration > Restore destacado |
| 01.7 | `midia/m01/01-7-restore-2.png` | Imagem | Janela Restore System Configuration com o arquivo selecionado e o campo de senha preenchido |
| 01.7 | `midia/m01/01-7-upgrade-path-tool.png` | Imagem | Ferramenta Upgrade Path do portal de suporte Fortinet com modelo, versão atual e versão de destino preenchidos e a sequência recomendada exibida |
| 01.7 | `midia/m01/01-7-firmware-1.png` | Imagem | Página System > Firmware & Registration com o FGT-MTZ listado, versão atual e botão Upgrade |
| 01.7 | `midia/m01/01-7-firmware-2.png` | Imagem | Janela de upgrade com as abas Latest, All Upgrades e File Upload e uma versão Mature selecionada |
| 01.7 | `midia/m01/01-7-firmware-3.png` | Imagem | Tela de confirmação do upgrade mostrando o caminho de atualização com versões intermediárias e a opção de backup da configuração |
| 01.7 | `midia/m01/01-7-firmware-4.png` | Imagem | Widget System Information após o reboot mostrando a nova versão de firmware |
| 01.7 | `midia/m01/01-7-menu-boot.png` | Imagem | Console serial exibindo o menu de boot do FortiGate com as opções de configurar TFTP, iniciar transferência, formatar e sair |

---

**Próximo módulo:** 02 — Interfaces e serviços de rede. O FGT-MTZ ganha WAN, VLANs, DMZ e rota padrão, e os itens que dependiam de Internet neste módulo (NTP e FortiGuard) são confirmados.
