
import type { Timestamp } from 'firebase/firestore';

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
  items: string; // JSON string of simplified item objects {id, name, quantity, priceInr}
  totalAmountInr: number;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  estimatedWaitTime: number;
  createdAt: Timestamp | object; // Can be server timestamp object before being written
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
