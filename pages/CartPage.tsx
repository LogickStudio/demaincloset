
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useCoupons } from '../hooks/useCoupons';
import { useProducts } from '../hooks/useProducts';
import { CartItem } from '../types';
import { BANK_DETAILS, WHATSAPP_NUMBER } from '../constants';
import ShoppingCartIcon from '../components/icons/ShoppingCartIcon'; 
import QuantitySelector from '../components/QuantitySelector';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartSubtotal, getCartTotal, getItemCount, applyCoupon, removeCoupon, appliedCoupon, discountAmount } = useCart();
  const { markCouponAsUsed } = useCoupons();
  const { user, isAuthenticated } = useAuth();
  const { products: allProducts, loading: productsLoading } = useProducts();
  
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState({ text: '', type: 'success' });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  
  const cartWithStock = useMemo(() => {
    if (productsLoading) return [];
    return cartItems.map(item => {
      const product = allProducts.find(p => p.id === item.productId);
      const variant = product?.variants.find(v => v.size === item.size);
      const stock = variant?.stock ?? 0;
      return { ...item, stock, isOverStocked: item.quantity > stock };
    });
  }, [cartItems, allProducts, productsLoading]);

  const isCartInvalid = useMemo(() => {
      return cartWithStock.some(item => item.isOverStocked);
  }, [cartWithStock]);


  useEffect(() => {
    if (isAuthenticated && user) {
      setCheckoutForm(prev => ({
        ...prev,
        name: user.name || '',
        address: user.address || '',
      }));
    }
  }, [isAuthenticated, user]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponMessage({ text: 'Please enter a coupon code.', type: 'error' });
      return;
    }
    try {
      const successMessage = await applyCoupon(couponInput);
      setCouponMessage({ text: successMessage, type: 'success' });
    } catch (error: any) {
      setCouponMessage({ text: error.message, type: 'error' });
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponMessage({ text: 'Coupon removed.', type: 'success' });
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCheckoutForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      setOrderMessage("Your cart is empty. Please add items before checking out.");
      return;
    }
    
    if (isCartInvalid) {
        alert("Some items in your cart exceed available stock. Please review your cart before proceeding.");
        return;
    }

    setIsSubmitting(true);

    const itemsBreakdown = cartItems
      .map(item => `- ${item.name} (${item.size}) x ${item.quantity} = ₦${(item.quantity * item.price).toLocaleString()}`)
      .join('\n');

    let orderSummary = `Hello Demain Closet, I'd like to place an order:\n\n`;
    orderSummary += `--- ORDER SUMMARY ---\n`;
    orderSummary += `${itemsBreakdown}\n`;
    orderSummary += `---------------------\n`;
    orderSummary += `Subtotal: ₦${getCartSubtotal().toLocaleString()}\n`;
    if (appliedCoupon) {
      orderSummary += `Coupon Applied (${appliedCoupon.code}): -₦${discountAmount.toLocaleString()}\n`;
    }
    orderSummary += `Total Amount: ₦${getCartTotal().toLocaleString()}\n\n`;
    orderSummary += `Total Items: ${getItemCount()}\n`;
    orderSummary += `--- CUSTOMER DETAILS ---\n`;
    orderSummary += `Name: ${checkoutForm.name}\n`;
    orderSummary += `Phone: ${checkoutForm.phone}\n`;
    orderSummary += `Email: ${user?.email || 'Not provided'}\n`;
    orderSummary += `Address: ${checkoutForm.address}\n\n`;
    orderSummary += `--- PAYMENT ---\n`;
    orderSummary += `Payment has been made. I will share the receipt in this chat for confirmation.\n\n`;
    orderSummary += `Bank Details Used for Transfer:\n`;
    orderSummary += `Account Name: ${BANK_DETAILS.accountName}\n`;
    orderSummary += `Account Number: ${BANK_DETAILS.accountNumber}\n`;
    orderSummary += `Bank: ${BANK_DETAILS.bankName}\n\n`;
    orderSummary += `Please confirm my order. Thank you!`;
    
    // Mark coupon as used if applicable
    if (appliedCoupon && user) {
        markCouponAsUsed(appliedCoupon.code, user.id);
    }
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderSummary)}`;
    
    setOrderMessage("Order prepared! Redirecting to WhatsApp to send your order summary. Please remember to also send your payment receipt in the chat.");
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setIsSubmitting(false);
      clearCart(); // Clear cart after submission
    }, 3000);
  };

  if (cartItems.length === 0 && !orderMessage) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart is Empty</h1>
        <ShoppingCartIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link 
          to="/products" 
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Shopping Cart</h1>
      
      {orderMessage && (
        <div className={`p-4 mb-6 rounded-lg text-center ${isSubmitting ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
          {orderMessage}
        </div>
      )}
      
       {isCartInvalid && (
        <div className="p-4 mb-6 rounded-lg bg-red-100 text-red-800 border border-red-300">
            <p className="font-bold">Attention needed!</p>
            <p className="text-sm">Some items in your cart exceed the available stock. Please adjust the quantities before you can proceed to checkout.</p>
        </div>
       )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          {cartWithStock.length > 0 ? (
            <>
              {cartWithStock.map((item: CartItem & { stock: number, isOverStocked: boolean }) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between py-4 border-b last:border-b-0">
                  <div className="flex items-center mb-4 sm:mb-0 flex-grow">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md mr-4" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">Size: {item.size}</p>
                      <p className="text-amber-600 font-medium">Unit Price: ₦{item.price.toLocaleString()}</p>
                      {item.isOverStocked && (
                        <p className="text-xs text-red-600 font-semibold mt-1">
                            Only {item.stock} left in stock.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0">
                    <QuantitySelector
                      quantity={item.quantity}
                      onQuantityChange={(newQuantity) => updateQuantity(item.id, newQuantity)}
                      max={item.stock}
                    />
                    <p className="text-lg font-semibold w-24 text-right">₦{(item.price * item.quantity).toLocaleString()}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                      aria-label={`Remove ${item.name} (${item.size}) from cart`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Coupon Section */}
               <div className="mt-6 border-t pt-4">
                <label htmlFor="coupon" className="font-semibold text-gray-700">Have a coupon?</label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <input
                    type="text"
                    id="coupon"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-grow border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    disabled={!!appliedCoupon}
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    className="bg-gray-800 hover:bg-black text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!appliedCoupon}
                  >
                    Apply
                  </button>
                </div>
                {couponMessage.text && (
                  <p className={`mt-2 text-sm ${couponMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Order Totals */}
              <div className="mt-6 text-right space-y-2">
                <p className="text-lg">Subtotal: <span className="font-semibold">₦{getCartSubtotal().toLocaleString()}</span></p>
                {appliedCoupon && (
                   <div className="text-green-600">
                     <p>Discount ({appliedCoupon.code}): <span className="font-semibold">-₦{discountAmount.toLocaleString()}</span>
                       <button onClick={handleRemoveCoupon} className="ml-2 text-xs text-red-500 hover:underline">[Remove]</button>
                     </p>
                   </div>
                )}
                <p className="text-2xl font-bold text-gray-800">Total: ₦{getCartTotal().toLocaleString()}</p>
                <div className="mt-4 flex justify-end">
                   <button 
                      onClick={clearCart} 
                      className="text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-md border border-red-500 hover:bg-red-50 transition"
                      disabled={cartItems.length === 0}
                    >
                      Clear Cart
                    </button>
                </div>
              </div>
            </>
          ) : (
             !orderMessage && <p className="text-gray-600">Your cart is currently empty.</p>
          )}
        </div>

        {/* Checkout Details Section */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          {isAuthenticated ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Checkout Steps</h2>
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" name="name" id="name" value={checkoutForm.name} onChange={handleInputChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="tel" name="phone" id="phone" value={checkoutForm.phone} onChange={handleInputChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Delivery Address</label>
                  <textarea name="address" id="address" value={checkoutForm.address} onChange={handleInputChange} rows={3} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"></textarea>
                </div>
                
                <div className="pt-4 bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Step 1: Make Payment</h3>
                  <p className="text-sm text-gray-600">Please transfer the total amount of <strong className='text-black'>₦{getCartTotal().toLocaleString()}</strong> to the account below.</p>
                  <p className="text-sm text-gray-600 mt-2"><strong>Account Name:</strong> {BANK_DETAILS.accountName}</p>
                  <p className="text-sm text-gray-600"><strong>Account Number:</strong> {BANK_DETAILS.accountNumber}</p>
                  <p className="text-sm text-gray-600"><strong>Bank:</strong> {BANK_DETAILS.bankName}</p>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-gray-600">After payment, click the button below. You will be redirected to WhatsApp to send your order and share your receipt.</p>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || cartItems.length === 0 || isCartInvalid}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  {isSubmitting ? 'Processing...' : `Step 2: Complete Order on WhatsApp`}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg flex flex-col justify-center h-full">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Complete Your Order</h2>
              <p className="text-gray-600 mb-6">Please log in or create an account to proceed with checkout.</p>
              <div className="flex flex-col space-y-3">
                <Link to="/login" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                  Log In
                </Link>
                <Link to="/signup" className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;