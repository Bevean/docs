# CLAUDE.md — Central de Ajuda Bevean

> Arquivo de contexto para o Claude Code. Leia antes de qualquer tarefa.

## O que é este projeto

Site estático da Central de Ajuda da Bevean (substitui `ajuda.bevean.com`). O
conteúdo são arquivos JSON versionados no git, e a página é montada por um renderer
dirigido a schema — o mesmo padrão do editor de formulários e do editor de template
de e-mail do `admin-front`. Sem backend.

## Stack

- **Build:** Vite 7 + prerender próprio (`scripts/prerender.ts`), um HTML por rota
- **React:** 19 · **Router:** React Router 7 (modo biblioteca, não framework)
- **TypeScript:** 5.9 (strict) · **CSS:** Tailwind 4 com os tokens do `@pollux/react`
- **Validação de conteúdo:** Zod 4, **build-only** (não entra no bundle)
- **Busca:** MiniSearch, índice gerado no build

## Antes de escrever ou editar conteúdo

**Leia [AGENTS.md](AGENTS.md).** Ele tem o fluxo de criação de artigo, a referência
de todos os blocos com exemplos de JSON, as regras editoriais, o mapa de onde achar
matéria-prima nos repositórios irmãos e a tabela de erros do validador.

## Comandos

```bash
pnpm dev             # dev server; regenera o manifest ao salvar conteúdo
pnpm content:check   # valida o conteúdo — rode sempre ao terminar
pnpm content:new     # cria e registra um artigo
pnpm build           # valida, compila, pré-renderiza e confere o bundle
pnpm type-check && pnpm lint
```

## Regras que não se negociam

- Conteúdo inválido não vira site. Não relaxe o schema nem desative regra do
  validador para fazer um artigo passar.
- `zod` é build-only: em `src/`, só `import type`.
- Emoji não é estrutura: aviso é `callout`, passo numerado é `steps`.
- Sem capturas de tela nesta fase. O motivo e a condição de revisão estão no
  `AGENTS.md`.
- Nada é commitado sem pedido explícito.

## Estrutura

| Caminho | O que é |
|---|---|
| `content/pt-BR/` | O conteúdo. A rota é o caminho do arquivo |
| `schema/` | Schemas zod — fonte única do formato, build-only |
| `src/content/` | Contratos de bloco, registry e renderer |
| `scripts/` | Build do conteúdo, validação, prerender, scaffold |
| `plugins/` | Plugin do Vite que observa `content/` em dev |

Detalhes de arquitetura e publicação estão no [README.md](README.md).
