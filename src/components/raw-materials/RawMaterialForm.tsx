'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Loader2,
  Plus,
  Rows3,
  Trash2,
  LayoutList,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { RawMaterial, RawMaterialPayload } from '@/types/raw-material.types';
import { Select } from '@/components/ui/Select';
import {
  downloadRawMaterialExcelTemplate,
  parseRawMaterialExcelFile,
} from '@/utils/raw-material-excel';

interface Props {
  mode: 'create' | 'edit' | 'view';
  initial?: RawMaterial | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (
    payload: RawMaterialPayload | RawMaterialPayload[]
  ) => Promise<void> | void;
}

const UNITS = ['kg', 'g', 'liter', 'ml', 'pcs', 'box', 'packet'];

type Row = {
  key: string;
  name: string;
  unit: string;
  stock: number | '';
  minStock: number | '';
};

type RowErrors = Partial<
  Record<'name' | 'unit' | 'stock_quantity' | 'min_stock_level', string>
>;

const emptyRow = (): Row => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: '',
  unit: UNITS[0],
  stock: '',
  minStock: '',
});

const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]';

export default function RawMaterialForm({
  mode,
  initial,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const isReadOnly = mode === 'view';
  const canMulti = mode === 'create';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [multiMode, setMultiMode] = useState(false);
  const [importing, setImporting] = useState(false);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState(UNITS[0]);
  const [stock, setStock] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [rowErrors, setRowErrors] = useState<Record<string, RowErrors>>({});

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setUnit(initial.unit || UNITS[0]);
      setStock(Number(initial.stock_quantity ?? 0));
      setMinStock(Number(initial.min_stock_level ?? 0));
      setMultiMode(false);
    } else {
      setName('');
      setUnit(UNITS[0]);
      setStock('');
      setMinStock('');
      setRows([emptyRow()]);
      setRowErrors({});
    }
  }, [initial]);

  const title =
    mode === 'create'
      ? multiMode
        ? 'Add Multiple Raw Materials'
        : 'Add Raw Material'
      : mode === 'edit'
        ? 'Edit Raw Material'
        : 'Raw Material Details';

  const validateSingle = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Material name is required';
    if (!unit.trim()) next.unit = 'Unit is required';
    if (stock !== '' && Number(stock) < 0) {
      next.stock_quantity = 'Stock cannot be negative';
    }
    if (minStock !== '' && Number(minStock) < 0) {
      next.min_stock_level = 'Minimum quantity cannot be negative';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateMulti = () => {
    const next: Record<string, RowErrors> = {};
    let ok = true;
    const names = new Set<string>();

    rows.forEach((row) => {
      const err: RowErrors = {};
      const trimmed = row.name.trim();
      if (!trimmed) {
        err.name = 'Required';
        ok = false;
      } else if (names.has(trimmed.toLowerCase())) {
        err.name = 'Duplicate name';
        ok = false;
      } else {
        names.add(trimmed.toLowerCase());
      }
      if (!row.unit.trim()) {
        err.unit = 'Required';
        ok = false;
      }
      if (row.stock !== '' && Number(row.stock) < 0) {
        err.stock_quantity = 'Invalid';
        ok = false;
      }
      if (row.minStock !== '' && Number(row.minStock) < 0) {
        err.min_stock_level = 'Invalid';
        ok = false;
      }
      if (Object.keys(err).length) next[row.key] = err;
    });

    setRowErrors(next);
    return ok;
  };

  const updateRow = (key: string, patch: Partial<Row>) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r))
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (key: string) => {
    setRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((r) => r.key !== key)
    );
    setRowErrors((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleExcelUpload = async (file: File | null) => {
    if (!file) return;
    setImporting(true);
    try {
      const parsed = await parseRawMaterialExcelFile(file);
      const mapped: Row[] = parsed.map((item, index) => {
        const normalizedUnit = item.unit.toLowerCase();
        return {
          key: `excel-${Date.now()}-${index}`,
          name: item.name,
          unit: UNITS.includes(normalizedUnit) ? normalizedUnit : item.unit,
          stock: item.stock_quantity,
          minStock: item.min_stock_level,
        };
      });
      setMultiMode(true);
      setRows(mapped);
      setRowErrors({});
      setErrors({});
      toast.success(
        `${mapped.length} row${mapped.length === 1 ? '' : 's'} loaded from Excel`
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to read Excel file');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (multiMode && canMulti) {
      if (!validateMulti()) return;
      await onSubmit(
        rows.map((row) => ({
          name: row.name.trim(),
          unit: row.unit.trim(),
          stock_quantity: Number(row.stock === '' ? 0 : row.stock),
          min_stock_level: Number(row.minStock === '' ? 0 : row.minStock),
        }))
      );
      return;
    }

    if (!validateSingle()) return;
    await onSubmit({
      name: name.trim(),
      unit: unit.trim(),
      stock_quantity: Number(stock === '' ? 0 : stock),
      min_stock_level: Number(minStock === '' ? 0 : minStock),
    });
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onClose}
        className="flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)] transition hover:text-[var(--brand-icon)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Raw Materials
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {canMulti && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => downloadRawMaterialExcelTemplate()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Download className="h-4 w-4" /> Template
              </button>
              <button
                type="button"
                disabled={importing || saving}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload Excel
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                className="hidden"
                onChange={(e) =>
                  handleExcelUpload(e.target.files?.[0] || null)
                }
              />
              <button
                type="button"
                onClick={() => {
                  setMultiMode((v) => !v);
                  setErrors({});
                  setRowErrors({});
                }}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  multiMode
                    ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    : 'border-[var(--brand-primary)] bg-[var(--brand-icon-soft)] text-[var(--brand-icon)] hover:brightness-95'
                }`}
              >
                {multiMode ? (
                  <>
                    <LayoutList className="h-4 w-4" /> Single form
                  </>
                ) : (
                  <>
                    <Rows3 className="h-4 w-4" /> Add multiple
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className={
            multiMode && canMulti ? 'space-y-5' : 'max-w-2xl space-y-5'
          }
        >
          {multiMode && canMulti ? (
            <>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <FileSpreadsheet className="h-4 w-4 shrink-0 text-[var(--brand-icon)]" />
                <span>
                  Columns: <strong>name</strong>, <strong>unit</strong>,{' '}
                  <strong>stock_quantity</strong>,{' '}
                  <strong>min_stock_level</strong>. Upload fills rows below —
                  review then create.
                </span>
              </div>

              <p className="text-sm text-slate-500">
                Add one material per row. Use + to add more rows, then create
                them all at once.
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-[minmax(0,1.4fr)_110px_120px_120px_88px] gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span>Material Name *</span>
                    <span>Unit *</span>
                    <span>Initial Stock</span>
                    <span>Min Qty</span>
                    <span className="text-center">Actions</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {rows.map((row, index) => {
                      const err = rowErrors[row.key] || {};
                      return (
                        <div
                          key={row.key}
                          className="grid grid-cols-[minmax(0,1.4fr)_110px_120px_120px_88px] items-start gap-2 px-3 py-3"
                        >
                          <div>
                            <input
                              type="text"
                              value={row.name}
                              onChange={(e) =>
                                updateRow(row.key, { name: e.target.value })
                              }
                              placeholder={`Material ${index + 1}`}
                              className={inputClass}
                            />
                            {err.name && (
                              <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">
                                {err.name}
                              </p>
                            )}
                          </div>
                          <div>
                            <Select
                              value={row.unit}
                              onChange={(v) => updateRow(row.key, { unit: v })}
                              variant="form"
                              size="lg"
                              allowEmpty={false}
                              options={[
                                ...(!UNITS.includes(row.unit) && row.unit
                                  ? [{ value: row.unit, label: row.unit }]
                                  : []),
                                ...UNITS.map((u) => ({ value: u, label: u })),
                              ]}
                            />
                            {err.unit && (
                              <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">
                                {err.unit}
                              </p>
                            )}
                          </div>
                          <div>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={row.stock}
                              onChange={(e) =>
                                updateRow(row.key, {
                                  stock:
                                    e.target.value === ''
                                      ? ''
                                      : Number(e.target.value),
                                })
                              }
                              placeholder="0"
                              className={inputClass}
                            />
                            {err.stock_quantity && (
                              <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">
                                {err.stock_quantity}
                              </p>
                            )}
                          </div>
                          <div>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={row.minStock}
                              onChange={(e) =>
                                updateRow(row.key, {
                                  minStock:
                                    e.target.value === ''
                                      ? ''
                                      : Number(e.target.value),
                                })
                              }
                              placeholder="0"
                              className={inputClass}
                            />
                            {err.min_stock_level && (
                              <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">
                                {err.min_stock_level}
                              </p>
                            )}
                          </div>
                          <div className="flex h-11 items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={addRow}
                              title="Add row"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--brand-primary)] bg-[var(--brand-icon-soft)] text-[var(--brand-icon)] transition hover:brightness-95"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeRow(row.key)}
                              disabled={rows.length <= 1}
                              title="Remove row"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Min Qty triggers low-stock alerts when current stock reaches
                that level.
              </p>
            </>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Material Name{' '}
                  {!isReadOnly && (
                    <span className="text-[var(--brand-primary)]">*</span>
                  )}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  readOnly={isReadOnly}
                  placeholder="e.g. Flour"
                  className={`${inputClass} ${isReadOnly ? 'opacity-70' : ''}`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Unit{' '}
                  {!isReadOnly && (
                    <span className="text-[var(--brand-primary)]">*</span>
                  )}
                </label>
                <Select
                  value={unit}
                  onChange={setUnit}
                  disabled={isReadOnly}
                  variant="form"
                  size="lg"
                  allowEmpty={false}
                  triggerClassName={isReadOnly ? 'opacity-70' : ''}
                  options={[
                    ...(!UNITS.includes(unit) && unit
                      ? [{ value: unit, label: unit }]
                      : []),
                    ...UNITS.map((u) => ({ value: u, label: u })),
                  ]}
                />
                {errors.unit && (
                  <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">
                    {errors.unit}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {mode === 'create'
                    ? 'Initial Stock Quantity'
                    : 'Stock Quantity'}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={stock}
                  onChange={(e) =>
                    setStock(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  readOnly={isReadOnly}
                  placeholder="0"
                  className={`${inputClass} ${isReadOnly ? 'opacity-70' : ''}`}
                />
                {errors.stock_quantity && (
                  <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">
                    {errors.stock_quantity}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Minimum Quantity
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={minStock}
                  onChange={(e) =>
                    setMinStock(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  readOnly={isReadOnly}
                  placeholder="0"
                  className={`${inputClass} ${isReadOnly ? 'opacity-70' : ''}`}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Low-stock alert when current stock reaches this level
                </p>
                {errors.min_stock_level && (
                  <p className="mt-1 text-xs text-[var(--brand-primary-dark)]">
                    {errors.min_stock_level}
                  </p>
                )}
              </div>
            </>
          )}

          {!isReadOnly && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || importing}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] transition hover:brightness-95 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === 'create'
                  ? multiMode
                    ? `Create Materials (${rows.length})`
                    : 'Create Material'
                  : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
