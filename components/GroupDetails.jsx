import { useState, useEffect } from 'react';
import Link from 'next/link';


const GroupDetails = ({ groupId, user }) => {
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [plots, setPlots] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);


  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const groupResponse = await fetch(`/api/groups/${groupId}`);
        if (!groupResponse.ok) {
          throw new Error("Error fetching group details");
        }
        const groupData = await groupResponse.json();
        setGroup(groupData.group);
        setMembers(groupData.members);
        setEvents(groupData.events);
        setPlots(groupData.plots);
        setIsMember(groupData.isMember);
        setIsAdmin(groupData.isAdmin);
        setIsPending(groupData.isPending);
        setLoading(false);
      } catch (error) {
        console.error(error.message);
        setLoading(false);
      }
    };
    fetchGroupDetails();
  }, [groupId]);

  const handleRequestMembership = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error('Error requesting membership');
      }
      window.location.reload()
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        throw new Error('Error removing member');
      }
      setMembers(members.filter((member) => member.id !== memberId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInviteMember = async () => {
    // Implement invite member functionality
  };

  const handleChangeRole = async (memberId, newRole) => {

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'changeRole', memberId, role: newRole }),
      });
  
      if (!response.ok) {
        throw new Error('Error changing role');
      }
  
      setMembers(members.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      ));
      window.location.reload()
    } catch (error) {
      console.error('Error:', error);
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
          <p>Accepting Members: {group.accepting_members ? 'Yes' : 'No'}</p>

          {!isMember && group.accepting_members && !isPending && (
            <button
              onClick={handleRequestMembership}
              className="bg-blue-500 text-white p-2 rounded mt-4"
            >
              Request Membership
            </button>
          )}

          {isPending && <p className="text-red-500">Awaiting verification by admin.</p>}

          {(isAdmin || (isMember && !isPending)) && (
            <>
              <h2 className="text-xl font-bold mt-4 mb-2">Plots Reserved</h2>
              <ul>
                {plots.map((plot) => (
                  <li key={plot.id}>
                    <Link href={`/plots/${plot.id}`}>Plot {plot.id}</Link> - {plot.length} x {plot.width}
                  </li>
                ))}
              </ul>

              <h2 className="text-xl font-bold mt-4 mb-2">Events</h2>
              <ul>
                {events.map((event) => (
                  <li key={event.id}>
                    {event.name} - {new Date(event.date).toLocaleDateString()}
                  </li>
                ))}
              </ul>

              <h2 className="text-xl font-bold mt-4 mb-2">Members</h2>
              <ul>
                {members.map((member) => (
                  <li key={member.user_id}>
                    {member.username} {isAdmin && `(${member.email})`}
                    {isAdmin  && (
                      <>
                        <select
                          value={member.role}
                          onChange={(e) => handleChangeRole(member.user_id, e.target.value)}
                          className="ml-2"
                        >
                          <option value="new">New</option>
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button onClick={() => handleRemoveMember(member.id)} className="text-red-600 ml-4">
                          Remove
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              {isAdmin && (
                <button onClick={handleInviteMember} className="bg-blue-500 text-white p-2 rounded mt-4">
                  Invite Member
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default GroupDetails;
