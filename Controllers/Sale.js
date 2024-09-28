const user = require("../models/Users.schema")
const draw = require("../models/Draw.schema")
const sale = require("../models/Sale.schema")
const sheet = require("../models/Sheet.schema")
const jwt = require("jsonwebtoken")
const mongoose = require('mongoose');

let DeleteMultipleSales = async (req, res) => {
 
        const saleIds = req.body.saleIds; // Expecting an array of sale IDs
        const userId = req.Tokendata._id;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Retrieve the sales to be deleted
            const salesToDelete = await sale.find({ _id: { $in: saleIds } }).session(session);

            if (salesToDelete.length === 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ status: false, "Message": "No sales found to delete" });
            }

            let totalF = 0;
            let totalS = 0;

            for (let saleRecord of salesToDelete) {
                totalF += Number(saleRecord.f);
                totalS += Number(saleRecord.s);

                let { bundle, drawid, type,buyingdetail,addedby, salenumber, f, s } = saleRecord;
                let saleaddedby=addedby[addedby.length-1]
              
                let numbertoadd1 = "", numbertoadd2 = "";
                let userstoadd1 = "";
                let userstoadd2 = "";

                switch (salenumber) {
                    case 1:
                        numbertoadd1 = "onedigita";
                        numbertoadd2 = "onedigitb";
                        userstoadd1 = "plimitaf";
                        userstoadd2 = "plimitas";
                        break;
                    case 2:
                        numbertoadd1 = "twodigita";
                        numbertoadd2 = "twodigitb";
                        userstoadd1 = "plimitbf";
                        userstoadd2 = "plimitbf";
                        break;
                    case 3:
                        numbertoadd1 = "threedigita";
                        numbertoadd2 = "threedigitb";
                        userstoadd1 = "plimitcf";
                        userstoadd2 = "plimitcf";
                        break;
                    case 4:
                        numbertoadd1 = "fourdigita";
                        numbertoadd2 = "fourdigitb";
                        userstoadd1 = "plimitdf";
                        userstoadd2 = "plimitdf";
                        break;
                }

                let soldnumbertoadd1 = "sold" + bundle + "a";
                let soldnumbertoadd2 = "sold" + bundle + "b";
                let oversalenumbertoadd1 = "oversale" + bundle + "a";
                let oversalenumbertoadd2 = "oversale" + bundle + "b";

                let updateData = {};

                if (type === "sale" || type === "oversale") {
                    let drawRecord = await draw.findOne({ _id: drawid }).session(session);
                 
                    if (!drawRecord) {
                        await session.abortTransaction();
                        session.endSession();
                        return res.status(404).json({ status: false, "Message": "Draw not found" });
                    }
                    if(type==="sale"){
                      updateData[`type.${soldnumbertoadd1}`] = Number(drawRecord.type.get(soldnumbertoadd1)) - Number(buyingdetail[1].f);
                      updateData[`type.${soldnumbertoadd2}`] = Number(drawRecord.type.get(soldnumbertoadd2)) - Number(buyingdetail[1].s);
                      updateData[`user.${saleaddedby+soldnumbertoadd1}`]  = Number(drawRecord.user.get(saleaddedby+soldnumbertoadd1)) - Number(buyingdetail[0].f);
                      updateData[`user.${saleaddedby+soldnumbertoadd2}`]  = Number(drawRecord.user.get(saleaddedby+soldnumbertoadd2)) - Number(buyingdetail[0].s);
                    }
                    else if (type === "oversale") {
                        updateData[`type.${oversalenumbertoadd1}`] = Number(drawRecord.type.get(oversalenumbertoadd1)) - Number(f);
                        updateData[`type.${oversalenumbertoadd2}`] = Number(drawRecord.type.get(oversalenumbertoadd2)) - Number(s);
                    }

                    await draw.updateOne(
                        { _id: drawid },
                        { $set: updateData },
                        { session }
                    );
                }
if (type === "sale"){
  let User = await user.findOne({ _id: saleaddedby }).session(session);

  if (User) {
      User.payment.availablebalance += Number(buyingdetail[1].f) + Number(buyingdetail[1].s);
      await User.save({ session });
  }
}
             
            }

            // Delete the sales
            await sale.deleteMany({ _id: { $in: saleIds } }).session(session);

            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ status: true, "Message": "Sales deleted successfully" });
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            res.status(500).json({ status: false, "Message": err.message });
        }
 
};

function getDateAndTime(isoString) {
    
  // Parse the ISO 8601 string into a Date object
  const dateObj = new Date(isoString);

  // Extract the date components
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  
  // Extract the time components
  const hours = String(dateObj.getUTCHours()).padStart(2, '0');
  const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(dateObj.getUTCMilliseconds()).padStart(3, '0');

  // Format the date and time
  const date = `${year}-${month}-${day}`;
  const time = `${hours}:${minutes}:${seconds}`;

  return { date, time };
}

