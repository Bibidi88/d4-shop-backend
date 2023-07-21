require("dotenv").config();

const express = require("express");
const app = express();

app.use('/images', express.static('public/data/uploads'));

const itemRoutes = require("./api/routes/items");
const orderRoutes = require("./api/routes/orders");

var sql = require("mssql");

// config for your database
var config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: false,
  },
};

// connect to your database
sql.connect(config, (err) => {
  if (err) console.log(err);
  else {
    console.log("SQL conection successfully");
  }
});

// Routes wich should handle requests
app.use("/trades", itemRoutes);
app.use("/orders", orderRoutes);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});



module.exports = app;
