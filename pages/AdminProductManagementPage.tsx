import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types';
import ProductForm from '../components/ProductForm';
import { Link } from 'react-router-dom';

const AdminProductManagementPage: React.FC = () => {
  const { products, deleteProduct, loading } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const handleAddNew = () => {
    setProductToEdit(null);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await deleteProduct(productId);
      } catch (error: any) {
        alert("Error deleting product: " + error.message);
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setProductToEdit(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
        <div className="flex items-center space-x-4">
          <Link to="/admin/dashboard" className="text-sm text-amber-600 hover:text-amber-800">&larr; Back to Dashboard</Link>
          <button
            onClick={handleAddNew}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            + Add New Product
          </button>
        </div>
      </div>

      {showForm ? (
        <ProductForm productToEdit={productToEdit} onFormClose={handleFormClose} />
      ) : (
        loading ? (
            <div className="text-center p-8">Loading products...</div>
        ) : (
            <div className="bg-white p-6 rounded-lg shadow-xl overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
                <thead>
                <tr className="bg-gray-100 border-b">
                    <th className="p-4 font-semibold text-gray-600">Product Name</th>
                    <th className="p-4 font-semibold text-gray-600">Category</th>
                    <th className="p-4 font-semibold text-gray-600">Variants</th>
                    <th className="p-4 font-semibold text-gray-600">Actions</th>
                </tr>
                </thead>
                <tbody>
                {products.map(product => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-800 font-medium">{product.name}</td>
                    <td className="p-4 text-gray-600">{product.category}</td>
                    <td className="p-4 text-gray-600">{product.variants.length}</td>
                    <td className="p-4">
                        <div className="flex space-x-2">
                        <button onClick={() => handleEdit(product)} className="text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md transition-colors">Edit</button>
                        <button onClick={() => handleDelete(product.id)} className="text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md transition-colors">Delete</button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )
      )}
    </div>
  );
};

export default AdminProductManagementPage;