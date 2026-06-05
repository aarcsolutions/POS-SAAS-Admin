'use client';

import { Package, AlertTriangle } from 'lucide-react';
import { Card, Label, Inp, Radio } from './FormUI';
import { ProductFormData } from './types';

interface Props {
  data: ProductFormData;
  onChange: <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => void;
}

export default function Step4Inventory({ data, onChange }: Props) {
  const isLow = data.trackInventory && data.stockQuantity > 0 && data.stockQuantity <= 10;

  return (
    <div className="space-y-5">
      <Card icon={Package} title="Inventory Management">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <div className="mb-3 text-sm font-semibold text-slate-800">Check Availability / Track Stock</div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2.5">
                <Radio name="trackInventory" checked={data.trackInventory} onChange={() => onChange('trackInventory', true)} />
                <span className="text-sm text-slate-800">Yes — Track inventory</span>
              </label>
              <label className="flex items-center gap-2.5">
                <Radio name="trackInventory" checked={!data.trackInventory} onChange={() => onChange('trackInventory', false)} />
                <span className="text-sm text-slate-800">No — Always available</span>
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-500">When enabled, prevents selling when out of stock.</p>
          </div>
          <div>
            <Label req>Stock Quantity</Label>
            <Inp type="number" value={data.stockQuantity || ''} onChange={(e) => onChange('stockQuantity', Number(e.target.value))} placeholder="0" />
            {isLow && (
              <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                <AlertTriangle className="h-3 w-3" /> Low stock warning — consider restocking
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card icon={Package} title="Package Dimensions & Weight">
        <div className="grid gap-5 md:grid-cols-4">
          <div>
            <Label>Weight (kg)</Label>
            <Inp type="number" step="0.01" value={data.weight || ''} onChange={(e) => onChange('weight', Number(e.target.value))} placeholder="0.00" />
          </div>
          <div>
            <Label>Width (cm)</Label>
            <Inp type="number" value={data.width || ''} onChange={(e) => onChange('width', Number(e.target.value))} placeholder="0" />
          </div>
          <div>
            <Label>Length (cm)</Label>
            <Inp type="number" value={data.length || ''} onChange={(e) => onChange('length', Number(e.target.value))} placeholder="0" />
          </div>
          <div>
            <Label>Height (cm)</Label>
            <Inp type="number" value={data.height || ''} onChange={(e) => onChange('height', Number(e.target.value))} placeholder="0" />
          </div>
        </div>
      </Card>
    </div>
  );
}
