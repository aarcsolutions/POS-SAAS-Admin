'use client';

import { OrderDetail } from '@/types/order.types';

interface Props {
  order: OrderDetail;
  restaurantName: string;
  onClose: () => void;
}

export default function OrderSlip({ order, restaurantName, onClose }: Props) {
  const printSlip = () => {
    const node = document.getElementById('order-slip-print');
    if (!node) return;
    const win = window.open('', '_blank', 'width=480,height=720');
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>${order.order_number}</title>
      <style>
        body { font-family: ui-sans-serif, system-ui, sans-serif; padding: 24px; color: #1e293b; }
        h1 { margin: 0 0 4px; font-size: 20px; }
        h2 { margin: 0 0 16px; font-size: 13px; font-weight: 600; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { text-align: left; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        .right { text-align: right; }
        .totals td { border: none; padding: 4px 0; }
        .grand { font-size: 16px; font-weight: 700; }
      </style></head><body>${node.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const downloadPdf = () => {
    printSlip();
    const lines = [
      restaurantName,
      `Order ${order.order_number}`,
      `Type: ${order.order_type}`,
      order.table_name ? `Table: ${order.table_name}` : '',
      `Customer: ${order.customer?.name || '-'}`,
      '',
      ...(order.items || []).map(
        (item) =>
          `${item.product?.title || item.product?.name || 'Item'} ${item.variant?.name || ''} x${item.quantity} @ ${Number(item.price).toFixed(2)} = ${(Number(item.price) * item.quantity).toFixed(2)}`
      ),
      '',
      `Subtotal: ${Number(order.subtotal).toFixed(2)}`,
      `Discount: ${Number(order.discount).toFixed(2)}`,
      `Tax: ${Number(order.tax_amount).toFixed(2)}`,
      `Total: ${Number(order.final_total).toFixed(2)}`,
      `Payment: ${order.payment_status}${order.payment_method ? ` (${order.payment_method})` : ''}`,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div id="order-slip-print">
          <h1>{restaurantName}</h1>
          <h2>
            Order {order.order_number} · {order.order_type.replace('_', '-')}
            {order.table_name ? ` · ${order.table_name}` : ''}
          </h2>
          <p style={{ fontSize: 13, marginBottom: 8 }}>
            Customer: {order.customer?.name || '-'}
            {order.customer?.phone ? ` (${order.customer.phone})` : ''}
          </p>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th className="right">Qty</th>
                <th className="right">Price</th>
                <th className="right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item) => (
                <tr key={item.id || `${item.product_id}-${item.variant_id}`}>
                  <td>
                    {item.product?.title || item.product?.name || 'Item'}
                    {item.variant?.name ? ` (${item.variant.name})` : ''}
                  </td>
                  <td className="right">{item.quantity}</td>
                  <td className="right">{Number(item.price).toFixed(2)}</td>
                  <td className="right">
                    {(Number(item.price) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="totals">
            <tbody>
              <tr>
                <td>Subtotal</td>
                <td className="right">{Number(order.subtotal).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Discount</td>
                <td className="right">{Number(order.discount).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Tax</td>
                <td className="right">{Number(order.tax_amount).toFixed(2)}</td>
              </tr>
              <tr className="grand">
                <td>Total</td>
                <td className="right">{Number(order.final_total).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Payment</td>
                <td className="right">
                  {order.payment_status}
                  {order.payment_method ? ` · ${order.payment_method}` : ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={printSlip}
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Print / Save PDF
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white"
          >
            Download slip
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
