const { generateRandomString, userLookup, urlsForUser } = require('./helpers');

const bodyParser = require('body-parser');
const cookies = require('cookie-session');
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

app.get('/', (request, response) => {
  
});

app.get('/register', (request, response) => {
  const templateVars = { urls: urlDatabase, user: users[request.session.user_id] };
  response.render('register', templateVars);
});

app.get('/login', (request, response) => {
  const templateVars = { urls: urlDatabase, user: users[request.session.user_id] };
  response.render('login', templateVars);
});

app.get('/urls', (request, response) => {
  if (!request.session.user_id) return response.redirect('/login');
  const templateVars = { urls: urlsForUser(request.session.user_id, urlDatabase), user: users[request.session.user_id] };
  response.render('urls_index', templateVars);
});

app.get('/urls/new', (request, response) => {
  if (!request.session.user_id) return response.redirect('/login');
  const templateVars = { user: users[request.session.user_id] }
  response.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (request, response) => {
  if (!request.session.user_id) return response.redirect('/login');
  if (urlDatabase[request.params.shortURL].userID !== request.session.user_id) return response.status(400).send('URL does not belong to current user');
  const templateVars = { shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL].longURL, user: users[request.session.user_id] };
  response.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (request, response) => {
  const longURL  = urlDatabase[request.params.shortURL].longURL;
  if (longURL.includes('http://www.')) response.redirect(`${longURL}`);
  else if (longURL.includes('www.')) response.redirect(`http://${longURL}`);
  else response.redirect(`http://www.${longURL}`);
});

app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

app.post('/register', (request, response) => {
  if (!request.body.email || !request.body.password) return response.status(400).send('Empty email or password');
  if (userLookup(request.body.email, users)) return response.status(400).send('User already exists');
  const user = {};
  user.id = generateRandomString();
  user.email = request.body.email;
  user.password = bcrypt.hashSync(request.body.password, 10);
  users[user.id] = user;
  request.session.user_id = user.id;
  response.redirect('/urls');
});

app.post('/login', (request, response) => {
  const user = userLookup(request.body.email, users);
  if (!user) return response.status(403).send('Email not registered');
  if (!bcrypt.compareSync(request.body.password, user.password)) return response.status(403).send('Password is incorrect');
  request.session.user_id = user.id;
  response.redirect(`/urls`);
});

app.post('/logout', (request, response) => {
  request.session.user_id = null;
  response.redirect(`/urls`);
});

app.post('/urls', (request, response) => {
  const short = generateRandomString();
  urlDatabase[short] = { longURL: request.body.longURL, userID: request.session.user_id };
  response.redirect(`/urls/${short}`);
});

app.post('/urls/:shortURL', (request, response) => {
  if (!request.session.user_id) return response.redirect('/login');
  if (urlDatabase[request.params.shortURL].userID !== request.session.user_id) return response.status(400).send('URL does not belong to current user');
  urlDatabase[request.params.shortURL].longURL = request.body.longURL;
  response.redirect(`/urls`);
});

app.post('/urls/:shortURL/delete', (request, response) => {
  if (!request.session.user_id) return response.redirect('/login');
  if (urlDatabase[request.params.shortURL].userID !== request.session.user_id) return response.status(400).send('URL does not belong to current user');
  delete urlDatabase[request.params.shortURL];
  response.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});