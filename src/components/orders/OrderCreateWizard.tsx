'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Store,
  Tags,
  Truck,
  UtensilsCrossed,
} from 'lucide-react';
import { useCustomersQuery, useCreateCustomerMutation } from '@/hooks/customers';
import { useCategoriesQuery } from '@/hooks/categories';
import { useProductsQuery } from '@/hooks/products';
import { useCreateOrderMutation } from '@/hooks/orders';
import { useTablesQuery } from '@/hooks/tables';
import { useTaxesQuery } from '@/hooks/taxes';
import { useBusinessSettingsQuery } from '@/hooks/business-settings';
import { useAuthStore } from '@/store/authStore';
import { ordersApi } from '@/services/orders';
import { productsApi } from '@/services/products';
import { CartLine, OrderType } from '@/types/order.types';
import { Product } from '@/types/product.types';
import { Category } from '@/types/category.types';
import { TaxRow } from '@/types/tax.types';
import { BusinessSettingsRow } from '@/types/business-settings.types';
import { Select } from '@/components/ui/Select';
import { extractListItems } from '@/utils/helpers';
import { notifyError } from '@/utils/notify';
import { toastValidationError } from '@/utils/form-validation';
import { toast } from 'sonner';
import Link from 'next/link';

type Step = 'type' | 'customer' | 'table' | 'delivery' | 'browse' | 'confirm';

export type OrderCreatePrefill = {
  reservationId: string;
  customerId: string;
  customerLabel: string;
  tableId: string;
  tableLabel: string;
};

interface Props {
  onClose: () => void;
  onCreated: () => void;
  /** When starting from a reservation — skip type/customer/table. */
  prefill?: OrderCreatePrefill | null;
}

function productLines(product: Product): Array<{
  variant_id: string;
  variant_name: string;
  unit_price: number;
}> {
  const variants = product.variants || [];
  if (variants.length > 0) {
    return variants
      .filter((v) => !!v.id)
      .map((v) => ({
        variant_id: v.id!,
        variant_name: v.name || 'Default',
        unit_price: Number(v.price) || 0,
      }));
  }

  // List API sometimes returns price without variant payload
  if (product.price != null && !Number.isNaN(Number(product.price))) {
    return [
      {
        variant_id: '',
        variant_name: 'Default',
        unit_price: Number(product.price) || 0,
      },
    ];
  }

  return [];
}

function getProductImage(product: Product): string | null {
  const primary = product.images?.find((i) => i.is_primary)?.image_url;
  if (primary) return primary;
  if (product.images?.[0]?.image_url) return product.images[0].image_url;

  for (const variant of product.variants || []) {
    const vPrimary = variant.images?.find((i) => i.is_primary)?.image_url;
    if (vPrimary) return vPrimary;
    if (variant.images?.[0]?.image_url) return variant.images[0].image_url;
  }
  return null;
}

