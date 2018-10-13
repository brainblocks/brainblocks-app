# brainblocks-app

This is the repo for our hosted wallet app.

## Setup
Run: 

```
npm install -g sequelize-cli
npm install
cp .env-example .env
```

Then edit the DB settings at `.env` and:

```
npm run sequelize db:create
npm run sequelize db:migrate
npm run sequelize db:seed:all
```

**NOTE:** Some sequelize cli commands may not work as expected (or not work at all) because of the change to es6. For example, `npm run sequelize model:generate`. The db ones work fine though :)


## Config
For the sake of not commiting keys and passwords to git they should be at .env.
Add them to .env-example too with dummy values to stay consistent :)