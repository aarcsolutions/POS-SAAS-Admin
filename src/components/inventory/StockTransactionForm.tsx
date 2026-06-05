'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react';

interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  supplier: string;
  lastUpdated: string;
  status: 'optimal' | 'low' | 'critical' | 'out';
}

interface StockTransactionFormProps {
  type: 'in' | 'out';
  inventory: InventoryItem[];
  reasons: string[];
  onClose: () => void;
  onSubmit: (data: {
    type: 'in' | 'out';
    productName: string;
    sku: string;
    quantity: number;
    unit: string;
    reason: string;
    supplier?: string;
    reference: string;
    notes: string;
  }) => void;
}

export default function StockTransactionForm({ type, inventory, reasons, onClose, onSubmit }: StockTransactionFormProps) {
  const [saving, setSaving] = useState(false);
  const [selectedSku, setSelectedSku] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState(reasons[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [supplier, setSupplier] = useState('');

  const selectedItem = inventory.find((item) => item.sku === selectedSku);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !quantity || !reference) return;
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    onSubmit({
      type,
      productName: selectedItem.productName,
      sku: selectedItem.sku,
      quantity: Number(quantity),
      unit: selectedItem.unit,
      reason,
      supplier: type === 'in' ? supplier || selectedItem.supplier : undefined,
      reference,
      notes,
    });
    setSaving(false);
  };

  const title = type === 'in' ? 'Stock In (Receive)' : 'Stock Out (Dispatch)';
  const subtitle = type === 'in'
    ? 'Record incoming stock from suppliers or transfers.'
    : 'Record outgoing stock for sales, production, or adjustments.';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </button>
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {type === 'in' ? <ArrowDownLeft className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">Transaction Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Product Selection */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Product <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedSku}
                  onChange={(e) => {
                    setSelectedSku(e.target.value);
                    const item = inventory.find((i) => i.sku === e.target.value);
                    if (item) setSupplier(item.supplier);
                  }}
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="">Choose a product...</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.sku}>
                      {item.productName} ({item.sku}) — Current: {item.currentStock} {item.unit}
                    </option>
                  ))}
                </select>
              </div>
              {selectedItem && (
                <div className="mt-2 flex items-center gap-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                  <span>Current Stock: <strong className="text-slate-800">{selectedItem.currentStock} {selectedItem.unit}</strong></span>
                  <span>Min Stock: <strong className="text-slate-800">{selectedItem.minStock} {selectedItem.unit}</strong></span>
                  <span>Supplier: <strong className="text-slate-800">{selectedItem.supplier}</strong></span>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min={1}
                required
                placeholder="Enter quantity"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Reason <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  {reasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Supplier (only for Stock In) */}
            {type === 'in' && (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Supplier
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Supplier name"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            )}

            {/* Reference */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Reference No <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
                placeholder="e.g. PO-2024-0012"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Additional details about this transaction..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !selectedSku || !quantity || !reference}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed ${
                type === 'in'
                  ? 'bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700'
                  : 'bg-amber-600 shadow-amber-600/20 hover:bg-amber-700'
              }`}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Saving...' : type === 'in' ? 'Record Stock In' : 'Record Stock Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
