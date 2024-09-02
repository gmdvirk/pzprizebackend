const {Addsale,getMySaleDetail,DeleteSales,Addmultiplesale,
    addsheet,
    getAllSheets,
    getSalesofaSheet,
    DeleteMultipleSales
} = require("../Controllers/Sale")
const express = require("express");
const { AuthenticateUser } = require("../utils");

const router = express.Router();
router.post("/addsale"  ,AuthenticateUser,  Addsale )
router.get("/getmysaledetail/:id"  ,AuthenticateUser,  getMySaleDetail )
router.post("/deletesale"  ,AuthenticateUser,  DeleteMultipleSales )
router.post("/addmultiplesale"  ,AuthenticateUser,  Addmultiplesale )
router.post("/addsheet"  ,AuthenticateUser,  addsheet )
router.post("/getAllSheets"  ,AuthenticateUser,  getAllSheets )
router.post("/getSalesofaSheet"  ,AuthenticateUser,  getSalesofaSheet )
module.exports = router;