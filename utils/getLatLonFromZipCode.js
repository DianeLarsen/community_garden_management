async function getLatLonFromZipCode(zipCode) {
  const url = `http://api.zippopotam.us/us/${zipCode}`;
  try {
    // Dynamically import node-fetch
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch geolocation data for zip code: ${zipCode}`);
    }
    const data = await response.json();
 
    if (data && data.places && data.places.length > 0) {
      const { latitude, longitude } = data.places[0];
   
      return { lat: parseFloat(latitude), lon: parseFloat(longitude) };
    } else {
      throw new Error(`No geolocation data found for zip code: ${zipCode}`);
    }
  } catch (error) {
    console.error('Error fetching geolocation data:', error);
    throw error;
  }
}

module.exports = getLatLonFromZipCode;
