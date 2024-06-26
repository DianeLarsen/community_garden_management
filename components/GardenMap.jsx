"use client";
import { useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import {APIProvider, Map, MapCameraChangedEvent} from '@vis.gl/react-google-maps';

const GardenMap = ({ lat, lon }) => {
  useEffect(() => {
    if (
      typeof lat !== "number" ||
      typeof lon !== "number" ||
      isNaN(lat) ||
      isNaN(lon)
    ) {
      console.error("Invalid coordinates:", { lat, lon });
      return;
    }

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: "weekly",
    });

    let map;

    async function initMap() {
      const { Map } = await google.maps.importLibrary("maps");

      map = new Map(document.getElementById("map"), {
        center: { lat, lng: lon },
        zoom: 8,
      });
    }

    initMap();
  }, [lat, lon]);

  return <div id="map" style={{ height: "400px", width: "100%" }}>

    </div>;
};

export default GardenMap;
