# AGENTS.md — como escrever documentação neste projeto

> Guia para agentes de IA (Claude, GPT, etc.) que vão **criar ou editar artigos**
> da Central de Ajuda. Leia antes de tocar em qualquer coisa dentro de `content/`.
>
> Para editar o **código** do site (blocos, renderer, build), veja a seção
> [Mexer no motor](#mexer-no-motor) no final.

## A regra de ouro

Conteúdo aqui é **dado validado**, não texto livre. O build recusa JSON inválido,
link quebrado, imagem ausente e artigo órfão. Isso é proposital: é mais barato
falhar no `content:check` do que publicar um artigo que ninguém acha.

**Nunca** contorne o validador — nem relaxando o schema, nem removendo a regra que
está incomodando. Se uma regra parece errada, diga isso e pare; não a desative.

Ao terminar qualquer edição de conteúdo, rode:

```bash
pnpm content:check
```

Só considere a tarefa concluída quando ele sair com `✔`.

---

## Criar um artigo

### 1. Escolha o lugar

A rota **é** o caminho do arquivo. Não existe campo `slug`.

```
content/pt-BR/<coleção>/<artigo>.json            → /ajuda/<coleção>/<artigo>
content/pt-BR/<coleção>/<seção>/<artigo>.json    → /ajuda/<coleção>/<seção>/<artigo>
```

Profundidade máxima é essa: coleção → seção → artigo. Não existe sub-seção.

As coleções são a arquitetura de informação do painel. Antes de criar uma nova,
confira se o assunto não cabe numa existente — a lista está em
`content/pt-BR/_index.json`.

### 2. Crie o esqueleto pelo comando, não à mão

```bash
pnpm content:new ferramentas/cashback
pnpm content:new configuracoes/whatsapp-oficial/conectar-numero
```

Ele cria o arquivo **e registra o slug na ordem explícita do pai**. Um arquivo que
ninguém listou não aparece no site e quebra o build (`R007`) — criar o JSON na mão
e esquecer de registrar é o erro mais comum.

### 3. Escreva o corpo

Substitua o `body` de exemplo pelos blocos reais. A referência completa está
abaixo. Enquanto escreve, o VS Code dá autocomplete e sublinha erro, porque o
arquivo aponta para o JSON Schema gerado (`pnpm content:schema` regenera).

### 4. Valide

```bash
pnpm content:check
```

---

## Cabeçalho do artigo

| Campo | Obrigatório | Observação |
|---|---|---|
| `title` | sim | Máx. 120 caracteres. O nome que aparece na listagem e no `<title>` |
| `updatedAt` | sim | `YYYY-MM-DD`. Data de hoje. O build recusa data no futuro (`L005`) |
| `body` | sim | Ao menos um bloco |
| `subtitle` | não | Uma frase dizendo o que a pessoa consegue fazer depois de ler |
| `tags` | não | Termos de busca que não aparecem no texto ("2FA", "coex") |
| `aliases` | não | Slugs antigos desta página; viram redirect 301 no build |
| `related` | não | Até 6 caminhos de conteúdo |
| `seo.description` | não | Se ausente, o `subtitle` é usado |
| `status` | não | `published` (padrão) ou `draft` |

Sempre atualize o `updatedAt` quando mexer no `body`.

---

## Texto: string ou nós tipados

Onde o schema pede texto, **uma string simples basta**:

```json
{ "type": "paragraph", "content": "Um parágrafo sem nenhuma ênfase." }
```

Use a forma de nós **só quando precisar** de negrito, link, código inline ou um
caminho de menu. O formato é o documento do TipTap, porque o editor visual futuro
será TipTap:

```json
{ "type": "paragraph", "content": [
  { "type": "text", "text": "Acesse " },
  { "type": "uiPath", "attrs": { "ref": "tools.forms" } },
  { "type": "text", "text": " e clique em " },
  { "type": "text", "text": "Publicar", "marks": [{ "type": "bold" }] },
  { "type": "text", "text": ". Veja também " },
  { "type": "text", "text": "como instalar o tracker",
    "marks": [{ "type": "docLink", "attrs": { "ref": "integracoes/tracker" } }] },
  { "type": "text", "text": "." }
]}
```

### Marcas (`marks`)

| Marca | Uso |
|---|---|
| `bold` | O termo que a pessoa vai procurar na tela. Não use para dar ênfase emocional |
| `italic` | Rótulo citado da interface ("clique em _Salvar_") |
| `code` | Nome de campo técnico, valor literal, cabeçalho HTTP |
| `link` | URL externa. **Precisa ser `https://`** — o schema recusa `http://` |
| `docLink` | Outro artigo, por caminho de conteúdo. Link quebrado derruba o build (`R001`) |

### Nós atômicos

| Nó | Uso |
|---|---|
| `uiPath` | Caminho de menu do painel. Use `{ "ref": "tools.forms" }`, que resolve pelo `_ui-map.json`. Só use `{ "segments": [...] }` quando o caminho for de um sistema de terceiro (Meta, Shopify) |
| `kbd` | Atalho de teclado: `{ "attrs": { "keys": ["Cmd", "K"] } }` |
| `hardBreak` | Quebra de linha dentro do mesmo parágrafo. Raro; prefira dois parágrafos |

**Caminho de menu novo?** Adicione a chave em `content/pt-BR/_ui-map.json` antes de
usar — `uiPath` desconhecido quebra o build (`R004`). Isso existe para que renomear
um menu do produto mexa em um arquivo, não em duzentos artigos.

---

## Referência dos blocos

### `paragraph`
```json
{ "type": "paragraph", "content": "Texto do parágrafo." }
```

### `heading`
`level` é `2` ou `3`. Nada de `h4` — se o artigo precisa de quatro níveis, ele
precisa é ser dois artigos.

```json
{ "type": "heading", "level": 2, "content": "Configurar o domínio" }
```

**Emoji em heading é erro de build.** O site atual usa 📌 ⚠️ ✅ 1️⃣ como se fossem
estrutura; aqui, aviso é `callout` e passo numerado é `steps`.

### `list`
```json
{ "type": "list", "style": "bullet", "items": [
  { "content": "Primeiro item." },
  { "content": "Item com sub-lista.", "children": {
    "type": "list", "style": "bullet", "items": [{ "content": "Aninhado." }]
  }}
]}
```
`style`: `bullet` | `ordered`. Use `ordered` para itens em ordem lógica que **não**
são um procedimento; procedimento é `steps`.

### `steps`
Procedimento que a pessoa executa na ordem. Mínimo de 2 passos — um passo sozinho
é um parágrafo.

```json
{ "type": "steps", "items": [
  { "title": "Abra as configurações do canal",
    "body": [{ "type": "paragraph", "content": "Detalhe do passo." }] },
  { "title": "Clique em Conectar" }
]}
```
A numeração vem do CSS. **Nunca** escreva "1." no `title`.

### `callout`
```json
{ "type": "callout", "variant": "warning", "title": "Opcional",
  "body": [{ "type": "paragraph", "content": "Texto do aviso." }] }
```

| `variant` | Quando usar |
|---|---|
| `info` | Contexto que ajuda, mas não muda o que fazer |
| `tip` | Atalho ou boa prática |
| `success` | Pré-requisito ou confirmação: "antes de investigar, confirme três coisas" |
| `warning` | Limitação, comportamento inesperado, custo |
| `danger` | Ação destrutiva ou irreversível |

Um callout por ideia. Três callouts seguidos viram ruído e o leitor para de vê-los.

### `image`

> **Nesta fase, não use.** A Central de Ajuda nasce sem capturas de tela — veja
> [Por que não há prints](#por-que-não-há-prints). O bloco continua no schema
> para quando essa decisão for revista.

```json
{ "type": "image", "src": "./assets/listagem.png",
  "alt": "Listagem de formulários com os selos de status",
  "width": 1271, "height": 907,
  "caption": "Legenda opcional.", "capturedAt": "2026-09-02" }
```

- `src` é **relativo ao arquivo do artigo**; as imagens ficam em `assets/` ao lado dele.
- `width`/`height` são obrigatórios e **conferidos contra o arquivo real** (`R006`).
  Sem eles o layout salta durante o carregamento. Se não souber, leia com
  `image-size` em vez de chutar.
- `alt` descreve o que a imagem mostra, não o nome do arquivo. Vazio é erro.
- `capturedAt` alimenta o relatório de captura velha — screenshot de painel envelhece.
- `frame`: `shadow` (padrão) | `none` | `browser`.

### `table`
Todas as linhas precisam do mesmo número de colunas do cabeçalho.

```json
{ "type": "table",
  "head": [{ "content": "Status" }, { "content": "Aparece na loja?" }],
  "rows": [
    [{ "content": "Publicado" }, { "content": "Sim" }],
    [{ "content": "Pausado" }, { "content": "Não" }]
  ]}
```
Tabela é a melhor forma para matriz (status × comportamento, integração × recurso).
Não use para dois pares de chave-valor — isso é uma lista.

### `faq`
```json
{ "type": "faq", "items": [
  { "question": "Editei e nada mudou. Por quê?",
    "answer": [{ "type": "paragraph", "content": "Resposta." }] }
]}
```
Use no fim do artigo, para "problemas comuns". Renderiza com `<details>` nativo,
então abre sem JavaScript.

### `code`
```json
{ "type": "code", "language": "bash", "filename": "opcional.sh", "code": "pnpm build" }
```
`language`: `json` | `bash` | `http` | `html` | `javascript` | `typescript` | `csv` | `text`.

### `video`
```json
{ "type": "video", "provider": "youtube", "videoId": "abc123", "title": "Como conectar" }
```
`title` é obrigatório — é o que o leitor de tela anuncia.

### `linkCards`
```json
{ "type": "linkCards", "title": "Próximos passos", "items": [
  { "ref": "ferramentas/formularios", "description": "Capturar leads no site." }
]}
```
O título do cartão vem do artigo referenciado, não se escreve à mão.

### `divider`
```json
{ "type": "divider" }
```
Separa blocos temáticos grandes. Se você precisa de mais de um por artigo, o
artigo provavelmente são dois.

### Onde cada bloco pode aparecer

Dentro de `callout.body`, `steps[].body` e `faq[].answer` só entram:
`paragraph`, `list`, `image`, `code`, `table`, `divider`.

Sem `steps` dentro de `steps`, sem `heading` dentro de `callout`.

---

## Como escrever

O leitor é quem opera o CRM, não quem o construiu.

1. **Comece pelo resultado, não pelo mecanismo.** "Capture leads no seu site sem
   mexer no código da loja", não "O módulo de formulários renderiza via tracker".
2. **Diga onde fica.** Todo artigo sobre uma tela abre com um `uiPath`.
3. **Escreva os rótulos exatos da interface.** Se o botão diz "Conectar com Meta",
   não escreva "clique em conectar à Meta". A pessoa está procurando na tela.
4. **Prefira a tabela ao parágrafo** quando a informação for matriz.
5. **Não invente comportamento.** Se não confirmou no código ou na tela, não
   escreva. Deixe a lacuna explícita para quem revisar.
6. **Não documente o que não existe.** Recurso em roadmap não entra.
7. **Português direto.** Evite "simplesmente", "apenas", "basta" — o que é óbvio
   para quem escreveu raramente é para quem lê.
8. **Um artigo, uma tarefa.** Se o título precisa de "e", provavelmente são dois.

A estrutura recomendada por tipo de artigo está em
[Anatomia de um artigo](#anatomia-de-um-artigo).

---

## Anatomia de um artigo

Antes de escrever, decida **qual dos três tipos** você está fazendo. Cada um tem
uma ordem que funciona, descoberta escrevendo a seção de Formulários.

### Conceito ("Como funciona X")

```
parágrafo: o que é, em uma frase, do ponto de vista do resultado
parágrafo: "Onde fica:" + uiPath
imagem da tela principal
heading: o que isso produz          → tabela
heading: pré-requisitos             → tabela do que falta + callout do que engana
heading: as variações               → tabela comparativa
heading: os estados                 → tabela status × comportamento
```

### Tarefa ("Criar e publicar", "Instalar no site")

```
parágrafo: o resultado e a condição de conclusão
heading: o passo a passo            → bloco steps, sem detalhe demais em cada passo
heading: a tela                     → imagem + tabela das regiões
heading: as decisões                → uma seção por decisão que o passo a passo adiou
heading: o que impede de concluir   → tabela mensagem × solução
```

### Diagnóstico ("O formulário não está funcionando")

```
parágrafo: os básicos que resolvem a maioria dos casos
heading: um por sintoma, com o título na voz de quem reclama
  → tabela numerada "#, verifique, se for isso"
heading: outras perguntas           → bloco faq
```

### Seção ou artigo?

Se a fonte tem mais de oito assuntos de primeiro nível, ela é uma **seção**, não
um artigo. A doc interna de Formulários tinha 557 linhas e virou sete artigos: a
pessoa chega buscando um problema específico, não lendo um manual.

Divida por **pergunta que o leitor tem**, nunca pela organização interna do
produto. "Quando o pop-up aparece" é um artigo; "Aba Comportamento" não é.

---

## Padrões descobertos escrevendo

> Lista viva. Ao escrever um artigo novo e descobrir uma regra que valeria para
> os próximos, acrescente aqui.

**Traduza a voz da fonte.** A documentação interna fala *sobre* o cliente, para o
time de suporte. O artigo fala *com* o cliente. Some com "erro comum de cliente",
"o suporte deve", "ao escalar um ticket" e com as seções de referência técnica
para atendimento.

**Não migre nomes internos.** `customer.emailOptinStatus`, nome de tabela, chave
de `localStorage`, rota de API — nada disso ajuda quem opera a loja. A exceção é
quando a chave é acionável para o leitor (limpar o armazenamento para testar de
novo), e aí ela vira instrução, não referência.

**Título de callout é uma frase com a conclusão**, não um rótulo. "Várias regras
se somam, não se alternam" ensina; "Atenção" não ensina nada.

**Mensagem de erro da interface vira linha de tabela, escrita literalmente.** A
pessoa copia a mensagem e cola na busca — é assim que ela acha o artigo. Uma
tabela "mensagem × o que resolve" vale mais que três parágrafos.

**Comportamento contra-intuitivo merece `callout`, e o motivo junto.** Se o
produto faz algo que o leitor não esperaria, diga também *por que* — "o sorteio é
por e-mail para impedir que a pessoa gire até ganhar o melhor prêmio" evita o
ticket de "está viciado".

**Limite entra onde a pessoa configura**, não numa tabela de limites no fim. A
faixa de 10% a 90% do scroll pertence à tabela de disparo.

**Cross-link no lugar de repetir.** Cada artigo da seção cita os vizinhos com
`docLink`. Repetir a explicação em dois artigos garante que um dos dois vai ficar
desatualizado.

**Recurso que não existe só entra quando a expectativa é frequente**, e como
pergunta no bloco `faq` ("Como exporto as submissões?"), nunca como uma lista de
ausências.

**Tabela comparativa precisa de canto rotulado.** A primeira célula do cabeçalho
não pode ficar vazia — o validador recusa, e um leitor de tela anunciando coluna
sem nome não ajuda ninguém. Use o nome do eixo ("Característica").

**Nomeie o artigo pela tarefa ou pela pergunta**, com as palavras do leitor. "O
formulário não está funcionando" acha mais gente que "Solução de problemas".

**A fonte interna agrupa por quem dá suporte, não por quem lê.** A doc de Links
cobre duas telas de módulos diferentes — o gerador em Ferramentas e a origem da
conversa no Atendimento — porque o atendente lida com as duas no mesmo ticket.
Quem lê não. Ao converter, pergunte em qual coleção o leitor procuraria, não em
qual arquivo a informação estava.

**Quando a resposta é "duas coleções", escolha a que já tem conteúdo** e deixe o
resto cross-linkado. Mandar o leitor para uma coleção vazia é pior que agrupar
imperfeitamente. Foi o caso de `origem-da-conversa`, que conceitualmente pertence
a Atendimento e hoje mora em Ferramentas › Gerador de Links.

Quando chegar a hora de mudar o artigo de lugar, o `aliases` do destino é o que
preserva o endereço: ele lista os caminhos antigos da página. Não dá para
pré-registrar — o alias aponta do caminho antigo para o atual, então só existe
depois da mudança.

---

## Por que não há prints

Decisão do MVP: **nenhum artigo leva captura de tela.** A regra não tem exceção,
de propósito — "só em alguns casos" exige julgamento de quem escreve, e quem
escreve o próximo artigo pode ser outra pessoa ou outro agente.

O que sustenta a decisão:

- **Print é o conteúdo que envelhece mais rápido.** O painel muda toda semana; o
  artigo, não. Uma captura de tela cheia ainda amarra o artigo ao menu lateral
  inteiro — um item novo no menu invalida todas de uma vez.
- **Tabela costuma dizer mais.** Nos quatro prints que a seção de Formulários
  tinha, três eram cobertos por uma tabela logo abaixo. Tabela é mais precisa,
  entra no índice de busca e não precisa ser refeita.
- **O bloco `uiPath` já responde "onde fica"** em uma linha, e se atualiza pelo
  `_ui-map.json` quando o menu do produto muda de nome.
- **Captura de ambiente local mostra o que não deveria**: nomes de teste como
  "Formulário sem nome2", itens de menu marcados "Em breve", módulos que o leitor
  não contratou. Numa central pública, isso ensina errado.

### Quando revisitar

Quando as quatro condições abaixo estiverem resolvidas — não antes:

1. Um **tenant de demonstração** com dados críveis (nomes, produtos e datas que
   pareçam de uma loja de verdade), não seed de desenvolvimento.
2. **Recorte da região** relevante em vez de tela cheia, para a imagem não
   depender do resto do painel.
3. Uma decisão sobre **tema**: a captura fica sempre em claro ou escuro, e o site
   tem os dois.
4. Um **dono da recaptura** — quem refaz as imagens quando a UI muda, e como
   descobre quais artigos são afetados. O campo `capturedAt` e um relatório de
   captura velha existem para isso.

A perda conhecida dessa decisão: a visão geral de uma tela complexa, como o
editor de formulários, é o único caso em que a imagem fazia trabalho que o texto
não faz. Hoje isso é descrito em prosa, e é uma descrição pior que a imagem.

---

## Onde achar a matéria-prima

Antes de escrever do zero, procure a fonte nos repositórios irmãos:

| Assunto | Fonte |
|---|---|
| Gerador de Links, Tracker, Webhooks | `admin-front/apps/crm/src/modules/backoffice/docs/content/*.md` — já em PT-BR, escrito para o time de suporte. **Formulários já foi convertido**: use `content/pt-BR/ferramentas/formularios/` como referência de como traduzir a voz e dividir em artigos |
| Instalar o tracker, carrinho abandonado | `monocore-api/docs/integrations/tracker-guia-suporte.md` — versão sem jargão, com matriz por plataforma |
| Primeiros passos | `admin-front/apps/crm/src/modules/onboarding/` (`locales/pt.json` + `data/onboarding-flow.ts`) — 9 trilhas com copy pronta |
| Relatórios | `admin-front/apps/reports-react/src/shared/i18n/locales/pt.json`, chave `analysisCatalog` — 37 análises com "o que responde" |
| Conectar cada integração | `admin-front/apps/crm/src/modules/integration/apps/<handle>/<handle>-instructions.tsx` — 22 telas com passo a passo |
| O que cada integração sincroniza | `monocore-api/apps/migrator/MIGRATOR_GUIDE.md`, seção 7 |
| Nomes exatos dos menus | `admin-front/apps/crm/src/shared/components/sidebar-main/` (`sidebar-main-data.tsx` + `locales/pt.json`) |
| Rotas e payloads da API | `monocore-api/apps/crm/OVERVIEW.md` |

Rótulo de tela **sempre** vem do `pt.json` do módulo, nunca da memória.

---

## Erros do build e o que fazer

| Código | Significado | Correção |
|---|---|---|
| `S00x` | O JSON não bate com o schema | Leia a mensagem: ela aponta o caminho exato (`body.3.items.1.title`) |
| `R001` | `docLink` aponta para artigo inexistente | O erro sugere o caminho parecido. Confira o caminho, não invente |
| `R003` | `related` ou destaque órfão | Idem |
| `R004` | `uiPath` fora do `_ui-map.json` | Adicione a chave no `_ui-map.json` |
| `R005` | Imagem não existe | Confira o caminho relativo e se o arquivo foi copiado para `assets/` |
| `R006` | `width`/`height` divergem do arquivo | Use as dimensões reais |
| `R007` | Artigo no disco não listado no pai | Adicione o slug em `articles` do `_collection.json`/`_section.json` |
| `R008` | Listado mas não existe no disco | Crie o arquivo ou tire da lista |
| `R009` | Seção e artigo com o mesmo slug | Renomeie um dos dois — a rota fica ambígua |
| `R010` | Alias colide | Escolha outro alias |
| `L005` | `updatedAt` no futuro | Use a data de hoje |
| `L008` (aviso) | Artigo longo sem heading | Adicione headings; sem eles o sumário fica vazio |

---

## Mexer no motor

Se a tarefa exige um **tipo de bloco novo** (e não apenas conteúdo), toque nestes
quatro pontos — e em nenhum outro:

1. `schema/blocks.zod.ts` — o schema zod e a entrada em `BLOCK_TYPES`
2. `schema/index.ts` — o tipo e sua entrada na união `Block`
3. `src/content/blocks/<nome>.tsx` — o contrato, via `defineBlock`
4. `src/content/blocks/blocks-registry.ts` — registre o contrato

Três travas de tipo quebram a compilação se você esquecer qualquer um deles.

Antes de criar um bloco, pergunte se o conteúdo não cabe num existente. Um bloco a
mais é um bloco a mais no editor visual, na busca e na cabeça de quem escreve.

**Não crie um bloco `html`.** Escape hatch de HTML cru mata o editor visual antes
de ele nascer, produz deriva de estilo e abre XSS.

### Regras do código

- `zod` é **build-only**. Em `src/`, importe schemas só com `import type` — o lint
  bloqueia e `pnpm check:bundle` falha se a biblioteca vazar para o bundle.
- Todo bloco novo precisa de `toPlainText`, senão ele fica invisível na busca.
- Nada de `setState` dentro de `useEffect`; estado externo é `useSyncExternalStore`.
- Antes de encerrar: `pnpm content:check && pnpm type-check && pnpm lint && pnpm build`.
