# FortiGate 8.0.x — módulos na ordem de aprendizagem

Revisão 5 · 09/11/2026. A hierarquia é **módulo → seção → tópico**. A numeração é a sequência de estudo; não há uma camada adicional reunindo módulos independentes como se fossem um único assunto.

Uma divisão só existe quando muda o objetivo, o mecanismo ou a implementação. Configuração e validação de uma mesma função podem compartilhar a seção. Não existe quantidade mínima artificial de seções por módulo. As retomadas acrescentam contexto e não obrigam a ensinar uma família inteira no primeiro contato.

ZTNA básico entra logo após certificados, publicação, identidade e postura. Cloud/VM e SASE têm objetivos e módulos próprios. Os capítulos não exigem BGP, ADVPN ou LAN gerenciada para compreender uma função que não depende deles.

A grade ensina apenas funcionamento, configuração e uso do FortiGate. Não contém fundamentos genéricos de redes ou preparação de laboratório. Cada seção tem um resultado e cada módulo possui demonstração e critério de conclusão.

## Sequência dos módulos

### 01. Operação inicial do FortiGate

**Base já ensinada:** Início da sequência.
**Retoma:** Primeira passagem.
**Base atual:** C01; ampliar conforme o escopo desta passagem.
**Objetivo:** Localizar recursos, consultar o estado do equipamento e realizar alterações básicas pela GUI e CLI. Identificar o que é configuração do FortiGate, o que depende de licença e como preservar acesso e configuração.
**Por que nesta posição:** Este é o ponto inicial: consultar e alterar o FortiGate com acesso e recuperação básicos. Os demais recursos entram quando houver uma comunicação ou uma tarefa concreta para explicá-los.

#### 01.1. FortiOS, plataforma e recursos disponíveis

**Aprendizado da seção:** Reconhecer a plataforma usada e explicar por que um recurso pode existir na documentação sem aparecer naquele equipamento.

- **01.1.1. O que o FortiGate faz e onde cada função aparece:** Percorrer os menus System, Network, Policy & Objects, Security Profiles, VPN e Log & Report. Relacionar cada menu a uma tarefa do equipamento e distinguir recurso nativo de integração com outro produto Fortinet.
- **01.1.2. Modelo, versão, modo de operação e licença:** Consultar modelo, build, recursos de hardware, registro e assinaturas FortiGuard. Demonstrar Feature Visibility e conferir suporte por modelo e versão, sem tratar menu oculto como prova de ausência da função.

#### 01.2. GUI e CLI como formas de operar a mesma configuração

**Aprendizado da seção:** Consultar e alterar uma configuração simples, entendendo escopo, persistência e referências entre objetos.

- **01.2.1. Navegação, dashboards e consulta de configuração:** Identificar contexto, campos obrigatórios, ajuda e monitores da GUI. Comparar um objeto visto na interface com sua representação em CLI usando consultas de configuração e distinguir valor explícito de valor padrão.
- **01.2.2. Estrutura de comandos e aplicação de alterações:** Usar os contextos config, edit, set, unset, next e end em um objeto simples. Explicar quando a alteração passa a valer e reconhecer erros de sintaxe, dependência ou permissão antes de tentar contorná-los.

#### 01.3. Configurações essenciais do próprio FortiGate

**Aprendizado da seção:** Deixar o equipamento identificável, com horário correto e acesso administrativo controlado, mantendo possibilidade de recuperação.

- **01.3.1. Hostname, hora, DNS e acesso administrativo inicial:** Configurar identidade, timezone, NTP e DNS do FortiGate. Habilitar somente os métodos administrativos necessários em uma interface e verificar que o acesso administrativo é uma conexão destinada ao equipamento, diferente do tráfego dos usuários.
- **01.3.2. Administrador e cópia inicial de configuração:** Criar acesso administrativo com permissões adequadas e testar uma segunda sessão antes de encerrar a primeira. Gerar backup protegido e explicar por que senhas, segredos recuperáveis e criptografia do arquivo exigem tratamentos diferentes.

**Prática e evidência:** Consultar modelo/build, alterar hostname pela CLI, confirmar na GUI, restringir um método de gerência e produzir uma cópia protegida da configuração.

**Critério de conclusão:** O aluno encontra uma configuração, explica seu escopo e comprova a alteração sem perder o acesso ao FortiGate.

### 02. Interfaces I: conexão e agrupamento básico

**Base já ensinada:** 01
**Retoma:** Primeira passagem.
**Base atual:** C01; ampliar conforme o escopo desta passagem.
**Objetivo:** Configurar interfaces simples, uma VLAN, agrupamento básico e uma rota conhecida. Identificar por onde a comunicação entra e sai para aprender firewall policies na sequência.
**Por que nesta posição:** O aluno precisa de entrada e saída identificáveis para entender a primeira regra. Agregação, redundância, transparent mode, VWP, VDOM e IPv6 pertencem a passagens posteriores.

#### 02.1. Portas e endereçamento inicial

**Aprendizado da seção:** Identificar e endereçar as interfaces usadas na primeira comunicação.

- **02.1.1. Identificação, estado e acesso à porta:** Localizar a porta, definir nome/alias e observar enlace e endereço. Habilitar somente o método administrativo necessário e distinguir interface ativa de autorização para atravessar o firewall.
- **02.1.2. Endereço fixo e interface de saída:** Configurar endereços estáticos nas interfaces do primeiro cenário e verificar o gateway alcançável. O objetivo desta passagem é um caminho simples e estável; clientes DHCP e PPPoE serão configurados na retomada de conectividade WAN.

#### 02.2. VLANs básicas

**Aprendizado da seção:** Criar uma subinterface VLAN e reconhecer o tráfego que chega à interface pai.

- **02.2.1. Subinterfaces VLAN e dependência da interface pai:** Criar uma interface VLAN no FortiGate e associar endereço e serviços locais. Confirmar recepção do tráfego marcado e diferenciar ausência de quadros na VLAN de bloqueio por uma policy.

#### 02.3. Agrupamento simples de interfaces

**Aprendizado da seção:** Distinguir uma zone de um switch local sem introduzir redundância ou arquiteturas complexas.

- **02.3.1. Zones e tráfego entre membros:** Agrupar interfaces em uma zone e observar como o conjunto é selecionado nas regras. Comparar permitir e bloquear tráfego entre os membros e reconhecer dependências que impedem mover uma interface.
- **02.3.2. Switch local básico:** Identificar membros de um switch local já existente e verificar como eles compartilham uma interface lógica. Comparar esse agrupamento com uma zone pelo endereçamento e pelo caminho do tráfego; a arquitetura e a redundância serão retomadas depois.

#### 02.4. Uma rota para a primeira policy

**Aprendizado da seção:** Identificar uma saída válida antes de aprender a autorizar o tráfego.

- **02.4.1. Rotas conectadas, rota padrão e gateway:** Localizar rotas conectadas e criar a rota padrão com interface e gateway corretos. Conferir a rota ativa, a resolução do próximo salto e a diferença entre ping originado no FortiGate e comunicação de um cliente.
- **02.4.2. Como interface, rota e policy se relacionam:** Acompanhar uma consulta de rota para identificar a interface de saída que será usada no próximo módulo. Demonstrar que ter rota não autoriza a conexão e que uma policy não substitui uma rota ausente.

**Prática e evidência:** Configurar duas interfaces, identificar uma VLAN e uma zone e confirmar o gateway e a rota. Usar endereçamento simples para deixar o caminho da primeira comunicação explícito.

**Critério de conclusão:** O aluno identifica entrada, saída, endereço e agrupamento sem atribuir a uma interface ou rota a função de autorizar a conexão.

### 03. Firewall policies I: construir e entender a primeira regra

**Base já ensinada:** 02
**Retoma:** Primeira passagem.
**Base atual:** C02; ampliar conforme o escopo desta passagem.
**Objetivo:** Criar uma firewall policy por interfaces, endereços e serviço e explicar a ordem de avaliação e a resposta stateful. Aprender os objetos necessários à regra e comprovar um acesso permitido e outro negado.
**Por que nesta posição:** A primeira policy usa apenas interfaces e uma rota já conhecidas. Identidade, certificados e VPN não participam desse primeiro aprendizado.

#### 03.1. O que são firewall policies e como funcionam

**Aprendizado da seção:** Explicar o papel da policy no primeiro pacote e no restante de uma sessão, antes de configurar opções adicionais.

- **03.1.1. Conexão permitida, sessão e tráfego de resposta:** Seguir uma conexão iniciada por um cliente e identificar a policy que a autoriza. Explicar por que a resposta normalmente utiliza o estado da sessão e por que uma segunda regra é necessária somente se o outro lado também precisar iniciar conexões.
- **03.1.2. Ordem de avaliação, primeira correspondência e implicit deny:** Comparar regras específicas e abrangentes com o mesmo tráfego. Demonstrar que o ID identifica a regra, enquanto sua posição afeta a avaliação, e observar o resultado quando nenhuma regra permite a conexão.

#### 03.2. Objetos que compõem uma firewall policy

**Aprendizado da seção:** Representar quem pode falar com quem, por qual serviço e em qual período, sem substituir critérios por uma lista indiscriminada de objetos.

- **03.2.1. Endereços, grupos e exclusões:** Criar objetos de host, sub-rede e faixa e agrupá-los por finalidade. Explicar grupos com exclusões, negação quando aplicável e referências; verificar qual endereço pertence ao conjunto efetivamente usado pela policy.
- **03.2.2. Serviços, grupos de serviços e schedules:** Criar um serviço customizado e uma agenda recorrente ou pontual. Distinguir porta de destino e porta de origem, testar um acesso dentro e fora do período e explicar os efeitos documentados da agenda sobre sessões já existentes.

#### 03.3. Configurando e validando a primeira regra

**Aprendizado da seção:** Montar uma regra mínima e justificar cada campo a partir da comunicação desejada.

- **03.3.1. Interfaces, origem, destino, serviço e ação:** Criar uma policy entre as redes configuradas no módulo 02. Explicar a combinação entre critérios, accept/deny, habilitação, comentário e log, usando tráfego interno sem NAT para enxergar claramente a autorização.
- **03.3.2. Contadores, policy lookup e log da conexão:** Gerar uma conexão permitida e outra negada e localizar ID, ação e contadores. Usar a ferramenta de consulta de policy como auxílio, distinguindo sua previsão do resultado observado em uma sessão real.

#### 03.4. Trânsito e conexões do próprio equipamento

**Aprendizado da seção:** Distinguir o fluxo controlado pela firewall policy de acesso local ao FortiGate.

- **03.4.1. Trânsito, local-in e local-out:** Classificar uma conexão cliente-servidor, um login HTTPS no FortiGate e uma consulta DNS originada pelo equipamento. Mostrar por que procurar tudo na mesma lista de firewall policies leva a diagnósticos errados.

**Prática e evidência:** Criar objetos e três regras simples, testar ordem e implicit deny e explicar por que a resposta usa a sessão permitida. Mostrar o ID da regra e seus contadores.

**Critério de conclusão:** O aluno prevê a regra e a ação de uma conexão e demonstra a previsão no FortiGate.

### 04. Serviços locais para os clientes

**Base já ensinada:** 03
**Retoma:** Primeira passagem.
**Base atual:** C01; ampliar conforme o escopo desta passagem.
**Objetivo:** Configurar DHCP, DNS e NTP como serviços do FortiGate para redes já conectadas e controladas. Verificar atendimento e dependências sem misturar serviços locais com autorização de trânsito.
**Por que nesta posição:** A primeira policy já deu contexto para distinguir conexão ao equipamento de tráfego que o atravessa. Agora os serviços dos clientes podem ser configurados e verificados sem atrasar o aprendizado das regras.

#### 04.1. DHCP server e relay

**Aprendizado da seção:** Entregar endereços pelo FortiGate ou encaminhar a solicitação ao servidor apropriado.

- **04.1.1. DHCP server, reservas e relay:** Criar escopo, reservas, opções e exclusões de DHCP; consultar leases e conflitos. Configurar relay para um servidor externo e mostrar qual parte da operação é feita pelo FortiGate em cada modo.

#### 04.2. DNS server do FortiGate

**Aprendizado da seção:** Distinguir o DNS consumido pelo FortiGate do serviço oferecido aos clientes.

- **04.2.1. DNS local e encaminhamento:** Configurar o FortiGate como servidor DNS de clientes, com encaminhamento ou base local. Verificar consulta e cache e comparar com os servidores DNS que o próprio equipamento utiliza para seus serviços.
- **04.2.2. Validação do serviço DNS:** Consultar um nome existente e um inexistente e observar qual resposta o FortiGate entrega. Relacionar o serviço à interface de atendimento e ao destino de encaminhamento, separando falha de resolução de negação de acesso por policy.

#### 04.3. NTP server

**Aprendizado da seção:** Oferecer horário a clientes e verificar a referência do próprio FortiGate.

- **04.3.1. Ativação e consulta de NTP local:** Configurar o serviço NTP na interface apropriada e verificar se o FortiGate está sincronizado com a referência escolhida. Comparar a condição de cliente NTP do equipamento com seu papel de servidor para outros dispositivos.

**Prática e evidência:** Entregar endereço e resolução a um cliente e verificar seu horário. Demonstrar lease, resposta DNS e sincronização no equipamento.

**Critério de conclusão:** O aluno identifica o serviço atendido pelo FortiGate e sua evidência, separando falha do serviço e falha de acesso.

### 05. NAT I: saída e publicação simples

**Base já ensinada:** 03, 04
**Retoma:** Primeira passagem.
**Base atual:** C02; ampliar conforme o escopo desta passagem.
**Objetivo:** Acrescentar tradução a uma policy já conhecida. Configurar SNAT para saída e um VIP de publicação, distinguindo permissão, endereço traduzido e direção de início da conexão.
**Por que nesta posição:** O aluno já autoriza um acesso sem NAT. A tradução entra como uma mudança observável nos endereços e portas; Central NAT, hairpin e balanceamento ficam na retomada de publicação.

#### 05.1. SNAT nas saídas do FortiGate

**Aprendizado da seção:** Escolher a tradução de origem necessária e identificar o efeito sobre endereço, porta e retorno da sessão.

- **05.1.1. NAT pela interface e IP pools:** Comparar o endereço da interface de saída com pools de IP. Explicar overload/PAT, mapeamentos e limites dos tipos de pool suportados e observar qual tradução aparece no servidor de destino.
- **05.1.2. Preservação de portas, recursos e exaustão:** Relacionar portas disponíveis, quantidade de sessões e comportamento das aplicações. Demonstrar como consultar consumo e falha de alocação e escolher um pool coerente, sem prometer preservação de porta em todas as combinações.

#### 05.2. DNAT com Virtual IPs

**Aprendizado da seção:** Publicar um recurso usando VIP e policy, separando destino público, destino traduzido e direção de início da conexão.

- **05.2.1. VIP estático, port forwarding e VIP groups:** Criar uma publicação com IP externo, servidor interno e portas desejadas. Definir interface de escuta e serviços, associar à policy e comprovar que o VIP existente não libera o acesso se a policy não o permite.
- **05.2.2. Retorno de DNAT, ARP e acesso iniciado pelo servidor:** Explicar os endereços de ida e volta de uma conexão publicada e comparar com uma nova conexão iniciada pelo servidor. Validar o acesso e a origem observada na aplicação; a leitura detalhada dessas traduções será praticada com as sessões na sequência.

**Prática e evidência:** Comparar a origem vista pelo servidor com e sem SNAT e publicar um serviço por VIP. Testar o acesso com a policy permitida e negada e explicar os endereços de ida e volta.

**Critério de conclusão:** O aluno explica a função de policy, SNAT e VIP e comprova a tradução sem confundir resposta de DNAT com nova conexão do servidor.

### 06. Logs I: registrar e encontrar uma comunicação

**Base já ensinada:** 05
**Retoma:** Primeira passagem.
**Base atual:** C03; ampliar conforme o escopo desta passagem.
**Objetivo:** Produzir, localizar e interpretar os registros do FortiGate para comprovar o resultado de policies, NAT e, depois, perfis de segurança. Escolher armazenamento e destino de logs conforme retenção, volume e necessidade de investigação.
**Por que nesta posição:** Existem conexões autorizadas e traduzidas para observar. A passagem ensina geração, consulta e destino de logs; investigação de engines, pressão de memória e offload ficará para um ambiente com mais funções conhecidas.

#### 06.1. O que é registrado e em qual momento

**Aprendizado da seção:** Relacionar configuração de logging, tipo de evento e momento de emissão ao registro que deveria ser encontrado.

- **06.1.1. Traffic logs, eventos e logs de Security Profiles:** Distinguir tráfego de trânsito, tráfego local, eventos administrativos e eventos de inspeção. Ler campos de policy, interfaces, ação, sessão e tradução e explicar por que um log de accept não garante sucesso da aplicação.
- **06.1.2. Registro por policy, início/fim e negações:** Configurar o nível de registro da policy e observar quando uma sessão aparece. Comparar bloqueio explícito e implícito, tráfego local e sessões longas, verificando configurações específicas em vez de concluir que não houve tráfego por falta de log.

#### 06.2. Consulta de logs e FortiView

**Aprendizado da seção:** Transformar um sintoma em uma consulta que identifique conexão, regra e comportamento.

- **06.2.1. Filtros, detalhes e correlação por sessão:** Localizar um acesso por origem, destino, horário, ação e ID de policy. Abrir o registro completo e correlacionar conexão, tradução e eventos associados sem misturar tentativas diferentes do mesmo cliente.
- **06.2.2. Dashboards, widgets e visões do FortiView:** Usar visões de fontes, destinos, aplicações e policies para encontrar volume e concentração de acessos. Diferenciar visualização em tempo real, histórico e dados disponíveis somente com o backend de logs adequado.

#### 06.3. Armazenamento e envio para outros sistemas

**Aprendizado da seção:** Configurar destinos e verificar se o registro chega, é retido e pode ser consultado.

- **06.3.1. Memória, disco, FortiGate Cloud e FortiAnalyzer:** Comparar persistência, capacidade e funções de análise de cada destino disponível. Habilitar o destino escolhido, conferir conectividade e fila de envio e demonstrar o impacto de reinício ou indisponibilidade na consulta dos registros.
- **06.3.2. Syslog, filtros e proteção do transporte:** Configurar envio de eventos a um coletor, filtros e formato compatível. Validar origem da conexão, horário, entrega e TLS quando suportado; diferenciar teste de conectividade do FortiGate de recebimento efetivo no coletor.

**Prática e evidência:** Encontrar os fluxos das policies e do NAT que já foram configurados, explicar seus campos e enviar os registros a um destino adicional, comprovando recepção.

**Critério de conclusão:** O aluno produz uma evidência rastreável de permissão ou bloqueio e identifica quando a falta de registro decorre da configuração de logs.

### 07. Sessões I: ler o estado e observar o tráfego

**Base já ensinada:** 06
**Retoma:** Primeira passagem.
**Base atual:** C04, C14; ampliar conforme o escopo desta passagem.
**Objetivo:** Localizar uma sessão e relacionar interfaces, policy, tradução e direção de resposta. Fazer testes simples e capturas filtradas para confirmar chegada e saída, usando os acessos que o aluno já configurou.
**Por que nesta posição:** A sessão explica os resultados vistos nos logs. Debug flow, motores internos e diagnóstico de desempenho não são necessários nesta primeira leitura.

#### 07.1. Primeiro pacote e sessão existente

**Aprendizado da seção:** Separar a criação da sessão do tratamento posterior de seus pacotes e localizar suas informações no FortiGate.

- **07.1.1. Caminho do pacote e pontos de decisão:** Relacionar entrada, verificação de sessão, rota, policy, tradução e saída ao tipo de fluxo observado. Explicar que a sequência concreta depende de DNAT, proxy e recursos habilitados, conferindo o comportamento do caso demonstrado.
- **07.1.2. Lendo uma sessão:** Localizar uma conexão e ler origem/resposta, interfaces, policy, tradução, estado e tempo restante. Comparar duas sessões de teste e distinguir esses dados da tabela de rotas; os helpers e ajustes internos serão aprofundados depois.

#### 07.2. Captura e testes originados no equipamento

**Aprendizado da seção:** Escolher a ferramenta que permite comprovar chegada, saída e resposta sem confundir gerência com trânsito.

- **07.2.1. Ping, traceroute e origem do teste:** Executar testes do FortiGate com origem, interface e contexto definidos. Comparar com o teste de um cliente e explicar quais conclusões sobre firewall policy, NAT e roteamento cada resultado realmente permite.
- **07.2.2. Packet capture na GUI e sniffer na CLI:** Filtrar a comunicação por endereços, porta e interface, observar entrada e saída e reconhecer ausência de retorno. Explicar como offload e posição da captura podem limitar o que é visto, preservando o escopo do teste.

**Prática e evidência:** Localizar a sessão de uma regra conhecida e comparar seu estado com uma captura curta e com um teste originado no FortiGate.

**Critério de conclusão:** O aluno diferencia trânsito de teste local e lê policy, tradução e retorno na sessão.

### 08. Inspeção I: policy e Security Profiles

**Base já ensinada:** 07
**Retoma:** Primeira passagem.
**Base atual:** C07, C08, C10; ampliar conforme o escopo desta passagem.
**Objetivo:** Entender onde os perfis atuam depois da autorização da policy e comparar os motores flow e proxy. Usar grupos e opções de protocolo sem confundir modo de inspeção com explicit proxy ou modo NGFW.
**Por que nesta posição:** O caminho e o estado da comunicação já são conhecidos. Antes de escolher um filtro, o aluno precisa entender o que o motor de inspeção recebe e como o perfil participa da decisão.

#### 08.1. Policy, perfil e modo de inspeção

**Aprendizado da seção:** Associar o perfil à policy e escolher flow/proxy pela compatibilidade e pelo conteúdo analisado.

- **08.1.1. Policy, perfil, grupo de perfis e opções de protocolo:** Associar um perfil a uma policy existente e observar um evento de inspeção vinculado ao mesmo acesso. Configurar profile groups e protocol options, explicando referências, mensagens de substituição e efeito de alterar um perfil compartilhado.
- **08.1.2. Flow-based e proxy-based inspection:** Comparar os modos por tratamento do tráfego, protocolos e funções disponíveis. Usar a matriz de compatibilidade para escolher policy e perfil coerentes, incluindo restrições por modelo/memória, em vez de tratar proxy como um nível universalmente superior.

**Prática e evidência:** Associar um perfil simples à policy e localizar sua referência e seu evento. Comparar as opções de modo e sua matriz de suporte.

**Critério de conclusão:** O aluno distingue autorização inicial, inspeção e ação do perfil e escolhe uma combinação compatível.

### 09. Certificados e inspeção TLS I

**Base já ensinada:** 08
**Retoma:** Primeira passagem.
**Base atual:** C07, C08, C10; ampliar conforme o escopo desta passagem.
**Objetivo:** Usar certificados no FortiGate para explicar confiança e visibilidade de HTTPS. Comparar certificate inspection e deep inspection e validar a cadeia apresentada ao cliente no cenário básico.
**Por que nesta posição:** Certificados aparecem porque a inspeção HTTPS agora precisa deles. Os casos de servidor, protocolos modernos, SSH e interoperabilidade serão retomados com mais contexto.

#### 09.1. Confiança e certificados para a primeira inspeção

**Aprendizado da seção:** Identificar o certificado e a CA envolvidos e preparar a confiança necessária ao teste.

- **09.1.1. Certificado local, CA, cadeia e chave privada:** Identificar certificados locais, CAs confiáveis e a CA usada para reassinar conexões. Ler emissor, validade, SAN e usos e explicar por que importar uma CA de confiança não fornece a chave privada de um servidor.
- **09.1.2. Importação e confiança básica:** Importar a CA ou o certificado correspondente ao cenário simples e verificar cadeia e chave, quando aplicável. Configurar a confiança do cliente e comprovar a identidade apresentada, sem antecipar emissão automatizada, renovação e revogação.

