# Curso FortiGate 7.6

Material do Curso FortiGate 7.6: administração de FortiGate e preparação para o NSE 4 – FortiOS Administrator.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `grade.md` | Grade do curso (documento de produção, não vai para os alunos): regras de produção, cenário e a especificação de cada módulo |
| `conteudo/` | Um arquivo `.md` por módulo, com o conteúdo de estudo |
| `midia/mNN/` | Imagens, carrosséis e vídeos de cada módulo, gerados a partir do laboratório |
| `visualizador/curso-fortigate.html` | Página do aluno: lê a introdução e os módulos e exibe o curso com índice, figuras, carrosséis, vídeos, guias de comandos CLI e questões interativas |
| `tools/` | Scripts de pré-visualização e de captura de mídia |
| `docs/historico/` | Versões anteriores da grade |

## Pré-visualizar localmente

Requer Node 18 ou superior.

```bash
node tools/preview.mjs
```

Abra `http://localhost:8080`. O visualizador busca a introdução e os módulos em `conteudo/` e as mídias em `midia/` relativos à raiz do repositório.

## Convenções

As regras de escrita, o uso da CLI no texto, as regras de mídia e a sintaxe dos blocos `:::figura`, `:::slides`, `:::cli` e `:::quiz` estão na seção "Regras de produção do conteúdo" de `grade.md`. Elas valem para todos os módulos.

## Mídias

As mídias são geradas a partir dos roteiros do modo aula do laboratório (repositório `fortigate-clone`). O script de captura executa o roteiro de cada módulo em 1920×1080 e grava os arquivos em `midia/mNN/`: telas inteiras ou recortes ampliados (pelo menos 1920 px de largura), com o que não importa escurecido, uma imagem por passo para os carrosséis e vídeos MP4.
