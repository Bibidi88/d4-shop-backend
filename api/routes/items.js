const express = require("express");
const router = express.Router();
const cors = require("cors");
const functions = require("../functions.js");


var sql = require("mssql");


router.use(cors());
router.use(express.json());


router.get("/", cors(functions.corsOptionsDelegate), (req, res) => {
  // create Request object
  var request = new sql.Request();

  // query to the database and get the records
  request.query(`select top 500 trades.tradeid, trades.price, trades.imgURL, users.discordid 
  FROM trades 
  left join users on trades.userId = users.userid
  order by trades.tradeid desc`, (err, data) => {
    if (err) console.log(err);
    // send records as a response
    res.status(200).send(data.recordset);
  });
});


module.exports = router;
