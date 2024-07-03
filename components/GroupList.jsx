"use client";
import { useState, useEffect } from 'react';

const GroupList = ({ gardenId, userId }) => {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        let url = '/api/groups';
        if (gardenId) {
          url += `?gardenId=${gardenId}`;
        } else if (userId) {
          url += `?userId=${userId}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
          setGroups(data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch groups.');
      }
    };

    fetchGroups();
  }, [gardenId, userId]);

  if (error) {
    return <div className="text-red-500 font-bold mt-4">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Groups</h1>
      <ul className="list-none p-0">
        {groups.map(group => (
          <li key={group.id} className="bg-gray-100 mb-4 p-4 rounded shadow-md">
            <div className="font-semibold">Name: {group.name}</div>
            <div>Description: {group.description}</div>
            <div>Gardens: {group.gardens.join(', ')}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupList;
