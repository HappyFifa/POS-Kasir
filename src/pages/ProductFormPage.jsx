import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { ChevronLeft, UploadCloud, AlertCircle, X, Loader2 } from 'lucide-react';
import { validateForm, productValidationSchema, validateImageFile, sanitizeInput } from '../utils/validation';
import { PRODUCT_CATEGORIES } from '../utils/constants';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

const ProductFormPage = ({ product, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ name: '', price: '', category: PRODUCT_CATEGORIES[0] });
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const isEditing = !!product;

    useEffect(() => {
        if (isEditing) {
            setFormData({ 
                name: product.name, 
                price: product.price.toString(), 
                category: product.category 
            });
            setImagePreview(product.image);
            setImageUrl(product.image);
        } else {
            setFormData({ name: '', price: '', category: PRODUCT_CATEGORIES[0] });
            setImagePreview(null);
            setImageUrl(null);
        }
        setErrors({});
    }, [product, isEditing]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const sanitizedValue = sanitizeInput(value);
        
        setFormData(prev => ({
            ...prev,
            [name]: sanitizedValue
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate image file
        const validation = validateImageFile(file);
        if (!validation.isValid) {
            setErrors(prev => ({ ...prev, image: validation.error }));
            return;
        }

        // Clear image error
        setErrors(prev => ({ ...prev, image: null }));

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload to Cloudinary
        setIsUploading(true);
        try {
            const cloudinaryUrl = await uploadToCloudinary(file);
            
            setImageUrl(cloudinaryUrl);
            // Update preview to use Cloudinary URL instead of base64
            setImagePreview(cloudinaryUrl);
            setImageFile(file);
            
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            setErrors(prev => ({ 
                ...prev, 
                image: 'Gagal mengupload gambar. Silakan coba lagi.' 
            }));
            // Reset preview on upload failure
            setImagePreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageRemove = () => {
        setImagePreview(null);
        setImageFile(null);
        setImageUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate form
        const validation = validateForm(formData, productValidationSchema);
        
        if (!validation.isValid) {
            setErrors(validation.errors);
            setIsSubmitting(false);
            return;
        }

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                image: imageUrl || imagePreview || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300',
            };

            if (isEditing) {
                productData.id = product.id;
            }

            await onSave(productData);
        } catch (error) {
            console.error('Error saving product:', error);
            setErrors({ submit: 'Terjadi kesalahan saat menyimpan produk' });
        } finally {
            setIsSubmitting(false);
        }
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
                {/* Show submit error */}
                {errors.submit && (
                    <Card className="max-w-4xl mx-auto mb-4 p-4 bg-red-900/20 border-red-500">
                        <div className="flex items-center gap-2 text-red-400">
                            <AlertCircle size={20} />
                            <span>{errors.submit}</span>
                        </div>
                    </Card>
                )}

                <Card className="max-w-4xl mx-auto p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Gambar Produk
                            </label>
                            <div 
                                className={`aspect-square w-full bg-neutral-900/70 border-2 border-dashed rounded-xl flex flex-col justify-center items-center text-center cursor-pointer transition-colors ${
                                    errors.image 
                                        ? 'border-red-500 hover:border-red-400' 
                                        : 'border-neutral-600 hover:border-blue-500'
                                }`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleImageChange} 
                                    accept="image/jpeg,image/jpg,image/png,image/webp" 
                                    className="hidden" 
                                />
                                {imagePreview ? (
                                    <div className="relative w-full h-full">
                                        <img 
                                            src={imagePreview} 
                                            alt="Pratinjau" 
                                            className="w-full h-full object-cover rounded-xl" 
                                        />
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                                                <div className="text-white text-center">
                                                    <Loader2 size={32} className="mx-auto animate-spin mb-2" />
                                                    <p className="text-sm">Mengupload...</p>
                                                </div>
                                            </div>
                                        )}
                                        {imageUrl && !isUploading && (
                                            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                                                ✓ Uploaded
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleImageRemove();
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                            title="Hapus gambar"
                                            disabled={isUploading}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-neutral-500">
                                        {isUploading ? (
                                            <div className="text-center">
                                                <Loader2 size={48} className="mx-auto animate-spin" />
                                                <p className="mt-2 font-semibold">Mengupload gambar...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <UploadCloud size={48} className="mx-auto" />
                                                <p className="mt-2 font-semibold">Klik untuk mengunggah gambar</p>
                                                <p className="text-xs mt-1">PNG, JPG, WEBP (Maks. 5MB)</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors.image && (
                                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle size={16} />
                                    {errors.image}
                                </p>
                            )}
                        </div>
                        
                        <div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Nama Produk <span className="text-red-400">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 bg-neutral-800 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                        errors.name 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-neutral-700 focus:ring-blue-500'
                                    }`}
                                    placeholder="Masukkan nama produk"
                                />
                                {errors.name && (
                                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle size={16} />
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Harga <span className="text-red-400">*</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        name="price" 
                                        min="0"
                                        step="0.01"
                                        value={formData.price} 
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2.5 bg-neutral-800 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                            errors.price 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-neutral-700 focus:ring-blue-500'
                                        }`}
                                        placeholder="0"
                                    />
                                    {errors.price && (
                                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle size={16} />
                                            {errors.price}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Kategori <span className="text-red-400">*</span>
                                    </label>
                                    <select 
                                        name="category" 
                                        value={formData.category} 
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2.5 bg-neutral-800 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                            errors.category 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-neutral-700 focus:ring-blue-500'
                                        }`}
                                    >
                                        {PRODUCT_CATEGORIES.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && (
                                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle size={16} />
                                            {errors.category}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-4 mt-8">
                                <button 
                                    type="button" 
                                    onClick={onCancel} 
                                    disabled={isSubmitting}
                                    className="bg-neutral-700 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting || isUploading}
                                    className="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Menyimpan...
                                        </>
                                    ) : isUploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Mengupload...
                                        </>
                                    ) : (
                                        'Simpan'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default ProductFormPage;