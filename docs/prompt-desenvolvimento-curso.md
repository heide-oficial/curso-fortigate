# Prompt: desenvolvimento do Curso FortiGate 7.6

Copie o texto abaixo da linha para a nova sessão. Antes, troque os quatro campos entre `[COLCHETES]`.

---

Você vai produzir material do **Curso FortiGate 7.6**, um curso em português para quem vai administrar FortiGate em produção e se preparar para a certificação NSE 4 – FortiOS Administrator.

## O que eu quero nesta sessão

Produzir o **[MÓDULO, por exemplo "Módulo 03 – Firewall policies"]** completo, do conteúdo ao PDF final.

- **Material de referência:** `[CAMINHO DO MATERIAL]`. Nesta pasta estão os meus slides resumidos e o PDF oficial do Study Guide da Fortinet (NSE 4 – FortiOS Administrator).
- **Laboratório FortiGate (roda localmente):** `[CAMINHO DO LABORATÓRIO]`
- **Repositório do curso (texto, mídias, ferramentas de captura e de PDF):** `[CAMINHO DO REPOSITÓRIO DO CURSO]`

Tudo o que você precisa está nessas pastas. **Não busque nada no GitHub nem em outros repositórios remotos**, e não clone nada.

## 1. O conteúdo: meus slides e o Study Guide da Fortinet

A pasta do material tem duas fontes, com papéis diferentes. Juntas, elas são a grade do curso: não existe outro documento de grade, e se o repositório tiver um `grade.md`, ignore-o.

| Fonte | Papel |
|---|---|
| **Meus slides resumidos** | Definem **o quê**: os módulos, os assuntos de cada um, a ordem e o foco. |
| **Study Guide oficial da Fortinet (PDF)** | É a **base técnica**: explica cada assunto com o detalhe, o mecanismo e a precisão que os slides não têm. |

Antes de escrever, leia todos os slides do módulo, inclusive as notas do apresentador, se houver. Leia também os capítulos do Study Guide que tratam dos mesmos assuntos. Os arquivos podem estar em PPTX, PDF ou imagens. O Study Guide é longo: localize os capítulos certos pelo sumário e leia esses trechos por inteiro.

### Leia as páginas como imagem, não só o texto

As duas fontes têm conteúdo visual:
- o Study Guide alterna texto corrido com **imagens de slides**;
- os meus slides também são visuais.

Esses slides podem ter texto, mas muitos explicam **só com formas**: diagramas de topologia, fluxos com setas, caixas numeradas, tabelas desenhadas, telas anotadas, cores que agrupam itens. **Esse conteúdo visual faz parte do conteúdo** e precisa estar no material com o mesmo peso do texto. A extração de texto não captura nada disso (texto dentro de imagens, a ordem de um fluxo, o que uma seta liga a quê), então ler só o texto não basta.

- **Veja cada página e cada slide como imagem.** Converta as páginas do Study Guide que vai usar em PNG (por exemplo, `pdftoppm -r 110 -f <pág> -l <pág> -png`) e olhe cada uma.
  - Nos meus slides em PPTX, converta para PDF (por exemplo, `libreoffice --headless --convert-to pdf`) e depois para imagens.
  - Leia o texto e as notas do apresentador do PPTX à parte (por exemplo, com `python-pptx`).
  - Se não conseguir renderizar algum arquivo, me avise em vez de seguir só com o texto.
- **Use a extração de texto só para localizar** capítulos e páginas (por exemplo, `pdftotext`), nunca como única leitura.
- **Interprete cada figura:**
  - o que ela mostra;
  - em que ordem as coisas acontecem;
  - o que cada forma, seta, cor ou número representa;
  - qual a conclusão que ela quer passar.
- **Leve essa informação para o material:**
  - uma sequência desenhada vira passos numerados no texto;
  - uma comparação em caixas vira tabela;
  - um diagrama de topologia vira a topologia do laboratório, montada e fotografada (seção 4);
  - uma tela anotada vira o passo a passo com imagens do laboratório.

  O conteúdo da figura entra; a figura em si não é copiada (veja "Escreva com suas palavras" abaixo).

