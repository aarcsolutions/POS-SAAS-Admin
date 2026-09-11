'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { tenantBillingApi } from '@/services/tenant-billing';
import { downloadInvoicePdf, type InvoicePdfData } from '@/utils/invoice-pdf';
import { toast } from 'sonner';

type Props = {
  invoiceId: string;
  onClose: () => void;
  onSubmitPayment?: () => void;
  canPay?: boolean;
};

function money(currency: string, n?: number | string | null) {
  return `${currency} ${Number(n || 0).toFixed(2)}`;
}

export default function InvoiceDetail({
  invoiceId,
  onClose,
  onSubmitPayment,
  canPay,
}: Props) {
  const [invoice, setInvoice] = useState<InvoicePdfData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await tenantBillingApi.myInvoiceById(invoiceId);
        const data = (res?.data ?? res) as InvoicePdfData;
        if (!cancelled) setInvoice(data);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load invoice');
        if (!cancelled) onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per invoiceId
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
    );
  }

  if (!invoice) return null;

  const unpaid = invoice.status === 'open' || invoice.status === 'overdue';

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onClose}
            className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Billing
          </button>
          <h1 className="font-mono text-2xl font-bold text-slate-900">
            {invoice.invoice_number}
          </h1>
          <p className="mt-1 text-sm uppercase tracking-wide text-slate-500">
            {invoice.status}
            {invoice.due_date
              ? ` · Due ${new Date(invoice.due_date).toLocaleDateString()}`
              : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadInvoicePdf(invoice)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
          {canPay && unpaid && onSubmitPayment ? (
            <button
              type="button"
              onClick={onSubmitPayment}
              className="rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Submit payment
            </button>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Currency
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {invoice.currency}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Paid at
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {invoice.paid_at
                ? new Date(invoice.paid_at).toLocaleString()
                : '—'}
            </p>
          </div>
          {invoice.notes ? (
            <div className="sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Notes
              </p>
              <p className="mt-1 text-sm text-slate-700">{invoice.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-3 font-bold">Description</th>
                <th className="pb-3 pr-3 font-bold">Qty</th>
                <th className="pb-3 pr-3 font-bold">Unit</th>
                <th className="pb-3 text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(invoice.lines?.length
                ? invoice.lines
                : [
                    {
                      description: 'Subscription / services',
                      quantity: 1,
                      unit_amount: invoice.total,
                      amount: invoice.total,
                    },
                  ]
              ).map((line, idx) => (
                <tr key={idx}>
                  <td className="py-3 pr-3 text-slate-800">
                    {line.description || 'Item'}
                  </td>
                  <td className="py-3 pr-3 text-slate-600">{line.quantity ?? 1}</td>
                  <td className="py-3 pr-3 text-slate-600">
                    {money(invoice.currency, line.unit_amount)}
                  </td>
                  <td className="py-3 text-right font-medium text-slate-900">
                    {money(
                      invoice.currency,
                      line.amount ??
                        Number(line.quantity || 1) * Number(line.unit_amount || 0)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col items-end gap-1 border-t border-slate-100 pt-4 text-sm">
          <div className="flex w-56 justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{money(invoice.currency, invoice.subtotal)}</span>
          </div>
          <div className="flex w-56 justify-between text-slate-600">
            <span>Tax</span>
            <span>{money(invoice.currency, invoice.tax_amount)}</span>
          </div>
          <div className="flex w-56 justify-between text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{money(invoice.currency, invoice.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
