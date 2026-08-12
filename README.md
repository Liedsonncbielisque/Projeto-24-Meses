# Nosso Projeto — 24 Meses

Aplicação web responsiva que transforma 24 meses de planejamento em uma jornada visual conectando três pilares: **dinheiro**, **experiências** e **memórias**.

## Funcionalidades

- **Início (Dashboard)** — mês atual, total guardado, meta, quanto falta, evolução financeira, projeção, próxima experiência e conquistas.
- **Nossas Saídas** — roleta gamificada com 44 experiências; sorteio nunca repete experiências já realizadas.
- **Meta 24 Meses** — edição do planejamento, timeline dos 24 meses e registro mensal (planejado × guardado × observação).
- **Nossa História** — timeline das experiências vividas, com filtros por ano.
- **Conquistas** — desbloqueio automático (primeira saída, 5/10/20 momentos, R$ 10 mil, 50% da meta, meta final).
- **Configurações** — meta, valor inicial, mês de início, duração, tema, exportar/importar backup JSON e reset com confirmação.

## Tecnologias

HTML5 · CSS3 · JavaScript ES6+ (módulos) · Chart.js · localStorage

Sem backend e sem frameworks. A camada de persistência (`state/storage.js`) é isolada para permitir migração futura para Supabase, PostgreSQL, Firebase ou API própria.

## Como executar

Por usar módulos ES6, sirva a pasta por HTTP (não abra via `file://`):

```bash
# opção 1
npx serve .

# opção 2
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Estrutura

```
nosso-projeto-24m/
├── index.html
├── config/app.config.js
├── frontend/
│   ├── assets/            (fonts, icons, images)
│   ├── css/               (main, components, pages, animations)
│   ├── js/
│   │   ├── app.js         (bootstrap + roteamento)
│   │   ├── data/          (defaults, outings, achievements)
│   │   ├── state/         (estado central + storage)
│   │   ├── calculations/  (financial, projections)
│   │   ├── features/      (roulette, timeline, achievements)
│   │   ├── ui/            (dashboard, meta, outings, history)
│   │   └── charts/        (charts.js)
│   └── views/             (templates HTML das páginas)
└── docs/arquitetura.md
```

## Dados

Tudo é persistido em `localStorage` sob a chave `nosso-projeto-24m`. Use **Configurações → Exportar meus dados** para gerar `nosso-projeto-backup.json`.
