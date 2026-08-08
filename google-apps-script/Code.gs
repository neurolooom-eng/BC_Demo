/**
 * Best Cast e-QMS - Google Sheets backend.
 *
 * Bind this script to a Google Sheet with three tabs (default names:
 * "Specifications", "Documents", "CheckSheets" - the Config page in the app
 * can point at differently-named tabs, in which case the request's `sheet`
 * param carries the actual tab name instead). Row 1 of each tab must be a
 * header row matching the field names of the matching TypeScript type in
 * src/types/domain.ts (see google-apps-script/README.md for the full
 * column list per tab). CheckSheets' nested fields (readings,
 * machineReadings, corePinChecks, diePrep, signatures) are stored as
 * JSON-text cells - the frontend (src/data/repository.ts) encodes/decodes
 * them, this script just passes the strings through untouched.
 *
 * An optional `spreadsheetId` (query param on GET, body field on POST) lets
 * one deployment of this script serve multiple spreadsheets - set it from
 * the app's Config page. Omit it to use the spreadsheet this script is
 * bound to.
 *
 * Deploy: Extensions > Apps Script > paste this file > Deploy > New
 * deployment > Web app > Execute as "Me" > Who has access "Anyone" >
 * copy the resulting URL into VITE_SHEETS_API_URL (or the Config page).
 */

function doGet(e) {
  var sheetName = e.parameter.sheet
  return jsonResponse({ rows: readSheet(sheetName, e.parameter.spreadsheetId) })
}

function doPost(e) {
  var body = JSON.parse(e.postData.contents)
  var sheet = getSheet(body.sheet, body.spreadsheetId)

  if (body.action === 'create') {
    appendRow(sheet, body.data)
  } else if (body.action === 'update') {
    updateRowById(sheet, body.id, body.data)
  } else {
    throw new Error('Unknown action: ' + body.action)
  }

  return jsonResponse({ ok: true })
}

function getSpreadsheet(spreadsheetId) {
  return spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet()
}

function getSheet(name, spreadsheetId) {
  var sheet = getSpreadsheet(spreadsheetId).getSheetByName(name)
  if (!sheet) throw new Error('Unknown sheet tab: ' + name)
  return sheet
}

function readSheet(name, spreadsheetId) {
  var sheet = getSheet(name, spreadsheetId)
  var values = sheet.getDataRange().getValues()
  var headers = values[0]
  var rows = []
  for (var i = 1; i < values.length; i++) {
    var row = {}
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = values[i][j]
    }
    rows.push(row)
  }
  return rows
}

function appendRow(sheet, data) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  var row = headers.map(function (h) {
    return data[h] !== undefined ? data[h] : ''
  })
  sheet.appendRow(row)
}

function updateRowById(sheet, id, data) {
  var values = sheet.getDataRange().getValues()
  var headers = values[0]
  var idCol = headers.indexOf('id')
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(id)) {
      var row = headers.map(function (h, j) {
        return data[h] !== undefined ? data[h] : values[i][j]
      })
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([row])
      return
    }
  }
  throw new Error('Row with id ' + id + ' not found in ' + sheet.getName())
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
