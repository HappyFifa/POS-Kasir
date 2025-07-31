import React from 'react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getWeeklySales, getTodaySales, getTodayTransactions } from '../data/transactionData';

const DashboardPage = ({ navigateTo }) => {
    const salesData = getWeeklySales();
    const todaySales = getTodaySales();
    const todayTransactions = getTodayTransactions();
    
    return (
        <div className="p-8">
            <PageHeader title="Dashboard" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-neutral-300">Total Penjualan Hari Ini</h3>
                    <p className="text-4xl font-bold text-white mt-2">{formatCurrency(todaySales)}</p>
                </Card>
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-neutral-300">Transaksi Hari Ini</h3>
                    <p className="text-4xl font-bold text-white mt-2">{todayTransactions}</p>
                </Card>
                <Card className="p-6 flex flex-col justify-center items-center bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors" onClick={() => navigateTo('kasir')}>
                    <ShoppingCart size={40} className="text-white mb-2" />
                    <h3 className="text-2xl font-bold text-white">Mulai Transaksi Baru</h3>
                </Card>
            </div>
            <Card className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Grafik Penjualan Minggu Ini</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesData}>
                            <defs>
                                <linearGradient id="colorPenjualan" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" tickFormatter={(value) => formatCurrency(value)} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                                formatter={(value) => formatCurrency(value)}
                            />
                            <Area
                                type="monotone"
                                dataKey="Penjualan"
                                stroke="#2563eb"
                                fillOpacity={1}
                                fill="url(#colorPenjualan)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default DashboardPage;