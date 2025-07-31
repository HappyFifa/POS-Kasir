import React, { useState } from 'react';
import Card from '../components/Card';
import { Search, Trash2 } from 'lucide-react';
import { formatCurrency } from '../data/productData';
import PaymentSuccessModal from '../components/PaymentSuccessModal';

const CashierPage = ({ products, cart, addToCart, removeFromCart, clearCart, onProcessPayment }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastChange, setLastChange] = useState(0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-full">
            <div className="w-2/3 p-6 flex flex-col">
                <div className="relative mb-6">
                    <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input 
                        type="text" 
                        placeholder="Cari produk..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <Card key={product.id} className="p-3 text-center cursor-pointer hover:border-blue-500 transition-all group" onClick={() => addToCart(product)}>
                                <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-md mb-3" />
                                <p className="font-semibold text-white truncate">{product.name}</p>
                                <p className="text-sm text-neutral-400">{formatCurrency(product.price)}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
            <div className="w-1/3 bg-neutral-900/80 backdrop-blur-xl border-l border-neutral-800 p-6 flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-4">Pesanan Saat Ini</h2>
                <div className="flex-grow overflow-y-auto -mr-3 pr-3">
                    {cart.length === 0 ? (
                        <p className="text-neutral-500 text-center mt-20">Keranjang masih kosong.</p>
                    ) : (
                        <ul className="space-y-3">
                            {cart.map(item => (
                                <li key={item.id} className="flex items-center gap-4 bg-neutral-800/80 p-3 rounded-lg">
                                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover"/>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-white">{item.name}</p>
                                        <p className="text-sm text-neutral-400">{formatCurrency(item.price)}</p>
                                    </div>
                                    <p className="font-semibold text-white">x {item.quantity}</p>
                                    <button onClick={() => removeFromCart(item.id)} className="text-neutral-500 hover:text-red-500"><Trash2 size={18} /></button>
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
                        <button onClick={clearCart} disabled={cart.length === 0} className="w-full bg-neutral-700 text-white font-bold py-3 rounded-lg hover:bg-neutral-600 disabled:opacity-50">Batal</button>
                        <button onClick={onProcessPayment} disabled={cart.length === 0} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">Bayar</button>
                    </div>
                </div>
            </div>
            <PaymentSuccessModal
                show={showSuccess}
                onClose={() => {
                    setShowSuccess(false);
                    clearCart();
                }}
                change={lastChange}
            />
        </div>
    );
};

export default CashierPage;