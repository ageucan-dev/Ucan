function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = "Leads";
    var sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      sheet.appendRow([
        "Recebido em",
        "Nome",
        "Telefone",
        "E-mail",
        "Empresa",
        "Segmento",
        "Seguidores",
        "Faturamento",
        "Investe em publicidade",
        "Consentimento",
        "Página",
        "UTM Source",
        "UTM Medium",
        "UTM Campaign",
        "UTM Content",
        "UTM Term",
      ]);
      sheet.setFrozenRows(1);
    }

    var data = e.parameter || {};
    sheet.appendRow([
      new Date(),
      data.nome || "",
      data.telefone || "",
      data.email || "",
      data.empresa || "",
      data.segmento || "",
      data.seguidores || "",
      data.faturamento || "",
      data.investe_publicidade || "",
      data.consentimento || "",
      data.pagina || "",
      data.utm_source || "",
      data.utm_medium || "",
      data.utm_campaign || "",
      data.utm_content || "",
      data.utm_term || "",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ result: "success" }),
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
