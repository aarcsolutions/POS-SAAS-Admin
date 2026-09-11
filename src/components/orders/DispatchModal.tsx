'use client';

import { useMemo, useState } from 'react';
import { Loader2, MessageCircle, Copy, CheckCircle2 } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { useDriversQuery } from '@/hooks/drivers';
import { useDispatchOrderMutation } from '@/hooks/orders';
import { OrderListItem } from '@/types/order.types';
import { useAuthStore } from '@/store/authStore';
import {
  buildDispatchMessage,
  buildWhatsAppUrl,
} from '@/utils/whatsapp';
import { toast } from 'sonner';

interface Props {
  order: OrderListItem;
  onClose: () => void;
}

export default function DispatchModal({ order, onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const tenantSlug = user?.tenantSlug || '';
  const [driverId, setDriverId] = useState('');
  const [result, setResult] = useState<{
    tracking_token: string;
    tenant_slug?: string;
    driver?: { name: string; phone: string };
  } | null>(null);

  const branchFilter =
    order.branch_id || user?.branchId || undefined;

  const { data: driversRes, isLoading: driversLoading } = useDriversQuery({
    page: 1,
    limit: 100,
    branch_id: branchFilter,
  });

  const dispatchMutation = useDispatchOrderMutation();

  const driverOptions = useMemo(() => {
    const rows =
      driversRes?.data?.data ||
      driversRes?.data?.drivers ||
      (Array.isArray(driversRes?.data) ? driversRes.data : []) ||
      [];
    return (rows as { id: string; name: string; phone?: string }[]).map((d) => ({
      value: d.id,
      label: `${d.name}${d.phone ? ` · ${d.phone}` : ''}`,
    }));
  }, [driversRes]);

  const customerSiteBase = (
    process.env.NEXT_PUBLIC_CUSTOMER_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  ).replace(/\/$/, '');

  const trackingUrl =
    result?.tracking_token && tenantSlug
      ? `${customerSiteBase}/track/${result.tenant_slug || tenantSlug}/${result.tracking_token}`
      : '';

  const whatsAppUrl =
    result?.driver?.phone && trackingUrl
      ? buildWhatsAppUrl(
          result.driver.phone,
          buildDispatchMessage({
            orderNumber: order.order_number,
            customerPhone: order.delivery_phone || order.customer?.phone,
            deliveryAddress: order.delivery_address,
            deliveryCity: order.delivery_city,
            trackingUrl,
          })
        )
      : '';

  const handleDispatch = async () => {
    if (!driverId) {
      toast.error('Select a driver');
      return;
    }
    const response = await dispatchMutation.mutateAsync({
      id: order.id,
      driver_id: driverId,
    });
    if (response?.data) {
      setResult({
        tracking_token: response.data.tracking_token,
        tenant_slug: response.data.tenant_slug,
        driver: response.data.driver,
      });
    }
  };

  const copyTrackingLink = async () => {
    if (!trackingUrl) return;
    try {
      await navigator.clipboard.writeText(trackingUrl);
      toast.success('Tracking link copied');
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">Dispatch Order</h2>
        <p className="mt-1 text-sm text-slate-500">
          Assign a driver for {order.order_number}
        </p>

        {!result ? (
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Driver
              </label>
              {driversLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : (
                <Select
                  value={driverId}
                  onChange={setDriverId}
                  placeholder="Select driver"
                  options={driverOptions}
                  searchable
                  searchPlaceholder="Search drivers…"
                />
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={dispatchMutation.isPending || !driverId}
                onClick={() => void handleDispatch()}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
              >
                {dispatchMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Confirm Dispatch
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl bg-[var(--brand-icon-soft)] p-4 text-sm text-[var(--brand-icon)]">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Order dispatched
              </div>
              {result.driver && (
                <p className="mt-2">
                  Driver: {result.driver.name} ({result.driver.phone})
                </p>
              )}
            </div>

            {trackingUrl && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tracking link
                </p>
                <p className="break-all text-sm text-slate-700">{trackingUrl}</p>
                <button
                  type="button"
                  onClick={() => void copyTrackingLink()}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-primary)]"
                >
                  <Copy className="h-4 w-4" /> Copy link
                </button>
              </div>
            )}

            {whatsAppUrl && (
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white"
              >
                <MessageCircle className="h-4 w-4" />
                Send WhatsApp to Driver
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
