"use client";
import { useState, useEffect, useContext } from 'react';
import { BasicContext } from '@/context/BasicContext';

const CreateEvent = ({gardenId}) => {
  const { user, groups } = useContext(BasicContext);
  const [plots, setPlots] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

const [error, setError] = useState('');

  const [plotId, setPlotId] = useState('');
  const [groupId, setGroupId] = useState('');

  useEffect(() => {
    // Fetch plots reserved by user or their groups
    const fetchPlots = async () => {
      try {
        const response = await fetch(`/api/plots?user_id=${user.id}&userInfo=true`);
        const data = await response.json();
        setPlots(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching plots:', err);
      }
    };

    fetchPlots();
  }, [user.id]);





  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, date, garden_id: gardenId, plot_id: plotId, user_id: user.id, group_id: groupId }),
      });

      if (response.ok) {
        alert('Event created successfully!');
      } else {
        alert('Failed to create event.');
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };
  if (error) {
    return <div className="text-red-500 font-bold mt-4">{error}</div>;
  }
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Event Name" 
            required 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Description</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Event Description" 
            required 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date and Time</label>
          <input 
            type="datetime-local" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
       
        <div>
          <label className="block text-sm font-medium text-gray-700">Plot</label>
          <select 
            value={plotId} 
            onChange={(e) => setPlotId(e.target.value)} 
            required 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Plot</option>
            {plots.message ? <option value="">No reserved plots found</option> : plots.map(plot => (
              <option key={plot.id} value={plot.id}>{plot.length}X{plot.width}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Group</label>
          <select 
            value={groupId} 
            onChange={(e) => setGroupId(e.target.value)} 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Group</option>
            {groups.message ? <option value="">No groups found</option> : groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>
        <div>
          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
