const user = require("../models/Users.schema")
const draw = require("../models/Draw.schema")
const payment = require("../models/Payment.schema")
const jwt = require("jsonwebtoken")
let getAllpaymentsbyID= async(req , res)=>{
    let id=req.params.id
    let customerid=id;
      let payments = await payment.find({customerid});
      if(payments)
      {
         payments.sort((a,b)=>a.paymentid-b.paymentid)
         res.status(200).json(payments)
      }else
      {
        res.status(404).json({"Message":"Error" })
      }
   
  }
  let Addcashpayment =async (req , res)=>{
        let {type,description,amount,id } = req.body;
        
        let addedbyuserid = req.Tokendata.userid;
        let users1 = await user.findOne({_id:id});
      if(users1)
      {
         if(users1.payment.cash!==0||users1.payment.credit!==0||users1.payment.balanceupline!==0){
          if(type=="Draw"){
            let credit=0,cash=0,balanceupline=0;
            let last=users1.payment
            cash=cash+Number(last.cash)+Number(amount)
            credit=credit+last.credit
            balanceupline=last.balanceupline+Number(amount)
            let data = {cash,credit,type,description,amount,customerid:id,addedby:Number(addedbyuserid),balanceupline};
            payment.create(data).then(async(data)=>{
                     let data1={...users1}
                     data1._doc.payment={
                       cash:data.cash,credit:data.credit,balanceupline:data.balanceupline
                     }
                     let temvar=data1._doc
                     let tempid=temvar._id
                     let users = await user.findByIdAndUpdate(tempid , temvar);
                     if(users)
                     {
                        res.status(200).json({status:true,data:users,payment:data})
                     }else
                     {
                       res.status(404).json({status:false,"Message":"Error"})
                     }
            }).catch(err=>{
                res.status(500).json({status:false,"Message":"there was Some Error"})
            })
           

          }else if(type==="Withdraw"){
            let credit=0,cash=0,balanceupline=0;
            let last=users1.payment
            
            cash=cash+Number(last.cash)-Number(amount)
        credit=credit+last.credit
            balanceupline=last.balanceupline-Number(amount)
            let data = {cash,credit,type,description,amount,customerid:id,addedby:Number(addedbyuserid),balanceupline};
            payment.create(data).then(async(data)=>{
                     let data1={...users1}
                     data1._doc.payment={
                       cash:data.cash,credit:data.credit,balanceupline:data.balanceupline
                     }
                     let temvar=data1._doc
                     let tempid=temvar._id
                     let users = await user.findByIdAndUpdate(tempid , temvar);
                     if(users)
                     {
                        res.status(200).json({status:true,data:users,payment:data})
                     }else
                     {
                       res.status(404).json({status:false,"Message":"Error"})
                     }
            }).catch(err=>{
                res.status(500).json({status:false,"Message":"there was Some Error"})
            })
           
          }
         
         }else{
          let cash=amount;
          let credit=0;
          if(type==="Draw"){
            let data = {cash,credit,type,description,amount,customerid:id,addedby:Number(addedbyuserid),balanceupline:amount};
            payment.create(data).then(async(data)=>{
                     let data1={...users1}
                     data1._doc.payment={
                       cash:data.cash,credit:data.credit,balanceupline:data.balanceupline
                     }
                     let temvar=data1._doc
                     let tempid=temvar._id
                     let users = await user.findByIdAndUpdate(tempid , temvar);
                     if(users)
                     {
                        res.status(200).json({status:true,data:users,payment:data})
                     }else
                     {
                       res.status(404).json({status:false,"Message":"Error"})
                     }
            }).catch(err=>{
                res.status(500).json({status:false,"Message":"there was Some Error"})
            })
           
          }else if(type==="Withdraw"){
            cash=(-1*amount)
            let data = {cash,credit,type,description,amount,customerid:id,addedby:Number(addedbyuserid),balanceupline:cash};
            payment.create(data).then(async(data)=>{
                    let data1={...users1}
                    data1._doc.payment={
                      cash:data.cash,credit:data.credit,balanceupline:data.balanceupline
                    }
                    let temvar=data1._doc
                    let tempid=temvar._id
                    let users = await user.findByIdAndUpdate(tempid , temvar);
                    if(users)
                    {
                       res.status(200).json({status:true,data:users,payment:data})
                    }else
                    {
                      res.status(404).json({status:false,"Message":"Error"})
                    }
            }).catch(err=>{
                res.status(500).json({status:false,"Message":"there was Some Error"})
            })
            let users1 = await user.findOne({_id:id});
           
          }
       
         }
      }else
      {
        res.status(404).json({"Message":"Error" })
      }
       
  }
  let Addcreditpayment =async (req , res)=>{
    let {type,description,amount,id } = req.body;
    
    let addedbyuserid = req.Tokendata.userid;
    let users1 = await user.findOne({_id:id});
  if(users1)
  {
   
     if(users1.payment.cash!==0||users1.payment.credit!==0||users1.payment.balanceupline!==0){
      if(type=="Draw"){
        let credit=0,cash=0,balanceupline=0;
        let last=users1.payment
        credit=credit+Number(last.credit)+Number(amount)
        cash=cash+last.cash
        balanceupline=last.balanceupline
        let data = {cash,credit,type,amount,description,customerid:id,addedby:Number(addedbyuserid),balanceupline};
        payment.create(data).then(async(data)=>{
                 let data1={...users1}
                 data1._doc.payment={
                   cash:data.cash,credit:data.credit,balanceupline:data.balanceupline
                 }
                 let temvar=data1._doc
                 let tempid=temvar._id
                 let users = await user.findByIdAndUpdate(tempid , temvar);
                 if(users)
                 {
                    res.status(200).json({status:true,data:users,payment:data})
                 }else
                 {
                   res.status(404).json({status:false,"Message":"Error"})
                 }
        }).catch(err=>{
            res.status(500).json({status:false,"Message":"there was Some Error"})
        })
      }else if(type==="Withdraw"){
        let credit=0,cash=0,balanceupline=0;
        let last=users1.payment
        credit=credit+Number(last.credit)-Number(amount)
            cash=cash+last.cash
        balanceupline=last.balanceupline
        let data = {cash,credit,type,description,amount,customerid:id,addedby:Number(addedbyuserid),balanceupline};
        payment.create(data).then(async(data)=>{
                 let data1={...users1}
                 data1._doc.payment={
                   cash:data.cash,credit:data.credit,balanceupline:data.balanceupline
                 }
                 let temvar=data1._doc
                 let tempid=temvar._id
                 let users = await user.findByIdAndUpdate(tempid , temvar);
                 if(users)
                 {
                    res.status(200).json({status:true,data:users,payment:data})
                 }else
                 {
                   res.status(404).json({status:false,"Message":"Error"})
                 }
        }).catch(err=>{
            res.status(500).json({status:false,"Message":"there was Some Error"})
        })
      }
     
     }else{
      let cash=amount;
      let credit=0;
      if(type==="Draw"){
        let data = {cash,credit,type,description,amount,customerid:id,addedby:Number(addedbyuserid),balanceupline:0};
        payment.create(data).then(async(data)=>{
                 let data1={...users1}
                 data1._doc.payment={
                   cash:data.cash,credit:data.credit,balanceupline:data.balanceupline
                 }
                 let temvar=data1._doc
                 let tempid=temvar._id
                 let users = await user.findByIdAndUpdate(tempid , temvar);
                 if(users)
                 {
                    res.status(200).json({status:true,data:users,payment:data})
                 }else
                 {
                   res.status(404).json({status:false,"Message":"Error"})
                 }
        }).catch(err=>{
            res.status(500).json({status:false,"Message":"there was Some Error"})
        })
      }else if(type==="Withdraw"){
        cash=(-1*amount)
        let data = {cash,credit,type,description,amount,customerid:id,addedby:Number(addedbyuserid),balanceupline:0};
        payment.create(data).then(async(data)=>{
                 let data1={...users1}
                 data1._doc.payment={
                   cash:data.cash,credit:data.credit,balanceupline:data.balanceupline
                 }
                 let temvar=data1._doc
                 let tempid=temvar._id
                 let users = await user.findByIdAndUpdate(tempid , temvar);
                 if(users)
                 {
                    res.status(200).json({status:true,data:users,payment:data})
                 }else
                 {
                   res.status(404).json({status:false,"Message":"Error"})
                 }
        }).catch(err=>{
            res.status(500).json({status:false,"Message":"there was Some Error"})
        })
      }
   
     }
  }else
  {
    res.status(404).json({"Message":"Error" })
  }
   
}

  module.exports  ={
    Addcashpayment,
    Addcreditpayment,
    getAllpaymentsbyID,
}