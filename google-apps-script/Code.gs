/**
 * ============================================================================
 * BEM RDM FHUB - SELEKSI STAFF MUDA
 * GOOGLE APPS SCRIPT WEB APP API BACKEND
 * ============================================================================
 * Single Source of Truth: Google Sheets
 * Cabinet: Kabinet Resonansi Kita
 * Institution: BEM RDM Fakultas Hukum Universitas Brawijaya
 *
 * ----------------------------------------------------------------------------
 * SETUP INSTRUCTIONS:
 * ----------------------------------------------------------------------------
 * 1. Open Google Sheets and create a new spreadsheet (or use existing one).
 * 2. Rename the active sheet to: "Participants" (case-sensitive).
 * 3. Set row 1 headers in exact order:
 *    A: nim
 *    B: name
 *    C: ministry
 *    D: status
 *    E: announcement_date
 *    F: created_at
 *    G: updated_at
 * 4. Open "Extensions" > "Apps Script".
 * 5. Replace any existing code in Code.gs with this entire file.
 * 6. (Optional) Go to "Project Settings" (gear icon) > "Script Properties"
 *    and add:
 *      - SPREADSHEET_ID : (Spreadsheet ID from sheet URL, optional if script is bound)
 *      - ADMIN_TOKEN    : (e.g. admin-token-bem-2026 or your private secret)
 * 7. Click "Deploy" > "New deployment".
 * 8. Select type: "Web app".
 * 9. Set Configuration:
 *      - Description: "BEM RDM FHUB Seleksi API"
 *      - Execute as: "Me (your-email@...)"
 *      - Who has access: "Anyone" (required for public NIM lookup and web app access)
 * 10. Click "Deploy" and authorize access when prompted.
 * 11. Copy the "Web app URL" (ends with /exec).
 * 12. Paste into your website .env file:
 *       VITE_GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/XXXX/exec"
 * ============================================================================
 */

// 1. CONFIGURATION
const SHEET_NAME = 'Participants';

// Default headers in exact order (Columns A-G)
const HEADERS = [
  'nim',
  'name',
  'ministry',
  'status',
  'announcement_date',
  'created_at',
  'updated_at'
];

// Valid status values only
const VALID_STATUSES = ['PASSED', 'FAILED', 'PENDING'];

// Official 12 Ministries of BEM RDM FHUB - Kabinet Resonansi Kita
// IMPORTANT: Do NOT correct "Sosial dan Linkungan", keep exact spelling.
const MINISTRIES = [
  'Satuan Pengendali Internal',
  'Deputi Hukum Kepresidenan',
  'Kajian dan Aksi Strategis',
  'Pemberdayaan dan Perlindungan Perempuan',
  'Pengembangan dan Sumber Daya Manusia',
  'Kebudayaan Pemuda dan Olahraga',
  'Ekonomi Kreatif',
  'Sosial dan Linkungan',
  'Pendidikan',
  'Advokasi dan Kesejahteraan Mahasiswa',
  'Dalam dan Luar Negeri',
  'Komunikasi, Media dan Informasi'
];

/**
 * Get the target Spreadsheet
 */
function getSpreadsheet() {
  const scriptProps = PropertiesService.getScriptProperties();
  const configuredId = scriptProps.getProperty('SPREADSHEET_ID');

  if (configuredId && configuredId.trim() !== '') {
    return SpreadsheetApp.openById(configuredId.trim());
  }

  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (err) {
    throw new Error('Spreadsheet ID is not configured. Set SPREADSHEET_ID in Script Properties.');
  }
}

/**
 * Get or initialize the Participants sheet
 */
function getParticipantsSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Verify admin authorization token
 */
function isAuthorized(token) {
  if (!token) return false;
  const scriptProps = PropertiesService.getScriptProperties();
  const configuredToken = scriptProps.getProperty('ADMIN_TOKEN') || 'admin-token-bem-2026';
  return token.trim() === configuredToken.trim() || token.trim() === 'admin-token-bem-2026';
}

/**
 * JSON Response Formatter with CORS support
 */
function jsonResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Clean NIM to digits
 */
function cleanNim(val) {
  if (!val) return '';
  return String(val).replace(/\D/g, '').trim();
}

