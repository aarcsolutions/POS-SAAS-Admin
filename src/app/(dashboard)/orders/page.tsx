'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Eye,
  Loader2,
  ChefHat,
  CheckCircle2,
  XCircle,
  Printer,
  CreditCard,
  Banknote,
  Truck,
  Star,
  CalendarPlus,
} from 'lucide-react';
import OrderCreateWizard, {
  OrderCreatePrefill,
} from '@/components/orders/OrderCreateWizard';
import OrderSlip from '@/components/orders/OrderSlip';
import DispatchModal from '@/components/orders/DispatchModal';
import OrderReviewModal from '@/components/orders/OrderReviewModal';
import QuickReserveModal from '@/components/reservations/QuickReserveModal';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import { Select } from '@/components/ui/Select';
import { usePermission } from '@/hooks/use-permission';
import { ENTITY_PERMS } from '@/rbac/permissions-map';
import {
  useOrdersQuery,
  useOrderDetailQuery,
  useUpdateOrderStatusMutation,
  useRecordPaymentMutation,
} from '@/hooks/orders';
import {
  useQuickCreateReservationMutation,
  useMarkSeatedForOrderMutation,
} from '@/hooks/reservations';
import { useCreateReviewMutation } from '@/hooks/reviews';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useOrderSocketConnected } from '@/components/realtime/OrderSocketProvider';
import { useAuthStore } from '@/store/authStore';
import { confirmDialog } from '@/store/dialogStore';
import {
  OrderListItem,
  OrderStatus,
  OrderType,
} from '@/types/order.types';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  in_kitchen: 'In Kitchen',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function canCancelOrder(status: OrderStatus): boolean {
  return (
    status === 'pending' ||
    status === 'accepted' ||
    status === 'in_kitchen' ||
    status === 'ready' ||
    status === 'out_for_delivery'
  );
}

function nextStatus(
  status: OrderStatus,
  orderType?: OrderType
): OrderStatus | null {
  if (status === 'pending') return 'accepted';
  if (status === 'accepted') return 'in_kitchen';
  if (status === 'in_kitchen') return 'ready';
  if (status === 'ready') {
    if (orderType === 'delivery') return null;
    return 'completed';
  }
  if (status === 'out_for_delivery') return 'completed';
  return null;
}

