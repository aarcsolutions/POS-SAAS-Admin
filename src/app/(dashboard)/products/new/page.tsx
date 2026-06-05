'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { ProductFormData } from '@/components/products/form/types';
import StepWizard from '@/components/products/form/StepWizard';
import Step1BasicInfo from '@/components/products/form/Step1BasicInfo';
import Step2Pricing from '@/components/products/form/Step2Pricing';
import Step3Media from '@/components/products/form/Step3Media';
import Step4Inventory from '@/components/products/form/Step4Inventory';
import Step5SEO from '@/components/products/form/Step5SEO';

export default function NewProductPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ProductFormData>({
    name: '', description: '', sku: '', supplier: '', mainCategory: '', subCategory: '', productType: 'Simple Product',
    variants: [], visibilityRetail: true, visibilityWholesale: false, productActive: true,
    sellingPrice: 0, costPrice: 0, taxVat: 'Sales Tax', profitMargin: 0,
    discountPercentage: 0, discountStartDate: '', discountEndDate: '', bulkPricing: [],
    galleryImages: [], urlImages: [], videos: [], videoUrls: [],
    trackInventory: true, stockQuantity: 0, weight: 0, width: 0, length: 0, height: 0,
    urlSlug: '', seoTitle: '', metaDescription: '', publishingStatus: 'draft',
  });

  const up = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Title */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-700">Add Product</span>
            <span>/</span>
            <button className="hover:text-slate-700" onClick={() => router.push('/products')}>Products</button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add New Product</h1>
          <p className="mt-1 text-sm text-slate-500">Fill in the details to list a new product</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/products')}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Cancel
          </button>
          <button className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Save as Draft
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
            <Check className="h-4 w-4" /> Publish Product
          </button>
        </div>
      </div>

      {/* Step Wizard */}
      <StepWizard step={step} onChange={setStep} />

      {/* Step Content */}
      {step === 1 && <Step1BasicInfo data={form} onChange={up} />}
      {step === 2 && <Step2Pricing data={form} onChange={up} />}
      {step === 3 && <Step3Media data={form} onChange={up} />}
      {step === 4 && <Step4Inventory data={form} onChange={up} />}
      {step === 5 && <Step5SEO data={form} onChange={up} />}

      {/* Bottom Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <button onClick={() => router.push('/products')}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Cancel
        </button>
        <button className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Save as Draft
        </button>
        <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
          <Check className="h-4 w-4" /> Publish Product
        </button>
      </div>
    </div>
  );
}
