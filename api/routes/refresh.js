const express = require("express");
const router = express.Router();

const functions = require("../functions.js");
const jwt = require("jsonwebtoken");
const cors = require("cors");

router.use(cors());
router.use(express.json());


router.get("/", cors(functions.corsOptionsDelegate), async (req, res) => {
    // Cookies that have not been signed

    const token = req.cookies.__refresh_token;

    if (token == null) return res.sendStatus(403);
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
    })

  // generate a access token
  const accessToken = functions.generateAccessToken(req.user);
  // generate a refresh token
  const refreshToken = jwt.sign(req.user, process.env.REFRESH_TOKEN_SECRET);
  // set cookie for refresh token
  res.cookie(`__refresh_token`, refreshToken, {
    maxAge: 5000,
    secure: true,
    httpOnly: true,
    sameSite: "lax",
  });
  res.send({ accessToken: accessToken, user: req.user });
});



module.exports = router;
