import { useState, useEffect, useContext } from "react";
import { BasicContext } from "@/context/BasicContext";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

const GroupDetails = () => {
  const { id } = useParams();
  const { user, token } = useContext(BasicContext);
  const [group, setGroup] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [plots, setPlots] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminUsername, setAdminUsername] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  const isPending =
    invitations.length > 0 &&
    invitations.some(
      (invite) =>
        invite.user_id === user.id &&
        (invite.status === "pending" || invite.status === "invited")
    );

  const isMember = members.some((member) => member.user_id === user.id);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const groupResponse = await fetch(`/api/groups/${id}`);
        if (!groupResponse.ok) {
          throw new Error("Error fetching group details");
        }
        const groupData = await groupResponse.json();
        setGroup(groupData.group);
        setMembers(groupData.members);
        setEvents(groupData.events);
        setPlots(groupData.plots);
        setInvitations(groupData.invitations || []);
        setIsAdmin(
          groupData.group.admin.username == user.username || groupData.isAdmin
        );

        setAdminUsername(groupData.group.admin.username);
        setLoading(false);
      } catch (error) {
        console.error(error.message);
        setLoading(false);
      }
    };
    fetchGroupDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch("/api/users", {
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

    if (isAdmin) {
      fetchAllUsers();
    }
  }, [isAdmin, token]);

  const handleRequestMembership = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/groups/${id}/request-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error requesting membership");
      }

      const inviteData = await response.json();
      setInvitations((prevInvitations) => [...prevInvitations, inviteData]);
      alert("Request Sent, awaiting approval!");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    console.log(memberId);
    try {
      const response = await fetch(`/api/groups/${id}/remove-user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        throw new Error("Error removing member");
      }
      alert(data.message);
      setMembers(members.filter((member) => member.id !== memberId));
      window.location.reload();
    } catch (err) {
      console.error("Error:", err.error);
    }
  };

  const handleInviteMember = async () => {
    try {
      const response = await fetch(`/api/groups/${id}/invite-user`, {
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

  const handleChangeRole = async (memberId, newRole) => {
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "changeRole", memberId, role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Error changing role");
      }

      setMembers(
        members.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAcceptInvite = async () => {
    try {
      const response = await fetch(`/api/groups/${id}/accept-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        alert("Invite accepted!");
        setMembers([
          ...members,
          {
            user_id: user.id,
            username: user.username,
            email: user.email,
            role: "member",
          },
        ]);
      } else {
        alert("Failed to accept invite.");
      }
    } catch (error) {
      console.error("Error accepting invite:", error);
    }
  };

  const handleCancelInvite = async () => {
    try {
      const response = await fetch(`/api/groups/${id}/cancel-invite`, {
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

  const handleApproveInvite = async (
    inviteId,
    inviteUserId,
    inviteUsername
  ) => {
    try {
      const response = await fetch(`/api/groups/${id}/approve-invite`, {
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
        setMembers([
          ...members,
          {
            user_id: inviteUserId,
            username: inviteUsername,
            email: user.email,
            role: "member",
          },
        ]);
        window.location.reload();
      } else {
        alert("Failed to approve invite.");
      }
    } catch (error) {
      console.error("Error approving invite:", error);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${id}/remove-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        alert("You have left the event.");
        setMembers(members.filter((attendee) => attendee.user_id !== user.id));
        router.push("/groups");
      } else {
        alert("Failed to leave the group.");
      }
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {group && (
        <>
          <h1 className="text-2xl font-bold mb-4">{group.name}</h1>
          <p>{group.description}</p>
          <p>Location: {group.location}</p>
          <p>Accepting Members: {group.accepting_members ? "Yes" : "No"}</p>
          <p>Group Admin: {adminUsername}</p>

          {!isMember && group.accepting_members && !isPending && (
            <button
              onClick={handleRequestMembership}
              className="bg-blue-500 text-white p-2 rounded mt-4"
            >
              Request Membership
            </button>
          )}

          {isPending && (
            <>
              <p className="text-red-500">Awaiting verification by admin.</p>
              <button
                onClick={handleCancelInvite}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
              >
                Cancel Invite Request
              </button>
            </>
          )}

          {(isAdmin || (isMember && !isPending)) && (
            <>
              <h2 className="text-xl font-bold mt-4 mb-2">Plots Reserved</h2>
              <ul>
                {plots.map((plot) => (
                  <li key={plot.id}>
                    <Link
                      href={`/plots/${plot.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      Plot {plot.id}
                    </Link>{" "}
                    - {plot.length} x {plot.width}
                  </li>
                ))}
              </ul>

              <h2 className="text-xl font-bold mt-4 mb-2">Events</h2>
              <ul>
                {events.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/events/${event.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      {event.name} -{" "}
                      {new Date(event.start_date).toLocaleString()} to{" "}
                      {new Date(event.end_date).toLocaleString()}
                    </Link>
                  </li>
                ))}
              </ul>

              <h2 className="text-xl font-bold mt-4 mb-2">Members</h2>
              <ul>
                {members.map((member) => (
                  <li key={member.user_id}>
                    {member.username} {isAdmin && `(${member.email})`}
                    {isAdmin && (
                      <>
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleChangeRole(member.user_id, e.target.value)
                          }
                          className="ml-2"
                        >
                          <option value="new">New</option>
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleRemoveMember(member.user_id)}
                          className="text-red-600 ml-4"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              {isAdmin && (
                <>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                  >
                    Invite Member
                  </button>
                  <Link
                    href={`/groups/${id}/admin`}
                    className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 ml-4"
                  >
                    Group Admin
                  </Link>
                </>
              )}

              {error && <p className="mt-4 text-red-600">{error}</p>}
              {message && <p className="mt-4 text-green-600">{message}</p>}

              {isAdmin && (
                <>
                  <h2 className="text-xl font-bold mt-4 mb-2">Invitations</h2>
                  <ul className="list-disc pl-5">
                    {invitations.length > 0 ? (
                      invitations.map((invite) => (
                        <li
                          key={invite.invite_id}
                          className="text-gray-700 flex items-center"
                        >
                          {invite.username} - {invite.status}
                          {invite.status === "pending" && (
                            <button
                              onClick={() =>
                                handleApproveInvite(
                                  invite.invite_id,
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
                onClick={handleInviteMember}
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
                onClick={handleInviteMember}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                Invite Selected User
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
