'use client';

import { useMemo, useState } from 'react';
import {
  CreditCard,
  Download,
  Eye,
  FileText,
  Loader2,
  Upload,
} from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useSubmitTenantPaymentMutation,
  useTenantInvoicesQuery,
  useTenantPaymentsQuery,
} from '@/hooks/tenant-billing';
import { filesApi } from '@/services/files';
import { tenantBillingApi } from '@/services/tenant-billing';
import { downloadInvoicePdf } from '@/utils/invoice-pdf';
import InvoiceDetail from '@/components/billing/InvoiceDetail';
import { extractListItems, extractPagination } from '@/utils/helpers';
import { toast } from 'sonner';

type InvoiceRow = {
  id: string;
  invoice_number: string;
  status: string;
  total: number;
  currency: string;
  due_date?: string | null;
};

export default function BillingPage() {
  const canView = usePermission(ENTITY_PERMS.tenant_billing.list);
  const canPay = usePermission(ENTITY_PERMS.tenant_billing.submit);
  const canRead = usePermission(ENTITY_PERMS.tenant_billing.read);

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [payInvoice, setPayInvoice] = useState<InvoiceRow | null>(null);
  const [method, setMethod] = useState('bank_transfer');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofKey, setProofKey] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);

  const invoicesQuery = useTenantInvoicesQuery(
    {
      page,
      limit: 10,
      status: statusFilter || undefined,
    },
    canView
  );
  const paymentsQuery = useTenantPaymentsQuery({ page: 1, limit: 20 }, canView);
  const submitMutation = useSubmitTenantPaymentMutation();

  const invoices = extractListItems<InvoiceRow>(invoicesQuery.data);
  const payments = extractListItems<any>(paymentsQuery.data);
  const pagination = extractPagination(invoicesQuery.data);

  const unpaid = useMemo(
    () => invoices.filter((i) => i.status === 'open' || i.status === 'overdue'),
    [invoices]
  );

  const onUpload = async (file: File | null) => {
    if (!file) return;
    try {
      setUploading(true);
      const result = await filesApi.uploadAndResolveUrl(file, 'payment-proofs');
      setProofUrl(result.url);
      setProofKey(result.fileKey);
      toast.success('Proof uploaded');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!payInvoice || !proofUrl) {
      toast.error('Upload a payment screenshot first');
      return;
    }
    await submitMutation.mutateAsync({
      invoice_id: payInvoice.id,
      method,
      transaction_ref: transactionRef.trim() || undefined,
      notes: notes.trim() || undefined,
      proof_url: proofUrl,
      proof_file_key: proofKey || undefined,
    });
    setPayInvoice(null);
    setProofUrl('');
    setProofKey('');
    setTransactionRef('');
    setNotes('');
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      setPdfLoadingId(id);
      const res = await tenantBillingApi.myInvoiceById(id);
      const data = res?.data ?? res;
      downloadInvoicePdf(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'PDF download failed');
    } finally {
      setPdfLoadingId(null);
    }
  };

  if (!canView) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        You do not have permission to view billing.
      </div>
    );
  }

  if (detailId) {
    const row = invoices.find((i) => i.id === detailId) || null;
    return (
      <InvoiceDetail
        invoiceId={detailId}
        onClose={() => setDetailId(null)}
        canPay={canPay}
        onSubmitPayment={
          row
            ? () => {
                setPayInvoice(row);
                setDetailId(null);
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Billing
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Your SaaS subscription invoices and payment proofs.
        </p>
      </div>

      {unpaid.length > 0 && (
        <div className="rounded-xl border border-[var(--brand-primary-soft)] bg-[var(--brand-primary-soft)] px-4 py-3 text-sm text-[var(--brand-primary-dark)]">
          You have {unpaid.length} unpaid invoice
          {unpaid.length === 1 ? '' : 's'}. Submit a payment screenshot for
          review.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'open', label: 'Open' },
            { value: 'overdue', label: 'Overdue' },
            { value: 'paid', label: 'Paid' },
          ]}
          className="w-[180px]"
          allowEmpty={false}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-800">
          Invoices
        </div>
        {invoicesQuery.isLoading ? (
          <div className="flex justify-center py-12 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-400">
            No invoices yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-[var(--brand-primary-soft)] p-2 text-[var(--brand-primary)]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-mono text-sm font-semibold text-slate-900">
                      {inv.invoice_number}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      Due{' '}
                      {inv.due_date
                        ? new Date(inv.due_date).toLocaleDateString()
                        : '—'}{' '}
                      ·{' '}
                      <span className="uppercase font-semibold">
                        {inv.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-sm font-bold text-slate-900">
                    {inv.currency} {Number(inv.total).toFixed(2)}
                  </div>
                  {(canRead || canView) && (
                    <button
                      type="button"
                      onClick={() => setDetailId(inv.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" /> Details
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pdfLoadingId === inv.id}
                    onClick={() => handleDownloadPdf(inv.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {pdfLoadingId === inv.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    PDF
                  </button>
                  {canPay &&
                    (inv.status === 'open' || inv.status === 'overdue') && (
                      <button
                        type="button"
                        onClick={() => setPayInvoice(inv)}
                        className="rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-xs font-semibold text-white"
                      >
                        Submit payment
                      </button>
                    )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            <span>
              Page {page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border px-2 py-1 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border px-2 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-800">
          Payment submissions
        </div>
        {payments.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-400">
            No payment proofs submitted yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[var(--brand-primary-soft)] p-2 text-[var(--brand-primary)]">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      {p.invoice?.invoice_number || p.invoice_id?.slice(0, 8)}
                    </div>
                    <div className="text-xs uppercase text-slate-500">
                      {p.status}
                      {p.review_note ? ` · ${p.review_note}` : ''}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {p.currency} {Number(p.amount).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {payInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">
              Submit payment · {payInvoice.invoice_number}
            </h2>
            <p className="text-sm text-slate-500">
              Amount due: {payInvoice.currency}{' '}
              {Number(payInvoice.total).toFixed(2)}
            </p>
            <Select
              value={method}
              onChange={setMethod}
              allowEmpty={false}
              variant="form"
              options={[
                { value: 'bank_transfer', label: 'Bank transfer' },
                { value: 'card', label: 'Card' },
                { value: 'cash', label: 'Cash' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <input
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="Transaction reference"
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              className="min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-600">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {proofUrl ? 'Replace screenshot' : 'Upload payment screenshot'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onUpload(e.target.files?.[0] || null)}
              />
            </label>
            {proofUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={proofUrl}
                alt="Proof"
                className="max-h-40 w-full rounded-lg object-contain"
              />
            ) : null}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayInvoice(null)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitMutation.isPending || !proofUrl}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {submitMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Submit for review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
