"use client"
import GroupDetails from '@/components/GroupDetails';
import { useParams } from 'next/navigation';
import { useState, useEffect, useContext } from 'react';
import { BasicContext } from "@/context/BasicContext";

const GroupPage = () => {
    const {
        user,
        showBanner,
        isAdmin
      } = useContext(BasicContext);
  const { id } = useParams();



  return (
    <div>
      {id && user && <GroupDetails groupId={id} user={user} />}
    </div>
  );
};

export default GroupPage;
