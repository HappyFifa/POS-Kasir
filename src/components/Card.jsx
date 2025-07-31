import React from 'react';

// Perbaikan: Menambahkan {...props} agar bisa menerima onClick dan properti lainnya
const Card = ({ children, className = '', ...props }) => (
    <div className={`bg-neutral-800/50 border border-neutral-700/80 rounded-xl shadow-lg backdrop-blur-sm ${className}`} {...props}>
        {children}
    </div>
);

export default Card;
