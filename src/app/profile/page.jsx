'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        toast.error('Error fetching user data.');
        return;
      }

      setUser(user);
    };

    fetchUser();
  }, []);

  const updateAvatarInMetadata = async (avatarUrl) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });

      if (error) {
        toast.error('Failed to update avatar.');
      } else {
        const { data: { user }, error: fetchError } = await supabase.auth.getUser();
        if (fetchError) throw fetchError;

        setUser(user);
        toast.success('Avatar updated successfully!');
      }
    } catch (error) {
      toast.error('An error occurred while updating the avatar.');
    } finally {
      setUploading(false);
    }
  };

  const uploadAvatar = async (file) => {
    try {
      setUploading(true);
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      await updateAvatarInMetadata(avatarUrl);
    } catch (error) {
      toast.error(`Error uploading avatar: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadAvatar(file);
  };

  const updateUsername = async () => {
    try {
      setLoading(true);
  
      // First, update the username in the authentication metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { username: newUsername },
      });
  
      if (authError) {
        toast.error('Failed to update username in authentication.');
        return;
      }
  
      // Then, update the username in the database
      const { error: dbError } = await supabase
        .from('users')
        .update({ username: newUsername })
        .eq('id', user.id);
  
      if (dbError) {
        toast.error('Failed to update username in database.');
        return;
      }
  
      toast.success('Username updated successfully!');
      setNewUsername('');
    } catch (error) {
      toast.error('An error occurred while updating the username.');
    } finally {
      setLoading(false);
    }
  };
  

  const changePassword = async () => {
    try {
      setPasswordLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error('Failed to change password.');
      } else {
        toast.success('Password updated successfully!');
        setNewPassword('');
      }
    } catch (error) {
      toast.error('An error occurred while changing the password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <ToastContainer
        position="top-left"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark" // Matches the dark theme
        toastStyle={{
          marginTop:"60px",
          backgroundColor: '#1f2937', // Dark gray
          color: '#fff', // White text
          border: '1px solid #374151', // Subtle border
          borderRadius: '8px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
        }}
        progressStyle={{ backgroundColor: '#2563eb' }} // Blue progress bar
      />
      <div className="flex-grow flex flex-col items-center justify-start mt-24">
        <div className="p-8 bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8">Your Profile</h1>
          {user ? (
            <div className="text-center">
              {/* Avatar */}
              <div className="mb-6 relative inline-block">
                <img
                  src={user.user_metadata?.avatar_url || 'https://via.placeholder.com/150'}
                  alt="Avatar"
                  className="w-32 h-32 mx-auto rounded-full border-4 border-blue-500 object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  {uploading ? '...' : '📤'}
                </label>
              </div>

              {/* Username */}
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder={user.user_metadata?.username || 'Enter new username'}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                />
                <button
                  onClick={updateUsername}
                  className={`mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-500 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Save Username'}
                </button>
              </div>

              {/* Change Password */}
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                />
                <button
                  onClick={changePassword}
                  className={`mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition ${passwordLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating...' : 'Change Password'}
                </button>
              </div>

              {/* Email */}
              <div className="mt-6">
                <p className="text-sm text-gray-400">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="text-sm text-gray-400">
                  <strong>Current Username:</strong> {user.user_metadata?.username || 'Not set'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400">Please log in to view your profile.</p>
          )}
        </div>
      </div>
    </div>
  );
}