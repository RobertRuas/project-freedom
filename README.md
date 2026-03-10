# Project Freedom

Aplicação front-end de streaming construída com React + Vite + Tailwind.

## Tecnologias

- React 18
- React Router 7
- Vite 6
- Tailwind CSS 4
- Lucide Icons

## Como executar

```bash
npm install
npm run dev
```

## Acesso por IP local (TV)

```bash
npm run tv
```

- Abra na TV usando o IP local exibido no terminal (porta `4173`).
- Se a TV não for detectada automaticamente, force o modo TV com:
  - `http://SEU_IP:4173/?tv=1`
- Para desativar o modo forçado:
  - `http://SEU_IP:4173/?tv=0`

## Build de produção

```bash
npm run build
```

## Estrutura principal

- `src/main.tsx`: ponto de entrada da aplicação.
- `src/app/App.tsx`: provedor de roteamento.
- `src/app/routes.ts`: definição central de rotas.
- `src/app/Layout.tsx`: layout base com sidebar + outlet.
- `src/app/pages/`: páginas de domínio (`Home`, `LiveTV`).
- `src/app/components/`: componentes visuais reutilizáveis.
- `src/app/data/content.ts`: dados mockados centralizados.
- `src/app/types/content.ts`: tipos compartilhados dos dados.

## Padrões adotados

- Comentários e documentação em português.
- Tipos centralizados para evitar duplicação.
- Dados mockados separados das páginas para facilitar manutenção.
- Componentes com melhorias básicas de acessibilidade (`aria-label`, `type="button"`).
- Fallback de imagem para reduzir quebras visuais em URLs externas.

## Auditoria

O relatório de auditoria está em `AUDITORIA.md`.