### Como usar cada fonte

- **Os slides mandam no roteiro.** O material trata os mesmos assuntos dos slides, na mesma ordem e com o mesmo foco. Cada assunto dos slides vira texto, e nenhum fica de fora.
- **O Study Guide dá a profundidade.** Para cada tópico dos slides, use o Study Guide para explicar como funciona, os detalhes, os valores padrão e os comportamentos. Os slides são resumidos e o material não pode ser: cada tópico vira uma explicação completa, nas regras da seção 3.
- **Acrescente além dos slides só quando for importante**, e só em dois casos:
  1. **para contextualizar**, quando o slide pressupõe algo que o aluno precisa saber para entender o assunto (um conceito anterior, o porquê de uma configuração, o que acontece por dentro do FortiGate);
  2. **para trazer uma informação importante sobre o assunto em discussão**, como um comportamento que confunde, um valor padrão, uma consequência de configurar errado, um caso real ou um ponto cobrado no NSE 4.

  Tire esses acréscimos do Study Guide sempre que ele tratar do ponto.
- **Não amplie o escopo.** O Study Guide cobre muito mais do que os slides. Um assunto que está no Study Guide e não está nos slides só entra se for indispensável para entender um assunto dos slides, e mesmo assim só o necessário. Não "aproveite" para ensinar temas vizinhos.
- **Divergências:** se os slides e o Study Guide divergirem, ou se algo parecer desatualizado em relação ao FortiOS 7.6, siga o Study Guide no texto e me avise no relatório final, com o slide, a página do Study Guide e o motivo.
- **Escreva com suas palavras.**
  - Não copie trechos do Study Guide nem traduza parágrafos inteiros: explique em português, de forma didática, na sequência do curso.
  - Não reproduza figuras, diagramas nem telas do Study Guide ou dos slides. As imagens do material saem todas do laboratório (seção 4). A informação que essas figuras transmitem entra no material, explicada no texto, em tabelas, em passos numerados ou nas imagens do laboratório.

## 2. Primeiro passo: roteiro para eu aprovar

Antes de capturar imagens ou escrever o texto final, me mostre um roteiro curto:

- os tópicos dos slides, na ordem, e em qual capítulo e seção do módulo cada um vai entrar;
- para cada tópico, os capítulos e as páginas do Study Guide que vai usar como base, indicando as figuras e os slides cujo conteúdo visual vai aproveitar e como (passos, tabela, topologia no laboratório);
- o que você pretende acrescentar além dos slides, e por quê (contexto ou informação importante), com a página do Study Guide de onde vem;
- a topologia do laboratório que vai montar e a lista de passos que vai fotografar.

Espere minha aprovação e depois siga até o fim sem parar, a não ser que algo bloqueie o trabalho.

## 3. Regras de escrita

Estas regras valem para todos os módulos. O **módulo 01** que já está no repositório (`conteudo/modulo-01-primeiro-acesso-e-administracao-basica.md` e `pdf/modulo-01.pdf`) mostra como o resultado deve ficar. Use-o como referência de **formato e estilo**, não de conteúdo.

**Linguagem**
- Escreva para o aluno, em português, com linguagem fácil e termos técnicos explicados na primeira vez.
- O aluno não usa o laboratório: ele vê as telas capturadas. Nada de "no seu laboratório, faça", nem de termos de produção ("roteiro", "capturas", "esta grade").
- Não coloque número de módulo ou de seção ao lado de um assunto ("(módulo 03)", "seção 01.4"). Para apontar outro ponto, use o nome do assunto.
- Sem quadros "Na prova", sem comparação entre versões do FortiOS e sem questões de revisão.

**Profundidade:** todo assunto novo responde, com o detalhe que pede:
1. o que é, com um exemplo concreto;
2. como funciona por dentro (o mecanismo, a sequência de eventos, o que o FortiGate faz com o pacote ou com a configuração);
3. por que importa (o problema que resolve, o que acontece sem ele ou se configurado errado);
4. quando usar, com casos reais de empresas;
5. limites, valores padrão e detalhes que costumam confundir.

