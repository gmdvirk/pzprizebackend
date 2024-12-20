const {getAllDraws,getAllDeactiveOrExpiredDrawsInfo,getAllDeactiveOrExpiredDraws,getDrawInfo,getlasttendrawsmerchant,Createdraw,getAllActiveDraws,updatedrawById,getDrawfieldsvalue,activatedrawById,deactivatedrawById,getLastTenDraws } = require("../Controllers/Draw")
const express = require("express");
const { AuthenticateUser,Authenticatedornot } = require("../utils");

const router = express.Router();
router.get("/"  ,AuthenticateUser,  getAllDraws )
router.get("/getdrawinfo"  ,AuthenticateUser,  getDrawInfo )
router.post("/createdraw"  ,AuthenticateUser,  Createdraw )
router.patch("/editdraw"  ,AuthenticateUser,  updatedrawById )
router.patch("/activatedraw"  ,AuthenticateUser,  activatedrawById )
router.patch("/deactivatedraw"  ,AuthenticateUser,  deactivatedrawById )
router.get("/getallactivedraws"  ,AuthenticateUser,  getAllActiveDraws )
router.get("/getalldeactivedraws"  ,AuthenticateUser,  getAllDeactiveOrExpiredDraws )
router.get("/getalldeactivedrawsinfo"  ,AuthenticateUser,  getAllDeactiveOrExpiredDrawsInfo )
router.get("/getlasttendraws"  ,AuthenticateUser,  getLastTenDraws )
router.post("/getdrawfieldsvalue"  ,AuthenticateUser,  getDrawfieldsvalue )
router.get("/getlasttendrawsmerchant"  ,AuthenticateUser,  getlasttendrawsmerchant )
module.exports = router;