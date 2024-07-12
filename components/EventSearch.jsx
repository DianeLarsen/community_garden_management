"use client"
import { useState, useEffect, useContext  } from "react";
import { BasicContext } from "@/context/BasicContext";

const EventSearch = () => {
    const {
        garden,
        group,
        location,
        handleEventSearch,
        events
      } = useContext(BasicContext);

  return (
    <div>
            <div>
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="text"
          placeholder="Garden"
          value={garden}
          onChange={(e) => setGarden(e.target.value)}
        />
        <input
          type="text"
          placeholder="Group"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        />
        <button onClick={handleEventSearch}>Search</button>
      </div>
    </div>
  )
}

export default EventSearch
