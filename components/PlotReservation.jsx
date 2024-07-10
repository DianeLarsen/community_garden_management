"use client"
import { useState } from 'react';
import { useParams, useRouter } from "next/navigation";

const PlotReservation = ({ user, groups, plotId, gardenId, showBanner }) => {
  const { id } = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState({
    group_id: "",
    duration: 1,
    user_id: user.id,
    plot_id: id,
    garden_id: gardenId,
    purpose: '', // Add purpose field
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReservation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReservePlot = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/plots/${id}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservation),
      });

      if (!response.ok) {
        throw new Error('Error reserving plot');
      }

      showBanner("Plot Reservation successful!", "success");
 // Reload the page after successful reservation
    } catch (error) {
      console.error('Error:', error);
      showBanner("Error!", "error");
    } finally {
      router.back();
    }
  };

  return (
    <div className="mb-6 p-4 bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">Reserve This Plot</h2>

      <form onSubmit={handleReservePlot}>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={user.username}
            className="w-full px-3 py-2 border rounded"
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            className="w-full px-3 py-2 border rounded"
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Phone</label>
          <input
            type="text"
            name="phone"
            value={user.phone}
            className="w-full px-3 py-2 border rounded"
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Group</label>
          <select name="group_id" value={reservation.group_id} onChange={handleInputChange} className="w-full px-3 py-2 border rounded">
            <option value="">Select a group</option>
            {groups && groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Duration</label>
          <select name="duration" value={reservation.duration} onChange={handleInputChange} className="w-full px-3 py-2 border rounded">
            {[...Array(12).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i + 1 === 1 ? "week" : "weeks"}
              </option>
            ))}
            {[...Array(12).keys()].map((i) => (
              <option key={i + 1} value={(i + 1) * 4}>
                {i + 1} {i + 1 === 1 ? "month" : "months"}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Purpose</label>
          <input
            type="text"
            name="purpose"
            value={reservation.purpose}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded">
          Reserve Plot
        </button>
      </form>
    </div>
  );
};

export default PlotReservation;
