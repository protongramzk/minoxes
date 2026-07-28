import Dexie from 'dexie';

/**
 * @typedef {Object} DocumentRecord
 * @property {number} [id]
 * @property {string} name
 * @property {string} type
 * @property {number} size
 * @property {string} date
 * @property {Blob} blob
 */

class MinoxesDatabase extends Dexie {
	constructor() {
		super('MinoxesDatabase');
		this.version(1).stores({
			documents: '++id, name, type, size, date'
		});

		/** @type {import('dexie').Table<DocumentRecord, number>} */
		this.documents = this.table('documents');
	}
}

export const db = new MinoxesDatabase();

/**
 * Helper function to map files or save documents
 * @param {File} file
 */
export async function saveDocument(file) {
	const doc = {
		name: file.name,
		type: determineDocType(file.name, file.type),
		size: file.size,
		date: new Date().toISOString(),
		blob: file // Storing the file/blob itself
	};
	return await db.documents.add(doc);
}

/**
 * Determines document category type from filename and MIME type
 * @param {string} filename
 * @param {string} mimeType
 * @returns {string}
 */
export function determineDocType(filename, mimeType) {
	const ext = filename.split('.').pop()?.toLowerCase() || '';

	if (ext === 'md' || ext === 'markdown') return 'md';
	if (ext === 'txt') return 'txt';
	if (ext === 'pdf' || mimeType === 'application/pdf') return 'pdf';
	if (ext === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
	if (ext === 'xlsx' || ext === 'xls' || ext === 'csv' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimeType === 'text/csv') return 'sheet';
	if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext) || mimeType?.startsWith('image/')) return 'image';

	// Fallback/Default
	return 'txt';
}