#### 09.2. Certificate inspection e deep inspection

**Aprendizado da seção:** Escolher o nível de inspeção e comprovar sua visibilidade e suas exigências no cliente e no FortiGate.

- **09.2.1. O que cada modo consegue inspecionar:** Comparar inspeção de metadados/certificados com decriptação e análise de conteúdo. Configurar o perfil SSL/SSH e a policy e demonstrar que detectar uma categoria de site não significa conseguir analisar todo o arquivo HTTPS.
- **09.2.2. Distribuição de confiança e validação da conexão:** Distribuir a CA usada na inspeção aos clientes autorizados e conferir a cadeia apresentada. Testar com e sem confiança e diferenciar falha de certificado, bloqueio de perfil e aplicação incompatível com intermediação TLS.

**Prática e evidência:** Comparar o mesmo acesso com certificate inspection e deep inspection, antes e depois da confiança na CA. Identificar o conteúdo visível em cada caso.

**Critério de conclusão:** O aluno reconhece a CA e o certificado utilizados e separa erro de confiança de bloqueio por perfil.

### 10. Web Filter I: categorias e URLs

**Base já ensinada:** 09
**Retoma:** Primeira passagem.
**Base atual:** C09; ampliar conforme o escopo desta passagem.
**Objetivo:** Controlar a navegação por categorias e URLs e localizar o evento responsável. Usar o perfil TLS aprendido para explicar a visibilidade, sem antecipar quotas, identidade, vídeo e exceções avançadas.
**Por que nesta posição:** É a primeira aplicação completa de um perfil depois de TLS. A passagem se limita a decisões simples e observáveis; as variações serão retomadas depois.

#### 10.1. Classificação e decisão do Web Filter

**Aprendizado da seção:** Comparar categorias e URLs e comprovar o critério que determina a ação.

- **10.1.1. Categorias FortiGuard, rating e ações:** Criar um perfil com categorias permitidas, bloqueadas e monitoradas. Comparar allow, monitor, warning e outras ações suportadas, verificando licença, disponibilidade do serviço de rating e comportamento quando não há classificação.
- **10.1.2. Filtro estático de URL e ordem de decisão:** Configurar entradas simples, wildcard e regex no escopo suportado. Testar precedência, caminho e domínio e explicar a diferença entre permitir uma URL e isentá-la de inspeções adicionais.

**Prática e evidência:** Permitir uma categoria, bloquear outra e testar uma URL específica, explicando o log e a mensagem apresentados.

**Critério de conclusão:** O aluno identifica a classificação e a ação que determinaram cada acesso.

### 11. DNS Filter I: domínio e ponto de aplicação

**Base já ensinada:** 04, 10
**Retoma:** Primeira passagem.
**Base atual:** C09; ampliar conforme o escopo desta passagem.
**Objetivo:** Filtrar domínios nas consultas DNS e distinguir o perfil da resolução local e do filtro web. Verificar a resposta e o evento em trânsito e no serviço DNS do FortiGate.
**Por que nesta posição:** O aluno já conhece DNS local e Web Filter. Pode comparar decisões que atuam em pontos diferentes sem antecipar DNS cifrado e controles avançados.

#### 11.1. Decisão e ponto de aplicação do DNS Filter

**Aprendizado da seção:** Configurar a classificação e observar a resposta no caminho DNS efetivamente usado.

- **11.1.1. Categorias, domínios locais e botnet C&C:** Criar um perfil com categorias FortiGuard e lista local de domínios. Comparar bloqueio, monitoramento e redirecionamento suportados, observando a resposta entregue ao cliente e o evento DNS correspondente.
- **11.1.2. Aplicação em firewall policy e DNS server local:** Aplicar o perfil no tráfego DNS de clientes e no serviço DNS do FortiGate. Demonstrar por que filtrar somente um desses caminhos não equivale a cobrir consultas que usam o outro.

**Prática e evidência:** Bloquear um domínio fictício e comparar o resultado no tráfego em trânsito e no DNS server local.

**Critério de conclusão:** O aluno mostra a consulta, a resposta e o local em que o perfil foi aplicado.

### 12. Application Control I: identificar e controlar aplicações

**Base já ensinada:** 09, 11
**Retoma:** Primeira passagem.
**Base atual:** C10; ampliar conforme o escopo desta passagem.
**Objetivo:** Reconhecer uma aplicação além do IP e da porta, construir um sensor e comprovar qual filtro ou override determinou a ação. Entender identificação inicial e dependência da visibilidade TLS.
**Por que nesta posição:** O aluno já distingue serviço, aplicação e categoria. A classificação de aplicações é apresentada com o sensor básico porque não exige a customização de assinaturas nem o cenário de IA.

#### 12.1. Identificação e correspondência de aplicações

**Aprendizado da seção:** Explicar como a identificação evolui durante a sessão e por que ela não equivale à porta do serviço.

- **12.1.1. Assinaturas, categorias, risco e identificação inicial:** Observar a aplicação identificada em conexões reais e comparar com o serviço da firewall policy. Explicar a necessidade de tráfego suficiente, base atualizada e visibilidade TLS, incluindo situações inicialmente desconhecidas ou classificadas de forma genérica.
- **12.1.2. Sensor, filtros, overrides e prioridade:** Construir um sensor com filtros por categoria e ajustes por aplicação. Demonstrar a prioridade documentada entre regras do sensor e verificar quais campos e ações foram responsáveis pelo resultado, evitando concluir a partir apenas da ordem visual.

#### 12.2. Controles de porta e protocolo

**Aprendizado da seção:** Ajustar o sensor ao comportamento desejado e medir efeitos sobre aplicações autorizadas.

- **12.2.1. Port enforcement, protocol enforcement e aplicações desconhecidas:** Comparar controle de porta/protocolo com detecção da aplicação. Configurar o tratamento de tráfego desconhecido e testar falsos positivos com registros de sessão e de aplicação, mantendo uma justificativa para cada restrição.

#### 12.3. Classificação das aplicações

**Aprendizado da seção:** Distinguir rótulo administrativo e autorização técnica.

- **12.3.1. Sanctioned, unsanctioned e classificações customizadas:** Classificar aplicações e observar sua apresentação em logs e FortiView. Explicar que rotular uma aplicação como não autorizada não é, por si só, uma regra de bloqueio; incluir classificações próprias somente no patch que as suporta.

**Prática e evidência:** Controlar uma aplicação e comparar serviço da policy, assinatura detectada e ação do sensor.

**Critério de conclusão:** O aluno explica por que uma porta permitida pode transportar uma aplicação bloqueada.

### 13. Antivirus I: análise e tratamento de arquivos

**Base já ensinada:** 09, 12
**Retoma:** Primeira passagem.
**Base atual:** C08; ampliar conforme o escopo desta passagem.
**Objetivo:** Aplicar Antivirus aos arquivos visíveis ao FortiGate e distinguir as ações por detecção e por limitação técnica. Testar com conteúdo benigno e arquivo padrão de validação de AV.
**Por que nesta posição:** TLS e eventos já são conhecidos. Esta passagem explica análise local; sandbox, CDR, fontes externas e File Filter serão retomados como mecanismos distintos.

#### 13.1. Análise de arquivos pelo Antivirus

**Aprendizado da seção:** Aplicar o perfil e distinguir conteúdo analisado, detectado e não inspecionável.

- **13.1.1. Bases, assinaturas e análise em flow/proxy:** Comparar capacidades documentadas das bases e dos motores disponíveis, incluindo stream-based scanning quando suportado. Aplicar AV em uma policy de teste e demonstrar a diferença entre assinatura atualizada, motor ativo e arquivo realmente submetido à análise.
- **13.1.2. Arquivos compactados, protegidos, grandes e timeouts:** Configurar tratamento de arquivos não inspecionáveis, tamanho, profundidade de compactação e limites de tempo. Testar cada condição com conteúdo inofensivo e explicar a diferença entre bloquear por limite técnico e detectar malware.

**Prática e evidência:** Transferir um arquivo benigno, um arquivo padrão de teste AV e um arquivo não inspecionável e comparar os eventos.

**Critério de conclusão:** O aluno identifica se o arquivo foi permitido, analisado, detectado ou bloqueado por uma condição técnica.

### 14. IPS I: assinaturas, sensores e ações

**Base já ensinada:** 12, 13
**Retoma:** Primeira passagem.
**Base atual:** C10; ampliar conforme o escopo desta passagem.
**Objetivo:** Entender como o IPS reconhece o protocolo e seleciona assinaturas e ações. Criar um sensor coerente com o ativo, observar um evento de teste e aplicar uma exceção ou banimento com escopo definido.
**Por que nesta posição:** Assinatura, sensor e ação já são explicados nesta passagem. Um padrão benigno simples permite demonstrar a assinatura própria sem exigir contexto de BGP, cloud ou integrações.

#### 14.1. Reconhecimento de protocolo e assinaturas

**Aprendizado da seção:** Explicar o caminho de inspeção e a relação entre assinatura, sensor e ação.

- **14.1.1. Engine, decodificadores e base de assinaturas:** Identificar a atualização de engine e assinaturas e explicar normalização e reconhecimento de protocolo. Relacionar visibilidade TLS e inspeção de tráfego lateral ao que pode ser detectado, sem restringir IPS automaticamente ao perímetro.

#### 14.2. Configuração e ajuste do sensor

**Aprendizado da seção:** Criar um sensor orientado ao ativo protegido e comprovar a ação sem reproduzir uma exploração.

- **14.2.1. Sensores, filtros e overrides:** Criar filtros por sistema, aplicação, severidade e alvo e ajustar uma assinatura específica. Demonstrar ações suportadas e prioridade de regras, conferindo o sensor aplicado à policy e o motivo do evento gerado.
- **14.2.2. Monitoramento, bloqueio, exceções e IP ban:** Usar reprodução benigna ou evento de teste autorizado para comparar monitoramento e bloqueio. Documentar uma exceção específica e demonstrar escopo e duração de banimento, evitando isentar um conjunto inteiro de ativos por um único falso positivo.

#### 14.3. Assinaturas IPS

**Aprendizado da seção:** Criar e validar um padrão benigno no sensor apropriado.

- **14.3.1. Assinaturas IPS customizadas:** Criar uma assinatura simples para um padrão benigno de teste e associá-la a um sensor. Verificar correspondência e abrangência, comparar tráfego positivo e negativo e explicar manutenção e prioridade, sem depender de reproduzir uma exploração real.

**Prática e evidência:** Aplicar um sensor ao serviço de teste e demonstrar monitoramento e ação usando validação benigna, com evento e critério selecionado.

**Critério de conclusão:** O aluno justifica a assinatura e mostra qual sensor e ação participaram do resultado.

### 15. Identidade I: usuários, grupos e autenticação

**Base já ensinada:** 03, 09, 14
**Retoma:** Primeira passagem.
**Base atual:** C05; ampliar conforme o escopo desta passagem.
**Objetivo:** Adicionar identidade a acessos que o aluno já sabe autorizar por rede e serviço. Configurar usuários, grupos e fontes de autenticação e distinguir autenticação bem-sucedida de autorização na policy correta.
**Por que nesta posição:** As primeiras policies e perfis já funcionam por rede e serviço. A identidade entra para refinar uma regra conhecida, antes de aprender como SSO entrega essa identidade.

#### 15.1. Usuários locais e grupos

**Aprendizado da seção:** Criar identidades e grupos com finalidade e validade conhecidas.

- **15.1.1. Usuários locais, convidados e grupos:** Criar contas locais e grupos, incluindo os tipos de grupo utilizados nas funções do FortiGate. Configurar validade, senha e acesso de convidados quando disponível e comparar usuário autenticado com grupo efetivamente reconhecido.

#### 15.2. Autenticação na policy e captive portal

**Aprendizado da seção:** Evoluir uma regra por IP para uma decisão por usuário ou grupo.

- **15.2.1. Autenticação por firewall policy e captive portal:** Adicionar grupo a uma policy existente e testar usuário autorizado e não autorizado. Comparar autenticação ativa pela policy e portal na interface, verificando fluxo de redirecionamento, certificado e comportamento de clientes sem navegador.

#### 15.3. LDAP

**Aprendizado da seção:** Consultar um diretório e distinguir autenticação de correspondência de grupo.

- **15.3.1. LDAP, LDAPS e StartTLS:** Configurar servidor, conta de consulta com privilégio mínimo, base e filtro de grupo. Diferenciar LDAPS de StartTLS, validar confiança e testar credencial correta, usuário fora do grupo e falha de consulta antes de ajustar a policy.

#### 15.4. RADIUS e RadSec

**Aprendizado da seção:** Usar a fonte RADIUS e seus atributos para autorizar usuários no FortiGate.

- **15.4.1. Cliente RADIUS, atributos e grupos:** Configurar servidor, origem e segredo/certificado do cliente RADIUS ou RadSec suportado. Testar autenticação e grupo recebido e distinguir rejeição de usuário, ausência de resposta e falha de transporte. TACACS+ será aplicado à administração quando ela for aprofundada.

#### 15.5. MFA e autenticação por certificado

**Aprendizado da seção:** Aplicar fator adicional ou certificado ao fluxo de autenticação suportado.

- **15.5.1. FortiToken, serviços de identidade e autenticação por certificado:** Vincular um fator adicional ou certificado ao fluxo suportado e demonstrar seu papel na validação. Distinguir o que é configurado no FortiGate do que depende de FortiAuthenticator, FortiIdentity ou outro serviço licenciado.

#### 15.6. Estado, timers e logout

**Aprendizado da seção:** Consultar o usuário autenticado e comprovar expiração ou mudança de grupo.

- **15.6.1. Timers, cache, logout e diagnóstico:** Consultar usuários autenticados e comparar idle timeout, tempo máximo e outros timers utilizados. Testar logout, mudança de grupo e expiração, correlacionando tabela de usuários, evento de autenticação e firewall policy.

**Prática e evidência:** Evoluir uma policy por IP para autorização por grupo e comparar acesso local e externo, usuário fora do grupo e sessão expirada.

**Critério de conclusão:** O aluno localiza a identidade recebida, o grupo reconhecido e a regra usada, separando falha de autenticação de negação de acesso.

### 16. SSO I: identidade passiva por FSSO e RSSO

**Base já ensinada:** 15
**Retoma:** Primeira passagem.
**Base atual:** C06; ampliar conforme o escopo desta passagem.
**Objetivo:** Configurar como o FortiGate aprende usuário e grupo sem solicitar login a cada acesso. Comparar FSSO e RSSO e verificar origem, validade e atualização dos mapeamentos.
**Por que nesta posição:** O aluno já conhece usuário autenticado, grupo e policy. Agora pode explicar como eventos externos alimentam a decisão sem misturar esse aprendizado com federação SAML ou provisionamento SCIM.

#### 16.1. FSSO: configuração e operação

**Aprendizado da seção:** Aprender o mapeamento passivo e verificar sua validade no mesmo fluxo de trabalho.

- **16.1.1. DC Agent, Collector Agent e polling:** Comparar arquiteturas com agente, polling no Collector e polling pelo FortiGate. Explicar como logon, consulta de grupos e associação de IP chegam ao firewall e escolher o modo conforme requisitos e limitações.
- **16.1.2. Conector, grupos, filtros e policies FSSO:** Configurar o conector e os grupos disponibilizados e aplicar a identidade à policy conhecida. Verificar usuário, endereço, grupo e origem do mapeamento antes de concluir que uma regra por identidade está incorreta.
- **16.1.3. Timers, workstation check, logout e múltiplos usuários:** Demonstrar atualização e expiração do mapeamento, problemas de resolução e troca de endereço. Tratar cenários de terminal server e múltiplos usuários no mesmo IP com o mecanismo apropriado, sem assumir que todo mapeamento por IP identifica uma única pessoa.

#### 16.2. RSSO

**Aprendizado da seção:** Receber accounting RADIUS e transformá-lo em identidade usada pela policy.

- **16.2.1. RSSO e accounting RADIUS:** Receber eventos de accounting, mapear atributos e criar o grupo usado na policy. Comparar start, interim e stop com autenticação RADIUS ativa e observar como sessão e timeout alteram a identidade conhecida pelo FortiGate.

**Prática e evidência:** Configurar FSSO e um cenário RSSO suportado, localizar os mapeamentos e demonstrar expiração ou atualização de um usuário.

**Critério de conclusão:** O aluno mostra a origem do mapeamento, o grupo e a policy que o consumiu.

### 17. SSO II: autenticação federada e uso dos grupos

**Base já ensinada:** 10, 15, 16
**Retoma:** 15
**Base atual:** C06; ampliar conforme o escopo desta passagem.
**Objetivo:** Integrar autenticação SAML e usar a identidade nas regras existentes. Distinguir assertion, grupo e permissão e demonstrar perfis ou exceções condicionadas ao usuário.
**Por que nesta posição:** A federação retoma a identidade depois de autenticação ativa e passiva. SCIM ficará com integrações de contexto, antes de ZTNA; não é requisito para esse primeiro login SAML.

#### 17.1. Login SAML e autorização por grupo

**Aprendizado da seção:** Configurar o fluxo federado e verificar a identidade e a permissão recebidas.

- **17.1.1. FortiGate como SP e integração com IdP:** Configurar o FortiGate como SP com endpoints, certificado e claims de grupo e acompanhar o login. Testar a autenticação de firewall no cenário suportado e comparar assertion aceita com acesso negado por falta do grupo previsto na policy.
- **17.1.2. Perfis por grupo e overrides autenticados:** Aplicar perfis diferentes a grupos que já foram aprendidos e testar os resultados com usuários distintos. Comprovar o grupo reconhecido, a policy e o perfil recebidos; as opções avançadas de exceção autenticada serão configuradas na retomada de Web Filter.

**Prática e evidência:** Autenticar pelo IdP e comparar usuário com e sem grupo autorizado. Demonstrar uma exceção autenticada prevista no Web Filter.

**Critério de conclusão:** O aluno separa sucesso do login, grupo reconhecido e autorização do recurso.

### 18. Identidade do dispositivo e postura

**Base já ensinada:** 03, 09, 15, 17
**Retoma:** Primeira passagem.
**Base atual:** C16; ampliar conforme o escopo desta passagem.
**Objetivo:** Receber e validar identidade e postura do dispositivo no FortiGate. Preparar o contexto mínimo para ZTNA, distinguindo certificado, usuário e tags.
**Por que nesta posição:** Certificados e autenticação já foram ensinados. A postura entra agora por ser uma dependência concreta do cenário ZTNA, sem antecipar toda a administração do Fabric ou dos controladores LAN.

#### 18.1. Conector EMS e contexto do endpoint

**Aprendizado da seção:** Conectar a fonte de postura e distinguir identidade do dispositivo e do usuário.

- **18.1.1. EMS, certificado e tags:** Configurar a integração FortiClient EMS suportada e verificar o certificado do dispositivo e as tags recebidas. Conferir confiança e atualização, distinguindo identidade do endpoint de identidade do usuário; a formação completa do Security Fabric não é pré-requisito deste conector.
- **18.1.2. Validade e mudança de postura:** Comparar um dispositivo conforme e um fora do critério e observar a mudança de contexto no FortiGate. Identificar tag ausente, desatualizada ou incompatível antes de utilizá-la como condição de acesso.
- **18.1.3. Do contexto à decisão de acesso:** Usar um critério simples com os objetos e policies conhecidos e conferir o estado efetivamente recebido. Preparar o dispositivo para o acesso por aplicação da próxima passagem, sem depender de NAC, FortiSwitch ou nuvem.

**Prática e evidência:** Conectar a fonte suportada, comparar dois estados de postura e comprovar certificado, tag e atualização no FortiGate.

**Critério de conclusão:** O aluno identifica a origem e a validade da postura e explica qual condição poderá ser usada no acesso.

### 19. ZTNA I: acesso por aplicação

**Base já ensinada:** 03, 05, 09, 15, 17, 18
**Retoma:** Primeira passagem.
**Base atual:** C16; ampliar conforme o escopo desta passagem.
**Objetivo:** Publicar uma aplicação por ZTNA e autorizá-la por usuário e dispositivo. Configurar access proxy e a regra do cenário e comprovar cada condição de acesso.
**Por que nesta posição:** Policies, publicação simples, TLS, identidade e postura já estão disponíveis. ZTNA não exige estudar antes BGP, ADVPN, HA, cloud, LAN gerenciada nem todos os tipos de proxy policy.

#### 19.1. Arquitetura e componentes ZTNA

**Aprendizado da seção:** Explicar quem identifica o dispositivo, quem informa postura e onde a decisão é aplicada.

- **19.1.1. FortiGate, FortiClient, EMS e certificados:** Relacionar o cliente, o conector EMS, o certificado de dispositivo e o ponto de acesso no FortiGate. Verificar confiança e compatibilidade e distinguir requisito do cenário demonstrado de uma capacidade universal de qualquer versão.
- **19.1.2. Tags, identidade e estado de conformidade:** Consultar tags recebidas e comparar identidade do usuário e identidade do dispositivo. Demonstrar como a condição de postura pode mudar e explicar o que isso significa para uma nova tentativa e para a sessão existente.

#### 19.2. Publicação e autorização por aplicação

**Aprendizado da seção:** Construir o caminho de acesso e comprovar as condições que permitem utilizá-lo.

- **19.2.1. Access proxy HTTPS e TCP forwarding:** Configurar os objetos e servidores reais para aplicações HTTP e TCP suportadas. Definir o caminho externo e interno e comparar a publicação ZTNA com um VIP tradicional, observando TLS e acesso efetivamente mediado pelo FortiGate.
- **19.2.2. ZTNA rules, grupos e condições de postura:** Criar autorização por usuário/grupo e tags, usando os certificados apropriados. Testar usuário sem grupo, dispositivo sem certificado e postura fora do permitido, correlacionando cada negação com o registro do controle.

#### 19.3. Validação do primeiro acesso ZTNA

**Aprendizado da seção:** Identificar a condição que permite ou nega o recurso publicado.

- **19.3.1. Diagnóstico básico por decisão:** Testar usuário autorizado, dispositivo sem certificado e postura fora do critério. Correlacionar o resultado com o log de acesso e distinguir falha de identidade, condição de postura, regra e conexão ao servidor real, usando primeiro IPv4.

**Prática e evidência:** Publicar uma aplicação e testar três combinações de usuário e dispositivo, identificando a razão de acesso ou negação.

**Critério de conclusão:** O aluno segue o acesso do cliente ao servidor e explica como identidade, postura e regra determinaram a decisão.

### 20. SCIM: provisionamento de identidades e grupos

**Base já ensinada:** 15, 17, 19
**Retoma:** 17
**Base atual:** C16; ampliar conforme o escopo desta passagem.
**Objetivo:** Provisionar identidades e grupos e usá-los em uma autorização já conhecida. Explicar o papel do FortiGate e a validade da informação recebida.
**Por que nesta posição:** O aluno já observou autenticação e acesso por aplicação. Pode aprender o fluxo SCIM sem esperar conectores de nuvem ou infraestrutura LAN.

#### 20.1. Provisionamento e uso da identidade

**Aprendizado da seção:** Distinguir criação/sincronização de contas e grupos de autenticação e autorização.

- **20.1.1. Integração SCIM do FortiGate:** Configurar o papel suportado do FortiGate na integração e verificar criação, alteração e remoção de usuários/grupos. Distinguir o fluxo de provisionamento do login SAML que já foi demonstrado.
- **20.1.2. Credencial, escopo e atualização:** Configurar autenticação e permissões da integração suportada e conferir atualização e remoção de um grupo. Separar falha de transporte, credencial e sincronização do resultado de uma firewall policy.
- **20.1.3. Autorização com o grupo provisionado:** Usar o grupo no cenário SAML ou ZTNA já conhecido e comparar usuário provisionado e usuário fora do conjunto. Comprovar a decisão sem tratar o provisionamento como prova de autenticação.