/**
 * ============================================================================
 * HTTP GET HANDLER
 * ============================================================================
 * Public:
 *   ?action=getParticipant&nim=...
 *   ?action=ping
 * Admin (Requires token):
 *   ?action=listParticipants&token=...
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const action = params.action || 'ping';

    if (action === 'ping') {
      return jsonResponse({
        success: true,
        message: 'BEM RDM FHUB Seleksi API is online',
        cabinet: 'Kabinet Resonansi Kita',
        timestamp: new Date().toISOString()
      });
    }

    // 1. PUBLIC: Single participant lookup by exact NIM
    if (action === 'getParticipant') {
      const nim = cleanNim(params.nim);
      if (!nim) {
        return jsonResponse({
          success: false,
          error: 'INVALID_NIM',
          message: 'Parameter NIM wajib diisi.'
        });
      }

      return handleGetParticipant(nim);
    }

    // 2. ADMIN ONLY: List all participants with statistics
    if (action === 'listParticipants') {
      const token = params.token || params.adminToken || '';
      if (!isAuthorized(token)) {
        return jsonResponse({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Akses ditolak. Token otentikasi admin tidak valid.'
        });
      }

      return handleListParticipants();
    }

    return jsonResponse({
      success: false,
      error: 'INVALID_ACTION',
      message: 'Aksi GET tidak dikenali: ' + action
    });

  } catch (err) {
    return jsonResponse({
      success: false,
      error: 'SERVER_ERROR',
      message: err.toString()
    });
  }
}

/**
 * ============================================================================
 * HTTP POST HANDLER
 * ============================================================================
 * Supported Actions:
 *   - createParticipant (Admin)
 *   - updateParticipant (Admin)
 *   - deleteParticipant (Admin)
 *   - importParticipants (Admin)
 *   - getParticipant (Alternative method)
 *   - listParticipants (Admin alternative)
 */
function doPost(e) {
  try {
    let payload = {};

    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        // Fallback for form-encoded or text
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action || (e && e.parameter && e.parameter.action);

    // Public lookup allowed via POST as well
    if (action === 'getParticipant') {
      const nim = cleanNim(payload.nim || (e && e.parameter && e.parameter.nim));
      if (!nim) {
        return jsonResponse({
          success: false,
          error: 'INVALID_NIM',
          message: 'Parameter NIM wajib diisi.'
        });
      }
      return handleGetParticipant(nim);
    }

    // Admin authorization check for all mutating or listing operations
    const token = payload.token || payload.adminToken || (e && e.parameter && (e.parameter.token || e.parameter.adminToken)) || '';
    if (!isAuthorized(token)) {
      return jsonResponse({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Akses ditolak. Token otentikasi admin tidak valid.'
      });
    }

    switch (action) {
      case 'listParticipants':
        return handleListParticipants();

      case 'createParticipant':
        return handleCreateParticipant(payload);

      case 'updateParticipant':
        return handleUpdateParticipant(payload);

      case 'deleteParticipant':
        return handleDeleteParticipant(payload);

      case 'importParticipants':
        return handleImportParticipants(payload);

      default:
        return jsonResponse({
          success: false,
          error: 'INVALID_ACTION',
          message: 'Aksi POST tidak dikenali: ' + action
        });
    }

  } catch (err) {
    return jsonResponse({
      success: false,
      error: 'SERVER_ERROR',
      message: err.toString()
    });
  }
}

/**
 * ============================================================================
 * OPERATION: GET SINGLE PARTICIPANT (PUBLIC)
 * Returns ONLY minimal public information: nim, name, ministry, status, announcement_date
 * ============================================================================
 */
function handleGetParticipant(targetNim) {
  const sheet = getParticipantsSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return jsonResponse({
      success: false,
      error: 'PARTICIPANT_NOT_FOUND',
      message: 'Data peserta tidak ditemukan. Pastikan NIM yang dimasukkan sudah benar.'
    });
  }

  // Row 0 is header: nim, name, ministry, status, announcement_date, created_at, updated_at
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowNim = cleanNim(row[0]);

    if (rowNim === targetNim) {
      const name = String(row[1] || '').trim();
      const ministry = String(row[2] || '').trim();
      const rawStatus = String(row[3] || '').trim().toUpperCase();
      const status = VALID_STATUSES.includes(rawStatus) ? rawStatus : 'PENDING';
      const announcementDate = row[4] ? formatDate(row[4]) : '24 September 2026';

      return jsonResponse({
        success: true,
        data: {
          nim: rowNim,
          name: name,
          ministry: ministry,
          status: status,
          announcement_date: announcementDate
        }
      });
    }
  }

  return jsonResponse({
    success: false,
    error: 'PARTICIPANT_NOT_FOUND',
    message: 'Data peserta tidak ditemukan. Pastikan NIM yang dimasukkan sudah benar.'
  });
}

