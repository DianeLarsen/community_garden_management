"use client";
import { useState, useEffect, useContext  } from "react";
import { BasicContext } from "@/context/BasicContext";
import GroupList from "./GroupList";

const FindGroups = ({userInfo = false}) => {
    const {
        user,
        
      } = useContext(BasicContext);

const [searchTerm, setSearchTerm] = useState("");
const [error, setError] = useState("");
const [message, setMessage] = useState("");
const [limit, setLimit] = useState(10);
const [groups, setGroups] = useState([]);

const fetchGroups = async (e) => {
    e.preventDefault()
    try {
    
      let url = `/api/groups?searchTerm=${searchTerm}&userInfo=${userInfo}&limit=${limit}`;


      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setGroups(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch groups.');
    }
  };



  return (
    <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">Find a Community Garden Group</h1>
    {error && <p className="text-red-500">{error}</p>}
    {message && <p className="text-yellow-500">{message}</p>}
    <form onSubmit={fetchGroups} className="mb-4">
      <div className="flex items-center justify-center gap-12">
        <div className="flex flex-col w-96">
          <label className="mb-1">Search Term:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter Zip Code, Address, or City"
            className="border p-2 rounded"
            required
          />
        </div>
        <div className="flex flex-col w-28">
          <label className="mb-1">Limit:</label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="Limit"
            className="border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded mt-4"
        >
          Search
        </button>
      </div>
    </form>

        <GroupList groups={groups} error={error}/>
  </div>
  )
}

export default FindGroups
