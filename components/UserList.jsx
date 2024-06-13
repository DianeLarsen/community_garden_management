"use client"
import { useState, useEffect } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/community-garden/users');
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Network response was not ok: ${text}`);
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setError(error.message);
      }
    }

    fetchUsers();
  }, []);

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`/api/community-garden/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        alert('User deleted successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the user');
    }
  };

  return (
    <div>
      <h1>User List</h1>
      {error ? <p>Error: {error}</p> : (
        <ul>
          {users.map(user => (
            <li key={user.id}>
              {user.name} - {user.email} ({user.role})
              <button onClick={() => deleteUser(user.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;
