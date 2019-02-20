# Stellite Funding Platform

Donation platform for the financial needs of Stellite.

In the future it can extend to all types of projects and connect to StellitePay.


# How To (Temporary)

Install and run mongodb locally on port 27017 and with mongodb shell (mongo) insert an user

`use stellite-funding-platform`

`db.users.insertOne( { username: "your_username", email: "your@email.com", password: "test" } );`

Clone this repository
`git clone https://github.com/oxhak/Stellite-Funding-Platform`

Run app.js with Node.js `node app.js`

Open your web browser and go to http://127.0.0.1:3000 and try to Login
