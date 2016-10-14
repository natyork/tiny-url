// Welcome to the Wee App Server...


// DEPENDENCIES
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


// CONFIGURATION
app.set("view engine", "ejs");

const PORT = process.env.PORT || 8080;

app.use(cookieParser());


// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: false }));


// CONSTANTS
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  blarp3: {
    id: "blarp3",
    username: "blarp@bmail.com",
    password: "blarpityblarp"
  }
};


// ROUTES

// redirects to /urls if logged in, otherwise redirects to /login
app.get("/", (req, res) => {
  let current_user = req.cookies.user_id;
  if (current_user) {
    res.redirect(303, "/urls");
  } else {
    res.redirect(303, "/login");
  }
});


// renders urls_index if logged in, otherwise redirects to /login
app.get("/urls", (req, res) => {
  let current_user = req.cookies.user_id;
  if(current_user) {
    let username = users[current_user].username;
    let templateVars = {
      username: username,
      urls: urlDatabase,
      current_user: current_user
    };
    // res.status(200); //not sure if this needs to be here
    res.render("urls_index", templateVars);
  } else {
    res.redirect(303, "/login"); // instructions conflict on this point regarding status code (401 versus redirect)
  }
});


// renders url_new
app.get("/urls/new", (req, res) => {
  let current_user = req.cookies.user_id;
  if(current_user) {
    let username = users[current_user].email;
    let templateVars = {
      username: username,
      current_user: current_user
     };
    // res.status(200); //not sure if this needs to be here
    res.render("urls_new", templateVars);
  } else {
    res.redirect(303, "/login"); //instructions conflict on this point regarding status code (401 versus redirect)
  }
});


// post from create form in /urls/new, updates urlDatabase, then redirects to urls/:id
// includes error handling for:
//  -duplicate shortURL
//  -add protocol to longURL if not included by user
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();

  while(urlDatabase[shortURL]) {
    shortURL = generateRandomString();
  }

  var protocol = /http:\/\//
  if (protocol.test((req.body).longURL) === true){
    urlDatabase[shortURL] = (req.body).longURL;
  } else {
    urlDatabase[shortURL] = "http://" + (req.body).longURL;
  }

  res.redirect(303, `http://localhost:8080/urls/${shortURL}`);
});


// render login page
app.get("/login", (req, res) => {
  res.render("login");
});

// post from login form
// sets cookie
// redirects to /
app.post("/login", (req, res) => {
  let username = req.body.email;
  let password = req.body.password;
  console.log(users);
  let unMatch = false;
  let pwMatch = false;
  let id = "";

  for (key in users) {
    console.log(key);
    if (users[key].username === username){
      id = users[key].id;
      console.log(id);
      console.log("un-match");
      unMatch = true;
    }
  }

  if (id && users[id].password === password){
    pwMatch = true;
    console.log(pwMatch);
  }

  if (unMatch && pwMatch) {
    res.cookie("user_id", id);
    res.redirect("/");
  } else {
    res.status(403).send('Whoopsie! 403 Forbidden.')
  }
});






// post from header logout form
// clears cookie
// redirects to /
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(303, "/");
});


// render register page
app.get("/register", (req, res) => {
  res.render("register");
});


// posts from register form *********************
// generates unique id and stores email/ pw
//  -includes check for duplicate randomId creation
//  -checks for exisiting entry in database
// set user_id cookie
// redirect to /
app.post("/register", (req, res) => {
  let randomId = generateRandomString();

  while(users[randomId]) {
    randomId = generateRandomString();
  }
  let username = req.body.email;
  let password = req.body.password;

  let match = false;
  for (key in users) {
    if (users[key].username === username){
      console.log("match");
      match = true;
    } else {
      console.log("no match")
    }
  }
  if (match || !username || !password){
    res.status(400).send('Whoopsie! 400 Bad Request.');
  }
  else {
    users[randomId] = {};
    console.log(users[randomId]);
    users[randomId].id = randomId;
    users[randomId].username = username;
    users[randomId].password = password;

    res.cookie("user_id", randomId);

    res.redirect(303, "/");
  }
});


// post from delete form on urls, deletes URL entry from urLDatabase, then redirects to /urls
app.post("/urls/:id/delete", (req, res) => {
  let templateVars = {shortURL: req.params.id};
  delete urlDatabase[templateVars.shortURL];
  res.redirect(303,"/urls");
});


// renders urls_show, includes error handling if shortURL does not exist
// TODO: clean up all the variables that were used to break down the problem
app.get("/urls/:id", (req, res) => {

let current_user = req.cookies.user_id;
  if(current_user) {
    let username = users[current_user].email;
    let shortURL = req.params.id;
    let longURL = urlDatabase[shortURL];
    let templateVars = {
      username: username,
      shortURL: shortURL,
      longURL: longURL,
      current_user: current_user
    };
    if(!urlDatabase[shortURL]){
      res.status(404).send('Whoopsie! The site you are looking for can\'t be found so instead you get this wee 404 message');
    } else {
      // res.status(200); //not sure if this needs to be here
      res.render("urls_show", templateVars);
    }
  } else {
    res.redirect(303, "/login"); //instructions conflict on this point regarding status code (401 versus redirect)
  }
});


// redirects to long URL corresponding to :id
app.get("/u/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id};
  if(!urlDatabase[templateVars.shortURL]){
    res.status(404).send('Whoopsie! The site you are looking for can\'t be found so instead you get this wee 404 message');
  } else {
    // res.status(200); //not sure if this needs to be here
    res.redirect(303, urlDatabase[templateVars.shortURL]);
  }
});

// post from update form on urls_show, updates urlDatabase and redirects to /urls
// includes error handling for:
//  -form submitted with empty field
//  -add protocol to longURL if not included by user
app.post("/urls/:id", (req, res) => {
  let templateVars = {shortURL: req.params.id};
  if (((req.body).longURL) !== "") {
    var protocol = /http:\/\//
    if (protocol.test((req.body).longURL) === true){
      urlDatabase[templateVars.shortURL] = (req.body).longURL;
    } else {
      urlDatabase[templateVars.shortURL] = "http://" + (req.body).longURL;
    }
    res.redirect(303, "/urls");
  }
});

// EDIT

// DELETE


app.listen(PORT, () => {
  console.log(`Wee URL app listening on port ${PORT}!`);
});

function generateRandomString() {
  let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let string_length = 6;
  let randomstring = '';
  for (let i=0; i<string_length; i++) {
    let rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum,rnum+1);
  }
  return randomstring;
}