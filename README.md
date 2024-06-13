…or create a new repository on the command line
echo "# community_garden_management" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin git@github.com:DianeLarsen/community_garden_management.git
git push -u origin main
…or push an existing repository from the command line
git remote add origin git@github.com:DianeLarsen/community_garden_management.git
git branch -M main
git push -u origin main

to start postgresql
# Check the status of PostgreSQL
sudo /etc/init.d/postgresql status

# Start PostgreSQL
sudo /etc/init.d/postgresql start

# Stop PostgreSQL
sudo /etc/init.d/postgresql stop

# Restart PostgreSQL
sudo /etc/init.d/postgresql restart

psql -U cgmadmin -d community_garden_management

    user: "cgmadmin",
    host: "localhost",
    database: "community_garden_management",
    password: 'cgmadmin',
    port: 5432,

