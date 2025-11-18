export type Outlet = {
  id: string;
  name: string;
  description: string;
  imageId: string;
  isActive: boolean;
  baseDeliveryTime: number;
};

export type MenuItem = {
  id: string;
  outletId: string;
  name: string;
  description: string;
  priceInr: number;
  imageId: string;
  category: string;
  isAvailable: boolean;
  averagePrepTime: number;
};

export type CartItem = {
  menuItem: MenuItem;
  quantity: number;
};

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type Order = {
  id: string;
  orderNumber: string;
  tokenNumber: number;
  outletId: string;
  items: string; // JSON string of items
  totalAmountInr: number;
  status: OrderStatus;
  estimatedWaitTime: number;
  createdAt: string;
  clientName: string;
  clientId: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  isProfileComplete?: boolean;
};