const DeleteSales = async (req, res) => {
      const saleIds = req.body.saleIds; // Array of sale IDs to be deleted
      const addedbyuserid = req.Tokendata._id;
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
          // Find all sales that match the provided sale IDs
          const salesToDelete = await sale.find({ _id: { $in: saleIds } }).session(session);
      
          
          if (salesToDelete.length === 0) {
              await session.abortTransaction();
              session.endSession();
              return res.status(404).json({ status: false, "Message": "No sales found for the given IDs" });
          }

          let updateData = {};
          let drawUpdates = new Map();
          let userUpdates = new Map();

          // Iterate over each sale to adjust the related draw and user documents
          for (const saleDoc of salesToDelete) {
          
              const { drawid, bundle, f, s, addedby, salenumber } = saleDoc;
              
              // Get the related draw document
              const drawDoc = await draw.findById(drawid).session(session);
              
              if (!drawDoc) {
                  continue; // Skip this sale if the related draw is not found
              }
              let numbertoadd1 = "";
              let numbertoadd2 = "";
              
              if (salenumber === 1) {
                  numbertoadd1 = "onedigita";
                  numbertoadd2 = "onedigitb";
              } else if (salenumber === 2) {
                  numbertoadd1 = "twodigita";
                  numbertoadd2 = "twodigitb";
              } else if (salenumber === 3) {
                  numbertoadd1 = "threedigita";
                  numbertoadd2 = "threedigitb";
              } else if (salenumber === 4) {
                  numbertoadd1 = "fourdigita";
                  numbertoadd2 = "fourdigitb";
              }
              
              // Update the draw document
              updateData[`type.${numbertoadd1}`] = (drawDoc.type.get(numbertoadd1) || 0) - f;
              updateData[`type.${numbertoadd2}`] = (drawDoc.type.get(numbertoadd2) || 0) - s;
              
              drawUpdates.set(drawid, updateData);
              
              // Update the user document
              // for (const userId of addedby) {
              const userId=addedby[addedby.length]
                  const userDoc = await user.findById(userId).session(session);
                
                  let userUpdate = {};
                  let userKey1 = `${userId}${numbertoadd1}`;
                  let userKey2 = `${userId}${numbertoadd2}`;

                  if (drawDoc.user.has(userKey1)) {
                      userUpdate[`user.${userKey1}`] = (userDoc.user.get(userKey1) || 0) - f;
                  }
                  
                  if (drawDoc.user.has(userKey2)) {
                      userUpdate[`user.${userKey2}`] = (userDoc.user.get(userKey2) || 0) - s;
                  }
                  
         
                  userUpdates.set(userId, userUpdate);
              // }
              
              // Delete the sale document
              await sale.deleteOne({ _id: saleDoc._id }).session(session);
              
             
          }

          // Apply updates to the draw documents
          for (const [drawId, update] of drawUpdates) {
              await draw.updateOne({ _id: drawId }, { $set: update }, { session });
          }
          
          // Apply updates to the user documents
          for (const [userId, update] of userUpdates) {
              await user.updateOne({ _id: userId }, { $set: update }, { session });
          }

          await session.commitTransaction();
          session.endSession();

          res.status(200).json({ status: true, "Message": "Sales deleted successfully" });
      } catch (err) {
          await session.abortTransaction();
          session.endSession();
          res.status(500).json({ status: false, "Message": err.message, "Error": err.message });
      }
 
};

    const DeleteSales1 = async (req, res) => {
    if (req.Tokendata.role === "merchant") {
        const saleIds = req.body.saleIds;  // Assuming the sale IDs are sent in the request body as an array
        const addedbyuserid = req.Tokendata._id;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            for (let saleId of saleIds) {
                let saleRecord = await sale.findOne({ _id: saleId, addedby: addedbyuserid }).session(session);
                if (!saleRecord) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(404).json({ status: false, "Message": `Sale not found for ID: ${saleId}` });
                }
                let { drawid,bundle, salenumber, type, f, s ,buyingdetail} = saleRecord;
                let drawRecord = await draw.findOne({ _id: drawid }).session(session);
                if (!drawRecord) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(404).json({ status: false, "Message": `Draw not found for sale ID: ${saleId}` });
                }
                let numbertoadd1 = "", numbertoadd2 = "";
                if (salenumber === 1) {
                    numbertoadd1 = "onedigita";
                    numbertoadd2 = "onedigitb";
                } else if (salenumber === 2) {
                    numbertoadd1 = "twodigita";
                    numbertoadd2 = "twodigitb";
                } else if (salenumber === 3) {
                    numbertoadd1 = "threedigita";
                    numbertoadd2 = "threedigitb";
                } else if (salenumber === 4) {
                    numbertoadd1 = "fourdigita";
                    numbertoadd2 = "fourdigitb";
                } 
                let soldnumbertoadd1 = "sold" + bundle + "a";
                let soldnumbertoadd2 = "sold" + bundle + "b";
                let oversalenumbertoadd1 = "oversale" + bundle + "a";
                let oversalenumbertoadd2 = "oversale" + bundle + "b";
  
                let updateData = {};
                if (type === "sale") {
                    updateData[`type.${soldnumbertoadd1}`] = Number(drawRecord.type.get(soldnumbertoadd1)) - Number(buyingdetail[1].f)
                    updateData[`type.${soldnumbertoadd2}`] = Number(drawRecord.type.get(soldnumbertoadd2)) - Number(buyingdetail[1].s)
                    updateData[`user.${addedbyuserid+soldnumbertoadd2}`] =Number(drawRecord.user.get(addedbyuserid+soldnumbertoadd2))-Number(buyingdetail[0].s)
                    updateData[`user.${addedbyuserid+soldnumbertoadd1}`] =Number(drawRecord.user.get(addedbyuserid+soldnumbertoadd1))-Number(buyingdetail[0].f)
                    let User = await user.findOne({ _id: addedbyuserid }).session(session);
                    User.payment.availablebalance += (Number(f) + Number(s));
                    await User.save({ session });
                } else if (type === "oversale") {
                    updateData[`type.${oversalenumbertoadd1}`] = Number(drawRecord.type.get(oversalenumbertoadd1) ) - Number(f);
                    updateData[`type.${oversalenumbertoadd2}`]  = Number(drawRecord.type.get(oversalenumbertoadd1) ) - Number(s);
                }
                await draw.updateOne(
                    { _id: drawid },
                    { $set: updateData },
                    { session }
                );
                await sale.deleteOne({ _id: saleId }).session(session);
            }

            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ status: true, "Message": "Sales deleted successfully" });
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            res.status(500).json({ status: false, "Message": "There was an error", "Error": err.message });
        }
    } else {
        res.status(403).json({ status: false, "Message": "You don't have access" });
    }
};
let getMySaleDetail=async(req,res)=>{
    let id = req.params.id;
    let userid=req.Tokendata._id
    let users = await sale.find({drawid:id,addedby:userid,sheetid:""})
    if(users)
      {
         res.status(200).json({users})
      }else
      {
        res.status(404).json({status:false,"Message":"Error"})
      }
  }
  let Addmultiplesale = async (req, res) => {
    if (req.Tokendata.role === "merchant") {
      const salesArray = req.body.sales; // Expecting an array of sale objects
      const addedbyuserid = req.Tokendata._id;
  
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        let User = await user.findOne({ _id: addedbyuserid }).session(session);
  
        // Calculate the total amount needed for all sales
        let totalF = 0;
        let totalS = 0;
        salesArray.forEach(sale => {
          totalF += Number(sale.f);
          totalS += Number(sale.s);
        });
  
        if (!User || User.payment.availablebalance < (totalF + totalS)) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ status: false, "Message": "Insufficient balance" });
        }
  
        let allSales = [];
