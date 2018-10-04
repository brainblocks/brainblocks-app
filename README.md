# brainblocks-app

This is the repo for our hosted wallet app.

## Setup
Run: 

```
npm install
cp .env-example .env
```

Then edit the DB settings at `.env` and:

```
sequelize db:create
sequelize db:migrate
```

## Config
For the sake of not commiting keys and passwords to git they should be at .env.
Add them to .env-example too with dummy values to stay consistent :)