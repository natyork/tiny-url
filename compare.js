

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


app.get("/urls/new", (req, res) => {
  let current_user = req.cookies.user_id;
  if(current_user) {
    let username = users[current_user].email;
    let templateVars = { username: username };
    // res.status(200); //not sure if this needs to be here
    res.render("urls_new", templateVars);
  } else {
    res.redirect(303, "/login"); //instructions conflict on this point regarding status code (401 versus redirect)
  }
});

