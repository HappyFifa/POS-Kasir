export const initialProducts = [
  { id: 1, name: 'Espresso', category: 'Kopi', price: 22000, image: 'https://images.unsplash.com/photo-1579954115545-195abc1b5818?q=80&w=1974&auto=format&fit=crop' },
  { id: 2, name: 'Latte', category: 'Kopi', price: 28000, image: 'https://images.unsplash.com/photo-1557899911-ea0a41e4a5d3?q=80&w=1974&auto=format&fit=crop' },
  { id: 3, name: 'Cappuccino', category: 'Kopi', price: 28000, image: 'https://images.unsplash.com/photo-1557099222-13c53565155f?q=80&w=1974&auto=format&fit=crop' },
  { id: 4, name: 'Croissant', category: 'Pastry', price: 25000, image: 'https://images.unsplash.com/photo-1621939512535-0c01b9a9758a?q=80&w=1974&auto=format&fit=crop' },
  { id: 5, name: 'Pain au Chocolat', category: 'Pastry', price: 27000, image: 'https://images.unsplash.com/photo-1608639024328-791771113a6e?q=80&w=1974&auto=format&fit=crop' },
  { id: 6, name: 'Mineral Water', category: 'Minuman', price: 15000, image: 'https://images.unsplash.com/photo-1588704487283-a28185567336?q=80&w=1974&auto=format&fit=crop' },
];

export const salesData = [
  { name: 'Sen', Penjualan: 400000 },
  { name: 'Sel', Penjualan: 300000 },
  { name: 'Rab', Penjualan: 500000 },
  { name: 'Kam', Penjualan: 450000 },
  { name: 'Jum', Penjualan: 600000 },
  { name: 'Sab', Penjualan: 800000 },
  { name: 'Min', Penjualan: 750000 },
];

export const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);