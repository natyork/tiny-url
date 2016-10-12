var express = require("express");
const app = express();
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());

const PORT = process.env.PORT || 8080; // default port 8080

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // debug statement to see POST parameters
  let shortURL = generateRandomString();
  res.redirect(303, `http://localhost:8080/urls/${shortURL}`);
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  urlDatabase[shortURL] = (req.body).longURL;
  // console.log(urlDatabase);


});

app.get("/urls/:id", (req, res) => { //if client requests non-existant URL, should 404.
  let templateVars = { shortURL: req.params.id };
  console.log(urlDatabase[templateVars.shortURL]);
  if(!urlDatabase[templateVars.shortURL]){
    res.status(404).send('Whoopsie! The site you are looking for can\'t be found so instead you get this sweet 404 message');
  } else {
    res.redirect(303, urlDatabase[templateVars.shortURL]); //this has no error handling at this point and user must include http:// in front of the web address they enter in order for this to work
  }
  // res.render("urls_show", templateVars);
});

// app.post("/urls/:id", (req, res) => {
//   let shorty = req.params.id;
//   console.log(shorty)
//   let longURL = urlDatabase[shorty];
//   // console.log(lo)
//   res.redirect(307, longURL);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
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