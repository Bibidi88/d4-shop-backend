require("dotenv").config();

const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");

const loginRoutes = require("./api/routes/login");
const refreshRoutes = require("./api/routes/refresh");

app.use(express.json());
app.use(cookieParser());

var sql = require("mssql");

// config for database
var config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: false,
  },
};

// connect to database
sql.connect(config, (err) => {
  if (err) console.log(err);
  else {
    console.log("SQL conection successfully");
  }
});

// Routes wich should handle requests
app.use("/login", loginRoutes);
app.use("/refresh", refreshRoutes);

app.get("/users", (req, res) => {
  // create Request object
  var request = new sql.Request();

  // query to the database and get the records
  request.query("select * from users", (err, data) => {
    if (err) console.log(err);
    // send records as a response
    res.status(200).send(data.recordset);
  });
});

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

