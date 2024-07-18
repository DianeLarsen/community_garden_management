"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const PlotsList = ({
  user = "",
  message = "",
  gardenId = "",
  groupId = "",
  status = "available",
  userInfo = false
}) => {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlot, setEditingPlot] = useState(null);
  const [editForm, setEditForm] = useState({ length: "", width: "", group_id: "" });


  useEffect(() => {
    const fetchPlots = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/plots?gardenId=${gardenId}&groupId=${groupId}&userId=${user.id}`
        );
        if (!response.ok) {
          throw new Error("Error fetching plots");
        }
        const data = await response.json();
        if (userInfo) {
          const userPlots = data.filter((plot) => plot.user_id === user.id);

          setPlots(userPlots);
          
        } else {
          if (status) {
            const statusPlots = data.filter((plot) => plot.status === status);
            setPlots(statusPlots);
          } else {
            setPlots(data);
          }
     
      }
      setLoading(false);
      } catch (error) {
        console.log(error.message);
      } 
    };
    fetchPlots();
  }, [gardenId, groupId, user.id]);

  const handleRemovePlot = async (plotId) => {
    try {
      const response = await fetch(`/api/plots/${plotId}/remove`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error("Error removing plot reservation");
      }
      setPlots(plots.map(plot => plot.id === plotId ? { ...plot, status: 'available', user_id: null, group_id: null } : plot));
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEditPlot = (plot) => {
    setEditingPlot(plot);
    setEditForm({ length: plot.length, width: plot.width, group_id: plot.group_id });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/plots/${editingPlot.id}/edit`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Error editing plot");
      }
      setPlots(plots.map(plot => plot.id === editingPlot.id ? { ...plot, ...editForm } : plot));
      setEditingPlot(null);
    } catch (error) {
      console.log(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-md shadow-md mt-10">
      {editingPlot && (
        <form onSubmit={handleEditSubmit} className="mb-4 p-4 bg-gray-50 shadow-md rounded">
          <h2 className="text-lg font-bold mb-4">Edit Plot</h2>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Length</label>
            <input
              type="text"
              name="length"
              value={editForm.length}
              onChange={(e) => setEditForm({ ...editForm, length: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Width</label>
            <input
              type="text"
              name="width"
              value={editForm.width}
              onChange={(e) => setEditForm({ ...editForm, width: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Group</label>
            <input
              type="text"
              name="group_id"
              value={editForm.group_id}
              onChange={(e) => setEditForm({ ...editForm, group_id: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded">Save</button>
        </form>
      )}

      {(!plots[0]?.message && plots.length > 0) ? (
        <table className="w-5/6 table-auto border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2">Plot Size(ft.)</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plots && plots.map((plot) => (
              <tr key={plot.id}>
                <td className="border px-4 py-2 text-center">{plot.length}X{plot.width}</td>
                <td className="border px-4 py-2 text-center ml-4">{plot.status}</td>
                <td className="border px-4 py-2 text-center">
                  {plot.status === "available" && (
                    <Link
                      href={`/plots/${plot.id}`}
                      className="text-blue-600 ml-4"
                    >
                      Reserve
                    </Link>
                  )}
                  {(plot.user_id === user.id || user?.role === "admin" || (user.groups && user.groups.includes(plot.group_id))) && (
                    <button
                      onClick={() => handleRemovePlot(plot.id)}
                      className="text-red-600 ml-4"
                    >
                      Remove
                    </button>
                  )}
                  {user?.role === "admin" && (
                    <>
                      <button
                        onClick={() => handleEditPlot(plot)}
                        className="text-green-600 ml-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePlot(plot.id)}
                        className="text-red-600 ml-4"
                      >
                        Delete
                      </button>
                    </>
                  )}
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