**Prática e evidência:** Criar, atualizar e remover um grupo por SCIM e verificar o efeito no cenário de autorização suportado.

**Critério de conclusão:** O aluno distingue conta provisionada, login aceito e acesso autorizado.

### 21. Roteamento II: caminhos, contingência e direcionamento

**Base já ensinada:** 02, 07
**Retoma:** 02
**Base atual:** C04; ampliar conforme o escopo desta passagem.
**Objetivo:** Retomar a rota inicial para escolher entre caminhos, criar contingência e direcionar tráfego por critérios. Interpretar tabelas, PBR, ECMP e RPF a partir de sessões e policies já conhecidas.
**Por que nesta posição:** O aluno já observou ida, volta e tradução. Pode agora compreender mudanças de caminho sem aprender protocolos dinâmicos ou multicast ao mesmo tempo.

#### 21.1. Conectividade WAN por DHCP e PPPoE

**Aprendizado da seção:** Aprofundar as formas de obter endereço e gateway antes de usar múltiplos links.

- **21.1.1. Cliente DHCP, PPPoE e rotas recebidas:** Configurar o cliente WAN suportado e verificar endereço, gateway e DNS efetivamente obtidos. Testar renovação ou queda de PPPoE e observar qual rota é alterada, distinguindo disponibilidade do acesso de permissão por firewall policy.

#### 21.2. Tabelas e critérios de seleção

**Aprendizado da seção:** Explicar por que uma rota está ativa e como o FortiGate escolhe o caminho de um destino.

- **21.2.1. Connected, static, database, RIB e FIB:** Comparar rotas configuradas, candidatas, ativas e instaladas para encaminhamento. Demonstrar consulta de um destino e distinguir a tabela geral de rotas das informações de caminho armazenadas na sessão.
- **21.2.2. Prefixo, distância, prioridade e métrica:** Criar caminhos concorrentes e alterar um critério por vez. Explicar a precedência aplicável em cada comparação e verificar o resultado nas tabelas, evitando tratar todos os atributos como se fossem avaliados em uma única ordem universal.

#### 21.3. Rotas estáticas e verificação de disponibilidade

**Aprendizado da seção:** Construir contingência e reconhecer quando a presença da interface não garante alcance ao destino.

- **21.3.1. Rotas específicas, default, blackhole e recursão:** Adicionar rotas para destinos específicos e testar o efeito de uma rota blackhole. Investigar resolução de próximo salto e rotas recursivas nos cenários suportados, conferindo a decisão sem confundir policy deny com descarte por rota.
- **21.3.2. Link monitor e mudanças de caminho:** Configurar verificação de disponibilidade e observar retirada ou alteração de rotas. Testar nova sessão e sessão existente após a falha, distinguindo comportamento de link monitor, estado físico e SD-WAN posterior.

#### 21.4. Policy routes, ECMP e RPF

**Aprendizado da seção:** Relacionar direcionamento por critérios e verificação de origem ao estado real do tráfego.

- **21.4.1. Policy routes e caminhos de custo igual:** Criar PBR por origem/serviço e comparar com consulta de rota normal. Configurar ECMP no cenário suportado e verificar distribuição por sessões, identificando a informação efetivamente usada para escolher o caminho.
- **21.4.2. RPF, assimetria e tráfego local-out:** Comparar verificações strict e feasible no contexto documentado e localizar a razão de um descarte. Investigar retorno assimétrico e seleção de origem/saída de serviços locais, sem desabilitar controles globalmente para ocultar uma rota incorreta.

**Prática e evidência:** Comparar rotas concorrentes, usar PBR e observar a perda de um caminho e uma falha de retorno.

**Critério de conclusão:** O aluno distingue seleção de caminho, disponibilidade, RPF e autorização por policy.

### 22. Diagnóstico II: localizar a decisão que interrompe o trânsito

**Base já ensinada:** 06, 07, 21
**Retoma:** 06, 07
**Base atual:** C04, C14; ampliar conforme o escopo desta passagem.
**Objetivo:** Acrescentar debug flow à leitura de logs e sessões para explicar falhas de trânsito. Investigar um fluxo por vez e ligar a mensagem à decisão e ao contexto corretos.
**Por que nesta posição:** Roteamento com caminhos concorrentes agora dá sentido ao debug. Engines, offload, conserve mode e coleta de suporte continuam para depois de as funções que os utilizam serem aprendidas.

#### 22.1. Debug flow e investigação do trânsito

**Aprendizado da seção:** Filtrar o teste e interpretar a decisão com as rotas e policies já conhecidas.

- **22.1.1. Filtros, rastreamento e encerramento do debug:** Selecionar um fluxo de teste, ativar uma coleta curta e interpretar mensagens de rota, policy, NAT e RPF. Encerrar e limpar o debug ao final, produzindo uma explicação vinculada ao pacote e ao contexto corretos.
- **22.1.2. Casos de policy, rota, retorno e MTU:** Comparar falhas com aparência semelhante e escolher a próxima verificação com base na evidência disponível. Demonstrar por que conexão parcial não comprova, sozinha, falha de roteamento e quando investigar MTU, serviço local ou aplicação.

**Prática e evidência:** Diagnosticar uma falha de policy, uma de caminho e uma de retorno, com coleta limitada e encerrada.

**Critério de conclusão:** O aluno confirma a decisão responsável sem alterar vários mecanismos por tentativa.

### 23. Traffic shaping: controlar consumo e prioridade

**Base já ensinada:** 21, 22
**Retoma:** Primeira passagem.
**Base atual:** C12; ampliar conforme o escopo desta passagem.
**Objetivo:** Controlar consumo e prioridade do tráfego com shapers, classes e filas do FortiGate. Explicar seleção, limites e garantias sem atribuir ao shaping a capacidade de criar banda indisponível.
**Por que nesta posição:** As decisões de autorização e caminho já estão claras. O aluno aprende a controlar consumo antes de acrescentar a escolha de link por SD-WAN.

#### 23.1. Shapers e recursos de banda

**Aprendizado da seção:** Escolher a forma de dividir o recurso disponível entre fluxos e usuários.

- **23.1.1. Shared shaper, per-IP e reverse shaper:** Configurar banda máxima e garantida e comparar consumo compartilhado e por IP. Testar as direções do tráfego e explicar como o efeito muda quando várias sessões competem pelo mesmo limite.
- **23.1.2. Prioridade, filas, classes e perfis por interface:** Definir classes e o perfil de filas e relacioná-los à capacidade da interface e ao gargalo real. Observar descarte e latência sob uma carga de teste limitada e explicar quando a fila está fora do controle do FortiGate.

#### 23.2. Seleção e marcação de tráfego

**Aprendizado da seção:** Aplicar a regra certa e preservar ou alterar a informação de prioridade com finalidade explícita.

- **23.2.1. Traffic shaping policies e critérios de correspondência:** Criar regras por rede, serviço e aplicação e observar sua ordem e contadores. Comparar shaping em firewall policy com tabela de shaping e conferir o tratamento local-in/local-out quando suportado.
- **23.2.2. DSCP, VLAN CoS, class ID e múltiplos estágios:** Configurar marcação e correspondência por classe ou prioridade no cenário suportado. Capturar os campos antes e depois e demonstrar que marcar DSCP não garante, sozinho, tratamento prioritário na rede seguinte.

#### 23.3. Validação de qualidade e consumo

**Aprendizado da seção:** Medir se o controle atende ao objetivo sem mascarar falha de caminho ou saturação externa.

- **23.3.1. Medição de banda, sessões e contadores:** Comparar uso real com limite e garantia configurados e conferir a regra selecionada. Distinguir unidade de medida, banda útil, overhead e tráfego concorrente para explicar resultados sem interpretar um único speed test como prova completa.
- **23.3.2. Integração com aplicações e múltiplos links:** Priorizar uma aplicação e verificar seu comportamento com tráfego concorrente. Explicar a separação entre o shaper, que controla consumo, e SD-WAN, que selecionará caminhos no próximo módulo.

**Prática e evidência:** Comparar shared e per-IP shapers com tráfego controlado, verificar marcação e demonstrar prioridade quando há disputa pela banda.

**Critério de conclusão:** O aluno mostra a regra de shaping selecionada, o limite aplicado e a evidência do efeito sobre o tráfego.

### 24. SD-WAN I: links de Internet e SLAs

**Base já ensinada:** 05, 21, 23
**Retoma:** Primeira passagem.
**Base atual:** C12; ampliar conforme o escopo desta passagem.
**Objetivo:** Construir SD-WAN com links de Internet, configurar medições e prever a seleção por regra e estratégia. Observar falha, degradação e recuperação sem depender de uma VPN ainda não ensinada.
**Por que nesta posição:** Policies, NAT, caminho e consumo são conhecidos. A primeira passagem usa Internet; túneis, FEC e duplicação de overlays serão configurados na retomada de VPN.

#### 24.1. Membros, zones e integração com o encaminhamento

**Aprendizado da seção:** Explicar como a SD-WAN passa a participar do caminho de um fluxo conhecido.

- **24.1.1. Interfaces participantes, zones e endereçamento:** Adicionar membros e organizar zones coerentes. Verificar gateway, acesso administrativo e referências que precisam ser ajustadas, evitando migrar interfaces para SD-WAN sem revisar as policies que as utilizam.
- **24.1.2. Rotas, firewall policies e NAT com SD-WAN:** Configurar a rota e a autorização pela zone e verificar tradução por membro. Demonstrar por que uma regra SD-WAN correspondente não libera uma comunicação bloqueada nem substitui toda condição de rota válida.

#### 24.2. Performance SLAs e medições

**Aprendizado da seção:** Definir o que significa um link estar disponível e adequado para uma aplicação.

- **24.2.1. Probe, servidor, protocolo e métricas:** Configurar health checks e observar latência, perda e jitter no destino escolhido. Comparar detecção de falha física com falha além do gateway e explicar como o ponto de teste influencia a conclusão.
- **24.2.2. Thresholds, recuperação, medição passiva e banda:** Definir limites e tempos de estabilização e verificar elegibilidade dos membros. Incluir medição passiva, estimativa de banda e speed tests quando suportados, distinguindo qualidade observada de capacidade contratada.

#### 24.3. Regras e estratégias de seleção

**Aprendizado da seção:** Prever a decisão usando critérios, ordem e estratégia, em vez de apenas olhar o gráfico de SLA.

- **24.3.1. Manual, best quality, lowest cost e distribuição:** Construir regras com as estratégias suportadas no build e comparar o mesmo fluxo. Demonstrar que menor custo entre links qualificados por SLA não equivale a escolher menor latência, verificando também comportamento quando nenhum membro atinge o SLA.
- **24.3.2. Aplicações, ISDB, origem e regras implícitas:** Selecionar tráfego por critérios já conhecidos e conferir o resultado da regra específica e do tratamento implícito. Relacionar identificação tardia da aplicação, PBR e lookup de rota ao caminho observado na sessão.

#### 24.4. Falha e recuperação dos links

**Aprendizado da seção:** Validar continuidade e reconhecer quando a sessão segue um caminho anterior ou precisa ser recriada.

- **24.4.1. Degradação, recuperação e sessões existentes:** Introduzir degradação controlada ou indisponibilidade e observar decisões para novas sessões e sessões em andamento. Conferir logs, monitores e comandos de estado para explicar estabilidade, flapping e comportamento de retorno.

**Prática e evidência:** Comparar dois links por custo e qualidade e comprovar a decisão normal e em falha por regra, rota e sessão.

**Critério de conclusão:** O aluno prevê o membro selecionado e distingue custo, qualidade e elegibilidade por SLA.

### 25. VPN I: arquiteturas e IPsec site-to-site

**Base já ensinada:** 03, 05, 15, 21, 24
**Retoma:** Primeira passagem.
**Base atual:** C11, C12; ampliar conforme o escopo desta passagem.
**Objetivo:** Entender arquiteturas de VPN e configurar IPsec entre sites com rotas e policies explícitas. Comprovar negociação, SAs e tráfego útil separadamente usando uma topologia simples.
**Por que nesta posição:** O aluno já autoriza tráfego e escolhe caminhos. ADVPN, múltiplos hubs e BGP exigem contexto adicional e serão implementados depois do roteamento dinâmico.

#### 25.1. Arquiteturas de VPN e decisão de projeto

**Aprendizado da seção:** Escolher a arquitetura pela comunicação que deve existir e pelos componentes que a sustentam.

- **25.1.1. Site-to-site, hub-and-spoke, full mesh e redundância:** Comparar os caminhos entre redes, a quantidade de túneis e o domínio de falha em cada topologia. Relacionar matriz/filial, múltiplas operadoras e terceiros à escolha, antes de configurar assistentes.
- **25.1.2. Dial-up, ADVPN, remote access e Agentless:** Comparar peers conhecidos e dinâmicos, descoberta de atalhos, acesso de rede por cliente e acesso por portal. Distinguir arquitetura de topologia, mecanismo de negociação e método de autenticação e explicitar o que não é oferecido pelo SSL VPN tunnel mode legado.

#### 25.2. Como IPsec funciona no FortiGate

**Aprendizado da seção:** Relacionar cada parâmetro de configuração à negociação ou ao tráfego protegido.

- **25.2.1. IKE, autenticação e Phase 1:** Configurar IKEv1/IKEv2 nos cenários suportados e explicar peer ID, PSK/certificado, propostas, DH, timers e DPD. Observar a negociação e diferenciar peer inalcançável, proposta incompatível e autenticação recusada.
- **25.2.2. Phase 2, selectors, SAs e rekey:** Configurar seletores, propostas, PFS e lifetimes e verificar SAs instaladas. Mostrar que uma Phase 1 ativa não prova existência de seletor compatível nem autorização do tráfego desejado.

#### 25.3. Site-to-site com tráfego verificável

**Aprendizado da seção:** Conectar redes e demonstrar qual parte do caminho é túnel e qual depende de roteamento e autorização.

- **25.3.1. Wizard, configuração manual, interfaces e rotas:** Comparar o que o assistente cria com a configuração manual equivalente. Instalar o caminho das redes protegidas e identificar os objetos resultantes, evitando tratar wizard como substituto da explicação dos componentes.
- **25.3.2. Policies, NAT, retorno e redes sobrepostas:** Criar regras apenas nas direções que precisam iniciar sessões e inspecionar o tráfego permitido. Conferir seletores, SNAT e retorno usando redes distintas; endereços sobrepostos serão tratados na retomada de NAT, quando o aluno já conhecer o túnel e as traduções.

#### 25.4. Transporte do primeiro túnel

**Aprendizado da seção:** Reconhecer como IPsec atravessa o caminho externo e como a MTU afeta o tráfego interno.

- **25.4.1. ESP, NAT-T e MTU:** Observar ESP ou encapsulamento NAT-T no transporte entre peers. Relacionar endereço externo, tradução no caminho e overhead à comunicação protegida, testando tamanho de pacote e retorno sem introduzir ainda TCP/TLS e criptografia avançada.
- **25.4.2. Transporte TCP e TLS 1.3:** Configurar o encapsulamento suportado e observar sua conexão externa. Distinguir IPsec sobre TLS de SSL VPN e verificar os peers e clientes compatíveis com o modo do patch, sem estender suporte entre produtos por semelhança de nome.

**Prática e evidência:** Configurar site-to-site e verificar peer, SAs, rota e policy em cada direção de início necessária.

**Critério de conclusão:** O aluno explica por que o túnel estabelecido não comprova, sozinho, acesso entre as redes.

### 26. VPN II: acesso remoto e Agentless

**Base já ensinada:** 17, 18, 25
**Retoma:** 25
**Base atual:** C11, C12; ampliar conforme o escopo desta passagem.
**Objetivo:** Aplicar a VPN ao usuário remoto e comparar acesso de rede por IPsec com acesso a recursos pelo portal Agentless. Entregar endereço, DNS, autenticação e autorização coerentes e diagnosticar as etapas do acesso.
**Por que nesta posição:** A negociação básica e a identidade já foram ensinadas. O aluno pode aprender os dois modelos de acesso remoto sem depender de ADVPN ou de algoritmos especializados.

#### 26.1. Acesso remoto IPsec

**Aprendizado da seção:** Entregar acesso de rede ao usuário com identidade, endereçamento e autorização definidos.

- **26.1.1. FortiClient, clientes nativos, pool e DNS:** Configurar IKEv2, atribuição de endereços, DNS/sufixos e rotas de cliente. Comparar split e full tunnel no cliente suportado e verificar o caminho de aplicações internas e de Internet.
- **26.1.2. Autenticação e autorização do usuário remoto:** Aplicar usuários, grupos, MFA, SAML ou certificados já ensinados e limitar os recursos pelas policies. Comparar login aceito e acesso autorizado, conferindo o grupo e a regra usados, sem antecipar sinais de postura ainda não apresentados.

#### 26.2. Agentless VPN

**Aprendizado da seção:** Oferecer acesso pelo portal web respeitando protocolos e limitações do recurso.

- **26.2.1. Portal, realms, bookmarks e protocolos:** Configurar portal, mapeamento de usuário/grupo e recursos publicados como RDP/SSH/HTTPS suportados. Distinguir acesso por proxy web de criação de uma interface de túnel IP no cliente e conferir disponibilidade por modelo.
- **26.2.2. Autenticação, certificados, restrições e logs:** Aplicar autenticação e MFA compatíveis, restringir recursos e ajustar opções de sessão e clipboard quando suportadas. Conferir TLS, patch e mudanças de segurança e validar o acesso concedido a cada grupo.

#### 26.3. Diagnóstico de VPN por etapa

**Aprendizado da seção:** Investigar a função que falhou antes de trocar vários parâmetros da negociação.

- **26.3.1. IKE, SAs e transporte:** Ler logs e estados de negociação e executar debug filtrado e breve quando necessário. Separar indisponibilidade do peer, autenticação, propostas e rekey, encerrando a coleta ao obter a evidência necessária.
- **26.3.2. Túnel ativo sem comunicação útil:** Correlacionar seletores, rotas, sessão, policy, NAT, DNS e retorno. Testar tráfego em cada direção de início prevista e identificar por que túnel ativo e ping originado pelo FortiGate não comprovam acesso completo do usuário.

#### 26.4. Postura aplicada ao acesso remoto

**Aprendizado da seção:** Retomar a VPN conhecida e acrescentar um sinal de postura depois de compreender seu contexto.

- **26.4.1. FortiClient e postura enviada por JWT:** Configurar o cenário suportado de envio de tags de postura do FortiClient ao FortiGate como JWT. Aplicar o sinal à decisão de acesso e testar conformidade e ausência do sinal, distinguindo essa integração do modelo completo EMS/ZTNA.

**Prática e evidência:** Configurar um cliente remoto e um portal Agentless compatível e testar usuário autorizado, recurso não autorizado e falha de autenticação.

**Critério de conclusão:** O aluno comprova o recurso acessível e identifica a etapa responsável por uma falha.

### 27. Integração do FortiGate com SASE

**Base já ensinada:** 19, 25, 26
**Retoma:** Primeira passagem.
**Base atual:** C15, C16; ampliar conforme o escopo desta passagem.
**Objetivo:** Integrar o FortiGate ao cenário SASE suportado e comprovar o acesso aos recursos privados. Distinguir responsabilidades e controles dos produtos envolvidos.
**Por que nesta posição:** VPN, identidade e acesso por aplicação já foram apresentados. A integração SASE pode ser ensinada agora e não depende de o aluno implantar FortiGate VM em uma nuvem pública.

#### 27.1. Papel do FortiGate na integração

**Aprendizado da seção:** Construir e verificar o lado FortiGate do acesso privado suportado.

- **27.1.1. Arquitetura e responsabilidades:** Relacionar o FortiGate, o serviço SASE e os recursos privados do cenário. Identificar o transporte e o ponto de aplicação dos controles, distinguindo configuração do FortiGate de administração do serviço externo.
- **27.1.2. Conexão, rotas e policies:** Configurar o lado FortiGate da integração suportada com os mecanismos de VPN, identidade e acesso já ensinados. Conferir os objetos gerados e o caminho do tráfego; não assumir equivalência entre serviços ou versões.
- **27.1.3. Comprovação do acesso e diagnóstico:** Testar recurso permitido e negado e separar estado da conexão, rota e autorização. Usar logs e sessões do FortiGate para localizar o domínio responsável, sem exigir implantação prévia de uma VM em nuvem.

**Prática e evidência:** Configurar o lado FortiGate de uma integração suportada e comprovar caminho e autorização de um recurso privado.

**Critério de conclusão:** O aluno identifica o mecanismo usado e qual componente decidiu o acesso.

### 28. Alta disponibilidade: FGCP e alternativas

**Base já ensinada:** 07, 21, 25, 26
**Retoma:** Primeira passagem.
**Base atual:** C13; ampliar conforme o escopo desta passagem.
**Objetivo:** Formar um cluster FGCP e compará-lo com FGSP e VRRP pelo estado e pela responsabilidade preservados. Testar failover com policies, NAT, inspeção e VPN já conhecidos.
**Por que nesta posição:** Já há comunicações reais para avaliar continuidade. A comparação de alternativas não exige BGP ou ADVPN; manutenção e atualização ficam após o ciclo de firmware.

#### 28.1. FGCP e formação do cluster

**Aprendizado da seção:** Explicar compatibilidade, eleição e sincronização antes de testar a troca de primário.

- **28.1.1. Active-passive, active-active, heartbeat e eleição:** Configurar o cluster com parâmetros compatíveis e observar papéis e heartbeat. Explicar os critérios de eleição e override conforme o build e distinguir distribuição de processamento de duplicação garantida de capacidade.
- **28.1.2. Sincronização, checksums e gerência de membros:** Verificar estado de sincronização e identificar configurações que não são compartilhadas. Acessar os membros, comparar checksums e corrigir divergência com evidência, mantendo caminho de administração durante o teste.

#### 28.2. Sessões e condições de failover

**Aprendizado da seção:** Medir continuidade dos serviços conhecidos e identificar quais estados não são preservados.

- **28.2.1. Session pickup, NAT, TCP/UDP e VPN:** Habilitar os mecanismos de sincronização apropriados e acompanhar sessões reais durante a troca de membro. Comparar tráfego de trânsito, proxy e IPsec e explicar as limitações documentadas de preservação.
- **28.2.2. Interfaces monitoradas, link failure e split brain:** Testar falha de interface monitorada, perda de caminho e perda de heartbeat separadamente. Verificar eleição, detecção e anúncio do novo caminho e discutir a contenção de split brain sem assumir que o cluster conhece toda falha externa.

#### 28.3. FGSP

**Aprendizado da seção:** Compartilhar estado entre equipamentos independentes e explicar o papel do encaminhamento externo.

- **28.3.1. FGSP e sincronização entre equipamentos independentes:** Configurar o compartilhamento de sessões no cenário suportado e explicitar o que continua independente, como configuração e encaminhamento. Comparar com FGCP e verificar o papel da rede em encaminhar conexões aos peers corretos.

#### 28.4. VRRP

**Aprendizado da seção:** Disponibilizar o gateway e demonstrar quais estados não são sincronizados pelo protocolo.

- **28.4.1. VRRP e disponibilidade do gateway:** Configurar o endereço virtual e observar eleição e mudança de gateway. Demonstrar que VRRP, sozinho, não replica configuração ou estado de firewall e comparar com clusters e modelos de HA na nuvem.

**Prática e evidência:** Testar failover FGCP e comparar compartilhamento de sessão FGSP com disponibilidade de gateway VRRP no cenário suportado.

**Critério de conclusão:** O aluno explica o estado preservado por cada mecanismo e comprova continuidade com tráfego.

