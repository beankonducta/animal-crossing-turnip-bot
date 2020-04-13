Add .env file with contents:

TOKEN=xxxxxxxxxxxxxxxx (discord token)

---------------------------------------------

Run with node:

node bot.js

---------------------------------------------


Heroku Setup:

Download Heroku CLI
In your local directory run:

heroku login
heroku git:remote -a turnip-bot


---------------------------------------------

Deploy to Heroku with:

git push heroku master