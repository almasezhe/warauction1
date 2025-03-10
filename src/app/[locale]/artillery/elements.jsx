'use client';

import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SendMessage() {
  const [selectedOptions, setSelectedOptions] = useState([]); // Array of selected items
  const [message, setMessage] = useState('');
  const [payment, setPayment] = useState('paypal'); // Payment method
  const [isQuick, setIsQuick] = useState(false); // Urgent order
  const [includeVideo, setIncludeVideo] = useState(false); // Firing video
  const [showCartModal, setShowCartModal] = useState(false); // Cart modal

  // Array of artillery options
  const artilleryOptions = [
    { id: 1, name: '12mm Artillery Shell', image: '/artillery/10.jpeg', cost: 100 },
    { id: 2, name: '123mm Tank Shell', image: '/artillery/11.jpeg', cost: 150 },
    { id: 3, name: '123mm Artillery Shell', image: '/artillery/1.jpeg', cost: 200 },
    { id: 4, name: '123mm Mortar Shell', image: '/artillery/2.jpg', cost: 120 },
    { id: 5, name: '155mm Howitzer Shell', image: '/artillery/3.jpg', cost: 250 },
  ];

  // Add item to cart
  const addToCart = (option) => {
    setSelectedOptions((prev) => {
      const isAlreadyAdded = prev.some((item) => item.id === option.id);
      if (isAlreadyAdded) {
        return prev.map((item) =>
          item.id === option.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { ...option, quantity: 1 }]; // Add item with quantity 1
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (optionId) => {
    setSelectedOptions((prev) => prev.filter((item) => item.id !== optionId));
  };

  // Update item quantity
  const updateQuantity = (optionId, quantity) => {
    if (quantity < 1) return; // Minimum quantity is 1
    setSelectedOptions((prev) =>
      prev.map((item) =>
        item.id === optionId ? { ...item, quantity: quantity } : item
      )
    );
  };

  // Calculate total cost of items in cart
  const calculateTotalCartCost = () => {
    return selectedOptions.reduce((total, item) => total + item.cost * item.quantity, 0);
  };

  // Calculate message cost
  const calculateMessageCost = () => {
    if (!message) return 0;
    const charCount = message.length;
    const baseCost = 0; // Base cost (18 characters free)
    const additionalChars = Math.max(0, charCount - 18);
    return baseCost + additionalChars * 2; // $2 per additional character
  };

  // Calculate total order cost
  const calculateTotalCost = () => {
    const cartCost = calculateTotalCartCost();
    const messageCost = calculateMessageCost();
    const quickCost = isQuick ? 30 : 0; // Urgent order
    const videoCost = includeVideo ? 100 : 0; // Firing video
    return cartCost + messageCost + quickCost + videoCost;
  };

  // Handle payment
  const handlePayment = () => {
    toast.success('Payment successful!');
    setShowCartModal(false); // Close cart modal
    setSelectedOptions([]); // Clear cart
  };

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        toastStyle={{
          marginTop: '60px',
          backgroundColor: '#1f2937',
          color: '#fff',
          border: '1px solid #374151',
          borderRadius: '8px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
        }}
        progressStyle={{ backgroundColor: '#2563eb' }}
      />

      {/* Cart icon with item count */}
      <div
        className="fixed bottom-4 right-4 bg-blue-600 p-3 rounded-full cursor-pointer hover:bg-blue-700 transition-colors z-50"
        onClick={() => setShowCartModal(true)}
      >
        <span className="text-white font-semibold">🛒 {selectedOptions.length}</span>
      </div>

      {/* Cart modal */}
      {showCartModal && (
        <div
          className="
            fixed inset-0 z-50 flex items-center justify-center
            bg-black bg-opacity-50 
            transition-opacity duration-300 
            animate-fadeIn
          "
        >
          <div
            className="
              bg-gray-800 relative rounded-lg shadow-lg 
              max-w-md w-full p-6 
              transform transition-transform duration-300 
              animate-scaleIn
            "
          >
            <button
              onClick={() => setShowCartModal(false)}
              className="
                absolute right-4 top-4 text-gray-400 hover:text-gray-200 
                transition-colors duration-200
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-xl font-bold mb-4 text-center">Cart</h2>

            {/* List of items in cart */}
            <div className="space-y-4">
              {selectedOptions.map((option) => (
                <div key={option.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{option.name}</h3>
                    <p className="text-gray-400">${option.cost} (x{option.quantity})</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(option.id, option.quantity - 1)}
                      className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                    >
                      -
                    </button>
                    <span>{option.quantity}</span>
                    <button
                      onClick={() => updateQuantity(option.id, option.quantity + 1)}
                      className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(option.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total cost of items in cart */}
            <div className="mt-6">
              <p className="text-lg font-semibold">
                Subtotal: ${calculateTotalCartCost()}
              </p>
            </div>

            {/* Message input */}
            <div className="mt-4">
              <label htmlFor="message" className="block text-sm font-medium">
                Message (optional)
              </label>
              <textarea
                id="message"
                placeholder="Enter your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Additional options */}
            <div className="mt-4 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="quick"
                  checked={isQuick}
                  onChange={(e) => setIsQuick(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="quick" className="flex items-center">
                  Urgent order: $30
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="video"
                  checked={includeVideo}
                  onChange={(e) => setIncludeVideo(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="video" className="flex items-center">
                  Firing video: $100
                </label>
              </div>
            </div>

            {/* Cost summary */}
            <div className="mt-6 p-4 bg-gray-700 rounded-md">
              <h2 className="text-lg font-semibold">Cost Summary</h2>
              <p>
                Base cost (18 characters): $0
              </p>
              <p>
                $2 per additional character: ${calculateMessageCost()}
              </p>
              {isQuick && <p>Urgent order: $30</p>}
              {includeVideo && <p>Firing video: $100</p>}
              <hr className="my-2 border-gray-600" />
              <p className="font-bold">
                Total: ${calculateTotalCost()}
              </p>
            </div>

            {/* Payment button */}
            <button
              onClick={handlePayment}
              className="
                w-full mt-4 p-3 bg-blue-600 rounded-md font-semibold 
                text-white hover:bg-blue-700 focus:outline-none 
                focus:ring-2 focus:ring-blue-500
              "
            >
              Pay Now
            </button>
          </div>
        </div>
      )}

      {/* Artillery grid */}
      <div className="flex flex-wrap lg:flex-nowrap items-start justify-center min-h-screen bg-gray-900 text-white px-6 py-12 gap-6">
        <div className="w-full lg:w-2/3 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center">
            Choose Artillery
          </h1>

          {/* Grid of artillery options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {artilleryOptions.map((option) => (
              <div
                key={option.id}
                className={`p-4 bg-gray-700 rounded-lg shadow-md cursor-pointer transition-all duration-300 ${
                  selectedOptions.some((item) => item.id === option.id)
                    ? 'ring-2 ring-blue-500'
                    : 'hover:bg-gray-600'
                }`}
                onClick={() => addToCart(option)}
              >
                <div className="w-full h-48 overflow-hidden rounded-md mb-4">
                  <img
                    src={option.image}
                    alt={option.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold">{option.name}</h3>
                <p className="text-gray-400">${option.cost}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}