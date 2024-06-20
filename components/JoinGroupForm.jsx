"use client";
import { useState } from "react";

const JoinGroupForm = ({ userId }) => {
  const [groupId, setGroupId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/groups/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, groupId }),
    });
    const data = await response.json();
    setMessage(data.message || data.error);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
        placeholder="Group ID"
        required
      />
      <button type="submit">Join Group</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default JoinGroupForm;
