"use client";
import Login from "@/components/Login";
import { useSearchParams } from "next/navigation";

const VerifyPage = () => {
    
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const email = searchParams.get("email");

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
