# Stellite Funding Platform

Funding platform for the Stellite Blockchain.

In the future it can extend to all types of funding and connect to StellitePay.


# How To (Temporary)

1. Install and run MongoDB locally on port 27017.

Add funding categories with MongoDB shell (mongo)

`use stellite-funding-platform`

`db.categories.insertOne( { categorie: "Stellite", categorie_id: 1 } );`

`db.categories.insertOne( { categorie: "Community", categorie_id: 2 } );`

2. Clone this repository :
`git clone https://github.com/oxhak/Stellite-Funding-Platform`

3. Run app.js with Node.js v11.9 : `node app.js`

4. Open your web browser, go to http://127.0.0.1:3000, create an account and try to login.
