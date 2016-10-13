// Welcome to the Wee App Server...

// Dependencies
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

// Configuration
app.set("view engine", "ejs");
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Constants

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// Routes
app.get("/", (req, res) => { //redirects to /urls
  res.redirect(303, "/urls");
});

app.get("/urls", (req, res) => { //renders urls_index
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { //renders url_new
  res.render("urls_new");
});

app.post("/urls", (req, res) => { //post from form on /urls/new
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = "weee";
  while(urlDatabase[shortURL]) {
    console.log(shortURL);
    shortURL = generateRandomString();
  }// error handling for a duplicate shortURL
  var protocol = /http:\/\//
  if (protocol.test((req.body).longURL) === true){
    urlDatabase[shortURL] = (req.body).longURL; //updates urlDatabase with new shortURL: longURL
  } else {
    urlDatabase[shortURL] = "http://" + (req.body).longURL;
  }// if user does not enter http://  need to add http://
  //if user does enter http://just use longURL
  res.redirect(303, `http://localhost:8080/urls/${shortURL}`); //redirects to urls/:id
});

app.post("/urls/:id/delete", (req, res) => { //post from delete form on urls
  let templateVars = {shortURL: req.params.id};
  delete urlDatabase[templateVars.shortURL]; //deletes shortUrl/LongURL key value pair from urlDatabase
  res.redirect(303,"/urls"); //redirects to /urls
});

app.get("/urls/:id", (req, res) => { //renders urls_show
  let shorty = req.params.id;
  let longy = urlDatabase[shorty];
  let templateVars = { "shortURL": shorty, "longy": longy };
  if(!urlDatabase[shorty]){
    res.status(404).send('Whoopsie! The site you are looking for can\'t be found so instead you get this wee 404 message');
  } else {
    res.render("urls_show", templateVars); //at this point and user must include http:// in front of the web address they enter in order for this to work
  }
});

app.get("/u/:id", (req, res) => { //redirects to long URL corresponding to :id
  let templateVars = { shortURL: req.params.id };
  if(!urlDatabase[templateVars.shortURL]){
    res.status(404).send('Whoopsie! The site you are looking for can\'t be found so instead you get this wee 404 message');
  } else {
    res.redirect(303, urlDatabase[templateVars.shortURL]); //at this point and user must include http:// in front of the web address they enter in order for this to work
  }
});

app.post("/urls/:id", (req, res) => { //post from update form on urls_show
  let templateVars = { shortURL: req.params.id };
  urlDatabase[templateVars.shortURL] = (req.body).longURL; //updates urlDatabase @ exisiting shortURL with new longURL
  // need to add error handling if update field is empty
  res.redirect(303, "/urls");
});

// Edit

// Delete


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