### 29. Interfaces II: agregação, redundância e recursos lógicos

**Base já ensinada:** 02, 21, 28
**Retoma:** 02
**Base atual:** C01; ampliar conforme o escopo desta passagem.
**Objetivo:** Retomar interfaces para explicar agregação, redundância e objetos lógicos com contexto de sessões e disponibilidade. Comparar o comportamento de cada agrupamento e verificar seus limites.
**Por que nesta posição:** O primeiro contato com interfaces já permitiu policies, SD-WAN e VPN. Esses fluxos agora dão sentido a redundância, distribuição e ajuste de parâmetros.

#### 29.1. Switches de hardware e software

**Aprendizado da seção:** Comparar arquitetura e encaminhamento dos agrupamentos já apresentados.

- **29.1.1. Hardware switch, software switch e domínio de encaminhamento:** Criar ou comparar os tipos de switch suportados e observar membros, endereçamento e dependências. Explicar o caminho do tráfego interno ao switch e entre interfaces, verificando em quais situações existe avaliação de policy.

#### 29.2. Agregação de enlaces

**Aprendizado da seção:** Configurar a distribuição e verificar os membros do enlace lógico.

- **29.2.1. Agregação estática e LACP:** Configurar a agregação suportada e conferir negociação, membros e distribuição de sessões. Demonstrar falha de um membro e distinguir banda agregada de velocidade garantida para uma única conexão.

#### 29.3. Interface redundante

**Aprendizado da seção:** Configurar disponibilidade de enlace sem confundir com agregação ou cluster.

- **29.3.1. Membros e troca de interface ativa:** Configurar a interface redundante e observar qual membro encaminha o tráfego. Testar a perda do membro ativo e verificar sessões e retorno, comparando o mecanismo com LACP e com HA do FortiGate.

#### 29.4. Loopback e informações de vizinhança

**Aprendizado da seção:** Aprofundar interfaces lógicas, ARP/proxy ARP e informações LLDP.

- **29.4.1. Loopback, endereços secundários, ARP e LLDP:** Usar loopback como endereço lógico e verificar a rota para alcançá-lo. Consultar ARP, proxy ARP, NDP quando aplicável e LLDP; reconhecer conflitos, vizinhança incorreta e referências que impedem alterar a interface.

#### 29.5. IPAM

**Aprendizado da seção:** Automatizar atribuição de endereços e verificar pools, regras e origem da alocação.

- **29.5.1. IPAM, pools, regras e templates:** Configurar atribuição automática com IPAM e verificar a origem do endereço entregue a uma interface. Comparar com DHCP e conectar o recurso a VPN remota e extensões, sem antecipar a configuração dessas funções.

#### 29.6. Parâmetros e estado físico

**Aprendizado da seção:** Retomar campos que agora podem ser avaliados pelo efeito sobre tráfego e disponibilidade.

- **29.6.1. MTU, velocidade, duplex e contadores:** Comparar os parâmetros físicos e de tamanho com o tráfego conhecido. Identificar erro de enlace, incompatibilidade e restrição de MTU usando contadores e captura, sem concluir apenas a partir do estado link-up.

**Prática e evidência:** Comparar switch local, LACP e interface redundante e demonstrar falha de membro; consultar loopback, vizinhança e atribuição por IPAM.

**Critério de conclusão:** O aluno escolhe o agrupamento pelo comportamento de encaminhamento e disponibilidade e comprova a decisão.

### 30. Implantação II: modo transparente e virtual wire pair

**Base já ensinada:** 03, 09, 29
**Retoma:** 02, 03
**Base atual:** C01; ampliar conforme o escopo desta passagem.
**Objetivo:** Comparar implantação roteada, modo transparente e virtual wire pair e configurar a autorização do par no mesmo momento em que sua arquitetura é ensinada.
**Por que nesta posição:** O aluno já domina o caminho roteado e os perfis. Os modos alternativos passam a ser escolhas de implantação compreensíveis, e a VWP policy é aplicada depois de o par existir.

#### 30.1. Transparent mode

**Aprendizado da seção:** Inserir o FortiGate em um caminho sem tratá-lo como o mesmo gateway roteado do início.

- **30.1.1. Transparent mode e domínios de encaminhamento:** Comparar configuração, gerência, VLANs, prevenção de loops e caminhos do modo transparente com o modo roteado. Demonstrar uma comunicação inspecionada e explicitar as restrições documentadas de recursos e topologia.

#### 30.2. Virtual wire pair e suas policies

**Aprendizado da seção:** Configurar o par e seu controle de acesso como uma implementação contínua.

- **30.2.1. Virtual wire pair e dependência das VWP policies:** Criar o par, definir os lados e as VLANs aceitas e observar o caminho do tráfego. Aplicar suas VWP policies nas próximas seções deste mesmo módulo e comparar com a implantação roteada já conhecida.
- **30.2.2. Correspondência, direção e VLANs no par:** Criar as policies para o par definido nesta passagem e demonstrar critérios e direções. Comparar com firewall policy roteada e observar as interfaces, VLANs e endereços efetivamente considerados pelo mecanismo.
- **30.2.3. Inspeção, logs e NAT no cenário suportado:** Associar perfis ao tráfego do par e validar um acesso permitido e outro bloqueado. Examinar suporte e finalidade do SNAT em VWP quando documentado, comprovando o comportamento por sessão e captura.

**Prática e evidência:** Comparar um fluxo no modo roteado e transparente e criar VWP e suas policies para tráfego permitido e negado.

**Critério de conclusão:** O aluno explica o papel da interface e a regra que controla o tráfego em cada modo.

### 31. Segmentação II: VDOMs e VRFs

**Base já ensinada:** 21, 29, 30
**Retoma:** 02, 03
**Base atual:** C01; ampliar conforme o escopo desta passagem.
**Objetivo:** Separar contextos de administração, configuração e encaminhamento no FortiGate. Escolher VDOM ou VRF pelo isolamento necessário e controlar comunicação entre ambientes, inclusive com endereços sobrepostos.
**Por que nesta posição:** Policies, caminhos e modos de implantação já existem. Agora o aluno pode reconhecer quais objetos e estados ficam separados por contexto e como cruzar a fronteira com controle.

#### 31.1. VDOM: configuração, administração e recursos

**Aprendizado da seção:** Entender o que muda ao criar um contexto virtual e quais partes continuam globais.

- **31.1.1. Global, management VDOM e tipos de VDOM:** Criar VDOM no modo suportado e associar interfaces e administradores. Comparar configuração global e por VDOM, explicar o papel do management VDOM e conferir limites e licenciamento do equipamento.
- **31.1.2. Recursos, logs e acesso por administrador:** Definir escopo e limites disponíveis e demonstrar visões de configuração e logs por VDOM. Validar que um administrador restrito não recebe o mesmo alcance de um administrador global.

#### 31.2. VRFs

**Aprendizado da seção:** Isolar tabelas e conferir sobreposição de endereços sem assumir isolamento administrativo de VDOM.

- **31.2.1. Tabelas VRF e endereçamento sobreposto:** Associar interfaces à VRF e comprovar rotas e sessões no contexto correspondente. Comparar sobreposição de endereços e alcance entre VRFs com o comportamento entre VDOMs.

#### 31.3. Comunicação entre contextos

**Aprendizado da seção:** Controlar inter-VDOM links e route leaking com rotas e policies verificáveis.

- **31.3.1. Inter-VDOM links, route leaking e policies:** Criar o caminho entre contextos e configurar explicitamente rotas e permissões. Usar route leaking ou links no cenário suportado, conferindo entrada, saída, tradução e logs em cada contexto.

**Prática e evidência:** Isolar dois ambientes e permitir somente um serviço entre eles, comprovando rota, policy e administração no contexto correto.

**Critério de conclusão:** O aluno escolhe VDOM ou VRF pela necessidade de isolamento e mostra em qual contexto cada decisão foi tomada.

### 32. IPv6 e dual stack: aplicar os controles já conhecidos

**Base já ensinada:** 05, 08, 21, 31
**Retoma:** 02, 03, 04, 05
**Base atual:** Produzir conteúdo específico para esta funcionalidade.
**Objetivo:** Configurar as funções IPv6 do FortiGate e replicar controles já compreendidos em IPv4. Verificar endereçamento, anúncio, roteamento, policies, tradução e inspeção sem presumir equivalência de todos os recursos.
**Por que nesta posição:** O aluno já configurou interfaces, serviços, policies, NAT e rotas em IPv4. IPv6 retoma essas tarefas com uma referência concreta, em vez de aparecer antes da primeira regra.

#### 32.1. Endereçamento e serviços IPv6

**Aprendizado da seção:** Configurar o FortiGate como interface, cliente ou servidor nos mecanismos IPv6 suportados.

- **32.1.1. Interfaces, NDP, RA, SLAAC e DHCPv6:** Configurar endereços e anúncios e verificar vizinhos e concessões no equipamento. Demonstrar a influência das opções RA e DHCPv6 na configuração obtida pelo cliente, incluindo os registros que permitem localizar uma falha.
- **32.1.2. Prefix delegation e atribuição a interfaces:** Receber um prefixo da operadora e distribuí-lo às interfaces internas no FortiGate. Observar mudança ou renovação do prefixo e seu efeito sobre objetos, rotas e acessos existentes.

#### 32.2. Controle e encaminhamento dual stack

**Aprendizado da seção:** Garantir que a política de acesso pretendida exista nas duas famílias.

- **32.2.1. Rotas, policies, objetos e inspeção IPv6:** Configurar rota e autorização IPv6 e testar com logs, sessão e captura. Conferir grupos, geografia/MAC quando suportados e compatibilidade dos perfis, identificando o que precisa de configuração distinta da policy IPv4.
- **32.2.2. ICMPv6, PMTUD e serviços locais:** Diagnosticar comunicação que falha por descoberta de vizinho ou tamanho de pacote. Verificar acesso local-in e serviços do FortiGate nas duas famílias, sem supor que proteger a gerência IPv4 protege automaticamente o endereço IPv6.

#### 32.3. Tradução e interoperabilidade

**Aprendizado da seção:** Aplicar traduções entre famílias quando o serviço realmente exige essa função.

- **32.3.1. NAT66, NAT46, NAT64 e DNS64:** Comparar os cenários de tradução suportados e configurar um fluxo entre famílias com os objetos e rotas corretos. Usar DNS64 quando necessário e observar endereços e portas na sessão e nas capturas.

#### 32.4. DHCPv6 relay

**Aprendizado da seção:** Encaminhar a solicitação IPv6 e verificar a resposta do servidor.

- **32.4.1. Configuração e validação do relay:** Configurar relay DHCPv6 para um servidor externo e observar a solicitação e a atribuição de endereço. Conferir interface, origem e resposta e distinguir o encaminhamento de mensagens do serviço DHCPv6 local.

#### 32.5. NDP proxy

**Aprendizado da seção:** Verificar a função de proxy de vizinhança sem tratá-la como tradução de endereço.

- **32.5.1. Configuração e estado de vizinhança:** Aplicar NDP proxy no cenário suportado e verificar as mensagens e os vizinhos aprendidos. Conferir o encaminhamento entre os segmentos e comparar com NAT66, identificando o que foi resolvido pelo proxy e o que continua dependendo de rota e policy.

**Prática e evidência:** Entregar conectividade IPv6, autorizar os acessos previstos e demonstrar um caso de tradução entre famílias com rastreio das duas direções.

**Critério de conclusão:** O aluno comprova políticas e caminhos independentes nas duas famílias e identifica limites de tradução ou inspeção no build usado.

### 33. ZTNA II: SCIM, dual stack e conectores

**Base já ensinada:** 19, 20, 32
**Retoma:** 19
**Base atual:** C16; ampliar conforme o escopo desta passagem.
**Objetivo:** Retomar ZTNA para usar grupos provisionados, operar dual stack e configurar os conectores específicos suportados. Comparar os novos caminhos com o primeiro acesso já conhecido.
**Por que nesta posição:** SCIM e IPv6 já foram ensinados. A retomada entra assim que esse contexto existe, sem depender de estudar todos os controladores LAN ou a implantação em nuvem.

#### 33.1. Conectores ZTNA

**Aprendizado da seção:** Configurar o caminho específico do conector e verificar seus papéis.

- **33.1.1. Service connector, reverse gateway e forwarder:** Configurar o conector ZTNA no modelo suportado e identificar os papéis reverse gateway e forwarder. Observar o caminho até o recurso e distinguir estado do conector, conexão ao backend e decisão de acesso.

#### 33.2. Autorização SCIM no ZTNA

**Aprendizado da seção:** Consumir os grupos provisionados na decisão de acesso por aplicação.

- **33.2.1. Grupo e certificado do peer:** Usar o grupo SCIM já provisionado e o certificado de dispositivo no cenário de autorização suportado. Comparar usuário dentro e fora do grupo e localizar a condição que determinou o acesso, sem tratar a sincronização SCIM como autenticação.

#### 33.3. Dual stack e operação

**Aprendizado da seção:** Aplicar a autorização ZTNA nas duas famílias depois de aprender IPv6.

- **33.3.1. Validação IPv4 e IPv6:** Conferir o suporte de tags, certificados e regras nas duas famílias e executar o mesmo acesso ZTNA em IPv4 e IPv6. Separar falha de endereçamento, condição de identidade, postura e conexão ao servidor real.

**Prática e evidência:** Usar um grupo SCIM e comparar acesso IPv4/IPv6; demonstrar o conector ZTNA suportado com log e condição de autorização.

**Critério de conclusão:** O aluno comprova a condição e o caminho em cada variante e distingue o incremento sobre o caso inicial.

### 34. Encapsulamentos de rede: GRE e VXLAN

**Base já ensinada:** 21, 31, 32
**Retoma:** Primeira passagem.
**Base atual:** C01; ampliar conforme o escopo desta passagem.
**Objetivo:** Configurar os encapsulamentos suportados e observar endereços internos/externos, MTU e caminho. Entender VXLAN antes de associar o plano de controle BGP EVPN.
**Por que nesta posição:** Roteamento, isolamento e IPv6 já são conhecidos. Os túneis de transporte podem ser explicados sem confundi-los com IPsec; EVPN será ensinado junto de BGP.

#### 34.1. GRE e IP-in-IP

**Aprendizado da seção:** Configurar o transporte e distinguir encapsulamento de confidencialidade.

- **34.1.1. GRE, IP-in-IP e MTU:** Configurar um túnel de encapsulamento suportado, observar origem/destino externos e tráfego transportado. Definir rota e policy com os conhecimentos anteriores e explicar overhead, MTU e ausência de confidencialidade automática.

#### 34.2. VXLAN

**Aprendizado da seção:** Observar VTEP e segmento e preparar o transporte para a sinalização EVPN posterior.

- **34.2.1. VXLAN, VTEPs e integração EVPN:** Construir o cenário VXLAN suportado e observar o mapeamento entre segmento e encapsulamento. Distinguir configuração de transporte de sinalização EVPN; a parte de EVPN dependente de BGP será aprofundada em 24.

#### 34.3. Transporte IPv6 por túneis

**Aprendizado da seção:** Aplicar encapsulamento com IPv6 depois de compreender os túneis e o controle das duas famílias.

- **34.3.1. Túneis IPv6 e transporte entre famílias:** Configurar o encapsulamento IPv6 suportado no cenário escolhido e verificar endereços externos e internos. Conferir MTU, rota, policy e suporte do mecanismo, distinguindo transporte por túnel de tradução NAT46/NAT64.

**Prática e evidência:** Transportar um segmento pelo encapsulamento escolhido e verificar rota, policy e MTU.

**Critério de conclusão:** O aluno identifica o que é encapsulado e o que o mecanismo não oferece automaticamente.

### 35. Roteamento III: OSPF e IGPs no FortiGate

**Base já ensinada:** 21, 31, 32
**Retoma:** 21
**Base atual:** C04; ampliar conforme o escopo desta passagem.
**Objetivo:** Configurar troca dinâmica de rotas no FortiGate, entender formação de vizinhança e controlar o que é anunciado ou aprendido. Usar OSPF como implementação principal e localizar os demais protocolos suportados.
**Por que nesta posição:** Rotas estáticas, contingência e isolamento já foram usados em serviços reais. Agora o aluno aprende como as rotas entram e saem dinamicamente, sem atrasar a primeira policy ou a primeira VPN.

#### 35.1. OSPF: formação e controle de anúncios

**Aprendizado da seção:** Formar a vizinhança e definir os prefixos anunciados como partes de uma configuração OSPF.

- **35.1.1. Instância, router ID, redes e interfaces:** Configurar OSPF no FortiGate e verificar vizinhos e rotas aprendidas. Relacionar router ID, interface passiva e parâmetros de rede ao tráfego realmente enviado pelo equipamento.
- **35.1.2. Áreas, custo, autenticação e convergência:** Alterar custo e tipo de área no cenário escolhido e observar a rota resultante. Diagnosticar divergências de timers, autenticação e MTU e explicar o efeito de uma falha de interface sobre a convergência.
- **35.1.3. Redistribuição, sumarização, filtros e default:** Configurar filtros e redistribuição limitada entre rotas estáticas e OSPF. Verificar métricas, anúncio da rota padrão e risco de realimentação, comprovando no vizinho quais prefixos foram efetivamente recebidos.

#### 35.2. BFD integrado ao roteamento

**Aprendizado da seção:** Medir a detecção de falha separadamente da seleção e do anúncio de rotas.

- **35.2.1. Sessão BFD e integração com o protocolo:** Habilitar BFD no protocolo e na interface suportados e consultar o estado dos peers. Relacionar timers e recursos do equipamento à velocidade de detecção, demonstrando que BFD informa falha, mas não escolhe sozinho a rota alternativa.
- **35.2.2. Falha, convergência e diagnóstico:** Interromper um caminho controlado e observar o tempo de detecção, a retirada da rota e a comunicação afetada. Comparar com o cenário sem BFD e identificar configuração incompatível entre os peers.

#### 35.3. RIP e RIPng no FortiGate

**Aprendizado da seção:** Configurar e limitar anúncios nos cenários que utilizam esses protocolos.

- **35.3.1. Instância, interfaces, versões e anúncios:** Configurar RIP em IPv4 e a variante RIPng suportada, observando vizinhança e rotas. Definir interfaces participantes e passivas e verificar que apenas as redes desejadas entram na troca de informações.
- **35.3.2. Filtros, métricas, timers e diagnóstico:** Controlar os prefixos e a redistribuição no FortiGate e observar uma retirada de rota. Comparar a métrica aprendida com a seleção na tabela e localizar anúncio ausente ou caminho indesejado.

#### 35.4. IS-IS no FortiGate

**Aprendizado da seção:** Entender a instância do FortiGate e comprovar adjacência, nível e anúncio de prefixos.

- **35.4.1. Instância, NET, interfaces e níveis:** Configurar IS-IS no FortiOS suportado e verificar adjacência e banco de informações. Explicar o efeito dos níveis e da identidade configurada sobre a participação do equipamento no domínio.
- **35.4.2. Métricas, redistribuição e validação:** Configurar métricas e anúncios e observar as rotas instaladas e anunciadas. Introduzir uma alteração limitada e comprovar convergência, conferindo comandos e recursos do FortiGate sem usar documentação de FortiSwitch como se fosse intercambiável.

**Prática e evidência:** Formar vizinhança OSPF, anunciar somente as redes previstas e verificar convergência após uma falha, identificando também a configuração dos IGPs adicionais suportados.

**Critério de conclusão:** O aluno distingue vizinho estabelecido de prefixo anunciado e identifica se uma falha está na adjacência, no filtro ou na seleção da rota.

### 36. BGP: troca e controle de rotas

**Base já ensinada:** 32, 35
**Retoma:** 21
**Base atual:** Produzir conteúdo específico para esta funcionalidade.
**Objetivo:** Estabelecer BGP, controlar anúncios e atributos e verificar a seleção de rotas. Aplicar escalabilidade, validação de origem e famílias de endereço sem configurar EVPN no mesmo objetivo.
**Por que nesta posição:** O aluno já conhece tabelas, IGP e IPv6. Pode aprender BGP por seu funcionamento próprio; a aplicação em VXLAN virá na unidade específica seguinte.

#### 36.1. Estabelecimento e origem de anúncios

**Aprendizado da seção:** Estabelecer uma sessão e comprovar o que foi recebido, aceito e anunciado.

- **36.1.1. eBGP, iBGP, AS, origem e famílias de endereço:** Configurar os peers e verificar estado e transporte TCP. Definir origem de conexão e famílias suportadas e distinguir sessão estabelecida de anúncio válido e de rota instalada.
- **36.1.2. Networks, redistribuição e next hop:** Originar prefixos e observar next hop e disponibilidade da rota necessária. Comparar anúncio explícito e redistribuição e impedir que conectividade de gerência ou redes não previstas sejam propagadas por conveniência.

#### 36.2. Atributos e políticas de anúncios

**Aprendizado da seção:** Controlar os prefixos e metadados propagados pelo FortiGate.

- **36.2.1. Prefix lists, route maps e communities:** Criar filtros de entrada e saída e modificar atributos no escopo desejado. Demonstrar o prefixo antes e depois da aplicação e separar filtro de anúncio de firewall policy, que controla tráfego e não a seleção de rotas.
- **36.2.2. Best path, multipath e manutenção:** Comparar os atributos relevantes à seleção no FortiGate e verificar o caminho ativo. Configurar multipath e opções de graceful restart/shutdown suportadas e observar o efeito da retirada de um peer.
- **36.2.3. Large communities:** Configurar correspondência e propagação de large communities no patch suportado. Demonstrar seu uso em um filtro ou política de anúncio e verificar o atributo recebido pelo peer.

#### 36.3. Route reflector e escala

**Aprendizado da seção:** Organizar a troca de rotas sem misturar distribuição, validação de origem e transporte VXLAN.

- **36.3.1. Route reflector e grupos de peers:** Configurar o modelo de distribuição de rotas e verificar anúncios entre peers e clientes do route reflector. Limitar a propagação e comparar o estado recebido e anunciado em cada participante.

#### 36.4. RPKI

**Aprendizado da seção:** Definir a decisão de tratamento do estado de validação da origem.

- **36.4.1. RPKI origin validation:** Conectar o serviço de validação suportado e distinguir Valid, Invalid e NotFound. Aplicar uma política explícita para cada estado e comprovar o efeito no anúncio recebido, sem confundir validação de origem com autenticação do peer BGP.

#### 36.5. Famílias IPv6 dos protocolos dinâmicos

**Aprendizado da seção:** Aplicar ao IPv6 os protocolos que acabam de ser configurados e verificar as tabelas de cada família.

- **36.5.1. Roteamento dinâmico e diagnóstico por família:** Aplicar as famílias IPv6 de OSPF/BGP já aprendidas e consultar as tabelas correspondentes. Testar DNS, origem, retorno e inspeção em cada família para localizar diferenças sem desabilitar IPv6 como primeira medida.

**Prática e evidência:** Estabelecer peers, filtrar anúncios, alterar um atributo e observar o caminho e o estado RPKI no cenário suportado.

**Critério de conclusão:** O aluno prevê o anúncio e a rota selecionada e comprova a previsão nas tabelas.

### 37. EVPN sobre VXLAN

**Base já ensinada:** 34, 36
**Retoma:** 34, 36
**Base atual:** Produzir conteúdo específico para esta funcionalidade.
**Objetivo:** Construir a implementação EVPN/VXLAN usando os mecanismos de transporte e anúncio já aprendidos. Verificar o que cada componente fornece ao caminho.
**Por que nesta posição:** BGP e VXLAN acabam de receber explicação própria. EVPN entra como integração desses mecanismos, com objetivo e demonstração separados.

#### 37.1. Sinalização do segmento VXLAN

