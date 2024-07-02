// pages/about.jsx
export default function About() {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">About Us</h1>
        <p className="mb-4">
          Welcome to the Community Garden Management System, proudly developed by PandaLove LLC. Our mission is to foster community engagement and promote sustainable gardening practices through an intuitive and efficient platform.
        </p>
        <p className="mb-4">
          Our system allows users to easily manage garden plots, join groups, and participate in community events. We aim to provide a comprehensive solution for all your community gardening needs.
        </p>
        <h2 className="text-xl font-bold mb-4">Contact Us</h2>
        <p className="mb-4">
          If you have any questions or need assistance, please feel free to reach out to us:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Email: <a href="mailto:support@gardensystem.com" className="text-blue-600">support@gardensystem.com</a></li>
          <li>Phone: (123) 456-7890</li>
          <li>Address: 123 Garden Lane, Green City, WA 12345</li>
        </ul>
        <p className="mb-4">
          Thank you for being a part of our community!
        </p>
        <p className="text-sm text-gray-500">
          © 2024 PandaLove LLC. All rights reserved.
        </p>
      </div>
    );
  }
  