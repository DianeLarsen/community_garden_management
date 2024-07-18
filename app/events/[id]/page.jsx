"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import { BasicContext } from "@/context/BasicContext";

const EventDetails = () => {
  const { id } = useParams();
  const { user, groups, token } = useContext(BasicContext);
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const router = useRouter();
  const isInvited = invitations.some(
    (invite) => invite.user_id === user.id && invite.status === "invited"
  );
  const isPending = invitations.some(
    (invite) => invite.user_id === user.id && invite.status === "pending"
  );
  const isAttending = attendees.some(
    (attendee) => attendee.user_id === user.id
  );
  const isAdmin = user.role === "admin";
  const isGroupAdmin = event?.group_admins?.includes(user.id);
  const isOrganizer = event?.user_id === user.id;
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/events/${id}`);
        const data = await response.json();
        setEvent(data.event || {});
        setAttendees(data.attendees || []);
        setInvitations(data.invitations || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching event details:", error);
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [id]);
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch('/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setAllUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching all users:", error);
      }
    };
  
    if (isAdmin || isGroupAdmin || isOrganizer) {
      fetchAllUsers();
    }
  }, [isAdmin, isGroupAdmin, isOrganizer, token]);


  const handleAcceptInvite = async () => {
    try {
      const response = await fetch(`/api/events/${id}/accept-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        alert("Invite accepted!");
        setAttendees([
          ...attendees,
          { user_id: user.id, username: user.username },
        ]);
      } else {
        alert("Failed to accept invite.");
      }
    } catch (error) {
      console.error("Error accepting invite:", error);
    }
  };

  const handleRequestInvite = async () => {
    try {
      const response = await fetch(`/api/events/${id}/request-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        alert("Invite request sent!");
        setInvitations([
          ...invitations,
          { user_id: user.id, username: user.username, status: "pending" },
        ]);
      } else {
        alert("Failed to send invite request.");
      }
    } catch (error) {
      console.error("Error requesting invite:", error);
    }
  };

  const handleApproveInvite = async (
    inviteId,
    inviteUserId,
    inviteUsername
  ) => {
    console.log(inviteId)
    try {
      const response = await fetch(`/api/events/${id}/approve-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteId, inviteUserId }),
      });
      if (response.ok) {
        alert("Invite approved!");
        setInvitations(invitations.filter((invite) => invite.id !== inviteId));
        setAttendees([
          ...attendees,
          { user_id: inviteUserId, username: inviteUsername },
        ]);
      } else {
        alert("Failed to approve invite.");
      }
    } catch (error) {
      console.error("Error approving invite:", error);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      const response = await fetch(`/api/events/${id}/remove-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        alert("User removed.");
        setAttendees(
          attendees.filter((attendee) => attendee.user_id !== userId)
        );
      } else {
        alert("Failed to remove user.");
      }
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  const handleLeaveEvent = async () => {
    try {
      const response = await fetch(`/api/events/${id}/remove-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        alert("You have left the event.");
        setAttendees(
          attendees.filter((attendee) => attendee.user_id !== user.id)
        );
        router.push("/events");
      } else {
        alert("Failed to leave the event.");
      }
    } catch (error) {
      console.error("Error leaving event:", error);
    }
  };

  const handleCancelInvite = async () => {
    try {
      const response = await fetch(`/api/events/${id}/cancel-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        alert("Invite cancelled!");
        setInvitations(
          invitations.filter((invite) => invite.user_id !== user.id)
        );
      } else {
        alert("Failed to cancel invite.");
      }
    } catch (error) {
      console.error("Error cancelling invite:", error);
    }
  };

  const handleDeleteEvent = async () => {
    const reason = prompt("Please provide a reason for deleting this event:");
    if (reason) {
      try {
        const response = await fetch(`/api/events/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        });
        if (response.ok) {
          alert("Event deleted.");
          router.push("/events");
        } else {
          alert("Failed to delete event.");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const handleInviteUser = async () => {
    try {
      const response = await fetch(`/api/events/${id}/invite-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (response.ok) {
        alert("User invited!");
        setShowInviteModal(false);
        setInviteEmail("");
      } else {
        alert("Failed to invite user.");
      }
    } catch (error) {
      console.error("Error inviting user:", error);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

    return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-md shadow-md mt-10">
      {event && (
        <>
          <h1 className="text-2xl font-bold mb-4">{event.name}</h1>
          <p className="text-gray-700 mb-4">{event.description}</p>
          <p className="text-gray-600 mb-4">
            {new Date(event.date).toLocaleDateString()}
          </p>
          <p className="text-gray-600 mb-4">Garden: {event.garden_name}</p>
          <p className="text-gray-600 mb-4">Plot: {event.plot_name}</p>
          <p className="text-gray-600 mb-4">Organizer: {event.organizer}</p>
          <div className="flex space-x-4 mb-4">
            {!isAttending && !isInvited && !isPending && (
              <button
                onClick={handleRequestInvite}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                Request Invite
              </button>
            )}
            {isPending && (
              <>
                <p className="text-yellow-500 py-2 px-4 rounded-md">
                  Invite Pending
                </p>
                <button
                  onClick={handleCancelInvite}
                  className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                >
                  Cancel Invite Request
                </button>
              </>
            )}
            {isInvited && !isAttending && (
              <button
                onClick={handleAcceptInvite}
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
              >
                Accept Invite
              </button>
            )}
            {isAttending && (
              <button
                onClick={handleLeaveEvent}
                className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600"
              >
                Leave Event
              </button>
            )}
            {(isAdmin || isGroupAdmin || isOrganizer) && (
              <button
                onClick={handleDeleteEvent}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
              >
                Delete Event
              </button>
            )}
            {(isAdmin || isGroupAdmin || isOrganizer) && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                Invite User
              </button>
            )}
          </div>
          <h2 className="text-xl font-bold mb-2">Attendees</h2>
          <ul className="list-disc pl-5">
            {attendees.length > 0 ? (
              attendees.map((attendee) => (
                <li
                  key={attendee.user_id}
                  className="text-gray-700 flex items-center"
                >
                  {attendee.username}
                  {(isAdmin || isGroupAdmin || isOrganizer) && (
                    <>
                      <span className="ml-2 text-green-500">&#10003;</span>
                      <button
                        onClick={() => handleRemoveUser(attendee.user_id)}
                        className="ml-2 bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600"
                      >
                        X
                      </button>
                    </>
                  )}
                </li>
              ))
            ) : (
              <p className="text-gray-500">No attendees</p>
            )}
          </ul>
          {(isAdmin || isGroupAdmin || isOrganizer) && (
            <>
              <h2 className="text-xl font-bold mt-4 mb-2">Invitations</h2>
              <ul className="list-disc pl-5">
                {invitations.length > 0 ? (
                  invitations.map((invite) => (
                    <li
                      key={invite.id}
                      className="text-gray-700 flex items-center"
                    >
                      {invite.username} - {invite.status}
                      {invite.status === "pending" && (
                        <button
                          onClick={() =>
                            handleApproveInvite(
                              invite.id,
                              invite.user_id,
                              invite.username
                            )
                          }
                          className="ml-4 bg-green-500 text-white py-1 px-2 rounded-md hover:bg-green-600"
                        >
                          Approve
                        </button>
                      )}
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500">No invitations</p>
                )}
              </ul>
            </>
          )}
        </>
      )}
      {showInviteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-md">
              <h2 className="text-xl font-bold mb-4">Invite User</h2>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleInviteUser}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Send Invite
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
              <h3 className="text-lg font-bold mt-4">Invite Existing User</h3>
              <select
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
              >
                <option value="">Select User</option>
                {allUsers.map((user) => (
                  <option key={user.id} value={user.email}>
                    {user.username} ({user.email})
                  </option>
                ))}
              </select>
              <div className="flex space-x-4">
                <button
                  onClick={handleInviteUser}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Invite Selected User
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default EventDetails;