**Aprendizado da seção:** Adicionar EVPN ao transporte já configurado e comprovar os anúncios resultantes.

- **37.1.1. Integração entre VXLAN e BGP EVPN:** Configurar o plano de controle EVPN suportado sobre o VXLAN conhecido e verificar VTEPs e rotas MAC/IP. Identificar o que é anunciado e o que continua dependendo do transporte e das policies.
- **37.1.2. Type-5 e anycast no cenário suportado:** Aplicar rotas type-5 e anycast quando disponíveis no patch e modelo escolhidos. Verificar prefixos e alcance e distinguir o encaminhamento de rede do anúncio da informação de controle.
- **37.1.3. Diagnóstico por plano de controle e transporte:** Comparar um anúncio ausente com um transporte indisponível e uma negação de policy. Conferir peer, rota, VTEP e sessão antes de alterar vários componentes simultaneamente.

**Prática e evidência:** Observar anúncios e transporte e comprovar uma comunicação permitida e uma falha de um dos planos.

**Critério de conclusão:** O aluno identifica se a falha está na sinalização, transporte ou autorização.

### 38. Multicast: encaminhamento e autorização

**Base já ensinada:** 03, 29, 35
**Retoma:** Primeira passagem.
**Base atual:** C04; ampliar conforme o escopo desta passagem.
**Objetivo:** Configurar o encaminhamento multicast e suas policies na mesma passagem. Distinguir inscrição, caminho da origem e autorização e validar quais receptores recebem o fluxo.
**Por que nesta posição:** O aluno já conhece rotas e modos de interface. Agora pode ligar a construção do estado multicast à regra específica que autoriza sua distribuição, sem precisar saltar para uma seção futura.

#### 38.1. Encaminhamento multicast

**Aprendizado da seção:** Formar e verificar inscrição, caminho e RPF antes de aplicar a autorização.

- **38.1.1. IGMP, PIM, grupos e rendezvous point:** Configurar o FortiGate como participante do cenário multicast e verificar interfaces, inscrição e estado de grupos. Demonstrar a escolha do caminho e o papel de RP/BSR quando usados, com foco na configuração e nos monitores do equipamento.
- **38.1.2. RPF multicast, rotas e relação com multicast policies:** Acompanhar a origem e os receptores e investigar ausência de inscrição ou falha de RPF. Aplicar a multicast policy nas seções seguintes do mesmo módulo, comprovando separadamente estado de encaminhamento e autorização.

#### 38.2. Multicast policies

**Aprendizado da seção:** Autorizar distribuição multicast sobre o estado de encaminhamento já aprendido.

- **38.2.1. Origem, grupo, entrada e saída:** Configurar a multicast policy no cenário que acaba de ser construído e definir os critérios suportados. Demonstrar um receptor autorizado e outro fora do escopo e distinguir inscrição no grupo de permissão para receber o tráfego.
- **38.2.2. Logs, TTL, NAT e shaping aplicáveis:** Conferir os recursos suportados na multicast policy e observar seus efeitos no fluxo real. Correlacionar tabela multicast, RPF, policy e captura, deixando o dimensionamento de shaping para o módulo seguinte.

**Prática e evidência:** Construir um grupo multicast e permitir sua distribuição apenas aos destinos previstos, comprovando estado, policy e captura.

**Critério de conclusão:** O aluno identifica se a falha decorre de inscrição, RPF, encaminhamento ou autorização.

### 39. VPN III: ADVPN e overlays

**Base já ensinada:** 24, 25, 26, 36
**Retoma:** 24, 25, 26
**Base atual:** C11, C12; ampliar conforme o escopo desta passagem.
**Objetivo:** Construir ADVPN e múltiplos caminhos com roteamento dinâmico e integrar overlays à SD-WAN. Observar criação de atalhos e escolha de caminhos.
**Por que nesta posição:** BGP e VPN básica já foram ensinados. ADVPN usa esse contexto; métodos de chaves e transporte não são colocados aqui apenas por terem sido chamados de avançados.

#### 39.1. Redundância e integração VPN–SD-WAN

**Aprendizado da seção:** Controlar caminhos entre sites usando componentes já ensinados.

- **39.1.1. Túneis redundantes, SLA e seleção de overlay:** Adicionar túneis às zones e medir o destino pelo overlay correto. Demonstrar falha de transporte e degradação do túnel separadamente, verificando rota, regra SD-WAN e policy de autorização.
- **39.1.2. FEC, packet duplication e QoS do túnel:** Aplicar otimizações suportadas e observar consumo e resultado sob condições controladas. Conferir compatibilidade entre versões, DSCP e MTU, explicando por que redundância e correção de perda podem aumentar a banda utilizada.

#### 39.2. ADVPN e redes distribuídas

**Aprendizado da seção:** Construir a descoberta de atalhos e explicar o controle e o encaminhamento resultantes.

- **39.2.1. Hub, spokes, atalhos e roteamento:** Configurar os papéis e o protocolo de roteamento adequado, usando BGP já aprendido quando escolhido. Demonstrar fluxo inicialmente pelo hub e atalho entre spokes, comprovando SAs, rotas e policies de cada participante.
- **39.2.2. Múltiplos hubs, SD-WAN e operação de atalhos:** Evoluir para redundância e seleção de caminhos e verificar criação e remoção de atalhos. Conferir recursos e versões de ADVPN/SD-WAN suportadas e investigar túnel ativo que não recebe o tráfego esperado.

#### 39.3. Otimização dos overlays

**Aprendizado da seção:** Aplicar FEC, duplicação e controles de consumo sobre túneis que já foram explicados.

- **39.3.1. FEC, duplicação, quotas e passagem para overlays:** Aplicar os recursos suportados de FEC, duplicação, quotas e seleção aos overlays já configurados nesta retomada. Observar ganho e custo de banda e conferir compatibilidade de versão, incluindo as alterações de FEC do 8.0.

**Prática e evidência:** Observar o caminho via hub, a criação de atalho e a seleção de overlay em falha e recuperação.

**Critério de conclusão:** O aluno comprova rota, SA, policy e regra SD-WAN do caminho escolhido.

### 40. Firewall policies II: regras e mecanismos especializados

**Base já ensinada:** 03, 09, 17, 30, 38
**Retoma:** 03
**Base atual:** C02; ampliar conforme o escopo desta passagem.
**Objetivo:** Retomar o controle de acesso para proxies, gerência local, anomalias e modelos NGFW. Aprofundar objetos e manutenção de sessões e distinguir ACLs e interface policies pelo ponto de aplicação.
**Por que nesta posição:** A identidade, os perfis, os modos de implantação e as arquiteturas de tráfego já foram usados. Cada policy especializada passa a controlar um mecanismo conhecido; VWP e multicast foram implementados junto dos respectivos caminhos.

#### 40.1. Objetos e seleção de destinos

**Aprendizado da seção:** Retomar critérios de correspondência com contexto de serviços e aplicações.

- **40.1.1. FQDN, wildcard FQDN, geografia e MAC:** Observar como o FortiGate aprende ou resolve os endereços de um FQDN e quando eles mudam. Comparar esse comportamento com geografia e identificação MAC e explicar por que nenhum deles equivale a autenticar uma pessoa ou identificar uma aplicação.
- **40.1.2. Internet Service Database e grupos de serviços de Internet:** Consultar um destino na ISDB e usar IPs, portas e metadados da base para construir a regra. Comparar com FQDN e serviço customizado, verificando atualização, cache, customizações e tratamento quando o destino não pertence ao registro esperado.

#### 40.2. Manutenção das regras e das sessões

**Aprendizado da seção:** Alterar policies com previsibilidade e reconhecer problemas que a ordem ou a abrangência podem causar.

- **40.2.1. Sombreamento, duplicidade, consolidação e referências:** Comparar regras com sobreposição, localizar a que recebe os acessos e reorganizar a lista preservando o resultado desejado. Usar comentários, tags, busca, contadores e referências para avaliar regras e objetos sem uso.
- **40.2.2. Alterações de policy e conexões já estabelecidas:** Modificar uma regra durante um teste e observar a sessão existente e uma nova conexão. Explicar reavaliação, timers e limpeza seletiva de sessões sem assumir que toda mudança afetará todas as conexões da mesma maneira.

#### 40.3. Explicit proxy e proxy policies

**Aprendizado da seção:** Distinguir cliente usando um serviço proxy do FortiGate de inspeção proxy-based em uma firewall policy.

- **40.3.1. Listener, configuração do cliente, PAC e correspondência:** Habilitar o serviço de proxy explícito, configurar o cliente e criar a proxy policy. Comparar endereço/porta de escuta, destinos e critérios de seleção e identificar a conexão do cliente ao FortiGate e a conexão aberta pelo proxy.
- **40.3.2. Autenticação, secure explicit proxy e inspeção:** Aplicar os usuários, grupos e o método de autenticação já aprendidos, incluindo SAML no cenário suportado. Configurar TLS e perfis compatíveis e verificar as restrições de certificado de cliente documentadas para o proxy seguro.
- **40.3.3. Configuração e autorização do FTP proxy:** Habilitar o serviço disponível e definir autenticação, policy e opções compatíveis. Verificar a conexão do cliente e o acesso ao destino, distinguindo FTP explícito de simples passagem de FTP por uma firewall policy.

#### 40.4. Local-in policies e proteção de serviços do equipamento

**Aprendizado da seção:** Controlar conexões destinadas ao próprio FortiGate de forma distinta do trânsito entre redes.

- **40.4.1. Admin access, regras local-in e serviços implícitos:** Comparar serviço habilitado na interface, trusted hosts e local-in policy. Criar regras com critérios específicos, verificar ordem e comportamento padrão do build e testar a gerência a partir de origem permitida e não permitida.
- **40.4.2. IPv4/IPv6, logs e proteção de IKE/gerência:** Configurar registro e regras correspondentes às famílias utilizadas. Distinguir a filtragem de IKE/ESP e a proteção local por Virtual Patching de policies de usuários, verificando acesso de recuperação antes de aplicar restrições.

#### 40.5. DoS policies

**Aprendizado da seção:** Proteger o equipamento e os recursos encaminhados usando anomalias e limites, distinguindo isso de um sensor IPS.

- **40.5.1. Anomalias, thresholds, monitoramento e bloqueio:** Criar uma DoS policy por interface e destino e configurar limites adequados ao tráfego observado. Explicar a unidade de cada limiar e comparar registro e bloqueio usando apenas tráfego sintético controlado de baixa escala.
- **40.5.2. Ponto de aplicação, listas de exceção e logs:** Relacionar a decisão DoS à firewall policy e aos controles de offload da plataforma. Investigar um falso positivo, ajustar seu escopo e conferir contadores, eventos e limites de recurso sem produzir carga destrutiva.

#### 40.6. NGFW profile-based e policy-based

**Aprendizado da seção:** Comparar dois modelos de expressar autorização e inspeção sem confundi-los com flow e proxy.

- **40.6.1. Modo NGFW e funções das regras de segurança:** Explicar o modelo profile-based conhecido e o modelo policy-based documentado para o VDOM. Planejar alteração de modo e suas implicações, incluindo NAT, sem converter um ambiente em produção apenas para demonstrar a opção.
- **40.6.2. Critérios por aplicação e categoria e validação:** Construir regras no modo policy-based e observar a identificação necessária antes da decisão final. Comparar com o uso de Application Control como perfil e demonstrar sessões e logs que justificam a autorização.

#### 40.7. ACLs

**Aprendizado da seção:** Verificar o filtro em hardware no modelo suportado e seu ponto de aplicação.

- **40.7.1. Access control lists e filtragem em hardware:** Configurar uma ACL no modelo que a suporta e explicar direção, critérios e limites da implementação. Conferir contadores e o caminho do tráfego, distinguindo descarte precoce em hardware de uma negação registrada pela policy comum.

#### 40.8. Interface policies

**Aprendizado da seção:** Aplicar o mecanismo documentado e distingui-lo de uma firewall policy convencional.

- **40.8.1. Interface policies e aplicação de inspeção:** Configurar a interface policy no cenário documentado e comparar seus perfis e ações com uma firewall policy. Identificar suporte, ponto de inspeção e evento produzido sem tratá-la como substituta universal de autorização stateful.

**Prática e evidência:** Aplicar proxy, local-in, DoS e NGFW nos cenários suportados e verificar ACL/interface policy por sua própria evidência. Mostrar o efeito de um ajuste de correspondência e de uma alteração em sessão existente.

**Critério de conclusão:** O aluno seleciona o mecanismo correto, comprova os critérios e explica como o resultado se relaciona à sessão e aos demais controles.

### 41. NAT II: modelos centrais e publicação avançada

**Base já ensinada:** 05, 09, 32, 40
**Retoma:** 05
**Base atual:** C02; ampliar conforme o escopo desta passagem.
**Objetivo:** Retomar NAT para separar tradução e autorização no modelo central, resolver hairpin e endereços sobrepostos e publicar serviços com balanceamento e TLS.
**Por que nesta posição:** SNAT e VIP simples já funcionam, e o aluno conhece sessões, TLS, caminhos e isolamento. Pode agora avaliar traduções e publicações mais complexas sem aprender todos os casos no primeiro contato com NAT.

#### 41.1. Central NAT

**Aprendizado da seção:** Operar tradução e autorização em tabelas separadas e prever a ordem de seleção das regras.

- **41.1.1. Central SNAT e migração da configuração:** Comparar o SNAT dentro da firewall policy com a tabela central. Criar critérios específicos, avaliar a ordem e demonstrar o que muda nas regras existentes ao habilitar Central NAT no contexto usado.
- **41.1.2. Central DNAT e relação com as firewall policies:** Construir a tradução de destino no modelo central e localizar o objeto usado na autorização. Verificar os endereços considerados em cada etapa com a documentação do build e com a sessão, evitando decorar regras de outro modo de operação.

#### 41.2. Hairpin e endereços sobrepostos

**Aprendizado da seção:** Resolver publicações que parecem corretas na entrada, mas falham por causa do retorno ou da visão do endereço.

- **41.2.1. Hairpin NAT e acesso interno ao endereço público:** Publicar o mesmo serviço para clientes externos e internos. Observar as interfaces usadas pelo cliente interno e decidir quando aplicar SNAT para manter o retorno pelo FortiGate; comparar com a alternativa de DNS interno.
- **41.2.2. Tradução entre redes sobrepostas:** Planejar e configurar um mapeamento sem ambiguidade para dois ambientes com endereços iguais. Demonstrar como as duas pontas enxergam a tradução e quais objetos, rotas e policies devem referenciar cada endereço.

#### 41.3. Virtual servers e publicação com balanceamento

**Aprendizado da seção:** Usar o FortiGate como ponto de publicação que escolhe servidores reais e verifica sua disponibilidade.

- **41.3.1. Real servers, health checks e persistência:** Configurar um virtual server e comparar os métodos de distribuição suportados. Interromper um servidor e verificar saúde, seleção e persistência, distinguindo balanceamento de servidores de balanceamento de links WAN.
- **41.3.2. Publicação HTTPS e TLS upstream:** Configurar o papel TLS do servidor virtual e a conexão ao servidor real no modo suportado. Conferir certificados, confiança e proteção dos dois trechos e comprovar o endereço e o servidor que atenderam a requisição.

#### 41.4. VIP por FQDN

**Aprendizado da seção:** Publicar um destino definido por nome e verificar como o objeto é atualizado.

- **41.4.1. Resolução e atualização do destino:** Configurar o VIP baseado em FQDN no cenário suportado e observar o endereço aprendido e sua mudança. Testar acesso, resolução e indisponibilidade do destino, distinguindo a atualização do objeto da autorização da policy.

#### 41.5. PCP e mapeamento de portas

**Aprendizado da seção:** Operar a criação de mapeamentos pelo mecanismo suportado e comprovar o resultado.

- **41.5.1. Solicitação, duração e tradução do mapeamento:** Configurar o cenário PCP suportado pelo FortiGate e verificar qual tradução de origem ou destino foi criada. Conferir escopo, duração e remoção e comprovar que a autorização de acesso e os controles aplicáveis continuam explícitos.

#### 41.6. Full-cone NAT

**Aprendizado da seção:** Distinguir o comportamento do mapeamento de outras formas de tradução.

- **41.6.1. Pool, portas e comportamento das conexões:** Configurar o modo full-cone nos tipos de pool e patches suportados. Observar o mapeamento e os acessos de retorno em ambiente controlado e comparar com o NAT anteriormente usado, verificando alcance e limites da configuração.

#### 41.7. MAP-E

**Aprendizado da seção:** Aplicar o mecanismo de endereçamento e transporte no cenário documentado.

- **41.7.1. Configuração e verificação de MAP-E:** Configurar o lado FortiGate do cenário MAP-E suportado e verificar o endereçamento, as portas e o caminho resultantes. Incluir obtenção por DHCP-PD quando aplicável e distinguir a função do mecanismo das traduções NAT46/NAT64 já estudadas.

**Prática e evidência:** Migrar um caso para Central NAT, demonstrar hairpin e comparar distribuição e falha de servidor real em uma publicação avançada.

**Critério de conclusão:** O aluno acompanha tradução, autorização e retorno em cada modelo e comprova qual servidor atendeu o acesso.

### 42. Inspeção TLS II: exceções, servidores e SSH

**Base já ensinada:** 09, 40, 41
**Retoma:** 09
**Base atual:** C07, C08, C10; ampliar conforme o escopo desta passagem.
**Objetivo:** Retomar certificados e decriptação para publicações, aplicações incompatíveis, protocolos modernos e SSH. Escolher exceções e comprovar o conteúdo que deixa de ser visível.
**Por que nesta posição:** O aluno já usou deep inspection, perfis e publicação HTTPS. Os casos que exigem mais contexto entram como aprofundamento e não como uma lista de detalhes no primeiro certificado.

#### 42.1. Ciclo de vida dos certificados

**Aprendizado da seção:** Aprofundar emissão, renovação e revogação depois de já utilizar certificados na inspeção.

- **42.1.1. CSR, importação, renovação e revogação:** Gerar solicitação e importar certificado com cadeia e chave correspondentes. Demonstrar renovação/ACME quando suportado e verificações de revogação, conferindo também horário e confiança para evitar tratar qualquer erro TLS como bloqueio de policy.

#### 42.2. Exceções e interoperabilidade TLS

**Aprendizado da seção:** Separar confiança, pinning, mTLS, HSTS e ECH e demonstrar o alcance de uma exceção.

- **42.2.1. Exceções, pinning, mTLS, HSTS e ECH:** Demonstrar uma exceção controlada e explicar o efeito sobre os demais perfis. Distinguir HSTS de pinning e mTLS e escolher o tratamento documentado para ECH e falhas de probe, sem prometer inspeção universal de conexões cifradas.

#### 42.3. Proteção de servidores e protocolos modernos

**Aprendizado da seção:** Configurar a inspeção no cenário suportado e verificar HTTP, versões TLS e PQC.

- **42.3.1. SSL server, SSH, HTTP/2, HTTP/3 e PQC:** Configurar inspeção de servidor com os certificados adequados e reconhecer o tratamento de SSH e versões de HTTP no modo suportado. Conferir TLS híbrido PQC e mudanças por patch, incluindo os limites de proxy e de interoperabilidade.

#### 42.4. Inspeção SSH e transferências de arquivos

**Aprendizado da seção:** Configurar a inspeção SSH suportada e comprovar confiança e visibilidade de arquivos sem extrapolar os protocolos compatíveis.

- **42.4.1. Perfil SSH, negociação e confiança do cliente:** Configurar as opções SSH do perfil SSL/SSH e observar a negociação mediada pelo FortiGate. Comparar as identidades apresentadas ao cliente e ao servidor e conferir modos, algoritmos e limites documentados da plataforma.
- **42.4.2. SCP/SFTP, varredura e exceções:** Executar uma transferência pelos protocolos suportados e confirmar a disponibilidade do conteúdo para os perfis associados. Diferenciar protocolo não compatível, exceção de inspeção e transferência inspecionada, usando logs e capturas para comprovar o caso.

**Prática e evidência:** Inspecionar uma publicação e uma transferência SSH suportada, demonstrar uma exceção e validar renovação ou substituição do certificado.

**Critério de conclusão:** O aluno identifica o que foi ou não inspecionado e explica o motivo e o impacto da exceção.

### 43. IPsec: criptografia e integrações de chaves

**Base já ensinada:** 09, 25, 42
**Retoma:** 25
**Base atual:** C11, C12; ampliar conforme o escopo desta passagem.
**Objetivo:** Avaliar autenticação e serviços de chaves IPsec a partir de uma VPN funcional. Distinguir os mecanismos e os componentes realmente suportados.
**Por que nesta posição:** VPN e ciclo de certificados já são conhecidos. O objetivo é criptográfico e de integração, sem depender de aprender ADVPN ou cloud.

#### 43.1. Autenticação e estabelecimento de chaves

**Aprendizado da seção:** Distinguir identidade do peer, negociação e serviços externos de chaves.

- **43.1.1. Certificados e PQC:** Configurar autenticação por certificado e comparar os mecanismos PQC suportados de assinatura e estabelecimento de chaves. Conferir algoritmos, peers e patch e observar a negociação, sem confundir assinatura com troca adicional de chaves.
- **43.1.2. QKD, KMS e serviços de chaves:** Configurar o lado FortiGate de uma integração de chaves suportada e verificar comunicação e dependências. Identificar o papel do serviço externo e o comportamento se ele não atende, usando o cenário documentado para o modelo e build.

**Prática e evidência:** Comparar a negociação por certificado e o mecanismo adicional suportado, registrando peer, algoritmo e dependência externa.

**Critério de conclusão:** O aluno identifica o papel de cada chave/serviço e comprova o resultado da negociação.

### 44. Web Filter II: exceções e controles de navegação

**Base já ensinada:** 10, 17, 42
**Retoma:** 10
**Base atual:** C09; ampliar conforme o escopo desta passagem.
**Objetivo:** Aprofundar o Web Filter com overrides, categorias próprias, quotas e proteção de credenciais. Identificar o critério e o alcance de cada exceção.
**Por que nesta posição:** A navegação básica e a identidade já foram usadas. O aprofundamento continua no mesmo perfil; vídeo e DNS cifrado possuem objetivos próprios.

#### 44.1. Controles adicionais do Web Filter

**Aprendizado da seção:** Usar classificação própria, identidade e quotas sem confundir exceção de categoria e de inspeção.

- **44.1.1. Rating overrides, categorias externas e profile override:** Reclassificar um destino e comparar categoria original, local e externa. Demonstrar qual classificação prevalece e por quanto tempo a mudança é válida, distinguindo rating override de uma exceção à própria inspeção. Overrides dependentes de autenticação serão implementados em 20.
- **44.1.2. Quotas, SafeSearch, phishing e credenciais:** Configurar SafeSearch, quotas e proteção contra exposição de credenciais conforme o modo. Usar a autenticação já conhecida nas opções que a exigem e testar correspondência, mensagem e evento, distinguindo o controle de navegação da autenticação do usuário.

**Prática e evidência:** Comparar categoria original e override, testar uma quota e comprovar uma exceção autenticada suportada.

**Critério de conclusão:** O aluno identifica o controle e comprova o efeito da exceção.

### 45. Video Filter

**Base já ensinada:** 10, 42
**Retoma:** Primeira passagem.
**Base atual:** C09; ampliar conforme o escopo desta passagem.
**Objetivo:** Controlar conteúdo de vídeo por categoria, canal e informações reconhecidas. Distinguir o filtro do vídeo do bloqueio da plataforma inteira.
**Por que nesta posição:** O aluno já conhece Web Filter e inspeção TLS. O Video Filter é apresentado por sua finalidade própria, sem precisar compor um bloco genérico com DNS.

#### 45.1. Video Filter

**Aprendizado da seção:** Distinguir bloqueio da plataforma de vídeo de controle seletivo de seus conteúdos.

