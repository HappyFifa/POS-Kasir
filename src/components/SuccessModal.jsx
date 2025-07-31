import React from 'react';
import Modal from './Modal';
import { CheckCircle2 } from 'lucide-react';

const SuccessModal = ({ message, onClose, show }) => (
  <Modal show={show} onClose={onClose}>
    <div className="text-center">
      <CheckCircle2 size={64} className="mx-auto text-green-500" />
      <h3 className="mt-4 text-2xl font-bold text-white">Berhasil</h3>
      <p className="mt-2 text-neutral-400">{message}</p>
      <button onClick={onClose} className="mt-6 w-full bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
        Tutup
      </button>
    </div>
  </Modal>
);

export default SuccessModal;