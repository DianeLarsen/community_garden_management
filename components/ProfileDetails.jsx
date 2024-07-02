"use client";
import { useState, useEffect } from 'react';
import { CldUploadWidget } from 'next-cloudinary';

const ProfileDetails = ({ profileData, setProfileData, setMessage }) => {
  const [localProfileData, setLocalProfileData] = useState(profileData);
  const [photo, setPhoto] = useState(localProfileData.profilePhoto);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
const [confirmationMessage, setConfirmationMessage] = useState("")
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalProfileData({
      ...localProfileData,
      [name]: value,
    });
  };

  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (localProfileData.username) {
        const response = await fetch(`/api/check_username?username=${localProfileData.username}`);
        const data = await response.json();
        setUsernameAvailable(data.available);
      } else {
        setUsernameAvailable(null);
      }
    };

    checkUsernameAvailability();
  }, [localProfileData.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', localProfileData.username);
    formData.append('street_address', localProfileData.street_address);
    formData.append('city', localProfileData.city);
    formData.append('state', localProfileData.state);
    formData.append('zip', localProfileData.zip);
    formData.append('phone', localProfileData.phone);
    if (photo) {
      formData.append('profilePhoto', photo);
    }
    const token = localStorage.getItem('token');
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    const data = await response.json();
    setMessage(data.message || data.error);
    if (data.message) {
      setProfileData(localProfileData);
        setConfirmationMessage(data.message)
    }
  };
  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white shadow-md rounded">
      <h2 className="text-2xl mb-4">Welcome to Your Profile, {profileData.email}</h2>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Username <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="username"
          value={localProfileData.username}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${usernameAvailable === false ? 'border-red-500' : usernameAvailable === true ? 'border-green-500' : ''}`}
          required
        />
        {usernameAvailable === false && <p className="text-red-500">Username is taken</p>}
        {usernameAvailable === true && <p className="text-green-500">Username is available</p>}
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Street Address</label>
        <input
          type="text"
          name="street_address"
          value={localProfileData.street_address}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">City</label>
        <input
          type="text"
          name="city"
          value={localProfileData.city}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">State</label>
        <input
          type="text"
          name="state"
          value={localProfileData.state}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Zip Code <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="zip"
          value={localProfileData.zip}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Phone</label>
        <input
          type="text"
          name="phone"
          value={localProfileData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Profile Photo</label>
        <CldUploadWidget
          uploadPreset="cbutm4im"
          onSuccess={(result, { widget }) => {
            setPhoto(result?.info.secure_url);
            widget.close();
          }}
        >
          {({ open }) => (
            photo ? (
              <div className="relative group cursor-pointer" onClick={open}>
                <img src={photo} alt="Profile" className="w-32 h-32 object-cover rounded-full" />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-medium">
                  Click to update profile picture
                </div>
              </div>
            ) : (
              <div className="relative group cursor-pointer" onClick={open}>
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                  No Photo
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-medium">
                  Click to add profile picture
                </div>
              </div>
            )
          )}
        </CldUploadWidget>
      </div>
      <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded">
        Save Profile
      </button>
      {confirmationMessage && (
        <div className="mt-4 text-green-600 whitespace-pre-wrap">{confirmationMessage}</div>
      )}
    </form>
  );
};

export default ProfileDetails;
