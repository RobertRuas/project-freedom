# Auditoria Técnica Profunda da Aplicação

Data da auditoria: 9 de março de 2026.

## Escopo auditado

- Arquitetura de navegação e rotas.
- Camada de dados estáticos (`src/app/data`).
- Componentes de domínio (`Sidebar`, `ContentGrid`, `ContentList`, `FeatureGrid`).
- Páginas principais e páginas dinâmicas (`/filmes/:hash`, `/series/:hash`, `/player/:hash`).
- Estilos globais e compatibilidade para Smart TV (`src/styles/theme.css`).
- Build e entrega para navegador moderno e legado (`vite + plugin legacy`).

## Diagnóstico principal (causa raiz do problema na TV)

O comportamento reportado (“apenas imagens inteiras e sem conteúdo útil”) era consistente com dois fatores combinados:

1. Dependência implícita de CSS moderno (Tailwind v4 com `oklch` e `color-mix`) em navegadores de TV com suporte parcial.
2. Dependência histórica de imagens externas (URLs remotas), que aumenta chance de falhas visuais em TVs com rede restrita/bloqueios.

Em Smart TVs antigas, quando parte das regras de cor/opacidade não é interpretada, o texto pode perder contraste ou “sumir”, dando impressão de tela quebrada.

## Correções aplicadas nesta auditoria

### 1) Remoção total de dependência de imagens externas

Arquivo: `src/app/data/content.ts`

- Reescrita completa dos dados para usar apenas assets locais em `public/`.
- Padronização com helpers (`createGridItems`, `createListItems`) para simplificar manutenção por dev júnior.
- Mantido o comportamento de hash dinâmico por sessão para rotas e player.

Resultado:
- Não há mais `unsplash` ou equivalentes no `src`.
- Catálogo fica estável mesmo sem internet.

### 2) Hardening de compatibilidade TV no CSS

Arquivo: `src/styles/theme.css`

- Mantidos e ampliados fallbacks específicos para `html.tv-mode`.
- Inclusão de fallback explícito para:
  - texto (`text-white/*`, `text-green-*`, `text-red-*`),
  - fundos (`bg-white/*`, `bg-gray-800`, `bg-zinc-600/80`, `bg-emerald-700/85`, `bg-red-600`),
  - bordas (`border-white/*`).
- Fallback estrutural adicional com classes semânticas:
  - `.app-shell` para garantir fundo legível.
  - `.app-main` para garantir cor base de texto.

Resultado:
- Mesmo com suporte CSS parcial, layout e contraste continuam utilizáveis na TV.

### 3) Fortalecimento do layout base para fallback semântico

Arquivo: `src/app/Layout.tsx`

- Inclusão das classes `app-shell` e `app-main` no layout raiz.
- Essas classes servem como âncora para fallback no modo TV.

### 4) Execução recomendada para TV e acesso por IP

Arquivo: `package.json`

- Adicionados scripts:
  - `preview`: `vite preview --host 0.0.0.0 --port 4173`
  - `tv`: `npm run build && vite preview --host 0.0.0.0 --port 4173`

Resultado:
- Fluxo de uso em TV fica padronizado em produção (mais estável que `dev`).

## Validação executada

1. Build de produção:
- Comando: `npm run build`
- Status: sucesso.

2. Verificação de dependências externas:
- Busca por `unsplash` em `src` e `dist`.
- Status: sem ocorrência.

3. Validação de servidor de preview por IP local:
- `vite preview` subiu com endereço de rede local.
- Exemplo validado: `http://192.168.1.191:4173/`.

## Melhorias técnicas recomendadas (próxima etapa)

1. Criar modo explícito de plataforma (`tv`, `mobile`, `desktop`) via configuração central, não apenas user-agent.
2. Introduzir testes de snapshot visual por breakpoint (mobile/desktop/tv).
3. Adicionar fallback de vídeo real em `public/videos/sample.mp4` (arquivo atual é placeholder).
4. Remover componentes UI não utilizados do template base para reduzir bundle.
5. Adotar lint + format + teste no pipeline para impedir regressões de compatibilidade.

## Conclusão

A falha de TV foi tratada de forma estrutural:

- sem dependência externa de imagens,
- com fallback robusto de CSS para navegadores de TV,
- e com fluxo de execução padronizado por build de produção.

Com isso, a aplicação passa a ter comportamento previsível em Smart TVs com suporte parcial a recursos modernos do navegador.
