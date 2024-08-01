# Community Garden Management System

## Project Overview
The Community Garden Management System is a web application designed to streamline the coordination of garden activities, manage plot reservations, and facilitate communication among garden members. By integrating weather and Google Maps APIs, the system provides timely weather updates and a visual representation of garden plots to enhance gardening efficiency and planning.

## Features
- **Plot Reservation System**: Easily reserve garden plots and check availability.
- **Weather Updates**: Receive real-time weather updates and gardening tips.
- **Visual Garden Layout**: View garden layout and plot status with Google Maps integration.

## Setup and Installation
Follow these steps to set up and run the project locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/DianeLarsen/community_garden_management.git
Navigate to the project directory:

bash
Copy code
cd community_garden_management
Install dependencies:

bash
Copy code
npm install
Run the development server:

bash
Copy code
npm start
Build for production (optional):

bash
Copy code
npm run build
Usage
Access the application in your browser at http://localhost:3000.
Register a new account or log in if you already have an account.
Navigate through the interface to reserve plots, check weather updates, and view the garden layout.
Deployment on Netlify
To deploy the project on Netlify:

Sign Up/Login: Create an account or log in to Netlify.
New Site: Click on "New site from Git" on the Netlify dashboard.
Connect Repository: Connect your GitHub repository to Netlify.
Build Settings: Set the build command to npm run build and the publish directory to build.
Deploy Site: Netlify will build and deploy your site automatically.
Add a netlify.toml file for configuration settings:


[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
Contributing
Contributions are welcome! Follow these steps to contribute:

Fork the repository.
Create a new branch for your feature or bug fix:

git checkout -b feature-name
Make your changes and commit them:

git commit -m "Description of feature or fix"
Push to the branch:

git push origin feature-name
Submit a pull request with a detailed description of your changes.
License
This project is licensed under the MIT License. See the LICENSE file for details.

Acknowledgements
Netlify for deployment services.
Google Maps API for garden layout visualization.
Weather API for real-time weather updates.
Contact
For any questions or suggestions, please feel free to contact Diane Larsen.



