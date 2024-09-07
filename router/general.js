const Axios = require("axios")
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  if(username&&password){
      const present = users.filter((user)=> user.username === username)
      if(present.length===0){
          users.push({"username":req.body.username,"password":req.body.password});
          return res.status(201).json({message:"USer Created successfully"})
      }
      else{
        return res.status(400).json({message:"Already exists"})
      }
  }
  else if(!username && !password){
    return res.status(400).json({message:"Bad request"})
  }
  else if(!username || !password){
    return res.status(400).json({message:"Check username and password"})
  } 
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  //Write your code here
  try {      
    const getBooks = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(books);
        }, 1000);
      });
    };

    const booksList = await getBooks();

    res.send(JSON.stringify(booksList, null, 4));
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const ISBN = req.params.isbn;
  
    const booksBasedOnIsbn = (ISBN) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const book = books[ISBN];
          if (book) {
            resolve(book);
          } else {
            reject(new Error("Book not found"));
          }
        }, 1000);
      });
    };
  
    booksBasedOnIsbn(ISBN)
      .then((book) => {
        res.json(book);
      })
      .catch((err) => {
        res.status(404).json({ error: "Book not found" });
      });
  });

  
// Get book details based on author
public_users.get('/author/:author',async (req, res) => {
  //Write your code here
  const author = req.params.author;
   const booksBasedOnAuthor = (auth) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Convierte el objeto books en un array para poder filtrarlo
        const filteredBooks = Object.values(books).filter((b) => b.author === auth);
        
        if (filteredBooks.length > 0) {
          resolve(filteredBooks);
        } else {
          reject(new Error("Books not found"));
        }
      }, 1000);
    });
  };

  // Llama a la función y maneja la respuesta
  booksBasedOnAuthor(author)
    .then((filteredBooks) => {
      res.json(filteredBooks);
    })
    .catch((err) => {
      res.status(400).json({ error: err.message });
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;

  const booksBasedOnTitle = (bookTitle) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Convierte el objeto books en un array para poder filtrarlo
        const filteredBooks = Object.values(books).filter((b) => b.title === bookTitle);
        
        if (filteredBooks.length > 0) {
          resolve(filteredBooks);
        } else {
          reject(new Error("Book not found"));
        }
      }, 1000);
    });
  };

  // Llama a la función y maneja la respuesta
  booksBasedOnTitle(title)
    .then((filteredBooks) => {
      res.json(filteredBooks);
    })
    .catch((err) => {
      res.status(400).json({ error: err.message });
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  // Encuentra el libro con el ISBN proporcionado
  const book = Object.values(books).find(b => b.isbn === isbn);

  if (book) {
    // Envía las reseñas del libro como respuesta JSON
    res.json(book.reviews);
  } else {
    // Si no se encuentra el libro, envía un error 404
    res.status(404).json({ error: "Book not found" });
  }
});

module.exports.general = public_users;
