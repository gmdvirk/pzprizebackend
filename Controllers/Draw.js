const user = require("../models/Users.schema")
const draw = require("../models/Draw.schema")
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
let getAllActiveDraws = async (req, res) => {
  let currentDatetime = new Date();

  let currentDate = currentDatetime.toISOString().split('T')[0]; // Extracts the date in YYYY-MM-DD format
  let currentTime = currentDatetime.toTimeString().split(' ')[0].slice(0, 5); // Extracts the time in HH:MM format

  try {
      let draws = await draw.find({
          status: 'active',
          $or: [
              { date: { $lt: currentDate } },
              { date: currentDate, time: { $lt: currentTime } }
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


  let Createdraw =async (req , res)=>{
    if(req.Tokendata.role==="superadmin"){
        let {title,time,date,onedigita,onedigitb,twodigita,twodigitb,threedigita,threedigitb,fourdigita,fourdigitb,fivedigita,fivedigitb,status } = req.body;
        let addedbyuserid = req.Tokendata.userid
        let data = {oversaleonedigita:"0",oversaleonedigitb:"0",oversaletwodigita:"0",oversaletwodigitb:"0",oversalethreedigita:"0",oversalethreedigitb:"0",oversalefourdigita:"0",oversalefourdigitb:"0",oversalefivedigita:"0",oversalefivedigitbtitle,time,date,onedigita,onedigitb,twodigita,twodigitb,threedigita,threedigitb,fourdigita,fourdigitb,fivedigita,fivedigitb,soldonedigita:"0",soldonedigitb:"0",soldtwodigita:"0",soldtwodigitb:"0",soldthreedigita:"0",soldthreedigitb:"0",soldfourdigita:"0",soldfourdigitb:"0",soldfivedigita:"0",soldfivedigitb:"0",firstprize:"",secondprize1:"",secondprize2:"",secondprize3:"",secondprize4:"",secondprize5:"",status,addedby:Number(addedbyuserid)};
        draw.create(data).then(data=>{
            res.status(200).json({status:true,data})
        }).catch(err=>{
            res.status(500).json({status:false,"Message":"there was Some Error"})
        })
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
      let users = await draw.findByIdAndUpdate(id , data);
      if(users)
      {
         res.status(200).json({status:true,data:users})
      }else
      {
        res.status(404).json({status:false,"Message":"Error"})
      }
  }
  
  module.exports  ={
    getAllDraws,
    Createdraw,
    updatedrawById,
    activatedrawById,
    deactivatedrawById,
    getAllActiveDraws
}