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
  let Createdraw =async (req , res)=>{
    if(req.Tokendata.role==="superadmin"){
        let {title,time,date,onedigita,onedigitb,twodigita,twodigitb,threedigita,threedigitb,fourdigita,fourdigitb,fivedigita,fivedigitb,status } = req.body;
        let addedbyuserid = req.Tokendata.userid
        let data = {title,time,date,onedigita,onedigitb,twodigita,twodigitb,threedigita,threedigitb,fourdigita,fourdigitb,fivedigita,fivedigitb,soldonedigita:"0",soldonedigitb:"0",soldtwodigita:"0",soldtwodigitb:"0",soldthreedigita:"0",soldthreedigitb:"0",soldfourdigita:"0",soldfourdigitb:"0",soldfivedigita:"0",soldfivedigitb:"0",firstprize:"",secondprize1:"",secondprize2:"",secondprize3:"",secondprize4:"",secondprize5:"",status,addedby:Number(addedbyuserid)};
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
    deactivatedrawById
}