let smsnumber =1
        for (let sale of salesArray) {
          let { bundle,drawid, type, salenumber, f, s, salecode } = sale;
          let f1=f,s1=s
          let arr=[...User.addedby]
          arr.push(addedbyuserid)
let updateData = {};
let buyingdetail=[{from:"me",f:0,s:0},{from:"notme",f:0,s:0}]
          let newobj=false
          drawidglobal=drawid
          let users = await draw.findOne({ _id:drawid }).session(session);
          // Parse the draw date and time from the users object
          const drawDateTime = new Date(`${users.date}T${users.time}Z`);
          let currentDatetime = new Date();
          let currentDate = currentDatetime.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
          let currentTime = currentDatetime.toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5); // 'HH:MM'
          // Check if the current date and time are less than the draw date and time
          const drawDateTime1 = new Date(`${currentDate}T${currentTime}Z`);
          if (drawDateTime1 >= drawDateTime) {
              await session.abortTransaction();
              session.endSession();
              return res.status(400).json({ status: false, "Message": "Cannot execute sale. The draw time has passed." });
          }
          if (!users.sms) {
            users.sms = new Map();
        }
          if (!(users.sms.has(addedbyuserid)) ) {
            users.sms.set(addedbyuserid,smsnumber);
            updateData[`sms.${addedbyuserid}`] =smsnumber
  
          }
          else if(Number(users.sms.get(addedbyuserid))!==smsnumber ){
            smsnumber=Number(users.sms.get(addedbyuserid))+smsnumber
            updateData[`sms.${addedbyuserid}`] =Number(users.sms.get(addedbyuserid))+smsnumber
          }
          
          if (!users) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ status: false, "Message": "Draw not found" });
          }
  
          let numbertoadd1 = "", numbertoadd2 = "";
          let userstoadd1 = "";
          let userstoadd2 = "";
  
          switch (salenumber) {
            case 1:
              numbertoadd1 = "onedigita";
              numbertoadd2 = "onedigitb";
              userstoadd1 = "plimitaf";
              userstoadd2 = "plimitas";
              break;
            case 2:
              numbertoadd1 = "twodigita";
              numbertoadd2 = "twodigitb";
              userstoadd1 = "plimitbf";
              userstoadd2 = "plimitbf";
              break;
            case 3:
              numbertoadd1 = "threedigita";
              numbertoadd2 = "threedigitb";
              userstoadd1 = "plimitcf";
              userstoadd2 = "plimitcf";
              break;
            case 4:
              numbertoadd1 = "fourdigita";
              numbertoadd2 = "fourdigitb";
              userstoadd1 = "plimitdf";
              userstoadd2 = "plimitdf";
              break;
          }
       
          let soldnumbertoadd1 = "sold" + bundle + "a";
          let soldnumbertoadd2 = "sold" + bundle + "b";
          let oversalenumbertoadd1 = "oversale" + bundle + "a";
          let oversalenumbertoadd2 = "oversale" + bundle + "b";

          if (!users.type) {
              users.type = new Map();
          }
  
          if (!users.user) {
            users.user = new Map();
        }
          if (!(users.type.has(soldnumbertoadd1)) || !(users.type.has(soldnumbertoadd2))) {
              users.type.set(soldnumbertoadd1, 0);
              users.type.set(soldnumbertoadd2, 0);
              users.type.set(oversalenumbertoadd1, 0);
              users.type.set(oversalenumbertoadd2, 0);
              newobj=true;
          }
          if (!(users.user.has(addedbyuserid+soldnumbertoadd1)) || !(users.user.has(addedbyuserid+soldnumbertoadd2))) {
            users.user.set(addedbyuserid+soldnumbertoadd1, 0);
            users.user.set(addedbyuserid+soldnumbertoadd2, 0);
            updateData[`user.${addedbyuserid+soldnumbertoadd2}`] =0
            updateData[`user.${addedbyuserid+soldnumbertoadd1}`] =0
          }
          if(Number(User.purchase[userstoadd2])-Number(users.user.get(addedbyuserid+soldnumbertoadd2))>=Number(s)){
            updateData[`user.${addedbyuserid+soldnumbertoadd2}`]=Number(users.user.get(addedbyuserid+soldnumbertoadd2))+Number(s)
             buyingdetail[0].s=s
             s1=0
             }else if(Number(User.purchase[userstoadd2])-Number(users.user.get(addedbyuserid+soldnumbertoadd2))>0){
            s1=Number(s1)-(Number(User.purchase[userstoadd2])-Number(users.user.get(addedbyuserid+soldnumbertoadd2)))
               updateData[`user.${addedbyuserid+soldnumbertoadd2}`]=Number(User.purchase[userstoadd2])
               buyingdetail[0].s=Number(s)-Number(s1)
             }
             if(Number(User.purchase[userstoadd1])-Number(users.user.get(addedbyuserid+soldnumbertoadd1))>=Number(f)){
               updateData[`user.${addedbyuserid+soldnumbertoadd1}`]=users.user.get(addedbyuserid+soldnumbertoadd1)+Number(f)
               buyingdetail[0].f=f
               f1=0
             }else if(Number(User.purchase[userstoadd1])-Number(users.user.get(addedbyuserid+soldnumbertoadd1))>0){
               f1=Number(f1)-(Number(User.purchase[userstoadd1])-Number(users.user.get(addedbyuserid+soldnumbertoadd1)))
               updateData[`user.${addedbyuserid+soldnumbertoadd1}`]=Number(User.purchase[userstoadd1])
               buyingdetail[0].f=Number(f)-Number(f1)
             }
           
          if (((Number(users[numbertoadd1]) - Number(users.type.get(soldnumbertoadd1))) >= Number(f1)) &&
              ((Number(users[numbertoadd2]) - Number(users.type.get(soldnumbertoadd2))) >= Number(s1))) {
                buyingdetail[1].f=f1
                buyingdetail[1].s=s1
            let saleData = {bundle,buyingdetail, salecode, drawid, salenumber, type, f, s,  addedby: arr};
            allSales.push(saleData);
            // let updateData = {};
            updateData[`type.${soldnumbertoadd1}`] = Number(users.type.get(soldnumbertoadd1)) + Number(f)-Number(buyingdetail[0].f);
            updateData[`type.${soldnumbertoadd2}`] = Number(users.type.get(soldnumbertoadd2)) + Number(s)-Number(buyingdetail[0].s);
            if(newobj){
              updateData[`type.${oversalenumbertoadd1}`] =0
              updateData[`type.${oversalenumbertoadd2}`] =0
            }
            await draw.updateOne(
              { _id: drawid },
              { $set: updateData },
              { session }
            );
          
          } else {
            
            let diff_of_f = ((Number(users[numbertoadd1]) - Number(users.type.get(soldnumbertoadd1))) <= 0) ? f1 : (Number(f1) - ((Number(users[numbertoadd1]) - Number(users.type.get(soldnumbertoadd1)))));
            let diff_of_s = ((Number(users[numbertoadd2]) - Number(users.type.get(soldnumbertoadd2))) <= 0) ? s1 : (Number(s1) - ((Number(users[numbertoadd2]) - Number(users.type.get(soldnumbertoadd2)))));
            if(diff_of_f<0){
              diff_of_f=0
            }
            if(diff_of_s<0){
              diff_of_s=0
            }
            let saleData = {bundle, drawid, salecode,buyingdetail:[{from:"me",f:0,s:0},{from:"notme",f:0,s:0}], salenumber, type: "oversale", f: diff_of_f<0?0:diff_of_f, s: diff_of_s<0?0:diff_of_s,  addedby:arr };
            allSales.push(saleData);
  
            // let updateData = {};
            if (diff_of_f !== f && diff_of_s !== s) {
              let saleData1 = {bundle, drawid, salecode, salenumber, type: "sale", f: Number(f) - Number(diff_of_f), s: Number(s) - Number(diff_of_s),  addedby: arr };
              buyingdetail[1].f=Number(saleData1.f)-Number(buyingdetail[0].f)
                      buyingdetail[1].s=Number(saleData1.s)-Number(buyingdetail[0].s)
                      saleData1.buyingdetail=buyingdetail
              allSales.push(saleData1);
              updateData[`type.${soldnumbertoadd1}`] = Number(users.type.get(soldnumbertoadd1)) + Number(saleData1.f)-Number(buyingdetail[0].f);
              updateData[`type.${soldnumbertoadd2}`] = Number(users.type.get(soldnumbertoadd2)) + Number(saleData1.s)-Number(buyingdetail[0].s);
            } else if (diff_of_f !== f && diff_of_s === s) {
              let saleData1 = {bundle, drawid, salecode, salenumber, type: "sale", f: Number(f) - Number(diff_of_f), s: 0,  addedby:arr };
              buyingdetail[1].f=Number(saleData1.f)-Number(buyingdetail[0].f)
              buyingdetail[1].s=Number(saleData1.s)-Number(buyingdetail[0].s)
              saleData1.buyingdetail=buyingdetail
              allSales.push(saleData1);
              updateData[`type.${soldnumbertoadd1}`] = Number(users.type.get(soldnumbertoadd1)) + Number(saleData1.f)-Number(buyingdetail[0].f);
              updateData[`type.${soldnumbertoadd2}`] = Number(users.type.get(soldnumbertoadd2)) + Number(saleData1.s)-Number(buyingdetail[0].s);
            } else if (diff_of_f === f && diff_of_s !== s) {
              let saleData1 = {bundle, drawid, salecode, salenumber, type: "sale", f: 0, s: Number(s) - Number(diff_of_s),  addedby: arr };
              buyingdetail[1].f=Number(saleData1.f)-Number(buyingdetail[0].f)
              buyingdetail[1].s=Number(saleData1.s)-Number(buyingdetail[0].s)
              saleData1.buyingdetail=buyingdetail
              allSales.push(saleData1);
              updateData[`type.${soldnumbertoadd1}`] = Number(users.type.get(soldnumbertoadd1)) + Number(saleData1.f)-Number(buyingdetail[0].f);
              updateData[`type.${soldnumbertoadd2}`] = Number(users.type.get(soldnumbertoadd2)) + Number(saleData1.s)-Number(buyingdetail[0].s);
            }
            updateData[`type.${oversalenumbertoadd1}`] = Number(users.type.get(oversalenumbertoadd1)) + Number(saleData.f)-Number(buyingdetail[0].f);
            updateData[`type.${oversalenumbertoadd2}`] = Number(users.type.get(oversalenumbertoadd2))  + Number(saleData.s)-Number(buyingdetail[0].s);
  
            await draw.updateOne(
              { _id: drawid },
              { $set: updateData },
              { session }
            );
      
          }
        }
  
        if (allSales.length > 0) {
          let newSales = await sale.create(allSales, { session });
          newSales.forEach((obj)=>{
            console.log(obj)
            console.log(User.payment.availablebalance,"--",obj.type,"--",Number(obj.buyingdetail[1].f + obj.buyingdetail[1].s))
            if(obj.type==="sale"){
              User.payment.availablebalance -= Number(obj.buyingdetail[1].f + obj.buyingdetail[1].s);
            }
            console.log(User.payment.availablebalance,"--",obj.type,+"--",Number(obj.buyingdetail[1].f + obj.buyingdetail[1].s))
            
          })
          
          await User.save({ session });
          await session.commitTransaction();
          session.endSession();
          res.status(200).json({ status: true, data: newSales });
        } else {
          await session.commitTransaction();
          session.endSession();
          res.status(400).json({ status: false, "Message": "No valid sales processed" });
        }
  
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ status: false, "Message": err.message, "Error": err.message });
      }
    } else {
      res.status(403).json({ status: false, "Message": "You don't have access" });
    }
  };
  const Addsale = async (req, res) => {

    if (req.Tokendata.role === "merchant") {
        let { bundle, drawid, type, salenumber, f, s, salecode } = req.body;
        if(type==="sale"){
  
        
        let addedbyuserid = req.Tokendata._id;
        const session = await mongoose.startSession();
        session.startTransaction();
  let f1=f,s1=s
  let updateData = {};
  let buyingdetail=[{from:"me",f:0,s:0},{from:"notme",f:0,s:0}]
        try {
          let newobj=false
            let User = await user.findOne({ _id: addedbyuserid }).session(session);
  
            if (!User || User.payment.availablebalance < (Number(f) + Number(s))) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ status: false, "Message": "Insufficient balance" });
            }
            let users = await draw.findOne({ _id: drawid}).session(session);
            if (users) {
             
               // Parse the draw date and time from the users object
               const drawDateTime = new Date(`${users.date}T${users.time}Z`);
               let currentDatetime = new Date();
               let currentDate = currentDatetime.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
               let currentTime = currentDatetime.toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5); // 'HH:MM'
               // Check if the current date and time are less than the draw date and time
               const drawDateTime1 = new Date(`${currentDate}T${currentTime}Z`);
               if (drawDateTime1 >= drawDateTime) {
                   await session.abortTransaction();
                   session.endSession();
                   return res.status(400).json({ status: false, "Message": "Cannot execute sale. The draw time has passed." });
               }
                let numbertoadd1 = "";
                let numbertoadd2 = "";
                let userstoadd1 = "";
                let userstoadd2 = "";
                if (salenumber === 1) {
                  numbertoadd1 = "onedigita";
                  numbertoadd2 = "onedigitb";
                  userstoadd1 = "plimitaf";
                  userstoadd2 = "plimitas";
              } else if (salenumber === 2) {
                  numbertoadd1 = "twodigita";
                  numbertoadd2 = "twodigitb";
                  userstoadd1 = "plimitbf";
                  userstoadd2 = "plimitbf";
              } else if (salenumber === 3) {
                  numbertoadd1 = "threedigita";
                  numbertoadd2 = "threedigitb";
                  userstoadd1 = "plimitcf";
                  userstoadd2 = "plimitcf";
              } else if (salenumber === 4) {
                  numbertoadd1 = "fourdigita";
                  numbertoadd2 = "fourdigitb";
                  userstoadd1 = "plimitdf";
                  userstoadd2 = "plimitdf";
              }
                let soldnumbertoadd1 = "sold" + bundle + "a";
                let soldnumbertoadd2 = "sold" + bundle + "b";
                let oversalenumbertoadd1 = "oversale" + bundle + "a";
                let oversalenumbertoadd2 = "oversale" + bundle + "b";
  
                if (!users.type) {
                    users.type = new Map();
                }
               
                if (!users.user) {
                  users.user = new Map();
              }
  
                if ((!users.type)||!(users.type.has(soldnumbertoadd1)) || !(users.type.has(soldnumbertoadd2))) {
                    users.type.set(soldnumbertoadd1, 0);
                    users.type.set(soldnumbertoadd2, 0);
                    users.type.set(oversalenumbertoadd1, 0);
                    users.type.set(oversalenumbertoadd2, 0);
                    newobj=true
                }
                if (!(users.user.has(addedbyuserid+soldnumbertoadd1)) || !(users.user.has(addedbyuserid+soldnumbertoadd2))) {
                  users.user.set(addedbyuserid+soldnumbertoadd1, 0);
                  users.user.set(addedbyuserid+soldnumbertoadd2, 0);
                  updateData[`user.${addedbyuserid+soldnumbertoadd2}`] =0
                  updateData[`user.${addedbyuserid+soldnumbertoadd1}`] =0
                }
                  if(Number(User.purchase[userstoadd2])-Number(users.user.get(addedbyuserid+soldnumbertoadd2))>=Number(s)){
                    updateData[`user.${addedbyuserid+soldnumbertoadd2}`]=Number(users.user.get(addedbyuserid+soldnumbertoadd2))+Number(s)
                    buyingdetail[0].s=s
                    s1=0
                  }else if(Number(User.purchase[userstoadd2])-Number(users.user.get(addedbyuserid+soldnumbertoadd2))>0){
                    s1=Number(s1)-(Number(User.purchase[userstoadd2])-Number(users.user.get(addedbyuserid+soldnumbertoadd2)))
                    updateData[`user.${addedbyuserid+soldnumbertoadd2}`]=Number(User.purchase[userstoadd2])
                    buyingdetail[0].s=Number(s)-Number(s1)
                  }
                  if(Number(User.purchase[userstoadd1])-Number(users.user.get(addedbyuserid+soldnumbertoadd1))>=Number(f)){
                    updateData[`user.${addedbyuserid+soldnumbertoadd1}`]=users.user.get(addedbyuserid+soldnumbertoadd1)+Number(f)
                    buyingdetail[0].f=f
                    f1=0
                  }else if(Number(User.purchase[userstoadd1])-Number(users.user.get(addedbyuserid+soldnumbertoadd1))>0){
                    f1=Number(f1)-(Number(User.purchase[userstoadd1])-Number(users.user.get(addedbyuserid+soldnumbertoadd1)))
                    updateData[`user.${addedbyuserid+soldnumbertoadd1}`]=Number(User.purchase[userstoadd1])
                    buyingdetail[0].f=Number(f)-Number(f1)
                  }
                if (((Number(users[numbertoadd1]) - Number(users.type.get(soldnumbertoadd1))) >= Number(f1)) &&
                    ((Number(users[numbertoadd2]) - Number(users.type.get(soldnumbertoadd2))) >= Number(s1))) {
                      buyingdetail[1].f=f1
                      buyingdetail[1].s=s1
                      let arr=[...User.addedby]
                      arr.push(addedbyuserid)
                    let saleData = { bundle, buyingdetail,salecode, drawid, salenumber, type, f, s, addedby:arr };
                    let newSale = await sale.create([saleData], { session });
                    updateData[`type.${soldnumbertoadd1}`] = Number(users.type.get(soldnumbertoadd1)) + Number(f)-Number(buyingdetail[0].f);
                    updateData[`type.${soldnumbertoadd2}`] = Number(users.type.get(soldnumbertoadd2)) + Number(s)-Number(buyingdetail[0].s);
                      if(newobj ){
                        updateData[`type.${oversalenumbertoadd1}`] = 0
                        updateData[`type.${oversalenumbertoadd2}`] = 0
                      }
                    await draw.updateOne(
                        { _id: drawid },
                        { $set: updateData },
                        { session }
                    );
                    User.payment.availablebalance -= (Number(f) + Number(s));
                    await User.save({ session });
                    await session.commitTransaction();
                    session.endSession();
                    res.status(200).json({ status: true, data: newSale });
                } else {
                  let arr=[...User.addedby]
                  arr.push(addedbyuserid)
                    let diff_of_f = ((Number(users[numbertoadd1]) - Number(users.type.get(soldnumbertoadd1))) <= 0) ? f1 : (Number(f1) - ((Number(users[numbertoadd1]) - Number(users.type.get(soldnumbertoadd1)))));
                    let diff_of_s = ((Number(users[numbertoadd2]) - Number(users.type.get(soldnumbertoadd2))) <= 0) ? s1 : (Number(s1) - ((Number(users[numbertoadd2]) - Number(users.type.get(soldnumbertoadd2)))));
                    if(diff_of_f<0){
                      diff_of_f=0
                    }
                    if(diff_of_s<0){
                      diff_of_s=0
                    }
                    let saleData = { bundle, drawid, salecode, salenumber,buyingdetail:[{from:"me",f:0,s:0},{from:"notme",f:0,s:0}], type: "oversale", f: diff_of_f<0?0:diff_of_f, s: diff_of_s<0?0:diff_of_s,  addedby: arr};
                    let saleData1 = null, newSale1 = null;
  
                    if (diff_of_f !== f1 && diff_of_s !== s1) {
                      saleData1 = { bundle, drawid, salecode, salenumber, type: "sale", f: Number(f) - Number(diff_of_f), s: Number(s) - Number(diff_of_s),  addedby: arr };
                        buyingdetail[1].f=Number(saleData1.f)-Number(buyingdetail[0].f)
                        buyingdetail[1].s=Number(saleData1.s)-Number(buyingdetail[0].s)
                        updateData[`type.${soldnumbertoadd1}`] = Number(users.type.get(soldnumbertoadd1)) + Number(saleData1.f)-Number(buyingdetail[0].f);
                        updateData[`type.${soldnumbertoadd2}`] = Number(users.type.get(soldnumbertoadd2)) + Number(saleData1.s)-Number(buyingdetail[0].s);
                    } else if (diff_of_f !== f1 && diff_of_s === s1) {
                        saleData1 = { bundle, drawid, salecode, salenumber, type: "sale", f: Number(f) - Number(diff_of_f), s: 0,  addedby:arr };
                        updateData[`type.${soldnumbertoadd1}`] = Number(users.type.get(soldnumbertoadd1)) + Number(saleData1.f)-Number(buyingdetail[0].f);
                        updateData[`type.${soldnumbertoadd2}`] = Number(users.type.get(soldnumbertoadd2)) + Number(saleData1.s)-Number(buyingdetail[0].s);
                        buyingdetail[1].f=Number(saleData1.f)-Number(buyingdetail[0].f)
                        buyingdetail[1].s=Number(saleData1.s)-Number(buyingdetail[0].s)
                    } else if (diff_of_f === f1 && diff_of_s !== s1) {
                      saleData1 = { bundle, drawid, salecode, salenumber, type: "sale", f: 0, s: Number(s) - Number(diff_of_s),  addedby:arr};
                        updateData[`type.${soldnumbertoadd1}`] = Number(users.type.get(soldnumbertoadd1)) + Number(saleData1.f)-Number(buyingdetail[0].f);
                        updateData[`type.${soldnumbertoadd2}`] = Number(users.type.get(soldnumbertoadd2)) + Number(saleData1.s)-Number(buyingdetail[0].s);
                        buyingdetail[1].f=Number(saleData1.f)-Number(buyingdetail[0].f)
                        buyingdetail[1].s=Number(saleData1.s)-Number(buyingdetail[0].s)
                        
                    }
                    if (saleData1) {
                        saleData1.buyingdetail=buyingdetail
                        newSale1 = await sale.create([saleData1], { session });
                    }
  
                    let newSale = await sale.create([saleData], { session });
  
                    updateData[`type.${oversalenumbertoadd1}`] = Number(users.type.get(oversalenumbertoadd1)) + Number(saleData.f)-Number(buyingdetail[0].f);
                    updateData[`type.${oversalenumbertoadd2}`] = Number(users.type.get(oversalenumbertoadd2)) + Number(saleData.s)-Number(buyingdetail[0].s);
                    await draw.updateOne(
                        { _id: drawid },
                        { $set: updateData },
                        { session }
                    );
  
                    if (newSale1) {
                        User.payment.availablebalance -= (Number(saleData1.f) + Number(saleData1.s));
                        await User.save({ session });
                    }
                    await session.commitTransaction();
                    session.endSession();
                    if (newSale1) {
                        res.status(200).json({ status: true, data: [...newSale, ...newSale1] });
                    } else {
                        res.status(200).json({ status: true, data: newSale });
                    }
  
                }
            } else {
                await session.abortTransaction();
                session.endSession();
                res.status(404).json({ status: false, "Message": "Draw not found" });
            }
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            res.status(500).json({ status: false, "Message": err.message, "Error": err.message });
        }}
        else if(type==="oversale"){
          
        let addedbyuserid = req.Tokendata._id;
        const session = await mongoose.startSession();
        session.startTransaction();
  let f1=f,s1=s
  let updateData = {};
  let buyingdetail=[{from:"me",f:0,s:0},{from:"notme",f:0,s:0}]
  try{
    let User = await user.findOne({ _id: addedbyuserid }).session(session);
    let soldnumbertoadd1 = "sold" + bundle + "a";
    let soldnumbertoadd2 = "sold" + bundle + "b";
          let oversalenumbertoadd1 = "oversale" + bundle + "a";
          let oversalenumbertoadd2 = "oversale" + bundle + "b";
          let users = await draw.findOne({ _id: drawid}).session(session);
          if (users) {
            let newobj=false
             
            // Parse the draw date and time from the users object
            const drawDateTime = new Date(`${users.date}T${users.time}Z`);
            let currentDatetime = new Date();
            let currentDate = currentDatetime.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
            let currentTime = currentDatetime.toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5); // 'HH:MM'
            // Check if the current date and time are less than the draw date and time
            const drawDateTime1 = new Date(`${currentDate}T${currentTime}Z`);
            if (drawDateTime1 >= drawDateTime) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ status: false, "Message": "Cannot execute sale. The draw time has passed." });
            }
            if (!users.type) {
              users.type = new Map();
          }
         
          if (!users.user) {
            users.user = new Map();
        }
  
          if ((!users.type)||!(users.type.has(soldnumbertoadd1)) || !(users.type.has(soldnumbertoadd2))) {
              users.type.set(soldnumbertoadd1, 0);
              users.type.set(soldnumbertoadd2, 0);
              users.type.set(oversalenumbertoadd1, 0);
              users.type.set(oversalenumbertoadd2, 0);
              newobj=true
          }
          if (!(users.user.has(addedbyuserid+soldnumbertoadd1)) || !(users.user.has(addedbyuserid+soldnumbertoadd2))) {
            users.user.set(addedbyuserid+soldnumbertoadd1, 0);
            users.user.set(addedbyuserid+soldnumbertoadd2, 0);
            updateData[`user.${addedbyuserid+soldnumbertoadd2}`] =0
            updateData[`user.${addedbyuserid+soldnumbertoadd1}`] =0
          }
          let arr=[...User.addedby]  
          let saleData = { bundle, drawid, salecode, salenumber,buyingdetail:[{from:"me",f:0,s:0},{from:"notme",f:0,s:0}], type: "oversale", f: f<0?0:f, s: s<0?0:s,  addedby: arr};
          let newSale = await sale.create([saleData], { session });
  
          updateData[`type.${oversalenumbertoadd1}`] = Number(users.type.get(oversalenumbertoadd1)) + Number(saleData.f)-Number(buyingdetail[0].f);
          updateData[`type.${oversalenumbertoadd2}`] = Number(users.type.get(oversalenumbertoadd2)) + Number(saleData.s)-Number(buyingdetail[0].s);
          await draw.updateOne(
              { _id: drawid },
              { $set: updateData },
              { session }
          );
          await session.commitTransaction();
          session.endSession();
              res.status(200).json({ status: true, data: newSale });
  
      
        }
  }catch(e){
  
  }
        
        }
    } else {
        res.status(403).json({ status: false, "Message": "You don't have access" });
    }
  };
