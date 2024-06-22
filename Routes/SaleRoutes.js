const {Addsale} = require("../Controllers/Sale")
const express = require("express");
const { AuthenticateUser,Authenticatedornot } = require("../utils");

const router = express.Router();
router.post("/sale"  ,AuthenticateUser,  Addsale )
module.exports = router;