- **45.1.1. Categorias, canais, título e descrição de vídeos:** Criar um perfil de vídeo e comparar filtro por categoria, canal e palavras no título/descrição. Demonstrar conteúdo permitido e negado no mesmo serviço e verificar dependências de identificação, TLS e alterações na aplicação.
- **45.1.2. HTTP/3, WebSocket, conteúdo por imagem e diagnóstico:** Conferir suporte de inspeção para QUIC/HTTP3, WebSocket e recursos de imagem do patch escolhido. Investigar um site que não gera o resultado esperado verificando protocolo, policy, decriptação e rating, sem presumir evasão por parte do usuário.

**Prática e evidência:** Comparar dois vídeos ou canais da mesma plataforma e comprovar as decisões e o conteúdo identificado.

**Critério de conclusão:** O aluno distingue acesso à plataforma e controle do conteúdo do vídeo.

### 46. DNS Filter II: transportes cifrados e controles adicionais

**Base já ensinada:** 11, 14, 42
**Retoma:** 11
**Base atual:** C09; ampliar conforme o escopo desta passagem.
**Objetivo:** Retomar DNS Filter para operar transportes cifrados e respostas especiais e distinguir a detecção complementar ligada ao IPS.
**Por que nesta posição:** DNS e TLS possuem configuração conhecida. Este módulo amplia esse caminho sem exigir o aprendizado de Video Filter ou dos overrides web.

#### 46.1. DNS cifrado e tratamento das respostas

**Aprendizado da seção:** Configurar visibilidade e ações DNS com o contexto TLS já conhecido.

- **46.1.1. DoT, DoH, DoQ e dependências de inspeção:** Comparar transportes DNS e conferir os modos de inspeção suportados no build. Identificar se o FortiGate atende a consulta ou a inspeciona em trânsito e relacionar decriptação e reconhecimento do protocolo à aplicação efetiva do filtro.
- **46.1.2. SafeSearch, DNS translation e detecção de ameaças:** Demonstrar as opções de resposta e tradução previstas no perfil. Relacionar a detecção DNS baseada em ML ao mecanismo IPS documentado, distinguindo-a de filtragem por categoria; diagnosticar cache, rating e logs antes de mudar a regra.

**Prática e evidência:** Testar o transporte cifrado suportado, uma ação de resposta e a visibilidade que condiciona a detecção.

**Critério de conclusão:** O aluno identifica o conteúdo DNS visível e qual mecanismo determinou a ação.

### 47. Inspeção de arquivos II: sandbox, CDR e File Filter

**Base já ensinada:** 13, 42
**Retoma:** 13
**Base atual:** C08; ampliar conforme o escopo desta passagem.
**Objetivo:** Comparar análise externa, reconstrução e restrição por características do arquivo no mesmo caminho de transferência. Identificar o mecanismo e o resultado de cada decisão.
**Por que nesta posição:** O aluno já analisou arquivos por AV e verificou o conteúdo TLS. Os mecanismos são comparados pelo mesmo objeto de inspeção e pela diferença entre seus resultados.

#### 47.1. FortiSandbox

**Aprendizado da seção:** Comparar veredito inline e posterior e verificar disponibilidade da integração.

- **47.1.1. FortiSandbox e análise inline ou posterior:** Configurar a integração disponível e comparar o momento da liberação com o momento do veredito. Conferir suporte de flow/proxy, licença e comportamento se o serviço estiver indisponível, sem assumir equivalência entre modalidades de sandbox.

#### 47.2. CDR

**Aprendizado da seção:** Reconstruir conteúdo de formatos suportados e verificar o resultado entregue.

- **47.2.1. Reconstrução de conteúdo:** Aplicar Content Disarm and Reconstruction ao formato suportado e comparar o documento antes e depois. Identificar quais partes foram alteradas ou removidas e distinguir reconstrução de conteúdo de uma detecção por assinatura.

#### 47.3. File Filter

**Aprendizado da seção:** Bloquear ou registrar arquivos por suas características, sem depender de um veredito de malware.

- **47.3.1. Tipo real, direção, protocolo e tamanho:** Criar regras de File Filter para upload/download e comparar extensão com o tipo reconhecido pelo FortiGate. Demonstrar ação, direção e protocolo efetivos e explicar por que o perfil pode bloquear um arquivo legítimo.
- **47.3.2. Interação com AV e mensagens ao usuário:** Aplicar File Filter e AV na mesma policy e correlacionar o resultado. Demonstrar as ações suportadas, incluindo warning de download HTTP no cenário documentado, e identificar qual perfil gerou o evento e a mensagem de substituição.

**Prática e evidência:** Comparar veredito sandbox, documento reconstruído e bloqueio File Filter com evidências separadas.

**Critério de conclusão:** O aluno distingue análise, reconstrução e bloqueio por tipo/tamanho.

### 48. Threat feeds: consumir indicadores externos

**Base já ensinada:** 03, 10, 11, 13, 47
**Retoma:** Primeira passagem.
**Base atual:** C16; ampliar conforme o escopo desta passagem.
**Objetivo:** Configurar fontes de IP, domínio, URL e hash e aplicar seus indicadores aos controles já aprendidos. Distinguir indicador externo de análise local do conteúdo.
**Por que nesta posição:** Os controles que consomem cada tipo de indicador já foram configurados. A administração de feeds não precisa ficar dentro de um módulo genérico de Fabric nem escondida sob Antivirus.

#### 48.1. Configuração, atualização e uso dos feeds

**Aprendizado da seção:** Consumir o indicador no controle correto e verificar origem, formato e validade.

- **48.1.1. Feeds de IP, domínio, URL e hash:** Configurar as fontes com o formato exigido e conferir atualização, validade e consumo no mecanismo adequado. Demonstrar um indicador fictício e observar a decisão, explicando o comportamento se a fonte fica indisponível.
- **48.1.2. Atualização e correspondência de hashes:** Consumir uma lista externa de hashes em formato suportado e verificar atualização, correspondência e evento. Comparar bloqueio por indicador com novo veredito AV e registrar o comportamento se a fonte fica indisponível.

**Prática e evidência:** Atualizar um feed de teste e demonstrar correspondência e indisponibilidade da fonte no mecanismo escolhido.

**Critério de conclusão:** O aluno comprova a versão/validade do dado e o controle que o consumiu.

### 49. Application Control II: assinaturas próprias e IA

**Base já ensinada:** 12, 42
**Retoma:** 12
**Base atual:** C10; ampliar conforme o escopo desta passagem.
**Objetivo:** Criar uma assinatura de aplicação e avaliar a identificação suportada de GenAI e protocolos de agentes. Comprovar abrangência e distinguir reconhecimento de garantia de segurança.
**Por que nesta posição:** O sensor básico e a classificação já foram ensinados. A customização utiliza esse contexto e prepara o exemplo DLP seguinte; assinatura IPS pertence ao próprio IPS.

#### 49.1. Customização e identificação de aplicações

**Aprendizado da seção:** Construir um padrão próprio e avaliar a identificação de aplicações e protocolos de IA.

- **49.1.1. Assinaturas customizadas e grupos de aplicações:** Criar e validar uma assinatura simples para tráfego de teste conhecido, usando o formato suportado. Agrupar aplicações para uso posterior em policies ou shaping e demonstrar que uma assinatura exige manutenção e testes de abrangência.
- **49.1.2. GenAI, MCP/A2A e integração com DLP:** Identificar aplicações de IA e protocolos de agentes por assinaturas e campos documentados. Montar o desenho de controle com Web Filter e DLP, distinguindo reconhecimento do protocolo de inspeção semântica de cada operação ou garantia contra vazamento.

**Prática e evidência:** Comparar positivo e negativo de uma assinatura e observar a aplicação de IA suportada nos registros.

**Critério de conclusão:** O aluno explica a informação reconhecida e o limite do padrão.

### 50. DLP: identificar e controlar dados sensíveis

**Base já ensinada:** 42, 47, 49
**Retoma:** Primeira passagem.
**Base atual:** C02, C10; ampliar conforme o escopo desta passagem.
**Objetivo:** Construir políticas de prevenção de perda de dados a partir do conteúdo que se pretende identificar. Escolher padrões, bases e classificações, aplicar o perfil ao tráfego e avaliar detecções, lacunas e falsos positivos.
**Por que nesta posição:** O aluno já conhece reconhecimento de aplicações, arquivos e limites de inspeção. Pode escolher uma técnica de DLP e avaliar sua precisão sem depender de mecanismos ainda não explicados.

#### 50.1. Componentes e limites de inspeção

**Aprendizado da seção:** Transformar um requisito de proteção de dados em componentes configuráveis do FortiGate.

- **50.1.1. Padrões, dicionários, sensores, regras e perfis:** Construir uma detecção simples com dados fictícios e mostrar a função de cada componente no modelo do build utilizado. Explicar avaliação lógica, contexto, direção e ações antes de associar o perfil à policy.
- **50.1.2. Flow, proxy, protocolos e conteúdo não inspecionável:** Consultar a matriz de suporte de DLP e executar um caso em cada modo previsto. Explicar limitações de flow, vinculação por CLI quando exigida, arquivos cifrados e dependência de decriptação HTTPS, sem afirmar equivalência entre os modos.

#### 50.2. Padrões e dicionários de dados

**Aprendizado da seção:** Escolher um padrão de correspondência com precisão suficiente para o conteúdo a proteger.

- **50.2.1. Regex, tipos de dado, proximidade e lógica:** Configurar detecção por padrão e expressão lógica, adicionando contexto e proximidade quando suportados. Comparar exemplo positivo, negativo e texto semelhante para mostrar como uma expressão ampla pode gerar falso positivo.
- **50.2.2. Dicionários FortiGuard e níveis de confiança:** Selecionar dicionários gerenciados e ajustar confiança e ação no perfil. Verificar licença, atualização e tipos de dados reconhecidos, diferenciando a base de padrões de uma lista de registros exclusivos da organização.

#### 50.3. Exact Data Matching

**Aprendizado da seção:** Construir a correspondência com registros de referência e distinguir o formato da importação.

- **50.3.1. Exact Data Matching e base em hash:** Preparar uma base fictícia e definir quais campos devem coincidir para uma detecção EDM. Comparar conteúdo que pertence e não pertence à base e incluir o fluxo de importação em hash e a ferramenta oficial somente a partir do patch documentado.

#### 50.4. Fingerprinting e IDM

**Aprendizado da seção:** Reconhecer conteúdo de um documento de referência em vez de apenas um padrão de formato.

- **50.4.1. Reconhecimento de documentos conhecidos:** Cadastrar a referência e configurar fingerprinting/IDM no cenário suportado. Comparar documento conhecido, variação e documento não relacionado e verificar a detecção e os limites da técnica.

#### 50.5. Rótulos de sensibilidade

**Aprendizado da seção:** Consumir classificação existente e comprovar a decisão baseada no rótulo.

- **50.5.1. Microsoft Purview e FortiData:** Definir um rótulo local suportado e configurar a ação DLP baseada na classificação. Comparar a leitura do rótulo com o reconhecimento por fingerprint e explicar por que a classificação não decripta automaticamente o documento. A sincronização externa será aplicada quando seus conectores forem ensinados.

#### 50.6. OCR

**Aprendizado da seção:** Comparar a mesma informação em texto e imagem e validar os limites do reconhecimento.

- **50.6.1. OCR em imagens e documentos digitalizados:** Usar a evolução identificada em 8.0.1 para comparar a mesma informação em texto e imagem. Ajustar confiança e limites documentados e testar tamanho e legibilidade, mostrando quando o reconhecimento não fornece texto suficiente para a regra.

#### 50.7. Conteúdo enviado a SaaS e GenAI

**Aprendizado da seção:** Aplicar DLP a aplicações já reconhecidas e observar o conteúdo efetivamente inspecionado.

- **50.7.1. Upload, SaaS e GenAI com DLP:** Combinar o perfil com o acesso a um serviço autorizado e gerar eventos de upload com dados fictícios. Distinguir identificação da aplicação, controle da operação SaaS e detecção de conteúdo sensível, explicando quais formatos e caminhos foram efetivamente inspecionados.

#### 50.8. Implantação e revisão de precisão

**Aprendizado da seção:** Verificar o perfil antes de bloquear uso legítimo e manter as bases atualizadas.

- **50.8.1. Monitorar, ajustar, bloquear e investigar:** Executar uma bateria de dados positivos e negativos, comparar logs e ajustar o critério antes de habilitar bloqueio. Registrar o componente responsável pela detecção e evidências suficientes sem expor nos próprios logs dados sensíveis desnecessários.
- **50.8.2. Exceções, atualização de datasets e falhas de inspeção:** Atualizar uma base e repetir os casos de teste. Demonstrar exceção controlada, indisponibilidade de dependência e conteúdo não analisável, explicando o risco residual e o comportamento escolhido em cada condição.

**Prática e evidência:** Construir um perfil DLP com padrões, EDM e um caso OCR compatível; documentar dados fictícios, positivos, negativos, falso positivo, ação e evento.

**Critério de conclusão:** O aluno justifica a técnica de detecção, comprova sua precisão no teste e informa modo, patch, licença e limites que condicionam o resultado.

### 51. Inline CASB: controlar operações SaaS

**Base já ensinada:** 44, 49, 50
**Retoma:** Primeira passagem.
**Base atual:** Produzir conteúdo específico para esta funcionalidade.
**Objetivo:** Controlar o uso de aplicações SaaS com o Inline CASB do FortiGate, separando acesso à aplicação de ações dentro dela. Reconhecer operação, identidade de tenant e dependências da inspeção.
**Por que nesta posição:** A identificação da aplicação e a análise de dados já foram aprendidas. O controle da operação SaaS pode ser comparado com os dois mecanismos sem misturar seus resultados.

#### 51.1. Controle das operações SaaS

**Aprendizado da seção:** Configurar os critérios CASB e verificar seu efeito, distinguindo App Control e DLP.

- **51.1.1. Aplicações SaaS, atividades e fatores de controle:** Criar um perfil escolhendo aplicação e operações suportadas, como atividades de upload/download quando disponíveis. Demonstrar na mesma aplicação uma operação permitida e outra negada e verificar o evento que identifica a ação.
- **51.1.2. Tenant, organizações e aplicações customizadas:** Diferenciar conta pessoal, tenant corporativo e identidade da sessão nas capacidades documentadas. Configurar os fatores de controle disponíveis, incluindo conteúdo JSON em aplicações customizadas quando suportado, e validar que a correspondência não depende apenas da URL.
- **51.1.3. CASB, Application Control e DLP na mesma policy:** Combinar acesso à aplicação, controle da atividade e análise do conteúdo. Mostrar qual perfil decide cada parte e comparar bloqueio da aplicação inteira com bloqueio de uma ação e com bloqueio de dado sensível.
- **51.1.4. Base de SaaS, mudanças de aplicação e diagnóstico:** Conferir atualização da base, licença e suporte ao serviço. Investigar ausência de correspondência por policy, decriptação e reconhecimento da atividade, evitando prometer que todo aplicativo ou toda operação é controlável pelo perfil inline.

**Prática e evidência:** Permitir acesso a um SaaS e restringir uma operação suportada, comparando a decisão CASB com um evento DLP no mesmo caminho.

**Critério de conclusão:** O aluno identifica a operação e o tenant considerados e explica a diferença entre CASB inline do FortiGate e serviços CASB externos por API.

### 52. Email Filter

**Base já ensinada:** 42, 47, 50
**Retoma:** Primeira passagem.
**Base atual:** Produzir conteúdo específico para esta funcionalidade.
**Objetivo:** Configurar a filtragem de e-mail em trânsito nos protocolos suportados pelo FortiGate. Explicar classificação, ações e relação com AV/DLP sem confundir o firewall com uma plataforma completa de segurança de e-mail.
**Por que nesta posição:** O aluno já conhece inspeção de protocolo, arquivos e dados. Pode agora verificar o que o Email Filter controla no fluxo de e-mail que realmente atravessa o FortiGate.

#### 52.1. Filtragem de e-mail em trânsito

**Aprendizado da seção:** Aplicar o perfil ao protocolo e verificar classificação, conteúdo e ação.

- **52.1.1. Protocolos de e-mail, listas locais e FortiGuard:** Aplicar o perfil aos protocolos e modos suportados e configurar filtros por origem e reputação. Testar mensagens benignas de teste, observando a classificação e a ação na sessão correta.
- **52.1.2. Marcação, bloqueio e comportamento por protocolo:** Comparar as ações disponíveis em SMTP e nos protocolos de leitura suportados. Explicar o que o remetente e o destinatário observam e como as mensagens e logs distinguem rejeição, marcação e simples monitoramento.
- **52.1.3. STARTTLS, TLS e inspeção do conteúdo:** Confirmar a negociação do protocolo e a capacidade de decriptação do cenário. Repetir o teste com o perfil SSL apropriado e mostrar por que permitir a porta de e-mail não garante inspeção de corpo e anexos.
- **52.1.4. Email Filter, Antivirus e DLP:** Aplicar controles em conjunto e comparar evento de reputação, malware e conteúdo sensível. Explicar os limites do FortiGate frente a serviços de e-mail em nuvem que usam webmail ou não atravessam esse caminho.

**Prática e evidência:** Aplicar Email Filter a um fluxo suportado e correlacionar classificação, ação e resultado observado no cliente de e-mail.

**Critério de conclusão:** O aluno comprova o protocolo e o conteúdo inspecionados e identifica qual perfil originou a decisão.

### 53. VoIP e inspeção SIP

**Base já ensinada:** 23, 41, 42
**Retoma:** Primeira passagem.
**Base atual:** Produzir conteúdo específico para esta funcionalidade.
**Objetivo:** Entender como o FortiGate trata sinalização e mídia VoIP e quando um perfil VoIP ou helper participa da comunicação. Ajustar NAT e inspeção com base em evidências de chamada e sessão.
**Por que nesta posição:** Estado, NAT e inspeção já têm exemplos práticos. A separação entre sinalização e mídia pode ser explicada e diagnosticada sem recorrer a alteração global por tentativa.

#### 53.1. Sinalização, mídia e tratamento da chamada

**Aprendizado da seção:** Seguir a chamada e verificar o efeito de ALG, NAT, TLS e compatibilidade no mesmo caso.

- **53.1.1. SIP ALG, session helper e VoIP profile:** Identificar o mecanismo em uso e distinguir tratamento de sinalização, pinholes e mídia. Configurar um perfil no cenário suportado e localizar as sessões relacionadas a uma chamada de teste.
- **53.1.2. NAT e mídia em uma ou nas duas direções:** Observar os endereços anunciados e o caminho de RTP no FortiGate. Comparar chamada estabelecida sem áudio, áudio unilateral e falha de sinalização antes de alterar ALG, timers ou policies.
- **53.1.3. SIP sobre TLS e opções de segurança:** Configurar o modo e os certificados documentados para inspeção SIP TLS e verificar o suporte de proxy. Aplicar os controles previstos no perfil e explicar que cifrar a sinalização não equivale a cifrar toda a mídia.
- **53.1.4. Logs, sessões e ajustes de compatibilidade:** Coletar sinalização e sessões de uma chamada limitada, identificar a alteração necessária e comparar antes/depois. Incluir MSRP e outros recursos apenas quando suportados, registrando o efeito sobre segurança e interoperabilidade.

**Prática e evidência:** Acompanhar uma chamada de teste pela sinalização e mídia, introduzir uma falha de retorno e demonstrar sua causa no FortiGate.

**Critério de conclusão:** O aluno diferencia falha SIP, NAT e mídia e explica qual mecanismo do FortiGate participou do tratamento.

### 54. Web Application Firewall

**Base já ensinada:** 41, 42
**Retoma:** Primeira passagem.
**Base atual:** Produzir conteúdo específico para esta funcionalidade.
**Objetivo:** Aplicar o perfil WAF do FortiGate à proteção de uma aplicação web publicada. Escolher restrições e assinaturas, validar eventos e explicar o alcance dessa proteção em comparação com um produto WAF dedicado.
**Por que nesta posição:** A publicação e o conteúdo TLS já foram configurados. O WAF passa a proteger uma aplicação cujo caminho e ponto de inspeção o aluno entende.

#### 54.1. Proteção de uma aplicação publicada

**Aprendizado da seção:** Aplicar o WAF, observar a requisição e ajustar uma exceção comprovada.

- **54.1.1. Policy, VIP e posição da inspeção WAF:** Associar o perfil ao fluxo de publicação e confirmar a forma de tratamento de HTTPS. Demonstrar que a existência de um VIP ou certificado não aplica WAF automaticamente e localizar a policy efetivamente usada.
- **54.1.2. Assinaturas e restrições HTTP:** Configurar as verificações suportadas para requisições e parâmetros e escolher monitoramento ou bloqueio. Testar entradas benignas de validação em aplicação própria, sem confundir um evento de assinatura com prova de exploração bem-sucedida.
- **54.1.3. Falsos positivos e exceções específicas:** Reproduzir uma requisição legítima bloqueada e localizar o critério responsável. Ajustar o perfil no menor escopo possível e repetir as requisições esperadas, preservando a justificativa da exceção.
- **54.1.4. Logs e comparação com FortiWeb:** Correlacionar evento WAF, policy e acesso no servidor. Explicar os limites do perfil e identificar requisitos que exigem arquitetura ou produto adicional, sem atribuir ao FortiGate funções do FortiWeb.

**Prática e evidência:** Proteger uma publicação de teste com WAF e apresentar requisição permitida, bloqueio de validação e uma exceção específica.

**Critério de conclusão:** O aluno comprova a policy e o conteúdo HTTP analisado e descreve os limites da proteção configurada.

### 55. ICAP e inspeção por serviço externo

**Base já ensinada:** 42, 47, 50
**Retoma:** Primeira passagem.
**Base atual:** Produzir conteúdo específico para esta funcionalidade.
**Objetivo:** Encaminhar conteúdo do FortiGate a um serviço ICAP e interpretar a resposta que modifica ou bloqueia a comunicação. Configurar o ponto de envio e o comportamento em indisponibilidade.
**Por que nesta posição:** Os perfis locais já foram aplicados. Agora o aluno compara a decisão local com uma decisão que depende de envio de conteúdo e resposta de um serviço externo.

#### 55.1. Encaminhamento e decisão ICAP

**Aprendizado da seção:** Configurar o serviço e comprovar resposta, timeout e indisponibilidade.

- **55.1.1. Servidor, REQMOD, RESPMOD e seleção do tráfego:** Configurar o servidor e o serviço ICAP, associar o perfil e comparar análise de requisição e resposta. Verificar protocolos suportados e demonstrar o conteúdo que o serviço realmente recebe.
- **55.1.2. Ação de resposta e transparência do protocolo:** Testar respostas permitidas, modificadas e bloqueadas com serviço controlado. Relacionar headers e identificação do cliente às opções documentadas e conferir o efeito observado na aplicação e nos registros.
- **55.1.3. TLS para ICAP, timeout e falha do servidor:** Configurar transporte seguro quando suportado e demonstrar o tratamento de indisponibilidade e demora. Comparar segurança e continuidade das ações escolhidas sem usar fail-open como valor obrigatório.
- **55.1.4. Envio seletivo, arquivos e diagnóstico:** Aplicar critérios de encaminhamento seletivo e recursos OCR externos no cenário documentado. Conferir tamanho, protocolo e logs para diferenciar conteúdo não enviado, falha de transporte e resposta negativa do serviço externo.

**Prática e evidência:** Encaminhar uma transferência a ICAP, observar a decisão e demonstrar o comportamento quando o serviço está indisponível.

**Critério de conclusão:** O aluno explica qual conteúdo saiu do FortiGate, qual resposta foi aplicada e o efeito de falha dessa dependência.

### 56. Security Fabric: topologia, avaliação e resposta

