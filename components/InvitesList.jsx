"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BasicContext } from "@/context/BasicContext";
import { useState, useEffect, useContext } from "react";

const InvitesList = () => {
  const { userInvites, allInvites } = useContext(BasicContext);
  const [invites, setInvites] = useState([]);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/profile") {
      setInvites(userInvites);
    } else {
      setInvites(allInvites);
    }
  }, [pathname, userInvites, allInvites]);

  const groupInvites = invites.filter((invite) => invite.type === "group");
  const eventInvites = invites.filter((invite) => invite.type === "event");

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-md shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Invites</h2>

      {groupInvites.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mb-2">Group Invites</h3>
          <ul className="list-disc pl-5 mb-4">
            {groupInvites.map((invite) => (
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
        </>
      )}

      {eventInvites.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mb-2">Event Invites</h3>
          <ul className="list-disc pl-5 mb-4">
            {eventInvites.map((invite) => (
              <li key={invite.id} className="text-gray-700 mb-2">
                <Link
                  href={`/events/${invite.event_id}`}
                  className="text-blue-500 hover:underline"
                >
                  {invite.name}
                </Link>{" "}
                - {invite.status}
              </li>
            ))}
          </ul>
        </>
      )}

      {invites.length === 0 && (
        <p className="text-gray-500">No invites found</p>
      )}
    </div>
  );
};

export default InvitesList;
