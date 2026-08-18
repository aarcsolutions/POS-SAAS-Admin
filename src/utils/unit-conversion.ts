export type UnitFamily = 'mass' | 'volume' | 'count';

const UNIT_ALIASES: Record<string, string> = {
  kg: 'kg',
  g: 'g',
  liter: 'liter',
  l: 'liter',
  ml: 'ml',
  pcs: 'pcs',
  piece: 'pcs',
  pieces: 'pcs',
  box: 'box',
  packet: 'packet',
  gram: 'g',
  grams: 'g',
  kilogram: 'kg',
  kilograms: 'kg',
  liters: 'liter',
};

const FAMILY: Record<string, UnitFamily> = {
  kg: 'mass',
  g: 'mass',
  liter: 'volume',
  ml: 'volume',
  pcs: 'count',
  box: 'count',
  packet: 'count',
};

export function normalizeUnit(unit: string): string {
  return UNIT_ALIASES[String(unit || '').trim().toLowerCase()] || String(unit || '').toLowerCase();
}

export function getCompatibleUnits(rmUnit: string): string[] {
  const u = normalizeUnit(rmUnit);
  const family = FAMILY[u] || 'count';
  if (family === 'mass') return ['kg', 'g'];
  if (family === 'volume') return ['liter', 'ml'];
  if (u === 'pcs') return ['pcs'];
  return [u, 'pcs'].filter((x, i, arr) => arr.indexOf(x) === i);
}
