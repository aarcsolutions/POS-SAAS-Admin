'use client';

import { useMemo } from 'react';
import { OrderDetail } from '@/types/order.types';
import { BusinessSettingsRow } from '@/types/business-settings.types';
import { useBusinessSettingsQuery } from '@/hooks/business-settings';
import { extractListItems } from '@/utils/helpers';
import { useAdminTheme } from '@/components/providers/ThemeProvider';

interface Props {
  order: OrderDetail;
  restaurantName: string;
  onClose: () => void;
}

function money(n: number | string | null | undefined) {
  return `Rs. ${Number(n || 0).toFixed(2)}`;
}

function formatDateTime(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-PK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function orderTypeLabel(type: string) {
  return type.replace(/_/g, '-');
}

const SLIP_CSS = `
  #order-slip-print,
  #order-slip-print * { box-sizing: border-box; }
  #order-slip-print {
    width: 100%;
    max-width: 340px;
    margin: 0 auto;
    font-family: "Segoe UI", ui-sans-serif, system-ui, sans-serif;
    color: #1a1a1a;
    background: #fff;
  }
  #order-slip-print .brand-bar {
    height: 4px;
    background: var(--brand-primary, #d97706);
    border-radius: 999px;
    margin-bottom: 14px;
  }
  #order-slip-print .logo {
    width: 56px;
    height: 56px;
    margin: 0 auto 8px;
    border-radius: 999px;
    border: 2px solid var(--brand-primary, #d97706);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--admin-surface, #fff7ee);
  }
  #order-slip-print .logo img { width: 100%; height: 100%; object-fit: cover; }
  #order-slip-print .logo-fallback {
    font-size: 11px;
    font-weight: 800;
    color: var(--brand-primary, #d97706);
    letter-spacing: 0.04em;
  }
  #order-slip-print .biz-name {
    text-align: center;
    font-size: 18px;
    font-weight: 800;
    margin: 0 0 4px;
    color: var(--brand-primary-dark, #3e2a18);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  #order-slip-print .biz-meta {
    text-align: center;
    font-size: 11px;
    color: #7a553d;
    line-height: 1.45;
    margin: 0 0 12px;
  }
  #order-slip-print .rule {
    border: none;
    border-top: 1px dashed #c4a484;
    margin: 10px 0;
  }
  #order-slip-print .rule-solid {
    border: none;
    border-top: 1.5px solid #3e2a18;
    margin: 10px 0;
  }
  #order-slip-print .meta {
    width: 100%;
    font-size: 11.5px;
    border-collapse: collapse;
  }
  #order-slip-print .meta td {
    padding: 2px 0;
    vertical-align: top;
  }
  #order-slip-print .meta td:first-child {
    color: #7a553d;
    width: 42%;
    font-weight: 600;
  }
  #order-slip-print .meta td:last-child {
    text-align: right;
    color: #3e2a18;
    font-weight: 600;
  }
  #order-slip-print .items {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }
  #order-slip-print .items thead th {
    border-top: 1.5px solid #3e2a18;
    border-bottom: 1.5px solid #3e2a18;
    padding: 6px 2px;
    text-align: left;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #3e2a18;
  }
  #order-slip-print .items thead th.num,
  #order-slip-print .items td.num {
    text-align: right;
  }
  #order-slip-print .items thead th.center,
  #order-slip-print .items td.center {
    text-align: center;
  }
  #order-slip-print .items tbody td {
    padding: 7px 2px;
    border-bottom: 1px dotted #e8d5bc;
    vertical-align: top;
    color: #3e2a18;
  }
  #order-slip-print .items .desc { font-weight: 600; }
  #order-slip-print .items .variant {
    display: block;
    font-weight: 500;
    color: #7a553d;
    font-size: 10px;
  }
  #order-slip-print .totals {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin-top: 4px;
  }
  #order-slip-print .totals td { padding: 3px 0; }
  #order-slip-print .totals td:first-child { color: #7a553d; }
  #order-slip-print .totals td:last-child {
    text-align: right;
    font-weight: 700;
    color: #3e2a18;
  }
  #order-slip-print .totals .payable td {
    padding-top: 8px;
    font-size: 14px;
    border-top: 1.5px solid #3e2a18;
    color: #3e2a18;
  }
  #order-slip-print .footer {
    text-align: center;
    margin-top: 14px;
    font-size: 10px;
    color: #7a553d;
    line-height: 1.5;
  }
  #order-slip-print .thanks {
    margin-top: 8px;
    font-weight: 700;
    color: var(--brand-primary, #d97706);
    font-size: 12px;
  }
`;

const PRINT_CSS = `
  body { margin: 0; padding: 16px; background: #fff; }
  ${SLIP_CSS}
  @media print {
    body { padding: 0; }
    #order-slip-print .brand-bar,
    #order-slip-print .logo,
    #order-slip-print .thanks {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
  }
`;

export default function OrderSlip({ order, restaurantName, onClose }: Props) {
  const { theme } = useAdminTheme();
  const settingsQuery = useBusinessSettingsQuery({ page: 1, limit: 5 });
  const settings = useMemo(() => {
    const rows = extractListItems<BusinessSettingsRow>(
      settingsQuery.data,
      'businessSettings'
    );
    if (!rows.length) {
      return extractListItems<BusinessSettingsRow>(settingsQuery.data)[0];
    }
    if (order.branch_id) {
      const branchRow = rows.find((r) => r.branch_id === order.branch_id);
      if (branchRow) return branchRow;
    }
    return rows.find((r) => !r.branch_id) || rows[0];
  }, [settingsQuery.data, order.branch_id]);

  const businessName =
    settings?.business_name?.trim() || restaurantName || 'Restaurant';
  const strn = settings?.tax_registration_number?.trim() || null;
  const logoUrl = theme?.logo_url || settings?.logo_url || null;
  const currency = settings?.currency || 'PKR';

  const deliveryFee = Number(order.delivery_fee) || 0;
  const isDelivery = order.order_type === 'delivery';
  const taxRow = order.order_taxes?.[0];
  const taxRate =
    taxRow?.tax_type === 'percentage' ? Number(taxRow.tax_value) || 0 : null;
  const taxName = taxRow?.tax_name || 'Sales Tax';
  const taxAmount = Number(order.tax_amount) || 0;
  const subtotal = Number(order.subtotal) || 0;
  const discount = Number(order.discount) || 0;
  const finalTotal = Number(order.final_total) || 0;

  const paymentLabel = [
    order.payment_status || 'unpaid',
    order.payment_method ? String(order.payment_method).toUpperCase() : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const items = order.items || [];
  const taxableBase = Math.max(0, subtotal - discount);

  const lineRows = items.map((item, index) => {
    const unit = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    const lineTotal = unit * qty;
    const lineShare =
      taxableBase > 0 && taxAmount > 0
        ? (lineTotal / Math.max(subtotal, 0.0001)) * taxAmount
        : 0;
    return {
      index: index + 1,
      name: item.product?.title || item.product?.name || 'Item',
      variant: item.variant?.name || '',
      unit,
      qty,
      lineTotal,
      lineGst: lineShare,
    };
  });

  const printSlip = () => {
    const node = document.getElementById('order-slip-print');
    if (!node) return;
    const win = window.open('', '_blank', 'width=420,height=780');
    if (!win) return;
    win.document.write(`<!doctype html><html><head>
      <title>${order.order_number}</title>
      <style>${PRINT_CSS}</style>
    </head><body><div id="order-slip-print">${node.innerHTML}</div></body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const downloadTxt = () => {
    const lines = [
      businessName,
      strn ? `STRN/NTN: ${strn}` : '',
      '--------------------------------',
      `Invoice #: ${order.order_number}`,
      `Date: ${formatDateTime(order.created_at)}`,
      `Type: ${orderTypeLabel(order.order_type)}`,
      order.table_name ? `Table: ${order.table_name}` : '',
      `Customer: ${order.customer?.name || '-'}`,
      order.customer?.phone ? `Phone: ${order.customer.phone}` : '',
      isDelivery && order.delivery_address
        ? `Address: ${order.delivery_address}${order.delivery_city ? `, ${order.delivery_city}` : ''}`
        : '',
      `Payment: ${paymentLabel}`,
      '--------------------------------',
      ...lineRows.map(
        (row) =>
          `${row.index}. ${row.name}${row.variant ? ` (${row.variant})` : ''}  x${row.qty}  @ ${row.unit.toFixed(2)}  = ${row.lineTotal.toFixed(2)}`
      ),
      '--------------------------------',
      `Subtotal: ${money(subtotal)}`,
      discount > 0 ? `Discount: -${money(discount)}` : '',
      `Sales Tax: ${money(taxAmount)}`,
      deliveryFee > 0 || isDelivery ? `Delivery: ${money(deliveryFee)}` : '',
      `Payable: ${money(finalTotal)}`,
      '--------------------------------',
      'Thank you for your order!',
    ]
      .filter(Boolean)
      .join('\n');

    const url = URL.createObjectURL(
      new Blob([lines], { type: 'text/plain;charset=utf-8' })
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order.order_number}-slip.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const initials = businessName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3e2a18]/45 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <style>{SLIP_CSS}</style>
      <div
        className="max-h-[92vh] w-full max-w-[420px] overflow-y-auto rounded-2xl bg-[#fff7ee] p-4 shadow-2xl sm:p-5"
        role="dialog"
        aria-modal="true"
        aria-label={`Order slip ${order.order_number}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div id="order-slip-print" className="rounded-xl bg-white px-4 py-5 shadow-sm sm:px-5">
          <div className="brand-bar" />

          <div className="logo">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={businessName} />
            ) : (
              <span className="logo-fallback">{initials || 'POS'}</span>
            )}
          </div>

          <h1 className="biz-name">{businessName}</h1>
          <p className="biz-meta">
            {strn ? (
              <>
                STRN / NTN: {strn}
                <br />
              </>
            ) : null}
            Currency: {currency}
            {order.branch_id ? ' · Branch order' : null}
          </p>

          <hr className="rule" />

          <table className="meta">
            <tbody>
              <tr>
                <td>Invoice #</td>
                <td>{order.order_number}</td>
              </tr>
              <tr>
                <td>Date &amp; Time</td>
                <td>{formatDateTime(order.created_at)}</td>
              </tr>
              <tr>
                <td>Order Type</td>
                <td>{orderTypeLabel(order.order_type)}</td>
              </tr>
              {order.table_name ? (
                <tr>
                  <td>Table</td>
                  <td>{order.table_name}</td>
                </tr>
              ) : null}
              <tr>
                <td>Payment</td>
                <td>{paymentLabel}</td>
              </tr>
              <tr>
                <td>Customer</td>
                <td>
                  {order.customer?.name || '—'}
                  {order.customer?.phone ? (
                    <>
                      <br />
                      {order.customer.phone}
                    </>
                  ) : null}
                </td>
              </tr>
              {isDelivery ? (
                <tr>
                  <td>Deliver to</td>
                  <td>
                    {order.delivery_address || '—'}
                    {order.delivery_city ? `, ${order.delivery_city}` : ''}
                    {order.delivery_phone ? (
                      <>
                        <br />
                        {order.delivery_phone}
                      </>
                    ) : null}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>

          <hr className="rule-solid" />

          <table className="items">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>#</th>
                <th>Description</th>
                <th className="num" style={{ width: '16%' }}>
                  Price
                </th>
                {taxRate != null ? (
                  <th className="center" style={{ width: '12%' }}>
                    GST%
                  </th>
                ) : null}
                <th className="center" style={{ width: '10%' }}>
                  Qty
                </th>
                {taxAmount > 0 ? (
                  <th className="num" style={{ width: '14%' }}>
                    GST
                  </th>
                ) : null}
                <th className="num" style={{ width: '16%' }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {lineRows.map((row) => (
                <tr key={row.index}>
                  <td>{row.index}</td>
                  <td className="desc">
                    {row.name}
                    {row.variant ? (
                      <span className="variant">{row.variant}</span>
                    ) : null}
                  </td>
                  <td className="num">{row.unit.toFixed(2)}</td>
                  {taxRate != null ? (
                    <td className="center">{taxRate.toFixed(1)}</td>
                  ) : null}
                  <td className="center">{row.qty}</td>
                  {taxAmount > 0 ? (
                    <td className="num">{row.lineGst.toFixed(2)}</td>
                  ) : null}
                  <td className="num">{row.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr className="rule" />

          <table className="totals">
            <tbody>
              <tr>
                <td>Total Amount</td>
                <td>{money(subtotal)}</td>
              </tr>
              {discount > 0 ? (
                <tr>
                  <td>
                    Discount
                    {order.promo_code || order.order_promos?.[0]?.code
                      ? ` (${order.promo_code || order.order_promos?.[0]?.code})`
                      : ''}
                  </td>
                  <td>-{money(discount)}</td>
                </tr>
              ) : null}
              <tr>
                <td>
                  {taxName}
                  {taxRate != null ? ` (${taxRate}%)` : ''}
                </td>
                <td>{money(taxAmount)}</td>
              </tr>
              {(isDelivery || deliveryFee > 0) && (
                <tr>
                  <td>Delivery Fee</td>
                  <td>{money(deliveryFee)}</td>
                </tr>
              )}
              <tr className="payable">
                <td>Payable</td>
                <td>{money(finalTotal)}</td>
              </tr>
              <tr>
                <td>Received / Status</td>
                <td>{paymentLabel}</td>
              </tr>
            </tbody>
          </table>

          <div className="footer">
            <div>Order status: {order.status.replace(/_/g, ' ')}</div>
            <div className="thanks">Thank you for your order!</div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={printSlip}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[color-mix(in_srgb,var(--brand-primary)_25%,transparent)] transition hover:brightness-95"
          >
            Print
          </button>
          <button
            type="button"
            onClick={downloadTxt}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary-dark)] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95"
          >
            Download
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-bold text-[var(--brand-primary-dark)] transition hover:bg-[var(--admin-surface)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
