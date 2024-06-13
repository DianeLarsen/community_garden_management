// Example of a simple Express.js API
const express = require('express')
const app = express()
const port = 3000

app.get('/api/community-gardens', (req, res) => {
  res.json([
    { lat: 47.6062, lng: -122.3321, name: "Seattle Community Garden" },
    { lat: 47.6205, lng: -122.3493, name: "Seattle Garden" }
    // Add more gardens as needed
  ])
})

app.get('/api/groups', (req, res) => {
  res.json([
    { name: "Group 1", description: "This is group 1" },
    { name: "Group 2", description: "This is group 2" }
    // Add more groups as needed
  ])
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