let addsheet = async (req, res) => {
  try {
    // Create a new sheet
    const newSheet = new sheet({
      drawid: req.body.drawid,
      sheetname: req.body.sheetname,
      date: req.body.date,
      addedby: req.Tokendata._id
    });
    
    // Save the new sheet
    const savedSheet = await newSheet.save();
    let users =await user.findById(req.Tokendata._id)
    // Fetch all sales
    let sales = await sale.find({drawid:req.body.drawid,sheetid:'',addedby:[...users.addedby,req.Tokendata._id]});

    // Check if there are any sales
    if (sales.length === 0) {
      return res.status(404).json({ message: 'No sales found' });
    }

    // Update each sale with the new sheet's _id
    let sheetid = savedSheet._id;

    let updatedSales = await Promise.all(
      sales.map(async sale => {
        sale.sheetid = sheetid;
        return await sale.save();
      })
    );

    res.status(200).json({ message: 'Sheet created and sheetid updated for all sales', newSheet: savedSheet, updatedSales });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
let getAllSheets=async(req,res)=>{
  try {
    let sheets = await sheet.find({addedby:req.Tokendata._id,date:req.Tokendata.date});
    res.status(200).json(sheets);
} catch (err) {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
}
}
let getSalesofaSheet=async(req,res)=>{
  try {
    const { sheetid } = req.params;

    // Find sales with the specified sheetid
    const sales = await sale.find({ sheetid });

    // Check if sales were found
    if (sales.length === 0) {
      return res.status(404).json({ message: 'No sales found for this sheet' });
    }

    // Return the found sales
    res.status(200).json({ sales });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
    Addsale,
    getMySaleDetail,
    DeleteSales,
    Addmultiplesale,
    addsheet,
    getAllSheets,
    getSalesofaSheet,
    DeleteMultipleSales
}
