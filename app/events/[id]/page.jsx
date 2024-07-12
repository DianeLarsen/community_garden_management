import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const EventDetails = ({ user, eventId }) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();
        setEvent(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [eventId]);

  const handleRequestInvite = async () => {
    // Implement request invite logic
  };

  const handleAcceptInvite = async () => {
    // Implement accept invite logic
  };

  const handleLeaveEvent = async () => {
    // Implement leave event logic
  };

  const handleDeleteEvent = async () => {
    const reason = prompt('Please provide a reason for deleting this event:');
    if (reason) {
      // Implement delete event logic with reason
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {event && (
        <>
          <h1>{event.name}</h1>
          <p>{event.description}</p>
          <p>{new Date(event.date).toLocaleDateString()}</p>
          <p>Location: {event.location}</p>
          {/* Implement buttons for request invite, accept invite, leave, edit, delete */}
        </>
      )}
    </div>
  );
};

export default EventDetails;
