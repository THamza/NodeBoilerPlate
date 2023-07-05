# Node.js Boilerplate with JWT Authentication and Mailer Setup

This project is a Node.js boilerplate application set up with JWT authentication and a mailing system for account activation, password recovery, and password reset functionalities. The code snippets provided here are part of a larger system, and you need to include the necessary dependencies and environment variables for it to function correctly.

## Features
User Registration with Email Verification
User Login
User Account Activation through Email
Password Recovery
Password Reset

## Prerequisites
Node.js
MongoDB

## Installation
Clone the repository
```
git clone https://github.com/user/repo.git
```
Install the dependencies
```
cd repo
npm install
```
Create a .env file in the root of your project and insert your key-value pairs in the following format of KEY=VALUE:
```
HASH_KEY=YourHashKey
MONGO_URI=YourMongoDBURI
```
## Usage
You can start the server with npm start. It uses nodemon for hot reloading:
```
npm start
```

The following are the available routes:

POST /auth/signup - Register a new user
POST /auth/signin - Login a registered user
POST /auth/activation - Activate user account
POST /auth/activation/resend - Resend activation email
POST /auth/signout - Signout a user
POST /auth/password-recovery - Initiate password recovery
POST /auth/password-recovery/email - Resend password recovery email
POST /auth/password-recovery/verification - Verify recovery code
POST /auth/password-recovery/password - Set a new password
## Running the tests
This project uses Mocha & Chai for testing.
```
npm test
```

## Built With
Node.js - JavaScript runtime
Express.js - Web application framework
Mongoose - MongoDB object modeling tool
bcryptjs - Password hashing library
jsonwebtoken - To generate JWT
nodemailer - For sending emails
Contributing
Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests.

## Versioning
For the versions available, see the tags on this repository.