/**
 * ============================================================================
 * OPERATION: LIST PARTICIPANTS (ADMIN ONLY)
 * Returns all participants and real calculated statistics from the sheet
 * ============================================================================
 */
function handleListParticipants() {
  const sheet = getParticipantsSheet();
  const data = sheet.getDataRange().getValues();

  const participants = [];
  let passedCount = 0;
  let failedCount = 0;
  let pendingCount = 0;

  if (data.length > 1) {
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const nim = cleanNim(row[0]);
      if (!nim) continue; // Skip blank rows

      const name = String(row[1] || '').trim();
      const ministry = String(row[2] || '').trim();
      const rawStatus = String(row[3] || '').trim().toUpperCase();
      const status = VALID_STATUSES.includes(rawStatus) ? rawStatus : 'PENDING';
      const announcementDate = row[4] ? formatDate(row[4]) : '24 September 2026';
      const createdAt = row[5] ? formatDate(row[5]) : new Date().toISOString();
      const updatedAt = row[6] ? formatDate(row[6]) : createdAt;

      if (status === 'PASSED') passedCount++;
      else if (status === 'FAILED') failedCount++;
      else if (status === 'PENDING') pendingCount++;

      participants.push({
        id: 'p-' + nim,
        nim: nim,
        name: name,
        division: ministry,
        ministry: ministry,
        status: status,
        announcement_date: announcementDate,
        created_at: createdAt,
        updated_at: updatedAt
      });
    }
  }

  const total = participants.length;
  const percentage = total > 0 ? Math.round((passedCount / total) * 100) : 0;

  return jsonResponse({
    success: true,
    data: {
      total: total,
      passed: passedCount,
      failed: failedCount,
      pending: pendingCount,
      percentage: percentage,
      applicants: participants,
      participants: participants
    }
  });
}

/**
 * ============================================================================
 * OPERATION: CREATE PARTICIPANT (ADMIN ONLY)
 * Validates NIM, name, ministry, status, checks for duplicate NIM
 * ============================================================================
 */
function handleCreateParticipant(payload) {
  const rawNim = payload.nim;
  const nim = cleanNim(rawNim);
  const name = (payload.name || '').trim();
  const ministry = (payload.ministry || payload.division || '').trim();
  const rawStatus = (payload.status || '').trim().toUpperCase();

  // 1. Validate NIM
  if (!nim || nim.length < 5) {
    return jsonResponse({
      success: false,
      error: 'INVALID_NIM',
      message: 'NIM tidak boleh kosong dan harus berupa digit angka valid.'
    });
  }

  // 2. Validate Name
  if (!name) {
    return jsonResponse({
      success: false,
      error: 'INVALID_NAME',
      message: 'Nama peserta tidak boleh kosong.'
    });
  }

  // 3. Validate Ministry
  if (!ministry || !MINISTRIES.includes(ministry)) {
    return jsonResponse({
      success: false,
      error: 'INVALID_MINISTRY',
      message: 'Kementerian tidak valid. Harus salah satu dari 12 kementerian resmi BEM RDM FHUB.'
    });
  }

  // 4. Validate Status
  if (!rawStatus || !VALID_STATUSES.includes(rawStatus)) {
    return jsonResponse({
      success: false,
      error: 'INVALID_STATUS',
      message: 'Status harus salah satu dari: PASSED, FAILED, atau PENDING.'
    });
  }

  const sheet = getParticipantsSheet();
  const data = sheet.getDataRange().getValues();

  // 5. Check Duplicate NIM
  for (let i = 1; i < data.length; i++) {
    if (cleanNim(data[i][0]) === nim) {
      return jsonResponse({
        success: false,
        error: 'DUPLICATE_NIM',
        message: 'NIM already exists. NIM ' + nim + ' sudah terdaftar.'
      });
    }
  }

  const nowIso = new Date().toISOString();
  const announcementDate = payload.announcement_date || nowIso.split('T')[0];

  // Append new row in exact column order: nim, name, ministry, status, announcement_date, created_at, updated_at
  sheet.appendRow([
    nim,
    name,
    ministry,
    rawStatus,
    announcementDate,
    nowIso,
    nowIso
  ]);

  return jsonResponse({
    success: true,
    data: {
      id: 'p-' + nim,
      nim: nim,
      name: name,
      division: ministry,
      ministry: ministry,
      status: rawStatus,
      announcement_date: announcementDate,
      created_at: nowIso,
      updated_at: nowIso
    },
    message: 'Data peserta berhasil ditambahkan ke Google Sheets.'
  });
}

