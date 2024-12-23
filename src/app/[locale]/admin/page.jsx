'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../component/navbar';
import { supabase } from '@/utils/supabase/client';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState([]);
  const [options, setOptions] = useState([]);
  const [newLot, setNewLot] = useState({ name: '', description: '', current_bid: 0, time_left: 0 });
  const [newOption, setNewOption] = useState({ name: '', cost: 0, description: '' });
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [editOption, setEditOption] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls modal visibility
  const [modalContent, setModalContent] = useState(null); // Modal content (Add/Edit/Delete forms)

  useEffect(() => {
    const fetchUserAndAdmins = async () => {
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();

      if (sessionError || !user) {
        setUser(null);
        setIsAdmin(false);
        return;
      }

      setUser(user);

      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id);

      setIsAdmin(adminData.length > 0);
    };

    fetchUserAndAdmins();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      const { data: itemsData } = await supabase.from('auction_items').select('*');
      setItems(itemsData);

      const { data: optionsData } = await supabase.from('options').select('*');
      setOptions(optionsData);

      const { data: usersData } = await supabase.from('users').select('*');
      setUsers(usersData);

      const { data: adminsData } = await supabase.from('admins').select('*');
      setAdmins(adminsData);
    };

    fetchData();
  }, []);

  const openModal = (content) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };
  const handleAddLot = async () => {
    try {
      let imageUrl = '';
      if (file) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage.from('auction_images').upload(fileName, file);
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage
        .from('auction_images')
        .getPublicUrl(fileName);
  
      console.log("Public URL:", publicUrlData.publicUrl); // Логируем корректный URL
        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from('auction_items').insert({
        ...newLot,
        image_url: imageUrl,
        is_active: true,
      });

      if (insertError) throw insertError;

      alert('Lot added successfully!');
      setNewLot({ name: '', description: '', current_bid: 0, time_left: 0 });
      setFile(null);
    } catch (err) {
      alert(`Error adding lot: ${err.message}`);
    }
  };

  const handleEditItem = async () => {
    try {
      const { error } = await supabase
        .from('auction_items')
        .update(editItem)
        .eq('id', editItem.id);

      if (error) throw error;

      alert('Auction item updated successfully!');
      setEditItem(null);
    } catch (err) {
      alert(`Error updating item: ${err.message}`);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const { error } = await supabase.from('auction_items').delete().eq('id', itemId);
      if (error) throw error;

      alert('Item deleted successfully!');
      setItems(items.filter((item) => item.id !== itemId));
    } catch (err) {
      alert(`Error deleting item: ${err.message}`);
    }
  };

  const handleAddOption = async () => {
    try {
      const { error } = await supabase.from('options').insert(newOption);
      if (error) throw error;

      alert('Option added successfully!');
      setNewOption({ name: '', cost: 0, description: '' });
    } catch (err) {
      alert(`Error adding option: ${err.message}`);
    }
  };

  const handleEditOption = async () => {
    try {
      const { error } = await supabase
        .from('options')
        .update(editOption)
        .eq('id', editOption.id);

      if (error) throw error;

      alert('Option updated successfully!');
      setEditOption(null);
    } catch (err) {
      alert(`Error updating option: ${err.message}`);
    }
  };

  const handleDeleteOption = async (optionId) => {
    try {
      const { error } = await supabase.from('options').delete().eq('id', optionId);
      if (error) throw error;

      alert('Option deleted successfully!');
      setOptions(options.filter((option) => option.id !== optionId));
    } catch (err) {
      alert(`Error deleting option: ${err.message}`);
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      const { error } = await supabase.from('admins').insert({ user_id: userId });
      if (error) throw error;

      alert('User promoted to admin!');
    } catch (err) {
      alert(`Error promoting user to admin: ${err.message}`);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    try {
      const { error } = await supabase.from('admins').delete().eq('user_id', userId);
      if (error) throw error;

      alert('Admin removed successfully!');
    } catch (err) {
      alert(`Error removing admin: ${err.message}`);
    }
  };
  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full text-white relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-white font-bold"
          >
            X
          </button>
          {children}
        </div>
      </div>
    );
  };
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Access denied. You must be an administrator to access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-8">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-100">Admin Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Manage Admins */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Manage Admins</h2>
            <ul className="space-y-3">
              {users.map((u) => {
                const isUserAdmin = admins.some((a) => a.user_id === u.id);
                return (
                  <li key={u.id} className="flex justify-between items-center">
                    <span className="text-lg">{u.username || u.email}</span>
                    {isUserAdmin ? (
                      <button
                        onClick={() => alert('Remove Admin')}
                        className="bg-red-500 hover:bg-red-600 text-sm px-3 py-1 rounded"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => alert('Make Admin')}
                        className="bg-green-500 hover:bg-green-600 text-sm px-3 py-1 rounded"
                      >
                        Make Admin
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Auction Items */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Auction Items</h2>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between items-center">
                  <span className="text-lg">{item.name}</span>
                  <div className="space-x-2">
                  <button
                    onClick={() => openModal(
                      <div>
                        <h2 className="text-xl font-bold">Edit Item</h2>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => setEditItem({ ...item, name: e.target.value })}
                          className="block w-full p-2 mt-4 bg-gray-700 rounded"
                        />
                        <textarea
                          value={item.description}
                          onChange={(e) => setEditItem({ ...item, description: e.target.value })}
                          className="block w-full p-2 mt-4 bg-gray-700 rounded"
                        ></textarea>
                        <button
                                                        onClick={() => {
                                                          handleEditItem();
                                                          closeModal();
                                                        }}
                          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded mt-4"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                    className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-sm px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={() => openModal(
                <div>
                  <h2 className="text-xl font-bold">Add New Lot</h2>
                  <input
                    type="text"
                    placeholder="Name"
                    onChange={(e) => setNewLot({ ...newLot, name: e.target.value })}
                    className="block w-full p-2 mt-4 bg-gray-700 rounded"
                  />
                  <textarea
                    placeholder="Description"
                    onChange={(e) => setNewLot({ ...newLot, description: e.target.value })}
                    className="block w-full p-2 mt-4 bg-gray-700 rounded"
                  ></textarea>
                  <button
                                        onClick={()=> {handleAddLot();
                                          closeModal();}
                                        }
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded mt-4"
                  >
                    Add Lot
                  </button>
                </div>
              )}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded mt-4"
            >
              Add Lot
            </button>
          </div>

          {/* Options */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Options</h2>
            <ul className="space-y-3">
              {options.map((opt) => (
                <li key={opt.id} className="flex justify-between items-center">
                  <span className="text-lg">{opt.name}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => openModal(
                        <div>
                          <h2 className="text-xl font-bold">Edit Item</h2>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => setEditOption({ ...item, name: e.target.value })}
                            className="block w-full p-2 mt-4 bg-gray-700 rounded"
                          />
                          <textarea
                            value={item.description}
                            onChange={(e) => setEditOption({ ...item, description: e.target.value })}
                            className="block w-full p-2 mt-4 bg-gray-700 rounded"
                          ></textarea>
                          <button
                                                        onClick={() => {
                                                          handleEditOption();
                                                          closeModal();
                                                        }}
                            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded mt-4"
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                      className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteOption(opt.id)}
                      className="bg-red-500 hover:bg-red-600 text-sm px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={() => openModal(
                <div>
                  <h2 className="text-xl font-bold">Add Option</h2>
                  <input
                    type="text"
                    placeholder="Option Name"
                    onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                    className="block w-full p-2 mt-4 bg-gray-700 rounded"
                  />
                  <textarea
                    placeholder="Description"
                    onChange={(e) => setNewOption({ ...newOption, description: e.target.value })}
                    className="block w-full p-2 mt-4 bg-gray-700 rounded"
                  ></textarea>
                  <button
                    onClick={()=> {handleAddOption();
                      closeModal();}
                    }
                    
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded mt-4"
                  >
                    Add Option
                  </button>
                </div>
              )}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
            >
              Add Option
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {modalContent}
      </Modal>
    </div>
  );}