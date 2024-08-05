async function getLatLonFromAddress(address) {
  const apiKey = process.env.GOOGLE_KEY;  // Replace with your Google API key
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch geolocation data for address: ${address}`);
    }

    const data = await response.json();
// console.log(data)
    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      // console.log(lat, lng)
      return { lat, lon: lng };

    } else {
      throw new Error(`No geolocation data found for address: ${address}`);
    }
  } catch (error) {
    console.error('Error fetching geolocation data:', error);
    throw error;
  }
}

module.exports = getLatLonFromAddress;
