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
  items: CartItem[];
  totalAmountInr: number;
  status: OrderStatus;
  estimatedWaitTime: number;
  createdAt: string; // ISO String
  client: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  }
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'client' | 'staff';
};
