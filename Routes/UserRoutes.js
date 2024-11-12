const {Loginasanother,getLimitByUserId,addadmin,Editadmin,getadmindetail,changepassword,getAllUsers,getBalance,changekey , GetUserById,getAlldetailsbyId, Createuser, updateuserById, DeleteUserById, Login,Edituser,getAllDistributors,getAllMyDistributors,getAllMerchants,getAllMyusers,getAllMyMerchants,getAllSubDistributors,getAllMySubDistributors,addLimit,editLimit} = require("../Controllers/Users")

const express = require("express");
const { AuthenticateUser,Authenticatedornot } = require("../utils");

const router = express.Router();
router.get("/"  ,AuthenticateUser,  getAllUsers )
router.get("/getalldistributors"  ,AuthenticateUser,  getAllDistributors )
router.get("/getallsubdistributors"  ,AuthenticateUser,  getAllSubDistributors )
router.get("/getallmydistributors"  ,AuthenticateUser,  getAllMyDistributors )
router.get("/getallmysubdistributors"  ,AuthenticateUser,  getAllMySubDistributors )
router.get("/getallMerchants"  ,AuthenticateUser,  getAllMerchants )
router.get("/getallmyMerchants"  ,AuthenticateUser,  getAllMyMerchants )
router.get("/getAllMyusers"  ,AuthenticateUser,  getAllMyusers )
router.get("/"  ,AuthenticateUser,  getAllUsers )
router.get("/auth"  ,Authenticatedornot )
router.get("/getadmindetail"  ,AuthenticateUser,getadmindetail )
router.get("/getbalance" ,AuthenticateUser ,getBalance )
router.post("/login" , Login )
router.post("/adduser",AuthenticateUser , Createuser )
router.post("/addadmin" , addadmin )
router.put("/edituser",AuthenticateUser , Edituser )
router.post("/loginasanotheruser" , Loginasanother ) 
router.get("/:id" , GetUserById)
router.get("/getuserdetailbyid/:id",AuthenticateUser,getAlldetailsbyId)
router.patch("/updateprofile",AuthenticateUser , updateuserById)
router.post("/changekey",AuthenticateUser , changekey)
router.post("/changepassword",AuthenticateUser , changepassword)
router.post("/editadmin",AuthenticateUser , Editadmin)
router.post("/addLimit",AuthenticateUser , addLimit)
router.post("/editLimit",AuthenticateUser , editLimit)
router.get("/getLimitByUserId/:userId",AuthenticateUser , getLimitByUserId)


module.exports = router;






