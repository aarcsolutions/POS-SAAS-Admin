import { jsPDF } from 'jspdf';

export type InvoicePdfLine = {
  description?: string | null;
  quantity?: number | string | null;
  unit_amount?: number | string | null;
  amount?: number | string | null;
};

export type InvoicePdfData = {
  invoice_number: string;
  status: string;
  currency: string;
  subtotal?: number | string | null;
  tax_amount?: number | string | null;
  total?: number | string | null;
  due_date?: string | null;
  paid_at?: string | null;
  notes?: string | null;
  created_at?: string | null;
  tenant?: { title?: string | null } | null;
  lines?: InvoicePdfLine[] | null;
};

function money(n: number | string | null | undefined, currency: string) {
  const value = Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${value}`;
}

function fmtDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

/** Generate and download a SaaS subscription invoice PDF. */
export function downloadInvoicePdf(invoice: InvoicePdfData) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  let y = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const usable = pageWidth - margin * 2;
  const currency = invoice.currency || 'USD';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('INVOICE', margin, y);
  y += 26;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(`${invoice.invoice_number}  ·  ${String(invoice.status).toUpperCase()}`, margin, y);
  y += 28;
  doc.setTextColor(20);

  const metaLeft = [
    invoice.tenant?.title ? `Tenant: ${invoice.tenant.title}` : null,
    `Issued: ${fmtDate(invoice.created_at)}`,
    `Due: ${fmtDate(invoice.due_date)}`,
    invoice.paid_at ? `Paid: ${fmtDate(invoice.paid_at)}` : null,
  ].filter(Boolean) as string[];

  metaLeft.forEach((line) => {
    doc.text(line, margin, y);
    y += 16;
  });

  if (invoice.notes) {
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', margin, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    const notes = doc.splitTextToSize(String(invoice.notes), usable);
    doc.text(notes, margin, y);
    y += notes.length * 14 + 8;
  }

  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 12, usable, 22, 'F');
  doc.text('Description', margin + 8, y);
  doc.text('Qty', margin + usable * 0.55, y);
  doc.text('Unit', margin + usable * 0.68, y);
  doc.text('Amount', margin + usable - 8, y, { align: 'right' });
  y += 20;

  doc.setFont('helvetica', 'normal');
  const lines = invoice.lines?.length
    ? invoice.lines
    : [
        {
          description: 'Subscription / services',
          quantity: 1,
          unit_amount: invoice.total,
          amount: invoice.total,
        },
      ];

  lines.forEach((line) => {
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
    const desc = doc.splitTextToSize(String(line.description || 'Item'), usable * 0.5);
    doc.text(desc, margin + 8, y);
    doc.text(String(line.quantity ?? 1), margin + usable * 0.55, y);
    doc.text(money(line.unit_amount, currency), margin + usable * 0.68, y);
    doc.text(money(line.amount ?? Number(line.quantity || 1) * Number(line.unit_amount || 0), currency), margin + usable - 8, y, {
      align: 'right',
    });
    y += Math.max(desc.length * 14, 18) + 4;
  });

  y += 16;
  doc.setDrawColor(200);
  doc.line(margin, y, margin + usable, y);
  y += 20;

  const totals = [
    ['Subtotal', money(invoice.subtotal, currency)],
    ['Tax', money(invoice.tax_amount, currency)],
    ['Total', money(invoice.total, currency)],
  ];
  totals.forEach(([label, value], idx) => {
    if (idx === totals.length - 1) doc.setFont('helvetica', 'bold');
    else doc.setFont('helvetica', 'normal');
    doc.text(label, margin + usable * 0.55, y);
    doc.text(value, margin + usable - 8, y, { align: 'right' });
    y += 18;
  });

  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text('Generated from SaaS POS Billing', margin, y);

  doc.save(`${invoice.invoice_number || 'invoice'}.pdf`);
}
