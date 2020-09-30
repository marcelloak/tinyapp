const { generateRandomString, userLookup, urlsForUser } = require('./helpers');

const cookies = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const morgan = require('morgan');
const express = require('express');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookies({
  name: 'session',
  secret: 'BAh7CEkiD3Nlc3Npb25faWQGOgZFVEkiRTdhYTliNGY5ZjVmOTE4MjIxYTU50AMGM4OGI1Y',
}));

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "1",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
  },
};

const users = {
  "1": {
    id: "1", 
    email: "1@1", 
    password: "$2b$10$odvI5Eq0n7vicWt03uyOk.P/G53qaIr3uX6dUnkbE188.Vs9cPdJe"
  },
};

app.get('/', (req, res) => {
  
});

app.get('/register', (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  res.render('login', templateVars);
});

app.get('/urls', (req, res) => {
  if (!req.session.user_id) return res.redirect('/login');
  const templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase), user: users[req.session.user_id] };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) return res.redirect('/login');
  const templateVars = { user: users[req.session.user_id] }
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  if (!req.session.user_id) return res.redirect('/login');
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) return res.status(400).send('URL does not belong to current user');
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL  = urlDatabase[req.params.shortURL].longURL;
  if (longURL.includes('http://www.')) res.redirect(`${longURL}`);
  else if (longURL.includes('www.')) res.redirect(`http://${longURL}`);
  else res.redirect(`http://www.${longURL}`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
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
  const short = generateRandomString();
  urlDatabase[short] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${short}`);
});

app.post('/urls/:shortURL', (req, res) => {
  if (!req.session.user_id) return res.redirect('/login');
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) return res.status(400).send('URL does not belong to current user');
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (!req.session.user_id) return res.redirect('/login');
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) return res.status(400).send('URL does not belong to current user');
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});