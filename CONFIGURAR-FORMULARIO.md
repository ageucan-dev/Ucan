# Formulário da landing page

## Fluxo atual

A página coleta nome, WhatsApp e segmento como campos obrigatórios. Cidade e principal desafio são opcionais. Com consentimento, a pessoa segue para o WhatsApp com uma mensagem preenchida que pode revisar antes de enviar.

Os eventos de conversão são enviados ao dataLayer/GTM sem nome, telefone ou outros dados pessoais. UTMs e identificadores de clique do Google são registrados no armazenamento local do navegador para apoiar a atribuição.

## Armazenamento dos contatos

O fluxo atual **não salva automaticamente os dados em Google Sheets, n8n ou CRM**. O arquivo `integrations/google-apps-script.gs` é apenas um exemplo e não está ligado à página. Não configure uma URL no arquivo legado `public/form-config.js` esperando que ela seja usada: esse arquivo não faz parte do fluxo atual.

Se a U Can quiser guardar os leads além do WhatsApp, implemente uma integração apropriada, com consentimento e tratamento de dados definidos, e valide o envio antes de publicar.

## Publicação

A landing é exportada para a pasta `out/` com base em `/negocios-locais/`. Para a configuração atual da Hostinger, publique o conteúdo exportado em `public_html/negocios-locais/`, sem substituir a página principal.

Endereço: `https://ucanmkt.com.br/negocios-locais/`
