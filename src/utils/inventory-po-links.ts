import type { InventoryBalanceItemType } from '@/types/inventory.types';

export type PoLineType =
  | InventoryBalanceItemType
  | 'raw_material'
  | 'product_variant'
  | 'inventory_item';

/** Build Create-PO deep link with correct line type + ids. */
export function createPoHref(opts: {
  lineType?: PoLineType | string | null;
  ids?: string[];
}): string {
  const params = new URLSearchParams();
  params.set('createPo', '1');
  const lineType = opts.lineType || 'raw_material';
  params.set('lineType', lineType);
  const ids = (opts.ids || []).filter(Boolean);
  if (ids.length > 0) {
    params.set('materials', ids.join(','));
  }
  return `/suppliers?${params.toString()}`;
}

export function itemTypeLabel(type?: string | null): string {
  switch (type) {
    case 'product_variant':
      return 'Product';
    case 'inventory_item':
      return 'Inventory Item';
    case 'raw_material':
    default:
      return 'Raw Material';
  }
}
