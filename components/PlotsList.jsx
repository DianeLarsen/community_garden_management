"use client";
import { useState, useEffect } from "react";
import Link from "next/link";



const PlotsList = ({
  user = "",
  message = "",
  gardenId = "",
  groupId = "",
}) => {
  const [plots, setPlots] = useState([]);
  const [userInfo, setUserInfo] = useState(false);

  useEffect(() => {
    if (user.id) {
      setUserInfo(true);
    } else {
      setUserInfo(false);
    }
  }, [user]);
console.log(user)
  useEffect(() => {
    const fetchPlots = async () => {
      try {
        const response = await fetch(
          `/api/plots?gardenId=${gardenId}&groupId=${groupId}&userInfo=${userInfo}`
        );
        if (!response.ok) {
          throw new Error("Error fetching plots");
        }
        const data = await response.json();

        // console.log(data)
        if (userInfo && data.length > 0) {
          const userPlots = data.filter((plot) => plot.user_id === user.id);
          console.log(userPlots)
          setPlots(userPlots.length > 0 ? [...data] : [data]);
        } else {
          setPlots(data.length > 0 ? [...data] : [data]);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchPlots();
  }, [gardenId, groupId, userInfo]);
  const handleDeletePlot = async (plotId) => {
    try {
      const response = await fetch(`/api/gardens/${id}/plots/${plotId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error deleting plot");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="p-6">
        {(!plots[0]?.message && plots.length) > 0 ? (
            <table className="w-5/6 table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Plot Size(ft.)</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">Link to Garden</th>
                </tr>
              </thead>
              <tbody>
                {plots.map((plot) => ( plot.status == "available" &&
                  <tr key={plot.id}>
                    <td className="border px-4 py-2 text-center">{plot.length}X{plot.width}</td>
                    <td className="border px-4 py-2 text-center">{plot.status} {plot.status === "available" && (
                <Link
                  href={`/plots/reserve/${plot.id}`}
                  className="text-blue-600 ml-4"
                >
                  Reserve
                </Link>
                
              )}              {user?.role == "admin" && (
                <button
                  onClick={() => handleDeletePlot(plot.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              )}</td>
                    <td className="border px-4 py-2 text-center">
                      <Link href={`/gardens/${gardenId}`}>
                        View Garden
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>{message}</div>
          )}




    </div>
  );
};

export default PlotsList;
      // <ul className="list-none p-0">
        
      //   {plots[0]?.message || plots.length === 0 ? (
      //     <p>{message}</p>
      //   ) : (
      //     plots.map((plot) => (
      //       <li
      //         key={plot.id}
      //         className="mb-2 flex justify-between items-center"
      //       >
      //         <div>
      //           <p>Size: {plot.length}X{plot.width}</p>
      //           <p>Status: {plot.status}</p>
      //           <p>User ID: {plot.user_id}</p>
      //         </div>


      //       </li>
      //     ))
      //   )}
      // </ul>