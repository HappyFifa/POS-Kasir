import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { ShoppingCart, TrendingUp, DollarSign, Users } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { transactionStorage, databaseInfo } from '../utils/databaseAdapter';

const DashboardPage = ({ navigateTo, products = [] }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTransactions = async () => {
            try {
                const allTransactions = await transactionStorage.getAll();
                setTransactions(allTransactions);
            } catch (error) {
                console.error('Error loading transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTransactions();
    }, []);

    // Calculate dashboard metrics
    const dashboardData = useMemo(() => {
        if (loading || transactions.length === 0) {
            return {
                todayTotal: 0,
                todayTransactions: 0,
                todayAverage: 0,
                weeklyData: [],
                topProducts: []
            };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        // Today's metrics
        const todayTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.timestamp);
            return transactionDate >= today && transactionDate <= todayEnd;
        });

        const todayTotal = todayTransactions.reduce((sum, t) => sum + t.total, 0);
        const todayAverage = todayTransactions.length > 0 ? todayTotal / todayTransactions.length : 0;

        // Weekly data for chart
        const weeklyData = [];
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const dateEnd = new Date(date);
            dateEnd.setHours(23, 59, 59, 999);

            const dayTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.timestamp);
                return transactionDate >= date && transactionDate <= dateEnd;
            });

            const dayTotal = dayTransactions.reduce((sum, t) => sum + t.total, 0);
            
            weeklyData.push({
                name: dayNames[date.getDay()],
                value: dayTotal,
                transactions: dayTransactions.length
            });
        }

        // Top products
        const productSales = {};
        transactions.forEach(transaction => {
            // Safety check: ensure transaction has items array
            const items = transaction.items || transaction.transaction_items || [];
            items.forEach(item => {
                if (productSales[item.name || item.product_name]) {
                    productSales[item.name || item.product_name] += item.quantity;
                } else {
                    productSales[item.name || item.product_name] = item.quantity;
                }
            });
        });

        const topProducts = Object.entries(productSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, quantity]) => ({ name, quantity }));

        return {
            todayTotal,
            todayTransactions: todayTransactions.length,
            todayAverage,
            weeklyData,
            topProducts
        };
    }, [transactions, loading]);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) {
        return (
            <div className="p-8">
                <PageHeader title="Dashboard" />
                <div className="flex justify-center items-center h-64">
                    <div className="text-neutral-400">Memuat data...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <PageHeader title="Dashboard" />
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-neutral-400">Penjualan Hari Ini</h3>
                            <p className="text-2xl font-bold text-white mt-2">
                                {formatCurrency(dashboardData.todayTotal)}
                            </p>
                        </div>
                        <div className="bg-blue-600/20 p-3 rounded-lg">
                            <DollarSign className="h-6 w-6 text-blue-400" />
                        </div>
                    </div>
                </Card>
                
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-neutral-400">Transaksi Hari Ini</h3>
                            <p className="text-2xl font-bold text-white mt-2">
                                {dashboardData.todayTransactions}
                            </p>
                        </div>
                        <div className="bg-green-600/20 p-3 rounded-lg">
                            <ShoppingCart className="h-6 w-6 text-green-400" />
                        </div>
                    </div>
                </Card>
                
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-neutral-400">Rata-rata per Transaksi</h3>
                            <p className="text-2xl font-bold text-white mt-2">
                                {formatCurrency(dashboardData.todayAverage)}
                            </p>
                        </div>
                        <div className="bg-yellow-600/20 p-3 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-yellow-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-neutral-400">Total Transaksi</h3>
                            <p className="text-2xl font-bold text-white mt-2">
                                {transactions.length}
                            </p>
                        </div>
                        <div className="bg-purple-600/20 p-3 rounded-lg">
                            <Users className="h-6 w-6 text-purple-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Weekly Sales Chart */}
                <Card className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Penjualan 7 Hari Terakhir</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={dashboardData.weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#a3a3a3" 
                                    fontSize={12}
                                />
                                <YAxis 
                                    stroke="#a3a3a3" 
                                    fontSize={12}
                                    tickFormatter={(value) => {
                                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
                                        if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
                                        return value.toString();
                                    }}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: '#262626',
                                        border: '1px solid #404040',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value) => [formatCurrency(value), 'Penjualan']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#3b82f6" 
                                    fill="url(#colorGradient)"
                                    strokeWidth={2}
                                />
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Products Chart */}
                <Card className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Produk Terlaris</h3>
                    {dashboardData.topProducts.length > 0 ? (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={dashboardData.topProducts}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, quantity }) => `${name}: ${quantity}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="quantity"
                                    >
                                        {dashboardData.topProducts.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: '#262626',
                                            border: '1px solid #404040',
                                            borderRadius: '8px'
                                        }}
                                        formatter={(value) => [`${value} terjual`, 'Jumlah']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-neutral-500">
                            <p>Belum ada data penjualan produk</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Aksi Cepat</h3>
                    <div className="space-y-3">
                        <button 
                            onClick={() => navigateTo('kasir')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                            Mulai Kasir
                        </button>
                        <button 
                            onClick={() => navigateTo('produk')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                            Kelola Produk
                        </button>
                        <button 
                            onClick={() => navigateTo('laporan')}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                            Lihat Laporan
                        </button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Ringkasan Minggu Ini</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-neutral-400">Total Penjualan:</span>
                            <span className="text-white">
                                {formatCurrency(dashboardData.weeklyData.reduce((sum, day) => sum + day.value, 0))}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-400">Total Transaksi:</span>
                            <span className="text-white">
                                {dashboardData.weeklyData.reduce((sum, day) => sum + day.transactions, 0)}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* System Information */}
            <Card className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Informasi Sistem</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-neutral-800 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-neutral-400 mb-1">Total Produk</h4>
                        <p className="text-lg font-semibold text-white">{products.length}</p>
                    </div>
                    <div className="bg-neutral-800 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-neutral-400 mb-1">Database</h4>
                        <p className="text-lg font-semibold text-white">{databaseInfo.type}</p>
                    </div>
                    <div className="bg-neutral-800 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-neutral-400 mb-1">Status</h4>
                        <p className="text-lg font-semibold text-green-400">
                            {databaseInfo.isOnline ? 'Online' : 'Offline'}
                        </p>
                    </div>
                    <div className="bg-neutral-800 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-neutral-400 mb-1">Real-time</h4>
                        <p className="text-lg font-semibold text-white">
                            {databaseInfo.supportsRealtime ? 'Aktif' : 'Tidak Aktif'}
                        </p>
                    </div>
                </div>
            </Card>

            {transactions.length === 0 && (
                <Card className="p-8 mt-8 text-center">
                    <div className="text-neutral-500">
                        <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">Belum Ada Transaksi</h3>
                        <p className="mb-4">Mulai berjualan untuk melihat data dashboard</p>
                        <button 
                            onClick={() => navigateTo('kasir')}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
                        >
                            Mulai Kasir Sekarang
                        </button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default DashboardPage;