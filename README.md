# Central de Ajuda Bevean

Site estático da Central de Ajuda. O conteúdo são arquivos JSON versionados no git,
e a página é montada por um renderer dirigido a schema — o mesmo padrão do editor de
formulários e do editor de template de e-mail do `admin-front`.

Substitui https://ajuda.bevean.com, preservando o formato de rota
`/ajuda/<coleção>/<seção>/<artigo>`.

## Comandos

```bash
pnpm dev                 # servidor de desenvolvimento (regenera o manifest ao salvar conteúdo)
pnpm build               # valida, compila, pré-renderiza uma página por rota e confere o bundle
pnpm content:check       # valida o conteúdo e confere os exemplos do AGENTS.md
pnpm content:new <path>  # cria e registra um artigo: pnpm content:new ferramentas/cashback
pnpm content:schema      # regenera os JSON Schemas que dão autocomplete no VS Code
pnpm lint && pnpm type-check
```

## Como o conteúdo funciona

```
content/pt-BR/
├── _index.json                    # ordem das coleções + destaques da home
├── _ui-map.json                   # caminhos de menu do painel ("Painel › Ferramentas › Formulários")
└── ferramentas/
    ├── _collection.json           # título, descrição e a ordem explícita dos filhos
    ├── formularios.json           # o artigo
    └── assets/                    # imagens do artigo, ao lado dele
```

**A rota é o caminho do arquivo.** `ferramentas/formularios.json` vira
`/ajuda/ferramentas/formularios`. Não existe campo `slug` — renomear o arquivo é
renomear a URL, e o `aliases` do artigo mantém o endereço antigo funcionando.

**Ordem é explícita.** Um artigo só aparece se estiver listado no `_collection.json`
ou `_section.json` do seu pai. Arquivo no disco que ninguém listou é erro de build,
não conteúdo invisível.

### Escrever um artigo

O corpo é uma lista de blocos. Onde o schema espera texto, uma string simples basta:

```json
{ "type": "paragraph", "content": "Um parágrafo sem nenhuma ênfase." }
```

Para negrito, link ou um caminho de menu, o texto vira nós tipados — o mesmo formato
de documento do TipTap, porque o editor visual da fase futura será TipTap:

```json
{ "type": "paragraph", "content": [
  { "type": "text", "text": "Acesse " },
  { "type": "uiPath", "attrs": { "ref": "tools.forms" } },
  { "type": "text", "text": " e clique em " },
  { "type": "text", "text": "Conectar", "marks": [{ "type": "bold" }] }
]}
```

Blocos disponíveis: `paragraph`, `heading`, `list`, `steps`, `callout`, `image`,
`video`, `code`, `table`, `faq`, `linkCards`, `divider`.

**Emoji não é estrutura.** Um heading não pode começar com emoji — o build recusa.
Passo numerado é `steps`, aviso é `callout`. A numeração dos passos vem do CSS, nunca
do texto.

## Para agentes de IA

O guia de autoria está em [AGENTS.md](AGENTS.md): fluxo de criação, referência de
todos os blocos com JSON de exemplo, regras editoriais, mapa de matéria-prima nos
repositórios irmãos e tabela de erros do validador. Os exemplos de lá são
verificados contra o schema pelo `pnpm content:check`, então eles não envelhecem
em silêncio.

## Arquitetura

| Peça | Onde | O que faz |
|---|---|---|
| Schema | `schema/*.zod.ts` | Fonte única do formato. **Build-only**: o app importa só os tipos, com `import type` |
| Contrato de bloco | `src/content/block-contract.ts` | Espelha o `EditorModuleContract` do editor de e-mail, em modo leitura |
| Registry | `src/content/blocks/blocks-registry.ts` | `type` → contrato, com três travas de tipo contra deriva |
| Renderer | `src/content/renderer/` | Percorre a árvore; a recursão passa por React, não por import |
| Build | `scripts/content-build.ts` | Valida (estrutural + grafo) e monta o manifest |
| Prerender | `scripts/prerender.ts` | Um HTML por rota, com `<head>` montado a partir do manifest |

### Por que prerender próprio

`vite-react-ssg` não funciona com React Router 7 (importa `react-router-dom/server.js`,
que não existe mais na v7) e só opera preso à v6. Como todas as rotas são conhecidas no
build e o `<head>` de cada uma é função pura do manifest, montá-lo no script é mais
simples e mais confiável que uma lib de head em runtime.

### zod não entra no bundle

O conteúdo é validado no build; em runtime já é dado confiável. Uma regra de ESLint
bloqueia o import de valor em `src/`, e `pnpm check:bundle` falha se a assinatura do zod
aparecer em `dist/assets/*.js` — inclusive por dependência transitiva.

## Publicação

A saída é `dist/`, estática. O host precisa resolver URL sem extensão para o
`index.html` do diretório (`/ajuda/x` → `/ajuda/x/index.html`) — Cloudflare Pages e
Netlify fazem isso por padrão; S3 + CloudFront precisa de uma function. O build também
emite `sitemap.xml`, `robots.txt` e `_redirects`.

> `vite preview` **não** faz essa resolução: em desenvolvimento, use a barra final
> (`/ajuda/x/`) ou você cai no fallback da SPA.

## O que ainda não existe

- Conteúdo: a seção `ferramentas/formularios` está escrita (7 artigos). As outras 9
  coleções estão como marcadores, com estado vazio próprio.
- Editor visual. O campo `editor` de cada contrato já declara os controles; falta ligar
  o painel, no molde do `settings-loader` do `admin-front`.
- Testes automatizados do renderer.
