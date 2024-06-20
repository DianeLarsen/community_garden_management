"use client";
import { useEffect, useState } from "react";

const GroupMembersList = ({ groupId }) => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const response = await fetch(`/api/groups/members?groupId=${groupId}`);
      const data = await response.json();
      setMembers(data);
    };

    fetchMembers();
  }, [groupId]);

  return (
    <div>
      <h2>Group Members</h2>
      <ul>
        {members.map((member) => (
          <li key={member.id}>
            {member.email} ({member.role})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupMembersList;
