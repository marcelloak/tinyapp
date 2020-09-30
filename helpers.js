const generateRandomString = function() {
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let rand = "";
  let len = Math.ceil(Math.random() * 4) + 4; //random length from 5 to 8
  for (let i = 0; i < len; i++) {
    rand += characters.charAt(Math.floor(Math.random() * characters.length));;
  }
  return rand;
}

const userLookup = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) return database[user];
  }
  return false;
}

const urlsForUser = function(id, database) {
  const urls = {};
  for (const url in database) {
    if (database[url].userID === id) urls[url] = database[url];
  }
  return urls;
}

module.exports = { generateRandomString, userLookup, urlsForUser }