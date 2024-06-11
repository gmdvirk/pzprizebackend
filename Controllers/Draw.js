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
        let {title,time,onedigita,onedigitb,twodigita,twodigitb,threedigita,threedigitb,fourdigita,fourdigitb,fivedigita,fivedigitb,status } = req.body;
        let addedbyuserid = req.Tokendata.userid
        let data = {title,time,onedigita,onedigitb,twodigita,twodigitb,threedigita,threedigitb,fourdigita,fourdigitb,fivedigita,fivedigitb,status,addedby:Number(addedbyuserid)};
        draw.create(data).then(data=>{
            res.status(200).json({status:true,data})
        }).catch(err=>{
            res.status(500).json({status:false,"Message":"there was Some Error"})
        })
    }else{
        res.status(403).json({status:false,"Message":"You dont have access"})
      }
   
  }
  
  module.exports  ={
    getAllDraws,
    Createdraw
}