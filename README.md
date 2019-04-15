# Let's Tip Me

Crowdfunding & Tips over the Torque Blockchain.


# How To (Temporary)

1. Install and run MongoDB locally on port 27017.

Add funding categories with MongoDB shell (mongo)

`use lets-tip-me`

`db.categories.insertOne( { categorie: "Torque Blockchain", categorie_id: 1 } );`

`db.categories.insertOne( { categorie: "Torque Community Contributions", categorie_id: 2 } );`

2. Clone this repository :
`git clone https://github.com/oxhak/Lets-Tip-Me`

3. Run app.js with Node.js v11.9 : `node app.js`

4. Open your web browser, go to http://127.0.0.1:3000, create an account and try to login.



------------------------

Let's Tip Me
Copyright (C) 2019 oxhak <https://github.com/oxhak/Lets-Tip-Me>

This program can exclusively be used on the Torque (XTC) blockchain <https://github.com/contribute-torque>.

To support the Torque Blockchain, any other use over another blockchain is not allowed at this time.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
