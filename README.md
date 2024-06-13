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

https://support.microsoft.com/en-us/account-billing/how-to-get-and-use-app-passwords-5896ed9b-4263-e681-128a-a6f2979a7944#:~:text=In%20the%20Outlook%20desktop%20app,Get%20a%20new%20app%20password.

