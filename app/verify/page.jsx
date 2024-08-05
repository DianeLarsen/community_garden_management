"use client";
import { useSearchParams } from "next/navigation";
import Login from "@/components/Login";

const VerifyPage = () => {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const email = searchParams.get("email");

  const requestNewVerificationEmail = async () => {
    try {
      const response = await fetch('/api/request-new-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email }) // assuming you have the user's email
      });

      if (response.ok) {
        alert('A new verification email has been sent.');
      } else {
        alert('Failed to send a new verification email.');
      }
    } catch (error) {
      console.error('Error requesting new verification email:', error);
      alert('An error occurred. Please try again.');
    }
  };

  if (status === "already_verified") {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-md shadow-md mt-10 flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-4">Already Verified</h1>
        <p className="text-gray-700 mb-4">
          Your email <strong>{email}</strong> is already verified. You can now login.
        </p>
        <div className="mt-2 w-80 bg-white border rounded-md shadow-lg">
          <Login />
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-md shadow-md mt-10 flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-4">Verification Failed</h1>
        <p className="text-gray-700 mb-4">
          The verification link has expired or is not valid. Please request a new verification email.
        </p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={requestNewVerificationEmail}>
          Request New Verification Email
        </button>
      </div>
    );
  }

  if (status !== "success") {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-md shadow-md mt-10 flex justify-center items-center">
        <h1 className="text-2xl font-bold mb-4">Verification Failed</h1>
        <p className="text-gray-700 mb-4">
          The verification link is invalid or expired.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center ">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-md shadow-md mt-10 flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-4">Verification Successful</h1>
        <p className="text-gray-700 mb-4">
          Your email <strong>{email}</strong> has been successfully verified.
        </p>
        <p className="text-gray-700 mb-4">
          You can now Login and start using our services.
        </p>
      </div>
      <div className="mt-2 w-80 bg-white border rounded-md shadow-lg">
        <Login />
      </div>
    </div>
  );
};

export default VerifyPage;