**Base já ensinada:** 01, 06, 15
**Retoma:** Primeira passagem.
**Base atual:** C16; ampliar conforme o escopo desta passagem.
**Objetivo:** Operar a topologia do Security Fabric, identificar participantes e interpretar a avaliação e a ação disponível. Distinguir inventário, recomendação e alteração efetiva do acesso.
**Por que nesta posição:** As funções do FortiGate já têm exemplos de operação. O Fabric é ensinado por seu papel de visão e coordenação, sem servir de pré-requisito artificial para EMS, SCIM ou ZTNA.

#### 56.1. Participantes e operação do Fabric

**Aprendizado da seção:** Autorizar componentes e usar a topologia e a avaliação para entender e verificar uma ação.

- **56.1.1. Root, downstream, autorização e topologias:** Configurar os papéis suportados e autorizar os participantes. Consultar topologia física/lógica e explicar quais relações representam conectividade, gerenciamento ou compartilhamento de contexto.
- **56.1.2. Security Rating, inventário e quarentena:** Executar a avaliação disponível, interpretar achados e verificar o dispositivo identificado. Comparar recomendação, risco e ação de quarentena, conferindo licença e efeito real sobre o acesso antes de aplicar remediação.

**Prática e evidência:** Autorizar um participante e comprovar um dado de inventário, um achado e o efeito de uma ação suportada.

**Critério de conclusão:** O aluno identifica o participante, a informação recebida e o efeito local da ação.

### 57. SDN connectors e objetos dinâmicos

**Base já ensinada:** 03, 40
**Retoma:** 03
**Base atual:** C16; ampliar conforme o escopo desta passagem.
**Objetivo:** Consumir tags e recursos externos e representá-los nos objetos dinâmicos do FortiGate. Verificar atualização e correspondência sem confundir descoberta com autorização.
**Por que nesta posição:** As regras e os objetos já são conhecidos. O conector acrescenta uma origem dinâmica para o critério; não exige que a infraestrutura LAN gerenciada seja estudada primeiro.

#### 57.1. Descoberta e uso do contexto externo

**Aprendizado da seção:** Configurar a descoberta e comprovar como o resultado atualiza o objeto usado em uma policy.

- **57.1.1. SDN connectors, nuvem, virtualização e tags:** Configurar um conector com permissões adequadas e consultar os objetos descobertos. Transformar tags em endereço dinâmico e observar atualização e expiração, distinguindo falha de sincronização de falha da firewall policy.
- **57.1.2. Tags locais, FortiNAC, ClearPass e outras fontes:** Usar os subtipos dinâmicos suportados para associar contexto à autorização. Incluir tags de endereços/policies do 8.0 e verificar correspondência; não atribuir ao FortiGate decisões ou inventários que pertencem ao sistema de origem.

**Prática e evidência:** Descobrir um recurso e observar uma alteração de tag e seu efeito no conjunto usado pela policy.

**Critério de conclusão:** O aluno comprova origem, atualização e correspondência do objeto.

### 58. DLP II: classificação recebida por integração

**Base já ensinada:** 50, 57
**Retoma:** 50
**Base atual:** C16; ampliar conforme o escopo desta passagem.
**Objetivo:** Retomar os rótulos DLP para integrar classificação externa e comprovar sua origem e atualização. Distinguir a decisão do FortiGate da análise ou classificação do serviço de origem.
**Por que nesta posição:** DLP local e os conectores acabaram de receber implementação própria. O caso externo entra agora pelo contexto que realmente usa.

#### 58.1. Classificação externa e decisão DLP

**Aprendizado da seção:** Receber o rótulo ou resultado e identificar a decisão que pertence ao FortiGate.

- **58.1.1. Purview e FortiData:** Usar o conector ou serviço suportado para sincronizar rótulos Microsoft Purview ou obter classificação FortiData. Aplicar o resultado ao DLP já conhecido e comprovar origem, atualização e decisão, distinguindo as responsabilidades do FortiGate e do serviço externo.

**Prática e evidência:** Sincronizar ou consultar uma classificação suportada e observar seu uso e sua atualização no DLP.

**Critério de conclusão:** O aluno identifica o dado recebido e a regra que o consumiu.

### 59. FortiTelemetry: agente, perfil e policy

**Base já ensinada:** 03, 56
**Retoma:** Primeira passagem.
**Base atual:** C16; ampliar conforme o escopo desta passagem.
**Objetivo:** Configurar o conjunto FortiTelemetry a partir de um agente conhecido. Distinguir dados de telemetria de logs e verificar perfil, seleção e campos implementados no patch.
**Por que nesta posição:** Conectores, objetos dinâmicos e policies já foram explicados. Agente, perfil e policy podem agora ser implementados em sequência no mesmo caso.

#### 59.1. Agente, perfil e policy de telemetria

**Aprendizado da seção:** Registrar o agente e aplicar o controle como partes do mesmo fluxo FortiTelemetry.

- **59.1.1. Telemetry controller, agentes e objetos de endereço:** Registrar o agente no cenário suportado e consultar seu endereço e grupos. Explicar o subtipo de endereço e agrupamento de telemetria do 8.0, identificando quais campos são aprendidos e quais são definidos pelo administrador.
- **59.1.2. Telemetry Profile e telemetry policies:** Criar o perfil e a policy e acompanhar os dados produzidos por um agente de teste. Conferir versão, licença e campos efetivamente implementados, incluindo a limitação documentada de SLA no 8.0.0, sem tratar uma opção visível como função já operacional.

**Prática e evidência:** Registrar um agente compatível, aplicar perfil e policy e observar os dados e limites da implementação.

**Critério de conclusão:** O aluno mostra como o agente corresponde à policy e quais dados foram efetivamente produzidos.

### 60. FortiSwitch pelo controlador do FortiGate

**Base já ensinada:** 02, 03, 15, 18, 29
**Retoma:** Primeira passagem.
**Base atual:** Produzir conteúdo específico para esta funcionalidade.
**Objetivo:** Operar o Switch Controller do FortiGate para autorizar switches, distribuir VLANs e controlar acesso às portas. Validar topologia, estado e políticas de admissão pelo próprio FortiGate.
**Por que nesta posição:** O aluno já conhece interfaces, agrupamento, identidade e admissão. Pode distinguir controle FortiLink, configuração da porta e autorização do tráfego sem aprender todos esses mecanismos ao mesmo tempo.

#### 60.1. FortiLink

**Aprendizado da seção:** Estabelecer o gerenciamento do switch e diferenciá-lo do caminho de encaminhamento dos clientes.

- **60.1.1. Autorização, FortiLink e topologias suportadas:** Configurar a interface FortiLink e autorizar um FortiSwitch compatível. Verificar enlace, descoberta e comunicação de controle e comparar gerenciamento do switch com encaminhamento do tráfego dos clientes.

#### 60.2. Topologia e redundância dos switches

**Aprendizado da seção:** Comparar os enlaces suportados e demonstrar uma falha de ligação com estado e caminho identificados.

- **60.2.1. Trunks, agregação e redundância:** Aplicar os modelos de ligação e redundância suportados, incluindo MCLAG quando apropriado. Observar estado das ligações e uma falha controlada, conferindo dependências de firmware e integração com HA do FortiGate.

#### 60.3. Portas e VLANs

**Aprendizado da seção:** Distribuir configuração pelo FortiGate e verificar VLAN, modo de porta, PoE e identificação do endpoint na porta efetiva.

- **60.3.1. VLANs, perfis de porta, PoE e voz:** Criar redes pelo FortiGate e definir modo de porta, VLAN nativa/permitida, descrição e PoE. Verificar endpoint e consumo e configurar voz quando suportado, diferenciando a distribuição da VLAN da autorização do tráfego entre redes.

#### 60.4. Proteções da LAN

**Aprendizado da seção:** Aplicar o controle de enlace suportado e reconhecer seu evento sem confundi-lo com uma negação por firewall policy.

- **60.4.1. STP, loop guard, DHCP snooping e segurança de porta:** Aplicar as proteções suportadas pelo controlador e consultar eventos e estado da porta. Testar uma condição benigna de validação e explicar por que esses controles não substituem policies de segmentação no FortiGate.

#### 60.5. Admissão e quarentena

**Aprendizado da seção:** Comprovar o resultado da autenticação ou postura e a configuração de porta/VLAN atribuída ao cliente.

- **60.5.1. 802.1X, MAB, VLAN dinâmica e NAC policies:** Integrar o método de autenticação aprendido e criar decisão por dispositivo ou identidade. Demonstrar VLAN ou perfil de porta atribuído e comparar falha de autenticação com quarentena por postura.

#### 60.6. Operação do Switch Controller

**Aprendizado da seção:** Localizar cliente, configuração e evento no controlador e identificar em qual componente o acesso falhou.

- **60.6.1. Monitores, atualização e investigação de acesso:** Consultar clientes, MACs, eventos e topologia e verificar propagação de configuração e firmware. Diagnosticar um cliente sem acesso do enlace até a policy do FortiGate, identificando em qual componente ocorre a falha.

**Prática e evidência:** Autorizar um switch, provisionar VLANs e portas e demonstrar admissão e quarentena com verificação no FortiGate e na porta gerenciada.

**Critério de conclusão:** O aluno distingue estado FortiLink, configuração da porta, autenticação e firewall policy ao explicar o acesso de um cliente.

### 61. FortiAP e FortiWiFi pelo controlador do FortiGate

**Base já ensinada:** 02, 03, 15, 29
**Retoma:** Primeira passagem.
**Base atual:** Produzir conteúdo específico para esta funcionalidade.
**Objetivo:** Configurar e operar a função wireless do FortiGate, diferenciando gerenciamento do AP, autenticação do cliente e encaminhamento do SSID. Aplicar segmentação e verificar rádio, cliente e policy.
**Por que nesta posição:** O controle de acesso cabeado já forneceu contexto para VLAN, autenticação e policy. O módulo acrescenta rádio e os modos de transporte do SSID sem confundir associação com acesso autorizado.

#### 61.1. Gerenciamento do FortiAP

**Aprendizado da seção:** Autorizar o AP e conferir o perfil e a comunicação de controle antes de investigar o acesso do cliente.

- **61.1.1. Descoberta, CAPWAP, autorização e perfis:** Autorizar o FortiAP e associar um perfil compatível. Verificar a conexão de controle e explicar diferenças entre rádio integrado FortiWiFi e AP gerenciado, sem supor as mesmas capacidades em todos os modelos.

#### 61.2. Configuração dos rádios

**Aprendizado da seção:** Aplicar parâmetros disponíveis no modelo e observar banda, canal, potência e condição dos clientes.

- **61.2.1. Bandas, canais, potência e recursos suportados:** Configurar os parâmetros disponíveis no controlador, country code e seleção automática quando utilizada. Observar canais, interferência e clientes e relacionar recursos Wi-Fi 6/6E/7 ao hardware, regulamentação e firmware do AP.

#### 61.3. Encaminhamento do SSID

**Aprendizado da seção:** Configurar tunnel/bridge e identificar o caminho e a policy correspondente.

- **61.3.1. Tunnel mode, bridge mode e VLANs:** Configurar os modos de encaminhamento do SSID e acompanhar por onde o tráfego chega ao gateway. Relacionar o modo à interface e à policy correta, demonstrando por que a mesma regra não inspeciona automaticamente um SSID em bridge fora do FortiGate.

#### 61.4. Autenticação wireless

**Aprendizado da seção:** Aplicar os métodos já conhecidos aos clientes e aos SSIDs apropriados.

- **61.4.1. WPA2/WPA3, Enterprise, PSK e convidados:** Configurar os métodos suportados, incluindo chaves individuais/dinâmicas quando disponíveis. Integrar RADIUS ou portal e testar usuário autorizado, senha incorreta e convidado sem acesso às redes internas.

#### 61.5. Mobilidade e isolamento dos clientes

**Aprendizado da seção:** Acompanhar mudança de AP e verificar isolamento e otimização pelo efeito sobre as sessões reais.

- **61.5.1. Roaming, isolamento, QoS e recursos de otimização:** Aplicar os recursos de mobilidade e otimização suportados e acompanhar uma mudança de AP. Demonstrar isolamento entre clientes e o caminho de aplicação de QoS e policies, conferindo o efeito em tráfego real.

#### 61.6. Proteção e diagnóstico wireless

**Aprendizado da seção:** Distinguir associação, autenticação, condição de rádio e acesso autorizado usando os eventos do controlador.

- **61.6.1. Rogue AP, WIDS/WIPS e diagnóstico de clientes:** Consultar detecção e proteção wireless disponíveis e operar somente os modos autorizados ao cenário. Investigar associação, autenticação, endereço, DNS e policy com eventos do controlador, distinguindo falha RF de falha de acesso.

**Prática e evidência:** Publicar SSIDs corporativo e visitante, testar autenticação e isolamento e acompanhar um cliente da associação ao log da policy.

**Critério de conclusão:** O aluno explica o caminho do SSID e localiza a causa de falha entre rádio, autenticação, endereçamento e firewall.

### 62. FortiExtender e conectividade celular

**Base já ensinada:** 02, 24, 29
**Retoma:** Primeira passagem.
**Base atual:** Produzir conteúdo específico para esta funcionalidade.
**Objetivo:** Gerenciar conectividade celular e extensão de rede pelo FortiGate, escolhendo o modelo de integração. Monitorar qualidade, consumo e falhas e usar o caminho resultante em policies e SD-WAN.
**Por que nesta posição:** IPAM, serviços e seleção de caminhos já foram configurados. O acesso celular passa a ser mais um caminho observável, com registro e consumo próprios.

#### 62.1. FortiExtender e funções celulares do FortiGate

**Aprendizado da seção:** Identificar quem termina a conexão e como ela aparece para o FortiGate.

- **62.1.1. Descoberta, autorização e modos de gerenciamento:** Autorizar o FortiExtender e comparar os modos suportados, incluindo modem integrado/externo quando disponível. Identificar interface, endereço e plano de controle, verificando compatibilidade e licenças.
- **62.1.2. SIM, APN, sinal e conectividade da operadora:** Configurar os parâmetros da conexão celular e observar registro, sinal, endereço e rota. Distinguir falha de SIM/APN, limitação da operadora e bloqueio por policy, incluindo o efeito de CGNAT da operadora nas conexões de entrada.

#### 62.2. LAN extension

**Aprendizado da seção:** Usar IPAM e observar a interface lógica criada pela extensão.

- **62.2.1. LAN extension e endereçamento por IPAM:** Configurar a extensão suportada pelo FortiGate e verificar interface lógica e atribuição de endereços. Explicar o que é transportado até o controlador e onde policies e serviços locais são aplicados.

#### 62.3. Contingência e consumo

**Aprendizado da seção:** Integrar o caminho celular à seleção SD-WAN e comprovar falha, quota e recuperação.

- **62.3.1. SD-WAN, dual SIM, quota e diagnóstico:** Usar o caminho celular na SD-WAN e testar contingência e recuperação. Configurar troca de SIM e controles de consumo quando suportados e comprovar qual condição disparou a mudança, distinguindo quota, SLA e perda de registro.

**Prática e evidência:** Entregar um caminho celular ou extensão gerenciada e demonstrar contingência e controle de consumo no FortiGate.

**Critério de conclusão:** O aluno identifica o papel do FortiExtender, o estado da conexão e a regra que selecionou o caminho.

### 63. Virtual Patching e proteção por contexto do ativo

**Base já ensinada:** 14, 18, 40, 60
**Retoma:** 14
**Base atual:** C10; ampliar conforme o escopo desta passagem.
**Objetivo:** Retomar a proteção por assinatura para usar Virtual Patching com o contexto do ativo. Aplicar o recurso à proteção suportada e integrar com controles de gerência ou NAC já ensinados.
**Por que nesta posição:** IPS, local-in, inventário e NAC agora têm funcionamento conhecido. A mitigação pode ser vinculada ao ativo sem depender de uma explicação futura de admissão ou de contexto.

#### 63.1. Perfil de Virtual Patching

**Aprendizado da seção:** Associar ativo, vulnerabilidade e mitigação e comprovar o alcance do controle.

- **63.1.1. Perfis de Virtual Patching e proteção OT/IoT:** Configurar um perfil compatível com o ativo e a licença e relacionar inventário, vulnerabilidade e assinatura aplicada. Demonstrar alcance e limitações da mitigação, mantendo explícita a necessidade de atualizar o equipamento protegido.

#### 63.2. Integração com gerência e NAC

**Aprendizado da seção:** Aplicar o mecanismo à interface ou decisão de admissão já compreendida.

- **63.2.1. Interfaces de gerência e integração com NAC:** Aplicar a proteção documentada à gerência local e à integração NAC já ensinadas. Localizar perfil, decisão e evento e comparar com uma firewall policy de trânsito, comprovando em qual ponto o mecanismo atuou.

**Prática e evidência:** Aplicar um perfil compatível, verificar o ativo e o evento e mostrar a integração suportada com gerência ou NAC.

**Critério de conclusão:** O aluno explica a mitigação aplicada e seu limite sem tratá-la como correção definitiva do ativo.

### 64. FortiGate VM e implantação em nuvem

**Base já ensinada:** 05, 21, 25, 28, 36, 57
**Retoma:** Primeira passagem.
**Base atual:** C15, C16; ampliar conforme o escopo desta passagem.
**Objetivo:** Aplicar a configuração do FortiGate em VM e nuvens públicas e distinguir recursos da instância, rede externa e disponibilidade. Comparar a instância administrada com o modelo gerenciado CNF pela operação e pelo catálogo de funções.
**Por que nesta posição:** Rotas, NAT, VPN e disponibilidade já foram usados. A unidade muda a plataforma de implantação; não classifica ZTNA como parte de cloud e não exige tê-lo estudado para compreender a VM.

#### 64.1. Recursos da VM

**Aprendizado da seção:** Relacionar licenciamento, recursos alocados e interfaces à capacidade efetiva da instância FortiGate.

- **64.1.1. Licenciamento, vCPU, memória, interfaces e aceleração:** Consultar limites e licenciamento da VM e relacionar recursos alocados à carga de inspeção. Verificar mapeamento das NICs, desempenho e suporte de aceleração, sem transportar expectativas de NP/CP físico automaticamente para uma VM.

#### 64.2. Configuração inicial do FortiOS na plataforma

**Aprendizado da seção:** Conferir a configuração de bootstrap e os serviços resultantes no FortiGate sem transformar a seção em preparação de laboratório.

- **64.2.1. Implantação suportada e configuração inicial do FortiOS:** Usar os mecanismos de bootstrap/configuração inicial da plataforma e verificar a configuração resultante. Focar identidade, interfaces, administração e caminhos do FortiGate, mantendo criação de conta cloud e preparação de laboratório fora da grade técnica.

#### 64.3. Encaminhamento na nuvem

**Aprendizado da seção:** Seguir o acesso entre controles da plataforma e decisões de rota e policy do FortiGate.

- **64.3.1. Tabelas cloud, interfaces, IPs e caminhos simétricos:** Comparar rotas e filtros externos da nuvem com rotas e policies do FortiGate. Seguir um acesso por entrada e saída e demonstrar o impacto de source/destination checks, IPs públicos, balanceadores e regras de rede da plataforma usada.

#### 64.4. Disponibilidade na nuvem

**Aprendizado da seção:** Verificar o modelo de HA suportado e a convergência do caminho sem presumir comportamento idêntico ao cluster físico.

- **64.4.1. HA, autoscaling e integração de rotas:** Escolher o modelo suportado de disponibilidade e verificar mudança de caminho e preservação de estado. Distinguir FGCP de arquiteturas com APIs, load balancer ou autoscaling, conferindo permissões e tempo de convergência.

#### 64.5. Conectividade híbrida

**Aprendizado da seção:** Aplicar VPN, rotas e conectores conhecidos ao caminho entre nuvem e outros ambientes.

- **64.5.1. VPN, SDN connectors e integração AWS/Azure/GCP:** Construir o caminho híbrido com VPN e rotas conhecidas e validar descoberta por conector. Incluir o wizard Cloud SDN Orchestration do 8.0 no cenário AWS documentado e verificar os objetos que ele cria.

#### 64.6. FortiGate CNF

**Aprendizado da seção:** Distinguir o serviço gerenciado da VM operada pelo aluno.

- **64.6.1. Comparação com FortiGate CNF:** Comparar responsabilidade operacional, contratação e catálogo de funções de FortiGate VM e FortiGate CNF. Conferir a matriz do serviço e mostrar o lado FortiGate da integração escolhida, sem presumir equivalência entre produtos.

**Prática e evidência:** Seguir um acesso pela rede da plataforma, interface, rota e policy do FortiGate e comprovar o caminho de retorno e uma condição de falha.

**Critério de conclusão:** O aluno localiza o controle no domínio correto e distingue VM operada e serviço gerenciado.

### 65. Administração II: segurança, manutenção e ciclo de vida

**Base já ensinada:** 01, 09, 15, 17, 40
**Retoma:** 01
**Base atual:** C01; ampliar conforme o escopo desta passagem.
**Objetivo:** Administrar o FortiGate com separação de privilégios, proteção da gerência e manutenção verificável. Operar FortiGuard, backups, firmware e recuperação conhecendo os efeitos sobre os serviços já estudados.
**Por que nesta posição:** O primeiro acesso seguro já foi feito no início. Agora o aluno conhece certificados, autenticação, local-in, HA e integrações para aprofundar administração sem antecipar todo esse contexto.

#### 65.1. Administradores, perfis e métodos de login

**Aprendizado da seção:** Aplicar privilégio mínimo e autenticação adequada ao papel de administração.

- **65.1.1. Contas locais/remotas, SSO e perfis administrativos:** Criar perfis de leitura, operação e administração e testar o escopo global/VDOM. Integrar o método remoto apropriado e conferir atributos e fallback, mantendo conta de recuperação independente da dependência externa.
- **65.1.2. MFA, chaves SSH, trusted hosts e canais permitidos:** Aplicar MFA, restrições por origem e método e opções de chave pública suportadas. Demonstrar os controles de endurecimento por canal do 8.0 e verificar o acesso autorizado e o bloqueio sem perder a via de recuperação.

#### 65.2. Autenticação administrativa e SSO

**Aprendizado da seção:** Aplicar à gerência o que já foi aprendido sobre identidade e permissões.

- **65.2.1. SSO de usuários e SSO de administradores:** Distinguir login de um usuário de trânsito do login administrativo no FortiGate. Comparar IdP, permissões e registro do administrador, deixando o hardening completo e as contas de recuperação para 38.
- **65.2.2. TACACS+ e atributos administrativos:** Configurar o servidor TACACS+ e os atributos suportados para o administrador remoto. Testar permissão efetiva, origem e rejeição, distinguindo login de usuários de trânsito de autorização para administrar o equipamento.

#### 65.3. Serviços FortiGuard

**Aprendizado da seção:** Distinguir licença, base, atualização e consulta de rating e comprovar a condição de cada serviço.

- **65.3.1. Registro, assinaturas, bases, rating e atualizações:** Consultar licenças e versões de bases e configurar a atualização no serviço apropriado. Diferenciar licença vencida, base desatualizada e impossibilidade de consultar rating e verificar o comportamento dos perfis em cada condição.

#### 65.4. Comunicação local-out

**Aprendizado da seção:** Definir origem e caminho dos serviços locais e separar falha de DNS, hora, rota, transporte e confiança.

- **65.4.1. Origem, interface, DNS, proxy e transporte TLS:** Definir como os serviços locais alcançam os destinos quando há múltiplas interfaces ou VDOMs. Testar DNS, hora, rota, confiança e TLS da integração sem assumir que uma policy de usuário controla da mesma forma todo tráfego local-out.

#### 65.5. Cópias e revisões de configuração

**Aprendizado da seção:** Escolher o tipo de cópia pela finalidade e verificar o conteúdo preservado e protegido.

