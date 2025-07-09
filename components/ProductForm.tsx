
import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { Product, ProductVariant } from '../types';
import { CATEGORIES } from '../constants'; // For category dropdown
import { supabase, areSupabaseCredentialsSet } from '../utils/supabaseClient';
import imageCompression from 'browser-image-compression';

interface ProductFormProps {
  productToEdit: Product | null;
  onFormClose: () => void;
}

const emptyVariant: ProductVariant = { size: '', price: 0, stock: 0 };
const initialFormData = {
  name: '',
  category: CATEGORIES[0]?.name || '',
  images: [] as string[],
  description: '',
  variants: [emptyVariant],
  ingredients: '', // Will be a string in the form, converted to array on submit
  storage_instructions: '',
};

const ProductForm: React.FC<ProductFormProps> = ({ productToEdit, onFormClose }) => {
  const { addProduct, updateProduct } = useProducts();
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const isSupabaseConfigured = areSupabaseCredentialsSet;

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        category: productToEdit.category,
        images: productToEdit.images || [],
        description: productToEdit.description,
        variants: productToEdit.variants.length > 0 ? productToEdit.variants : [emptyVariant],
        ingredients: productToEdit.ingredients?.join(', ') || '',
        storage_instructions: productToEdit.storage_instructions || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [productToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // --- Image Handling Logic ---

  const processAndUploadFiles = async (files: FileList) => {
    if (!isSupabaseConfigured) {
      alert("Image file upload is not configured. Please set up Supabase environment variables. You can still add images by URL.");
      return;
    }
    if (files.length === 0) return;
    setIsUploading(true);

    const compressionOptions = {
      maxSizeMB: 0.5, // Target size 500KB
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };

    const uploadPromises = Array.from(files).map(async (file) => {
      if (!file.type.startsWith('image/')) {
        console.warn(`Skipping non-image file: ${file.name}`);
        return null;
      }
      try {
        const compressedFile = await imageCompression(file, compressionOptions);
        const filePath = `public/${Date.now()}-${compressedFile.name.replace(/\s/g, '_')}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, compressedFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        
        return data.publicUrl;
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        alert(`Failed to upload ${file.name}. Please check the console for details and ensure your Supabase configuration is correct.`);
        return null;
      }
    });

    try {
      const uploadedUrls = (await Promise.all(uploadPromises)).filter((url): url is string => url !== null);
      if (uploadedUrls.length > 0) {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      }
    } finally {
      setIsUploading(false);
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processAndUploadFiles(e.target.files);
    }
  };

  const handleDragEvents = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    handleDragEvents(e);
    if(e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    handleDragEvents(e);
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAndUploadFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };
  
  const handleAddImageUrl = () => {
    if (imageUrl.trim() !== '' && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      try {
        new URL(imageUrl); // Basic URL validation
        setFormData(prev => ({ ...prev, images: [...prev.images, imageUrl] }));
        setImageUrl('');
      } catch (e) {
        alert('Please enter a valid image URL.');
      }
    } else {
      alert('Please enter a valid image URL starting with http:// or https://');
    }
  };
  
  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, index) => index !== indexToRemove) }));
  };
  
  // --- Variant Handling Logic ---
  
  const handleVariantChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedVariants = [...formData.variants];
    let processedValue: string | number = value;

    if (name === 'price') {
      processedValue = parseFloat(value) || 0;
    } else if (name === 'stock') {
      processedValue = parseInt(value, 10);
      if (isNaN(processedValue) || processedValue < 0) {
        processedValue = 0;
      }
    }
    
    updatedVariants[index] = { ...updatedVariants[index], [name]: processedValue as any };
    setFormData(prev => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = () => {
    setFormData(prev => ({ ...prev, variants: [...prev.variants, { ...emptyVariant }] }));
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      const updatedVariants = formData.variants.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, variants: updatedVariants }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      alert("Please wait for images to finish uploading.");
      return;
    }
    if(formData.images.length === 0) {
        alert("Please add at least one image for the product.");
        return;
    }
    setIsSubmitting(true);

    const productData = {
      name: formData.name,
      category: formData.category,
      images: formData.images,
      description: formData.description,
      variants: formData.variants.filter(v => v.size.trim() !== '' && v.price >= 0 && v.stock >= 0),
      ingredients: formData.ingredients.split(',').map(s => s.trim()).filter(Boolean),
      storage_instructions: formData.storage_instructions,
    };
    
    try {
        if (productToEdit) {
            await updateProduct({ ...productData, id: productToEdit.id, reviews: productToEdit.reviews || [] });
        } else {
            await addProduct(productData);
        }
        onFormClose();
    } catch (error: any) {
        alert("Error saving product: " + error.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{productToEdit ? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select name="category" id="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition">
              {CATEGORIES.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>
        </div>

        {/* New Image Upload Section */}
        <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-medium text-gray-800 px-2">Product Images</legend>
            
            {/* Image Previews */}
            {formData.images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-4">
                    {formData.images.map((image, index) => (
                    <div key={index} className="relative group aspect-square">
                        <img 
                            src={image} 
                            alt={`Product preview ${index + 1}`} 
                            className="w-full h-full object-cover rounded-md shadow-sm"
                            onError={(e) => { 
                                const target = e.target as HTMLImageElement;
                                target.src = `https://via.placeholder.com/150/FFCDD2/D32F2F?text=Invalid+URL`;
                                target.onerror = null;
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 text-xs flex items-center justify-center h-5 w-5 transform -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                            aria-label="Remove image"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    ))}
                </div>
            )}
            
            {/* Drop Zone */}
            <div 
                onDragEnter={isSupabaseConfigured ? handleDragEnter : handleDragEvents}
                onDragLeave={isSupabaseConfigured ? handleDragLeave : handleDragEvents}
                onDragOver={handleDragEvents}
                onDrop={isSupabaseConfigured ? handleDrop : handleDragEvents}
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    !isSupabaseConfigured ? 'bg-gray-100' :
                    isDragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-400'}`}
            >
                <input
                type="file"
                id="file-upload"
                multiple
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading || !isSupabaseConfigured}
                />
                <label htmlFor="file-upload" className={`${!isSupabaseConfigured ? 'cursor-not-allowed' : 'cursor-pointer'} text-center`}>
                    {isSupabaseConfigured ? (
                        <>
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <span className="font-medium text-amber-600 hover:text-amber-500">Click to upload</span>
                            <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, or JPEG files</p>
                        </>
                    ) : (
                         <>
                            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                            <span className="font-medium text-red-600">File Upload Disabled</span>
                            <p className="text-sm text-gray-500 mt-1">Supabase is not configured.</p>
                            <p className="text-xs text-gray-500 mt-1">You can still add images by URL.</p>
                        </>
                    )}
                </label>
                 {isUploading && (
                  <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
                      <svg className="animate-spin h-8 w-8 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="mt-2 text-sm text-gray-700 font-semibold">Resizing & Uploading...</p>
                      <p className="text-xs text-gray-500">Please wait.</p>
                  </div>
              )}
            </div>
            
            {/* Add by URL */}
            <div className="mt-4 flex items-center gap-2">
                <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(); } }}
                placeholder="Or paste an image URL here"
                className="flex-grow border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                />
                <button type="button" onClick={handleAddImageUrl} className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 shrink-0">Add URL</button>
            </div>
        </fieldset>


        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"></textarea>
        </div>
        
        {/* Variants */}
        <fieldset className="border p-4 rounded-md">
          <legend className="text-lg font-medium text-gray-800 px-2">Variants</legend>
          <div className="space-y-4">
            {formData.variants.map((variant, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label htmlFor={`size-${index}`} className="block text-sm font-medium text-gray-700">Size</label>
                  <input type="text" name="size" id={`size-${index}`} value={variant.size} placeholder="e.g., S, M, 38" onChange={(e) => handleVariantChange(index, e)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
                </div>
                <div>
                  <label htmlFor={`price-${index}`} className="block text-sm font-medium text-gray-700">Price (₦)</label>
                  <input type="number" name="price" id={`price-${index}`} value={variant.price} onChange={(e) => handleVariantChange(index, e)} required min="0" step="any" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
                </div>
                <div>
                  <label htmlFor={`stock-${index}`} className="block text-sm font-medium text-gray-700">Stock</label>
                  <input type="number" name="stock" id={`stock-${index}`} value={variant.stock} onChange={(e) => handleVariantChange(index, e)} required min="0" step="1" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
                </div>
                <button type="button" onClick={() => removeVariant(index)} className="bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600 disabled:opacity-50" disabled={formData.variants.length <= 1}>Remove</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addVariant} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600">+ Add Variant</button>
        </fieldset>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">Materials (comma-separated)</label>
            <input type="text" name="ingredients" id="ingredients" value={formData.ingredients} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
          </div>
          <div>
            <label htmlFor="storage_instructions" className="block text-sm font-medium text-gray-700">Care Instructions</label>
            <input type="text" name="storage_instructions" id="storage_instructions" value={formData.storage_instructions} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button type="button" onClick={onFormClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting || isUploading} className="bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors">
            {isUploading ? 'Uploading...' : isSubmitting ? 'Saving...' : (productToEdit ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;