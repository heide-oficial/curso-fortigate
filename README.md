# Curso FortiGate Administrator

Material do curso de administração de FortiGate (FortiOS 8.0, preparação para o NSE 4).

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `grade.md` | Grade do curso (revisão 6): visão geral, cenário, convenções e a especificação de cada módulo |
| `conteudo/` | Um arquivo `.md` por módulo, com o conteúdo de estudo |
| `midia/mNN/` | Prints, vídeos e telas interativas de cada módulo, gerados a partir do laboratório |
| `visualizador/curso-fortigate.html` | Página que lê a grade e os módulos e exibe o curso com figuras, slides, vídeos e guias de comandos CLI |
| `tools/` | Scripts de pré-visualização e de captura de mídia |
| `docs/historico/` | Versões anteriores da grade |

## Pré-visualizar localmente

Requer Node 18 ou superior.

```bash
node tools/preview.mjs
```

Abra `http://localhost:8080`. O visualizador busca `grade.md`, os módulos em `conteudo/` e as mídias em `midia/` relativos à raiz do repositório.

## Convenções

As regras de escrita, o uso da CLI no texto e a sintaxe dos blocos `:::figura`, `:::slides`, `:::cli` e `:::interativo` estão na seção "Como usar esta grade para produzir o conteúdo" de `grade.md`.

## Mídias

As mídias são geradas a partir dos roteiros do modo aula do laboratório (repositório `fortigate-clone`). O script de captura executa o roteiro de cada módulo em 1920×1080 e grava os arquivos em `midia/mNN/`. Telas interativas usam um arquivo `.json` ao lado da imagem, com a posição e a explicação de cada elemento.
