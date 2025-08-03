// Cloudinary upload utility for Netlify hosting
import { CONFIG } from './constants';

export const uploadToCloudinary = async (file) => {
  try {
    // Check if Cloudinary is configured
    if (!CONFIG.CLOUDINARY_CLOUD_NAME || !CONFIG.CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary belum dikonfigurasi. Hubungi administrator.');
    }

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP');
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Ukuran file maksimal 5MB');
    }

    // Create form data for Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CONFIG.CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'pos-kasir/products');
    
    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload gagal');
    }

    const result = await response.json();
    
    if (result?.secure_url) {
      return result.secure_url;
    }
    
    throw new Error('Failed to get secure URL from Cloudinary');
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error; // Throw error instead of returning error object
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    // Note: For security, deletion should be handled by your backend
    // This is just a placeholder - Cloudinary requires signed requests for deletion
    
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId })
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }

    return await response.json();
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Cloudinary URL transformations
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  const {
    width = 800,
    height = 600,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;
  
  // Insert transformations into Cloudinary URL
  const transformations = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;
  return url.replace('/upload/', `/upload/${transformations}/`);
};
