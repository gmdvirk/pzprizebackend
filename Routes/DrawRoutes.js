const {getAllDraws,Createdraw } = require("../Controllers/Draw")
const express = require("express");
const { AuthenticateUser,Authenticatedornot } = require("../utils");

const router = express.Router();
router.get("/"  ,AuthenticateUser,  getAllDraws )
router.post("/createdraw"  ,AuthenticateUser,  Createdraw )
module.exports = router;