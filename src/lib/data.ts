import type { Outlet, MenuItem, Order, UserProfile } from './types';

export const outlets: Outlet[] = [
  {
    id: 'medical_cafetaria',
    name: 'Medical Cafeteria',
    description: 'Serving healthy and delicious meals for everyone.',
    imageId: 'outlet-medical-cafeteria',
    isActive: true,
  },
  {
    id: 'bits_and_bites',
    name: 'Bits & Bites',
    description: 'Quick snacks, sandwiches, and refreshing beverages.',
    imageId: 'outlet-bits-bites',
    isActive: true,
  },
];

export const menuItems: MenuItem[] = [
  // Medical Cafeteria
  {
    id: 'item-1',
    outletId: 'medical_cafetaria',
    name: 'Chole Bhature',
    description: 'Spicy chickpeas curry served with fluffy deep-fried bread.',
    priceInr: 120,
    imageId: 'item-chole-bhature',
    category: 'Main Course',
    isAvailable: true,
    averagePrepTime: 15,
  },
  {
    id: 'item-2',
    outletId: 'medical_cafetaria',
    name: 'Masala Dosa',
    description: 'A thin pancake of rice batter, filled with spiced potatoes.',
    priceInr: 100,
    imageId: 'item-masala-dosa',
    category: 'Main Course',
    isAvailable: true,
    averagePrepTime: 12,
  },
  {
    id: 'item-3',
    outletId: 'medical_cafetaria',
    name: 'Paneer Tikka',
    description: 'Cubes of paneer marinated in spices and grilled in a tandoor.',
    priceInr: 150,
    imageId: 'item-paneer-tikka',
    category: 'Starters',
    isAvailable: true,
    averagePrepTime: 18,
  },
  {
    id: 'item-4',
    outletId: 'medical_cafetaria',
    name: 'Vegetable Biryani',
    description: 'Aromatic rice dish with mixed vegetables and spices.',
    priceInr: 180,
    imageId: 'item-veg-biryani',
    category: 'Main Course',
    isAvailable: true,
    averagePrepTime: 20,
  },
    {
    id: 'item-5',
    outletId: 'medical_cafetaria',
    name: 'Samosa',
    description: 'Fried pastry with a savory filling of spiced potatoes and peas.',
    priceInr: 30,
    imageId: 'item-samosa',
    category: 'Starters',
    isAvailable: true,
    averagePrepTime: 8,
  },
  {
    id: 'item-6',
    outletId: 'medical_cafetaria',
    name: 'Filter Coffee',
    description: 'South Indian style drip coffee.',
    priceInr: 40,
    imageId: 'item-filter-coffee',
    category: 'Beverages',
    isAvailable: true,
    averagePrepTime: 5,
  },
    {
    id: 'item-7',
    outletId: 'medical_cafetaria',
    name: 'Fresh Lime Soda',
    description: 'A refreshing drink with lime juice and soda.',
    priceInr: 50,
    imageId: 'item-fresh-lime-soda',
    category: 'Beverages',
    isAvailable: true,
    averagePrepTime: 3,
  },

  // Bits & Bites
  {
    id: 'item-8',
    outletId: 'bits_and_bites',
    name: 'Club Sandwich',
    description: 'Triple-layered sandwich with veg fillings, served with fries.',
    priceInr: 160,
    imageId: 'item-club-sandwich',
    category: 'Snacks',
    isAvailable: true,
    averagePrepTime: 10,
  },
  {
    id: 'item-9',
    outletId: 'bits_and_bites',
    name: 'Veg Hakka Noodles',
    description: 'Stir-fried noodles with a variety of vegetables.',
    priceInr: 140,
    imageId: 'item-veg-hakka-noodles',
    category: 'Main Course',
    isAvailable: true,
    averagePrepTime: 15,
  },
  {
    id: 'item-10',
    outletId: 'bits_and_bites',
    name: 'Chilli Paneer',
    description: 'Spicy and tangy indo-chinese dish with paneer and bell peppers.',
    priceInr: 180,
    imageId: 'item-chilli-paneer',
    category: 'Main Course',
    isAvailable: false,
    averagePrepTime: 18,
  },
  {
    id: 'item-11',
    outletId: 'bits_and_bites',
    name: 'Coca-Cola',
    description: 'A can of chilled Coca-Cola.',
    priceInr: 40,
    imageId: 'item-coke',
    category: 'Beverages',
    isAvailable: true,
    averagePrepTime: 1,
  },
];

export const orders: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'DH-001',
    tokenNumber: 1,
    outletId: 'medical_cafetaria',
    items: [
      { menuItem: menuItems.find(mi => mi.id === 'item-1')!, quantity: 1 },
      { menuItem: menuItems.find(mi => mi.id === 'item-2')!, quantity: 2 },
    ],
    totalAmountInr: 320,
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    estimatedWaitTime: 15,
    client: {
      id: 'client-1',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+919876543210'
    }
  },
  {
    id: 'order-2',
    orderNumber: 'DH-002',
    tokenNumber: 2,
    outletId: 'medical_cafetaria',
    items: [{ menuItem: menuItems.find(mi => mi.id === 'item-3')!, quantity: 1 }],
    totalAmountInr: 150,
    status: 'preparing',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    estimatedWaitTime: 20,
     client: {
      id: 'client-2',
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phoneNumber: '+919876543211'
    }
  },
  {
    id: 'order-3',
    orderNumber: 'DH-003',
    tokenNumber: 3,
    outletId: 'bits_and_bites',
    items: [{ menuItem: menuItems.find(mi => mi.id === 'item-8')!, quantity: 3 }],
    totalAmountInr: 480,
    status: 'ready',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    estimatedWaitTime: 10,
     client: {
      id: 'client-3',
      fullName: 'Peter Jones',
      email: 'peter.jones@example.com',
      phoneNumber: '+919876543212'
    }
  },
  {
    id: 'order-4',
    orderNumber: 'DH-004',
    tokenNumber: 4,
    outletId: 'medical_cafetaria',
    items: [
      { menuItem: menuItems.find(mi => mi.id === 'item-4')!, quantity: 1 },
      { menuItem: menuItems.find(mi => mi.id === 'item-5')!, quantity: 2 },
    ],
    totalAmountInr: 240,
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedWaitTime: 25,
     client: {
      id: 'client-1',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+919876543210'
    }
  },
];


export const mockUserProfile: UserProfile = {
  id: 'client-1',
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phoneNumber: '+919876543210',
  role: 'client'
};

export const mockStaffProfile: UserProfile = {
  id: 'staff-1',
  fullName: 'Staff Member',
  email: 'staff@example.com',
  phoneNumber: '+911234567890',
  role: 'staff'
};
