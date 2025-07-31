import React from 'react';
import { LayoutDashboard, Coffee, ShoppingCart, BarChart2 } from 'lucide-react';

const Sidebar = ({ navigateTo, currentPage }) => {
    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
        { name: 'Produk', icon: Coffee, page: 'produk' },
        { name: 'Kasir', icon: ShoppingCart, page: 'kasir' },
        { name: 'Laporan', icon: BarChart2, page: 'laporan' },
    ];

    return (
        <nav className="w-64 bg-neutral-900/80 backdrop-blur-xl p-4 flex flex-col border-r border-neutral-800">
            <div className="text-3xl font-bold text-white p-3 text-center mb-8">POS Pro</div>
            <ul className="flex flex-col gap-2">
                {menuItems.map((item) => (
                    <li key={item.name}>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigateTo(item.page); }}
                           className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-lg ${
                               currentPage === item.page
                               ? 'bg-blue-600 text-white shadow-lg'
                               : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                           }`}
                        >
                            <item.icon size={24} />
                            <span>{item.name}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Sidebar;