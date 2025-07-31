import { initialProducts } from './mockData';

// Menyimpan produk di localStorage
const PRODUCTS_KEY = 'pos_products';

// Inisialisasi data produk
const initializeProducts = () => {
    const existingProducts = localStorage.getItem(PRODUCTS_KEY);
    if (!existingProducts) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
        return initialProducts;
    }
    return JSON.parse(existingProducts);
};

// Mendapatkan semua produk
export const getProducts = () => {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || initializeProducts();
};

// Menambah atau mengupdate produk
export const saveProduct = (product) => {
    const products = getProducts();
    const index = products.findIndex(p => p.id === product.id);
    
    if (index >= 0) {
        // Update produk yang ada
        products[index] = product;
    } else {
        // Tambah produk baru
        products.push(product);
    }
    
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return products;
};

// Menghapus produk
export const deleteProduct = (productId) => {
    const products = getProducts();
    const filteredProducts = products.filter(p => p.id !== productId);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filteredProducts));
    return filteredProducts;
};

// Format currency
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};
