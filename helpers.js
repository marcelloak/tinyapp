// Generates a random string of random length containing letters or numbers
const generateRandomString = function() {
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let rand = "";
  let len = Math.ceil(Math.random() * 4) + 4; //random length from 5 to 8
  for (let i = 0; i < len; i++) {
    rand += characters.charAt(Math.floor(Math.random() * characters.length));;
  }
  return rand;
}

// Returns back a user object that matches the given email within the given database, or false if none match
const userLookup = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) return database[user];
  }
  return false;
}

// Returns all urls within given database that are owned by the given userid, or an empty object if none
const urlsForUser = function(id, database) {
  const urls = {};
  for (const url in database) {
    if (database[url].userID === id) urls[url] = database[url];
  }
  return urls;
}

// Converts given date to better format, and adjusts for timezone if available or to MST if none available
const convertDate = function(date) {
  let offset = date.getTimezoneOffset();
  offset = offset || 6 * 60;
  date = new Date(date.getTime() - (offset * 60 * 1000)); 
  date = date.toISOString().split('T');
  date = `${date[1].split('.')[0]} ${date[0].split('-')[1]}-${date[0].split('-')[2]}-${date[0].split('-')[0]}`;
  return date;
}

// Returns back true if given userid is within the unique visits of a given site within a given database of urls
// or if site doesn't exist in database, otherwise returns false
const checkAlreadyVisited = function(id, siteID, database) {
  let site = {};
  site = database[siteID];
  if (!site) return true;
  for (const ids of site.uniqueVisits) {
    if (ids === id) return true;
  }
  return false;
}

module.exports = { generateRandomString, userLookup, urlsForUser, convertDate, checkAlreadyVisited }