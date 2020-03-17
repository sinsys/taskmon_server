# TaskMon - Task Monitor

## Description

This is the API utilized by the TaskMon app. It supports protected endpoints for users and is built around a PostgreSQL database.

## Table of contents

*  [Set up](#set-up)
*  [Technologies](#technologies)
*  [Endpoints](#endpoints)
*  [Scripts](#scripts)
*  [Deploying](#deploying)
*  [Planning](#planning)

## Set up

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. Clone this repository to your local machine `git clone https://github.com/sinsys/taskmon_server.git NEW-PROJECTS-NAME`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`

## Technologies

| Language | Framework/Library | Version |
| :--- | :---: | ---: |
| **JS ES6** | **React** | *16.13* |
| | **Node** | *12.16* |
| | **Express** | *4.17.1* |
| **pgSQL** | **PostgreSQL** | *10.12* |

## Endpoints

### Authentication:
  - POST `/api/login`
### Projects:
 - GET `/api/projects`
 - POST `/api/projects`
 - GET `/api/projects/:id`
 - PATCH `/api/projects/:id`
 - DELETE `/api/projects/:id`
### Tasks:
 - GET `/api/tasks`
 - POST `/api/tasks`
 - GET `/api/tasks/:id`
 - PATCH `/api/tasks/:id`
 - DELETE `/api/tasks/:id`
### Settings:
 - GET `/api/settings`
 - PATCH `/api/settings`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

Run tests and continue watching `npm watch`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.



## Planning

- Gantt Chart for progress tracking: [Gantt Chart](https://docs.google.com/spreadsheets/d/1gs3NtOi0saVZm1x91WcbMBz3AyNKN3RqGG2ubOGZn8Q/edit#gid=2140549662?usp=sharing)
- User Stories for use-cases: [User Stories](https://docs.google.com/spreadsheets/d/1gs3NtOi0saVZm1x91WcbMBz3AyNKN3RqGG2ubOGZn8Q/edit#gid=739121299?usp=sharing)
- User Flows: [User Flows on Draw.io](https://drive.google.com/file/d/1Z--cjFDzV-dabEC5hAtgKheW9UV70B5F/view?usp=sharing)
