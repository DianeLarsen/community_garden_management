import EventCalendar from "@/components/EventCalendar";
import Link from "next/link";

const EventPage = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
              <h2 className="text-xl font-bold">Event Calendar</h2>
              <p>View upcoming gardening events and workshops.</p>
      <div className="flex mb-3">


        <Link
          href="/create-event"
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Create Event
        </Link>
      </div>

      <EventCalendar />
    </div>
  );
};

export default EventPage;
