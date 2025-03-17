import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/api';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
    theme_preference: 'light',
    avatar: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        theme_preference: user.theme_preference || 'light',
        avatar: null,
      });
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, or GIF)');
        return;
      }
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setIsDirty(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const data = new FormData();
      for (const key in formData) {
        if (key === 'avatar' && formData[key] === null) continue;
        if (key === 'username' || key === 'email') continue;
        data.append(key, formData[key]);
      }
      const response = await API.users.updateUser(user.id, data);
      updateUser(response);
      toast.success('Profile updated successfully!');
      setIsDirty(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      const responseErrors = err.response?.data || {};
      const serverErrors = {};
      for (const key in responseErrors) {
        if (Array.isArray(responseErrors[key])) {
          serverErrors[key] = responseErrors[key][0];
        } else if (typeof responseErrors[key] === 'string') {
          serverErrors[key] = responseErrors[key];
        }
      }
      setErrors(serverErrors);
      toast.error('Failed to update profile. Please check the form for errors.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        theme_preference: user.theme_preference || 'light',
        avatar: null,
      });
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      } else {
        setAvatarPreview(null);
      }
    }
    setErrors({});
    setIsDirty(false);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-8 px-8">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-blue-100 mt-2 text-lg">Manage your account information and preferences</p>
        </div>
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-4 px-8 text-sm font-medium transition-colors duration-200 ease-in-out ${
                activeTab === 'personal'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-4 px-8 text-sm font-medium transition-colors duration-200 ease-in-out ${
                activeTab === 'preferences'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Preferences
            </button>
          </nav>
        </div>
        <div className="px-6 py-8 sm:p-8">
          <form onSubmit={handleSubmit}>
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1">
                  <div className="flex flex-col items-center">
                    <div className="relative group">
                      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg transition-transform duration-300 hover:scale-105">
                        <img
                          src={avatarPreview || 'https://via.placeholder.com/150?text=Upload+Photo'}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <label
                        htmlFor="avatar"
                        className="absolute inset-0 w-full h-full rounded-full flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <div className="text-center text-white p-2">
                          <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm">Change Photo</span>
                        </div>
                        <input
                          id="avatar"
                          name="avatar"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Click or hover to change (Max 5MB)</p>
                    <div className="mt-8 w-full p-6 bg-gray-50 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Account Info</h3>
                      <p className="text-sm text-gray-600 flex items-center mb-2">
                        <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-medium text-gray-900 mb-6">Personal Information</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                          <label htmlFor="username" className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-gray-500">
                            Username*
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <input
                              id="username"
                              name="username"
                              type="text"
                              disabled
                              className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg text-gray-700 bg-gray-50 cursor-not-allowed focus:outline-none sm:text-sm"
                              value={formData.username}
                              readOnly
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
                        </div>
                        <div className="relative">
                          <label htmlFor="email" className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-gray-500">
                            Email*
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              disabled
                              className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg text-gray-700 bg-gray-50 cursor-not-allowed focus:outline-none sm:text-sm"
                              value={formData.email}
                              readOnly
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                          <label htmlFor="first_name" className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-gray-500">
                            First Name
                          </label>
                          <input
                            id="first_name"
                            name="first_name"
                            type="text"
                            className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 sm:text-sm"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="Your first name"
                          />
                          {errors.first_name && (
                            <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>
                          )}
                        </div>
                        <div className="relative">
                          <label htmlFor="last_name" className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-gray-500">
                            Last Name
                          </label>
                          <input
                            id="last_name"
                            name="last_name"
                            type="text"
                            className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 sm:text-sm"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Your last name"
                          />
                          {errors.last_name && (
                            <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <label htmlFor="bio" className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-gray-500">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          rows="4"
                          placeholder="Tell us a little about yourself..."
                          className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 sm:text-sm"
                          value={formData.bio}
                          onChange={handleChange}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Brief description for your profile. URLs are hyperlinked.
                        </p>
                        {errors.bio && (
                          <p className="mt-1 text-xs text-red-500">{errors.bio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'preferences' && (
              <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-medium text-gray-900 mb-6">Appearance Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Theme Preference
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="relative">
                        <input
                          type="radio"
                          id="light"
                          name="theme_preference"
                          value="light"
                          className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                          checked={formData.theme_preference === 'light'}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="light"
                          className={`
                            relative block rounded-lg border-2 p-6 cursor-pointer focus:outline-none transition-all duration-200
                            ${formData.theme_preference === 'light' 
                              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="flex items-center justify-center mb-3">
                            <svg className="h-8 w-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                            </svg>
                          </div>
                          <span className="block text-sm font-medium text-center">Light</span>
                          {formData.theme_preference === 'light' && (
                            <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type="radio"
                          id="dark"
                          name="theme_preference"
                          value="dark"
                          className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                          checked={formData.theme_preference === 'dark'}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="dark"
                          className={`
                            relative block rounded-lg border-2 p-6 cursor-pointer focus:outline-none transition-all duration-200
                            ${formData.theme_preference === 'dark' 
                              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="flex items-center justify-center mb-3">
                            <svg className="h-8 w-8 text-indigo-900" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="block text-sm font-medium text-center">Dark</span>
                          {formData.theme_preference === 'dark' && (
                            <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type="radio"
                          id="system"
                          name="theme_preference"
                          value="system"
                          className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                          checked={formData.theme_preference === 'system'}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="system"
                          className={`
                            relative block rounded-lg border-2 p-6 cursor-pointer focus:outline-none transition-all duration-200
                            ${formData.theme_preference === 'system' 
                              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="flex items-center justify-center mb-3">
                            <svg className="h-8 w-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4.5 9.75a.75.75 0 00-.75.75V15c0 .414.336.75.75.75h6.75A.75.75 0 0012 15v-4.5a.75.75 0 00-.75-.75H4.5z" />
                              <path fillRule="evenodd" d="M3.75 6.75a3 3 0 00-3 3v6a3 3 0 003 3h15a3 3 0 003-3v-.037c.856-.174 1.5-.93 1.5-1.838v-2.25c0-.907-.644-1.664-1.5-1.837V9.75a3 3 0 00-3-3h-15zm15 1.5a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5h-15a1.5 1.5 0 01-1.5-1.5v-6a1.5 1.5 0 011.5-1.5h15z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="block text-sm font-medium text-center">System</span>
                          {formData.theme_preference === 'system' && (
                            <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                type="button"
                disabled={isLoading || !isDirty}
                onClick={handleCancel}
                className="px-5 py-2.5 border-2 border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading || !isDirty}
                className="inline-flex justify-center py-2.5 px-5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Kaydediliyor...
                  </span>
                ) : (
                  'Değişiklikleri Kaydet'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;