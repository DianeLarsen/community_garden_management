# Community Garden Management System

## Project Overview
The Community Garden Management System (CGMS) is a web application designed to streamline garden activities, manage plot reservations, and facilitate communication among garden members. It provides a user-friendly interface with interactive maps and secure authentication, making it easier for users to manage their garden plots and participate in community events.

## Features
- **Plot Reservation System**: Users can reserve garden plots, check availability, and manage their reservations.
- **Visual Garden Layout**: Integration with Google Maps allows users to view the garden layout and the status of available plots.
- **User Authentication**: Secure login and registration with JWT-based authentication and role-based access control.
- **Profile Management**: Users can update personal information, manage group memberships, and upload profile photos.

## Setup and Installation
Follow these steps to set up and run the project locally:

### Prerequisites
- **Node.js**: Ensure Node.js is installed on your system.
- **PostgreSQL**: Install PostgreSQL and create a database.

### 1. Clone the Repository

git clone https://github.com/DianeLarsen/community_garden_management.git
cd community_garden_management

### 2. Install Dependencies
npm install

### 3. Configure Environment Variables
Create a .env file in the root directory and add the following configurations:

PGUSER=your_postgres_username
PGHOST=localhost
PGDATABASE=community_garden_management
PGPASSWORD=your_postgres_password
PGPORT=5432
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
BASE_URL=http://localhost:3000


### 4. Set Up the Database
If PostgreSQL is not installed, follow the instructions for your operating system to install it, and then create the database:

# For Windows:

Download and install PostgreSQL from PostgreSQL Downloads.
Create a new database named community_garden_management using pgAdmin.

# For macOS:

brew install postgresql
brew services start postgresql
createdb community_garden_management

# For Linux:

sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
sudo -i -u postgres
createdb community_garden_management

After setting up the database, run the setup script to initialize the database and tables:

node utils/setup.js

### 5. Start the Development Server
Access the application in your browser at http://localhost:3000.

# Usage
Register a new account or log in with your existing account.
Navigate through the interface to reserve plots, view the garden layout, and manage your profile.

# System Requirements
Node.js: Version 14.x or later.
PostgreSQL: Version 12.x or later.

# Deployment
The project is live and can be accessed at [Heroku Deployment](https://community-garden-management-975d65cae5d8.herokuapp.com/).

# Documentation
Operation Guide: Detailed instructions on how to operate and configure the application.

# Known Issues and Future Directions
Pending Features: Group management, event handling, and advanced weather integration.
Known Issues: The current version may have minor UI inconsistencies that will be addressed in future updates.
Status
This is the release version of the Community Garden Management System. All core functionalities are operational and have been thoroughly tested. The program is stable, with no significant known errors. Future updates will focus on adding more features and improving user experience.

# References
[Auth0](https://auth0.com/docs): Auth0 Documentation
[Google Developers](https://developers.google.com/maps/documentation): Google Maps Platform Documentation
[Okta](https://developer.okta.com/docs/concepts/role-based-access-control/): Role-Based Access Control
[PostgreSQL Documentation](https://www.postgresql.org/docs/): PostgreSQL
[DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-20-04): How to Install and Use PostgreSQL on Ubuntu
[MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API): Fetch API
[Express.js](https://expressjs.com/): Express Documentation