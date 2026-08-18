'use client';

import { useRouter } from 'next/navigation';
import ProductForm from '@/components/products/ProductForm';
import { useCreateProductMutation } from '@/hooks/products';

export default function NewProductPage() {
  const router = useRouter();
  const createMutation = useCreateProductMutation();

  return (
    <ProductForm
      mode="create"
      saving={createMutation.isPending}
      onClose={() => router.push('/products')}
      onSubmit={async (payload) => {
        await createMutation.mutateAsync(payload);
        router.push('/products');
      }}
    />
  );
}
