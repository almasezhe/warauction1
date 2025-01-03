'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../component/navbar';
import jwt from 'jsonwebtoken';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslations } from 'next-intl';
import { supabase } from '@/utils/supabase/client';

export default function SendMessage() {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [message, setMessage] = useState('');
  const [payment, setPayment] = useState('visa');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const t = useTranslations('SendMessage');
  const images = [
    '/artillery/1.jpeg',
    '/artillery/2.jpg',
    '/artillery/3.jpg',
    '/artillery/4.jpg',
    '/artillery/5.jpg',
    '/artillery/8.jpeg',
  ];
    useEffect(() => {
      if (typeof window !== 'undefined'){
      const fetchUser = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
  
        if (error) {
          console.error('Error fetching user:', error.message);
        } else {
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user)); // Save user to localStorage
        }
      };
  
      fetchUser();}
    }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/artillery');
        if (!response.ok) throw new Error(t('errors.fetchOptions'));
        const data = await response.json();
        setOptions(data);

        if (data.length > 0) {
          setSelectedOption(data[0]?.id);
        }
      } catch (error) {
        toast.error(t('errors.fetchOptionsRetry'));
      }
    };

    fetchOptions();
  }, []);
  // Helper functions for localStorage
 // Helper functions for localStorage
 const getUserFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }
  return null;
};

const getAuthTokenFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || null;
  }
  return null;
};
  useEffect(() => {
    const token = getAuthTokenFromLocalStorage();
    if (token) {
      const decoded = jwt.decode(token);
      setUser(decoded);
    }
  }, []);

  const calculateTotalCost = () => {
    const selectedOptionDetails = options.find((opt) => opt.id === selectedOption);
    const baseCost = selectedOptionDetails?.cost || 0;
    return baseCost + message.length * 5;
  };


  const username = getUserFromLocalStorage()?.user_metadata?.username || 'Guest';
  console.log('Username:', username);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = getUserFromLocalStorage();
    const user_id = userData?.id;
    const username = userData?.user_metadata?.username || 'User';

    if (!user_id) {
      toast.error('User ID not found. Please log in again.');
      return;
    }

    const totalCost = calculateTotalCost();
    const messageData = {
      user_id,
      option_id: selectedOption,
      message,
      email,
      payment_method: payment,
      cost: totalCost,
      username,
    };

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Error:', errorResponse.error);
        throw new Error(errorResponse.error || 'Failed to send the message');
      }

      const result = await response.json();
      console.log('Message saved:', result);

      toast.success(`Message sent successfully! Total cost: $${totalCost}`);
      setMessage('');
    } catch (error) {
      console.error('Error submitting message:', error);
      toast.error(t('errors.submitRetry'));
    }
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

<div className="flex flex-wrap lg:flex-nowrap items-start justify-center min-h-screen bg-gray-900 text-white px-6 py-12 gap-6">
  {/* First block */}
  <div className="w-full lg:w-[60%] bg-gray-800 p-6 rounded-lg shadow-lg">
  <h1 className="text-3xl lg:text-4xl font-bold text-center">{t('title')}</h1>

  <h3 className="text-2xl lg:text-3xl font-bold text-center text-gray-300 mt-4">{t('subtitle')}</h3>
  <p className="text-sm lg:text-base text-gray-400 mt-4 text-center">{t('description')}</p>

    {/* Image Slider */}
    <div className="mt-6 w-full lg:w-[60%] h-64 md:h-80 bg-gray-700 rounded-lg overflow-hidden mx-auto relative">
      <div
        className="w-full h-full flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
      >
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Slide ${index}`}
            className="w-full h-full object-cover flex-shrink-0"
          />
        ))}
      </div>

      {/* Dot indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentImageIndex ? 'bg-white' : 'bg-gray-400'
            }`}
          ></div>
        ))}
      </div>
    </div>

  </div>

  {/* Second Block */}
  <div className="w-full lg:w-[25%] bg-gray-800 p-6 rounded-lg shadow-lg">
    <form onSubmit={handleSubmit} className="space-y-9">
      <div>
        <label htmlFor="message" className="block text-sm font-medium">
        {t('form.message')}
        </label>
        <input
          type="text"
          id="message"
          placeholder="Enter your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="mt-1 p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex space-x-4">
        <div className="w-1/2">
          <label htmlFor="option" className="block text-sm font-medium">
          {t('form.option')}
          </label>
          <select
            id="option"
            value={selectedOption}
            onChange={(e) => setSelectedOption(Number(e.target.value))}
            className="p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} - ${option.cost}
              </option>
            ))}
          </select>
        </div>
        <div className="w-1/2">
          <label htmlFor="payment" className="block text-sm font-medium">
          {t('form.payment')}
          </label>
          <select
            id="payment"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
          >
               <option value="visa">{t('form.paymentVisa')}</option>
                  <option value="mastercard">{t('form.paymentMasterCard')}</option>
                  <option value="paypal">{t('form.paymentPayPal')}</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
        />
<p className="text-gray-400 text-xs mt-1">
  {t('form.confirmation')}
</p>
</div>
<div className="p-4 bg-gray-700 rounded-md">
  <h2 className="text-lg font-semibold">{t('summary.title')}</h2>
  <p>
    {t('summary.baseCost')}: ${options.find((opt) => opt.id === selectedOption)?.cost || 0}
  </p>
  <p>{t('summary.messageCost', { cost: message.length * 5 })}</p>
  <hr className="my-2 border-gray-600" />
  <p className="font-bold">{t('summary.totalCost', { total: calculateTotalCost() })}</p>
</div>



<button
  type="submit"
  className="w-full p-3 bg-blue-600 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  {t('form.submit')}
</button>

    </form>
  </div>
</div>


<section className="py-20 bg-gray-800 text-gray-100 lg:-mt-32">
  <div className="max-w-screen-lg mx-auto px-6 flex flex-wrap md:flex-nowrap items-center gap-10">
    {/* Text Block */}
    <div className="w-full md:w-1/2">
      <h3 className="text-3xl font-bold mb-4">
        {t('about.title')} <span className="text-blue-500 text-4xl">{t('about.projectName')}</span>
      </h3>
      <p className="text-gray-400 leading-relaxed">{t('about.description')}</p>
      <p className="text-gray-400 mt-4">{t('about.callToAction')}</p>
    </div>

    {/* Slider Section with Video */}
    <div className="w-full md:w-1/2 h-72 bg-gray-700 rounded-lg overflow-hidden relative flex items-center justify-center">
      <video
        src="/artillery/otstrel.MP4"
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
      ></video>
    </div>
  </div>
</section>


    </div>
  );
}
