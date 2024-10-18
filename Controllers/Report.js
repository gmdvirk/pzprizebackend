const user = require("../models/Users.schema");
const draw = require("../models/Draw.schema");
const sale = require("../models/Sale.schema");
const sheet = require("../models/Sheet.schema");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

let Addsheetmerchant = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { drawid, sheetname } = req.body;

        // Fetch the draw to get the date
        const drawData = await draw.findById(drawid).session(session);
        if (!drawData) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Draw not found" });
        }

        const date = drawData.date;
        const addedby = req.token._id;

        // Create the new sheet
        const newSheet = new sheet({
            drawid,
            sheetname,
            date,
            addedby
        });

        const savedSheet = await newSheet.save({ session });

        // Update sales with the new sheetid
        await sale.updateMany(
            { drawid, addedby, sheetid: '' },
            { sheetid: savedSheet._id },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "Sheet created and sales updated", sheet: savedSheet });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error in Addsheetmerchant:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
let getSheetsByDate = async (req, res) => {
    try {
        const { id } = req.body;

        // Fetch sheets by date
        const sheets = await sheet.find({ _id: id });

        if (!sheets.length) {
            return res.status(404).json({ message: "No sheets found for the given date" });
        }

        res.status(200).json(sheets);
    } catch (error) {
        console.error("Error in getSheetsByDate:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
let getSalesBySheet = async (req, res) => {
    try {
       
        const {sheet,report} = req.body;
        // Fetch sales by sheet ID
        
        if(report==="combined"){
            const sales = await sale.find({type:"sale",sheetid: sheet });
            const oversales = await sale.find({type:"oversale", sheetid: sheet });
            
            res.status(200).json({sales,oversales});
      }
      else if (report==="generalsale"){
        const sales = await sale.find({type:"sale", sheetid: sheet });

        if (!sales.length) {
            return res.status(200).json([]);
        }
        res.status(200).json(sales);
      }
      else if (report==="oversale"){
        const sales = await sale.find({type:"oversale", sheetid: sheet });

        if (!sales.length) {
            return res.status(200).json([]);
        }
        res.status(200).json(sales);
      }
        
    } catch (error) {
        console.error("Error in getSalesBySheet:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
let getSalesBySheetTypeSale = async (req, res) => {
    try {
        const { sheetId } = req.params;

        // Fetch sales by sheet ID and type "sale"
        const sales = await sale.find({type:"sale", sheetid: sheetId, type: "sale" });

        if (!sales.length) {
            return res.status(404).json({ message: "No sales found for the given sheet ID and type" });
        }

        res.status(200).json(sales);
    } catch (error) {
        console.error("Error in getSalesBySheetType:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
let getSalesBySheetTypeOverSale = async (req, res) => {
    try {
        const { sheetId } = req.params;

        // Fetch sales by sheet ID and type "sale"
        const sales = await sale.find({type:"sale", sheetid: sheetId, type: "oversale" });

        if (!sales.length) {
            return res.status(404).json({ message: "No sales found for the given sheet ID and type" });
        }

        res.status(200).json(sales);
    } catch (error) {
        console.error("Error in getSalesBySheetType:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
let getSalesBySheetformerchant = async (req, res) => {
    try {
        const { sheetId } = req.params;
        const userid=req.Tokendata._id
        // Fetch sales by sheet ID
        const sales = await sale.find({type:"sale", sheetid: sheetId,addedby:userid });

        if (!sales.length) {
            return res.status(404).json({ message: "No sales found for the given sheet ID" });
        }

        res.status(200).json(sales);
    } catch (error) {
        console.error("Error in getSalesBySheet:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
let getSalesBySheetTypeSaleformerchant = async (req, res) => {
    try {
        const { sheetId } = req.params;
        const userid=req.Tokendata._id

        // Fetch sales by sheet ID and type "sale"
        const sales = await sale.find({type:"sale", sheetid: sheetId, type: "sale" ,addedby:userid });

        if (!sales.length) {
            return res.status(404).json({ message: "No sales found for the given sheet ID and type" });
        }

        res.status(200).json(sales);
    } catch (error) {
        console.error("Error in getSalesBySheetType:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
let getSalesBySheetTypeOverSaleformerchant = async (req, res) => {
    try {
        const { sheetId } = req.params;
        const userid=req.Tokendata._id

        // Fetch sales by sheet ID and type "sale"
        const sales = await sale.find({type:"sale", sheetid: sheetId, type: "oversale",addedby:userid  });

        if (!sales.length) {
            return res.status(404).json({ message: "No sales found for the given sheet ID and type" });
        }

        res.status(200).json(sales);
    } catch (error) {
        console.error("Error in getSalesBySheetType:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
function getSoldKeys(data) {
    // Extract the 'type' field
    const type = data;
    // Filter keys that start with 'sold'
    const soldKeys = Object.keys(type)
      .filter(key => key.startsWith('sold'))
      .map(key => ({
        key: key,
        value: type[key]
      }));
    
    return soldKeys;
  }
let getDrawById = async (req, res) => {
    try {
        let drawId=req.params.date
      let draws = await draw.find({date:drawId});
      res.status(200).json(draws);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  async function getAllUsersAddedBy(userId) {
    // const allUsers = [];
    
    // async function findUsersAddedBy(currentUserId) {
        const users = await user.find({ addedby: userId });
    //     if (users.length > 0) {
    //         for (const user of users) {
                // allUsers.push(users);
    //             await findUsersAddedBy(user.userid);
    //         }
    //     }
    // }
    // await findUsersAddedBy(userId);
    return users;
}
async function getAllUsersAddedBy1(userId) {
        const users = await user.find({ addedby: userId });
    return users;
}
const convertObjectToArray = (obj) => {
    return Object.values(obj);
  };
  let getHaddLimitReportforparticulardistributor = async (req, res) => {
    try {
        let drawId=req.body.date
        let userid=req.body.dealer
        let users=await getAllUsersAddedBy(userid);
        let drawinfo=await draw.find({date:drawId})
        // let users=await user.find({role:"merchant",distributor:userid})
        if(drawinfo){
            let totalsale=[]
            let allsales =await sale.find({type:"sale",addedby:userid,drawid:drawinfo[0]._id})
            let distributoruser=await user.findById(userid)
            for (let singleuser of users){
                // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
                let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
                totalsale=[...totalsale,...sales]
            }
            let alldraws=[]
            let drawtosend={}
            for (let singlesale of totalsale){
                if(alldraws.includes(singlesale.bundle)){
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
                }else{
                    alldraws.push(singlesale.bundle)
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
                }
            }
            let drawarrtosend=convertObjectToArray(drawtosend);
          res.status(200).json({drawarrtosend,limits:distributoruser.limit,username:distributoruser.username,name:distributoruser.name});
        }else{
            res.status(404).json({ message: "Could not found the draw" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getHaddLimitReportforparticulardistributorbyme = async (req, res) => {
    try {
        let drawId=req.body.date
        let userid=req.body.dealer
        let users=await getAllUsersAddedBy(userid);
        let drawinfo=await draw.find({date:drawId})
        let users1=await user.find({_id:userid})
        users=[...users,...users1]
        if(drawinfo){
            let totalsale=[]
            let allsales =await sale.find({type:"sale",addedby:userid,drawid:drawinfo[0]._id})
            let distributoruser=await user.findById(userid)
            for (let singleuser of users){
                // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
                let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
                totalsale=[...totalsale,...sales]
            }
            let alldraws=[]
            let drawtosend={}
            for (let singlesale of totalsale){
                if(alldraws.includes(singlesale.bundle)){
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
                }else{
                    alldraws.push(singlesale.bundle)
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
                }
            }
            let drawarrtosend=convertObjectToArray(drawtosend);
          res.status(200).json({drawarrtosend,limits:distributoruser.limit,username:users1[0].username,user:users1[0].user});
        }else{
            res.status(404).json({ message: "Could not found the draw" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getHaddLimitReportforalldistributor = async (req, res) => {
    try {
        let drawId=req.body.date
        let distributorusers=await user.find({role:"distributor"})
        let drawinfo=await draw.find({date:drawId})
        let majorsalesreport=[]
        let allsales =await sale.find({type:"sale",drawid:drawinfo[0]._id})
        for (let singledistributor of distributorusers){
            let userid=singledistributor._id
            let users=await getAllUsersAddedBy(userid);
            let totalsale=[]
            for (let singleuser of users){
                // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
                let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
                totalsale=[...totalsale,...sales]
            }
            let alldraws=[]
            let drawtosend={}
            for (let singlesale of totalsale){
                if(alldraws.includes(singlesale.bundle)){
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
                }else{
                    alldraws.push(singlesale.bundle)
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
                }
            }
            let drawarrtosend=convertObjectToArray(drawtosend);
            majorsalesreport.push({drawarrtosend,limits:singledistributor.limit,username:singledistributor.username,name:singledistributor.name})
        }
       
      res.status(200).json(majorsalesreport);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  function applyuplimits(userData){
    let fulldata=[]
    let alldraws=[]
      let drawtosend={}
        // userData.forEach((Payments) => {
          let  Payments=userData
          let filteredPayments=Payments.drawarrtosend
          for (let i = 0; i < filteredPayments.length; i++) {
            if (filteredPayments[i].bundle.length === 1) {
              filteredPayments[i].f = filteredPayments[i].f - Number(Payments.limits.hindsaa);
              filteredPayments[i].s = filteredPayments[i].s - Number(Payments.limits.hindsab);
              if(alldraws.includes(filteredPayments[i].bundle)){
                drawtosend[filteredPayments[i].bundle] ={bundle:filteredPayments[i].bundle,f:Number( drawtosend[filteredPayments[i].bundle].f )+filteredPayments[i].f,s:Number( drawtosend[filteredPayments[i].bundle].s )+filteredPayments[i].s}
            }else{
                alldraws.push(filteredPayments[i].bundle)
                drawtosend[filteredPayments[i].bundle] ={bundle:filteredPayments[i].bundle,f:filteredPayments[i].f,s:filteredPayments[i].s}
            }
            }
            if (filteredPayments[i].bundle.length === 2) {
              filteredPayments[i].f = filteredPayments[i].f - Number(Payments.limits.akraa);
              filteredPayments[i].s = filteredPayments[i].s - Number(Payments.limits.akrab);
              if(alldraws.includes(filteredPayments[i].bundle)){
                drawtosend[filteredPayments[i].bundle] ={bundle:filteredPayments[i].bundle,f:Number( drawtosend[filteredPayments[i].bundle].f )+filteredPayments[i].f,s:Number( drawtosend[filteredPayments[i].bundle].s )+filteredPayments[i].s}
            }else{
                alldraws.push(filteredPayments[i].bundle)
                drawtosend[filteredPayments[i].bundle] ={bundle:filteredPayments[i].bundle,f:filteredPayments[i].f,s:filteredPayments[i].s}
            }
            }
            if (filteredPayments[i].bundle.length === 3) {
              filteredPayments[i].f = filteredPayments[i].f - Number(Payments.limits.tendolaa);
              filteredPayments[i].s = filteredPayments[i].s - Number(Payments.limits.tendolab);
              if(alldraws.includes(filteredPayments[i].bundle)){
                drawtosend[filteredPayments[i].bundle] ={bundle:filteredPayments[i].bundle,f:Number( drawtosend[filteredPayments[i].bundle].f )+filteredPayments[i].f,s:Number( drawtosend[filteredPayments[i].bundle].s )+filteredPayments[i].s}
            }else{
                alldraws.push(filteredPayments[i].bundle)
                drawtosend[filteredPayments[i].bundle] ={bundle:filteredPayments[i].bundle,f:filteredPayments[i].f,s:filteredPayments[i].s}
            }
            }
            if (filteredPayments[i].bundle.length === 4) {
              filteredPayments[i].f = filteredPayments[i].f - Number(Payments.limits.panogadaa);
              filteredPayments[i].s = filteredPayments[i].s - Number(Payments.limits.panogadab);
              if(alldraws.includes(filteredPayments[i].bundle)){
                drawtosend[filteredPayments[i].bundle] ={bundle:filteredPayments[i].bundle,f:Number( drawtosend[filteredPayments[i].bundle].f )+filteredPayments[i].f,s:Number( drawtosend[filteredPayments[i].bundle].s )+filteredPayments[i].s}
            }else{
                alldraws.push(filteredPayments[i].bundle)
                drawtosend[filteredPayments[i].bundle] ={bundle:filteredPayments[i].bundle,f:filteredPayments[i].f,s:filteredPayments[i].s}
            }
            }
          }
        // })
          let drawarrtosend=convertObjectToArray(drawtosend);
         return drawarrtosend
  }
  function applydownlimit(userData){
    let fulldata=[]
    let alldraws=[]
      let drawtosend={}
        // userData.forEach((Payments) => {
          let  Payments=userData
    let filteredPayments=Payments.drawarrtosend
    for (let i = 0; i < filteredPayments.length; i++) {
      if (filteredPayments[i].bundle.length === 1) {
        if(Number(Payments.limits.hindsaa)>filteredPayments[i].f){
          filteredPayments[i].f=filteredPayments[i].f
        }else{
          filteredPayments[i].f=Number(Payments.limits.hindsaa)
        }
       if(filteredPayments[i].s<Number(Payments.limits.hindsab)){
        filteredPayments[i].s=filteredPayments[i].s
       }
       else{
        filteredPayments[i].s=Number(Payments.limits.hindsab)
       }
        if(alldraws.includes(filteredPayments[i].bundle)){
          drawtosend[filteredPayments[i].bundle] ={bundle:filteredPayments[i].bundle,f:Number( drawtosend[filteredPayments[i].bundle].f )+filteredPayments[i].f,s:Number( drawtosend[filteredPayments[i].bundle].s )+filteredPayments[i].s}
      }else{
          alldraws.push(filteredPayments[i].bundle)
          drawtosend[filteredPayments[i].bundle] ={bundle:filteredPayments[i].bundle,f:filteredPayments[i].f,s:filteredPayments[i].s}
      }
      }
      if (filteredPayments[i].bundle.length === 2) {
        if(filteredPayments[i].f<Number(Payments.limits.akraa)){
          filteredPayments[i].f=filteredPayments[i].f
        }else{
          filteredPayments[i].f=Number(Payments.limits.akraa)
        }
        if(filteredPayments[i].s<Number(Payments.limits.akrab)){
          filteredPayments[i].s=filteredPayments[i].s
        }else{
          filteredPayments[i].s=Number(Payments.limits.akrab)
        }
        if(alldraws.includes(filteredPayments[i].bundle)){
          drawtosend[filteredPayments[i].bundle] ={bundle:filteredPayments[i].bundle,f:Number( drawtosend[filteredPayments[i].bundle].f )+filteredPayments[i].f,s:Number( drawtosend[filteredPayments[i].bundle].s )+filteredPayments[i].s}
      }else{
          alldraws.push(filteredPayments[i].bundle)
          drawtosend[filteredPayments[i].bundle] ={bundle:filteredPayments[i].bundle,f:filteredPayments[i].f,s:filteredPayments[i].s}
      }
      }
      if (filteredPayments[i].bundle.length === 3) {
        if(filteredPayments[i].f<Number(Payments.limits.tendolaa)){
          filteredPayments[i].f=filteredPayments[i].f
        }else{
          filteredPayments[i].f=Number(Payments.limits.tendolaa)
        }
        if(filteredPayments[i].s<Number(Payments.limits.tendolab)){
          filteredPayments[i].s=filteredPayments[i].s
        }
        else{
          filteredPayments[i].s=Number(Payments.limits.tendolab)
        }
        if(alldraws.includes(filteredPayments[i].bundle)){
          drawtosend[filteredPayments[i].bundle] ={bundle:filteredPayments[i].bundle,f:Number( drawtosend[filteredPayments[i].bundle].f )+filteredPayments[i].f,s:Number( drawtosend[filteredPayments[i].bundle].s )+filteredPayments[i].s}
      }else{
          alldraws.push(filteredPayments[i].bundle)
          drawtosend[filteredPayments[i].bundle] ={bundle:filteredPayments[i].bundle,f:filteredPayments[i].f,s:filteredPayments[i].s}
      }
      }
      if (filteredPayments[i].bundle.length === 4) {
        if(filteredPayments[i].f<Number(Payments.limits.panogadaa)){
          filteredPayments[i].f=filteredPayments[i].f
        }else{
          filteredPayments[i].f=Number(Payments.limits.panogadaa)
        }
        
        if(filteredPayments[i].s<Number(Payments.limits.panogadab)){
          filteredPayments[i].s=filteredPayments[i].s
        }else{
          filteredPayments[i].s=Number(Payments.limits.panogadab)
        }
        if(alldraws.includes(filteredPayments[i].bundle)){
          drawtosend[filteredPayments[i].bundle] ={bundle:filteredPayments[i].bundle,f:Number( drawtosend[filteredPayments[i].bundle].f )+filteredPayments[i].f,s:Number( drawtosend[filteredPayments[i].bundle].s )+filteredPayments[i].s}
      }else{
          alldraws.push(filteredPayments[i].bundle)
          drawtosend[filteredPayments[i].bundle] ={bundle:filteredPayments[i].bundle,f:filteredPayments[i].f,s:filteredPayments[i].s}
      }
      }
    }
    let drawarrtosend=convertObjectToArray(drawtosend);
    return drawarrtosend
  }
  let getHaddLimitReportforalldistributoradminbillsheet = async (req, res) => {
    try {
        let drawId=req.body.date._id
        let distributorusers=await user.find({role:"distributor"})
        let drawinfo=await draw.find({_id:drawId})
        let majorsalesreport=[]
        let allsales =await sale.find({type:"sale",drawid:drawinfo[0]._id})
        for (let singledistributor of distributorusers){
            let userid=singledistributor._id
            let users=await getAllUsersAddedBy(userid);
            let totalsale=[]
            for (let singleuser of users){
                // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
                let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
                totalsale=[...totalsale,...sales]
            }
            let alldraws=[]
            let drawtosend={}
            for (let singlesale of totalsale){
                if(alldraws.includes(singlesale.bundle)){
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
                }else{
                    alldraws.push(singlesale.bundle)
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
                }
            }
            let drawarrtosend=convertObjectToArray(drawtosend);
            
            let obj={
                secondprize1:drawinfo[0].secondprize1,
        secondprize2:drawinfo[0].secondprize2,
        secondprize3:drawinfo[0].secondprize3,
        secondprize4:drawinfo[0].secondprize4,
        secondprize5:drawinfo[0].secondprize5,
        firstprize:drawinfo[0].firstprize
            }
            let tempdrawarrtosend=[]
            if(req.body.type==="uplimit"){
                tempdrawarrtosend=applyuplimits({drawarrtosend,limits:singledistributor.limit})
            }
            else{
                tempdrawarrtosend=applydownlimit({drawarrtosend,limits:singledistributor.limit})
            }
            
            // majorsalesreport.push({obj,drawarrtosend,limits:singledistributor.limit,username:singledistributor.username,name:singledistributor.name,comission:singledistributor.comission})
            majorsalesreport.push({name:singledistributor.name,username:singledistributor.username,comission:singledistributor.comission,prize:gettheprizecalculation(tempdrawarrtosend,obj,singledistributor)})
        }
      res.status(200).json({majorsalesreport,
        secondprize1:drawinfo[0].secondprize1,
        secondprize2:drawinfo[0].secondprize2,
        secondprize3:drawinfo[0].secondprize3,
        secondprize4:drawinfo[0].secondprize4,
        secondprize5:drawinfo[0].secondprize5,
        firstprize:drawinfo[0].firstprize});
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getDistributorSaleVoucherReportforparticulardistributor = async (req, res) => {
    try {
        let drawId=req.body.date
        let userid=req.body.dealer
        let useritself=await user.find({_id:userid})
        let drawinfo=await draw.find({date:drawId})
        let users=await getAllUsersAddedBy(userid);
        let allsales =await sale.find({type:"sale",addedby:userid,drawid:drawinfo[0]._id})
        let totalsale=[]
        for (let singleuser of users){
            // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
            let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
            totalsale=[...totalsale,...sales]
        }
        let alldraws=[]
        let drawtosend={}
        for (let singlesale of totalsale){
            if(alldraws.includes(singlesale.bundle)){
                drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
            }else{
                alldraws.push(singlesale.bundle)
                drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
            }
        }
        let drawarrtosend=convertObjectToArray(drawtosend);
        let majorsalesreport=[]
        majorsalesreport.push({drawarrtosend:drawarrtosend,username:useritself[0].username,name:useritself[0].name})
      res.status(200).json(majorsalesreport);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getDistributorSaleVoucherReportforalldistributor = async (req, res) => {
    try {
        let distributorusers=await user.find({role:"distributor"})
        let majorsalesreport=[]
        let drawId=req.body.date
        let drawinfo=await draw.find({date:drawId})
        let allsales =await sale.find({type:"sale",drawid:drawinfo[0]._id})
      
        for (let singledistributor of distributorusers){
            // let drawId=req.body.drawid
            let userid=singledistributor._id
            // let users=await user.find({role:"merchant",distributor:userid})
            let users=await getAllUsersAddedBy(userid);
            let totalsale=[]
            for (let singleuser of users){
                // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
                let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
                totalsale=[...totalsale,...sales]
            }
            let alldraws=[]
            let drawtosend={}
            for (let singlesale of totalsale){
                if(alldraws.includes(singlesale.bundle)){
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
                }else{
                    alldraws.push(singlesale.bundle)
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
                }
            }
            let drawarrtosend=convertObjectToArray(drawtosend);
            majorsalesreport.push({drawarrtosend:drawarrtosend,username:singledistributor.username,name:singledistributor.name})
        }
       
      res.status(200).json(majorsalesreport);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getLimitCuttingReportforparticulardistributor = async (req, res) => {
    try {
        let drawId=req.body.drawid
        let userid=req.body.userid
        let bundlelength=req.body.length
        let users=await user.find({role:"merchant",distributor:userid})
        let distributoruser=await user.findById(userid)
        let totalsale=[]
        let allsales =await sale.find({type:"sale",addedby:userid,drawid:drawinfo[0]._id})
        for (singleuser in users){
            // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawId})
            let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
            totalsale=[...totalsale,...sales]
        }
        let alldraws=[]
        let drawtosend={}
        for (singlesale in totalsale){
            if(bundlelength===singlesale.bundle.length){
                if(alldraws.includes(singlesale.bundle)){
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
                }else{
                    alldraws.push(singlesale.bundle)
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
                }

            }
        }
      res.status(200).json({totalsale,limits:distributoruser.limit,username:distributoruser.username,name:distributoruser.name});
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getLimitCuttingReportforalldistributor = async (req, res) => {
    try {
        let distributorusers=await user.find({role:"distributor"})
        let majorsalesreport=[]
        let bundlelength=req.body.length
        let userid=req.body.userid
        let drawId=req.body.drawid
        let allsales =await sale.find({type:"sale",addedby:userid,drawid:drawId})
        for (singledistributor in distributorusers){
         
            let users=await user.find({role:"merchant",distributor:userid})
            let totalsale=[]
            for (singleuser in users){
                // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawId})
                
            let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
                totalsale=[...totalsale,...sales]
            }
            let alldraws=[]
            let drawtosend={}
            for (singlesale in totalsale){
                if(bundlelength===singlesale.bundle.length){
                    if(alldraws.includes(singlesale.bundle)){
                        drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
                    }else{
                        alldraws.push(singlesale.bundle)
                        drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
                    }
                }
            }
            majorsalesreport.push({totalsale,limits:singledistributor.limit,username:singledistributor.username,name:singledistributor.name})
        }
       
      res.status(200).json(majorsalesreport);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getTotalSaleforparticularmerchant = async (req, res) => {
    try {
        let drawId=req.body.date
        let userid=req.body.userid
        let id=req.Tokendata._id
        let users=await user.find({_id:id})
        let totalsale=[]
        for (singleuser in users){
            let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawId})
            totalsale=[...totalsale,...sales]
        }
        let alldraws=[]
        let drawtosend={}
        for (singlesale in totalsale){
            if(alldraws.includes(singlesale.bundle)){
                drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
            }else{
                alldraws.push(singlesale.bundle)
                drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
            }
        }
      res.status(200).json({totalsale,limits:distributoruser.limit,username:distributor.username,name:distributoruser.user});
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getTotalSaleforparticularsubdistributor= async (req, res) => {
    try {
        let drawId=req.body.date
        let id=req.Tokendata._id
        let drawinfo=await draw.find({date:drawId})
        let users=await getAllUsersAddedBy(id);
        let totalsale=[]
        let allsales =await sale.find({type:"sale",addedby:id,drawid:drawinfo[0]._id})
        for (let singleuser of users){
            // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
            let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
            totalsale=[...totalsale,...sales]
        }
        let alldraws=[]
        let drawtosend={}
        for (let singlesale of totalsale){
            if(alldraws.includes(singlesale.bundle)){
                drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
            }else{
                alldraws.push(singlesale.bundle)
                drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
            }
        }
       let drawarrtosend=convertObjectToArray(drawtosend);
      res.status(200).json(drawarrtosend);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getTotalSaleforparticularmerchantbyme= async (req, res) => {
    try {
        let drawId=req.body.date
        let id=req.Tokendata._id
        let drawinfo=await draw.find({date:drawId})
        let users=await user.find({_id:id});
        let totalsale=[]
        let combinedtotalsale=[]
        let typeofsale="sale"
        let combineddrawarrtosend=null
        let allsales =[]
        let combinedsale=[]
        if(req.body.saletype==="sale"){
            allsales=await sale.find({type:"sale",addedby:id,drawid:drawinfo[0]._id})
        }
        if(req.body.saletype==="oversale"){            
            allsales=await sale.find({type:"oversale",addedby:id,drawid:drawinfo[0]._id})
        }
        if(req.body.saletype==="combined"){
            combinedsale=await sale.find({type:"sale",addedby:id,drawid:drawinfo[0]._id})
            allsales=await sale.find({type:"oversale",addedby:id,drawid:drawinfo[0]._id})
            for (let singleuser of users){
                // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
                let sales= combinedsale.filter((obj)=>obj.addedby.includes(singleuser._id))
                combinedtotalsale=[...totalsale,...sales]
            }
            let alldraws=[]
        let drawtosend={}
        for (let singlesale of combinedtotalsale){
            if(alldraws.includes(singlesale.bundle)){
                drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
            }else{
                alldraws.push(singlesale.bundle)
                drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
            }
        }
         combineddrawarrtosend=convertObjectToArray(drawtosend);
        }
       
        for (let singleuser of users){
            // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
            let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
            totalsale=[...totalsale,...sales]
        }
       
        let alldraws=[]
        let drawtosend={}
        for (let singlesale of totalsale){
            if(alldraws.includes(singlesale.bundle)){
                drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
            }else{
                alldraws.push(singlesale.bundle)
                drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
            }
        }
       let drawarrtosend=convertObjectToArray(drawtosend);
      res.status(200).json({drawarrtosend,combineddrawarrtosend});
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getDistributorSaleVoucherReportforparticularsubdistributor = async (req, res) => {
    try {
        let drawId=req.body.drawid
        let userid=req.body.userid
        let users=await user.find({role:"merchant",distributor:userid})
        let totalsale=[]
        let allsales =await sale.find({type:"sale",addedby:userid,drawid:drawId})
        for (singleuser in users){
            // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawId})
            let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
            totalsale=[...totalsale,...sales]
        }
        let alldraws=[]
        let drawtosend={}
        for (singlesale in totalsale){
            if(alldraws.includes(singlesale.bundle)){
                drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
            }else{
                alldraws.push(singlesale.bundle)
                drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
            }
        }
      res.status(200).json({totalsale});
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getDistributorSaleVoucherReportforallsubdistributor = async (req, res) => {
        try {
            // let distributorusers=await user.find({_id:req.Tokendata._id})
            let majorsalesreport=[]
            let drawId=req.body.date
            let drawinfo=await draw.find({date:drawId})
            let allsales =await sale.find({type:"sale",addedby:req.Tokendata._id,drawid:drawinfo[0]._id})
            let distributorusers=await getAllUsersAddedBy(req.Tokendata._id);
            for (let singledistributor of distributorusers){
                // let drawId=req.body.drawid
                let userid=singledistributor._id
                // let users=await user.find({role:"merchant",distributor:userid})
                let users=[singledistributor]
                let totalsale=[]
                for (let singleuser of users){
                    // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
                    let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
                    totalsale=[...totalsale,...sales]
                }
                let alldraws=[]
                let drawtosend={}
                for (let singlesale of totalsale){
                    if(alldraws.includes(singlesale.bundle)){
                        drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
                    }else{
                        alldraws.push(singlesale.bundle)
                        drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
                    }
                }
                let drawarrtosend=convertObjectToArray(drawtosend);
                majorsalesreport.push({drawarrtosend:drawarrtosend,username:singledistributor.username,name:singledistributor.name})
            }
          res.status(200).json(majorsalesreport);
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
  };
  let getHaddLimitReportforalldistributorbyme = async (req, res) => {
    try {
        let drawId=req.body.date
        // let 
        let distributorusers=await user.find({_id:req.Tokendata._id})
        let drawinfo=await draw.find({date:drawId})
        let majorsalesreport=[]
        let allsales =await sale.find({type:"sale",addedby:req.Tokendata._id,drawid:drawinfo[0]._id})
        for (let singledistributor of distributorusers){
            let userid=singledistributor._id
            let users=await getAllUsersAddedBy(userid);
            let totalsale=[]
            for (let singleuser of users){
                // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
                let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
                totalsale=[...totalsale,...sales]
            }
            let alldraws=[]
            let drawtosend={}
            for (let singlesale of totalsale){
                if(alldraws.includes(singlesale.bundle)){
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
                }else{
                    alldraws.push(singlesale.bundle)
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
                }
            }
            let drawarrtosend=convertObjectToArray(drawtosend);
            majorsalesreport.push({drawarrtosend,limits:singledistributor.limit,name:singledistributor.name,username:singledistributor.username})
        }
       
      res.status(200).json(majorsalesreport);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getDistributorSaleVoucherReportforparticulardistributorbyme = async (req, res) => {
    try {
        let drawId=req.body.date
        let userid=req.Tokendata._id
        // let users=await user.find({role:"merchant",distributor:userid})
        let drawinfo=await draw.find({date:drawId})
        let users=await getAllUsersAddedBy(userid);
        let totalsale=[]
        for (let singleuser of users){
            let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
            totalsale=[...totalsale,...sales]
        }
        let alldraws=[]
        let drawtosend={}
        for (let singlesale of totalsale){
            if(alldraws.includes(singlesale.bundle)){
                drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
            }else{
                alldraws.push(singlesale.bundle)
                drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
            }
        }
        let drawarrtosend=convertObjectToArray(drawtosend);
      res.status(200).json([drawarrtosend]);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getDistributorSaleVoucherReportforparticularmerchantbyme = async (req, res) => {
    try {
        let drawId=req.body.date
        let userid=req.body.dealer
        let useritself=await user.find({_id:userid})
        let drawinfo=await draw.find({date:drawId})
        let users=await getAllUsersAddedBy(userid);
        let allsales =await sale.find({type:"sale",addedby:userid,drawid:drawinfo[0]._id})
        users=[...users,...useritself]
        let totalsale=[]
        for (let singleuser of users){
            // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
            let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
            totalsale=[...totalsale,...sales]
        }
        let alldraws=[]
        let drawtosend={}
        for (let singlesale of totalsale){
            if(alldraws.includes(singlesale.bundle)){
                drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
            }else{
                alldraws.push(singlesale.bundle)
                drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
            }
        }
        let drawarrtosend=convertObjectToArray(drawtosend);
      res.status(200).json([{drawarrtosend:drawarrtosend,username:useritself[0].username,name:useritself[0].name}]);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  function gettheprizecalculation(drawarrtosend,obj,prize){
    let tempobj={
        f:0,
        s:0,
        scount:0
    }
   
    let tempsale={
        f:0,
        s:0,
    }
    let tempsalefour={
        f:0,
        s:0,
    }
    let temp={}

    let searchString = obj.firstprize;

    let prefixes = [];
    
    if(obj.firstprize!==''&&obj.firstprize!=="0"){// Create prefixes
    for (let i = 1; i <= searchString.length; i++) {
      prefixes.push(searchString.substring(0, i));
    }

    drawarrtosend.forEach((obj)=>{
       
        if(obj.bundle.length===4){
            tempsalefour.f=Number(tempsalefour.f)+obj.f
            tempsalefour.s=Number(tempsalefour.s)+obj.s
            
        }else{
            tempsale.f=Number(tempsale.f)+obj.f
            tempsale.s=Number(tempsale.s)+obj.s
        }
    })
    // Filter data by prefixes and f > 0
    let matchingBundles = drawarrtosend
    .filter(item => prefixes.includes(item.bundle) && item.f > 0)
    .map(item => ({ ...item }));
    for(let i=0;i<matchingBundles.length;i++){
        if(matchingBundles[i].bundle.length===1){
            matchingBundles[i].f=matchingBundles[i].f*prize.prize.prizea
        }
        if(matchingBundles[i].bundle.length===2){
            matchingBundles[i].f=matchingBundles[i].f*prize.prize.prizeb
        }
        if(matchingBundles[i].bundle.length===3){
            matchingBundles[i].f=matchingBundles[i].f*prize.prize.prizec
        }
        if(matchingBundles[i].bundle.length===4){
            matchingBundles[i].f=matchingBundles[i].f*prize.prize.prized
        }
        tempobj.f+=matchingBundles[i].f
    }
    temp.firstprize=[...matchingBundles]
}

if(obj.secondprize1!==''&&obj.secondprize1!=="0"){
tempobj.scount+=1
}

if(obj.secondprize2!==''&&obj.secondprize2!=="0"){
    tempobj.scount+=1
}

if(obj.secondprize3!==''&&obj.secondprize3!=="0"){
    tempobj.scount+=1
}


if(obj.secondprize4!==''&&obj.secondprize4!=="0"){
    tempobj.scount+=1
}

if(obj.secondprize5!==''&&obj.secondprize5!=="0"){
    tempobj.scount+=1
}

    if(obj.secondprize1!==''&&obj.secondprize1!=="0"){
     searchString = obj.secondprize1;

     prefixes = [];
    
    // Create prefixes
    for (let i = 1; i <= searchString.length; i++) {
      prefixes.push(searchString.substring(0, i));
    }
    
    // Filter data by prefixes and f > 0
     let matchingBundles = drawarrtosend
  .filter(item => prefixes.includes(item.bundle) && item.s > 0)
  .map(item => ({ ...item }));

 
    for(let i=0;i<matchingBundles.length;i++){
        if(matchingBundles[i].bundle.length===1){
            matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prizea
        }
        if(matchingBundles[i].bundle.length===2){
            matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prizeb
        }
        if(matchingBundles[i].bundle.length===3){
            matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prizec
        }
        if(matchingBundles[i].bundle.length===4){
            matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prized
        }
        tempobj.s+=matchingBundles[i].s
    }
    temp.secondprize1=[...matchingBundles]
}else{
    temp.secondprize1=[]
}
    if(obj.secondprize2!==''&&obj.secondprize2!=="0")
        {searchString = obj.secondprize2;

    prefixes = [];
   
   // Create prefixes
   for (let i = 1; i <= searchString.length; i++) {
     prefixes.push(searchString.substring(0, i));
   }
   // Filter data by prefixes and f > 0
   let matchingBundles = drawarrtosend
  .filter(item => prefixes.includes(item.bundle) && item.s > 0)
  .map(item => ({ ...item }));


   for(let i=0;i<matchingBundles.length;i++){
    if(matchingBundles[i].bundle.length===1){
        matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prizea
    }
    if(matchingBundles[i].bundle.length===2){
        matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prizeb
    }
    if(matchingBundles[i].bundle.length===3){
        matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prizec
    }
    if(matchingBundles[i].bundle.length===4){
        matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prized
    }
    tempobj.s+=matchingBundles[i].s
   }
   temp.secondprize2=[...matchingBundles]
}else{
    temp.secondprize2=[]
}
   if(obj.secondprize3!==''&&obj.secondprize3!=="0"){
   
    searchString = obj.secondprize3;

   prefixes = [];
  
  // Create prefixes
  for (let i = 1; i <= searchString.length; i++) {
    prefixes.push(searchString.substring(0, i));
  }
  // Filter data by prefixes and f > 0
  let matchingBundles = drawarrtosend
  .filter(item => prefixes.includes(item.bundle) && item.s > 0)
  .map(item => ({ ...item }));

  for(let i=0;i<matchingBundles.length;i++){
    if(matchingBundles[i].bundle.length===1){
        matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prizea
    }
    if(matchingBundles[i].bundle.length===2){
        matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prizeb
    }
    if(matchingBundles[i].bundle.length===3){
        matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prizec
    }
    if(matchingBundles[i].bundle.length===4){
        matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prized
    }
    tempobj.s+=matchingBundles[i].s
  }
  temp.secondprize3=[...matchingBundles]
}else{
    temp.secondprize3=[]
}
  if(obj.secondprize4!==''&&obj.secondprize4!=="0"){
    searchString = obj.secondprize4;

  prefixes = [];
 
 // Create prefixes
 for (let i = 1; i <= searchString.length; i++) {
   prefixes.push(searchString.substring(0, i));
 }
 // Filter data by prefixes and f > 0
 let matchingBundles = drawarrtosend
  .filter(item => prefixes.includes(item.bundle) && item.s > 0)
  .map(item => ({ ...item }));


 for(let i=0;i<matchingBundles.length;i++){
    if(matchingBundles[i].bundle.length===1){
        matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prizea
    }
    if(matchingBundles[i].bundle.length===2){
        matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prizeb
    }
    if(matchingBundles[i].bundle.length===3){
        matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prizec
    }
    if(matchingBundles[i].bundle.length===4){
        matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prized
    }
    tempobj.s+=matchingBundles[i].s
 }
 temp.secondprize4=[...matchingBundles]
}
else{
    temp.secondprize4=[]
}

 if(obj.secondprize5!==''&&obj.secondprize5!=="0"){
    searchString = obj.secondprize5;

    prefixes = [];
   
   // Create prefixes
   for (let i = 1; i <= searchString.length; i++) {
     prefixes.push(searchString.substring(0, i));
   }
 
   // Filter data by prefixes and f > 0
   let matchingBundles = drawarrtosend
  .filter(item => prefixes.includes(item.bundle) && item.s > 0)
  .map(item => ({ ...item }));


   
   for(let i=0;i<matchingBundles.length;i++){
    if(matchingBundles[i].bundle.length===1){
        matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prizea
    }
    if(matchingBundles[i].bundle.length===2){
        matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prizeb
    }
    if(matchingBundles[i].bundle.length===3){
        matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prizec
    }
    if(matchingBundles[i].bundle.length===4){
        matchingBundles[i].s=(matchingBundles[i].s/tempobj.scount)*prize.prize.prized
    }
    tempobj.s+=matchingBundles[i].s
   }
   temp.secondprize5=[...matchingBundles]
    }else{
         temp.secondprize5=[]
    }

    return {tempobj,temp,tempsale,tempsalefour};
  }
  let getBillSheetReportforalldistributor = async (req, res) => {
    try {
        let drawId=req.body.date
        let distributorusers=await user.find({role:"distributor"})
        let drawinfo=await draw.find({date:drawId})
        let majorsalesreport=[]
        let allsales =await sale.find({type:"sale",drawid:drawinfo[0]._id})
        for (let singledistributor of distributorusers){
            let userid=singledistributor._id
            let users=await getAllUsersAddedBy(userid);
            let totalsale=[]
            for (let singleuser of users){
                // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
                let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
                totalsale=[...totalsale,...sales]
            }
            let alldraws=[]
            let drawtosend={}
            for (let singlesale of totalsale){
                if(alldraws.includes(singlesale.bundle)){
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
                }else{
                    alldraws.push(singlesale.bundle)
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
                }
            }
            let drawarrtosend=convertObjectToArray(drawtosend);
            let obj={
                secondprize1:drawinfo[0].secondprize1,
        secondprize2:drawinfo[0].secondprize2,
        secondprize3:drawinfo[0].secondprize3,
        secondprize4:drawinfo[0].secondprize4,
        secondprize5:drawinfo[0].secondprize5,
        firstprize:drawinfo[0].firstprize
            }
            majorsalesreport.push({drawarrtosend,name:singledistributor.name,username:singledistributor.username,comission:singledistributor.comission,prize:gettheprizecalculation(drawarrtosend,obj,singledistributor)})
        }
      res.status(200).json({majorsalesreport,secondprize1:drawinfo[0].secondprize1,
        secondprize2:drawinfo[0].secondprize2,
        secondprize3:drawinfo[0].secondprize3,
        secondprize4:drawinfo[0].secondprize4,
        secondprize5:drawinfo[0].secondprize5,
        firstprize:drawinfo[0].firstprize
    });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getBillSheetReportforparticulardistributor = async (req, res) => {
    try {
        let drawId=req.body.date
        let distributorusers=await user.find({_id:req.body.dealer})
        let drawinfo=await draw.find({date:drawId})
        let majorsalesreport=[]
        let allsales =await sale.find({type:"sale",addedby:req.body.dealer,drawid:drawinfo[0]._id})
        for (let singledistributor of distributorusers){
            let userid=singledistributor._id
            let users=await getAllUsersAddedBy(userid);
            let totalsale=[]
            for (let singleuser of users){
                // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
                let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
                totalsale=[...totalsale,...sales]
            }
            let alldraws=[]
            let drawtosend={}
            for (let singlesale of totalsale){
                if(alldraws.includes(singlesale.bundle)){
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
                }else{
                    alldraws.push(singlesale.bundle)
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
                }
            }
            let drawarrtosend=convertObjectToArray(drawtosend);
            let obj={
                secondprize1:drawinfo[0].secondprize1,
        secondprize2:drawinfo[0].secondprize2,
        secondprize3:drawinfo[0].secondprize3,
        secondprize4:drawinfo[0].secondprize4,
        secondprize5:drawinfo[0].secondprize5,
        firstprize:drawinfo[0].firstprize
            }
            majorsalesreport.push({drawarrtosend,name:singledistributor.name,username:singledistributor.username,comission:singledistributor.comission,prize:gettheprizecalculation(drawarrtosend,obj,singledistributor)})
        }
       
      res.status(200).json({majorsalesreport,secondprize1:drawinfo[0].secondprize1,
        secondprize2:drawinfo[0].secondprize2,
        secondprize3:drawinfo[0].secondprize3,
        secondprize4:drawinfo[0].secondprize4,
        secondprize5:drawinfo[0].secondprize5,
        firstprize:drawinfo[0].firstprize
    });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getBillSheetReportforparticulardistributorme = async (req, res) => {
    try {
        let drawId=req.body.date
        let distributorusers=await user.find({_id:req.Tokendata._id})
        let drawinfo=await draw.find({date:drawId})
        let majorsalesreport=[]
        let allsales =await sale.find({type:"sale",addedby:req.Tokendata._id,drawid:drawinfo[0]._id})
        for (let singledistributor of distributorusers){
            let userid=singledistributor._id
            let users=await getAllUsersAddedBy(userid);
            let totalsale=[]
            for (let singleuser of users){
                // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
                let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
                totalsale=[...totalsale,...sales]
            }
            let alldraws=[]
            let drawtosend={}
            for (let singlesale of totalsale){
                if(alldraws.includes(singlesale.bundle)){
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
                }else{
                    alldraws.push(singlesale.bundle)
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
                }
            }
            let drawarrtosend=convertObjectToArray(drawtosend);
            let obj={
                secondprize1:drawinfo[0].secondprize1,
        secondprize2:drawinfo[0].secondprize2,
        secondprize3:drawinfo[0].secondprize3,
        secondprize4:drawinfo[0].secondprize4,
        secondprize5:drawinfo[0].secondprize5,
        firstprize:drawinfo[0].firstprize
            }
            majorsalesreport.push({drawarrtosend,name:singledistributor.name,username:singledistributor.username,comission:singledistributor.comission,prize:gettheprizecalculation(drawarrtosend,obj,singledistributor)})
        }
       
      res.status(200).json({
        majorsalesreport,secondprize1:drawinfo[0].secondprize1,
        secondprize2:drawinfo[0].secondprize2,
        secondprize3:drawinfo[0].secondprize3,
        secondprize4:drawinfo[0].secondprize4,
        secondprize5:drawinfo[0].secondprize5,
        firstprize:drawinfo[0].firstprize
    });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getBillSheetReportforparticulardistributorbyme = async (req, res) => {
    try {
        let drawId=req.body.date
        let distributorusers=await user.find({_id:req.body.dealer})
        let drawinfo=await draw.find({date:drawId})
        let majorsalesreport=[]
        
        let allsales =await sale.find({type:"sale",addedby:req.body.dealer,drawid:drawinfo[0]._id})
        for (let singledistributor of distributorusers){
            let userid=singledistributor._id
            let users=await getAllUsersAddedBy(userid);
            users=[...users,...distributorusers]
            let totalsale=[]
            for (let singleuser of users){
                // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
                let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
                totalsale=[...totalsale,...sales]
            }
            let alldraws=[]
            let drawtosend={}
            for (let singlesale of totalsale){
                if(alldraws.includes(singlesale.bundle)){
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
                }else{
                    alldraws.push(singlesale.bundle)
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
                }
            }
            let drawarrtosend=convertObjectToArray(drawtosend);
            let obj={
                secondprize1:drawinfo[0].secondprize1,
        secondprize2:drawinfo[0].secondprize2,
        secondprize3:drawinfo[0].secondprize3,
        secondprize4:drawinfo[0].secondprize4,
        secondprize5:drawinfo[0].secondprize5,
        firstprize:drawinfo[0].firstprize
            }
            majorsalesreport.push({drawarrtosend,name:singledistributor.name,username:singledistributor.username,comission:singledistributor.comission,prize:gettheprizecalculation(drawarrtosend,obj,singledistributor)})
        }
      res.status(200).json({majorsalesreport,secondprize1:drawinfo[0].secondprize1,
        secondprize2:drawinfo[0].secondprize2,
        secondprize3:drawinfo[0].secondprize3,
        secondprize4:drawinfo[0].secondprize4,
        secondprize5:drawinfo[0].secondprize5,
        firstprize:drawinfo[0].firstprize
    });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getBillSheetReportforparticularmerchantme = async (req, res) => {
    try {
        let drawId=req.body.date
        let distributorusers=await user.find({_id:req.Tokendata._id})
        let drawinfo=await draw.find({date:drawId})
        let majorsalesreport=[]
        let allsales =await sale.find({type:"sale",addedby:req.Tokendata._id,drawid:drawinfo[0]._id})
        for (let singledistributor of distributorusers){
            let userid=singledistributor._id
            let users=distributorusers;
            let totalsale=[]
            for (let singleuser of users){
                // let sales =await sale.find({type:"sale",addedby:singleuser._id,drawid:drawinfo[0]._id})
                let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
                totalsale=[...totalsale,...sales]
            }
            let alldraws=[]
            let drawtosend={}
            for (let singlesale of totalsale){
                if(alldraws.includes(singlesale.bundle)){
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
                }else{
                    alldraws.push(singlesale.bundle)
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
                }
            }
            let drawarrtosend=convertObjectToArray(drawtosend);
            let obj={
                secondprize1:drawinfo[0].secondprize1,
        secondprize2:drawinfo[0].secondprize2,
        secondprize3:drawinfo[0].secondprize3,
        secondprize4:drawinfo[0].secondprize4,
        secondprize5:drawinfo[0].secondprize5,
        firstprize:drawinfo[0].firstprize
            }
            majorsalesreport.push({drawarrtosend,name:singledistributor.name,username:singledistributor.username,comission:singledistributor.comission,prize:gettheprizecalculation(drawarrtosend,obj,singledistributor)})
        }
       
      res.status(200).json({majorsalesreport,secondprize1:drawinfo[0].secondprize1,
        secondprize2:drawinfo[0].secondprize2,
        secondprize3:drawinfo[0].secondprize3,
        secondprize4:drawinfo[0].secondprize4,
        secondprize5:drawinfo[0].secondprize5,
        firstprize:drawinfo[0].firstprize
    });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getBillSheetReportforparticularmerchantmeoversale = async (req, res) => {
    try {
        let drawId=req.body.date
        let distributorusers=await user.find({_id:req.Tokendata._id})
        let drawinfo=await draw.find({date:drawId})
        let majorsalesreport=[]
        let allsales =await sale.find({type:"oversale",addedby:req.Tokendata._id,drawid:drawinfo[0]._id})
        for (let singledistributor of distributorusers){
            let userid=singledistributor._id
            let users=distributorusers;
            let totalsale=[]
            for (let singleuser of users){
                // let sales =await sale.find({type:"oversale",addedby:singleuser._id,drawid:drawinfo[0]._id})
                let sales= allsales.filter((obj)=>obj.addedby.includes(singleuser._id))
                totalsale=[...totalsale,...sales]
            }
            let alldraws=[]
            let drawtosend={}
            for (let singlesale of totalsale){
                if(alldraws.includes(singlesale.bundle)){
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:Number( drawtosend[singlesale.bundle].f )+singlesale.f,s:Number( drawtosend[singlesale.bundle].s )+singlesale.s}
                }else{
                    alldraws.push(singlesale.bundle)
                    drawtosend[singlesale.bundle] ={bundle:singlesale.bundle,f:singlesale.f,s:singlesale.s}
                }
            }
            let drawarrtosend=convertObjectToArray(drawtosend);
            let obj={
                secondprize1:drawinfo[0].secondprize1,
        secondprize2:drawinfo[0].secondprize2,
        secondprize3:drawinfo[0].secondprize3,
        secondprize4:drawinfo[0].secondprize4,
        secondprize5:drawinfo[0].secondprize5,
        firstprize:drawinfo[0].firstprize
            }
            majorsalesreport.push({drawarrtosend,name:singledistributor.name,username:singledistributor.username,comission:singledistributor.comission,prize:gettheprizecalculation(drawarrtosend,obj,singledistributor)})
      
        }
       
      res.status(200).json({majorsalesreport,secondprize1:drawinfo[0].secondprize1,
        secondprize2:drawinfo[0].secondprize2,
        secondprize3:drawinfo[0].secondprize3,
        secondprize4:drawinfo[0].secondprize4,
        secondprize5:drawinfo[0].secondprize5,
        firstprize:drawinfo[0].firstprize
    });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  };
  let getSearchBundleMerchant= async (req, res) => {
        try {
            let bundle=req.body.bundle;
            let drawid=req.body.date
            const users=await sheet.find({drawid:drawid,addedby:req.Tokendata._id})
                const sales = await sale.find({
                    // bundle: bundle,
                    drawid:drawid,
                    addedby:req.Tokendata._id
                });
                let data=[]
                for (let i=0;i<users.length;i++){
                    let temparr=sales.filter((obj)=>obj.sheetid==users[i]._id)
                    if(temparr.length>0){
                        data.push({saledata:temparr,name:users[i].sheetname})
                    }
                }
                res.status(200).json(data);
            } catch (error) {
                res.status(500).json({ message: "Internal server error" });
            }
  }
  let getSearchBundleMerchantfordistributor= async (drawid,addedby,user) => {
    try {
        const users=await sheet.find({drawid:drawid,addedby:addedby})
            const sales = await sale.find({
                // bundle: bundle,
                drawid:drawid,
                addedby:addedby
            });
            let data=[]
            for (let i=0;i<users.length;i++){
                let temparr=sales.filter((obj)=>obj.sheetid==users[i]._id)
                if(temparr.length>0){
                    data.push({saledata:temparr,name:users[i].sheetname,username:user.username})
                }
            }
            return data;
        } catch (error) {
            return []
        }
}
  let getSearchBundleDistributor= async (req, res) => {
    // try {
    //     let bundle=req.body.bundle;
    //     const users=await user.find({role:"merchant",addedby:req.Tokendata._id})
    //         let drawid=req.body.date
    //         const sales = await sale.find({
    //             bundle: bundle,
    //             drawid:drawid,
    //         });
    //         let data=[]
    //         for (let i=0;i<users.length;i++){
    //             let temparr=sales.filter((obj)=>obj.addedby.includes(users[i]._id))
    //             if(temparr.length>0){
    //                 data.push({saledata:temparr,name:users[i].name,username:users[i].username})
    //             }
    //         }
    //         res.status(200).json(data);
          
    //     } catch (error) {
    //         res.status(500).json({ message: "Internal server error" });
    //     }
        try {
            const users=await user.find({role:"merchant",addedby:req.Tokendata._id})
                let drawid=req.body.date
                let data=[]
                for (let i=0;i<users.length;i++){
                    let temparr=await getSearchBundleMerchantfordistributor(drawid,users[i]._id,users[i])
                    if(temparr.length>0){
                        data.push(temparr)
                    }
                }
                res.status(200).json(data);
              
            } catch (error) {
                res.status(500).json({ message: "Internal server error" });
            }
  }
  let getSearchBundleAdmin= async (req, res) => {
 try {
    let bundle=req.body.bundle;
    const users=await user.find({role:"distributor"})
        let drawid=req.body.date
        const sales = await sale.find({
            bundle: bundle,
            drawid:drawid,
        });
        let data=[]
        for (let i=0;i<users.length;i++){
            let temparr=sales.filter((obj)=>obj.addedby.includes(users[i]._id))
            if(temparr.length>0){
                data.push({saledata:temparr,name:users[i].name,username:users[i].username})
            }
            
        }
        res.status(200).json(data);
      
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
  }
  let getHaddLimitAloudornot= async (req, res) => {
    try{const users=await user.findById({_id:req.Tokendata._id})
    if(users){
        res.status(200).json(users.haddaloud);
    }else{
        res.status(500).json({ message: "User not found" });
    }}
    catch(e){
        res.status(500).json({ message: "Internal server error" });
    }
  }
  function calculate(tempobj) {
    let dataarr = [];
    tempobj.majorsalesreport.forEach((report) => {
      let totalFp = report.prize.tempobj.f;
      let totalSs = report.prize.tempobj.s;
      let totalF = report.prize.tempsale.f;
      let totalS = report.prize.tempsale.s;
  
      const totalPrizes = Number(totalFp) + Number(totalSs);
      const commissionValue = report.comission.comission;
      const commissionAmount = report.comission.comission===0?report.comission.comission:(((totalF + totalS)*Number(report.comission.comission))/100);
      const pcPercentageAmount = report.comission.pcpercentage===0?report.comission.pcpercentage:(((totalF + totalS)*Number(report.comission.pcpercentage))/100);
      const pcPercentageValue = report.comission.pcpercentage;

      const grandTotal = totalF + totalS;
      const safitotal = grandTotal - pcPercentageAmount - commissionAmount;
      const nettotal = (totalF + totalS)- Number(totalPrizes)-pcPercentageAmount-commissionAmount
      const user = report.user;
      dataarr.push({
        commissionValue,
        commissionAmount: commissionAmount.toFixed(2),
        pcPercentageAmount: pcPercentageAmount.toFixed(2),
        pcPercentageValue,
        grandTotal: grandTotal.toFixed(2),
        safitotal: safitotal.toFixed(2),
        nettotal: nettotal.toFixed(2),
        role:user.role,
        id: user._id,
      });
    });
    return dataarr;
  }
  
  let getBalanceUpdated = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      let drawId = req.body.date;
      let drawinfo = await draw.find({ date: drawId }).session(session);
      if (!drawinfo[0] || !drawinfo[0].firstprize || drawinfo[0].firstprize === "") {
        await session.abortTransaction();
        session.endSession();
        return res.status(200).json({ message: "Draw not posted yet" });
      }
  
      let distributorusers1 = await user.find({}).session(session);
      let distributorusers=distributorusers1.filter((obj)=>obj.role !=="superadmin")
      let majorsalesreport = [];
      let allsales = await sale.find({ type: "sale", drawid: drawinfo[0]._id }).session(session);
      for (let singledistributor of distributorusers) {
        let userid = singledistributor._id;
        // let users = await getAllUsersAddedBy(userid);
        let users = distributorusers.filter((obj)=> obj.addedby.includes(singledistributor._id))
        users.push(singledistributor)
        let totalsale = allsales.filter((obj) => users.some(user => obj.addedby.includes(user._id)));
        let drawtosend = totalsale.reduce((acc, singlesale) => {
          if (!acc[singlesale.bundle]) {
            acc[singlesale.bundle] = { bundle: singlesale.bundle, f: 0, s: 0 };
          }
          acc[singlesale.bundle].f += singlesale.f;
          acc[singlesale.bundle].s += singlesale.s;
          return acc;
        }, {});
        let drawarrtosend = Object.values(drawtosend);
        let obj = {
          secondprize1: drawinfo[0].secondprize1,
          secondprize2: drawinfo[0].secondprize2,
          secondprize3: drawinfo[0].secondprize3,
          secondprize4: drawinfo[0].secondprize4,
          secondprize5: drawinfo[0].secondprize5,
          firstprize: drawinfo[0].firstprize,
        };
        majorsalesreport.push({
          drawarrtosend,
          comission: singledistributor.comission,
          prize: gettheprizecalculation(drawarrtosend, obj, singledistributor),
          user: singledistributor,
        });
      }
      const tempobj = {
        majorsalesreport,
        secondprize1: drawinfo[0].secondprize1,
        secondprize2: drawinfo[0].secondprize2,
        secondprize3: drawinfo[0].secondprize3,
        secondprize4: drawinfo[0].secondprize4,
        secondprize5: drawinfo[0].secondprize5,
        firstprize: drawinfo[0].firstprize,
      };
      let calculatedData = calculate(tempobj);
      // Process users sequentially
      for (const obj of calculatedData) {
        let User = await user.findOne({ _id: obj.id }).session(session);
        if (!User) {
          throw new Error(`User not found: ${obj.id}`);
        }
        if (User.role === "merchant") {
          User.payment.balanceupline = Number(User.payment.balanceupline) - (Number(obj.grandTotal) - Number(obj.safitotal));
        } else {
          User.payment.balanceupline = Number(User.payment.balanceupline)-Number(obj.nettotal);
        }
        await User.save({ session });
      }
      await session.commitTransaction();
      session.endSession();
      res.status(200).json({ message: "Done" });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error in getBalanceUpdated:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
module.exports = {
    Addsheetmerchant,
    getSheetsByDate,
    getSalesBySheet,
    getSalesBySheetTypeOverSaleformerchant,
    getSalesBySheetTypeSaleformerchant,
    getSalesBySheetformerchant,
    getSalesBySheetTypeSale,
    getSalesBySheetTypeOverSale,
    getDrawById,
    getHaddLimitReportforparticulardistributor,
    getHaddLimitReportforalldistributor,
    getDistributorSaleVoucherReportforalldistributor,
    getDistributorSaleVoucherReportforparticulardistributor,
    getLimitCuttingReportforparticulardistributor,
    getLimitCuttingReportforalldistributor,
    getTotalSaleforparticularmerchant,
    getDistributorSaleVoucherReportforparticularsubdistributor,
    getDistributorSaleVoucherReportforallsubdistributor,
    getTotalSaleforparticularsubdistributor,
    getHaddLimitReportforalldistributorbyme,
    getTotalSaleforparticularmerchantbyme,
    getDistributorSaleVoucherReportforparticularmerchantbyme,
    getHaddLimitReportforparticulardistributorbyme,
    getBillSheetReportforalldistributor,
    getBillSheetReportforparticulardistributor,
    getBillSheetReportforparticulardistributorme,
    getBillSheetReportforparticulardistributorbyme,
    getBillSheetReportforparticularmerchantme,
    getBillSheetReportforparticularmerchantmeoversale,
    getSearchBundleMerchant,
    getSearchBundleDistributor,
    getSearchBundleAdmin,
    getHaddLimitAloudornot,
    getBalanceUpdated,
    getHaddLimitReportforalldistributoradminbillsheet
};
