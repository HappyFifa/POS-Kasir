import React, { useState } from 'react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '../data/productData';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const ProductManagementPage = ({ products, onEditClick, onDeleteProduct }) => {
    const [productToDelete, setProductToDelete] = useState(null);
    
    const handleDelete = () => {
        onDeleteProduct(productToDelete.id);
        setProductToDelete(null);
    };

    return (
        <div className="p-8">
            <PageHeader title="Manajemen Produk">
                <button onClick={() => onEditClick(null)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-blue-700 transition-colors">
                    <PlusCircle size={20} />
                    <span>Tambah Produk</span>
                </button>
            </PageHeader>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-neutral-700">
                            <tr>
                                <th className="p-4 font-semibold text-neutral-300">Produk</th>
                                <th className="p-4 font-semibold text-neutral-300">Kategori</th>
                                <th className="p-4 font-semibold text-neutral-300">Harga</th>
                                <th className="p-4 font-semibold text-neutral-300 text-right">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className="border-b border-neutral-800 hover:bg-neutral-800/60">
                                    <td className="p-4 flex items-center gap-4">
                                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-md object-cover"/>
                                        <span className="font-semibold text-white">{product.name}</span>
                                    </td>
                                    <td className="p-4 text-neutral-400">{product.category}</td>
                                    <td className="p-4 text-neutral-400">{formatCurrency(product.price)}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => onEditClick(product)} className="text-neutral-400 hover:text-blue-400 transition-colors">
                                                <Edit size={20} />
                                            </button>
                                            <button 
                                                onClick={() => setProductToDelete(product)} 
                                                className="text-neutral-400 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <ConfirmDeleteModal
                show={!!productToDelete}
                onClose={() => setProductToDelete(null)}
                onConfirm={handleDelete}
                productName={productToDelete?.name}
            />
        </div>
    );
};

export default ProductManagementPage;