export default function OrderCreateWizard({
  onClose,
  onCreated,
  prefill = null,
}: Props) {
  const fromReservation = Boolean(prefill?.reservationId);
  const [step, setStep] = useState<Step>(
    fromReservation ? 'browse' : 'type'
  );
  const [orderType, setOrderType] = useState<OrderType | null>(
    fromReservation ? 'dine_in' : null
  );
  const [customerId, setCustomerId] = useState(prefill?.customerId || '');
  const [customerLabel, setCustomerLabel] = useState(
    prefill?.customerLabel || ''
  );
  const [tableId, setTableId] = useState(prefill?.tableId || '');
  const [tableLabel, setTableLabel] = useState(prefill?.tableLabel || '');
  const [reservationId] = useState(prefill?.reservationId || '');
  const [tableError, setTableError] = useState('');
  const [showCustomerCreate, setShowCustomerCreate] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [newCustomerErrors, setNewCustomerErrors] = useState<
    Record<string, string>
  >({});
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [deliveryError, setDeliveryError] = useState('');
  const [stepError, setStepError] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [resolvingProductId, setResolvingProductId] = useState<string | null>(
    null
  );
  const user = useAuthStore((s) => s.user);
  const [taxId, setTaxId] = useState('');
  const [taxDefaultApplied, setTaxDefaultApplied] = useState(false);

  const customersQuery = useCustomersQuery({
    page: 1,
    limit: 100,
    search: customerSearch || undefined,
  });
  const tablesQuery = useTablesQuery(
    {
      page: 1,
      limit: 100,
      status: 'available',
      // Tenant-level users only see tenant tables; branch users are scoped by JWT.
      branch_id: user?.branchId ? undefined : 'tenant',
    },
    orderType === 'dine_in' || step === 'table' || step === 'confirm'
  );
  const categoriesQuery = useCategoriesQuery({ page: 1, limit: 100 });
  const productsQuery = useProductsQuery({ page: 1, limit: 100 });
  const taxesQuery = useTaxesQuery({ page: 1, limit: 100 });
  const settingsQuery = useBusinessSettingsQuery({ page: 1, limit: 1 });

  const activeTaxes = useMemo(() => {
    return extractListItems<TaxRow>(taxesQuery.data, 'taxes').filter(
      (t) => t.is_active !== false
    );
  }, [taxesQuery.data]);

  const taxOptions = useMemo(
    () =>
      activeTaxes.map((t) => ({
        value: t.id,
        label:
          t.type === 'percentage'
            ? `${t.name} (${t.value}%)`
            : `${t.name} (flat ${t.value})`,
      })),
    [activeTaxes]
  );

  const selectedTax = useMemo(
    () => activeTaxes.find((t) => t.id === taxId) ?? null,
    [activeTaxes, taxId]
  );

  useEffect(() => {
    if (taxDefaultApplied) return;
    const settings =
      extractListItems<BusinessSettingsRow>(
        settingsQuery.data,
        'businessSettings'
      )[0] || extractListItems<BusinessSettingsRow>(settingsQuery.data)[0];
    if (settings?.default_tax_id) {
      setTaxId(settings.default_tax_id);
      setTaxDefaultApplied(true);
    } else if (settingsQuery.isSuccess) {
      setTaxDefaultApplied(true);
    }
  }, [settingsQuery.data, settingsQuery.isSuccess, taxDefaultApplied]);
  const createMutation = useCreateOrderMutation();
  const createCustomerMutation = useCreateCustomerMutation();

  const customers = useMemo(() => {
    const payload = customersQuery.data?.data as any;
    return payload?.data ?? payload?.customers ?? [];
  }, [customersQuery.data]);

  const tableOptions = useMemo(() => {
    const payload = tablesQuery.data?.data as any;
    const rows = payload?.data ?? payload?.tables ?? (Array.isArray(payload) ? payload : []);
    return (rows as Array<{ id: string; name: string; code?: string | null; status?: string }>).map(
      (t) => ({
        value: t.id,
        label: `${t.name}${t.code ? ` (${t.code})` : ''}${
          t.status && t.status !== 'available' ? ` · ${t.status}` : ''
        }`,
      })
    );
  }, [tablesQuery.data]);

  const categories: Category[] = useMemo(() => {
    const payload = categoriesQuery.data?.data as any;
    return payload?.data ?? payload?.categories ?? [];
  }, [categoriesQuery.data]);

  const products: Product[] = useMemo(() => {
    const payload = productsQuery.data?.data as any;
    return payload?.data ?? payload?.products ?? [];
  }, [productsQuery.data]);

  const categoryById = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  const childrenByParent = useMemo(() => {
    const map = new Map<string | null, Category[]>();
    for (const c of categories) {
      if (c.is_active === false) continue;
      const key = c.parent_id ?? null;
      const list = map.get(key) || [];
      list.push(c);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }, [categories]);

  const visibleSubcategories = useMemo(
    () => childrenByParent.get(selectedCategoryId) || [],
    [childrenByParent, selectedCategoryId]
  );

  const breadcrumb = useMemo(() => {
    if (!selectedCategoryId) return [] as Category[];
    const trail: Category[] = [];
    let current: Category | undefined = categoryById.get(selectedCategoryId);
    while (current) {
      trail.unshift(current);
      current = current.parent_id
        ? categoryById.get(current.parent_id)
        : undefined;
    }
    return trail;
  }, [selectedCategoryId, categoryById]);

  const categoryProducts = useMemo(() => {
    if (!selectedCategoryId) return [];
    return products.filter(
      (p) => p.category_id === selectedCategoryId && p.is_active !== false
    );
  }, [products, selectedCategoryId]);

  const productCountByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      if (p.is_active === false) continue;
      map.set(p.category_id, (map.get(p.category_id) || 0) + 1);
    }
    return map;
  }, [products]);

  const cartLines = Object.values(cart);
  const cartTotal = cartLines.reduce(
    (sum, line) => sum + line.unit_price * line.quantity,
    0
  );
  const promoDiscount = appliedPromo?.discount ?? 0;

  useEffect(() => {
    if (appliedPromo || promoError) {
      setAppliedPromo(null);
      setPromoError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset coupon when cart total changes
  }, [cartTotal]);

  const handlePromoCodeChange = (value: string) => {
    setPromoCode(value);
    if (appliedPromo || promoError) {
      setAppliedPromo(null);
      setPromoError(null);
    }
  };

  const handleApplyPromo = async () => {
    const code = promoCode.trim();
    if (!code) return;

    setPromoLoading(true);
    setPromoError(null);
    setAppliedPromo(null);

    try {
      const result = await ordersApi.validatePromo(code, cartTotal);

      if (!result?.valid) {
        setPromoError(result?.message || 'Invalid promo code');
        return;
      }

      setAppliedPromo({
        code: result.code ?? code.toUpperCase(),
        discount: result.discount ?? 0,
      });
      setPromoCode(result.code ?? code.toUpperCase());
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Could not validate promo code. Please try again.';
      setPromoError(message);
    } finally {
      setPromoLoading(false);
    }
  };

  const applyQty = (
    product: Product,
    variantId: string,
    variantName: string,
    unitPrice: number,
    delta: number
  ) => {
    const key = `${product.id}:${variantId}`;
    setCart((prev) => {
      const existing = prev[key];
      const nextQty = (existing?.quantity || 0) + delta;
      if (nextQty <= 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [key]: {
          key,
          product_id: product.id,
          product_name: product.name,
          variant_id: variantId,
          variant_name: variantName,
          quantity: nextQty,
          unit_price: unitPrice,
        },
      };
    });
  };

  const setQty = async (
    product: Product,
    variantId: string,
    variantName: string,
    unitPrice: number,
    delta: number
  ) => {
    let resolvedVariantId = variantId;
    let resolvedName = variantName;
    let resolvedPrice = unitPrice;

    if (!resolvedVariantId && delta > 0) {
      try {
        setResolvingProductId(product.id);
        const res = await productsApi.getById(product.id);
        const detail = res.data as Product;
        const variants = detail.variants || [];
        const pick =
          variants.find((v) => v.name === 'Regular') || variants[0];
        if (!pick?.id) {
          toast.error(`No sellable variant for "${product.name}"`);
          return;
        }
        resolvedVariantId = pick.id;
        resolvedName = pick.name || 'Default';
        resolvedPrice = Number(pick.price ?? detail.price ?? unitPrice) || 0;
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || 'Failed to load product variant'
        );
        return;
      } finally {
        setResolvingProductId(null);
      }
    }

    if (!resolvedVariantId) {
      // decreasing a line that somehow has empty id — clear by product prefix
      setCart((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          if (k.startsWith(`${product.id}:`)) delete next[k];
        });
        return next;
      });
      return;
    }

    applyQty(product, resolvedVariantId, resolvedName, resolvedPrice, delta);
    if (stepError) setStepError('');
  };

  const goBack = () => {
    if (step === 'confirm') {
      setStep('browse');
      return;
    }
    if (step === 'browse') {
      if (selectedCategoryId) {
        const current = categoryById.get(selectedCategoryId);
        setSelectedCategoryId(current?.parent_id ?? null);
        return;
      }
      if (fromReservation) {
        onClose();
        return;
      }
      if (orderType === 'dine_in') {
        setStep('table');
      } else if (orderType === 'delivery') {
        setStep('delivery');
      } else {
        setStep('customer');
      }
      return;
    }
    if (step === 'delivery') {
      setStep('customer');
      return;
    }
    if (step === 'table') {
      setStep('customer');
      return;
    }
    if (step === 'customer') {
      setStep('type');
      return;
    }
    onClose();
  };

  const handleConfirm = async () => {
    if (!orderType) {
      const msg = 'Select an order type to continue';
      setStepError(msg);
      setStep('type');
      toastValidationError(msg, notifyError);
      return;
    }
    if (!customerId) {
      const msg = 'Select a customer to continue';
      setStepError(msg);
      setStep('customer');
      toastValidationError(msg, notifyError);
      return;
    }
    if (cartLines.length === 0) {
      const msg = 'Add at least one item to the order';
      setStepError(msg);
      setStep('browse');
      toastValidationError(msg, notifyError);
      return;
    }
    if (orderType === 'dine_in' && !tableId) {
      const msg = 'Select a table to continue';
      setTableError(msg);
      setStep('table');
      toastValidationError(msg, notifyError);
      return;
    }
    if (orderType === 'delivery') {
      if (!deliveryAddress.trim()) {
        const msg = 'Delivery address is required';
        setDeliveryError(msg);
        setStep('delivery');
        toastValidationError(msg, notifyError);
        return;
      }
      if (!deliveryPhone.trim()) {
        const msg = 'Delivery phone is required';
        setDeliveryError(msg);
        setStep('delivery');
        toastValidationError(msg, notifyError);
        return;
      }
    }
    if (cartLines.some((l) => !l.variant_id)) {
      toastValidationError(
        'Some items are missing variants. Re-add them.',
        notifyError
      );
      return;
    }

    const feeNum = Math.max(0, Number(deliveryFee) || 0);

    try {
      const res = await createMutation.mutateAsync({
        customer_id: customerId,
        order_type: orderType,
        table_id: orderType === 'dine_in' ? tableId : undefined,
        reservation_id: reservationId || undefined,
        delivery_address:
          orderType === 'delivery' ? deliveryAddress.trim() : undefined,
        delivery_city:
          orderType === 'delivery'
            ? deliveryCity.trim() || undefined
            : undefined,
        delivery_phone:
          orderType === 'delivery' ? deliveryPhone.trim() : undefined,
        delivery_fee: orderType === 'delivery' ? feeNum : undefined,
        payment_method: orderType === 'delivery' ? 'cod' : undefined,
        items: cartLines.map((line) => ({
          product_id: line.product_id,
          variant_id: line.variant_id,
          quantity: line.quantity,
        })),
        promo_code: appliedPromo?.code || promoCode.trim() || undefined,
        tax_id: taxId || undefined,
      });
      if (res.status) {
        onCreated();
      }
    } catch {
      /* toast in hook */
    }
  };

  const rootCategories = childrenByParent.get(null) || [];
  const browseCategories = selectedCategoryId
    ? visibleSubcategories
    : rootCategories;

  const deliveryFeeNum =
    orderType === 'delivery' ? Math.max(0, Number(deliveryFee) || 0) : 0;
  const taxableBase = Math.max(0, cartTotal - promoDiscount);
  const taxAmount = (() => {
    if (!selectedTax) return 0;
    const taxValue = Number(selectedTax.value) || 0;
    if (selectedTax.type === 'percentage') {
      return (taxableBase * taxValue) / 100;
    }
    if (selectedTax.type === 'flat') {
      return taxValue;
    }
    return 0;
  })();
  const cartGrandTotal = Math.max(
    0,
    taxableBase + taxAmount + deliveryFeeNum
  );

  const cartSidebar = (
    <aside className="sticky top-4 flex w-full shrink-0 flex-col self-start rounded-2xl border border-slate-200 bg-white shadow-sm lg:w-80">
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <ShoppingBag className="h-4 w-4 text-[var(--brand-icon)]" />
          Order cart
          {cartLines.length > 0 && (
            <span className="rounded-full bg-[var(--brand-primary-soft)] px-2 py-0.5 text-xs font-bold text-[var(--brand-primary-dark)]">
              {cartLines.length}
            </span>
          )}
        </div>
      </div>

      <div className="max-h-[min(420px,calc(100vh-16rem))] flex-1 overflow-y-auto p-3">
        {cartLines.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No items yet. Add products from the menu.
          </p>
        ) : (
          <ul className="space-y-2">
            {cartLines.map((line) => (
              <li
                key={line.key}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <p className="text-sm font-semibold leading-snug text-slate-800">
                  {line.product_name}
                </p>
                {line.variant_name ? (
                  <p className="mt-0.5 text-xs text-slate-500">{line.variant_name}</p>
                ) : null}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const [productId] = line.key.split(':');
                        const product = products.find((p) => p.id === productId);
                        if (!product) return;
                        setQty(
                          product,
                          line.variant_id,
                          line.variant_name,
                          line.unit_price,
                          -1
                        );
                      }}
                      className="rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-slate-800">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const [productId] = line.key.split(':');
                        const product = products.find((p) => p.id === productId);
                        if (!product) return;
                        setQty(
                          product,
                          line.variant_id,
                          line.variant_name,
                          line.unit_price,
                          1
                        );
                      }}
                      className="rounded-full bg-[var(--brand-primary)] p-1 text-white shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    PKR {(line.unit_price * line.quantity).toFixed(2)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800">
              PKR {cartTotal.toFixed(2)}
            </span>
          </div>
          {orderType === 'delivery' && deliveryFeeNum > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Delivery fee</span>
              <span className="font-semibold text-slate-800">
                PKR {deliveryFeeNum.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>PKR {cartGrandTotal.toFixed(2)}</span>
          </div>
        </div>
        {step === 'browse' && (
          <button
            type="button"
            disabled={cartLines.length === 0}
            onClick={() => setStep('confirm')}
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Review & Confirm
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--brand-primary-soft)] px-3 py-2 text-sm font-semibold text-[var(--brand-primary-dark)]"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Order</h1>
            <p className="text-sm text-slate-500">
              {fromReservation
                ? `From reservation · ${customerLabel || 'Guest'}${tableLabel ? ` · ${tableLabel}` : ''}`
                : `Step: ${step === 'browse' ? 'Categories & products' : step}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-[var(--brand-primary-soft)] px-4 py-2 text-sm font-semibold text-[var(--brand-primary-dark)]"
        >
          Cancel
        </button>
      </div>

      {step === 'type' && (
        <div className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                id: 'dine_in' as const,
                title: 'Dine-in',
                desc: 'Customer eats at restaurant',
                icon: UtensilsCrossed,
              },
              {
                id: 'takeaway' as const,
                title: 'Takeaway',
                desc: 'Pack and go',
                icon: Store,
              },
              {
                id: 'delivery' as const,
                title: 'Delivery',
                desc: 'Deliver to customer address',
                icon: Truck,
              },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setOrderType(option.id);
                  setStepError('');
                  setStep('customer');
                }}
                className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-[var(--brand-primary)] hover:shadow-md"
              >
                <option.icon className="mb-3 h-8 w-8 text-[var(--brand-icon)]" />
                <h3 className="text-lg font-bold text-slate-900">{option.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{option.desc}</p>
              </button>
            ))}
          </div>
          {stepError && (
            <p className="text-xs text-rose-600">{stepError}</p>
          )}
        </div>
      )}

      {step === 'customer' && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex gap-2">
            <input
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search customers..."
              className="h-11 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                setShowCustomerCreate(true);
                setNewCustomerErrors({});
              }}
              className="inline-flex h-11 items-center gap-1 rounded-lg bg-[var(--brand-primary)] px-3 text-sm font-semibold text-white hover:brightness-95"
              title="Add customer"
            >
              <Plus className="h-4 w-4" />
              New
            </button>
          </div>
          {customersQuery.isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--brand-icon)]" />
            </div>
          ) : (
            <div className="max-h-[420px] space-y-2 overflow-y-auto">
              {customers.map((customer: any) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => {
                    setCustomerId(customer.id);
                    setCustomerLabel(
                      `${customer.name}${customer.phone ? ` · ${customer.phone}` : ''}`
                    );
                    if (orderType === 'delivery' && customer.phone) {
                      setDeliveryPhone((prev) => prev || customer.phone);
                    }
                    setStepError('');
                    if (orderType === 'dine_in') {
                      setStep('table');
                    } else if (orderType === 'delivery') {
                      setStep('delivery');
                    } else {
                      setStep('browse');
                    }
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-left hover:bg-[var(--brand-primary-soft)]"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{customer.name}</p>
                    <p className="text-xs text-slate-500">{customer.phone}</p>
                  </div>
                  <span className="text-xs font-bold text-[var(--brand-primary)]">Select</span>
                </button>
              ))}
              {customers.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">
                  No customers found. Use + New to create one.
                </p>
              )}
            </div>
          )}
          {stepError && (
            <p className="text-xs text-rose-600">{stepError}</p>
          )}

          {showCustomerCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
                <h3 className="text-lg font-bold text-slate-900">New customer</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Create and select for this order.
                </p>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Name *
                    </label>
                    <input
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    />
                    {newCustomerErrors.name && (
                      <p className="mt-1 text-xs text-rose-600">
                        {newCustomerErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Phone *
                    </label>
                    <input
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    />
                    {newCustomerErrors.phone && (
                      <p className="mt-1 text-xs text-rose-600">
                        {newCustomerErrors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Email
                    </label>
                    <input
                      value={newCustomerEmail}
                      onChange={(e) => setNewCustomerEmail(e.target.value)}
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Address
                    </label>
                    <input
                      value={newCustomerAddress}
                      onChange={(e) => setNewCustomerAddress(e.target.value)}
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomerCreate(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={createCustomerMutation.isPending}
                    onClick={async () => {
                      const errs: Record<string, string> = {};
                      if (!newCustomerName.trim()) errs.name = 'Name is required';
                      if (!newCustomerPhone.trim())
                        errs.phone = 'Phone is required';
                      setNewCustomerErrors(errs);
                      if (Object.keys(errs).length) return;

                      try {
                        const res = await createCustomerMutation.mutateAsync({
                          name: newCustomerName.trim(),
                          phone: newCustomerPhone.trim(),
                          email: newCustomerEmail.trim() || undefined,
                          address: newCustomerAddress.trim() || undefined,
                        });
                        const created =
                          res?.data?.data || res?.data || res?.customer;
                        const id = created?.id;
                        if (!id) {
                          toast.error('Customer created but id missing');
                          return;
                        }
                        setCustomerId(id);
                        setCustomerLabel(
                          `${created.name || newCustomerName}${
                            created.phone || newCustomerPhone
                              ? ` · ${created.phone || newCustomerPhone}`
                              : ''
                          }`
                        );
                        if (orderType === 'delivery') {
                          setDeliveryPhone(
                            (prev) =>
                              prev || created.phone || newCustomerPhone.trim()
                          );
                        }
                        setShowCustomerCreate(false);
                        setNewCustomerName('');
                        setNewCustomerPhone('');
                        setNewCustomerEmail('');
                        setNewCustomerAddress('');
                        setStepError('');
                        if (orderType === 'dine_in') {
                          setStep('table');
                        } else if (orderType === 'delivery') {
                          setStep('delivery');
                        } else {
                          setStep('browse');
                        }
                      } catch {
                        /* toast in hook */
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {createCustomerMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Create & select
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'table' && (
        <div className="max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Select table
          </label>
          {tablesQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--brand-icon)]" />
            </div>
          ) : tableOptions.length === 0 ? (
            <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p>No available tables for this branch.</p>
              <Link
                href="/tables"
                className="inline-flex font-semibold text-[var(--brand-primary)] hover:underline"
              >
                Create a table first
              </Link>
            </div>
          ) : (
            <Select
              value={tableId}
              onChange={(value) => {
                setTableId(value);
                const opt = tableOptions.find((o) => o.value === value);
                setTableLabel(opt?.label || '');
                if (tableError) setTableError('');
              }}
              placeholder="Choose table"
              options={tableOptions}
              variant="form"
              size="lg"
              allowEmpty={false}
              searchable
              searchPlaceholder="Search tables…"
            />
          )}
          {tableError && (
            <p className="text-[12px] font-medium text-rose-600">{tableError}</p>
          )}
          <button
            type="button"
            onClick={() => {
              if (!tableId) {
                const msg = 'Select a table to continue';
                setTableError(msg);
                toastValidationError(msg, notifyError);
                return;
              }
              setTableError('');
              setStepError('');
              setStep('browse');
            }}
            className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            Continue
          </button>
        </div>
      )}

      {step === 'delivery' && (
        <div className="max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Delivery address
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => {
                setDeliveryAddress(e.target.value);
                if (deliveryError) setDeliveryError('');
              }}
              rows={3}
              placeholder="Street, building, landmark"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              City (optional)
            </label>
            <input
              value={deliveryCity}
              onChange={(e) => setDeliveryCity(e.target.value)}
              placeholder="City"
              className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Phone
            </label>
            <input
              value={deliveryPhone}
              onChange={(e) => {
                setDeliveryPhone(e.target.value);
                if (deliveryError) setDeliveryError('');
              }}
              placeholder="Delivery contact phone"
              className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Delivery fee
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
            />
          </div>
          <p className="text-xs text-slate-500">
            Payment method defaults to COD (collect on delivery).
          </p>
          {deliveryError && (
            <p className="text-[12px] font-medium text-rose-600">{deliveryError}</p>
          )}
          <button
            type="button"
            onClick={() => {
              if (!deliveryAddress.trim()) {
                const msg = 'Delivery address is required';
                setDeliveryError(msg);
                toastValidationError(msg, notifyError);
                return;
              }
              if (!deliveryPhone.trim()) {
                const msg = 'Delivery phone is required';
                setDeliveryError(msg);
                toastValidationError(msg, notifyError);
                return;
              }
              setDeliveryError('');
              setStepError('');
              setStep('browse');
            }}
            className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            Continue
          </button>
        </div>
      )}

      {step === 'browse' && (
        <div className="flex flex-col-reverse gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 space-y-5">
          {(categoriesQuery.isLoading || productsQuery.isLoading) && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--brand-icon)]" />
            </div>
          )}

          {breadcrumb.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="font-semibold text-[var(--brand-primary)] hover:underline"
              >
                All categories
              </button>
              {breadcrumb.map((cat) => (
                <span key={cat.id} className="inline-flex items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5" />
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className="font-semibold text-slate-700 hover:underline"
                  >
                    {cat.name}
                  </button>
                </span>
              ))}
            </div>
          )}

          {browseCategories.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                {selectedCategoryId ? 'Subcategories' : 'Categories'}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {browseCategories.map((category) => {
                  const childCount =
                    childrenByParent.get(category.id)?.length || 0;
                  const productCount =
                    productCountByCategory.get(category.id) || 0;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(category.id)}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-[var(--brand-primary)] hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100">
                        {category.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <Tags className="h-10 w-10" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <p className="font-bold text-slate-900">{category.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {childCount > 0
                            ? `${childCount} subcategories`
                            : `${productCount} products`}
                          {childCount > 0 && productCount > 0
                            ? ` · ${productCount} products`
                            : ''}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedCategoryId && (
            <div>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                Products
              </h2>

              {categoryProducts.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                  {visibleSubcategories.length > 0
                    ? 'No products in this category — open a subcategory.'
                    : 'No products in this category.'}
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryProducts.map((product) => {
                    const lines = productLines(product);
                    const imageUrl = getProductImage(product);
                    if (lines.length === 0) {
                      return (
                        <div
                          key={product.id}
                          className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-400"
                        >
                          {product.name} — no price/variant
                        </div>
                      );
                    }
                    return (
                      <div
                        key={product.id}
                        className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                      >
                        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-slate-100">
                          {imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                              <Package className="h-10 w-10" />
                            </div>
                          )}
                          {resolvingProductId === product.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                              <Loader2 className="h-6 w-6 animate-spin text-[var(--brand-icon)]" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <h3 className="font-bold text-slate-900">{product.name}</h3>
                          <div className="mt-2 space-y-2">
                          {lines.map((line) => {
                            const cartKey = line.variant_id
                              ? `${product.id}:${line.variant_id}`
                              : Object.keys(cart).find((k) =>
                                  k.startsWith(`${product.id}:`)
                                );
                            const qty = cartKey
                              ? cart[cartKey]?.quantity || 0
                              : 0;
                            return (
                              <div
                                key={line.variant_id || line.variant_name}
                                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-slate-700">
                                    {line.variant_name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    PKR {line.unit_price.toFixed(2)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setQty(
                                        product,
                                        line.variant_id,
                                        line.variant_name,
                                        line.unit_price,
                                        -1
                                      )
                                    }
                                    className="rounded-full bg-white p-1 shadow"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="w-6 text-center text-sm font-bold">
                                    {qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setQty(
                                        product,
                                        line.variant_id,
                                        line.variant_name,
                                        line.unit_price,
                                        1
                                      )
                                    }
                                    className="rounded-full bg-[var(--brand-primary)] p-1 text-white shadow"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!selectedCategoryId &&
            !categoriesQuery.isLoading &&
            !categoriesQuery.isError &&
            rootCategories.length === 0 && (
              <p className="text-center text-sm text-slate-400">
                No categories found.
              </p>
            )}
          {categoriesQuery.isError && (
            <p className="text-center text-sm text-rose-500">
              Failed to load categories. Check permissions and try again.
            </p>
          )}
          {productsQuery.isError && selectedCategoryId && (
            <p className="text-center text-sm text-rose-500">
              Failed to load products.
            </p>
          )}
          {stepError && (
            <p className="text-xs text-rose-600">{stepError}</p>
          )}
          </div>
          {cartSidebar}
        </div>
      )}

      {step === 'confirm' && (
        <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">Confirm order</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Type</dt>
              <dd className="font-semibold capitalize">
                {orderType?.replace('_', '-')}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Customer</dt>
              <dd className="font-semibold">{customerLabel}</dd>
            </div>
            {orderType === 'dine_in' && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Table</dt>
                <dd className="font-semibold">{tableLabel || tableId}</dd>
              </div>
            )}
            {orderType === 'delivery' && (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Address</dt>
                  <dd className="max-w-[60%] text-right font-semibold">
                    {deliveryAddress}
                    {deliveryCity ? `, ${deliveryCity}` : ''}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Phone</dt>
                  <dd className="font-semibold">{deliveryPhone}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Delivery fee</dt>
                  <dd className="font-semibold">
                    PKR {Math.max(0, Number(deliveryFee) || 0).toFixed(2)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Payment</dt>
                  <dd className="font-semibold uppercase">COD</dd>
                </div>
              </>
            )}
          </dl>
          <div className="divide-y rounded-xl border border-slate-100">
            {cartLines.map((line) => (
              <div
                key={line.key}
                className="flex items-center justify-between px-3 py-2 text-sm"
              >
                <span>
                  {line.product_name} · {line.variant_name} × {line.quantity}
                </span>
                <span className="font-semibold">
                  PKR {(line.unit_price * line.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              Tax (optional)
            </label>
            <Select
              value={taxId}
              onChange={setTaxId}
              options={taxOptions}
              placeholder="No tax / use server default"
              allowEmpty
              variant="form"
            />
            <p className="mt-1 text-xs text-slate-400">
              Prefills from Business Settings default tax when set. Leave empty
              to let the server apply the branch default.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              Promo code (optional)
            </label>
            <div className="flex gap-2">
              <input
                value={promoCode}
                onChange={(e) => handlePromoCodeChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyPromo();
                  }
                }}
                placeholder="SAVE10"
                className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm uppercase"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={promoLoading || !promoCode.trim()}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {promoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Apply'
                )}
              </button>
            </div>
            {promoError ? (
              <p className="mt-1.5 text-xs font-medium text-rose-600">
                {promoError}
              </p>
            ) : null}
            {appliedPromo ? (
              <p className="mt-1.5 text-xs font-medium text-[var(--brand-primary)]">
                {appliedPromo.code} applied — PKR {appliedPromo.discount.toFixed(2)}{' '}
                off
              </p>
            ) : null}
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">
                PKR {cartTotal.toFixed(2)}
              </span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-[var(--brand-icon)]">
                <span>Discount ({appliedPromo?.code})</span>
                <span className="font-semibold">
                  − PKR {promoDiscount.toFixed(2)}
                </span>
              </div>
            )}
            {orderType === 'delivery' && deliveryFeeNum > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Delivery fee</span>
                <span className="font-semibold text-slate-800">
                  PKR {deliveryFeeNum.toFixed(2)}
                </span>
              </div>
            )}
            {taxAmount > 0 && selectedTax && (
              <div className="flex justify-between text-slate-600">
                <span>
                  Tax (
                  {selectedTax.type === 'percentage'
                    ? `${selectedTax.name} ${selectedTax.value}%`
                    : selectedTax.name}
                  )
                </span>
                <span className="font-semibold text-slate-800">
                  PKR {taxAmount.toFixed(2)}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base font-bold">
            <span>Estimated total</span>
            <span>PKR {cartGrandTotal.toFixed(2)}</span>
          </div>
          <button
            type="button"
            disabled={createMutation.isPending}
            onClick={handleConfirm}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {createMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Place order
          </button>
        </div>
      )}
    </div>
  );
}
