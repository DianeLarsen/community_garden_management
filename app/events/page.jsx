import EventCalendar from "@/components/EventCalendar";
import EventSearch from "@/components/EventSearch";

const EventPage = () => {
  return (
    <div>
      <h2 className="text-xl font-bold">Event Search</h2>
      <p>Search for events.</p>
      <EventSearch />
      <h2 className="text-xl font-bold">Event Calendar</h2>
      <p>View upcoming gardening events and workshops.</p>
      <EventCalendar />
    </div>
  );
};

export default EventPage;
