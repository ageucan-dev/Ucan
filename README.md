# Landing page U Can — Negócios Locais

Landing page independente para captação de negócios locais, incluindo advocacia, clínicas de estética, medicina e odontologia.

O projeto é publicado em `/negocios-locais/` e não substitui o site principal da U Can.

## Endereço

`https://ucanmkt.com.br/negocios-locais/`

A exportação usa `basePath` e `assetPrefix` em `/negocios-locais`, permitindo publicar em uma subpasta.

## Conversão e mensuração

O formulário solicita nome, WhatsApp e segmento. Cidade e principal desafio são opcionais. Após o envio, abre o WhatsApp com uma mensagem preenchida para a pessoa revisar.

A página envia eventos sem dados pessoais ao dataLayer/GTM, incluindo início e envio do formulário, `generate_lead`, cliques de CTA e `lead_form_whatsapp`. O GTM existente é mantido. UTMs e identificadores de clique são guardados no navegador para atribuição.

**O formulário atual não grava os contatos em uma planilha ou CRM.** O Apps Script em `integrations/google-apps-script.gs` é um exemplo ainda não conectado ao fluxo atual. A conexão com armazenamento de leads precisa ser implementada e validada separadamente antes de depender dela.

Confira também [CONFIGURAR-FORMULARIO.md](CONFIGURAR-FORMULARIO.md).

## Desenvolvimento

Requisitos: Node.js 22.13 ou superior.

```bash
npm ci
npm run dev
```

Acesse `http://localhost:5173/negocios-locais/`.

## GitHub Codespaces

1. Clique em **Code > Codespaces > Create codespace on main**.
2. Aguarde a instalação das dependências.
3. Execute `npm run dev`.
4. Abra a porta 5173 e confirme que o caminho termina em `/negocios-locais/`.

## Validação e exportação

```bash
npm run lint
npm run test
npx next build
```

Os arquivos estáticos são gerados em `out/`. Publique o conteúdo em `public_html/negocios-locais/`, sem alterar a página principal.

## Arquivos principais

- `app/page.tsx`: conteúdo, formulário, eventos e interações.
- `app/globals.css`: tokens visuais e estilos globais.
- `app/layout.tsx`: metadados, fontes e GTM.
- `public/assets/`: logotipo e recursos visuais.
- `integrations/google-apps-script.gs`: exemplo de receptor do Google Sheets, não conectado ao formulário atual.
