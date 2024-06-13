import pdf from 'pdf-parse'

export const parseCommunityGardensPdf = async (dataBuffer) => {
  try {
    const data = await pdf(dataBuffer)
    const text = data.text
    
    // Split the text into lines
    const lines = text.split('\n')
    
    // Initialize an empty array to store garden data
    const gardens = []

    // Extract the relevant information for each garden
    lines.forEach(line => {
      // Assuming columns are separated by multiple spaces or tabs
      const columns = line.split(/\s{2,}|\t/)
      if (columns.length >= 7) {  // Adjust this based on the exact number of columns you expect
        gardens.push({
          name: columns[0].trim(),
          address: columns[1].trim(),
          type: columns[2].trim(),
          description: columns[3].trim(),
          contact: columns[4].trim(),
          links: columns[5].trim(),
          rentalInfo: columns[6].trim()
        })
      }
    })

    return gardens
  } catch (error) {
    throw new Error('Failed to parse PDF')
  }
}
