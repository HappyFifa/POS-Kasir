import React from 'react';
import { LayoutDashboard, Coffee, ShoppingCart, BarChart2, LogOut, User } from 'lucide-react';
import { CONFIG } from '../utils/constants';

const Sidebar = ({ navigateTo, currentPage, currentUser, onLogout }) => {
    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
        { name: 'Produk', icon: Coffee, page: 'produk' },
        { name: 'Kasir', icon: ShoppingCart, page: 'kasir' },
        { name: 'Laporan', icon: BarChart2, page: 'laporan' },
    ];

    return (
        <nav className="w-64 bg-neutral-900/80 backdrop-blur-xl p-4 flex flex-col border-r border-neutral-800">
            <div className="text-3xl font-bold text-white p-3 text-center mb-8">{CONFIG.APP_NAME}</div>
            
            {/* User Info */}
            {currentUser && (
                <div className="mb-6 p-3 bg-neutral-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <User size={16} />
                        </div>
                        <div>
                            <p className="text-white font-medium">{currentUser.username}</p>
                            <p className="text-neutral-400 text-sm capitalize">{currentUser.role}</p>
                        </div>
                    </div>
                </div>
            )}

            <ul className="flex flex-col gap-2 flex-1">
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

            {/* Logout Button */}
            <div className="mt-auto pt-4 border-t border-neutral-800">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-red-600/20 hover:text-red-400 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Keluar</span>
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;