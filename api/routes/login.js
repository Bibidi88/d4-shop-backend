const express = require("express");
const router = express.Router();

const functions = require("../functions.js");
var sql = require("mssql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");


router.use(cors());

router.use(express.json());

router.post("/", cors(functions.corsOptionsDelegate), async (req, res) => {
  
  // create sql Request object
  var request = new sql.Request();

  // create sql query
  var query = `SELECT * FROM users WHERE email = '${req.body.username}';`;

  // query to the database and get the records
  request.query(query, async (err, data) => {
    if (err) {
      console.log(err);
      res.res.sendStatus(500);
    } else {
      // check if user is found
      if (data.rowsAffected == 0) return res.sendStatus(403);
      try {
        var userData = data.recordset[0];
        if (await bcrypt.compare(req.body.password, userData.password)) {
          // get User information
          const user = { username: userData.email, userid: userData.userid };
          
          // generate a access token
          const accessToken = functions.generateAccessToken(user);
          // generate a refresh token
          const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
          // set cookie for refresh token
          res.cookie(`__refresh_token`, refreshToken, {
            maxAge: 5000,
            secure: true,
            httpOnly: true,
            sameSite: "lax",
          });

          res.send({ accessToken: accessToken, user: user  });
        } else {
          res.status(403).send("Not Allowed");
        }
      } catch {
        res.status(500).send();
      }
    }
  });
});

module.exports = router;
