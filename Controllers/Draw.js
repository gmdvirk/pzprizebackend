const user = require("../models/Users.schema")
const draw = require("../models/Draw.schema")
const sheet = require("../models/Sheet.schema");
const jwt = require("jsonwebtoken")
let getAllDraws= async(req , res)=>{
    if(req.Tokendata.role==="superadmin"){
      let draws = await draw.find({});
      if(draws)
      {
         res.status(200).json(draws)
      }else
      {
        res.status(404).json({"Message":"Error" })
      }
    }else{
      res.status(403).json({"Message":"You dont have access"})
    }
   
  }
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
// let getAllActiveDraws = async (req, res) => {
//   let currentDatetime = new Date();

//   let currentDate = currentDatetime.toISOString().split('T')[0]; // Extracts the date in YYYY-MM-DD format
//   let currentTime = currentDatetime.toTimeString().split(' ')[0].slice(0, 5); // Extracts the time in HH:MM format

//   try {
//       let draws = await draw.find({
//           status: 'active',
//           $or: [
//               { date: { $gt: currentDate } },
//               { date: currentDate, time: { $gt: currentTime } }
//           ]
//       });

//       if (draws.length > 0) {
//           res.status(200).json(draws);
//       } else {
//           res.status(404).json({ "Message": "No active draws found" });
//       }
//   } catch (error) {
//       res.status(500).json({ "Message": "Error", "Error": error.message });
//   }
// };
let getAllActiveDraws = async (req, res) => {
  let currentDatetime = new Date();

  // Convert current UTC time to the desired timezone (UTC-5, for example, for PDT)
  let timezoneOffset = 5 * 60 * 60 * 1000;  // 5 hours in milliseconds
  let currentAdjustedDatetime = new Date(currentDatetime.getTime() - timezoneOffset);

  let currentDate = currentAdjustedDatetime.toISOString().split('T')[0]; // Extracts the date in YYYY-MM-DD format
  let currentTime = currentAdjustedDatetime.toTimeString().split(' ')[0].slice(0, 5); // Extracts the time in HH:MM format

  try {
      let draws = await draw.find({
          status: 'active',
          $or: [
              // Condition for draws on dates after today
              { date: { $gt: currentDate } },
              // Condition for draws on the current date but with a time greater than the current adjusted time
              { 
                date: currentDate, 
                time: { $gt: currentTime } 
              }
          ]
      });

      if (draws.length > 0) {
          res.status(200).json(draws);
      } else {
          res.status(404).json({ "Message": "No active draws found" });
      }
  } catch (error) {
      res.status(500).json({ "Message": "Error", "Error": error.message });
  }
};

let getAllDeactiveOrExpiredDraws = async (req, res) => {
  let currentDatetime = new Date();

  let currentDate = currentDatetime.toISOString().split('T')[0]; // YYYY-MM-DD
  let currentTime = currentDatetime.toTimeString().split(' ')[0].slice(0, 5); // HH:MM

  try {
    let draws = await draw.find({
      $or: [
        { status: 'deactive' },
        {
          status: 'active',
          $or: [
            // Compare dates as strings
            { date: { $lt: currentDate } },
            // For the same date, compare time as strings
            { date: currentDate, time: { $lt: currentTime } }
          ]
        }
      ]
    });

    if (draws.length > 0) {
      res.status(200).json(draws);
    } else {
      res.status(404).json({ "Message": "No deactive or expired draws found" });
    }
  } catch (error) {
    res.status(500).json({ "Message": "Error", "Error": error.message });
  }
};


let getAllDeactiveOrExpiredDrawsInfo = async (req, res) => {
  let currentDatetime = new Date();

  let currentDate = currentDatetime.toISOString().split('T')[0]; // YYYY-MM-DD
  let currentTime = currentDatetime.toTimeString().split(' ')[0].slice(0, 5); // HH:MM

  try {
    let draws = await draw.find({
      $or: [
        { status: 'deactive' },
        {
          status: 'active',
          $or: [
            // Compare dates as strings
            { date: { $lt: currentDate } },
            // For the same date, compare time as strings
            { date: currentDate, time: { $lt: currentTime } }
          ]
        }
      ]
    },
    { _id:1, 
      title: 1,
      time: 1,
      date: 1,
      onedigita: 1,
      onedigitb: 1,
      twodigita: 1,
      twodigitb: 1,
      threedigita: 1,
      threedigitb: 1,
      fourdigita: 1,
      fourdigitb: 1,
      status: 1,
      firstprize: 1,
      secondprize1: 1,
      secondprize2: 1,
      secondprize3: 1,
      secondprize4: 1,
      secondprize5: 1,
      addedby: 1,
      balanceupdated:1,
    }
  );

    if (draws.length > 0) {
      res.status(200).json(draws);
    } else {
      res.status(404).json({ "Message": "No deactive or expired draws found" });
    }
  } catch (error) {
    res.status(500).json({ "Message": "Error", "Error": error.message });
  }
};

