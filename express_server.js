const { generateRandomString, userLookup, urlsForUser, convertDate, checkAlreadyVisited } = require('./helpers');

const cookies = require('cookie-session');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const morgan = require('morgan');
const express = require('express');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'))
app.use(cookies({
  name: 'session',
  secret: 'BAh7CEkiD3Nlc3Npb25faWQGOgZFVEkiRTdhYTliNGY5ZjVmOTE4MjIxYTU50AMGM4OGI1Y',
}));

// Creates a date of when the server is started
// To be used as creation date of test urls
let today = new Date();
today = convertDate(today);

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "1",
    created: today,
    numVisits: 0,
    uniqueVisits: [],
    visits: [],
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
    created: today,
    numVisits: 0,
    uniqueVisits: [],
    visits: [],
  },
};

const users = {
  "1": { // basic user for testing purposes
    id: "1", 
    email: "1@1", 
    password: "$2b$10$odvI5Eq0n7vicWt03uyOk.P/G53qaIr3uX6dUnkbE188.Vs9cPdJe" // hashed '1' for testing purposes
  },
};

app.get('/', (req, res) => {
  if (req.session.user_id) res.redirect('/urls');
  else res.redirect('/login');
});

app.get('/register', (req, res) => {
  if (req.session.user_id) return res.redirect('/urls');
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  if (req.session.user_id) return res.redirect('/urls');
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  res.render('login', templateVars);
});

app.get('/urls', (req, res) => {
  if (!req.session.user_id) return res.status(400).send('Need to be logged in to access');
  const templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase), user: users[req.session.user_id] };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) return res.redirect('/login');
  const templateVars = { user: users[req.session.user_id] }
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  if (!req.session.user_id) return res.status(400).send('Need to be logged in to access');
  if (!urlDatabase[req.params.id]) return res.status(404).send('URL does not exist');
  if (urlDatabase[req.params.id].userID !== req.session.user_id) return res.status(400).send('URL does not belong to current user');
  const templateVars = { shortURL: req.params.id, url: urlDatabase[req.params.id], user: users[req.session.user_id] };
  res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => {
  if (!urlDatabase[req.params.id]) return res.status(404).send('URL does not exist');
  const longURL  = urlDatabase[req.params.id].longURL;
  if (longURL.includes('http://www.')) res.redirect(`${longURL}`);
  else if (longURL.includes('www.')) res.redirect(`http://${longURL}`);
  else res.redirect(`http://www.${longURL}`);
  urlDatabase[req.params.id].numVisits++;
  if (!checkAlreadyVisited(req.session.user_id, req.params.id, urlDatabase)) urlDatabase[req.params.id].uniqueVisits.push(req.session.user_id);
  let now = new Date();
  now = convertDate(now);
  urlDatabase[req.params.id].visits.push([now, req.session.user_id || "guest"]);
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) return res.status(400).send('Empty email or password');
  if (userLookup(req.body.email, users)) return res.status(400).send('User already exists');
  const user = {};
  user.id = generateRandomString();
  user.email = req.body.email;
  user.password = bcrypt.hashSync(req.body.password, 10);
  users[user.id] = user;
  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const user = userLookup(req.body.email, users);
  if (!user) return res.status(403).send('Email not registered');
  if (!bcrypt.compareSync(req.body.password, user.password)) return res.status(403).send('Password is incorrect');
  req.session.user_id = user.id;
  res.redirect(`/urls`);
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect(`/urls`);
});

app.post('/urls', (req, res) => {
  if (!req.session.user_id) return res.status(400).send('Need to be logged in to create tiny url');
  const short = generateRandomString();
  let now = new Date();
  now = convertDate(now);
  urlDatabase[short] = { longURL: req.body.longURL, userID: req.session.user_id, created: now, numVisits: 0, uniqueVisits: [], visits: []};
  res.redirect(`/urls/${short}`);
});

app.put('/urls/:id', (req, res) => {
  if (!req.session.user_id) return res.status(400).send('Need to be logged in to edit tiny url');
  if (urlDatabase[req.params.id].userID !== req.session.user_id) return res.status(400).send('URL does not belong to current user');
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.delete('/urls/:id', (req, res) => {
  if (!req.session.user_id) return res.status(400).send('Need to be logged in to delete tiny url');
  if (urlDatabase[req.params.id].userID !== req.session.user_id) return res.status(400).send('URL does not belong to current user');
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});