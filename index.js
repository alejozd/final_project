const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// Middleware para autenticación
app.use("/customer/auth/*", function auth(req, res, next) {
  console.log('Authorization Header:', req.session.authorization);

  if (req.session.authorization) {
    let token = req.session.authorization['accessToken']; // Access Token
    // console.log('Token:', token);

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
      if (!err) {
        // console.log('User:', user); // Debugging line
        req.user = user;
        next();
      } else {
        // console.log('JWT Error:', err); // Debugging line
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    console.log('No Authorization Header'); // Debugging line
    return res.status(403).json({ message: "User not logged in" });
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
