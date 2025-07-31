import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { ChevronLeft, UploadCloud } from 'lucide-react';

const ProductFormPage = ({ product, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ name: '', price: '', category: 'Kopi' });
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const isEditing = !!product;

    useEffect(() => {
        if (isEditing) {
            setFormData({ name: product.name, price: product.price, category: product.category });
            setImagePreview(product.image);
        } else {
            setFormData({ name: '', price: '', category: 'Kopi' });
            setImagePreview(null);
        }
    }, [product]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            ...formData, 
            id: isEditing ? product.id : Date.now(),
            image: imagePreview
        });
    };

    return (
        <div className="p-8">
            <PageHeader title={isEditing ? 'Edit Produk' : 'Tambah Produk'}>
                <button onClick={onCancel} className="flex items-center gap-2 text-neutral-300 font-semibold py-2 px-4 rounded-lg hover:bg-neutral-800 transition-colors">
                    <ChevronLeft size={20} />
                    <span>Kembali</span>
                </button>
            </PageHeader>
            <form onSubmit={handleSubmit}>
                <Card className="max-w-4xl mx-auto p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Gambar Produk</label>
                            <div 
                                className="aspect-square w-full bg-neutral-900/70 border-2 border-dashed border-neutral-600 rounded-xl flex flex-col justify-center items-center text-center cursor-pointer hover:border-blue-500 transition-colors"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                {imagePreview ? (
                                    <div className="relative w-full h-full">
                                        <img src={imagePreview} alt="Pratinjau" className="w-full h-full object-cover rounded-xl" />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setImagePreview(null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 6L6 18M6 6l12 12"/>
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-neutral-500">
                                        <UploadCloud size={48} className="mx-auto" />
                                        <p className="mt-2 font-semibold">Klik untuk mengunggah gambar</p>
                                        <p className="text-xs mt-1">PNG, JPG, WEBP (Maks. 2MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Nama Produk</label>
                                <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Harga</label>
                                    <input 
                                        type="number" 
                                        name="price" 
                                        min="0"
                                        value={formData.price} 
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || parseFloat(value) >= 0) {
                                                setFormData({...formData, price: value});
                                            }
                                        }} 
                                        required 
                                        className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Kategori</label>
                                    <select name="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>Kopi</option>
                                        <option>Pastry</option>
                                        <option>Minuman</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-8">
                                <button type="button" onClick={onCancel} className="bg-neutral-700 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-neutral-600 transition-colors">Batal</button>
                                <button type="submit" className="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-blue-700 transition-colors">Simpan</button>
                            </div>
                        </div>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default ProductFormPage;