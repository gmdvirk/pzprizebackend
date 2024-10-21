const {Addsheetmerchant,getSheetsByDate,getDrawById,getSalesBySheet,
    getHaddLimitReportforparticulardistributor,
    getHaddLimitReportforalldistributor,
    getDistributorSaleVoucherReportforalldistributor,
    getDistributorSaleVoucherReportforparticulardistributor,
    getLimitCuttingReportforparticulardistributor,
    getLimitCuttingReportforalldistributor,
    getTotalSaleforparticularmerchant,
    getDistributorSaleVoucherReportforparticularsubdistributor,
    getDistributorSaleVoucherReportforallsubdistributor,
    getHaddLimitReportforalldistributorbyme,
    getTotalSaleforparticularsubdistributor,
    getTotalSaleforparticularmerchantbyme,
    getDistributorSaleVoucherReportforparticularmerchantbyme,
    getHaddLimitReportforparticulardistributorbyme,
    getBillSheetReportforalldistributor,
    getBillSheetReportforparticulardistributor,
    getBillSheetReportforparticulardistributorme,
    getBillSheetReportforparticulardistributorbyme,
    getBillSheetReportforparticularmerchantme,
    getSearchBundleAdmin,
    getBillSheetReportforparticularmerchantmeoversale,
    getSearchBundleDistributor,
    getSearchBundleMerchant,
    getHaddLimitAloudornot,
    getBalanceUpdated,
    getHaddLimitReportforalldistributoradminbillsheet,
    getAllSellBill

} = require("../Controllers/Report")
const express = require("express");
const { AuthenticateUser,Authenticatedornot } = require("../utils");

const router = express.Router();
router.post("/addsheetmerchant"  ,AuthenticateUser,  Addsheetmerchant )
router.get("/getdrawbyid/:date"  ,AuthenticateUser,  getDrawById )
router.post("/getsheetmerchant/:date"  ,AuthenticateUser,  getSheetsByDate )
router.post("/getHaddLimitReportforparticulardistributor"  ,AuthenticateUser,  getHaddLimitReportforparticulardistributor )
router.post("/getDistributorSaleVoucherReportforalldistributor"  ,AuthenticateUser,  getDistributorSaleVoucherReportforalldistributor )
router.post("/getDistributorSaleVoucherReportforparticulardistributor"  ,AuthenticateUser,  getDistributorSaleVoucherReportforparticulardistributor )
router.post("/getHaddLimitReportforalldistributor"  ,AuthenticateUser,  getHaddLimitReportforalldistributor )
router.post("/getHaddLimitReportforalldistributorbyme"  ,AuthenticateUser,  getHaddLimitReportforalldistributorbyme )
router.post("/getTotalSaleforparticularsubdistributor"  ,AuthenticateUser,  getTotalSaleforparticularsubdistributor )
router.post("/getTotalSaleforparticularmerchantbyme"  ,AuthenticateUser,  getTotalSaleforparticularmerchantbyme )
router.post("/getDistributorSaleVoucherReportforparticularmerchantbyme"  ,AuthenticateUser,  getDistributorSaleVoucherReportforparticularmerchantbyme )
router.post("/getDistributorSaleVoucherReportforallsubdistributor"  ,AuthenticateUser,  getDistributorSaleVoucherReportforallsubdistributor )
router.post("/getHaddLimitReportforparticulardistributorbyme"  ,AuthenticateUser,  getHaddLimitReportforparticulardistributorbyme )
router.post("/getBillSheetReportforalldistributor"  ,AuthenticateUser,  getBillSheetReportforalldistributor )
router.post("/getBillSheetReportforparticulardistributor"  ,AuthenticateUser,  getBillSheetReportforparticulardistributor )
router.post("/getBillSheetReportforparticulardistributorme"  ,AuthenticateUser,  getBillSheetReportforparticulardistributorme )
router.post("/getBillSheetReportforparticulardistributorbyme"  ,AuthenticateUser,  getBillSheetReportforparticulardistributorbyme )
router.post("/getBillSheetReportforparticularmerchantme"  ,AuthenticateUser,  getBillSheetReportforparticularmerchantme )
router.post("/getBillSheetReportforparticularmerchantmeoversale"  ,AuthenticateUser,  getBillSheetReportforparticularmerchantmeoversale )
router.post("/getSearchBundleAdmin" ,AuthenticateUser ,  getSearchBundleAdmin )
router.post("/getSearchBundleDistributor" ,AuthenticateUser ,  getSearchBundleDistributor )
router.post("/getSearchBundleMerchant" ,AuthenticateUser ,  getSearchBundleMerchant )
router.get("/getHaddLimitAloudornot" ,AuthenticateUser ,  getHaddLimitAloudornot )
router.post("/getBalanceUpdated" ,AuthenticateUser ,  getBalanceUpdated )
router.post("/getSalesBySheet" ,AuthenticateUser ,  getSalesBySheet )
router.post("/getAllSellBill" ,AuthenticateUser ,  getAllSellBill )
router.post("/getHaddLimitReportforalldistributoradminbillsheet" ,AuthenticateUser ,  getHaddLimitReportforalldistributoradminbillsheet )
module.exports = router;