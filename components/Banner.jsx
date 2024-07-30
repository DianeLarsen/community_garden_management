import Link from "next/link";

const Banner = ({ message, type, link }) => {
    if (!message) return null;
  
    return (
      <div
        className={`p-4 text-white text-center ${
          type === "success" ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {message}
        {link && (
          <Link href={link} className="text-blue-500 underline">
            Click here to fix
          </Link>
        )}
      </div>
    );
  };
  
  export default Banner;
  