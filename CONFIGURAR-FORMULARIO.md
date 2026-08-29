# Conectar o formulário ao Google Sheets

O formulário da landing page já está preparado para enviar cada lead, inclusive os parâmetros UTM, para uma planilha do Google Sheets.

## 1. Criar o destino dos leads

1. Crie uma planilha no Google Sheets.
2. Na planilha, acesse **Extensões > Apps Script**.
3. Apague o código de exemplo.
4. Copie todo o conteúdo do arquivo `integrations/google-apps-script.gs` e cole no editor.
5. Salve o projeto.

## 2. Publicar o receptor do formulário

1. No Apps Script, clique em **Implantar > Nova implantação**.
2. Escolha o tipo **App da Web**.
3. Em **Executar como**, selecione sua própria conta.
4. Em **Quem pode acessar**, selecione **Qualquer pessoa**.
5. Autorize a implantação e copie a URL terminada em `/exec`.

## 3. Ligar a URL à página

Abra o arquivo `form-config.js` do pacote de publicação e cole a URL entre as aspas:

```js
window.UCAN_FORM_ENDPOINT = "COLE_AQUI_A_URL_TERMINADA_EM_EXEC";
```

Salve o arquivo. As novas respostas aparecerão automaticamente na aba **Leads** da planilha.

## 4. Publicar sem alterar o site atual

1. No gerenciador de arquivos da hospedagem, abra `public_html`.
2. Crie a pasta `estetica-saude`.
3. Extraia dentro dela o conteúdo do pacote da landing page.
4. Confirme se o arquivo `index.html` ficou diretamente em `public_html/estetica-saude/index.html`.

A página ficará disponível em `https://ucanmkt.com.br/estetica-saude/`, sem substituir os arquivos da página principal.
