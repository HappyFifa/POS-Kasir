import React from 'react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { salesData } from '../data/mockData';

const ReportsPage = () => (
    <div className="p-8">
        <PageHeader title="Laporan Penjualan" />
        <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Penjualan Minggu Ini</h3>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <BarChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                        <XAxis dataKey="name" stroke="#a3a3a3" />
                        <YAxis stroke="#a3a3a3" tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value)} />
                        <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040' }} cursor={{fill: 'rgba(63, 131, 248, 0.1)'}}/>
                        <Legend />
                        <Bar dataKey="Penjualan" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    </div>
);

export default ReportsPage;
