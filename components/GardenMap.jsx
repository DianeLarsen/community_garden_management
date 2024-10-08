"use client";
import {
  useEffect,
  useState,
  useCallback,
  memo,
  createContext,
  useContext,
  useRef,
} from "react";
import {
  APIProvider,
  Map,
  useMapsLibrary,
  useMap,
  Marker,
  AdvancedMarker
} from "@vis.gl/react-google-maps";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 47.8554, // Default center (Seattle)
  lng: -121.971,
};

const defaultZoom = 12;

// Create a context for garden
const GardenContext = createContext();

export default function GardenMap({
  garden,
  directionAddress,
  user,
  showDirections
}) {
  const value = {
    garden,
    user,
    directionAddress,
    showDirections
  };
  const [zoom, setZoom] = useState(defaultZoom);
  const positionRef = useRef(defaultCenter);
  const [loading, setLoading] = useState(true); // Add loading state

  if (garden) {
    positionRef.current = { lat: garden.lat, lng: garden.lon };
  }

  useEffect(() => {
    if (garden) {
      positionRef.current = { lat: garden.lat, lng: garden.lon };
    }
  }, [garden]);

  const handleMapLoad = () => {
    setLoading(false); // Set loading to false when the map loads
  };

  return (
    <div style={containerStyle}>
      {loading && <p>Loading Maps...</p>}
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <GardenContext.Provider value={value}>
          <Map
            center={positionRef.current}
            mapId={process.env.NEXT_PUBLIC_MAP_ID}
            zoom={zoom}
            fullscreenControl={false}
            gestureHandling={"greedy"}
            onLoad={handleMapLoad} // Add onLoad handler
            onZoomChanged={ev => setZoom(ev.detail.zoom)}
          >
            <AdvancedMarker
              position={{ lat: garden.lat, lng: garden.lon }}
              title={garden.name}
              icon="https://res.cloudinary.com/dqjh46sk5/image/upload/c_pad,w_40,h_40,ar_1:1/v1719377237/garden_fegyyk.png"
            >
              {garden.name}
            </AdvancedMarker>
            <Directions />
          </Map>
        </GardenContext.Provider>
      </APIProvider>
    </div>
  );
}

function Directions() {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const { garden, user, directionAddress, showDirections } = useContext(GardenContext);

  const [directionsService, setDirectionsService] = useState();
  const [directionsRenderer, setDirectionsRenderer] = useState();
  const [address, setAddress] = useState("");
  const [routes, setRoutes] = useState([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  useEffect(() => {
    if (user.id){
      let homeAddress = user.street_address + "," + user.city + "," + user.state + "," + user.zip;

      setAddress(homeAddress);
    }
  }, [user]);

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !garden || !directionAddress) return;
    const destinationLatLon = { lat: garden.lat, lng: garden.lon }; // Use garden data for destination

    directionsService
      .route({
        origin: directionAddress || address,
        destination: destinationLatLon,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
        setRoutes(response.routes);
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(new google.maps.LatLng(garden.lat, garden.lon));
        bounds.extend(new google.maps.LatLng(response.routes[0].legs[0].start_location.lat(), response.routes[0].legs[0].start_location.lng()));
        map.fitBounds(bounds);
      });
    return () => directionsRenderer.setMap(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directionsService, directionsRenderer, garden, directionAddress, address]);

  useEffect(() => {
    if (!directionsRenderer) return;
    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer]);

  if (!leg) return null;

  return (
    <>
      {showDirections && (
        <div className="absolute w-[275px] top-0 right-0 p-5 pt-0 m-1 text-white bg-gray-800 rounded">
          <h2 className="py-1 text-xl">{selected.summary}</h2>
          <p className="text-sm p-0 pb-1 m-0">
            {leg.start_address.split(",")[0]} to {leg.end_address.split(",")[0]}
          </p>
          <p className="text-sm p-0 pb-1 m-0">Distance: {leg.distance?.text}</p>
          <p className="text-sm p-0 pb-1 m-0">Duration: {leg.duration?.text}</p>
          <h2 className="py-1 text-xl">Other Routes</h2>
          <ul className="pl-6 p-0 m-0">
            {routes.map((route, index) => (
              <li key={route.summary}>
                <button
                  className="text-yellow-400 bg-none border-none cursor-pointer"
                  onClick={() => setRouteIndex(index)}
                >
                  {route.summary}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