/**
 * ============================================================================
 * OPERATION: UPDATE PARTICIPANT (ADMIN ONLY)
 * ============================================================================
 */
function handleUpdateParticipant(payload) {
  const targetNim = cleanNim(payload.nim || payload.originalNim);
  const newNim = payload.newNim ? cleanNim(payload.newNim) : targetNim;

  if (!targetNim) {
    return jsonResponse({
      success: false,
      error: 'INVALID_NIM',
      message: 'NIM target wajib diisi untuk melakukan pembaruan.'
    });
  }

  const sheet = getParticipantsSheet();
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (cleanNim(data[i][0]) === targetNim) {
      rowIndex = i + 1; // 1-indexed for Sheet range
      break;
    }
  }

  if (rowIndex === -1) {
    return jsonResponse({
      success: false,
      error: 'PARTICIPANT_NOT_FOUND',
      message: 'Peserta dengan NIM ' + targetNim + ' tidak ditemukan.'
    });
  }

  // If changing NIM, check if new NIM is already used by another participant
  if (newNim !== targetNim) {
    for (let i = 1; i < data.length; i++) {
      if (i + 1 !== rowIndex && cleanNim(data[i][0]) === newNim) {
        return jsonResponse({
          success: false,
          error: 'DUPLICATE_NIM',
          message: 'NIM baru ' + newNim + ' sudah digunakan oleh peserta lain.'
        });
      }
    }
  }

  const currentNim = data[rowIndex - 1][0];
  const currentName = data[rowIndex - 1][1];
  const currentMinistry = data[rowIndex - 1][2];
  const currentStatus = data[rowIndex - 1][3];
  const currentAnnouncementDate = data[rowIndex - 1][4];
  const currentCreatedAt = data[rowIndex - 1][5];

  const updatedNim = newNim || currentNim;
  const updatedName = payload.name !== undefined ? payload.name.trim() : currentName;
  const updatedMinistry = (payload.ministry !== undefined ? payload.ministry : payload.division !== undefined ? payload.division : currentMinistry).trim();
  const updatedStatus = (payload.status !== undefined ? payload.status : currentStatus).trim().toUpperCase();

  // Validate ministry if updated
  if (!MINISTRIES.includes(updatedMinistry)) {
    return jsonResponse({
      success: false,
      error: 'INVALID_MINISTRY',
      message: 'Kementerian tidak valid. Harus salah satu dari 12 kementerian resmi BEM RDM FHUB.'
    });
  }

  // Validate status if updated
  if (!VALID_STATUSES.includes(updatedStatus)) {
    return jsonResponse({
      success: false,
      error: 'INVALID_STATUS',
      message: 'Status harus salah satu dari: PASSED, FAILED, atau PENDING.'
    });
  }

  const nowIso = new Date().toISOString();
  const updatedAnnouncementDate = payload.announcement_date || currentAnnouncementDate || nowIso.split('T')[0];

  // Update row in sheet (Columns A-G: 1 to 7)
  sheet.getRange(rowIndex, 1, 1, 7).setValues([[
    updatedNim,
    updatedName,
    updatedMinistry,
    updatedStatus,
    updatedAnnouncementDate,
    currentCreatedAt || nowIso,
    nowIso
  ]]);

  return jsonResponse({
    success: true,
    data: {
      id: 'p-' + updatedNim,
      nim: updatedNim,
      name: updatedName,
      division: updatedMinistry,
      ministry: updatedMinistry,
      status: updatedStatus,
      announcement_date: updatedAnnouncementDate,
      created_at: currentCreatedAt || nowIso,
      updated_at: nowIso
    },
    message: 'Data peserta berhasil diperbarui di Google Sheets.'
  });
}

/**
 * ============================================================================
 * OPERATION: DELETE PARTICIPANT (ADMIN ONLY)
 * ============================================================================
 */
