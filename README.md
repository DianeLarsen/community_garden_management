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

GRANT ALL PRIVILEGES ON DATABASE community_garden_management TO cgmadmin;

  
To untrack a single file that has already been added/initialized to your repository, i.e., stop tracking the file but not delete it from your system use: git rm --cached filename

To untrack every file that is now in your .gitignore:

First commit any outstanding code changes, and then, run this command:

git rm -r --cached .
This removes any changed files from the index(staging area), then just run:

git add .
Commit it:

git commit -m ".gitignore is now working"
To undo git rm --cached filename, use git add filename.

Make sure to commit all your important changes before running git add . Otherwise, you will lose any changes to other files.

Please be careful, when you push this to a repository and pull from somewhere else into a state where those files are still tracked, the files will be DELETED

How to creat a jwt secret:
openssl rand -base64 64

turning off password on sudo
sudo visudo
 add this to end:
your-username ALL=(ALL) NOPASSWD: /etc/init.d/postgresql
