// Requires----------------------------------------------
const { generateRandomString, userLookup, urlsForUser, convertDate, checkAlreadyVisited } = require('./helpers');
const cookies = require('cookie-session');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const morgan = require('morgan');
const express = require('express');

// Express setup-----------------------------------------
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(cookies({
  name: 'session',
  secret: 'BAh7CEkiD3Nlc3Npb25faWQGOgZFVEkiRTdhYTliNGY5ZjVmOTE4MjIxYTU50AMGM4OGI1Y',
}));

// Databases---------------------------------------------
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "j7yr2j",
    created: convertDate(new Date()),
    numVisits: 0,
    uniqueVisits: [],
    visits: [],
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
    created: convertDate(new Date()),
    numVisits: 0,
    uniqueVisits: [],
    visits: [],
  },
};

const users = {
  "j7yr2j": {
    id: "j7yr2j",
    email: "1@1",
    password: bcrypt.hashSync('1', 10),
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "2@2",
    password: bcrypt.hashSync('2', 10),
  },
};

// GET Routes--------------------------------------------
app.get('/', (req, res) => {
  if (users[req.session.userID]) res.redirect('/urls');
  else res.redirect('/login');
});

app.get('/register', (req, res) => {
  if (users[req.session.userID]) return res.redirect('/urls');
  const templateVars = { user: undefined };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  if (users[req.session.userID]) return res.redirect('/urls');
  const templateVars = { user: undefined };
  res.render('login', templateVars);
});

app.get('/urls', (req, res) => {
  if (!users[req.session.userID]) return res.status(400).send('Need to be logged in to access');
  const templateVars = { urls: urlsForUser(req.session.userID, urlDatabase), user: users[req.session.userID] };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (!users[req.session.userID]) return res.redirect('/login');
  const templateVars = { user: users[req.session.userID] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  if (!users[req.session.userID]) return res.status(400).send('Need to be logged in to access');
  if (!urlDatabase[req.params.id]) return res.status(404).send('URL does not exist');
  if (urlDatabase[req.params.id].userID !== req.session.userID) return res.status(400).send('URL does not belong to current user');
  const templateVars = { shortURL: req.params.id, url: urlDatabase[req.params.id], user: users[req.session.userID] };
  res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => {
  if (!urlDatabase[req.params.id]) return res.status(404).send('URL does not exist');
  const longURL  = urlDatabase[req.params.id].longURL;
  if (longURL.includes('http://www.')) res.redirect(`${longURL}`);
  else if (longURL.includes('www.')) res.redirect(`http://${longURL}`);
  else res.redirect(`http://www.${longURL}`);
  urlDatabase[req.params.id].numVisits++;
  if (!checkAlreadyVisited(req.session.userID, req.params.id, urlDatabase)) urlDatabase[req.params.id].uniqueVisits.push(req.session.userID);
  const now = convertDate(new Date());
  urlDatabase[req.params.id].visits.push([now, req.session.userID || "guest"]);
});

// POST Routes-------------------------------------------
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) return res.status(400).send('Empty email or password');
  if (userLookup(req.body.email, users)) return res.status(400).send('User already exists');
  const user = {
    id: generateRandomString(),
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  users[user.id] = user;
  req.session.userID = user.id;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  if (!req.body.email || !req.body.password) return res.status(400).send('Empty email or password');
  const user = userLookup(req.body.email, users);
  if (!user) return res.status(403).send('Email not registered');
  if (!bcrypt.compareSync(req.body.password, user.password)) return res.status(403).send('Password is incorrect');
  req.session.userID = user.id;
  res.redirect(`/urls`);
});

app.post('/logout', (req, res) => {
  req.session.userID = null;
  res.redirect(`/urls`);
});

app.post('/urls', (req, res) => {
  if (!users[req.session.userID]) return res.status(400).send('Need to be logged in to create tiny url');
  const short = generateRandomString();
  const now = convertDate(new Date());
  urlDatabase[short] = { longURL: req.body.longURL, userID: req.session.userID, created: now, numVisits: 0, uniqueVisits: [], visits: []};
  res.redirect(`/urls/${short}`);
});

// PUT Routes--------------------------------------------
app.put('/urls/:id', (req, res) => {
  if (!users[req.session.userID]) return res.status(400).send('Need to be logged in to edit tiny url');
  if (urlDatabase[req.params.id].userID !== req.session.userID) return res.status(400).send('URL does not belong to current user');
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

// DELETE Routes-----------------------------------------
app.delete('/urls/:id', (req, res) => {
  if (!users[req.session.userID]) return res.status(400).send('Need to be logged in to delete tiny url');
  if (urlDatabase[req.params.id].userID !== req.session.userID) return res.status(400).send('URL does not belong to current user');
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

//Server creation----------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});