let getLastTenDraws = async (req, res) => {

  try {
      // Fetch the last 10 draws sorted by a date field in descending order
      // let draws = await draw.find({}).sort({ createdAt: -1 }).limit(10);
      let draws = await draw.find({}, { title: 1,_id:1, date: 1,time:1,status:1 }).sort({ createdAt: -1 }).limit(10);
      if (draws.length > 0) {
          res.status(200).json(draws);
      } else {
          res.status(404).json({ "Message": "No active draws found" });
      }
  } catch (error) {
      res.status(500).json({ "Message": "Error", "Error": error.message });
  }
};
let getlasttendrawsmerchant= async (req, res) => {

  try {
      let draws = await draw.find({}, { title: 1,_id:1, date: 1,time:1,status:1  }).sort({ createdAt: -1 }).limit(10);
      if (draws.length > 0) {
        let sheets=await sheet.find({addedby:req.Tokendata._id})
          res.status(200).json({draws,sheets});
      } else {
          res.status(404).json({ "Message": "No active draws found" });
      }
  } catch (error) {
      res.status(500).json({ "Message": "Error", "Error": error.message });
  }
};

  let Createdraw =async (req , res)=>{
    if(req.Tokendata.role==="superadmin"){
      
        let {title,time,date,onedigita,onedigitb,twodigita,twodigitb,threedigita,threedigitb,fourdigita,fourdigitb,fivedigita,fivedigitb,status } = req.body;
        let finddraw=await draw.find({date})
      if(finddraw.length>0){
        res.status(500).json({status:false,"Message":"No two draws can be on same date"})
      }else{
        let addedbyuserid = req.Tokendata._id
        let data = {balanceupdated:false,oversaleonedigita:0,oversaleonedigitb:0,oversaletwodigita:0,oversaletwodigitb:0,oversalethreedigita:0,oversalethreedigitb:0,oversalefourdigita:0,oversalefourdigitb:0,oversalefivedigita:0,oversalefivedigitb:0,title,time,date,onedigita,onedigitb,twodigita,twodigitb,threedigita,threedigitb,fourdigita,fourdigitb,fivedigita,fivedigitb,soldonedigita:0,soldonedigitb:0,soldtwodigita:0,soldtwodigitb:0,soldthreedigita:0,soldthreedigitb:0,soldfourdigita:0,soldfourdigitb:0,soldfivedigita:0,soldfivedigitb:0,firstprize:"",secondprize1:"",secondprize2:"",secondprize3:"",secondprize4:"",secondprize5:"",status,addedby:addedbyuserid};
        draw.create(data).then(data=>{
            res.status(200).json({status:true,data})
        }).catch(err=>{
            res.status(500).json({status:false,"Message":"there was Some Error"})
        })
      }
     
    }else{
        res.status(403).json({status:false,"Message":"You dont have access"})
      }
  }
  let activatedrawById = async(req ,res)=>{
      let id = req.body._id;
      let users = await draw.findById(id);
      if(users)
      {
        users.status="active";
        let usersupdated = await draw.findByIdAndUpdate(id , users);
        if(usersupdated){
          res.status(200).json({status:true,data:users})
        }else
        {
          res.status(404).json({status:false,"Message":"Error"})
        }
      
      }else
      {
        res.status(404).json({status:false,"Message":"Error"})
      }
  }
  let deactivatedrawById = async(req ,res)=>{
    let id = req.body._id;
    let users = await draw.findById(id);
    if(users)
    {
      users.status="deactive";
      let usersupdated = await draw.findByIdAndUpdate(id , users);
      if(usersupdated){
        res.status(200).json({status:true,data:users})
      }else
      {
        res.status(404).json({status:false,"Message":"Error"})
      }
    
    }else
    {
      res.status(404).json({status:false,"Message":"Error"})
    }
}
  let updatedrawById = async(req ,res)=>{
    let User=req.Tokendata
      let id = req.body._id;
      let data = req.body;
      let draws = await draw.find({date:data.date});
      if(draws.length>0){
        if(draws[0]._id!=id){
          res.status(500).json({status:false,"Message":"Another draw have same closing date. You can not have two draws closing at same day"})
        }
      }
      let users = await draw.findByIdAndUpdate(id , data);
      if(users)
      {
         res.status(200).json({status:true,data:users})
      }else
      {
        res.status(404).json({status:false,"Message":"Error"})
      }
  }
  // New function to get a draw by ID
