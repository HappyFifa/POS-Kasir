import React, { useMemo, useEffect, useState } from 'react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { transactionStorage } from '../utils/databaseAdapter';
import { formatCurrency } from '../utils/formatCurrency';

const ReportsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load transactions from database
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

    // Get real transaction data and create weekly sales chart
    const weeklyData = useMemo(() => {
        // If still loading, return empty data
        if (loading) {
            const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
            return days.map(day => ({ name: day, Penjualan: 0 }));
        }
        
        // If no transactions, generate default empty data
        if (transactions.length === 0) {
            const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
            return days.map(day => ({ name: day, Penjualan: 0 }));
        }

        // Group transactions by day of week
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dayShortNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const salesByDay = new Array(7).fill(0);

        // Get transactions from the last 7 days
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

        transactions
            .filter(transaction => new Date(transaction.timestamp) >= sevenDaysAgo)
            .forEach(transaction => {
                const date = new Date(transaction.timestamp);
                const dayIndex = date.getDay();
                salesByDay[dayIndex] += transaction.total;
            });

        return dayShortNames.map((day, index) => ({
            name: day,
            Penjualan: salesByDay[index]
        }));
    }, [transactions, loading]);

    const todayTransactions = useMemo(() => {
        if (loading) return [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.timestamp);
            return transactionDate >= today && transactionDate <= todayEnd;
        });
    }, [transactions, loading]);

    // Custom formatter for currency
    const formatYAxisTick = (value) => {
        if (value === 0) return '0';
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}jt`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}rb`;
        }
        return value.toString();
    };

    // Custom tooltip formatter
    const customTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-neutral-800 border border-neutral-600 rounded-lg p-3 shadow-lg">
                    <p className="text-white font-semibold">{`${label}`}</p>
                    <p className="text-blue-400">
                        {`Penjualan: ${formatCurrency(payload[0].value)}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="p-8">
                <PageHeader title="Laporan Penjualan" />
                <div className="flex justify-center items-center h-64">
                    <div className="text-neutral-400">Memuat data laporan...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <PageHeader title="Laporan Penjualan" />
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-neutral-300 mb-2">Total Penjualan Hari Ini</h3>
                    <p className="text-3xl font-bold text-white">
                        {formatCurrency(todayTransactions.reduce((sum, t) => sum + t.total, 0))}
                    </p>
                </Card>
                
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-neutral-300 mb-2">Transaksi Hari Ini</h3>
                    <p className="text-3xl font-bold text-white">
                        {todayTransactions.length}
                    </p>
                </Card>
                
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-neutral-300 mb-2">Rata-rata per Transaksi</h3>
                    <p className="text-3xl font-bold text-white">
                        {(() => {
                            const total = todayTransactions.reduce((sum, t) => sum + t.total, 0);
                            const average = todayTransactions.length > 0 ? total / todayTransactions.length : 0;
                            return formatCurrency(average);
                        })()}
                    </p>
                </Card>
            </div>

            <Card className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Penjualan Minggu Ini</h3>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#a3a3a3" 
                                fontSize={12}
                            />
                            <YAxis 
                                stroke="#a3a3a3" 
                                tickFormatter={formatYAxisTick}
                                fontSize={12}
                                width={60}
                            />
                            <Tooltip 
                                content={customTooltip}
                                cursor={{fill: 'rgba(59, 130, 246, 0.1)'}}
                            />
                            <Legend />
                            <Bar 
                                dataKey="Penjualan" 
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                                name="Penjualan (Rp)"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                {weeklyData.every(day => day.Penjualan === 0) && (
                    <div className="text-center text-neutral-500 mt-4">
                        <p>Belum ada data penjualan. Lakukan transaksi untuk melihat laporan.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ReportsPage;
