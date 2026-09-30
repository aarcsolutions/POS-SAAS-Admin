import * as XLSX from 'xlsx';

export const RECIPE_EXCEL_HEADERS = [
  'product_name',
  'variant_name',
  'raw_material_name',
  'quantity',
  'unit',
] as const;

export type RecipeExcelRow = {
  product_name: string;
  variant_name: string;
  raw_material_name: string;
  quantity: number;
  unit: string;
};

const HEADER_ALIASES: Record<string, keyof RecipeExcelRow> = {
  product_name: 'product_name',
  product: 'product_name',
  'product name': 'product_name',
  variant_name: 'variant_name',
  variant: 'variant_name',
  'variant name': 'variant_name',
  raw_material_name: 'raw_material_name',
  raw_material: 'raw_material_name',
  material: 'raw_material_name',
  'raw material': 'raw_material_name',
  'raw material name': 'raw_material_name',
  'material name': 'raw_material_name',
  quantity: 'quantity',
  qty: 'quantity',
  unit: 'unit',
};

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

export function downloadRecipeExcelTemplate(): void {
  const sheet = XLSX.utils.aoa_to_sheet([
    [...RECIPE_EXCEL_HEADERS],
    ['Zinger Burger', 'Regular', 'Chicken Patty', 1, 'pcs'],
    ['Zinger Burger', 'Regular', 'Bun', 1, 'pcs'],
    ['Fries', 'Large', 'Potato', 200, 'g'],
  ]);
  sheet['!cols'] = [
    { wch: 22 },
    { wch: 14 },
    { wch: 20 },
    { wch: 10 },
    { wch: 8 },
  ];
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Recipes');
  XLSX.writeFile(book, 'recipes-template.xlsx');
}

export async function parseRecipeExcelFile(
  file: File
): Promise<RecipeExcelRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('Excel file has no sheets');

  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  });
  if (!matrix.length) throw new Error('Excel file is empty');

  const headerRow = (matrix[0] || []).map(normalizeHeader);
  const colIndex: Partial<Record<keyof RecipeExcelRow, number>> = {};
  headerRow.forEach((header, index) => {
    const key = HEADER_ALIASES[header];
    if (key && colIndex[key] === undefined) colIndex[key] = index;
  });

  const required: (keyof RecipeExcelRow)[] = [
    'product_name',
    'variant_name',
    'raw_material_name',
    'quantity',
    'unit',
  ];
  for (const key of required) {
    if (colIndex[key] === undefined) {
      throw new Error(`Missing required column: ${key}`);
    }
  }

  const rows: RecipeExcelRow[] = [];
  for (let i = 1; i < matrix.length; i += 1) {
    const line = matrix[i] || [];
    const product_name = String(line[colIndex.product_name!] ?? '').trim();
    const variant_name = String(line[colIndex.variant_name!] ?? '').trim();
    const raw_material_name = String(
      line[colIndex.raw_material_name!] ?? ''
    ).trim();
    if (!product_name && !variant_name && !raw_material_name) continue;

    const quantity = toNumber(line[colIndex.quantity!]);
    const unit = String(line[colIndex.unit!] ?? '')
      .trim()
      .toLowerCase();

    if (!product_name || !variant_name || !raw_material_name) {
      throw new Error(
        `Row ${i + 1}: product_name, variant_name and raw_material_name are required`
      );
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error(`Row ${i + 1}: quantity must be greater than 0`);
    }
    if (!unit) {
      throw new Error(`Row ${i + 1}: unit is required`);
    }

    rows.push({
      product_name,
      variant_name,
      raw_material_name,
      quantity,
      unit,
    });
  }

  if (!rows.length) throw new Error('No recipe rows found in the file');
  return rows;
}
