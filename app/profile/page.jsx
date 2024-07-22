import ProfileDetails from "@/components/ProfileDetails";
import PlotsList from "@/components/PlotsList";
import GroupList from "@/components/GroupList";
import EventsList from "@/components/EventsList";
import InvitesList from "@/components/InvitesList";

const Profile = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-4xl">
        <ProfileDetails />
        <div className="mt-8">
          <h2 className="text-2xl mb-4">Your Plots</h2>
          <PlotsList userInfo={true} />
        </div>
        <div className="mt-8">
          <h2 className="text-2xl mb-4">Your Groups</h2>
          <GroupList />
        </div>
        <div className="mt-8">
          <h2 className="text-2xl mb-4">Your Events</h2>
          <EventsList />
        </div>
        <div className="mt-8">
          <h2 className="text-2xl mb-4">Your Invites</h2>
          <InvitesList />
        </div>
      </div>
    </div>
  );
};

export default Profile;
