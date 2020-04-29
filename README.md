# Express Boilerplate

Boilerplate for starting new Express Projects

## Setup

1. `git clone BoilerplateURL NewProjectName`
2. `cd` into project
3. `rm -rf .git && git init` init fresh git 
4. `npm install`
5. `mv example.env .env` move `example.env` to `.env`
    - `.env` will be ignored by git and used by express locally
6. Update `name` and `description` in `package.json`
7. Add `API_TOKEN` to `.env`
8. Draw ERD
9. Create migrations
10. `CREATE DATABASE db_name WITH OWNER "user_name";`
11. 



8. Delete `example-router` and `example-store` if not needed
9. Update `README.md`

## Scripts
- `npm start`
- `npm run dev` to start nodemon
- `npm test`

## Deploying
- `heroku create`
- `npm run predeploy` to audit packages
- `npm run deploy` to push to Heroku repo