Nada de definição de uma linha. Tabelas e imagens apoiam a explicação, não a substituem.

**GUI primeiro.** O texto ensina pela GUI. A CLI só aparece no texto principal quando:
- não há opção na GUI;
- a saída do comando é a ferramenta de diagnóstico;
- o tema é a própria CLI.

O resto vai para o **Guia de comandos CLI** no fim de cada capítulo (bloco `:::cli`): o equivalente em CLI do que foi feito na GUI, os comandos de verificação e as opções só de CLI. Todo comando que mostra informação vem com a **saída real capturada no laboratório**, num bloco `saida` logo depois. Nunca invente uma saída.

**Estrutura do módulo**
1. "Antes de começar": o que você vai aprender, os pré-requisitos e a topologia atual, com o diagrama.
2. Capítulos `## NN.N.` e seções `### NN.N.N.`. Cada seção segue a ordem conceito → na GUI (passo a passo com imagens) → verificação.
3. Cada capítulo termina com "Erros comuns" e o Guia de comandos CLI.

**Quadros:** só três tipos, sempre começando pelo rótulo em negrito:
- `> **Na prática:**`
- `> **Atenção:**`
- `> **Dica para a prova:**`

**Cenário:** use a topologia, os nomes e os endereços do material da Fortinet. Se o material não definir um cenário para o assunto, proponha um no roteiro (seção 2) e mantenha-o igual nos módulos seguintes. Endereços públicos usam as faixas de documentação 203.0.113.0/24 e 198.51.100.0/24.

## 4. Imagens: o laboratório sendo montado, passo a passo

O material mostra o laboratório sendo montado e configurado, e o texto explica cada passo: o que está sendo feito, para que serve e o que muda. As regras:

- **Todo passo descrito tem imagem.** Se o texto diz "clique em Create new", "dê um duplo clique", "selecione e clique em Edit" ou "abra o terminal", existe uma imagem desse clique, com o elemento em destaque. Isso vale para configurações repetidas também ("faça o mesmo na VLAN 20": mostre a VLAN 20).
- **Mostre o caminho até a tela:** menu → submenu → diálogo, não só a tela final.
- **Situe na topologia:** antes de mostrar a tela de um dispositivo, mostre onde ele está no diagrama, com o cabo ou a conexão em destaque, e em qual dispositivo estamos (a área de trabalho do computador, o navegador), até chegar à tela.
- **Topologia:**
  - prefira a visão 2D do diagrama;
  - deixe em destaque tudo o que o texto cita: cards dos dois lados do cabo, VLANs, dispositivos;
  - os cabos não podem passar por cima dos cards;
  - destaques próximos não podem ter bordas sobrepostas (junte-os num único destaque).
- **Recorte e destaque:**
  - não capture a tela inteira quando o assunto é um diálogo, um menu ou um widget: recorte e amplie;
  - a imagem final tem pelo menos 1920 px de largura;
  - escureça o que não importa.
- **Sem vídeos:** sequências viram carrossel (`:::slides`), com uma imagem por etapa e o texto de cada uma.
- **Tema da GUI:** Jade em todas as telas.
- **Monte um laboratório próprio para o módulo.** Nunca use os modelos prontos do laboratório.
- **Confira cada imagem** antes de usar (por exemplo, numa folha de miniaturas): enquadramento, destaque certo, nada cortado, texto legível.

### Sintaxe dos blocos

A ferramenta de PDF e o visualizador reconhecem estes blocos no `.md`. As imagens ficam em `midia/mNN/`, com nomes no formato `<seção>-<assunto>.png`.

**Figura** (uma imagem, com legenda abaixo):

```
:::figura midia/mNN/NN-N-assunto.png "Texto alternativo"
Legenda em markdown.
:::
```

**Carrossel** (uma imagem por linha; o texto depois de `|` é o texto daquele passo):

