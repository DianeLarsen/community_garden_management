import React from 'react';

const PlotCreate = ({ newPlot, setNewPlot, fetchPlots, gardenId, groups, role }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlot((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddPlot = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/plots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newPlot, garden_id: gardenId, status: 'available' }),
      });

      if (!response.ok) {
        throw new Error('Error adding plot');
      }

      fetchPlots(gardenId);
      setNewPlot({ location: '', length: '', width: '', user_id: '', group_id: '' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!role == 'admin') {
    return <p>You do not have permission to create plots.</p>;
  }

  return (
    <form onSubmit={handleAddPlot} className="mb-4 p-4 bg-gray-50 shadow-md rounded">
      <h2 className="text-lg font-bold mb-4">Create New Plot</h2>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Length</label>
        <input
          type="text"
          name="length"
          value={newPlot.length}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
        <label className="block mb-2 text-sm font-medium text-gray-700">Width</label>
        <input
          type="text"
          name="width"
          value={newPlot.width}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Group</label>
        <select
          name="group_id"
          value={newPlot.group_id}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Select a group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded">
        Add Plot
      </button>
    </form>
  );
};

export default PlotCreate;
