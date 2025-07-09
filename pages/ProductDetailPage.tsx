import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import NotFoundPage from './NotFoundPage';
import { Product, ProductVariant, Review } from '../types';
import StarRating from '../components/StarRating';
import ReviewItem from '../components/ReviewItem';
import ReviewForm from '../components/ReviewForm';
import QuantitySelector from '../components/QuantitySelector';
import { supabase } from '../utils/supabaseClient';

const ProductDetailPage: React.FC = () => {
  const { id: productId } = useParams<{ id: string }>();
  const { addToCart, cartItems } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { getProductById, loading: productsLoading, getReviewsForProduct } = useProducts();

  const [product, setProduct] = useState<Product | undefined>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [maxQuantity, setMaxQuantity] = useState(99);
  const [stockMessage, setStockMessage] = useState('');

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const currentProductData = getProductById(productId);
      
      if (currentProductData) {
        setProduct(currentProductData);
        if (currentProductData.images && currentProductData.images.length > 0) {
          setSelectedImage(currentProductData.images[0]);
        }
        if (currentProductData.variants.length === 1) {
            setSelectedVariant(currentProductData.variants[0]);
        }
        const productReviews = await getReviewsForProduct(productId);
        setReviews(productReviews);
      }
      setLoading(false);
    };

    if (!productsLoading) {
      fetchProductAndReviews();
    }
  }, [productId, productsLoading, getProductById, getReviewsForProduct]);

  useEffect(() => {
    if (selectedVariant && product) {
      const cartItemId = `${product.id}_${selectedVariant.size}`;
      const itemInCart = cartItems.find(item => item.id === cartItemId);
      const quantityInCart = itemInCart ? itemInCart.quantity : 0;
      
      const availableForPurchase = selectedVariant.stock - quantityInCart;
      
      setMaxQuantity(availableForPurchase);
      
      if (selectedVariant.stock <= 0) {
        setStockMessage("Out of Stock");
      } else if (availableForPurchase <= 0) {
        setStockMessage(`All available units are in your cart.`);
      } else if (selectedVariant.stock <= 5) {
        setStockMessage(`Only ${selectedVariant.stock} left in stock!`);
      } else {
        setStockMessage("In Stock");
      }
      
      if (quantity > availableForPurchase) {
        setQuantity(Math.max(1, availableForPurchase));
      }
      
    } else {
      setStockMessage('');
      setMaxQuantity(99); // Reset to a high number when no variant is selected
    }
}, [selectedVariant, product, cartItems, quantity]);


  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);
  
  if (loading || productsLoading) {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
    );
  }

  if (!product) {
    return <NotFoundPage message="Product not found." />;
  }

  const handleVariantChange = (variant: ProductVariant) => {
    if (selectedVariant && selectedVariant.size === variant.size) {
        setSelectedVariant(undefined);
    } else {
        setSelectedVariant(variant);
        setQuantity(1);
    }
  };

  const handleAddToCart = () => {
    if (selectedVariant && product) {
      addToCart(product, selectedVariant, quantity);
    }
  };

  const handleReviewSubmit = async (reviewData: { rating: number; comment: string }) => {
    if (!user || !product) return;

    const { error } = await supabase.from('reviews').insert([{
        product_id: product.id,
        user_id: user.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
    }]);

    if (error) {
        alert("Error submitting review: " + error.message);
    } else {
        const productReviews = await getReviewsForProduct(product.id);
        setReviews(productReviews);
        setShowReviewForm(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 md:p-10 rounded-lg shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Product Image Gallery */}
          <div>
            <div className="mb-4">
              <img 
                src={selectedImage}
                alt={product.name} 
                className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-md"
                onError={(e) => (e.currentTarget.src = `https://via.placeholder.com/600x500/E0E0E0/BDBDBD?text=Product+Image`)}
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button 
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${selectedImage === img ? 'border-amber-500' : 'border-transparent hover:border-gray-300'}`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <span className="inline-block bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full uppercase font-semibold tracking-wide mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{product.name}</h1>
            
            {/* Average Rating Display */}
            {reviews && reviews.length > 0 && (
              <div className="flex items-center mb-4">
                <StarRating rating={averageRating} size="h-5 w-5" />
                <span className="ml-2 text-gray-600 text-sm">
                  ({averageRating.toFixed(1)}) - {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
             {(!reviews || reviews.length === 0) && (
                <p className="text-sm text-gray-500 mb-4">No reviews yet.</p>
            )}

            {/* Variant Selection */}
            {product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Select Size:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.size}
                      onClick={() => handleVariantChange(variant)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors
                        ${selectedVariant?.size === variant.size 
                          ? 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-300' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                      aria-pressed={selectedVariant?.size === variant.size}
                      disabled={variant.stock === 0 && selectedVariant?.size !== variant.size}
                    >
                      {variant.size} {variant.stock === 0 ? '(Out of Stock)' : `- ₦${variant.price.toLocaleString()}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mb-6">
              {selectedVariant ? (
                <p className="text-3xl font-extrabold text-amber-600">
                  ₦{(selectedVariant.price * quantity).toLocaleString()}
                </p>
              ) : (
                <p className="text-2xl font-semibold text-gray-500">
                  Select an option to see price
                </p>
              )}
            </div>

            {selectedVariant && stockMessage && (
              <p className={`text-sm mb-4 font-semibold ${selectedVariant.stock <= 0 || maxQuantity <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stockMessage}
              </p>
            )}
            
             <div className="mb-6">
              <label htmlFor="quantity" className="text-lg font-semibold text-gray-700 mb-2 block">Quantity:</label>
              <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} max={maxQuantity > 0 ? maxQuantity : 0} />
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || maxQuantity <= 0}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {selectedVariant && maxQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">{product.description}</p>

              {product.ingredients && product.ingredients.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">Materials:</h3>
                  <p className="text-gray-600">{product.ingredients.join(', ')}</p>
                </div>
              )}

              {product.storage_instructions && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">Care Instructions:</h3>
                  <p className="text-gray-600">{product.storage_instructions}</p>
                </div>
              )}
            </div>
            
            <Link to="/products" className="block mt-6 text-amber-600 hover:text-amber-500 font-medium">
              &larr; Back to Products
            </Link>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
          {isAuthenticated && !showReviewForm && (
            <div className="mb-6">
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
              >
                Write a Review
              </button>
            </div>
          )}
          {showReviewForm && (
            <div className="mb-8">
              <ReviewForm 
                productId={product.id} 
                onSubmitReview={handleReviewSubmit} 
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}
          {!isAuthenticated && (
             <p className="text-sm text-gray-600 p-4 bg-gray-100 rounded-md mb-6">
                Please <Link to="/login" className="text-amber-600 hover:underline font-medium">log in</Link> to write a review.
            </p>
          )}

          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(review => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">{isAuthenticated ? 'Be the first to review this product!' : 'No reviews available yet.'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;