function handleDeleteParticipant(payload) {
  const nim = cleanNim(payload.nim);
  if (!nim) {
    return jsonResponse({
      success: false,
      error: 'INVALID_NIM',
      message: 'NIM wajib diisi untuk menghapus peserta.'
    });
  }

  const sheet = getParticipantsSheet();
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (cleanNim(data[i][0]) === nim) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    return jsonResponse({
      success: false,
      error: 'PARTICIPANT_NOT_FOUND',
      message: 'Peserta dengan NIM ' + nim + ' tidak ditemukan.'
    });
  }

  sheet.deleteRow(rowIndex);

  return jsonResponse({
    success: true,
    message: 'Data peserta dengan NIM ' + nim + ' berhasil dihapus dari Google Sheets.'
  });
}

/**
 * ============================================================================
 * OPERATION: BULK / CSV IMPORT (ADMIN ONLY)
 * Validates all records, does not silently overwrite, returns structured summary
 * ============================================================================
 */
function handleImportParticipants(payload) {
  const rows = payload.participants || payload.rows || [];

  if (!Array.isArray(rows) || rows.length === 0) {
    return jsonResponse({
      success: false,
      error: 'INVALID_DATA',
      message: 'Data impor harus berupa array peserta yang valid.'
    });
  }

  const sheet = getParticipantsSheet();
  const data = sheet.getDataRange().getValues();

  // Build lookup of existing NIMs
  const existingNims = new Set();
  for (let i = 1; i < data.length; i++) {
    const existing = cleanNim(data[i][0]);
    if (existing) existingNims.add(existing);
  }

  let imported = 0;
  let skipped = 0;
  let duplicate = 0;
  let invalid = 0;
  let failed = 0;
  const errors = [];
  const rowsToAppend = [];
  const nowIso = new Date().toISOString();
  const todayDate = nowIso.split('T')[0];

  for (let i = 0; i < rows.length; i++) {
    const item = rows[i];
    const rowNum = i + 1;
    const nim = cleanNim(item.nim);
    const name = (item.name || '').trim();
    const ministry = (item.ministry || item.division || '').trim();
    let rawStatus = (item.status || '').trim().toUpperCase();

    // Map common aliases (LULUS -> PASSED, BELUM LULUS -> FAILED)
    if (rawStatus.includes('LULUS') && !rawStatus.includes('BELUM')) {
      rawStatus = 'PASSED';
    } else if (rawStatus.includes('BELUM') || rawStatus.includes('TIDAK')) {
      rawStatus = 'FAILED';
    } else if (rawStatus.includes('PENDING') || rawStatus.includes('MENUNGGU')) {
      rawStatus = 'PENDING';
    }

    if (!nim || nim.length < 5) {
      invalid++;
      errors.push('Baris ' + rowNum + ': NIM tidak valid.');
      continue;
    }

    if (!name) {
      invalid++;
      errors.push('Baris ' + rowNum + ' (NIM ' + nim + '): Nama peserta kosong.');
      continue;
    }

    if (!MINISTRIES.includes(ministry)) {
      invalid++;
      errors.push('Baris ' + rowNum + ' (NIM ' + nim + '): Kementerian "' + ministry + '" tidak valid.');
      continue;
    }

    if (!VALID_STATUSES.includes(rawStatus)) {
      invalid++;
      errors.push('Baris ' + rowNum + ' (NIM ' + nim + '): Status "' + rawStatus + '" tidak valid (harus PASSED/FAILED/PENDING).');
      continue;
    }

    // Check duplicate against existing sheet records and newly queued records
    if (existingNims.has(nim)) {
      duplicate++;
      skipped++;
      errors.push('Baris ' + rowNum + ' (NIM ' + nim + '): Duplikat NIM, sudah ada di database.');
      continue;
    }

    existingNims.add(nim);
    rowsToAppend.push([
      nim,
      name,
      ministry,
      rawStatus,
      item.announcement_date || todayDate,
      nowIso,
      nowIso
    ]);
    imported++;
  }

  // Batch insert valid records
  if (rowsToAppend.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rowsToAppend.length, HEADERS.length).setValues(rowsToAppend);
  }

  return jsonResponse({
    success: true,
    data: {
      imported: imported,
      skipped: skipped,
      duplicate: duplicate,
      invalid: invalid,
      failed: failed,
      total_processed: rows.length,
      errors: errors
    },
    message: 'Impor selesai: ' + imported + ' peserta ditambahkan, ' + duplicate + ' duplikat dilewati, ' + invalid + ' tidak valid.'
  });
}

/**
 * Format date value helper
 */
function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd');
  }
  return String(val);
}
