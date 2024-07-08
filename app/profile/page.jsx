// components/Profile.jsx
"use client";
import { useState, useEffect } from "react";
import ProfileDetails from "@/components/ProfileDetails";
import PlotsList from "@/components/PlotsList";
import GroupList from "@/components/GroupList";

const Profile = () => {
  const [profileData, setProfileData] = useState({
    email: "",
    username: "",
    street_address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    profilePhoto: null,
  });

  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setProfileData(data.profile);

        setGroups(data.groups);
      } catch (error) {
        setMessage("Error fetching profile data");
      }
    };

    fetchProfileData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-4xl">
        <ProfileDetails
          profileData={profileData}
          setProfileData={setProfileData}
          setMessage={setMessage}
        />
        <div className="mt-8">
          <h2 className="text-2xl mb-4">Your Plots</h2>
          <PlotsList user={profileData} message="You are not associated with any plots."/>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl mb-4">Your Groups</h2>
          {groups && groups.length > 0 ? (
            <GroupList groups={groups} message="You are not associated with any groups." />
          ) : (
            <p>You are not associated with any groups.</p>
          )}
        </div>
        {message && <p className="mt-4 text-green-600">{message}</p>}
      </div>
    </div>
  );
};

export default Profile;
