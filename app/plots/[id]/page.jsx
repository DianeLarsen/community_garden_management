"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import PlotReservation from "@/components/PlotReservation";
import { BasicContext } from "@/context/BasicContext";

const PlotDetails = () => {
  const { id } = useParams();
  const [plot, setPlot] = useState(null);
  const [garden, setGarden] = useState(null);
  const [history, setHistory] = useState([]);
  // const [groups, setGroups] = useState([]);

  const {
    user,
    showBanner,
    isAdmin,
    userGroups
  } = useContext(BasicContext);


  const [error, setError] = useState("");
  const [banner, setBanner] = useState({ message: "", type: "" });
  useEffect(() => {
    const fetchPlotDetails = async () => {
      try {
        const response = await fetch(`/api/plots/${id}`);
        if (!response.ok) {
          throw new Error("Error fetching plot details");
        }
        const data = await response.json();
        setPlot(data.plot);
        setGarden(data.garden);
        setHistory(data.history);


        // setGroups(data.groups);
      } catch (error) {
        setError(error.message);
      }
    };

    if (id) {
      fetchPlotDetails();
    }

  }, [id]);

  const handleReservePlot = async (reservationData) => {
    try {
      const response = await fetch(`/api/plots/${id}/reserve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        throw new Error("Error reserving plot");
      }

      const data = await response.json();
      setPlot(data.plot);
    } catch (error) {
      setError(error.message);
    }
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!plot || !garden) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 p-4 bg-white shadow-md rounded">
      {banner.message && (
        <div
          className={`${
            banner.type === "error" ? "bg-red-500" : "bg-green-500"
          } text-white text-center top-[%9%]`}
        >
          {banner.message}{" "}
          <button
            onClick={() => setBanner({ message: "", type: "" })}
            className="ml-4"
          >
            ×
          </button>
        </div>
      )}
        <h1 className="text-2xl font-bold mb-4">Plot Details</h1>
        <p><strong>Size:</strong> {plot.length}X{plot.width}</p>
        <p><strong>Status:</strong> {plot.status}</p>
        {plot.reserved_by && (
          <p><strong>Reserved By:</strong> {plot.reserved_by}</p>
        )}
        <Link href={`/gardens/${garden.id}`} className="text-blue-500 underline">
          View Garden Details
        </Link>
      </div>

      {isAdmin && (
        <div className="mb-6 p-4 bg-white shadow-md rounded">
          <h2 className="text-xl font-bold mb-4">Plot History</h2>
          <ul>
            {history.map((event, index) => (
              <li key={index}>
                <p>{event.detail}</p>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {plot.status === "available" && (
        <PlotReservation
          plot={plot}
          user={user}
          groups={userGroups}
          handleReservePlot={handleReservePlot}
          showBanner={showBanner}
        />
      )}
    </div>
  );
};

export default PlotDetails;
