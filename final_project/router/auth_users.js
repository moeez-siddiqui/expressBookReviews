const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}
const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  console.log(users)
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}


//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
      let review= req.query.review;
      let isbn = req.params.isbn;

      // get the username
      let session= req.session;
      let username= session && session.authorization['username'] ? session.authorization['username'] : null;
      // Check if the ISBN exists in the books object
      if (isbn in books) {
        // Check if the user has already posted a review for the book
        if (username in books[isbn].reviews) {
          // Modify the existing review
          books[isbn].reviews[username] = review;
        } else {
          // Add a new review for the book
          console.log("before ",books[isbn].reviews[username])
          books[isbn].reviews[username] = review;
          console.log("after ",books[isbn])
        }
        return res.status(300).json({message: "Successfully updated"});
      }
      else {
        // Send an error response
        res.status(404).json({message: 'Book not found'});
      }
    }
);

regd_users.delete("/auth/review/:isbn", (req, res) => {
      let isbn = req.params.isbn;

      // get the username
      let session= req.session;
      let username= session && session.authorization['username'] ? session.authorization['username'] : null;
      // Check if the ISBN exists in the books object
      if (isbn in books) {
        // Check if the user has already posted a review for the book
        if (username in books[isbn].reviews) {
          // deleting the existing review
          delete books[isbn].reviews[username] ;
          res.status(200).json({ message: "Review deleted successfully" });
        } else {
          res.status(404).json({ message: "Review not found" });
        }

      }
      else {
        // Send an error response
        res.status(404).json({message: 'Book not found'});
      }
    }
);

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
