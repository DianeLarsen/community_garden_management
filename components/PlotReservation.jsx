import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PlotReservation = ({ plot, user, groups, handleReservePlot, showBanner, editMode = false }) => {
  const [reservedAt, setReservedAt] = useState(editMode ? new Date(plot.reserved_at) : null);
  const [duration, setDuration] = useState(editMode ? ((new Date(plot.reserved_until) - new Date(plot.reserved_at)) / (7 * 24 * 60 * 60 * 1000)) : 1);
  const [purpose, setPurpose] = useState(editMode ? plot.purpose : "");
  const [groupId, setGroupId] = useState(editMode ? plot.group_id : "");

  const [reservedDates, setReservedDates] = useState([]);

  useEffect(() => {
    const fetchReservedDates = async () => {
      try {
        const response = await fetch(`/api/plots/${plot.id}/reserved-dates`);
        const data = await response.json();
        setReservedDates(data.reservedDates);
      } catch (error) {
        console.error("Error fetching reserved dates:", error);
      }
    };

    fetchReservedDates();
  }, [plot.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const reservedUntil = new Date(reservedAt);
    reservedUntil.setDate(reservedUntil.getDate() + duration * 7);

    const reservationData = {
      reserved_at: reservedAt,
      reserved_until: reservedUntil,
      purpose,
      group_id: groupId
    };

    await handleReservePlot(reservationData);
  };

  const isWeekReserved = (start) => {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return reservedDates.some(reservedDate => {
      const reservedStart = new Date(reservedDate.start_date);
      const reservedEnd = new Date(reservedDate.end_date);
      return (
        (start >= reservedStart && start <= reservedEnd) ||
        (end >= reservedStart && end <= reservedEnd) ||
        (start <= reservedStart && end >= reservedEnd)
      );
    });
  };

  const filterWeek = (date) => {
    // Ensure the date is a Monday
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - day + (day === 0 ? -6 : 1));

    return !isWeekReserved(monday);
  };

  const highlightWithRanges = [
    {
      "react-datepicker__day--highlighted-custom-1": reservedDates.map(date => ({
        start: new Date(date.start_date),
        end: new Date(date.end_date)
      }))
    }
  ];

  return (
    <div className="p-4 bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">{editMode ? "Edit Reservation" : "Reserve Plot"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <DatePicker
            selected={reservedAt}
            onChange={date => setReservedAt(date)}
            filterDate={filterWeek}
            highlightDates={highlightWithRanges}
            dateFormat="MMMM d, yyyy"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1} week(s)</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Purpose</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Group</label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Group</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            {editMode ? "Update Reservation" : "Reserve Plot"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlotReservation;
