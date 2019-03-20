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
const mongoOptions = {
  socketTimeoutMS: 30000
}
const assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
const bcrypt = require('bcrypt');
const saltRounds = 10;
const sendmail = require('sendmail')({
  smtpPort: 25
});
const keygen = require('keygen');
var crypto = require("crypto");
var escape = require('escape-html');
var cmd=require('node-cmd');
var sortBy = require('sort-by');
var waitUntil = require('wait-until');


// console.log(escape('<script>alert("test");</script>'));
// console.log(crypto.randomBytes(8).toString('hex'));

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'stellite-funding-platform';

// Hostname of your hosting
const hostname = "funding.stellite.cash";
const noreply = "no-reply@funding.stellite.cash"



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

// Configure passport.js to use the local strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (email, password, done) => {
    //Inside local strategy callback
    const checkLogin = function(db, callback) {
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
    MongoClient.connect(url,mongoOptions,function(err, client) {
      waitUntil()
      .interval(50)
      .times(Infinity)
      .condition(function() {
        return (err === null ? true : false);
      })
      .done(function(result) {
        const db = client.db(dbName);
        checkLogin(db, function() {
          client.close();
        });
      });
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
    cmd.get('curl -X POST http://127.0.0.1:18082/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"get_version"}\' -H \'Content-Type: application/json\'',
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

  //check if wallet online
  cmd.get('curl -X POST http://127.0.0.1:18082/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"get_version"}\' -H \'Content-Type: application/json\'',
  function(err, jsonData, stderr){
    if(!err){

      const title = escape(req.body.title);
      const description = escape(req.body.description);
      const unlimited = "false";
      const goal = escape(req.body.goal);
      const author = req.user;

      if(req.isAuthenticated()) {

        function addWithUsername(title,description,goal,author,author_id)
        {
          if(ValidateAmount(goal)==false){
            res.send('Bad Amount');
          } else if(title.lenght>200){
            res.send('Title too long');
          } else if(description.lenght>12000){
            res.send('Description too long');
          } else {
            const insertNewGoal = function(db, callback) {
              const collection = db.collection('goals');
              collection.insertOne({ title: title, description: description, balance: 0, unlimited: "false", categorie: "2", goal: goal, creation_date: ~~(+new Date / 1000), author: author, status: "open", author_id: author_id, wallet_index: "null", wallet_address: "null" }, function(err, result) {
                // assert.strictEqual(err, null);
                var goalID = result["ops"][0]["_id"];

                //generate wallet address
                cmd.get('curl -X POST http://127.0.0.1:18082/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"create_account","params":{"label":"'+goalID+'"}}\' -H \'Content-Type: application/json\'',
                function(err, data, stderr){
                  var data = JSON.parse(data);

                  const AddGoalWalletAddress = function(db, callback) {
                    // Get the documents collection
                    const collection = db.collection('goals');
                    // Update document where a is 2, set b equal to 1
                    collection.updateMany({ _id : goalID }
                      , { $set: { wallet_index : data.result.account_index, wallet_address: data.result.address } }, function(err, result) {
                        // assert.strictEqual(err, null);
                        res.send({ status: "success", goalID: goalID });
                        //save wallet
                        cmd.get('curl -X POST http://127.0.0.1:18082/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"store"}\' -H \'Content-Type: application/json\'',
                        function(err, data, stderr){
                          //wallet saved
                        });
                      });
                    }

                    MongoClient.connect(url,mongoOptions,function(err, client) {
                      waitUntil()
                      .interval(50)
                      .times(Infinity)
                      .condition(function() {
                        return (err === null ? true : false);
                      })
                      .done(function(result) {
                        const db = client.db(dbName);
                        AddGoalWalletAddress(db, function() {
                          client.close();
                        });
                      });
                    });
                  }
                );
              });
            }
            MongoClient.connect(url, function(err, client) {
              waitUntil()
              .interval(50)
              .times(Infinity)
              .condition(function() {
                return (err === null ? true : false);
              })
              .done(function(result) {
                const db = client.db(dbName);
                insertNewGoal(db, function() {
                  client.close();
                });
              });
            });
          }
        }

        const getUserName = function(db, callback) {
          const collection = db.collection('users');
          collection.find(ObjectId(req.user)).toArray(function(err, data) {
            // assert.strictEqual(err, null);
            addWithUsername(title,description,goal,data[0].username,req.user)
          });
        }
        MongoClient.connect(url,mongoOptions,function(err, client) {
          waitUntil()
          .interval(50)
          .times(Infinity)
          .condition(function() {
            return (err === null ? true : false);
          })
          .done(function(result) {
            const db = client.db(dbName);
            getUserName(db, function() {
              client.close();
            });
          });
        });
      } else {
        res.status(301).redirect("/login");
      }
    } else {
      res.status(301).redirect("/error");
    }
  });
});

app.post('/check_username', function(req, res) {
  var username = req.body.username;
  if(ValidateUsername(username)==true){
    const checkIfUsernameExist = function(db, callback) {
      const collection = db.collection('users');
      collection.find({'username': username}).toArray(function(err, data) {
        // assert.strictEqual(err, null);
        if (data[0]){
          res.send('Username already exist');
        } else {
          res.send('Available');
        }
      });
    }
    MongoClient.connect(url,mongoOptions,function(err, client) {
      waitUntil()
      .interval(50)
      .times(Infinity)
      .condition(function() {
        return (err === null ? true : false);
      })
      .done(function(result) {
        const db = client.db(dbName);
        checkIfUsernameExist(db, function() {
          client.close();
        });
      });
    });
  } else {
    res.send("Invalid username, allowed: a-z, A-Z, 0-9, underscore and dash");
  }
});

app.post('/check_email', function(req, res) {
  var email = req.body.email;
  if(ValidateEmail(email)==true){
    const checkIfEmailExist = function(db, callback) {
      const collection = db.collection('users');
      collection.find({'email': email}).toArray(function(err, data) {
        // assert.strictEqual(err, null);
        if (data[0]){
          res.send('Email already registered');
        } else {
          res.send('Available');
        }
      });
    }
    MongoClient.connect(url,mongoOptions,function(err, client) {
      waitUntil()
      .interval(50)
      .times(Infinity)
      .condition(function() {
        return (err === null ? true : false);
      })
      .done(function(result) {
        const db = client.db(dbName);
        checkIfEmailExist(db, function() {
          client.close();
        });
      });
    });
  } else {
    res.send("Invalid email address");
  }
});

app.post('/activate', function(req, res) {
  var activation_code = req.body.activation_code;
  if(ValidateActivationCode(activation_code)==true){
    const checkIfEmailExist = function(db, callback) {
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
    }
    MongoClient.connect(url,mongoOptions,function(err, client) {
      waitUntil()
      .interval(50)
      .times(Infinity)
      .condition(function() {
        return (err === null ? true : false);
      })
      .done(function(result) {
        const db = client.db(dbName);
        checkIfEmailExist(db, function() {
          client.close();
        });
      });
    });
  } else {
  res.send("Invalid code format");
  }
});

function ActivationTimer() {
  // Checking unactivated registered users
  const checkUnactivatedRegisteredUsers = function(db, callback) {
    const collection = db.collection('users');
    collection.find({'activated': "false"}).toArray(function(err, data) {
      // assert.strictEqual(err, null);
      if (data[0]){
        data.forEach(function(unactivated_user) {
          // activation limit = 2 Hours (7200 seconds)
          if((~~(+new Date / 1000)-unactivated_user.creation_date) > 3600){
            const removeDocument = function(db, callback) {
              const collection = db.collection('users');
              collection.deleteOne({ username : unactivated_user.username }, function(err, result) {
                // assert.strictEqual(err, null);
                // assert.equal(1, result.result.n);
                // removed user
              });
            }
            MongoClient.connect(url,mongoOptions,function(err, client) {
              waitUntil()
              .interval(50)
              .times(Infinity)
              .condition(function() {
                return (err === null ? true : false);
              })
              .done(function(result) {
                const db = client.db(dbName);
                removeDocument(db, function() {
                  client.close();
                });
              });
            });
          }
        });
      }
    });
  }
  MongoClient.connect(url,mongoOptions,function(err, client) {
    waitUntil()
    .interval(50)
    .times(Infinity)
    .condition(function() {
      return (err === null ? true : false);
    })
    .done(function(result) {
      const db = client.db(dbName);
      checkUnactivatedRegisteredUsers(db, function() {
        client.close();
      });
    });
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
    } else if(username.lenght>20){
      res.send("Too long username");
    } else if(email.lenght>320){
      res.send("Too long email address");
    } else if(password.lenght>256){
      res.send("Too long password");
    } else {
      const insertCreatedAccount = function(db, callback) {
        const collection = db.collection('users');
        bcrypt.hash(password, saltRounds, function(err, hash) {
          collection.find({'username': username}).toArray(function(err, data) {
            // assert.strictEqual(err, null);
            if(!data[0]){
              collection.find({'email': email}).toArray(function(err, data) {
                // assert.strictEqual(err, null);
                if(!data[0]){
                  const activation_code=keygen.url(keygen.medium);
                  collection.insertOne({ username: username, email: email, password: hash, activated: "false", activation_code: activation_code, creation_date: ~~(+new Date / 1000) }, function(err, result) {
                    // assert.strictEqual(err, null);
                    res.send("Registered");
                    sendmail({
                      from: noreply,
                      to: email,
                      subject: 'Please confirm your email address - Stellite Funding Platform',
                      html: '<h2>Stellite Funding Platform</h2><p>Please go to <a href="https://'+hostname+'/activate">https://'+hostname+'/activate</a>, and enter the following code:<br><p><strong>'+activation_code+'</strong></p></p><h6 style="font-weight:normal;">This code is only available for 1 hour, after that you will need to register again.</h6>',
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
      MongoClient.connect(url, function(err, client) {
        waitUntil()
        .interval(50)
        .times(Infinity)
        .condition(function() {
          return (err === null ? true : false);
        })
        .done(function(result) {
          const db = client.db(dbName);
          insertCreatedAccount(db, function() {
            client.close();
          });
        });
      });
    }
  }
});

app.get('/logged', function(req, res) {
  if(req.isAuthenticated()) {
    const checkLogged = function(db, callback) {
      const collection = db.collection('users');
      collection.find(ObjectId(req.user)).toArray(function(err, data) {
        // assert.strictEqual(err, null);
        res.send({ user_username: data[0].username });
      });
    }
    MongoClient.connect(url,mongoOptions,function(err, client) {
      waitUntil()
      .interval(50)
      .times(Infinity)
      .condition(function() {
        return (err === null ? true : false);
      })
      .done(function(result) {
        const db = client.db(dbName);
        checkLogged(db, function() {
          client.close();
        });
      });
    });
  } else {
    res.send('false')
  }
});

app.post('/login', function(req, res, next) {
  if(ValidateEmail(req.body.email)==true){
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.send(info); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.send('Logged');
      });
    })(req, res, next);
  } else {
    res.send("Invalid email address");
  }
});

app.get('/logout', function (req, res){
  req.session.destroy(function (err) {
    res.status(301).redirect("/login");
  });
});


///// Funding Goals
app.get('/categories', function(req, res) {
  const getCategories = function(db, callback) {
    const collection = db.collection('categories');
    collection.find({}).toArray(function(err, data) {
      // assert.strictEqual(err, null);
      if(err===null){
      res.send(data);
      } else {
      res.status(301).redirect("/error_db");
      }
    });
  }
  MongoClient.connect(url,mongoOptions,function(err, client) {
    waitUntil()
    .interval(50)
    .times(Infinity)
    .condition(function() {
      return (err === null ? true : false);
    })
    .done(function(result) {
        const db = client.db(dbName);
        getCategories(db, function() {
          client.close();
        });
    });
  });
});

app.post('/goals', function(req, res) {
  const getGoals = function(db, callback) {
    const collection = db.collection('goals');
    collection.find({'categorie': req.body.categorie_id}).toArray(function(err, data) {
      // assert.strictEqual(err, null);
      if(err===null){
        res.send(data);
      } else {
        res.status(301).redirect("/error_db");
      }
    });
  }
  MongoClient.connect(url,mongoOptions,function(err, client) {
    waitUntil()
    .interval(50)
    .times(Infinity)
    .condition(function() {
      return (err === null ? true : false);
    })
    .done(function(result) {
      const db = client.db(dbName);
      getGoals(db, function() {
        client.close();
      });
    });
  });
});

app.get('/goal/:id*', function(req, res, next) {
  cmd.get('curl -X POST http://127.0.0.1:18082/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"get_version"}\' -H \'Content-Type: application/json\'',
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
    const getGoal = function(db, callback) {
      const collection = db.collection('goals');
      collection.find(ObjectId(req.body._id)).toArray(function(err, data) {
        // assert.strictEqual(err, null);
        if(err===null){
          if(!data[0]){
            res.send("Goal not found");
          } else {
            cmd.get('curl -X POST http://127.0.0.1:18082/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"get_balance","params":{"account_index":'+data[0].wallet_index+'}}\' -H \'Content-Type: application/json\'',
            function(err, jsonData, stderr){
              var jsonData=JSON.parse(jsonData);
              data[0].balance = jsonData.result.balance/100;
              if(data[0].status==="open"){
                ///update goal balance
                const collectiongoal = db.collection('goals');
                collectiongoal.updateOne({ wallet_index : data[0].wallet_index }
                  , { $set: { balance : data[0].balance } }, function(err, result) {
                    // assert.strictEqual(err, null);
                    // assert.equal(1, result.result.n);
                  });
                }
                res.send(data);
              }
            );
          }
        } else {
        res.status(301).redirect("/error_db");
        }
      });
    }
    MongoClient.connect(url,mongoOptions,function(err, client) {
      waitUntil()
      .interval(50)
      .times(Infinity)
      .condition(function() {
        return (err === null ? true : false);
      })
      .done(function(result) {
        const db = client.db(dbName);
        getGoal(db, function() {
          client.close();
        });
      });
    });
  } else {
    res.send("Bad ID");
  }
});

app.post('/goal_txs', function(req, res) {

  if(ValidateWalletIndex(req.body.wallet_index)){

    var transactions = new Array();

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
      cmd.get('curl -X POST http://127.0.0.1:18082/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"get_transfers","params":{"out":true,"account_index":'+req.body.wallet_index+'}}\' -H \'Content-Type: application/json\'',
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
  cmd.get('curl -X POST http://127.0.0.1:18082/json_rpc -d \'{"jsonrpc":"2.0","id":"0","method":"get_transfers","params":{"in":true,"account_index":'+req.body.wallet_index+'}}\' -H \'Content-Type: application/json\'',
  function(err, data, stderr){
    var jsonData=JSON.parse(data);
    if(jsonData.result.in){
      jsonData.result.in.forEach(function(value, index, array) {
        addTxsToArray(value.txid,value.amount,value.timestamp, 'in');
        if(index === array.length - 1) {
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


app.use(express.static('public'));
app.listen(3000);

//   var fs = require('fs');
//   var https = require('https');
//   https.createServer({
//   key: fs.readFileSync('/etc/letsencrypt/live/funding.stellite.cash/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/funding.stellite.cash/fullchain.pem')
// }, app).listen(3443);
