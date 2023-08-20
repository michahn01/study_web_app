# study_web_app
A web application that enables users to create and study using interactive flashcards. 

Visit the website here: [studycardsapp.net](https://studycardsapp.net)

Create an account (or log in if you already have one), and create "study sets" from your user dashboard. 
Within a study set, you can add, delete, and modify digital flashcards that you can study with interactively. 

## The Frontend
The frontend was built with React, and all source code files can be found in the [client](./client) directory. 
The frontent is a multi-page site with routing handled by react-router-dom. Everytime a user acceses their account 
or its contents, the frontend communicates with the backend by sending and receiving requests. 

## The Backend
The backend was built with Flask, a lightweight Python framework. Implemented as a RESTful API supporting CRUD functions, 
the backend's primary job is to receive and send requests from the frontend. The API uses SQLAlchemy as an ORM to 
store and retrieve information from a PostgreSQL database. JSON web tokens are used to securely handle user authentication
and authorization. The source code for the backend can be found in [api.py](./api.py).

## Hosting
Hosting is done on Amazon Web Services (AWS). To serve the backend, a Python server called Gunicorn is used. To handle inbound
requests to the site and to reverse proxy requests from the frontend to the backend, NGINX is used. 
