// Data transaksi
export const transactions = [];

// Fungsi untuk menambah transaksi baru
export const addTransaction = (transaction) => {
    transactions.push({
        ...transaction,
        id: Date.now(),
        date: new Date().toISOString()
    });
};

// Fungsi untuk mendapatkan total penjualan per hari dalam seminggu terakhir
export const getWeeklySales = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const dailySales = transactions
        .filter(t => new Date(t.date) >= oneWeekAgo)
        .reduce((acc, t) => {
            const date = new Date(t.date);
            const day = date.toLocaleDateString('id-ID', { weekday: 'short' });
            acc[day] = (acc[day] || 0) + t.total;
            return acc;
        }, {});

    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return days.map(day => ({
        name: day,
        Penjualan: dailySales[day] || 0
    }));
};

// Fungsi untuk mendapatkan total penjualan hari ini
export const getTodaySales = () => {
    const today = new Date().toDateString();
    return transactions
        .filter(t => new Date(t.date).toDateString() === today)
        .reduce((total, t) => total + t.total, 0);
};

// Fungsi untuk mendapatkan jumlah transaksi hari ini
export const getTodayTransactions = () => {
    const today = new Date().toDateString();
    return transactions
        .filter(t => new Date(t.date).toDateString() === today)
        .length;
};
