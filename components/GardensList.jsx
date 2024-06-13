const GardensList = ({ gardens, onSelectGarden }) => {
    return (
      <ul>
        {gardens.map((garden, index) => (
          <li
            key={index}
            onClick={() => onSelectGarden(garden)}
            className="cursor-pointer border p-2 my-2"
          >
            <h3 className="text-lg font-semibold">{garden.name}</h3>
            <p>{garden.description}</p>
          </li>
        ))}
      </ul>
    )
  }
  
  export default GardensList
  