const {getAllUsers , GetUserById, Createuser, updateuserById, DeleteUserById,disableuser,ableuser,followuserById,
    unfollowuserById, Login,Addowner,getAllDistributors,getAllMyDistributors,getAllMerchants,getAllMyMerchants,getAllSubDistributors,getAllMySubDistributors} = require("../Controllers/Users")

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
router.get("/"  ,AuthenticateUser,  getAllUsers )
router.get("/auth"  ,Authenticatedornot )
router.post("/login" , Login )
router.post("/adduser",AuthenticateUser , Createuser )
router.post("/getallusers" , Createuser ) //middleware to be added
router.get("/:id" , GetUserById)
router.patch("/updateprofile",AuthenticateUser , updateuserById)
router.put("/disableuser",AuthenticateUser ,disableuser)
router.put("/ableuser",AuthenticateUser ,ableuser)
router.put("/follow",AuthenticateUser ,followuserById)
router.put("/unfollow",AuthenticateUser ,unfollowuserById)
module.exports = router;