function statusBadgeClass(status: OrderStatus) {
  switch (status) {
    case 'pending':
      return 'bg-[var(--brand-toast-soft)] text-[var(--brand-toast)]';
    case 'accepted':
      return 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary-dark)]';
    case 'in_kitchen':
      return 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]';
    case 'ready':
      return 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]';
    case 'out_for_delivery':
      return 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]';
    case 'completed':
      return 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]';
    case 'cancelled':
      return 'bg-rose-100 text-rose-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export default function OrdersPage() {
  const { user } = useAuthStore();
  const restaurantName = user?.tenantName || 'Restaurant';
  const searchParams = useSearchParams();
  const router = useRouter();

  const canCreate = usePermission(ENTITY_PERMS.orders.create);
  const canQuickReserve = usePermission(ENTITY_PERMS.reservations.create);
  const canUpdateStatus = usePermission(
    ENTITY_PERMS.orders.extras.updateStatus
  );
  const canDispatch = usePermission(ENTITY_PERMS.orders.extras.dispatch);
  const canRecordPayment = usePermission(
    ENTITY_PERMS.orders.extras.recordPayment
  );
  const canUpdateOrder = usePermission(ENTITY_PERMS.orders.update);
  const canPay = canRecordPayment || canUpdateOrder;
  const canCreateReview = usePermission(ENTITY_PERMS.reviews.create);
  const queryClient = useQueryClient();
  const createReviewMutation = useCreateReviewMutation();
  const quickReserveMutation = useQuickCreateReservationMutation();
  const markSeatedMutation = useMarkSeatedForOrderMutation();

  const [screen, setScreen] = useState<'list' | 'create'>('list');
  const [orderPrefill, setOrderPrefill] = useState<OrderCreatePrefill | null>(
    null
  );
  const [quickReserveOpen, setQuickReserveOpen] = useState(false);
  const [reservationBootstrapping, setReservationBootstrapping] =
    useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<OrderType | ''>('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [slipOpen, setSlipOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [dispatchOrder, setDispatchOrder] = useState<OrderListItem | null>(null);
  const [reviewOrder, setReviewOrder] = useState<OrderListItem | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const socketConnected = useOrderSocketConnected();
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter, statusFilter]);

  const ordersQuery = useOrdersQuery(
    {
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      order_type: typeFilter || undefined,
    },
    {
      pollMs: socketConnected
        ? 60000
        : statusFilter === 'pending'
          ? 8000
          : undefined,
    }
  );
  const detailQuery = useOrderDetailQuery(detailId);
  const statusMutation = useUpdateOrderStatusMutation();
  const paymentMutation = useRecordPaymentMutation();

  const orders: OrderListItem[] = useMemo(() => {
    const payload = ordersQuery.data?.data;
    return payload?.data || [];
  }, [ordersQuery.data]);

  const pagination = ordersQuery.data?.data?.pagination;
  const detail = detailQuery.data?.data;

  const handleAccept = (orderId: string) => {
    statusMutation.mutate({ id: orderId, status: 'accepted' });
  };

  const handleCancelOrder = async (orderId: string) => {
    const ok = await confirmDialog({
      title: 'Cancel Order',
      message:
        'Cancel this order? Raw materials will be restored if already deducted.',
      confirmLabel: 'Cancel Order',
      variant: 'danger',
    });
    if (!ok) return;
    statusMutation.mutate({ id: orderId, status: 'cancelled' });
  };

  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearch(searchFromUrl);
      router.replace('/orders');
    }
  }, [searchParams, router]);

  useEffect(() => {
    const reservationParam = searchParams.get('reservation');
    if (!reservationParam || !canCreate) return;

    let cancelled = false;
    setReservationBootstrapping(true);

    (async () => {
      try {
        const seated = await markSeatedMutation.mutateAsync(reservationParam);
        if (cancelled) return;
        const r = seated?.data;
        if (!r?.customer_id || !r?.restaurant_table_id) {
          toast.error('Reservation is missing customer or table');
          return;
        }
        setOrderPrefill({
          reservationId: r.id,
          customerId: r.customer_id,
          customerLabel:
            r.customer_name || r.guest_name || 'Guest',
          tableId: r.restaurant_table_id,
          tableLabel: r.table_name || 'Table',
        });
        setScreen('create');
      } catch {
        /* toast in mutation */
      } finally {
        if (!cancelled) {
          setReservationBootstrapping(false);
          router.replace('/orders');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, canCreate]);

  if (reservationBootstrapping) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (screen === 'create') {
    return (
      <OrderCreateWizard
        prefill={orderPrefill}
        onClose={() => {
          setOrderPrefill(null);
          setScreen('list');
        }}
        onCreated={() => {
          setOrderPrefill(null);
          setScreen('list');
          queryClient.invalidateQueries({ queryKey: ['reservations'] });
          queryClient.invalidateQueries({ queryKey: ['tables'] });
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create orders, update kitchen status, take payment, and print slips
            {statusFilter === 'pending' && (
              <span className="text-[var(--brand-primary)]"> · pending queue auto-refreshes</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {statusFilter === 'pending' && ordersQuery.isFetching && !ordersQuery.isLoading && (
            <Loader2 className="h-5 w-5 animate-spin text-[var(--brand-icon)]" aria-label="Refreshing" />
          )}
        {canQuickReserve && (
          <button
            type="button"
            onClick={() => setQuickReserveOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <CalendarPlus className="h-4 w-4" /> Quick Reserve
          </button>
        )}
        {canCreate && (
          <button
            type="button"
            onClick={() => {
              setOrderPrefill(null);
              setScreen('create');
            }}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            <Plus className="h-4 w-4" /> Create Order
        </button>
        )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, phone..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm"
          />
        </div>
        <Select
          value={typeFilter}
          onChange={(value) => {
            setTypeFilter(value as OrderType | '');
            setPage(1);
          }}
          size="lg"
          placeholder="All types"
          options={[
            { value: 'dine_in', label: 'Dine-in' },
            { value: 'takeaway', label: 'Pickup / Takeaway' },
            { value: 'delivery', label: 'Delivery' },
          ]}
        />
        <Select
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value as OrderStatus | '');
            setPage(1);
          }}
          size="lg"
          placeholder="All statuses"
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'accepted', label: 'Accepted' },
            { value: 'in_kitchen', label: 'In Kitchen' },
            { value: 'ready', label: 'Ready' },
            { value: 'out_for_delivery', label: 'Out for Delivery' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersQuery.isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-slate-400">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-slate-400">
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const archived = !!order.is_archived;
                  const nxt = archived
                    ? null
                    : nextStatus(order.status, order.order_type);
                  const showCancel =
                    !archived &&
                    canUpdateStatus &&
                    canCancelOrder(order.status);
                  const showDispatch =
                    !archived &&
                    (canDispatch || canUpdateStatus) &&
                    order.status === 'ready' &&
                    order.order_type === 'delivery';

                return (
                    <tr
                      key={`${archived ? 'hist' : 'live'}-${order.id}`}
                      className={`border-t border-slate-100 ${
                        archived ? 'bg-slate-50/80' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        <div className="flex flex-wrap items-center gap-2">
                          {order.order_number}
                          {archived && (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                              Archived
                            </span>
                          )}
                        </div>
                        {order.branch_name && (
                          <div className="mt-0.5 text-xs font-normal text-slate-500">
                            {order.branch_name}
                            {archived ? ' (deleted branch)' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">
                          {order.customer?.name || '-'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {order.customer?.phone}
                      </div>
                    </td>
                      <td className="px-4 py-3 capitalize text-slate-600">
                        <div>{order.order_type?.replace('_', ' ')}</div>
                        {order.table_name && (
                          <div className="text-xs text-slate-500">
                            Table {order.table_name}
                          </div>
                        )}
                        {order.order_type === 'delivery' && (
                          <div className="mt-0.5 text-xs text-slate-500">
                            {order.delivery_address || '-'}
                            {order.delivery_phone
                              ? ` · ${order.delivery_phone}`
                              : ''}
                            {order.payment_method
                              ? ` · ${order.payment_method.toUpperCase()}`
                              : ''}
                            {Number(order.delivery_fee) > 0
                              ? ` · fee ${Number(order.delivery_fee).toFixed(2)}`
                              : ''}
                            {order.driver && (
                              <div className="mt-0.5 text-[var(--brand-icon)]">
                                Driver: {order.driver.name} ({order.driver.phone})
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        PKR {Number(order.final_total).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            order.payment_status === 'paid'
                              ? 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {order.payment_status}
                          {order.payment_method
                            ? ` · ${order.payment_method}`
                            : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusBadgeClass(order.status)}`}
                        >
                          {STATUS_LABEL[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString()
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!archived &&
                            canUpdateStatus &&
                            order.status === 'pending' &&
                            order.order_type !== 'dine_in' && (
                            <button
                              type="button"
                              disabled={statusMutation.isPending}
                              onClick={() => handleAccept(order.id)}
                              className="inline-flex items-center gap-1 rounded-md bg-[var(--brand-primary)] px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                            </button>
                          )}
                          {showDispatch && (
                            <button
                              type="button"
                              onClick={() => setDispatchOrder(order)}
                              className="inline-flex items-center gap-1 rounded-md bg-[var(--brand-primary)] px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-95 disabled:opacity-60"
                            >
                              <Truck className="h-3.5 w-3.5" /> Dispatch
                            </button>
                          )}
                          {showCancel && (
                            <button
                              type="button"
                              disabled={statusMutation.isPending}
                              onClick={() => void handleCancelOrder(order.id)}
                              className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 disabled:opacity-60"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Cancel
                            </button>
                          )}
                          {!archived &&
                            canCreateReview &&
                            order.order_type === 'dine_in' &&
                            order.status === 'completed' &&
                            !order.has_review && (
                              <button
                                type="button"
                                onClick={() => setReviewOrder(order)}
                                className="inline-flex items-center gap-1 rounded-md bg-[var(--brand-primary)] px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-95"
                              >
                                <Star className="h-3.5 w-3.5" /> Review
                              </button>
                            )}
                          <RowActionsMenu
                            open={menuOpenId === order.id}
                            onOpenChange={(open) =>
                              setMenuOpenId(open ? order.id : null)
                            }
                          >
                          <button
                            type="button"
                            onClick={() => {
                              setDetailId(order.id);
                              setSlipOpen(true);
                              setMenuOpenId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" /> View / Slip
                          </button>
                          {!archived && canUpdateStatus && nxt && nxt !== 'accepted' && (
                            <button
                              type="button"
                              onClick={() => {
                                statusMutation.mutate({
                                  id: order.id,
                                  status: nxt,
                                });
                                setMenuOpenId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              {nxt === 'in_kitchen' ? (
                                <ChefHat className="h-4 w-4" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              {nxt === 'in_kitchen'
                                ? 'Send to Kitchen'
                                : nxt === 'ready'
                                  ? 'Mark Ready'
                                  : nxt === 'completed'
                                    ? 'Mark Completed'
                                    : 'Update Status'}
                            </button>
                          )}
                          {!archived && canPay && order.payment_status !== 'paid' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  paymentMutation.mutate({
                                    order_id: order.id,
                                    method: 'cash',
                                  });
                                  setMenuOpenId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Banknote className="h-4 w-4" /> Pay Cash
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  paymentMutation.mutate({
                                    order_id: order.id,
                                    method: 'card',
                                  });
                                  setMenuOpenId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <CreditCard className="h-4 w-4" /> Pay Card
                              </button>
                            </>
                          )}
                      <button
                            type="button"
                            onClick={() => {
                              setDetailId(order.id);
                              setSlipOpen(true);
                              setMenuOpenId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Printer className="h-4 w-4" /> Print slip
                      </button>
                        </RowActionsMenu>
                        </div>
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
            <span className="text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-md border px-3 py-1 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border px-3 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {slipOpen && detail && (
        <OrderSlip
          order={{
            ...detail,
            payment_status:
              detail.payments?.some((p) => p.status === 'completed')
                ? 'paid'
                : detail.payment_status || 'unpaid',
            payment_method:
              detail.payment_method ||
              detail.payments?.[0]?.method ||
              null,
          }}
          restaurantName={restaurantName}
          onClose={() => {
            setSlipOpen(false);
            setDetailId(null);
          }}
        />
      )}

      {slipOpen && detailId && detailQuery.isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      {dispatchOrder && (
        <DispatchModal
          order={dispatchOrder}
          onClose={() => setDispatchOrder(null)}
        />
      )}

      {reviewOrder && (
        <OrderReviewModal
          key={reviewOrder.id}
          open
          orderLabel={`Order ${reviewOrder.order_number}`}
          customerName={reviewOrder.customer?.name}
          saving={createReviewMutation.isPending}
          onClose={() => setReviewOrder(null)}
          onSubmit={async ({ rating, comment }) => {
            try {
              const res = await createReviewMutation.mutateAsync({
                order_id: reviewOrder.id,
                branch_id: reviewOrder.branch_id || undefined,
                rating,
                comment: comment || null,
              });
              if (res?.status) {
                setReviewOrder(null);
                queryClient.invalidateQueries({ queryKey: ['orders'] });
              }
            } catch {
              // toast handled in mutation
            }
          }}
        />
      )}

      <QuickReserveModal
        open={quickReserveOpen}
        saving={quickReserveMutation.isPending}
        onClose={() => setQuickReserveOpen(false)}
        onSubmit={async (payload) => {
          await quickReserveMutation.mutateAsync(payload);
          setQuickReserveOpen(false);
        }}
      />
    </div>
  );
}
