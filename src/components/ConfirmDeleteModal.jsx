import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDeleteModal = ({ show, onClose, onConfirm, productName }) => {
    return (
        <Modal show={show} onClose={onClose}>
            <div className="text-center">
                <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Konfirmasi Hapus</h3>
                <p className="text-neutral-400 mb-6">
                    Apakah Anda yakin ingin menghapus produk "{productName}"? 
                    Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-neutral-700 text-white font-semibold rounded-lg hover:bg-neutral-600 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Hapus
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDeleteModal;
