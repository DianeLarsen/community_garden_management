"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  const handleAcceptInvite = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/accept-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        alert('Invite accepted!');
      } else {
        alert('Failed to accept invite.');
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
    }
  };
  

  const handleRequestInvite = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/request-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        alert('Invite request sent!');
      } else {
        alert('Failed to send invite request.');
      }
    } catch (error) {
      console.error('Error requesting invite:', error);
    }
  };
  

  const handleLeaveEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        alert('You have left the event.');
        router.push('/events');
      } else {
        alert('Failed to leave the event.');
      }
    } catch (error) {
      console.error('Error leaving event:', error);
    }
  };
  

  const handleDeleteEvent = async () => {
    const reason = prompt('Please provide a reason for deleting this event:');
    if (reason) {
      try {
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ reason }),
        });
        if (response.ok) {
          alert('Event deleted.');
          router.push('/events');
        } else {
          alert('Failed to delete event.');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
      }
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
          <button onClick={handleRequestInvite}>Request Invite</button>
          <button onClick={handleAcceptInvite}>Accept Invite</button>
          <button onClick={handleLeaveEvent}>Leave Event</button>
          <button onClick={handleDeleteEvent}>Delete Event</button>
        </>
      )}
    </div>
  );
  
};

export default EventDetails;
