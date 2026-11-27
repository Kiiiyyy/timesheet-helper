/**
 * Mengembalikan tanggal hari ini sesuai zona waktu lokal perangkat (WIB-safe)
 * dalam format YYYY-MM-DD menggunakan locale 'en-CA'.
 */
export function getTodayLocal() {
  return new Date().toLocaleDateString('en-CA')
}

/**
 * Menggeser string tanggal (YYYY-MM-DD) maju atau mundur sejumlah hari
 * tanpa terkena pergeseran zona waktu UTC.
 *
 * @param {string} dateStr - Tanggal awal dalam format YYYY-MM-DD
 * @param {number} days - Jumlah hari (+1 untuk besok, -1 untuk kemarin)
 * @returns {string} Tanggal hasil pergeseran dalam format YYYY-MM-DD
 */
export function shiftDateString(dateStr, days) {
  const baseDateStr = dateStr || getTodayLocal()
  const [year, month, day] = baseDateStr.split('-').map(Number)
  const localDate = new Date(year, month - 1, day + days)

  return localDate.toLocaleDateString('en-CA')
}

/**
 * Membersihkan nomor tiket dari spasi berlebih, simbol '#', dan kurung siku '[...]'.
 * Contoh: '#47223', '[47223]', atau '[#47223]' -> '47223'
 *
 * @param {string|number} raw
 * @returns {string}
 */
export function sanitizeTicketNo(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/^[\[#\s]+|[\]\s]+$/g, '')
    .trim()
}

/**
 * Menormalisasi spasi ganda dan baris baru menjadi satu spasi tunggal.
 *
 * @param {string} value
 * @returns {string}
 */
function normalizeWhitespace(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * Membentuk teks timesheet baku: [nomor_tiket] judul_tiket: deskripsi_kegiatan
 *
 * @param {{ ticketNo?: string|number, title?: string, activity?: string }} payload
 * @returns {string}
 */
export function buildFormattedText({ ticketNo = '', title = '', activity = '' } = {}) {
  const cleanTicket = sanitizeTicketNo(ticketNo)
  const cleanTitle = normalizeWhitespace(title)
  const cleanActivity = normalizeWhitespace(activity)

  if (!cleanTicket && !cleanTitle && !cleanActivity) {
    return ''
  }

  return `[${cleanTicket}] ${cleanTitle}: ${cleanActivity}`
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Menggabungkan daftar entri timesheet menjadi bullet list Markdown (* item).
 */
export function buildMarkdownList(entries = []) {
  return entries
    .map((item) => item?.formattedText || buildFormattedText(item))
    .filter(Boolean)
    .map((line) => `* ${line}`)
    .join('\n')
}

/**
 * Menggabungkan daftar entri timesheet menjadi HTML bullet list (<ul><li>...</li></ul>)
 * untuk target paste berupa Rich Text Editor.
 */
export function buildHtmlList(entries = []) {
  const items = entries
    .map((item) => item?.formattedText || buildFormattedText(item))
    .filter(Boolean)
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join('')

  return items ? `<ul>${items}</ul>` : ''
}