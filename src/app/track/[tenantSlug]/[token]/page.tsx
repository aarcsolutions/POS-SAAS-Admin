'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, MapPin, Phone, Truck } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '@/utils/constants';

type TrackStatus =
  | 'pending'
  | 'accepted'
  | 'in_kitchen'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

interface TrackData {
  order_number: string;
  status: TrackStatus;
  order_type: string;
  delivery_address?: string | null;
  delivery_city?: string | null;
  delivery_phone?: string | null;
  payment_method?: string | null;
  payment_status?: string;
  driver?: { id: string; name: string; phone: string } | null;
  created_at?: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  in_kitchen: 'In Kitchen',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  completed: 'Delivered',
  cancelled: 'Cancelled',
};

export default function TrackOrderPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; token: string }>;
}) {
  const [tenantSlug, setTenantSlug] = useState('');
  const [token, setToken] = useState('');
  const [order, setOrder] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [delivering, setDelivering] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setTenantSlug(p.tenantSlug);
      setToken(p.token);
    });
  }, [params]);

  useEffect(() => {
    if (!tenantSlug || !token) return;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: envelope } = await axios.get(
          `${API_CONFIG.BASE_URL}/orders/track/${tenantSlug}/${token}`
        );
        if (envelope?.status && envelope?.data) {
          setOrder(envelope.data);
        } else {
          setError(envelope?.message || 'Tracking link not found');
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message || 'Unable to load tracking information'
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [tenantSlug, token]);

  const handleDeliver = async () => {
    if (!tenantSlug || !token) return;
    setDelivering(true);
    setError('');
    try {
      const { data: envelope } = await axios.post(
        `${API_CONFIG.BASE_URL}/orders/track/${tenantSlug}/${token}/deliver`
      );
      if (envelope?.status) {
        setOrder((prev) =>
          prev ? { ...prev, status: 'completed' } : prev
        );
      } else {
        setError(envelope?.message || 'Could not mark as delivered');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Could not mark as delivered'
      );
    } finally {
      setDelivering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Order Tracking</h1>
          <p className="mt-1 text-sm text-slate-500">
            Live status for your delivery order
          </p>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
          ) : error ? (
            <p className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </p>
          ) : order ? (
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm text-slate-500">Order</p>
                <p className="text-2xl font-bold text-slate-900">
                  {order.order_number}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <p className="mt-1 text-lg font-bold text-indigo-700">
                  {STATUS_LABEL[order.status] || order.status}
                </p>
              </div>

              {(order.delivery_address || order.delivery_city) && (
                <div className="flex gap-2 text-sm text-slate-700">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span>
                    {[order.delivery_city, order.delivery_address]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}

              {order.delivery_phone && (
                <div className="flex gap-2 text-sm text-slate-700">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{order.delivery_phone}</span>
                </div>
              )}

              {order.driver && order.status === 'out_for_delivery' && (
                <div className="flex gap-2 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900">
                  <Truck className="h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">{order.driver.name}</p>
                    <p className="text-indigo-700">{order.driver.phone}</p>
                  </div>
                </div>
              )}

              {order.status === 'completed' && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-emerald-800">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Order delivered</span>
                </div>
              )}

              {order.status === 'out_for_delivery' && (
                <button
                  type="button"
                  disabled={delivering}
                  onClick={() => void handleDeliver()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {delivering && <Loader2 className="h-4 w-4 animate-spin" />}
                  Mark as Delivered
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
