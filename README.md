# Stellite Funding Platform

Donation platform for the financial needs of Stellite.

In the future it can extend to all types of projects and connect to StellitePay.


# How To (Temporary)

1. Install and run MongoDB locally on port 27017 and with MongoDB Shell (mongo) insert an user :

`use stellite-funding-platform`

`db.users.insertOne( { username: "your_username", email: "your@email.com", password: "test" } );`

2. Clone this repository :
`git clone https://github.com/oxhak/Stellite-Funding-Platform`

3. Run app.js with Node.js : `node app.js`

4. Open your web browser and go to http://127.0.0.1:3000 and try to Login.
