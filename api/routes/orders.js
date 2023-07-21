const express = require("express");
const router = express.Router();
const cors = require("cors");

var sql = require("mssql");
var fs = require("fs");

const functions = require("../functions.js");

router.use(cors());
router.use(express.json());

router.get(
  "/",
  cors(functions.corsOptionsDelegate),
  functions.authenticateToken,
  (req, res) => {
    // create Request object
    var request = new sql.Request()

    // query to the database and get the records
    request.query(
      `SELECT * FROM trades WHERE userId = ${req.user.userid}`,
      (err, data) => {
        if (err) console.log(err);
        // send records as a response
        res.send(data.recordset);
      }
    );
  }
);

router.post(
  "/",
  cors(functions.corsOptionsDelegate),
  functions.authenticateToken,
  functions.upload.single("file"),
  (req, res) => {
    const {
      attrOne,
      attrTwo,
      attrThree,
      attrFour,
      attrOneValue,
      attrTwoValue,
      attrThreeValue,
      attrFourValue,
      levelReq,
      classReq,
      itemPower,
      sockets,
      type,
      price,
    } = req.body;
    const imgURL = req.file.filename;
    const userId = req.user.userid;

    var isValid = true;

    if (!itemPower) {
      isValid = false;
      res.status(418).send({ message: "We need a ItemPower" });
    }

    if (!levelReq) {
      isValid = false;
      res.status(419).send({ message: "We need a levelReq" });
    }

    if (!type) {
      isValid = false;
      res.status(420).send({ message: "We need a type" });
    }

    if (!price) {
      isValid = false;
      res.status(421).send({ message: "We need a price" });
    }

    if (!userId) {
      isValid = false;
      res.status(423).send({ message: "We need a userId" });
    }

    if (!classReq) {
      isValid = false;
      res.status(425).send({ message: "We need a ClassReq" });
    }

    if (!sockets) {
      sockets = 0;
    }

    var fullImgUrl = req.protocol + '://' + req.get('host') + '/images/' + imgURL;

    if (isValid) {
      // create Request object
      var request = new sql.Request();

      // query to the database and get the records
      var query = `INSERT INTO trades (type, attrOne, attrTwo, attrThree, attrFour, attrOneValue, attrTwoValue, attrThreeValue, attrFourValue, levelReq, classReq, ItemPower, sockets, price, userId, imgURL)
        VALUES ('${type}', '${attrOne}', '${attrTwo}', '${attrThree}', '${attrFour}', '${attrOneValue}', '${attrTwoValue}', 
        '${attrThreeValue}', '${attrFourValue}', ${levelReq}, '${classReq}', ${itemPower}, ${sockets}, ${price}, ${userId}, '${fullImgUrl}')`;

      request.query(query, (err, data) => {
        if (err) console.log(err);

        // send records as a response
        res.send(data.recordset);
      });

      res.status(200).send();
    }
  }
);

router.delete(
  "/:itemId",
  cors(functions.corsOptionsDelegate),
  functions.authenticateToken,
  (req, res) => {
    // create Request object
    var request = new sql.Request();
    // query to the database and get the records
    request.query(
      `SELECT imgURL FROM trades WHERE userId = ${req.user.userid} AND tradeid = ${req.params.itemId}`,
      (err, data) => {
        if (err) console.log(err);

        fs.unlink(`./public/data/uplads/${data.recordset.imgURL}`, function (
          err
        ) {
          if (err && err.code == "ENOENT") {
            // file doens't exist
            console.info("File doesn't exist, won't remove it.");
          } else if (err) {
            // other errors, e.g. maybe we don't have enough permission
            console.error("Error occurred while trying to remove file");
          } else {
            console.info(`${data.recordset.imgURL} is removed`);
          }
        });
        // create Request object
        var request = new sql.Request();
        request.query(
          `DELETE FROM trades WHERE userId = ${req.user.userid} AND tradeid = ${req.params.itemId}`,
          (err, data) => {
            if (err) console.log(err);
          }
        );
      }
    );
  }
);

module.exports = router;
