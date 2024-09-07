const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Validar nombre de usuario
const isValid = (username) => {
  return typeof username === 'string' && username.trim().length > 0;
};

// Verificar usuario autenticado
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token
//   console.log('Token:', token); // Debugging line

  if (token == null) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) {
    //   console.log('JWT Error:', err); // Debugging line
      return res.sendStatus(403); // Forbidden
    }
    // console.log('User:', user); // Debugging line
    req.user = user;
    next();
  });
};

// Registrar un nuevo usuario
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  if (users.some(user => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password });

  return res.status(200).json({ message: "User registered successfully" });
});

// Solo los usuarios registrados pueden iniciar sesión
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });
    
    // Almacenar el token en la sesión
    req.session.authorization = { accessToken: token };

    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// Añadir o modificar una reseña de libro
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const username = req.user ? req.user.username : null; // Obtener el nombre de usuario del token decodificado

  if (!username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  // Encontrar el libro con el ISBN dado
  const book = Object.values(books).find(b => b.isbn === isbn);
  
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Verificar si ya existe una reseña de este usuario para este libro
  let existingReviewKey = null;
  for (const [key, r] of Object.entries(book.reviews)) {
    if (r.username === username) {
      existingReviewKey = key;
      break;
    }
  }

  if (existingReviewKey) {
    // Actualizar la reseña existente
    book.reviews[existingReviewKey] = { username, review };
    return res.status(200).json({ message: "Review updated successfully" });
  } else {
    // Añadir una nueva reseña
    const reviewKey = `review${Object.keys(book.reviews).length + 1}`;
    book.reviews[reviewKey] = { username, review };
    return res.status(201).json({ message: "Review added successfully" });
  }
});

// Ruta para eliminar una reseña de libro
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let ISBN = req.params.isbn;
    books[ISBN].reviews = {}
    return res.status(200).json({messsage:"Review has been deleted"})
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