- **65.5.1. Backup protegido, cópia mascarada e versionamento:** Comparar exportação completa, criptografada e mascarada, verificando o que cada uma permite restaurar. Configurar revisões e armazenamento externo suportados e explicar a proteção de tokens, certificados e segredos presentes na configuração.

#### 65.6. Recuperação e substituição de equipamento

**Aprendizado da seção:** Restaurar a configuração no cenário suportado e conferir interfaces, licenças e serviços após a recuperação.

- **65.6.1. Restauração, reset e substituição de equipamento:** Executar recuperação no cenário suportado e conferir interfaces, licença e serviços essenciais. Tratar mudança de modelo/RMA e diferenças de configuração como procedimento explícito, sem supor que um arquivo de qualquer equipamento pode ser importado diretamente.

#### 65.7. Ciclo de firmware

**Aprendizado da seção:** Selecionar o patch e o caminho de atualização com critérios de compatibilidade, validação e retorno.

- **65.7.1. Release notes, upgrade path, PSIRT e retorno:** Selecionar a versão verificando suporte, problemas conhecidos, migração e caminho recomendado. Registrar critérios de retorno e comparar a configuração e serviços depois da atualização, incluindo compatibilidade de Fabric e LAN gerenciada.

#### 65.8. Segurança da plataforma

**Aprendizado da seção:** Identificar o mecanismo real do modelo e explicar o que protege e o impacto de sua ativação.

- **65.8.1. Secure boot, TPM, private-data-encryption e FIPS:** Identificar os mecanismos disponíveis no modelo e explicar o que cada um protege. Demonstrar consultas e alterações suportadas, registrando exigências de reinício, recuperação ou modo operacional, sem tratar certificação FIPS como propriedade automática de qualquer build.

**Prática e evidência:** Criar perfis administrativos, verificar uma dependência FortiGuard, gerar backups com finalidades distintas e executar um plano de manutenção com validação.

**Critério de conclusão:** O aluno comprova privilégio e canais de gerência, explica o conteúdo recuperável do backup e justifica a versão e o procedimento escolhidos.

### 66. Alta disponibilidade III: manutenção do cluster

**Base já ensinada:** 28, 65
**Retoma:** 28
**Base atual:** C13; ampliar conforme o escopo desta passagem.
**Objetivo:** Executar manutenção e atualização do cluster com critérios de saúde, continuidade e retorno. Verificar os serviços representativos aprendidos ao longo do curso.
**Por que nesta posição:** O funcionamento do cluster e o ciclo de firmware já são conhecidos. A manutenção pode agora combinar esses dois assuntos em vez de antecipar atualização no primeiro failover.

#### 66.1. Manutenção e atualização do cluster

**Aprendizado da seção:** Comparar saúde, configuração e continuidade antes e depois da mudança planejada.

- **66.1.1. Failover controlado, substituição e retorno de membro:** Verificar saúde antes de trocar o primário e adicionar ou substituir um membro conforme o procedimento suportado. Confirmar configuração, sessão e acesso após o retorno, evitando validar somente o estado do dashboard.
- **66.1.2. Upgrade, impacto e validação pós-manutenção:** Conferir caminho de atualização, compatibilidade e modo de upgrade. Observar a continuidade dos serviços representativos e definir critérios de sucesso e recuperação, incluindo limitações do chamado upgrade sem interrupção.

**Prática e evidência:** Planejar e executar uma troca controlada de membro ou atualização suportada e comparar saúde e sessões antes e depois.

**Critério de conclusão:** O aluno apresenta critérios de sucesso e retorno e evidências dos serviços testados.

### 67. Diagnóstico III: desempenho, engines e suporte

**Base já ensinada:** 19, 22, 39, 42, 65, 66
**Retoma:** 06, 07, 22
**Base atual:** C14; ampliar conforme o escopo desta passagem.
**Objetivo:** Operar a observabilidade e os recursos internos do FortiGate para investigar consumo, perda e instabilidade. Relacionar CPU, memória, sessões e offload ao serviço afetado e produzir evidências úteis de suporte.
**Por que nesta posição:** O aluno já configurou os serviços e perfis que consomem os recursos. Engines, offload, conserve mode e coleta de suporte podem ser relacionados a sintomas reais, sem serem antecipados porque logs apareceram no início.

#### 67.1. Métricas e exportação

**Aprendizado da seção:** Escolher o sinal e o destino de observação adequados à pergunta de operação.

- **67.1.1. Dashboards, processos, sensores e SNMP:** Consultar CPU, memória, disco, sessões, interfaces e sensores disponíveis e configurar SNMP protegido. Relacionar polling e traps ao evento e validar recebimento, distinguindo limiar de alerta de causa confirmada.
- **67.1.2. NetFlow, sFlow, logs e espelhamento:** Configurar os formatos suportados e conferir amostragem, campos, origem e destino. Distinguir NetFlow v9 de IPFIX em recursos específicos de Hyperscale/FortiSwitch e explicar limitações da visibilidade sobre fluxos acelerados ou espelhados.

#### 67.2. Hardware e caminho de processamento

**Aprendizado da seção:** Explicar por que dois fluxos com a mesma banda podem consumir recursos de maneira diferente.

- **67.2.1. CPU, NP, CP, SPU e critérios de offload:** Identificar os recursos reais do modelo e consultar o estado de aceleração de uma sessão. Relacionar interfaces, policy, NAT, inspeção e VPN aos critérios de offload e explicar quando o fluxo permanece em software.
- **67.2.2. Captura, contadores e alterações limitadas de offload:** Usar ferramentas de visibilidade da plataforma e reconhecer pacotes ausentes por aceleração. Quando necessário ao teste, alterar apenas o escopo documentado e restaurá-lo ao final, avaliando o impacto sobre desempenho.

#### 67.3. Pressão de recursos e continuidade da inspeção

**Aprendizado da seção:** Relacionar consumo aos mecanismos já utilizados e verificar o comportamento do build.

- **67.3.1. Conserve mode, memória e serviços de inspeção:** Observar estado, limiares e logs de memória no build usado e distinguir pressão de carga, crescimento anormal e limite de plataforma. Explicar como AV, IPS ou proxy podem reagir conforme a configuração e registrar o risco de continuidade sem inspeção.
- **67.3.2. CPU, sessões, buffers e limite de conexões:** Identificar o processo e o tipo de carga associados ao sintoma. Comparar taxa de criação de sessões, volume, drops e limites por recurso, evitando usar apenas throughput máximo nominal como medida de capacidade de inspeção.
- **67.3.3. Fail-open, carga e diagnóstico:** Consultar estado do engine, recursos e logs para reconhecer indisponibilidade ou pressão de capacidade. Explicar os efeitos documentados de fail-open/fail-close e testar no escopo apropriado, distinguindo ausência de detecção de ausência de inspeção.

#### 67.4. Diagnóstico por componente e suporte

**Aprendizado da seção:** Produzir uma investigação reproduzível que preserve segurança e funcionamento.

- **67.4.1. WAD, IPS engine, authd, IKE e serviços locais:** Selecionar o diagnóstico do componente relevante e limitar origem, duração e volume. Correlacionar com o fluxo e os logs conhecidos e encerrar a coleta, evitando ativar todos os debugs simultaneamente.
- **67.4.2. Crash logs, support bundles e casos reproduzíveis:** Consultar eventos de falha e coletar as informações suportadas para o caso. Registrar build, modelo, horário, sintoma e passos de reprodução e revisar segredos e dados antes de compartilhar o material com suporte.

#### 67.5. Estado e mecanismos auxiliares das sessões

**Aprendizado da seção:** Aprofundar o comportamento interno das conexões depois de usá-las em vários recursos.

- **67.5.1. Session helpers, timers e reavaliação:** Identificar o helper participante e os timers efetivos e relacioná-los ao protocolo e ao sintoma. Comparar o estado antes e depois de uma alteração limitada e explicar por que limpar todas as sessões ou alterar comportamento global não deve substituir o diagnóstico.

**Prática e evidência:** Investigar uma degradação controlada correlacionando sessão, processo e hardware; validar envio de uma métrica e preparar evidência de suporte.

**Critério de conclusão:** O aluno demonstra a ligação entre sintoma e recurso afetado, explicita limites da observação e restaura os ajustes temporários usados no diagnóstico.

### 68. Automação e gestão da configuração

**Base já ensinada:** 06, 65, 67
**Retoma:** Primeira passagem.
**Base atual:** Produzir conteúdo específico para esta funcionalidade.
**Objetivo:** Automatizar ações do FortiGate e gerenciar sua configuração com autenticação, escopo e validação. Usar API, automações por evento e ferramentas de gestão sem confundir comando gerado com mudança efetivamente segura.
**Por que nesta posição:** O aluno já sabe alterar, verificar e recuperar a configuração. A automação passa a repetir operações compreendidas e a demonstrar seu resultado, em vez de ocultar o funcionamento do FortiGate.

#### 68.1. Automation stitches

**Aprendizado da seção:** Transformar evento em ação controlada e demonstrar as condições de disparo.

- **68.1.1. Triggers, filtros, ações e encadeamento:** Criar uma automação com gatilho e filtros específicos e uma ação verificável. Comparar evento original, execução e resultado e explicar como evitar repetição indevida ou reação ampla a um evento isolado.
- **68.1.2. Webhooks, e-mail, scripts e quarentena:** Configurar as ações e integrações suportadas com credenciais adequadas. Testar falha de entrega e ação no alvo correto, tratando aprovação, escopo e reversão conforme o impacto operacional da automação.

#### 68.2. REST API e integração programática

**Aprendizado da seção:** Consultar e alterar objetos do FortiGate de forma rastreável.

- **68.2.1. API administrators, tokens, trust e permissões:** Criar um administrador API limitado e proteger token e origem permitida. Executar uma consulta e uma alteração simples no endpoint suportado, verificando VDOM, resposta e diferença entre erro de autenticação, permissão e validação.
- **68.2.2. Idempotência, comparação, backup e erro parcial:** Ler o estado antes de alterar, comparar o resultado esperado e lidar com criação e atualização de objetos. Demonstrar recuperação de erro parcial e referências entre recursos sem assumir que toda sequência de chamadas é transacional.

#### 68.3. FortiManager

**Aprendizado da seção:** Comparar configuração desejada e instalada e verificar o efeito no FortiGate.

- **68.3.1. FortiManager, ADOMs, packages e revisões:** Demonstrar o lado FortiGate do registro e instalação gerenciada e comparar configuração local e central. Explicar conflitos e revisões e verificar a policy instalada, mantendo o curso centrado no efeito sobre o FortiGate.

#### 68.4. Configuração como código

**Aprendizado da seção:** Aplicar uma alteração pequena com diff, repetição e tratamento de erro.

- **68.4.1. Ansible, Terraform e templates:** Usar integrações oficialmente suportadas para descrever uma alteração pequena e revisar o plano/diff. Demonstrar repetição sem mudanças indevidas e explicar compatibilidade de provider/collection e versão do FortiOS.

#### 68.5. Assistência administrativa com IA

**Aprendizado da seção:** Usar ferramentas atuais como auxílio de operação com verificação do resultado.

- **68.5.1. FortiAI Assistant e CLI Code Lab:** Localizar os recursos e suas dependências de serviço e licença. Solicitar explicação ou geração de configuração para um caso conhecido e revisar escopo, sintaxe e impacto antes de executar.
- **68.5.2. Validação humana e evidência da mudança:** Comparar a sugestão com documentação e estado real do equipamento. Aplicar apenas o que foi validado e comprovar por configuração, logs e teste de tráfego, sem atribuir autoridade técnica ao texto gerado.

**Prática e evidência:** Automatizar um evento de teste e uma alteração por API com usuário limitado, verificar a repetição e comprovar o estado final no FortiGate.

**Critério de conclusão:** O aluno identifica credencial, escopo, alteração e evidência e recupera o estado quando uma etapa não termina como esperado.

### 69. WAN Optimization, cache e redirecionamento

**Base já ensinada:** 40, 42, 67
**Retoma:** Primeira passagem.
**Base atual:** Produzir conteúdo específico para esta funcionalidade.
**Objetivo:** Configurar os mecanismos de otimização WAN e cache que o FortiGate suporta no cenário escolhido. Explicar pares, redirecionamento e restrições sem confundir otimização de conteúdo com SD-WAN ou traffic shaping.
**Por que nesta posição:** Proxy, transporte, conteúdo visível e medição já foram praticados. A otimização pode ser avaliada por ganho real e requisitos do recurso, sem ser confundida com SD-WAN ou QoS.

#### 69.1. WAN Optimization e pares

**Aprendizado da seção:** Identificar o que é otimizado e os requisitos necessários nas pontas.

- **69.1.1. Peers, túneis de otimização e protocolos:** Configurar os peers e a regra de otimização no cenário suportado e comparar o fluxo com e sem o recurso. Explicar requisitos de armazenamento, modo de implantação e protocolos, sem prometer ganho em conteúdo já comprimido ou cifrado.
- **69.1.2. Cache, compressão, byte caching e validação:** Habilitar os mecanismos disponíveis e medir transferência inicial e repetida. Separar ganho de cache de variação da rede e demonstrar counters e diagnóstico, registrando o custo em recurso e as restrições do equipamento.

#### 69.2. Web cache

**Aprendizado da seção:** Atender conteúdo reutilizável pelo serviço de cache suportado.

- **69.2.1. Cache web:** Configurar o cache no cenário e na plataforma suportados e comparar primeira transferência e reutilização. Conferir o que pode ser armazenado e invalidado e verificar o ganho real, distinguindo cache de filtragem e decriptação.

#### 69.3. WCCP

**Aprendizado da seção:** Verificar redirecionamento e comportamento de falha do serviço externo.

- **69.3.1. WCCP, redirecionamento e falha do serviço:** Configurar o papel suportado do FortiGate no grupo WCCP e observar o encaminhamento ao serviço. Testar indisponibilidade e confirmar o comportamento de continuidade, evitando criar um loop ou um caminho que deixe de aplicar a policy necessária.

**Prática e evidência:** Executar uma otimização ou cache suportado com comparação mensurável e demonstrar o caminho de redirecionamento WCCP.

**Critério de conclusão:** O aluno identifica o mecanismo responsável pelo ganho e declara hardware, armazenamento e protocolos que condicionam seu uso.

### 70. CGNAT e Hyperscale Firewall

**Base já ensinada:** 41, 65, 67
**Retoma:** 05, 41
**Base atual:** Produzir conteúdo específico para esta funcionalidade.
**Objetivo:** Operar os recursos do FortiGate para tradução e sessões em grande escala, compreendendo pools, alocação de portas e rastreabilidade. Distinguir CGNAT de Hyperscale e dos mecanismos NAT convencionais.
**Por que nesta posição:** O aluno conhece tradução e processamento de sessões. A especialização acrescenta escala, alocação e implementação em hardware com suas condições próprias.

#### 70.1. CGNAT e alocação de portas

**Aprendizado da seção:** Escolher o modelo de tradução e explicar a relação entre assinante, endereço e porta.

- **70.1.1. Pools, port blocks e determinismo:** Configurar os modos suportados de alocação e comparar tradução por sessão e por bloco. Calcular consumo esperado a partir de limites documentados e demonstrar como o mapeamento de um assinante é localizado.
- **70.1.2. Logging, rastreabilidade e exaustão:** Verificar os registros necessários para reconstruir o mapeamento em um horário. Demonstrar detecção e tratamento de exaustão de recursos, distinguindo limite de pool, portas e capacidade de sessão.

#### 70.2. Hyperscale e processamento em hardware

**Aprendizado da seção:** Aplicar o recurso no modelo e licença adequados e reconhecer seus controles e restrições.

- **70.2.1. Ativação, VDOMs e policies Hyperscale:** Configurar o contexto especializado e conferir suporte de NAT e policies. Comparar o caminho acelerado com o firewall convencional e identificar funções de inspeção ou logging que não têm o mesmo comportamento.
- **70.2.2. Hardware logging, IPFIX e diagnóstico:** Configurar exportação e coletores suportados e observar registros gerados em hardware. Consultar contadores e recursos ASIC e distinguir formatos e visibilidade específicos de Hyperscale do NetFlow geral do FortiGate.

**Prática e evidência:** Apresentar um mapeamento CGNAT rastreável e a configuração/observação de Hyperscale em plataforma compatível, identificando os limites de cada mecanismo.

**Critério de conclusão:** O aluno explica alocação e rastreabilidade e identifica o que depende de hardware, licença e modo especializado.

### 71. FortiOS Carrier: protocolos e controles específicos

**Base já ensinada:** 14, 36, 70
**Retoma:** Primeira passagem.
**Base atual:** Produzir conteúdo específico para esta funcionalidade.
**Objetivo:** Identificar e configurar as funções Carrier oferecidas pelo FortiOS no equipamento e licenciamento aplicáveis. Relacionar os protocolos inspecionados às policies, perfis e registros específicos, sem tratar Carrier como um único botão de CGNAT.
**Por que nesta posição:** Inspeção, caminhos e tradução em escala já foram compreendidos. Cada protocolo Carrier pode ser configurado e verificado por seu estado e seus critérios específicos.

#### 71.1. Escopo Carrier e disponibilidade

**Aprendizado da seção:** Determinar quais funções Carrier existem no ambiente e como são ativadas e observadas.

- **71.1.1. Licenciamento, modo Carrier e catálogo de protocolos:** Consultar os requisitos de FortiOS Carrier e a matriz do modelo. Localizar os controles documentados para GTP, SCTP, Diameter e MMS quando suportados, distinguindo habilitação, inspeção e transporte de protocolo.
- **71.1.2. Integração com roteamento, HA e NAT:** Relacionar as sessões Carrier à arquitetura de encaminhamento e disponibilidade escolhida. Verificar as combinações de recursos suportadas e identificar limites específicos que não aparecem no cenário corporativo convencional.

#### 71.2. GTP: perfil e tratamento do tráfego móvel

**Aprendizado da seção:** Configurar o controle GTP do FortiGate Carrier e distinguir sinalização, dados e estado.

- **71.2.1. Interfaces, versões, mensagens e contexto:** Aplicar o perfil GTP no caminho autorizado e identificar os tipos e versões de mensagens suportados. Consultar estado e contadores e explicar a relação entre controle e tráfego de usuário no cenário documentado.
- **71.2.2. Filtros, validação de mensagens e logging:** Configurar as validações e restrições disponíveis e comparar uma mensagem permitida com um teste benigno de validação. Localizar o campo que determinou a decisão e o registro correspondente.

#### 71.3. SCTP: associação e proteção

**Aprendizado da seção:** Operar os controles SCTP previstos para a plataforma sem tratá-los como se fossem TCP.

- **71.3.1. Estado, multihoming e perfis suportados:** Configurar a policy e os parâmetros SCTP aplicáveis e observar a associação. Conferir suporte de múltiplos endereços, NAT e offload no modelo, verificando como o FortiGate representa o estado.
- **71.3.2. Validação, limites e diagnóstico:** Aplicar os controles de protocolo documentados e consultar contadores e logs. Diagnosticar associação que não se estabelece ou não transporta dados, separando seleção de policy e restrição SCTP.

#### 71.4. Diameter: inspeção e ações

**Aprendizado da seção:** Aplicar o perfil Diameter aos transportes suportados e comprovar a validação de mensagens.

- **71.4.1. Perfil, comandos e sanity checking:** Configurar o diameter-filter no cenário suportado e relacioná-lo à firewall policy. Demonstrar quais campos e mensagens são verificados e comparar encaminhamento da porta com inspeção efetiva do protocolo.
- **71.4.2. Requests, answers, logging e falhas:** Acompanhar mensagens e respostas de teste e ativar os logs necessários. Identificar uma rejeição de validação e explicar o critério, sem inferir suporte a comandos não documentados.

#### 71.5. MMS: conteúdo, perfil e operação

**Aprendizado da seção:** Configurar as funções MMS disponíveis e verificar o ponto de inspeção do conteúdo.

- **71.5.1. Perfis e integração com as policies aplicáveis:** Configurar o controle MMS no modo Carrier compatível e identificar mensagens e conteúdo que entram no mecanismo. Conferir quais ações e integrações de inspeção são suportadas pelo equipamento.
- **71.5.2. Logs e diagnóstico de mensagens:** Executar mensagens benignas de teste permitidas e restritas e correlacionar ação e evento. Separar falha de transporte de decisão do perfil e documentar suporte e licenças do cenário.

**Prática e evidência:** Para cada protocolo Carrier disponível, registrar requisitos, configurar seu controle e apresentar um evento e um contador que comprovem o tratamento.

**Critério de conclusão:** O aluno identifica os mecanismos realmente suportados e explica configuração, decisão e evidência de cada função Carrier demonstrada.

### 72. FortiGate em OT, IoT e plataformas Rugged

**Base já ensinada:** 30, 56, 63, 67
**Retoma:** Primeira passagem.
**Base atual:** Produzir conteúdo específico para esta funcionalidade.
**Objetivo:** Aplicar as funcionalidades do FortiGate à identificação, segmentação e proteção de dispositivos OT/IoT. Reconhecer o que muda em plataformas Rugged e usar inspeção e Virtual Patching com critérios de disponibilidade.
**Por que nesta posição:** Segmentação, visibilidade, NAC e Virtual Patching já foram ensinados. O módulo aplica esses controles ao cenário especializado e identifica as particularidades do hardware sem criar dependências futuras.

#### 72.1. Visibilidade e segmentação de ativos

**Aprendizado da seção:** Usar o contexto disponível no FortiGate para representar e limitar acessos dos dispositivos.

- **72.1.1. Inventário, identificação e protocolos industriais:** Consultar classificação de dispositivos e identificação de aplicações/protocolos industriais disponíveis. Comparar tráfego roteado, transparente e observação passiva suportada, explicando a visibilidade obtida em cada modo sem presumir detecção completa de todos os ativos.
- **72.1.2. Policies e controles por zona e ativo:** Aplicar segmentação e restringir comunicações com os objetos já conhecidos. Testar fluxos representativos e revisar o impacto de perda de conexão, timeout e ausência de resposta antes de habilitar inspeções mais restritivas.

#### 72.2. Mitigação e recursos específicos da plataforma

**Aprendizado da seção:** Selecionar controles compatíveis com disponibilidade, modelo e finalidade do ambiente.

- **72.2.1. IPS, Virtual Patching e NAC para OT/IoT:** Aplicar os perfis e a identidade do ativo a um cenário de demonstração seguro. Validar o evento de detecção ou mitigação e registrar limites, falsos positivos e dependências de FortiGuard, sem substituir atualização e correção do ativo.
- **72.2.2. Rugged, portas, sensores e operação:** Identificar interfaces, alarmes, alimentação e recursos físicos do modelo Rugged utilizado. Demonstrar monitoramento e resposta documentados e separar propriedades do hardware de recursos do FortiOS disponíveis também em outras plataformas.

**Prática e evidência:** Segmentar um conjunto de ativos de teste, aplicar uma mitigação compatível e comprovar visibilidade, decisão e impacto sobre os fluxos permitidos.

**Critério de conclusão:** O aluno documenta o recurso aplicado, o modelo/licença exigidos e a evidência de proteção sem inferir cobertura a partir apenas do inventário.

## Produção e conferência

A base já ensinada é uma conferência editorial: aponta apenas para conteúdos anteriores. O aluno segue a ordem principal e não recebe uma lista de saltos. A retomada identifica uma função que já foi implementada e agora ganhará um caso novo.

A [auditoria de agrupamentos e cobertura](04-cobertura-e-producao.md) registra as decisões e preserva o destino das funcionalidades anteriores. As [fontes e diferenças de versão](03-fortios-8.0-fontes-e-mudancas.md) orientam patch, modelo, modo e licença usados em cada demonstração.