let getDrawById = async (drawId) => {
  try {
    let draw = await draw.findById(drawId);
    return draw;
  } catch (error) {
    throw new Error("Error fetching draw");
  }
};
let getDrawfieldsvalue = async (req, res) => {
  try {
    const { drawid, bundle } = req.body;

    // Fetch the draw by its ID
    let draws = await draw.findById(drawid);
    let users = await user.findById(req.Tokendata._id);
    let distributorid=req.Tokendata.distributorid
    let Distributor=await user.findOne({_id:distributorid})
    // let users = await user.findById(req.Tokendata._id);
    if (draws) {
      let obj = { a: 0, b: 0 };
      let soldnumbertoadd1 = "sold" + bundle + "a";
      let soldnumbertoadd2 = "sold" + bundle + "b";
      let salenumber = bundle.length;
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
      let tempobj={f:0,s:0}
      if(draws.user&&draws.user.has(distributorid+soldnumbertoadd1)){
        tempobj.s=Number(Distributor.purchase[userstoadd2])-Number(draws.user.get(distributorid+soldnumbertoadd2))
        tempobj.f=Number(Distributor.purchase[userstoadd1])-Number(draws.user.get(distributorid+soldnumbertoadd1))
      }else{
        tempobj.s=Number(Distributor.purchase[userstoadd2])
        tempobj.f=Number(Distributor.purchase[userstoadd1])
      }
      // Check if the sold numbers exist in the document
      if (draws.type&&draws.type.has(soldnumbertoadd1)) {
         // Check if the key exists in the Map
        obj.a = Number(draws[numbertoadd1]) - Number(draws.type.get(soldnumbertoadd1))+Number(tempobj.f);
        obj.b = Number(draws[numbertoadd2]) - Number(draws.type.get(soldnumbertoadd2))+Number(tempobj.s);
        // obj.a =  Number(draws.type.get(soldnumbertoadd1)) +Number(tempobj.f);
        // obj.b =  Number(draws.type.get(soldnumbertoadd2))+Number(tempobj.s);
        // if(Number(tempobj.f)>0){

        // }else{

        //   obj.a = Number(draws[numbertoadd1]) +Number(tempobj.f);
        // }
        // if(Number(tempobj.s)>0){

        // }else{

        //   obj.b = Number(draws[numbertoadd2]) +Number(tempobj.s);
        // }
      } else {
        obj.a = Number(draws[numbertoadd1])+Number(tempobj.f);
        obj.b = Number(draws[numbertoadd2])+Number(tempobj.s);
      }
     
      res.status(200).json({ status: true, data: obj });
    } else {
      console.log("error")
      res.status(404).json({ status: false, "Message": "Draw not found" });
    }
  } catch (error) {
    res.status(500).json({ status: false, "Message": error.message });
  }
};
let getDrawInfo= async (req, res) => {

  try {
      let draws = await draw.find({}, { _id:1, 
        title: 1,
        time: 1,
        date: 1,
        onedigita: 1,
        onedigitb: 1,
        twodigita: 1,
        twodigitb: 1,
        threedigita: 1,
        threedigitb: 1,
        fourdigita: 1,
        fourdigitb: 1,
        status: 1,
        firstprize: 1,
        secondprize1: 1,
        secondprize2: 1,
        secondprize3: 1,
        secondprize4: 1,
        secondprize5: 1,
        addedby: 1,
        balanceupdated:1,

      }).sort({ createdAt: -1 });
      if (draws.length > 0) {
          res.status(200).json(draws);
      } else {
          res.status(404).json({ "Message": "No active draws found" });
      }
  } catch (error) {
      res.status(500).json({ "Message": "Error", "Error": error.message });
  }
};

  module.exports  ={
    getAllDraws,
    getDrawInfo,
    Createdraw,
    updatedrawById,
    activatedrawById,
    deactivatedrawById,
    getAllActiveDraws,
    getDrawById,
    getDrawfieldsvalue,
    getLastTenDraws,
    getlasttendrawsmerchant,
    getAllDeactiveOrExpiredDraws,
    getAllDeactiveOrExpiredDrawsInfo
}