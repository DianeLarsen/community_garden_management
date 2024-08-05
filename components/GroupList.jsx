"use client";

import { useRouter } from "next/navigation";
import { BasicContext } from "@/context/BasicContext";
import { useState, useEffect, useContext } from "react";

const GroupList = ({groups, error}) => {
  // console.log(groups)
  const router = useRouter();
  const { userGroups } = useContext(BasicContext);
// console.log(userGroups)

  

  // console.log(pathname == "/groups")

  // console.log(userGroups)
  if (error) {
    return <div className="text-red-500 font-bold mt-4">{error}</div>;
  }
// console.log(groups)
  const handleRowClick = (id) => {
    router.push(`/groups/${id}`);
  };

  return (
    <>
      {groups && groups.length > 0 ? (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-md shadow-md mt-6">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2">Name of Group</th>
                <th className="border px-4 py-2">Role</th>
                <th className="border px-4 py-2">Accepting Members</th>
                <th className="border px-4 py-2">Location</th>
                <th className="border px-4 py-2">Number of Members</th>
                <th className="border px-4 py-2">Number of Reserved Plots</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr
                  key={group.id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleRowClick(group.id)}
                >
                  <td className="border px-4 py-2 text-center">{group.name}</td>
                  <td className="border px-4 py-2 text-center">{group.role}</td>
                  <td className="border px-4 py-2 text-center">{group.accepting_members == true ? "Yes" : "No"}</td>
                  <td className="border px-4 py-2 text-center">{group.city || group.location}</td>
                  <td className="border px-4 py-2 text-center">{group.members.length}</td>
                  <td className="border px-4 py-2 text-center">{group.reserved_plots}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (userGroups && userGroups.length > 0 ? (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-md shadow-md mt-6">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2">Name of Group</th>
                <th className="border px-4 py-2">Role</th>
                <th className="border px-4 py-2">Accepting Members</th>
                <th className="border px-4 py-2">Location</th>
                <th className="border px-4 py-2">Number of Members</th>
                <th className="border px-4 py-2">Number of Reserved Plots</th>
              </tr>
            </thead>
            <tbody>
              {userGroups.map((group) => (
                <tr
                  key={group.id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleRowClick(group.id)}
                >
                  <td className="border px-4 py-2 text-center">{group.name}</td>
                  <td className="border px-4 py-2 text-center">{group.role}</td>
                  <td className="border px-4 py-2 text-center">{group.accepting_members == true ? "Yes" : "No"}</td>
                  <td className="border px-4 py-2 text-center">{group.city || group.location}</td>
                  <td className="border px-4 py-2 text-center">{group.members_count}</td>
                  <td className="border px-4 py-2 text-center">{group.reserved_plots}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ):
        (<p>You are not associated with any groups.</p>)
      )}
    </>
  );
};

export default GroupList;
