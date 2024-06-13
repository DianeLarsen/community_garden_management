"use client"
import { useState, useEffect } from 'react'
import CommunityGardensMap from '@/components/CommunityGardensMap'
import GardensList from '@/components/GardensList'

export default function CommunityGardensPage() {
  const [gardens, setGardens] = useState([])

  useEffect(() => {
    async function fetchGardens() {
      try {
        const response = await fetch('/api/parse-pdf')
        const data = await response.json()
        setGardens(data)
      } catch (error) {
        console.error('Failed to fetch community gardens data:', error)
      }
    }

    fetchGardens()
  }, [])

  return (
    <div>
      <h1>Community Gardens</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Address</th>
            <th className="py-2 px-4 border-b">Type</th>
            <th className="py-2 px-4 border-b">Description</th>
            <th className="py-2 px-4 border-b">Contact</th>
            <th className="py-2 px-4 border-b">Links</th>
            <th className="py-2 px-4 border-b">Rental Info</th>
          </tr>
        </thead>
        <tbody>
          {gardens.map((garden, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b">{garden.name}</td>
              <td className="py-2 px-4 border-b">{garden.address}</td>
              <td className="py-2 px-4 border-b">{garden.type}</td>
              <td className="py-2 px-4 border-b">{garden.description}</td>
              <td className="py-2 px-4 border-b">{garden.contact}</td>
              <td className="py-2 px-4 border-b">
                {garden.links.split(',').map((link, i) => (
                  <a key={i} href={link.trim()} target="_blank" rel="noopener noreferrer">
                    {link}
                  </a>
                ))}
              </td>
              <td className="py-2 px-4 border-b">{garden.rentalInfo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}