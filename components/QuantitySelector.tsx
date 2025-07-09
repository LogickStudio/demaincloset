
import React from 'react';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  min?: number;
  max?: number;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, onQuantityChange, min = 1, max = 99 }) => {
  const handleDecrement = () => {
    const newQuantity = Math.max(min, quantity - 1);
    onQuantityChange(newQuantity);
  };

  const handleIncrement = () => {
    const newQuantity = Math.min(max, quantity + 1);
    onQuantityChange(newQuantity);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
        onQuantityChange(min);
        return;
    }
    
    let newQuantity = parseInt(value, 10);

    if (!isNaN(newQuantity)) {
        if (newQuantity < min) newQuantity = min;
        if (newQuantity > max) newQuantity = max;
        onQuantityChange(newQuantity);
    }
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.value === '' || isNaN(parseInt(e.target.value, 10))) {
          onQuantityChange(min);
      }
  }

  return (
    <div className="flex items-center rounded-md border border-gray-300">
      <button
        type="button"
        onClick={handleDecrement}
        className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-700 rounded-l-md hover:bg-gray-200 transition duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Decrease quantity"
        disabled={quantity <= min}
      >
        <span className="text-xl font-bold">-</span>
      </button>
      <input
        type="text" // Using text to avoid default number input spinners
        inputMode="numeric" // Helps mobile users get a number pad
        pattern="[0-9]*"
        value={quantity}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="w-12 h-10 text-center border-t-0 border-b-0 border-x border-gray-300 bg-white text-black font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 focus:z-10"
        aria-live="polite"
      />
       <button
        type="button"
        onClick={handleIncrement}
        className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-700 rounded-r-md hover:bg-gray-200 transition duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Increase quantity"
        disabled={quantity >= max}
      >
        <span className="text-xl font-bold">+</span>
      </button>
    </div>
  );
};

export default QuantitySelector;
