"use client";

import { useRouter } from "next/navigation";

const GroupList = ({ error, groups }) => {
  const router = useRouter();


  if (error) {
    return <div className="text-red-500 font-bold mt-4">{error}</div>;
  }

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
                  <td className="border px-4 py-2 text-center">{group.accepting_members ? "Yes" : "No"}</td>
                  <td className="border px-4 py-2 text-center">{group.city || group.location}</td>
                  <td className="border px-4 py-2 text-center">{group.members_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>You are not associated with any groups.</p>
      )}
    </>
  );
};

export default GroupList;
