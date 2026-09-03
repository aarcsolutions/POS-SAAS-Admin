export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('92')) return digits;
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) return '';
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function buildDispatchMessage(params: {
  orderNumber: string;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
  deliveryCity?: string | null;
  trackingUrl: string;
}): string {
  const lines = [
    `Delivery Order ${params.orderNumber}`,
    params.customerPhone ? `Customer: ${params.customerPhone}` : null,
    params.deliveryAddress
      ? `Address: ${[params.deliveryCity, params.deliveryAddress]
          .filter(Boolean)
          .join(', ')}`
      : null,
    `Track: ${params.trackingUrl}`,
  ];
  return lines.filter(Boolean).join('\n');
}
