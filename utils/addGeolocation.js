const fs = require('fs');
const path = require('path');
require('dotenv').config();
 // Replace with your Google API key
const jsonFilePath = path.join(__dirname, '../data/snocomgar.json');

async function getLatLonFromAddress(address) {
  const apiKey = process.env.GOOGLE_KEY;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  console.log(url)
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch geolocation data for address: ${address}`);
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      throw new Error(`No geolocation data found for address: ${address}`);
    }
  } catch (error) {
    console.error('Error fetching geolocation data:', error);
    throw error;
  }
}

async function addGeolocationToGardens() {
  try {
    const gardensData = JSON.parse(fs.readFileSync(jsonFilePath));

    for (const garden of gardensData.communityGardens) {
      if (!garden.geolocation || Object.keys(garden.geolocation).length === 0) {
        const address = garden.address;
        try {
          const { lat, lng } = await getLatLonFromAddress(address);
          garden.geolocation = { lat, lng };
          console.log(`Geolocation added for: ${garden.name}`);
        } catch (error) {
          console.error(`Error getting geolocation for ${garden.name}:`, error.message);
          garden.geolocation = [];
        }
      } else {
        console.log(`Geolocation already present for: ${garden.name}`);
      }
    }

    fs.writeFileSync(jsonFilePath, JSON.stringify(gardensData, null, 2));
    console.log('Geolocation data added and JSON file updated successfully.');
  } catch (error) {
    console.error('Error updating JSON file:', error);
  }
}

addGeolocationToGardens();