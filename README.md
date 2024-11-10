# study_web_app
A web application that enables users to create and study using interactive flashcards. 

Note: I've taken down the API and website due to server costs. However, this Git repo shows the application's source code and infrastructure back when it was active. Feel free to look around!

## The Frontend
The frontend was built with React, and all source code files can be found in the [client](./client) directory. 
The frontent is a multi-page site with routing handled by react-router-dom.  

## The Backend
The backend API, implemented as a REST API supporting CRUD functions, was built using Flask, a lightweight Python framework. 
The API uses SQLAlchemy as an ORM to store and retrieve information from a PostgreSQL database. JSON web tokens are used to securely handle user authentication
and authorization. The source code for the backend can be found in [api.py](./api.py).

## Hosting
Hosting is done on an EC2 instance provided by Amazon Web Services (AWS). NGINX is used as the frontend's web server and reverse proxy. The Python
API is served by Gunicorn. Though this application doesn't load balance, AWS Elastic Load Balancer is used to manage TLS termination for HTTPS traffic.

