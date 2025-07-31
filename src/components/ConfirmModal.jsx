import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ onConfirm, onCancel, show }) => (
  <Modal show={show} onClose={onCancel}>
    <div className="text-center">
      <AlertTriangle size={64} className="mx-auto text-red-500" />
      <h3 className="mt-4 text-2xl font-bold text-white">Anda Yakin?</h3>
      <p className="mt-2 text-neutral-400">Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen.</p>
      <div className="mt-6 flex justify-center gap-4">
        <button onClick={onCancel} className="bg-neutral-700 text-white font-semibold py-2.5 px-8 rounded-lg hover:bg-neutral-600 transition-colors">
          Batal
        </button>
        <button onClick={onConfirm} className="bg-red-600 text-white font-semibold py-2.5 px-8 rounded-lg hover:bg-red-700 transition-colors">
          Hapus
        </button>
      </div>
    </div>
  </Modal>
);

export default ConfirmModal;