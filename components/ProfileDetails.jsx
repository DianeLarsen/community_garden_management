"use client";
import { useState, useEffect } from "react";
import { CldUploadWidget } from "next-cloudinary";

const ProfileDetails = ({ profileData, setProfileData, setMessage }) => {
  const [localProfileData, setLocalProfileData] = useState({});
  const [tempLocalProfileData, setTempLocalProfileData] = useState({});
  const [photo, setPhoto] = useState(profileData.profilePhoto);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchProfileData = async () => {
      const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setLocalProfileData(data.profile);
    };

    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempLocalProfileData({
      ...localProfileData,
      [name]: value,
    });
  };

  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (tempLocalProfileData.username) {
        const response = await fetch(
          `/api/check_username?username=${tempLocalProfileData.username}`
        );
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
    formData.append("username", localProfileData.username);
    formData.append("street_address", localProfileData.street_address);
    formData.append("city", localProfileData.city);
    formData.append("state", localProfileData.state);
    formData.append("zip", localProfileData.zip);
    formData.append("phone", localProfileData.phone);
    if (photo) {
      formData.append("profilePhoto", photo);
    }
    const token = localStorage.getItem("token");
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    setMessage(data.message || data.error);
    if (data.message) {
      const oldProfileData = JSON.stringify(profileData, null, 2);
      const newProfileData = JSON.stringify(localProfileData, null, 2);
      setConfirmationMessage(
        `Profile updated successfully.\n\nBefore:\n${oldProfileData}\n\nAfter:\n${newProfileData}`
      );
      setProfileData(localProfileData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-4 bg-white shadow-md rounded"
    >
      <h2 className="text-2xl mb-4">
        Welcome to Your Profile,{" "}
        {profileData.username.charAt(0).toUpperCase() +
          profileData.username.slice(1) || "N/A"}
      </h2>

      <h3 className="text-xl mb-2">Update Profile</h3>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Username:{" "}
          {profileData?.username
            ? profileData.username.charAt(0).toUpperCase() +
              profileData.username.slice(1)
            : "N/A"}{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="username"
          value={tempLocalProfileData.username}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            usernameAvailable === false
              ? "border-red-500"
              : usernameAvailable === true
              ? "border-green-500"
              : ""
          }`}
          required={!profileData?.username}
        />
        {usernameAvailable === false && (
          <p className="text-red-500">Username is taken</p>
        )}
        {usernameAvailable === true && (
          <p className="text-green-500">Username is available</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Street Address: {profileData?.street_address}
        </label>
        <input
          type="text"
          name="street_address"
          value={tempLocalProfileData.street_address}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          City: {profileData?.city}
        </label>
        <input
          type="text"
          name="city"
          value={tempLocalProfileData.city}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4 flex">
        <div className="w-1/2 pr-2">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            State: {profileData?.state}
          </label>
          <input
            type="text"
            name="state"
            value={tempLocalProfileData.state}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="w-1/2 pl-2">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Zip Code: {profileData?.zip} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="zip"
            value={tempLocalProfileData.zip}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required={!profileData?.zip}
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Phone: {profileData?.phone}
        </label>
        <input
          type="text"
          name="phone"
          value={tempLocalProfileData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Profile Photo
        </label>
        <CldUploadWidget
          uploadPreset="cbutm4im"
          onSuccess={(result, { widget }) => {
            setPhoto(result?.info.secure_url);
            widget.close();
          }}
        >
          {({ open }) =>
            photo ? (
              <div className="relative group cursor-pointer" onClick={open}>
                <img
                  src={photo}
                  alt="Profile"
                  className="w-32 h-32 object-cover rounded-full"
                />
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
          }
        </CldUploadWidget>
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white rounded"
      >
        Save Profile
      </button>
      {confirmationMessage && (
        <div className="mt-4 text-green-600 whitespace-pre-wrap">
          {confirmationMessage}
        </div>
      )}
    </form>
  );
};

export default ProfileDetails;
