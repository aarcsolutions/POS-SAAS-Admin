'use client';

import {
  ArrowLeft,
  Ban,
  Download,
  Loader2,
  Mail,
  PackageCheck,
  Printer,
  Send,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  useCancelPurchaseMutation,
  useMarkOrderedMutation,
  usePurchaseQuery,
  useReceivePurchaseMutation,
  useSendPurchaseEmailMutation,
} from '@/hooks/suppliers';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import { PurchaseRow, PurchaseStatus } from '@/types/supplier.types';
import { confirmDialog } from '@/store/dialogStore';

interface Props {
  purchase: PurchaseRow;
  onClose: () => void;
}

const STATUS_BADGE: Record<PurchaseStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  ordered: 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]',
  received: 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]',
  cancelled: 'bg-rose-100 text-rose-700',
};

function formatMoney(n: number) {
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function materialLabel(item: {
  raw_material_name?: string | null;
  raw_material_id: string;
  raw_material_unit?: string | null;
}) {
  const name = item.raw_material_name?.trim() || item.raw_material_id;
  return item.raw_material_unit ? `${name} (${item.raw_material_unit})` : name;
}

function downloadPurchasePdf(purchase: PurchaseRow) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  let y = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const usable = pageWidth - margin * 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Purchase Order', margin, y);
  y += 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(
    `${purchase.po_number || purchase.id} · ${purchase.status}`,
    margin,
    y
  );
  y += 24;
  doc.setTextColor(15);

  const meta: string[] = [
    `Supplier: ${purchase.supplier_name || purchase.supplier_id}`,
  ];
  if (purchase.supplier_email) meta.push(`Email: ${purchase.supplier_email}`);
  if (purchase.branch_name) meta.push(`Branch: ${purchase.branch_name}`);
  if (purchase.ordered_at) {
    meta.push(`Ordered: ${new Date(purchase.ordered_at).toLocaleString()}`);
  }
  if (purchase.received_at) {
    meta.push(`Received: ${new Date(purchase.received_at).toLocaleString()}`);
  }

  meta.forEach((line) => {
    doc.text(line, margin, y);
    y += 16;
  });
  y += 12;

  const cols = [
    { label: 'Material', x: margin, w: usable * 0.42 },
    { label: 'Qty', x: margin + usable * 0.42, w: usable * 0.14 },
    { label: 'Unit price', x: margin + usable * 0.56, w: usable * 0.2 },
    { label: 'Line total', x: margin + usable * 0.76, w: usable * 0.24 },
  ];

  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y - 12, usable, 22, 'F');
  doc.setFont('helvetica', 'bold');
  cols.forEach((c, i) => {
    doc.text(c.label, i === 0 ? c.x : c.x + c.w, y, {
      align: i === 0 ? 'left' : 'right',
    });
  });
  y += 18;

  doc.setFont('helvetica', 'normal');
  const items = purchase.items || [];
  items.forEach((item) => {
    if (y > doc.internal.pageSize.getHeight() - 72) {
      doc.addPage();
      y = margin;
    }
    const lineTotal = Number(item.quantity) * Number(item.price);
    const name = materialLabel(item);
    const wrapped = doc.splitTextToSize(name, cols[0].w - 4);
    doc.text(wrapped, cols[0].x, y);
    doc.text(String(item.quantity), cols[1].x + cols[1].w, y, {
      align: 'right',
    });
    doc.text(formatMoney(item.price), cols[2].x + cols[2].w, y, {
      align: 'right',
    });
    doc.text(formatMoney(lineTotal), cols[3].x + cols[3].w, y, {
      align: 'right',
    });
    y += Math.max(18, wrapped.length * 12 + 6);
  });

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(
    `Total: ${formatMoney(purchase.total_amount)}`,
    pageWidth - margin,
    y,
    { align: 'right' }
  );
  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Stock updates only after goods are received.', margin, y);

  doc.save(`purchase-${purchase.po_number || purchase.id}.pdf`);
}

