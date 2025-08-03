import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { formatCurrency } from '../utils/formatCurrency';

const PaymentModal = ({ show, onClose, onConfirm, total }) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [error, setError] = useState('');
  const change = amountPaid ? parseFloat(amountPaid) - total : 0;

  // Reset state saat modal ditutup atau dibuka
  useEffect(() => {
    if (show) {
      setAmountPaid('');
      setError('');
    }
  }, [show]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || parseFloat(value) >= 0) {
      setAmountPaid(value);
      if (error) setError('');
    }
  };

  const handleConfirm = () => {
    if (!amountPaid || parseFloat(amountPaid) < total) {
      setError('Uang yang dibayarkan kurang atau belum diisi!');
      return;
    }
    onConfirm({
      amountPaid: parseFloat(amountPaid),
      change: change
    });
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="text-left">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Pembayaran Tunai</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-300 mb-2">Total Belanja</label>
          <input
            type="text"
            readOnly
            value={formatCurrency(total)}
            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-lg font-bold"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-300 mb-2">Uang Diterima</label>
          <input
            type="number"
            value={amountPaid}
            onChange={handleAmountChange}
            placeholder="Masukkan jumlah uang"
            className={`w-full px-4 py-2.5 bg-neutral-800 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${error ? 'border-red-500 ring-red-500' : 'border-neutral-700 focus:ring-blue-500'}`}
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-300 mb-2">Kembalian</label>
          <p className="text-2xl font-bold text-green-400">{change >= 0 ? formatCurrency(change) : formatCurrency(0)}</p>
        </div>
        <button
          onClick={handleConfirm}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Konfirmasi Pembayaran
        </button>
      </div>
    </Modal>
  );
};

export default PaymentModal;