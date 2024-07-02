// components/Profile.jsx
"use client";
import { useState, useEffect } from 'react';
import ProfileDetails from '@/components/ProfileDetails';
import PlotsList from '@/components/PlotsList';
import GroupList from '@/components/GroupList';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    email: '',
    address: '',
    phone: '',
    profilePhoto: null,
  });
  const [plots, setPlots] = useState([]);
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        setProfileData(data.profile);
        setPlots(data.plots);
        setGroups(data.groups);
      } catch (error) {
        setMessage('Error fetching profile data');
      }
    };

    fetchProfileData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-2xl">
        <h1 className="text-3xl mb-6">Welcome to Your Profile</h1>
        <ProfileDetails profileData={profileData} setProfileData={setProfileData} setMessage={setMessage} />
        <div className="mt-8">
          <h2 className="text-2xl mb-4">Your Plots</h2>
          {plots.length > 0 ? <PlotsList plots={plots} /> : <p>You are not associated with any plots.</p>}
        </div>
        <div className="mt-8">
          <h2 className="text-2xl mb-4">Your Groups</h2>
          {groups.length > 0 ? <GroupList groups={groups} /> : <p>You are not associated with any groups.</p>}
        </div>
        {message && <p className="mt-4 text-green-600">{message}</p>}
      </div>
    </div>
  );
};

export default Profile;
