// "use client";

// import { useEffect, useState } from "react";
// import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// const containerStyle = {
//   width: "100%",
//   height: "400px",
// };

// const defaultCenter = {
//   lat: 47.8554, // Default center (Seattle)
//   lng: -121.971,
// };

// const defaultZoom = 14; // Set the default zoom level

// const CommunityGardensMap = ({
//   center = defaultCenter,
//   zoom = defaultZoom,
// }) => {
//   const [gardens, setGardens] = useState([]);

//   useEffect(() => {
//     // Fetch community gardens data from your backend or an API
//     fetch("/api/community-gardens")
//       .then((response) => response.json())
//       .then((data) => setGardens(data));
//   }, []);

//   return (
//     <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
//       <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={zoom}>
//         {gardens.map((garden, index) => (
//           <Marker
//             key={index}
//             position={{ lat: garden.lat, lng: garden.lng }}
//             label={garden.name}
//           />
//         ))}
//       </GoogleMap>
//     </LoadScript>
//   );
// };

// export default CommunityGardensMap;
