'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { useCustomersQuery } from '@/hooks/customers';
import { useCategoriesQuery } from '@/hooks/categories';
import { useProductsQuery } from '@/hooks/products';
import { useCreateOrderMutation } from '@/hooks/orders';
import { productsApi } from '@/services/products';
import { CartLine, OrderType } from '@/types/order.types';
import { Product } from '@/types/product.types';
import { Category } from '@/types/category.types';
import { toast } from 'sonner';

type Step = 'type' | 'customer' | 'table' | 'browse' | 'confirm';

interface Props {
  onClose: () => void;
  onCreated: () => void;
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

export default function OrderCreateWizard({ onClose, onCreated }: Props) {
  const [step, setStep] = useState<Step>('type');
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [customerId, setCustomerId] = useState('');
  const [customerLabel, setCustomerLabel] = useState('');
  const [tableName, setTableName] = useState('');
  const [tableNameError, setTableNameError] = useState('');
  const [stepError, setStepError] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [promoCode, setPromoCode] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [resolvingProductId, setResolvingProductId] = useState<string | null>(
    null
  );

  const customersQuery = useCustomersQuery({
    page: 1,
    limit: 100,
    search: customerSearch || undefined,
  });
  const categoriesQuery = useCategoriesQuery({ page: 1, limit: 100 });
  const productsQuery = useProductsQuery({ page: 1, limit: 100 });
  const createMutation = useCreateOrderMutation();

  const customers = useMemo(() => {
    const payload = customersQuery.data?.data as any;
    return payload?.data ?? payload?.customers ?? [];
  }, [customersQuery.data]);

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
      setStep(orderType === 'dine_in' ? 'table' : 'customer');
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
      setStepError('Select an order type to continue');
      setStep('type');
      return;
    }
    if (!customerId) {
      setStepError('Select a customer to continue');
      setStep('customer');
      return;
    }
    if (cartLines.length === 0) {
      setStepError('Add at least one item to the order');
      setStep('browse');
      return;
    }
    if (orderType === 'dine_in' && !tableName.trim()) {
      setTableNameError('Table number is required');
      setStep('table');
      return;
    }
    if (cartLines.some((l) => !l.variant_id)) {
      toast.error('Some items are missing variants. Re-add them.');
      return;
    }

    try {
      const res = await createMutation.mutateAsync({
        customer_id: customerId,
        order_type: orderType,
        table_name:
          orderType === 'dine_in' ? tableName.trim() : undefined,
        items: cartLines.map((line) => ({
          product_id: line.product_id,
          variant_id: line.variant_id,
          quantity: line.quantity,
        })),
        promo_code: promoCode.trim() || undefined,
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 rounded-md bg-[#e5edf5] px-3 py-2 text-sm font-semibold text-[#516276]"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Order</h1>
            <p className="text-sm text-slate-500">
              Step: {step === 'browse' ? 'Categories & products' : step}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-[#e5edf5] px-4 py-2 text-sm font-semibold text-[#516276]"
        >
          Cancel
        </button>
      </div>

      {cartLines.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
              <ShoppingBag className="h-4 w-4" /> Selected ({cartLines.length})
            </div>
            {step === 'browse' && (
              <button
                type="button"
                onClick={() => setStep('confirm')}
                className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Review & Confirm
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {cartLines.map((line) => (
              <span
                key={line.key}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
              >
                {line.product_name}
                {line.variant_name ? ` · ${line.variant_name}` : ''} ×{' '}
                {line.quantity}
              </span>
            ))}
          </div>
          <p className="mt-2 text-sm font-bold text-amber-900">
            Subtotal: PKR {cartTotal.toFixed(2)}
          </p>
        </div>
      )}

      {step === 'type' && (
        <div className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
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
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setOrderType(option.id);
                  setStepError('');
                  setStep('customer');
                }}
                className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-amber-400 hover:shadow-md"
              >
                <option.icon className="mb-3 h-8 w-8 text-amber-600" />
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
          <input
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            placeholder="Search customers..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
          />
          {customersQuery.isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
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
                    setStepError('');
                    setStep(orderType === 'dine_in' ? 'table' : 'browse');
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-left hover:bg-amber-50"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{customer.name}</p>
                    <p className="text-xs text-slate-500">{customer.phone}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700">Select</span>
                </button>
              ))}
            </div>
          )}
          {stepError && (
            <p className="text-xs text-rose-600">{stepError}</p>
          )}
        </div>
      )}

      {step === 'table' && (
        <div className="max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Table number
          </label>
          <input
            value={tableName}
            onChange={(e) => {
              setTableName(e.target.value);
              if (tableNameError) setTableNameError('');
            }}
            placeholder="e.g. Table 5"
            className={`h-11 w-full rounded-lg border bg-slate-50 px-3 text-sm ${
              tableNameError ? 'border-rose-400' : 'border-slate-200'
            }`}
          />
          {tableNameError && (
            <p className="text-[12px] font-medium text-rose-600">{tableNameError}</p>
          )}
          <button
            type="button"
            onClick={() => {
              if (!tableName.trim()) {
                setTableNameError('Table number is required');
                return;
              }
              setTableNameError('');
              setStepError('');
              setStep('browse');
            }}
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Continue
          </button>
        </div>
      )}

      {step === 'browse' && (
        <div className="space-y-5">
          {(categoriesQuery.isLoading || productsQuery.isLoading) && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
            </div>
          )}

          {breadcrumb.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="font-semibold text-amber-700 hover:underline"
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
                      className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-amber-400"
                    >
                      <p className="font-bold text-slate-900">{category.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {childCount > 0
                          ? `${childCount} subcategories`
                          : `${productCount} products`}
                        {childCount > 0 && productCount > 0
                          ? ` · ${productCount} products`
                          : ''}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedCategoryId && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Products
                </h2>
                {cartLines.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep('confirm')}
                    className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Review order
                  </button>
                )}
              </div>

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
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <h3 className="font-bold text-slate-900">
                            {product.name}
                          </h3>
                          {resolvingProductId === product.id && (
                            <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                          )}
                        </div>
                        <div className="space-y-2">
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
                                    className="rounded-full bg-amber-600 p-1 text-white shadow"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
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
                <dd className="font-semibold">{tableName}</dd>
              </div>
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
              Promo code (optional)
            </label>
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="SAVE10"
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            />
          </div>
          <div className="flex items-center justify-between text-base font-bold">
            <span>Estimated total</span>
            <span>PKR {cartTotal.toFixed(2)}</span>
          </div>
          <button
            type="button"
            disabled={createMutation.isPending}
            onClick={handleConfirm}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
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
