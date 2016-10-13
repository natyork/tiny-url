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

let username = "";


// ROUTES

//redirects to /urls
app.get("/", (req, res) => {
  res.redirect(303, "/urls");
});


// renders urls_index
app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});


// renders url_new
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
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

// post from header login form
// sets cookie
// redirects to /
app.post("/login", (req, res) => {
  username = req.body.username;
  res.cookie("username", username);
  res.redirect(303,"/");
});


// post from header logout form
// clears cookie
// redirects to /
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect(303, "/");
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
  let shorty = req.params.id;
  let longy = urlDatabase[shorty];
  let templateVars = {
    username: req.cookies["username"],
    shortURL: shorty,
    longy: longy
  };
  if(!urlDatabase[shorty]){
    res.status(404).send('Whoopsie! The site you are looking for can\'t be found so instead you get this wee 404 message');
  } else {
    res.render("urls_show", templateVars);
  }
});


// redirects to long URL corresponding to :id
app.get("/u/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id};
  if(!urlDatabase[templateVars.shortURL]){
    res.status(404).send('Whoopsie! The site you are looking for can\'t be found so instead you get this wee 404 message');
  } else {
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