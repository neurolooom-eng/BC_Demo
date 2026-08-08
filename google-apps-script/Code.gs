/**
 * Best Cast e-QMS - Google Sheets backend.
 *
 * Bind this script to a Google Sheet whose tabs match the app's data types
 * (see google-apps-script/README.md for the full column list per tab). Row 1
 * of each tab must be a header row matching the field names of the matching
 * TypeScript type in src/types. Tab names default to the type name but can be
 * overridden from the app's Config page, in which case the request's `sheet`
 * (or `usersTab`) param carries the actual tab name.
 *
 * Nested fields on some types (CheckSheets' readings/signatures/..., and
 * Users' grants/revokes) are stored as JSON-text cells - the frontend
 * (src/data/repository.ts) encodes/decodes them; this script passes the
 * strings through untouched.
 *
 * AUTH: the Users tab additionally has `passwordHash` and `passwordSalt`
 * columns that only this script writes (via the `auth` action). Passwords are
 * never stored in plaintext and the stored hash never leaves the sheet - the
 * `login` action returns only whether the credentials matched. The scheme is
 * salted SHA-256 over `${salt}:${password}`, identical to the browser demo
 * (src/lib/passwordHash.ts) so a password set offline verifies here too.
 *
 * An optional `spreadsheetId` (query param on GET, body field on POST) lets
 * one deployment serve multiple spreadsheets - set it from the Config page.
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

  if (body.action === 'auth') {
    return jsonResponse(handleAuth(body))
  }

  var sheet = getSheet(body.sheet, body.spreadsheetId)

  if (body.action === 'create') {
    appendRow(sheet, body.data)
  } else if (body.action === 'update') {
    updateRowById(sheet, body.id, body.data)
  } else if (body.action === 'delete') {
    deleteRowById(sheet, body.id)
  } else {
    throw new Error('Unknown action: ' + body.action)
  }

  return jsonResponse({ ok: true })
}

// --------------------------------------------------------------------------
// Auth
// --------------------------------------------------------------------------

function handleAuth(body) {
  var sheet = getSheet(body.usersTab, body.spreadsheetId)
  if (body.authAction === 'login') return authLogin(sheet, body.userId, body.password)
  if (body.authAction === 'setPassword') return authSetPassword(sheet, body.userId, body.password)
  throw new Error('Unknown authAction: ' + body.authAction)
}

function authLogin(sheet, userId, password) {
  var found = findUserRow(sheet, userId)
  if (!found) return { ok: false, reason: 'unknown-user' }
  var row = found.row
  if (String(row.status) === 'disabled') return { ok: false, reason: 'disabled' }
  if (!row.passwordHash || !row.passwordSalt) return { ok: false, reason: 'no-password' }
  var expected = hashPassword(password, String(row.passwordSalt))
  return expected === String(row.passwordHash) ? { ok: true } : { ok: false, reason: 'invalid' }
}

function authSetPassword(sheet, userId, password) {
  var found = findUserRow(sheet, userId)
  if (!found) return { ok: false, reason: 'unknown-user' }
  var salt = makeSalt()
  var hash = hashPassword(password, salt)
  setCell(sheet, found.rowIndex, found.headers, 'passwordSalt', salt)
  setCell(sheet, found.rowIndex, found.headers, 'passwordHash', hash)
  setCell(sheet, found.rowIndex, found.headers, 'status', 'active')
  return { ok: true }
}

function findUserRow(sheet, userId) {
  var values = sheet.getDataRange().getValues()
  var headers = values[0]
  var userIdCol = headers.indexOf('userId')
  if (userIdCol === -1) throw new Error('Users tab has no "userId" column')
  var needle = String(userId).trim().toLowerCase()
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][userIdCol]).trim().toLowerCase() === needle) {
      var row = {}
      for (var j = 0; j < headers.length; j++) row[headers[j]] = values[i][j]
      return { row: row, rowIndex: i + 1, headers: headers }
    }
  }
  return null
}

function setCell(sheet, rowIndex, headers, header, value) {
  var col = headers.indexOf(header)
  if (col === -1) throw new Error('Users tab has no "' + header + '" column')
  sheet.getRange(rowIndex, col + 1).setValue(value)
}

function makeSalt() {
  var bytes = []
  for (var i = 0; i < 16; i++) bytes.push(Math.floor(Math.random() * 256))
  return bytesToHex(bytes)
}

function hashPassword(password, salt) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ':' + password, Utilities.Charset.UTF_8)
  return bytesToHex(digest)
}

function bytesToHex(bytes) {
  var hex = ''
  for (var i = 0; i < bytes.length; i++) {
    // Apps Script bytes are signed (-128..127); mask to 0..255.
    var b = (bytes[i] + 256) % 256
    var s = b.toString(16)
    hex += s.length === 1 ? '0' + s : s
  }
  return hex
}

// --------------------------------------------------------------------------
// Spreadsheet helpers
// --------------------------------------------------------------------------

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
      // Never expose credential columns to GET readers.
      if (headers[j] === 'passwordHash' || headers[j] === 'passwordSalt') continue
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

function deleteRowById(sheet, id) {
  var values = sheet.getDataRange().getValues()
  var headers = values[0]
  var idCol = headers.indexOf('id')
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(id)) {
      sheet.deleteRow(i + 1)
      return
    }
  }
  throw new Error('Row with id ' + id + ' not found in ' + sheet.getName())
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
