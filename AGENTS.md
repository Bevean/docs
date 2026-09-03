# AGENTS.md — como escrever documentação neste projeto

> Guia para agentes de IA (Claude, GPT, etc.) que vão **criar ou editar artigos**
> da Central de Ajuda. Leia antes de tocar em qualquer coisa dentro de `content/`.
>
> Para editar o **código** do site (blocos, renderer, build), veja a seção
> [Mexer no motor](#mexer-no-motor) no final.

## As duas regras acima de todas

O validador cuida da forma. Estas duas cuidam do conteúdo, e nenhuma máquina
consegue verificá-las por você.

### 1. Nunca invente

**Só escreva o que você confirmou no produto.** Rótulo de botão, mensagem de erro,
limite numérico, nome de campo, ordem dos passos — tudo isso se verifica, e tudo
isso é tentador de preencher com o que "faz sentido".

Um artigo que manda clicar num botão que não existe é pior que artigo nenhum:
gera exatamente o ticket que a documentação existia para evitar, e queima a
confiança em todo o resto da central.

Onde confirmar cada coisa:

| O que | Onde está a verdade |
|---|---|
| Rótulo de tela, texto de botão, nome de menu | O `pt.json` do módulo em `admin-front`, nunca a memória |
| Mensagem de erro | O código que a emite, escrita literalmente |
| Limite, faixa, quantidade máxima | A validação no código, não o que parece razoável |
| Comportamento em caso de borda | O código do fluxo, ou a doc interna de suporte |

**Quando não der para confirmar, não escreva.** Deixe a lacuna e diga na resposta
ao usuário o que ficou de fora e por quê. Nunca deixe um marcador de dúvida dentro
do artigo — o que está em `content/` é publicado.

As três coisas que mais se inventa sem perceber: um limite ("até 10 itens"), um
rótulo aproximado ("clique em Salvar" quando o botão diz "Salvar alterações"), e um
passo intermediário que parece óbvio mas não existe na tela.

### 2. Escreva para quem usa, não para quem construiu

Quem lê opera uma loja. Não tem acesso ao código, ao banco nem ao painel interno,
e não quer saber como o produto funciona por dentro — quer resolver o que veio
fazer.

O teste é sempre o mesmo: **se o leitor não pode fazer nada com essa informação,
corte.**

Note que isso não é "evite conteúdo técnico". O seletor CSS do disparo por clique
e a tag `<div data-bevean-form>` são técnicos e precisam estar no artigo — a pessoa
digita aquilo. O que sai é o técnico que ela não pode acionar.

| Fica | Sai |
|---|---|
| A tag que a pessoa cola no tema da loja | O nome da tabela onde o formulário é gravado |
| "Fatias sem cupom são descartadas" | O nome do serviço que faz o descarte |
| "Limpe os dados do site para testar de novo" | O nome da chave em `localStorage` |
| O nome exato do campo na tela | O nome da propriedade no banco (`customer.emailOptinStatus`) |
| "Só WhatsApp Oficial recebe esse dado" | Como o webhook da Meta é processado |

O mesmo vale para a voz: a doc interna fala *sobre* o cliente, para o time de
suporte. O artigo fala *com* o cliente. Some com "erro comum de cliente", "o
suporte deve" e as seções de escalar ticket.

O `content:check` avisa (`L009`) quando encontra propriedade em camelCase, nome de
tabela ou chave interna no texto. É heurística e cobre só o caso mais grosseiro —
a regra continua sendo sua. Bloco de código fica de fora da checagem, porque é
ali que conteúdo técnico é legítimo.

**Explique o "porquê" quando ele muda o que a pessoa faz.** "O sorteio é por
e-mail para impedir que a pessoa gire até ganhar o melhor prêmio" evita um ticket.
"O sorteio usa um hash do e-mail" não evita nada.

---

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
5. **Não documente o que não existe.** Recurso em roadmap não entra — veja
   [as duas regras acima de todas](#as-duas-regras-acima-de-todas).
6. **Português direto.** Evite "simplesmente", "apenas", "basta" — o que é óbvio
   para quem escreveu raramente é para quem lê.
7. **Um artigo, uma tarefa.** Se o título precisa de "e", provavelmente são dois.

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

**A ajuda embutida da tela já é conteúdo pronto.** Texto de apoio de campo,
placeholder, descrição de opção e tooltip de indicador de relatório foram escritos
para o usuário final, e conferem por construção. Traduza a voz e corte o que só
serve dentro do formulário; não reescreva do zero o que a tela já explica bem.

**Faixa de validação vira tabela "campo × faixa aceita".** Onde o botão de salvar
apenas desabilita, sem dizer o motivo, a pessoa fica presa sem ter o que pesquisar.
A tabela sai da condição que habilita o botão, e costuma ser a informação mais
valiosa de um artigo de configuração.

**Lista de plataformas suportadas sai do código da integração**, nunca da memória
nem do material de venda. No Cashback, quais lojas permitem gerar o cupom do resgate
está nas capacidades declaradas por cada integração — e uma delas tem a capacidade
marcada como pendente no próprio código, o que a mantém fora da lista.

**Referência a outro artigo dentro de célula de tabela também é `docLink`.** Citar
o título em texto puro numa célula deixa o leitor no meio de um diagnóstico sem
saída — e é fácil de deixar passar, porque a frase parece completa.

**Rótulo traduzido não prova que o estado existe.** A lista de tipos de lançamento
do Cashback oferece um "Expiração" que nada no produto chega a criar: o rótulo está
no `pt.json`, o valor está no enum, e nenhum código o produz. Antes de virar linha
de tabela, confirme que existe código criando aquele estado — enum e tradução
sobrevivem a mudanças que apagaram o comportamento.

**O mesmo vale para um recurso inteiro, não só um valor de enum.** Documentando
Domínios, o registro de DNS "CDN" é criado automaticamente (Cloudflare, SES) mas
nenhum outro módulo do backend chega a consultá-lo — provisionado, sem consumidor.
Antes de prometer o que um recurso desbloqueia, confirme que outro lugar do código
realmente o lê.

**Para achar "o que depende disto", busque pelo TIPO no resto do código — não leia
só o módulo da própria funcionalidade.** A dependência de Domínios em Canais de
e-mail e em Links não aparecia em nenhum arquivo do módulo `domain`; apareceu
buscando `DomainType.EMAIL` e `DomainStatus.VERIFIED` nos módulos que os consomem.
Isso importa especialmente para as funcionalidades que são "insumo" de outras
(Canais, Integrações): a lista do que elas destravam está espalhada, e ler só a
própria tela subestima o alcance real.

**Confira se o botão faz o que o rótulo promete — não assuma pela UI.** Documentando
o WhatsApp Oficial, o botão "Reconectar" do painel manda `token`/`wabaId`/`phoneId`
novos para o backend, mas o método que os recebe não tem nenhum tratamento para esse
tipo de canal e devolve o registro inalterado. A UI parece completa; só o rastreio no
serviço do backend (não no componente, não na rota) mostra que a ação não muda nada.
Quando isso acontece: não descreva a ação como se resolvesse o problema — descreva
só o caminho que você confirmou que funciona (aqui, remover e conectar de novo), e
avise o usuário do achado separadamente da tarefa de documentação — não é uma
decisão de conteúdo, é um bug em produção.

**O rótulo do mesmo botão pode mudar conforme o estado anterior da tela.** No
WhatsApp Web, o botão que reconecta um número mostra "Conectar" ou "Reconectar"
dependendo de uma checagem de status ter rodado antes — os dois chamam exatamente o
mesmo handler. Descreva a ação ("clique no botão de conectar ao lado do número"), não
garanta um texto fixo que só aparece em parte dos casos.

**Duas ações que parecem a mesma coisa podem ter caminhos diferentes no código.**
No WhatsApp Oficial, "remover a conta inteira" e "remover um número" chamam rotas
diferentes — só a segunda mostra os fluxos e comunicações vinculados antes de
confirmar. Quando a tela tem mais de um botão para o que parece a mesma ação
(excluir, remover, desconectar), confira CADA um no código antes de descrever os
dois como equivalentes.

**Quando o artigo de destino ainda não existe, escreva o texto plano e volte
depois.** Aconteceu duas vezes: Links citando Domínios antes de Domínios existir, e
Domínios citando o canal de E-mail antes dele existir. Nos dois casos o texto ficou
sem `docLink` (que quebraria o build) até o artigo nascer — e a volta para converter
em link, quando a seção seguinte foi escrita, é o que fecha o ciclo. Ao escrever uma
seção nova, vale checar se algum artigo anterior já a menciona em texto plano.

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

### Quando não existe doc interna do assunto

Foi o caso de Cashback: nenhum `.md`, só o produto. A receita que funcionou, nessa
ordem — cada camada responde uma pergunta diferente, e nenhuma responde as três:

1. **`locales/pt.json` do módulo** → os rótulos, os textos de ajuda dos campos, as
   mensagens de erro e de sucesso. É o material mais bem escrito que existe, porque
   já foi redigido para o usuário final por quem construiu a tela.
2. **O componente da tela** (`components/*.tsx`) → as regras da interface: o que
   desabilita o botão de salvar, o que só aparece em certa condição, os valores
   padrão dos campos.
3. **O serviço no backend** → o comportamento que a tela não mostra: o que dispara,
   o que é ignorado, o que acontece no cancelamento, em que ordem as coisas saem.

O rótulo de menu é a exceção: ele vem do `sidebar-main-data.tsx` e do `pt.json` do
sidebar, **nunca** de uma frase escrita dentro de outro módulo. Uma mensagem do
editor de automações manda "configure em Créditos › Cashback", e esse menu não
existe — o caminho real é Ferramentas › Cashback.

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
| `L009` (aviso) | Nome interno no texto do artigo | Troque pelo nome que aparece na tela, ou corte. Blocos de código não são checados |
| `R012` | Nome de ícone desconhecido | Use um dos registrados, ou registre o novo em `src/app/content-icons.ts` |

Além do validador, `pnpm build` roda o `check:bundle`:

| Falha | O que significa | O que fazer |
|---|---|---|
| `carregamento inicial em … KB gzip, acima do orçamento` | Cresceu o **código** do site, não o conteúdo: cada artigo é um chunk próprio e não entra nessa conta. Quase sempre é dependência nova | Não é problema de conteúdo — escrever artigo não move esse número. Avise o usuário |
| `zod vazou para o bundle` | Algum `import` de schema em `src/` deixou de ser `import type` | Corrija o import; nunca relaxe a checagem |

Escrever artigo mexe só no chunk daquele artigo e numa linha do manifest. Se um
artigo novo estourar o orçamento, é sinal de que algo está errado no motor.

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

### O corpo do artigo é assíncrono

`getArticle` lê do cache e é **síncrono**; `loadArticleDoc` carrega o chunk e é
**assíncrono**. Todo caminho que renderiza um artigo passa antes por
`preloadRouteContent`: o prerender (via `prepare`, no `entry-server.tsx`) e a
hidratação (no `entry-client.tsx`). Sem isso o React suspenderia no meio de um
render síncrono, que é erro e não espera.

Se você criar uma página nova que mostre corpo de artigo, ela precisa ficar dentro
do `ArticleBoundary` — ou aquecer o cache antes.

### Regras do código

- `zod` é **build-only**. Em `src/`, importe schemas só com `import type` — o lint
  bloqueia e `pnpm check:bundle` falha se a biblioteca vazar para o bundle.
- Todo bloco novo precisa de `toPlainText`, senão ele fica invisível na busca.
- Nada de `setState` dentro de `useEffect`; estado externo é `useSyncExternalStore`.
- Antes de encerrar: `pnpm content:check && pnpm type-check && pnpm lint && pnpm build`.
