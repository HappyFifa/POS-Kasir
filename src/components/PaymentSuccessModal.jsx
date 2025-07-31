import React from 'react';
import Modal from './Modal';
import { formatCurrency } from '../utils/formatCurrency';

const PaymentSuccessModal = ({ show, onClose, change }) => {
  return (
    <Modal show={show} onClose={onClose}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Pembayaran Berhasil</h3>
        <p className="text-neutral-400 mb-4">Transaksi telah selesai</p>
        <div className="bg-neutral-800/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-neutral-400 mb-1">Kembalian</p>
          <p className="text-3xl font-bold text-green-500">{formatCurrency(change)}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-neutral-700 text-white font-semibold py-3 rounded-lg hover:bg-neutral-600 transition-colors"
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
};

export default PaymentSuccessModal;
