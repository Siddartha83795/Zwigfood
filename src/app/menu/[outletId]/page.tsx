
import { use } from 'react';
import MenuPageClient from './menu-page-client';

// This is a Server Component
export default function MenuPage({ params }: { params: Promise<{ outletId: string }> }) {
  const { outletId } = use(params);

  return <MenuPageClient outletId={outletId} />;
}
