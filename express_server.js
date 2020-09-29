const bodyParser = require('body-parser');
const cookies = require('cookie-parser');
const morgan = require('morgan');
const express = require('express');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookies());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const generateRandomString = function() {
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let rand = "";
  let len = Math.ceil(Math.random() * 4) + 4; //random length from 5 to 8
  for (let i = 0; i < len; i++) {
    rand += characters.charAt(Math.floor(Math.random() * characters.length));;
  }
  return rand;
}

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.get('/hello', (request, response) => {
  response.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (request, response) => {
  const templateVars = { urls: urlDatabase, username: request.cookies.username };
  response.render('urls_index', templateVars);
});

app.get('/urls/new', (request, response) => {
  const templateVars = { username: request.cookies.username }
  response.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (request, response) => {
  const templateVars = { shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL], username: request.cookies.username };
  response.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (request, response) => {
  const longURL  = urlDatabase[request.params.shortURL];
  if (longURL.includes('http://www.')) response.redirect(`${longURL}`);
  else if (longURL.includes('www.')) response.redirect(`http://${longURL}`);
  else response.redirect(`http://www.${longURL}`);
});

app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

app.post('/login', (request, response) => {
  response.cookie('username', request.body.username);
  response.redirect(`/urls`);
});

app.post('/logout', (request, response) => {
  response.clearCookie('username');
  response.redirect(`/urls`);
});

app.post('/urls', (request, response) => {
  const short = generateRandomString();
  urlDatabase[short] = request.body.longURL;
  response.redirect(`/urls/${short}`);
});

app.post('/urls/:shortURL', (request, response) => {
  urlDatabase[request.params.shortURL] = request.body.longURL;
  response.redirect(`/urls`);
});

app.post('/urls/:shortURL/delete', (request, response) => {
  delete urlDatabase[request.params.shortURL];
  response.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});