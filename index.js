//use path module
const path = require('path');
//use express module
const express = require('express');
//use hbs view engine
const hbs = require('hbs');
//use bodyParser middleware
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
//use mysql database
const mysql = require('mysql');
const app = express();
const crypto = require('crypto');

//Create connection
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'SKZI86477',
  database: 'crud_db'
});

//connect to database
conn.connect((err) => {
  if (err) throw err;
  console.log('Mysql Connected...');
});

//set views file
app.set('views', path.join(__dirname, 'views'));
//set view engine
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//set public folder as static folder for static file
app.use('/assets', express.static(__dirname + '/public'));

const generateAuthToken = () => {
  return crypto.randomBytes(30).toString('hex');
}

const authTokens = {};

const getHashedPassword = (password) => {
  const sha256 = crypto.createHash('sha256');
  const hash = sha256.update(password).digest('base64');
  return hash;
}

app.use((req, res, next) => {
  // Get auth token from the cookies
  const authToken = req.cookies['authToken'];

  // Inject the user to the request
  req.user = authTokens[authToken];

  next();
});

const requireAuth = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.render('login', {
      message: 'Please login to continue',
      messageClass: 'alert-danger'
    });
  }
};

app.get('/', (req, res) => {
  res.render('login', {
  });
});

app.get('/signup', (req, res) => {
  res.render('sign', {
  });
});

app.post('/signup/save', (req, res) => {
  let data = { username: req.body.username, password: req.body.password };
  data.password = getHashedPassword(data.password);
  let sql = "SELECT * FROM users WHERE username = '" + req.body.username + "'";
  let query = conn.query(sql, (err, results) => {
    console.log("Received results with count of " + results.length);
    if (err) throw err;
    if (results.length > 0) {
      res.render('sign', {
        message: 'Such username already exists',
        messageClass: 'alert-danger'
      });
    }
    else {
      let sql = "INSERT INTO users SET ?";
      let query = conn.query(sql, data, (err, results) => {
        if (err) {
          res.render('sign', {
            message: 'Try again',
            messageClass: 'alert-danger'
          });
          return;
        }
      });
    }
    res.render('login', {
      message: 'Successfully signed up',
      messageClass: 'alert-danger'
    });
  });
});
// check for duplicate username
app.post('/login', (req, res) => {
  console.log("Received username value " + req.body.username);
  let sql = "SELECT * FROM users WHERE username = '" + req.body.username + "'";
  let query = conn.query(sql, (err, results) => {
    console.log("Received results with count of " + results.length);
    if (err) throw err;
    if (results.length > 0) {
      if (results[0].username === req.body.username && results[0].password === getHashedPassword(req.body.password)) {
        const authToken = generateAuthToken();

        // Store authentication token
        authTokens[authToken] = results[0];

        // Setting the auth token in cookies
        res.cookie('authToken', authToken);

        res.redirect('/products');
      }
    }
    res.render('login', {
      message: 'Invalid username or password',
      messageClass: 'alert-danger'
    });
  });
});



//route for homepage
app.get('/products', requireAuth, (req, res) => {
  let sql = "SELECT * FROM expenses";
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.render('expenses_view', {
      results: results
    });
  });
});

//route for insert data
app.post('/products/save', requireAuth, (req, res) => {
  let data = { expense_type: req.body.expense_type, expense_price: req.body.expense_price };
  let sql = "INSERT INTO expenses SET ?";
  let query = conn.query(sql, data, (err, results) => {
    if (err) throw err;
    res.redirect('/products');
  });
});

//route for update data
app.post('/products/update', requireAuth, (req, res) => {
  let sql = "UPDATE expenses SET expense_type='" + req.body.expense_type + "', expense_price='" + req.body.expense_price + "' WHERE expense_id=" + req.body.id;
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect('/products');
  });
});

//route for delete data
app.post('/products/delete', requireAuth, (req, res) => {
  let sql = "DELETE FROM expenses WHERE expense_id=" + req.body.expense_id + "";
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect('/products');
  });
});

app.post('/logout', requireAuth, (req, res) => {
  const authToken = req.cookies['authToken'];
  authTokens[authToken] = null;
  res.render('login', {
    message: 'You have logged out',
    messageClass: 'alert-info'
  });
});

//server listening
app.listen(8000, () => {
  console.log('Server is running at port 8000');
});