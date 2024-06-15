const {Addcashpayment,Addcreditpayment ,getAllpaymentsbyID} = require("../Controllers/Payment")
const express = require("express");
const { AuthenticateUser,Authenticatedornot } = require("../utils");

const router = express.Router();
router.post("/addcash"  ,AuthenticateUser,  Addcashpayment )
router.post("/addcredit"  ,AuthenticateUser,  Addcreditpayment )
router.get("/getpaymentsbyid/:id",getAllpaymentsbyID)
module.exports = router;