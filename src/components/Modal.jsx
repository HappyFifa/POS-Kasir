import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ children, onClose, show }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-6 relative w-full max-w-md m-4">
                <button onClick={onClose} className="absolute top-3 right-3 text-neutral-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
