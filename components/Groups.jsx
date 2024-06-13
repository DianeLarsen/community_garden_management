"use client"
import { useEffect, useState } from 'react'

const Groups = () => {
  const [groups, setGroups] = useState([])

  useEffect(() => {
    // Fetch groups data from your backend or an API
    fetch('/api/groups')
      .then(response => response.json())
      .then(data => setGroups(data))
  }, [])

  return (
    <div>
      <h2 className="text-xl font-bold">My Groups</h2>
      <ul>
        {groups.map((group, index) => (
          <li key={index} className="border p-2 my-2">
            <h3 className="text-lg font-semibold">{group.name}</h3>
            <p>{group.description}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Groups
