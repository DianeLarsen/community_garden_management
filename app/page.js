import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-6">
      <section className="w-full mb-8">
        <Image
          src="https://media.gettyimages.com/id/643644662/photo/managing-their-urban-garden.jpg?s=2048x2048&w=gi&k=20&c=y45cS0KGvlJLCEdp1vB87axuaN0k2Iz991Tl5K2wwpU="
          alt="Community Garden"
          className="w-full h-96 object-cover"
          height="100"
          width="400"
        />
        <h1 className="text-4xl font-bold text-center mt-4">
          Welcome to the Community Garden Management System
        </h1>
        <p className="text-center mt-2">
          Manage garden plots, member registrations, and events efficiently.
        </p>
      </section>

      <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex flex-col items-center">
          <Image
            src="https://media.gettyimages.com/id/1336514990/photo/drone-view-looking-down-onto-an-allotment-garden.jpg?s=2048x2048&w=gi&k=20&c=DRxFAGlGwPcE_-T5F9ZYzJpyIsj0Hay-M8ObBOz29zY="
            alt="Gardening Activities"
            className="w-full h-64 object-cover rounded-lg"
            height="100"
            width="400"
          />
          <h2 className="text-xl font-bold mt-4">Gardening Activities</h2>
          <p className="text-center">
            Join the community in various gardening activities and workshops.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Image
            src="https://media.gettyimages.com/id/185237954/photo/children-holding-community-garden-sign.jpg?s=612x612&w=gi&k=20&c=Fc2QuLFtDZHK0V3pkylQSn9nMdrV8aCdRmX4iB75m48="
            alt="Garden Events"
            className="w-full h-64 object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 33vw"
            height="100"
            width="400"
            
          />
          <h2 className="text-xl font-bold mt-4">Garden Events</h2>
          <p className="text-center">
            Participate in our scheduled events and meetups.
          </p>
        </div>
      </section>

      <section className="w-full flex flex-col items-center mb-8">
        <Image
          src="https://media.gettyimages.com/id/154556360/photo/girl-smells-hortentia-flower-in-garden.jpg?s=612x612&w=gi&k=20&c=3a9sHV8frUr_WvLzWTAcb2s3NihxqkHDcxoGHJdmGNU="
          alt="Beautiful Flowers"
          className="w-full h-64 object-cover rounded-lg"
          height="100"
          width="400"
        />
        <h2 className="text-xl font-bold mt-4">Beautiful Flowers and Plants</h2>
        <p className="text-center">
          Enjoy the beauty of our community garden with a variety of flowers and
          plants.
        </p>
      </section>

      <section className="w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
        <p>
          Become a member today and start enjoying the benefits of our community
          garden.
        </p>
      </section>
    </main>
  );
}
