

const Banner = ({ message, type }) => {
    if (!message) return null;
  
    return (
      <div
        className={`p-4 text-white text-center ${
          type === "success" ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {message}
      </div>
    );
  };
  
  export default Banner;
  