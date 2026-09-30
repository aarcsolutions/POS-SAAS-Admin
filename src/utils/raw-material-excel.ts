import * as XLSX from 'xlsx';

export const RAW_MATERIAL_EXCEL_HEADERS = [
  'name',
  'unit',
  'stock_quantity',
  'min_stock_level',
] as const;

export type RawMaterialExcelRow = {
  name: string;
  unit: string;
  stock_quantity: number;
  min_stock_level: number;
};

const HEADER_ALIASES: Record<string, keyof RawMaterialExcelRow> = {
  name: 'name',
  material: 'name',
  material_name: 'name',
  'material name': 'name',
  unit: 'unit',
  stock: 'stock_quantity',
  stock_quantity: 'stock_quantity',
  initial_stock: 'stock_quantity',
  'initial stock': 'stock_quantity',
  'initial stock quantity': 'stock_quantity',
  min_stock: 'min_stock_level',
  min_stock_level: 'min_stock_level',
  minimum_quantity: 'min_stock_level',
  'minimum quantity': 'min_stock_level',
  'min qty': 'min_stock_level',
};

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function toNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Download a blank Excel template users can fill and re-upload. */
export function downloadRawMaterialExcelTemplate(): void {
  const sheet = XLSX.utils.aoa_to_sheet([
    [...RAW_MATERIAL_EXCEL_HEADERS],
    ['Flour', 'kg', 0, 5],
    ['Chicken Patty', 'pcs', 0, 10],
  ]);
  sheet['!cols'] = [{ wch: 22 }, { wch: 10 }, { wch: 16 }, { wch: 16 }];
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Raw Materials');
  XLSX.writeFile(book, 'raw-materials-template.xlsx');
}

/**
 * Parse .xlsx / .xls / .csv into raw material rows.
 * First sheet only; first row must be headers (aliases supported).
 */
export async function parseRawMaterialExcelFile(
  file: File
): Promise<RawMaterialExcelRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('Excel file has no sheets');
  }

  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  });

  if (!matrix.length) {
    throw new Error('Excel file is empty');
  }

  const headerRow = (matrix[0] || []).map(normalizeHeader);
  const colIndex: Partial<Record<keyof RawMaterialExcelRow, number>> = {};

  headerRow.forEach((header, index) => {
    const key = HEADER_ALIASES[header];
    if (key && colIndex[key] === undefined) {
      colIndex[key] = index;
    }
  });

  if (colIndex.name === undefined) {
    throw new Error(
      'Missing required column: name (also accepts "Material Name")'
    );
  }
  if (colIndex.unit === undefined) {
    throw new Error('Missing required column: unit');
  }

  const rows: RawMaterialExcelRow[] = [];

  for (let i = 1; i < matrix.length; i += 1) {
    const line = matrix[i] || [];
    const name = String(line[colIndex.name!] ?? '').trim();
    if (!name) continue;

    const unit = String(line[colIndex.unit!] ?? '')
      .trim()
      .toLowerCase();
    const stock_quantity = toNumber(
      colIndex.stock_quantity !== undefined
        ? line[colIndex.stock_quantity]
        : 0
    );
    const min_stock_level = toNumber(
      colIndex.min_stock_level !== undefined
        ? line[colIndex.min_stock_level]
        : 0
    );

    rows.push({
      name,
      unit: unit || 'kg',
      stock_quantity: stock_quantity < 0 ? 0 : stock_quantity,
      min_stock_level: min_stock_level < 0 ? 0 : min_stock_level,
    });
  }

  if (!rows.length) {
    throw new Error('No material rows found in the file');
  }

  return rows;
}