```
:::slides
midia/mNN/NN-N-passo-1.png "Texto alternativo" | Texto do passo 1.
midia/mNN/NN-N-passo-2.png "Texto alternativo" | Texto do passo 2.
:::
```

**Guia de comandos CLI** (no fim de cada capítulo, em markdown; a saída de um comando vai num bloco `saida` logo depois dele):

````
:::cli Título do capítulo
### Assunto
```
get system status
```
```saida
FGT # get system status
Version: ...
```
Explicação do que a saída mostra.
:::
````

## 5. O laboratório local

O laboratório é o mesmo FortiGate simulado (um app React + Vite) usado nos módulos anteriores, rodando nesta máquina em `[CAMINHO DO LABORATÓRIO]`. Para usá-lo:

1. **Suba o app** em modo de desenvolvimento (veja o `package.json` do laboratório; normalmente `npm run dev`). A interface fica em `http://127.0.0.1:5173` e a API em `127.0.0.1:8088`. Se trocar de branch ou atualizar o código, reinicie o Vite.
2. **Capture com Playwright,** pela biblioteca do repositório do curso, `tools/captura/lab.cjs`.
   - Ela monta a topologia usando os módulos do próprio app.
   - Ela tira as fotos com recorte, destaque, escurecimento e ampliação.
   - Ela roda comandos no CLI Console da GUI.
   - Os scripts `tools/captura/m01.cjs` e `tools/captura/m02.cjs` mostram como usá-la (abrir a GUI, preencher formulários, fotografar menus, abrir o terminal de um computador, guardar as saídas da CLI em `saidas-cli.json`).
   - Crie `tools/captura/mNN.cjs` para este módulo no mesmo padrão.
3. **Cuidados que já conhecemos:**
   - Depois que a GUI é aberta no navegador de um computador do laboratório, uma cópia escondida dela continua montada. Use seletores com `:visible`.
   - Seletores de escolha única fecham ao clicar: fotografe antes do clique.
   - Para os cards do diagrama aparecerem completos, use uma janela maior (`s.tela(2400, 1500)`) antes de enquadrar.
   - O laboratório mostra FortiOS 8.0.x. Isso é intencional e não precisa ser corrigido.
4. **Se o laboratório não tiver um recurso, ou se comportar diferente de um FortiGate real:**
   - não invente telas nem saídas, e não edite imagens para simular;
   - anote o que falta e me avise no relatório final;
   - só altere o código do laboratório se eu pedir.

## 6. Entrega: o PDF

O resultado final é o **PDF do módulo**, com uma explicação didática do começo ao fim do assunto, apoiada nas imagens do laboratório sendo montado.

1. Escreva `conteudo/modulo-NN-<assunto>.md`.
2. Gere o PDF com a ferramenta do repositório, sem editar o PDF à mão:

   ```bash
   node tools/pdf/gerar-pdf.cjs --modulo conteudo/modulo-NN-<assunto>.md --saida pdf/modulo-NN.pdf
   ```

   O PDF tem:
   - capa e sumário;
   - títulos de capítulo e de seção em cards (`####` é título simples);
   - cada carrossel como passo a passo numerado, com **uma imagem por linha**;
   - cada Guia de comandos CLI como um quadro, com as saídas.
3. Antes de entregar:
   - confira se toda imagem citada existe e se não sobrou imagem sem uso;
   - abra páginas do PDF e verifique imagens, quadros e saídas;
   - gere o PDF de novo sempre que o texto ou as imagens mudarem.
4. Se o visualizador do curso (`visualizador/curso-fortigate.html`) estiver no repositório, inclua o módulo nele e confira se abre sem erros.

## 7. Relatório final

Ao terminar, me envie o PDF e um resumo com:

- o que foi acrescentado além dos slides, item por item, com o motivo (contexto ou informação importante) e a página do Study Guide;
- divergências entre os slides e o Study Guide, e possíveis erros nos slides;
- recursos que faltaram no laboratório ou que se comportaram diferente de um FortiGate real;
- o número de páginas e de imagens do módulo.

Nunca me peça para colar senhas, tokens ou chaves no chat.
