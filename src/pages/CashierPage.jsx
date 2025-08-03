import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import { Search, Trash2, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { useSearch } from '../hooks/useCustomHooks';
import { PRODUCT_CATEGORIES } from '../utils/constants';

const CashierPage = ({ products, cart, addToCart, removeFromCart, removeItemFromCart, updateQuantity, clearCart, onProcessPayment }) => {
    const [selectedCategory, setSelectedCategory] = useState('');
    
    // Use custom search hook with debounce
    const { searchTerm, setSearchTerm, filteredItems: searchFilteredProducts } = useSearch(
        products, 
        ['name', 'category'], 
        300
    );

    // Further filter by category
    const filteredProducts = useMemo(() => {
        if (!selectedCategory) return searchFilteredProducts;
        return searchFilteredProducts.filter(product => product.category === selectedCategory);
    }, [searchFilteredProducts, selectedCategory]);

    const total = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]);

    const handleQuantityChange = (productId, newQuantity) => {
        updateQuantity(productId, newQuantity);
    };

    return (
        <div className="flex h-full">
            <div className="w-2/3 p-6 flex flex-col">
                {/* Search and Filter */}
                <div className="mb-6 space-y-4">
                    <div className="relative">
                        <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input 
                            type="text" 
                            placeholder="Cari produk..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" 
                        />
                    </div>
                    
                    {/* Category Filter */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setSelectedCategory('')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                selectedCategory === '' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                            }`}
                        >
                            Semua
                        </button>
                        {PRODUCT_CATEGORIES.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    selectedCategory === category 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <Card 
                                key={product.id} 
                                className="p-3 text-center cursor-pointer hover:border-blue-500 transition-all group" 
                                onClick={() => addToCart(product)}
                            >
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-full h-32 object-cover rounded-md mb-3" 
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300';
                                    }}
                                />
                                <p className="font-semibold text-white truncate">{product.name}</p>
                                <p className="text-sm text-neutral-400">{formatCurrency(product.price)}</p>
                            </Card>
                        ))}
                    </div>
                    
                    {filteredProducts.length === 0 && (
                        <div className="text-center text-neutral-500 mt-20">
                            <p>Tidak ada produk ditemukan</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="w-1/3 bg-neutral-900/80 backdrop-blur-xl border-l border-neutral-800 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Pesanan Saat Ini</h2>
                    {cart.length > 0 && (
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)} item
                        </span>
                    )}
                </div>
                
                <div className="flex-grow overflow-y-auto -mr-3 pr-3">
                    {cart.length === 0 ? (
                        <p className="text-neutral-500 text-center mt-20">Keranjang masih kosong.</p>
                    ) : (
                        <ul className="space-y-3">
                            {cart.map(item => (
                                <li key={item.id} className="flex items-center gap-3 bg-neutral-800/80 p-3 rounded-lg">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-12 h-12 rounded-md object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300';
                                        }}
                                    />
                                    <div className="flex-grow min-w-0">
                                        <p className="font-semibold text-white truncate">{item.name}</p>
                                        <p className="text-sm text-neutral-400">{formatCurrency(item.price)}</p>
                                    </div>
                                    
                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                            className="w-6 h-6 bg-neutral-700 hover:bg-neutral-600 rounded-full flex items-center justify-center transition-colors"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="font-semibold text-white min-w-[24px] text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                            className="w-6 h-6 bg-neutral-700 hover:bg-neutral-600 rounded-full flex items-center justify-center transition-colors"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                    
                                    <button 
                                        onClick={() => removeItemFromCart(item.id)} 
                                        className="text-neutral-500 hover:text-red-500 p-1 transition-colors"
                                        title="Hapus semua item ini"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                
                <div className="border-t border-neutral-800 mt-4 pt-4">
                    <div className="flex justify-between items-center text-lg mb-4">
                        <span className="text-neutral-300">Total</span>
                        <span className="font-bold text-white text-2xl">{formatCurrency(total)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={clearCart} 
                            disabled={cart.length === 0} 
                            className="w-full bg-neutral-700 text-white font-bold py-3 rounded-lg hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={onProcessPayment} 
                            disabled={cart.length === 0} 
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Bayar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashierPage;