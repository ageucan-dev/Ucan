# Landing page U Can — Estética e Saúde

Landing page independente para captação e qualificação de clínicas de estética, odontologia e massoterapia.

O projeto fica isolado em `/estetica-saude/` e não altera o site principal da U Can.

## Endereço previsto

`https://ucanmkt.com.br/estetica-saude/`

A exportação usa `basePath` e `assetPrefix` em `/estetica-saude`, permitindo publicar a página em uma subpasta sem alterar o site principal.

## Formulário

O formulário coleta:

- nome;
- telefone;
- e-mail;
- nome da clínica ou empresa;
- segmento;
- faixa de seguidores;
- faixa de faturamento mensal;
- investimento em publicidade;
- consentimento para contato;
- parâmetros UTM da campanha.

O destino é definido em `public/form-config.js`. Consulte `CONFIGURAR-FORMULARIO.md` para conectar uma planilha do Google Sheets por meio do Apps Script disponível em `integrations/google-apps-script.gs`.

## Desenvolvimento

Requisitos: Node.js 22.13 ou superior.

```bash
npm ci
npm run dev
```

Acesse `http://localhost:5173/estetica-saude/`.

## Visualizar no GitHub Codespaces

1. No repositório, clique em **Code > Codespaces > Create codespace on main**.
2. Aguarde a instalação automática das dependências.
3. No terminal do Codespace, execute:

```bash
npm run dev
```

4. A porta `5173` será encaminhada automaticamente. Abra a prévia e confirme que o endereço termina em `/estetica-saude/`.

Para encerrar o servidor, pressione `Ctrl + C` no terminal.

## Validar antes da publicação

```bash
npm run lint
npm run test
```

## Exportação para a Hostinger

```bash
npx next build
```

Os arquivos estáticos serão gerados em `out/`. O conteúdo dessa pasta deve ser publicado diretamente em `public_html/estetica-saude/`.

O comando `npm run build` permanece reservado ao ambiente Sites/Vinext do projeto.

## Estrutura principal

- `app/page.tsx`: conteúdo, formulário e interações da landing page;
- `app/globals.css`: identidade visual e estilos globais;
- `public/assets/`: logotipo e imagem principal;
- `public/form-config.js`: endereço de recebimento dos leads;
- `integrations/google-apps-script.gs`: integração com o Google Sheets;
- `CONFIGURAR-FORMULARIO.md`: passo a passo para ativar o formulário.
