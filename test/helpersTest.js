const { generateRandomString, userLookup, urlsForUser } = require('../helpers');

const { assert } = require('chai');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

describe('userLookup', () => {
  it('should return a user when given valid email', () => {
    const userID = userLookup("user@example.com", testUsers).id;
    const expectedOutput = "userRandomID";
    assert.equal(userID, expectedOutput);
  });

  it('should return false when given invalid email', () => {
    const user = userLookup("user3@example.com", testUsers);
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});