export default function PurchaseReceipt({ purchase: initial, onClose }: Props) {
  const canMarkOrdered = usePermission(
    ENTITY_PERMS.suppliers.extras.markOrdered
  );
  const canReceive = usePermission(
    ENTITY_PERMS.suppliers.extras.receivePurchase
  );
  const canCancel = usePermission(
    ENTITY_PERMS.suppliers.extras.cancelPurchase
  );
  const canEmail = usePermission(
    ENTITY_PERMS.suppliers.extras.sendPurchaseEmail
  );

  const { data: detailRes } = usePurchaseQuery(initial.id);
  const purchase: PurchaseRow = detailRes?.data
    ? { ...initial, ...detailRes.data }
    : initial;

  const markOrderedMutation = useMarkOrderedMutation();
  const receiveMutation = useReceivePurchaseMutation();
  const cancelMutation = useCancelPurchaseMutation();
  const emailMutation = useSendPurchaseEmailMutation();

  const status = purchase.status;
  const busy =
    markOrderedMutation.isPending ||
    receiveMutation.isPending ||
    cancelMutation.isPending ||
    emailMutation.isPending;

  const handleDownload = () => {
    downloadPurchasePdf(purchase);
  };

  const handleMarkOrdered = async () => {
    const ok = await confirmDialog({
      title: 'Mark as ordered',
      message: 'Confirm this PO has been sent/ordered with the supplier?',
      confirmLabel: 'Mark ordered',
    });
    if (!ok) return;
    markOrderedMutation.mutate(purchase.id);
  };

  const handleReceive = async () => {
    const ok = await confirmDialog({
      title: 'Receive goods',
      message:
        'Receive all ordered quantities and update raw material stock? This cannot be undone easily.',
      confirmLabel: 'Receive',
    });
    if (!ok) return;
    receiveMutation.mutate({ id: purchase.id });
  };

  const handleCancel = async () => {
    const ok = await confirmDialog({
      title: 'Cancel purchase order',
      message: 'Cancel this PO? It will no longer be actionable.',
      confirmLabel: 'Cancel PO',
      variant: 'danger',
    });
    if (!ok) return;
    cancelMutation.mutate(purchase.id);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .po-print-root, .po-print-root * { visibility: visible !important; }
          .po-print-root { position: absolute; left: 0; top: 0; width: 100%; }
          .po-no-print { display: none !important; }
        }
      `}</style>

      <div className="po-no-print mb-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Suppliers
        </button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Purchase Order
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {purchase.po_number || purchase.id}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
            {canEmail && status !== 'cancelled' && (
              <button
                type="button"
                disabled={busy}
                onClick={() => emailMutation.mutate(purchase.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {emailMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Send email
              </button>
            )}
            {canMarkOrdered && status === 'draft' && (
              <button
                type="button"
                disabled={busy}
                onClick={handleMarkOrdered}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
              >
                {markOrderedMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Mark ordered
              </button>
            )}
            {canReceive && (status === 'draft' || status === 'ordered') && (
              <button
                type="button"
                disabled={busy}
                onClick={handleReceive}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
              >
                {receiveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PackageCheck className="h-4 w-4" />
                )}
                Receive
              </button>
            )}
            {canCancel &&
              status !== 'received' &&
              status !== 'cancelled' && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                >
                  {cancelMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Ban className="h-4 w-4" />
                  )}
                  Cancel
                </button>
              )}
          </div>
        </div>
      </div>

      <div className="po-print-root overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Purchase order
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {purchase.po_number || purchase.id}
              </div>
              <div className="mt-2 text-sm text-slate-600">
                Supplier:{' '}
                <span className="font-semibold text-slate-800">
                  {purchase.supplier_name || purchase.supplier_id}
                </span>
              </div>
              {purchase.supplier_email && (
                <div className="text-sm text-slate-500">
                  {purchase.supplier_email}
                </div>
              )}
              {purchase.branch_name && (
                <div className="mt-1 text-sm text-slate-500">
                  Branch: {purchase.branch_name}
                </div>
              )}
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_BADGE[status] || STATUS_BADGE.draft}`}
            >
              {status}
            </span>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-white text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-3 font-bold">Material</th>
              <th className="px-6 py-3 font-bold text-right">Qty</th>
              <th className="px-6 py-3 font-bold text-right">Unit price</th>
              <th className="px-6 py-3 font-bold text-right">Line total</th>
              {(status === 'received' ||
                purchase.items?.some(
                  (i) => i.received_quantity != null
                )) && (
                <th className="px-6 py-3 font-bold text-right">Received</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(purchase.items || []).map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-3 font-medium text-slate-800">
                  {materialLabel(item)}
                </td>
                <td className="px-6 py-3 text-right text-slate-700">
                  {item.quantity}
                </td>
                <td className="px-6 py-3 text-right text-slate-700">
                  {formatMoney(item.price)}
                </td>
                <td className="px-6 py-3 text-right font-semibold text-slate-800">
                  {formatMoney(Number(item.quantity) * Number(item.price))}
                </td>
                {(status === 'received' ||
                  purchase.items?.some(
                    (i) => i.received_quantity != null
                  )) && (
                  <td className="px-6 py-3 text-right text-slate-600">
                    {item.received_quantity ?? '—'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-col gap-2 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            {purchase.created_at
              ? `Created ${new Date(purchase.created_at).toLocaleString()}`
              : null}
            {purchase.ordered_at
              ? ` · Ordered ${new Date(purchase.ordered_at).toLocaleString()}`
              : null}
            {purchase.received_at
              ? ` · Received ${new Date(purchase.received_at).toLocaleString()}`
              : null}
            {purchase.email_status
              ? ` · Email: ${purchase.email_status}`
              : null}
          </div>
          <div className="text-base font-bold text-slate-900">
            Total {formatMoney(purchase.total_amount)}
          </div>
        </div>
      </div>
    </div>
  );
}
