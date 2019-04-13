/// Torque Funding Config File
const config = require('./config');
/////
var Ddos = require('ddos');
var express = require('express');
var ddos = new Ddos({burst:50, limit:55});
var app = express();
app.use(ddos.express);
const session = require('express-session');
const uuid = require('uuid/v4');
const FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
const bcrypt = require('bcrypt');
const saltRounds = 10;
const keygen = require('keygen');
var crypto = require("crypto");
var escape = require('escape-html');
var cmd=require('node-cmd');
var sortBy = require('sort-by');
var waitUntil = require('wait-until');
var speakeasy = require('speakeasy');
var QRCode = require('qrcode');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'torque-funding-platform';

// Hostname of your hosting
const hostname = "funding.torque.cash";
const noreply = "no-reply@funding.torque.cash"

//start mongodb connection
MongoClient.connect(url,function(err, client) {
    const db = client.db(dbName);


const sendmail = require('sendmail')({
  devPort: config.sendmail_devPort,
  devHost: config.sendmail_devHost,
  smtpPort: config.smtpPort
});

//Inputs validators
function ValidateEmail(inputText)
{
  var mailformat = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  if(inputText.match(mailformat))
  {
    return true;
  }
  else
  {
    return false;
  }
}

function ValidateUsername(inputText)
{
  var usernameformat = /^([a-zA-Z0-9_-]+)$/;
  if(inputText.match(usernameformat))
  {
    return true;
  }
  else
  {
    return false;
  }
}

function ValidateActivationCode(inputText)
{
  var activationcodeformat = /^([a-zA-Z0-9]+)$/;
  if(inputText.match(activationcodeformat))
  {
    return true;
  }
  else
  {
    return false;
  }
}

function ValidateAddressRedirect(inputText)
{
  var addressformat = /^([a-zA-Z0-9]+)$/;
  if(inputText.match(addressformat))
  {
    return true;
  }
  else
  {
    return false;
  }
}

function ValidateID(inputText)
{
  var _idformat = /^([a-z0-9]+)$/;
  if(inputText.match(_idformat)&&inputText.length<25)
  {
    return true;
  }
  else
  {
    return false;
  }
}

function ValidateAmount(inputText)
{
  var amountformat = /^([0-9]+)$/;
  if(inputText.match(amountformat)&&inputText.length<12)
  {
    return true;
  }
  else
  {
    return false;
  }
}

function ValidateWalletIndex(inputText)
{
  var amountformat = /^([0-9]+)$/;
  if(inputText.match(amountformat))
  {
    return true;
  }
  else
  {
    return false;
  }
}

function Validate2FAcode(inputText)
{
  var amountformat = /^([0-9]+)$/;
  if(inputText.match(amountformat)&&inputText.length<7)
  {
    return true;
  }
  else
  {
    return false;
  }
}

function shuffelActivationCode(code){
    var shuffledCode = '';
    code = code.split('');
    while (code.length > 0) {
      shuffledCode +=  code.splice(code.length * Math.random() << 0, 1);
    }
    return shuffledCode;
}

// Configure passport.js to use the local strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (email, password, done) => {
    //Inside local strategy callback
      const collection = db.collection('users');
      collection.find({'email': email}).toArray(function(err, data) {
        // assert.strictEqual(err, null);
        if(err===null){
          if (data[0]){
            const user = data[0];
            if(email === user.email) {
              // Check password
              bcrypt.compare(password, user.password, function(err, res) {
                if(res === true) {
                  if(user.activated === "true") {
                    //Local strategy returned true
                    return done(null, user);
                  } else {
                    return done(null, false, "Locked account, please check the email you received");
                  }
                } else if(res === false) {
                  return done(null, false, "Wrong password");
                }
              });
            }
          } else {
            return done(null, false, "Email not found");
          }
        } else {
        res.status(301).redirect("/error_db");
        }
      });
  }
));

// Tell passport how to serialize the user
passport.serializeUser((user, done) => {
  //Inside serializeUser callback. User id is save to the session file store here
  done(null, user._id);
});

passport.deserializeUser((_id, done) => {
  //Inside deserializeUser callback
  //The user id passport saved in the session file store is: _id
  done(null, _id);
});


