// components/Profile.jsx
"use client";
import { useState, useEffect, useContext } from "react";
import ProfileDetails from "@/components/ProfileDetails";
import PlotsList from "@/components/PlotsList";
import GroupList from "@/components/GroupList";
import { BasicContext } from "@/context/BasicContext";
import EventsList from "@/components/EventsList";

const Profile = () => {
  const { user, setUser, groups, message, setMessage } =
    useContext(BasicContext);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-4xl">
        <ProfileDetails />
        <div className="mt-8">
          <h2 className="text-2xl mb-4">Your Plots</h2>
          <PlotsList
            user={user}
            message="You are not associated with any plots."
            userInfo={true}
          />
        </div>
        <div className="mt-8">
          <h2 className="text-2xl mb-4">Your Groups</h2>
          {groups && groups.length > 0 ? (
            <GroupList
              groups={groups}
              message="You are not associated with any groups."
            />
          ) : (
            <p>You are not associated with any groups.</p>
          )}
        </div>
        <div className="mt-8">
          <h2 className="text-2xl mb-4">Your Events</h2>

            <EventsList />
        </div>
        {message && <p className="mt-4 text-green-600">{message}</p>}
        
      </div>
      
    </div>
  );
};

export default Profile;
