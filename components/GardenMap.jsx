"use client";
import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 47.8554, // Default center (Seattle)
  lng: -121.971,
};

const defaultZoom = 14; // Set the default zoom level

const GardenMap = ({ garden, center = defaultCenter, zoom = defaultZoom }) => {
  if (garden[0]) {
    center = { lat: garden[0].lat, lng: garden[0].lon };
  }
  useEffect(() => {
    if (garden[0]) {
      center = { lat: garden[0].lat, lng: garden[0].lon };
    }
  }, [garden]);

  if (garden.length == 0){
    return <p>Loading Map...</p>
  }

  return (
    <div id="map" style={{ height: "400px", width: "100%" }}>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={zoom}
        >
          <Marker
            position={{ lat: garden[0].lat, lng: garden[0].lon }}
            title={garden[0].name}
            label={garden[0].name}
            icon="https://res.cloudinary.com/dqjh46sk5/image/upload/c_pad,w_40,h_40,ar_1:1/v1719377237/garden_fegyyk.png"
            // <a href='https://pngtree.com/freepng/flower-farmer-gardener-weeding-raising-flowers_3779329.html'>png image from pngtree.com/</a>
          />
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default GardenMap;