// Add & configure middleware
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(session({
  genid: (req) => {
    //Inside session middleware genid function
    //Request object sessionID from client: ${req.sessionID}
    return uuid(); // Use UUIDs for session IDs
  },
  store: new FileStore(),
  secret: 'a secret random string',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/login', function(req, res) {
  if(req.isAuthenticated()) {
    res.send('Logged');
  } else {
    res.sendFile(__dirname + '/index.html');
  }
});
app.get('/register', function(req, res) {
  if(req.isAuthenticated()) {
    res.send('Logged');
  } else {
    res.sendFile(__dirname + '/index.html');
  }
});
app.get('/activate', function(req, res) {
  if(req.isAuthenticated()) {
    res.send('Logged');
  } else {
    res.sendFile(__dirname + '/index.html');
  }
});
app.get('/settings', function(req, res) {
  if(req.isAuthenticated()) {
    res.sendFile(__dirname + '/index.html');
  } else {
    res.status(301).redirect("/login");
  }
});
app.get('/buy', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/about', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/error', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/error_db', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/add', function(req, res) {
  if(req.isAuthenticated()) {
    cmd.get('curl -X POST http://'+config.rpc_wallet_address+':'+config.rpc_wallet_port+'/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"get_version"}\' -H \'Content-Type: application/json\'',
    function(err, jsonData, stderr){
      if(!err){
        res.sendFile(__dirname + '/index.html');
      } else {
        res.status(301).redirect("/error");
      }
    });
  } else {
    res.status(301).redirect("/login");
  }
});

app.post('/add', function(req, res) {
  if(req.isAuthenticated()) {
    //check if 2FA is enabled
    const collection = db.collection('users');
    collection.find(ObjectId(req.user)).toArray(function(err, data) {
      if(data[0].enabled_2FA==="true"){

        const title = escape(req.body.title);
        const description = escape(req.body.description);
        const unlimited = req.body.unlimited;
        const goal = escape(req.body.goal);
        var redirect_address = escape(req.body.redirect_address);
        const author = req.user;
        //veryfy 2FA code
        const collection = db.collection('users');
        collection.find(ObjectId(req.user)).toArray(function(err, data) {
          var verified_2FA_code;
          if(req.body.add_goal_2FA_code && Validate2FAcode(req.body.add_goal_2FA_code)==true){
            verified_2FA_code = speakeasy.totp.verify({
              secret: data[0].secret_2FA,
              encoding: 'base32',
              token: req.body.add_goal_2FA_code
            });
          } else {
            verified_2FA_code=false;
          }
          if(verified_2FA_code===true){
            //check if wallet online
            cmd.get('curl -X POST http://'+config.rpc_wallet_address+':'+config.rpc_wallet_port+'/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"get_version"}\' -H \'Content-Type: application/json\'',
            function(err, jsonData, stderr){
              if(!err){

                if(req.isAuthenticated()) {
                  function addWithUsername(title,description,goal,redirect_address,author,author_id)
                  {
                    if((title) && (description) && (unlimited) && (goal) && (redirect_address) && (author) && (author_id) && (unlimited === "true" || unlimited === "false")){
                      const collection = db.collection('goals');
                      collection.insertOne({ title: title, description: description, balance: 0, unlimited: unlimited, categorie: "2", goal: goal, redirect_address: redirect_address, creation_date: ~~(+new Date / 1000), author: author, status: "open", author_id: author_id, wallet_index: "null", wallet_address: "null", address_qrcode: "null" }, function(err, result) {
                        // assert.strictEqual(err, null);
                        var goalID = result["ops"][0]["_id"];

                        //generate wallet address
                        cmd.get('curl -X POST http://'+config.rpc_wallet_address+':'+config.rpc_wallet_port+'/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"create_account","params":{"label":"'+goalID+'"}}\' -H \'Content-Type: application/json\'',
                        function(err, data, stderr){
                          var data = JSON.parse(data);
                          // Get the documents collection
                          const collection = db.collection('goals');
                          //Generate address QRcode & update goal wallet infos
                          QRCode.toDataURL(data.result.address, function (err, qrcode) {
                            collection.updateMany({ _id : goalID }
                              , { $set: { wallet_index : data.result.account_index, wallet_address: data.result.address, address_qrcode: qrcode } }, function(err, result) {
                                // assert.strictEqual(err, null);
                                res.send({ status: "success", goalID: goalID });
                                //save wallet
                                cmd.get('curl -X POST http://'+config.rpc_wallet_address+':'+config.rpc_wallet_port+'/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"store"}\' -H \'Content-Type: application/json\'',
                                function(err, data, stderr){
                                  //wallet saved
                                });
                              });
                            });
                          }
                        );
                      });
                    }
                  }
                  const collection = db.collection('users');
                  collection.find(ObjectId(req.user)).toArray(function(err, data) {
                    // assert.strictEqual(err, null);
                    if(ValidateAddressRedirect(escape(redirect_address))==false){
                      res.send({ status: "Bad redirect address" });
                    } else if(redirect_address.length>109 || redirect_address.length<95){
                      res.send({ status: "Bad redirect address" });
                    } else if(ValidateAmount(goal)==false){
                      res.send('Bad Amount');
                    } else if(title.length>200){
                      res.send('Title too long');
                    } else if(description.length>12000){
                      res.send('Description too long');
                    } else {
                      if(unlimited==="false"){
                        redirect_address="none";
                      }
                      if((title) && (description) && (unlimited) && (goal) && (redirect_address) && (unlimited === "true" || unlimited === "false")){
                      addWithUsername(title,description,goal,redirect_address,data[0].username,req.user)
                      }
                    }
                  });
                } else {
                  res.send({ status: "Not logged" });
                }
              } else {
                res.send({ status: "Wallet offline" });
              }
            });

          } else if(verified_2FA_code===false){
            res.send({ status: "Bad 2FA" });
          }
        });
      } else if(data[0].enabled_2FA==="false"){
        res.send({ status: "2FA disabled" });
      }
    });
  } else {
    res.send({ status: "Not logged" });
  }
});

app.post('/check_username', function(req, res) {
  var username = req.body.username;
  if(ValidateUsername(username)==true){
      const collection = db.collection('users');
      collection.find({'username': username}).toArray(function(err, data) {
        // assert.strictEqual(err, null);
        if (data[0]){
          res.send('Username already exist');
        } else {
          res.send('Available');
        }
      });
  } else {
    res.send("Invalid username, allowed: a-z, A-Z, 0-9, underscore and dash");
  }
});

app.post('/check_email', function(req, res) {
  var email = req.body.email;
  if(ValidateEmail(email)==true){
      const collection = db.collection('users');
      collection.find({'email': email}).toArray(function(err, data) {
        // assert.strictEqual(err, null);
        if (data[0]){
          res.send('Email already registered');
        } else {
          res.send('Available');
        }
      });
  } else {
    res.send("Invalid email address");
  }
});

app.post('/activate', function(req, res) {
  var activation_code = req.body.activation_code;
  if(ValidateActivationCode(activation_code)==true){
      const collection = db.collection('users');
      collection.find({'activation_code': activation_code}).toArray(function(err, data) {
        // assert.strictEqual(err, null);
        if (data[0]){
          collection.updateOne({ activation_code : activation_code }
            , { $set: { activated : "true" } }, function(err, result) {
              // assert.strictEqual(err, null);
              // assert.equal(1, result.result.n);
              res.send('Activated');
            });
        } else {
          res.send('Invalid code');
        }
      });
  } else {
  res.send("Invalid code format");
  }
});

function ActivationTimer() {
  // Checking unactivated registered users
    const collection = db.collection('users');
    collection.find({'activated': "false"}).toArray(function(err, data) {
      // assert.strictEqual(err, null);
      if (data[0]){
        data.forEach(function(unactivated_user) {
          // activation limit = 1 Hour (3600 seconds)
          if((~~(+new Date / 1000)-unactivated_user.creation_date) > 3600){
              const collection = db.collection('users');
              collection.deleteOne({ username : unactivated_user.username }, function(err, result) {
                // assert.strictEqual(err, null);
                // assert.equal(1, result.result.n);
                // removed user
              });
          }
        });
      }
    });
}
//Check unactivated registered users every 5 minutes
setInterval(ActivationTimer,300000);

app.post('/register', function (req, res) {
  if(req.isAuthenticated()) {
    res.send('Logged');
  } else {
    var username = req.body.username, email = req.body.email, password = req.body.password, passwordcheck = req.body.passwordcheck;
    if(password!=passwordcheck){
      res.send("Different passwords");
    } else if(ValidateEmail(email)==false){
      res.send("Invalid email address");
    } else if(ValidateUsername(username)==false){
      res.send("Invalid username, allowed: a-z, A-Z, 0-9, underscore and dash");
    } else if(username.length>20){
      res.send("Too long username");
    } else if(email.length>320){
      res.send("Too long email address");
    } else if(password.length>256){
      res.send("Too long password");
    } else {
        const collection = db.collection('users');
        bcrypt.hash(password, saltRounds, function(err, hash) {
          collection.find({'username': username}).toArray(function(err, data) {
            // assert.strictEqual(err, null);
            if(!data[0]){
              collection.find({'email': email}).toArray(function(err, data) {
                // assert.strictEqual(err, null);
                if(!data[0]){
                  // console.log(shuffelActivationCode(keygen.url(keygen.medium)+~~(+new Date / 1000)));
                  const activation_code=shuffelActivationCode(keygen.url(keygen.medium)+~~(+new Date / 1000));
                  const secret_2FA = speakeasy.generateSecret({length: 20});
                  collection.insertOne({ username: username, email: email, password: hash, activated: "false", activation_code: activation_code, creation_date: ~~(+new Date / 1000), secret_2FA: secret_2FA.base32, enabled_2FA: "false" }, function(err, result) {
                    // assert.strictEqual(err, null);
                    res.send("Registered");
                    sendmail({
                      from: noreply,
                      to: email,
                      subject: 'Please confirm your email address - Torque Funding Platform',
                      html: '<h2>Torque Funding Platform</h2><p>Please go to <a href="https://'+hostname+'/activate">https://'+hostname+'/activate</a>, and enter the following code:<br><p><strong>'+activation_code+'</strong></p></p><h6 style="font-weight:normal;">This code is only available for 1 hour, after that you will need to register again.</h6>',
                    }, function(err, reply) {
                      // console.log(err && err.stack);
                      // console.dir(reply);
                    });
                  });
                } else {
                  res.send('Email already registered');
                }
              });
            } else {
              res.send('Username already exist');
            }
          });
        });
    }
  }
});

app.get('/logged', function(req, res) {
  if(req.isAuthenticated()) {
      const collection = db.collection('users');
      collection.find(ObjectId(req.user)).toArray(function(err, data) {
        // assert.strictEqual(err, null);
        res.send({ user_username: data[0].username });
      });
  } else {
    res.send('false')
  }
});

app.post('/login', function(req, res, next) {
  if(ValidateEmail(req.body.email)==true){
      if(req.body.login_2FA_code){
            if(Validate2FAcode(req.body.login_2FA_code)==true){
                 //check if 2FA is valid before login
                 const collection = db.collection('users');
                 collection.find({'email': req.body.email}).toArray(function(err, data) {
                  var verified_2FA_code;
                  if(data[0]){
                  verified_2FA_code = speakeasy.totp.verify({
                     secret: data[0].secret_2FA,
                     encoding: 'base32',
                     token: req.body.login_2FA_code
                   });
                  } else {
                   res.send("Account not found");
                  }
                   if(verified_2FA_code===true){
                     passport.authenticate('local', function(err, user, info) {
                       if (err) { return next(err); }
                       if (!user) { return res.send(info); }
                       req.logIn(user, function(err) {
                         if (err) { return next(err); }
                         return res.send('Logged');
                       });
                     })(req, res, next);
                     } else if(verified_2FA_code===false){
                       res.send("Invalid 2FA code");
                     }
                 });
            } else {
            res.send("Invalid 2FA code format");
            }
        } else {
          ///check if 2FA is enabled
          const collection = db.collection('users');
          collection.find({'email': req.body.email}).toArray(function(err, data) {
           if(data[0]){
             if(data[0].enabled_2FA==="false"){
             passport.authenticate('local', function(err, user, info) {
               if (err) { return next(err); }
               if (!user) { return res.send(info); }
               req.logIn(user, function(err) {
                 if (err) { return next(err); }
                 return res.send('Logged');
               });
             })(req, res, next);
             } else {
              res.send("2FA is enabled on this account");
             }
           } else {
            res.send("Account not found");
           }
         });
        }
  } else {
    res.send("Invalid email address");
  }
});

app.get('/logout', function (req, res){
  req.session.destroy(function (err) {
    res.status(301).redirect("/login");
  });
});


///settings
app.get('/user_settings', function(req, res) {
  if(req.isAuthenticated()) {
    const collection = db.collection('users');
    collection.find(ObjectId(req.user)).toArray(function(err, data) {
    res.send({enabled_2FA: data[0].enabled_2FA});
    });
  } else {
    res.send('Not Logged');
  }
});

///2FA
app.get('/2FA', function(req, res) {
  if(req.isAuthenticated()) {
      const collection = db.collection('users');
      collection.find(ObjectId(req.user)).toArray(function(err, data) {
        // assert.strictEqual(err, null);
        QRCode.toDataURL('otpauth://totp/Torque%20Funding?secret='+data[0].secret_2FA, function(err, qrcode_2FA) {
        res.send({ secret_2FA: data[0].secret_2FA, qrcode_2FA: qrcode_2FA });
        });
      });
  } else {
    res.status(301).redirect("/login");
  }
});
app.post('/2FA', function(req, res) {
  if(req.isAuthenticated()) {
      const collection = db.collection('users');
      collection.find(ObjectId(req.user)).toArray(function(err, data) {
        if(req.body.code_2FA && Validate2FAcode(req.body.code_2FA)==true){
        var verified_2FA_code = speakeasy.totp.verify({
          secret: data[0].secret_2FA,
          encoding: 'base32',
          token: req.body.code_2FA
        });
        } else {
        verified_2FA_code=false;
        }
        if(verified_2FA_code===true){
          const collection = db.collection('users');
          collection.updateOne({ _id : ObjectId(req.user) }
            , { $set: { enabled_2FA : "true" } }, function(err, result) {
              res.send('true');
            });
        } else if(verified_2FA_code===false){
          res.send('false');
        }
      });
  } else {
    res.status(301).redirect("/login");
  }
});


///// Funding Goals
app.get('/categories', function(req, res) {
    const collection = db.collection('categories');
    collection.find({}).toArray(function(err, data) {
      // assert.strictEqual(err, null);
      if(err===null){
      res.send(data);
      } else {
      res.status(301).redirect("/error_db");
      }
    });
});

app.post('/goals', function(req, res) {
    const collection = db.collection('goals');
    collection.find({'categorie': req.body.categorie_id}).toArray(function(err, data) {
      // assert.strictEqual(err, null);
      if(err===null){
        res.send(data);
      } else {
        res.status(301).redirect("/error_db");
      }
    });
});

app.get('/goal/:id*', function(req, res, next) {
  cmd.get('curl -X POST http://'+config.rpc_wallet_address+':'+config.rpc_wallet_port+'/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"get_version"}\' -H \'Content-Type: application/json\'',
  function(err, jsonData, stderr){
    if(!err){
      res.sendFile(__dirname + '/index.html');
    } else {
      res.status(301).redirect("/error");
    }
  });
});

app.post('/goal/', function(req, res) {
  if(ValidateID(req.body._id)){
      const collection = db.collection('goals');
      collection.find(ObjectId(req.body._id)).toArray(function(err, data) {
        // assert.strictEqual(err, null);
        if(err===null){
          if(!data[0]){
            res.send("Goal not found");
          } else {
          res.send(data);
          }
        } else {
        res.status(301).redirect("/error_db");
        }
      });
  } else {
    res.send("Bad ID");
  }
});

app.post('/goal_txs', function(req, res) {

  if(ValidateWalletIndex(req.body.wallet_index)){

    var transactions = new Array();
    var balance=0;

    function updateBalance(balance)
    {
      //update goal Balance
        db.collection('goals').updateOne({ wallet_index : parseInt(req.body.wallet_index, 10) }
          , { $set: { balance : balance/100 } }, function(err, result) {
            // goal balance updated
          });
    }

    function sendTxsArray()
    {
      transactions.sort(sortBy('-timestamp'));
      res.send(transactions);
    }

    function addTxsToArray(txid, amount, timestamp, type)
    {
      transactions.push({txid: txid, amount: amount, timestamp: timestamp, type: type});
    }

    function getOutTxs()
    {
      //get OUT transactions
      cmd.get('curl -X POST http://'+config.rpc_wallet_address+':'+config.rpc_wallet_port+'/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"get_transfers","params":{"out":true,"account_index":'+req.body.wallet_index+'}}\' -H \'Content-Type: application/json\'',
      function(err, data, stderr){
        var jsonData=JSON.parse(data);
        if(jsonData.result.out){
          jsonData.result.out.forEach(function(value, index, array) {
            addTxsToArray(value.txid,value.amount,value.timestamp, 'out');
            if(index === array.length - 1) {
              sendTxsArray();
            }
          });
        } else {
          sendTxsArray();
        }
      }
    );
  }

  //get IN transactions
  cmd.get('curl -X POST http://'+config.rpc_wallet_address+':'+config.rpc_wallet_port+'/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"get_transfers","params":{"in":true,"account_index":'+req.body.wallet_index+'}}\' -H \'Content-Type: application/json\'',
  function(err, data, stderr){
    var jsonData=JSON.parse(data);
    if(jsonData.result.in){
      jsonData.result.in.forEach(function(value, index, array) {
        balance+=value.amount;
        addTxsToArray(value.txid,value.amount,value.timestamp, 'in');
        if(index === array.length - 1) {
          updateBalance(balance);
          getOutTxs();
        }
      });
    } else {
      res.send("No TXs");
    }
  }
);

} else {
  res.send("Bad Wallet Index");
}
});

// My goals
app.get('/my_goals', function(req, res) {
  if(req.isAuthenticated()) {
    cmd.get('curl -X POST http://'+config.rpc_wallet_address+':'+config.rpc_wallet_port+'/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"get_version"}\' -H \'Content-Type: application/json\'',
    function(err, jsonData, stderr){
      if(!err){
        res.sendFile(__dirname + '/index.html');
      } else {
        res.status(301).redirect("/error");
      }
    });
  } else {
    res.status(301).redirect("/login");
  }
});

app.get('/my_goals_index', function(req, res) {
  if(req.isAuthenticated()) {
    //check if 2FA is enabled
    const collection = db.collection('users');
    collection.find(ObjectId(req.user)).toArray(function(err, data) {
      if(data[0].enabled_2FA==="true"){
        const collection = db.collection('goals');
        collection.find({'author_id': req.user}).toArray(function(err, data) {
          // assert.strictEqual(err, null);
          if(err===null){
            res.send(data);
          } else {
            res.status(301).redirect("/error_db");
          }
        });
      } else if(data[0].enabled_2FA==="false"){
        res.send("2FA disabled");
      }
    });
  } else {
    res.status(301).redirect("/login");
  }
});


/// Relay unlimited goals
function Unlimited_Goals_Relay() {
  ///Checking for positive unlocked balance on unlimited goals...
  const collection = db.collection('goals');
  collection.find({'unlimited': "true"}).toArray(function(err, data) {
    if (data[0]){
      data.forEach(function(goal) {
          cmd.get('curl -X POST http://'+config.rpc_wallet_address+':'+config.rpc_wallet_port+'/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"get_balance","params":{"account_index":'+goal.wallet_index+'}}\' -H \'Content-Type: application/json\'',
          function(err, jsonData, stderr){
            var jsonData=JSON.parse(jsonData);
            if((jsonData.result.unlocked_balance/100)>0){
                  //Found unlimited goal with positive balance
                  //send all unlocked balance to the redirect address
                  cmd.get('curl -X POST http://'+config.rpc_wallet_address+':'+config.rpc_wallet_port+'/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"sweep_all","params":{"address":"'+goal.redirect_address+'","account_index":'+goal.wallet_index+',"ring_size":8}\' -H \'Content-Type: application/json\'',
                  function(err, jsonData, stderr){
                    var jsonData=JSON.parse(jsonData);
                    // console.log(jsonData);
                  });
            }
          });
      });
    }
  });

}
//Check and relay unlimited goals every 5 minutes
setInterval(Unlimited_Goals_Relay,300000);

app.use(express.static('public'));

if(config.env==="dev"){
    app.listen(3000);
} else if(config.env==="production"){
    var fs = require('fs');
    var https = require('https');
    https.createServer({
    key: fs.readFileSync(config.https_key),
    cert: fs.readFileSync(config.https_cert)
  }, app).listen(3443);

    var http = require('http');
    http.createServer(function (req, res) {
      res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
      res.end();
    }).listen(3000);
}

//end mongodb connection
});
