'use client';

import { DollarSign, Plus, Trash2 } from 'lucide-react';
import { Card, Label, Inp, Sel, PKRInput } from './FormUI';
import { ProductFormData } from './types';

interface Props {
  data: ProductFormData;
  onChange: <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => void;
}

const taxOptions = ['Sales Tax', 'VAT', 'GST', 'No Tax'];

export default function Step2Pricing({ data, onChange }: Props) {
  const margin = data.sellingPrice > 0 ? ((data.sellingPrice - data.costPrice) / data.sellingPrice * 100).toFixed(1) : '0.0';

  const addTier = () => {
    onChange('bulkPricing', [...data.bulkPricing, { id: Math.random().toString(36).substr(2, 9), quantity: 10, price: 0 }]);
  };

  const updateTier = (id: string, field: 'quantity' | 'price', value: number) => {
    onChange('bulkPricing', data.bulkPricing.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const removeTier = (id: string) => {
    onChange('bulkPricing', data.bulkPricing.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-5">
      <Card icon={DollarSign} title="Pricing Details">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label req>Selling Price</Label>
            <PKRInput value={data.sellingPrice} onChange={(v) => onChange('sellingPrice', v)} />
          </div>
          <div>
            <Label req>Cost Price</Label>
            <PKRInput value={data.costPrice} onChange={(v) => onChange('costPrice', v)} />
            <p className="mt-1 text-xs text-slate-500">Your actual cost — used for profit margin calculation.</p>
          </div>
          <div>
            <Label>Tax / VAT</Label>
            <Sel value={data.taxVat} onChange={(e) => onChange('taxVat', e.target.value)}>
              {taxOptions.map((t) => (<option key={t} value={t}>{t}</option>))}
            </Sel>
          </div>
          <div>
            <Label>Profit Margin</Label>
            <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
              {data.sellingPrice > 0 && data.costPrice > 0 ? `${margin}%` : 'Enter prices above to calculate'}
            </div>
          </div>
        </div>
      </Card>

      <Card icon={DollarSign} title="Discount & Promotions">
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <Label>Discount Percentage (%)</Label>
            <div className="relative">
              <Inp type="number" value={data.discountPercentage || ''} onChange={(e) => onChange('discountPercentage', Number(e.target.value))} placeholder="0" />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
            </div>
          </div>
          <div>
            <Label>Discount Start Date</Label>
            <Inp type="date" value={data.discountStartDate} onChange={(e) => onChange('discountStartDate', e.target.value)} />
          </div>
          <div>
            <Label>Discount End Date</Label>
            <Inp type="date" value={data.discountEndDate} onChange={(e) => onChange('discountEndDate', e.target.value)} />
          </div>
        </div>
      </Card>

      <Card icon={DollarSign} title="Bulk Pricing (Wholesale / Volume Discounts)">
        <p className="mb-3 text-sm text-slate-500">Set special pricing tiers for large quantity orders.</p>
        {data.bulkPricing.length > 0 && (
          <div className="mb-4 space-y-2">
            {data.bulkPricing.map((tier) => (
              <div key={tier.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex-1">
                  <Label>Quantity</Label>
                  <Inp type="number" value={tier.quantity} onChange={(e) => updateTier(tier.id, 'quantity', Number(e.target.value))} />
                </div>
                <div className="flex-1">
                  <Label>Price per unit (PKR)</Label>
                  <Inp type="number" value={tier.price} onChange={(e) => updateTier(tier.id, 'price', Number(e.target.value))} />
                </div>
                <button onClick={() => removeTier(tier.id)} className="mt-5 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <button onClick={addTier} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
          <Plus className="h-4 w-4" /> Add Pricing Tier
        </button>
      </Card>
    </div>
  );
}
