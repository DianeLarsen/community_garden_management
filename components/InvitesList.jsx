"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BasicContext } from "@/context/BasicContext";
import { useState, useEffect, useContext } from "react";

const InvitesList = () => {
  const router = useRouter();
  const { userInvites } = useContext(BasicContext);
  const thisParams = useParams()
console.log(thisParams)

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-md shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Invites</h2>
      {userInvites.length > 0 ? (
        <ul className="list-disc pl-5">
          {userInvites.map((invite) => (
            <li key={invite.id} className="text-gray-700 mb-2">
              <Link
                href={`/groups/${invite.group_id}`}
                className="text-blue-500 hover:underline"
              >
                {invite.name}
              </Link>{" "}
              - {invite.status}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No events found</p>
      )}
    </div>
  );
};

export default InvitesList;
