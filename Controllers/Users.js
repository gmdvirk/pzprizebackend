
const user = require("../models/Users.schema")
const Limit = require("../models/Limit.schema");
const jwt = require("jsonwebtoken")
let getAllUsers = async(req , res)=>{
  try{if(req.Tokendata.role==="superadmin"){
    let users = await user.find({ role: { $ne: 'superadmin' } ,addedby:req.Tokendata._id});
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" })
    }
  }else{
    res.status(403).json({"Message":"You dont have access"})
  }
}
  catch(e){
    res.status(403).json({"Message":"Internal server error",err:e})

  }
 
}
let getadmindetail=async(req,res)=>{
  try{if(req.Tokendata.role==="superadmin"){
    let users = await user.find({ role: 'superadmin',_id:req.Tokendata._id});
    if(users)
    {
       res.status(200).json(users[0])
    }else
    {
      res.status(404).json({"Message":"Error" })
    }
  }else{
    res.status(403).json({"Message":"You dont have access"})
  }
}
  catch(e){
    res.status(403).json({"Message":"Internal server error",err:e})

  }
}
let getAllDistributors = async(req , res)=>{
  try{if(req.Tokendata.role==="superadmin"){
    let users = await user.find({ role:  'distributor'  });
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error"})
    }
  }else{
    res.status(403).json({"Message":"You dont have access"})
  }}
  catch(e){
    res.status(403).json({"Message":"Internal server error",err:e})

  }
 
}
let getBalance=async(req,res)=>{
  try{
    let id = req.Tokendata._id;
    let users = await user.findOne({_id:id});
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Not Found"})
    }}
    catch(err){
      res.status(404).json({"Message":"Error" , err:err})

    }
}
let getAllSubDistributors = async(req , res)=>{
  try{if(req.Tokendata.role==="superadmin"){
    let users = await user.find({ role:  'subdistributor'  });
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error"})
    }
  }else{
    res.status(403).json({"Message":"You dont have access"})
  }
}
  catch(e){
    res.status(403).json({"Message":"Internal server error",err:e})

  }
 
}
let getAllMyDistributors = async(req, res) => {
  try {
    if (req.Tokendata.role === "superadmin") {
      let addedbyuserid = req.Tokendata._id; // Assuming you meant _id instead of userid

      // Find users with role 'distributor' and where the last element of addedby array matches addedbyuserid
      let users = await user.find({
        role: 'distributor',
        addedby: { $exists: true, $ne: [] },
        $expr: {
          $eq: [{ $arrayElemAt: ["$addedby", -1] }, addedbyuserid]
        }
      });

      if (users && users.length > 0) {
        res.status(200).json(users);
      } else {
        res.status(404).json({"Message": "No distributors found"});
      }
    } else {
      res.status(403).json({"Message": "You don't have access"});
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({"Message": "Internal server error", err: e.message});
  }
};
// let getAllMyDistributors = async(req , res)=>{
//  try{ if(req.Tokendata.role==="superadmin"){
//     let addedbyuserid=req.Tokendata.userid
//     let users = await user.find({ role:  'distributor' ,addedby:addedbyuserid });
//     if(users)
//     {
//        res.status(200).json(users)
//     }else
//     {
//       res.status(404).json({"Message":"Error"})
//     }
//   }else{
//     res.status(403).json({"Message":"You dont have access"})
//   }
// }
//   catch(e){
//     res.status(403).json({"Message":"Internal server error",err:e})

//   }
// }
// let getAllMySubDistributors = async(req , res)=>{
//    try{ let addedbyuserid=req.Tokendata._id
//     let users = await user.find({ role:  'subdistributor' ,addedby:addedbyuserid });
//     if(users)
//     {
//        res.status(200).json(users)
//     }else
//     {
//       res.status(404).json({"Message":"Error" })
//     }
 
// }
// catch(e){
//   res.status(403).json({"Message":"Internal server error",err:e})

// }
// }
let getAllMySubDistributors = async(req, res) => {
  try {
    let addedbyuserid = req.Tokendata._id;
    
    // Find users with role 'subdistributor' and where the last element of addedby array matches addedbyuserid
    let users = await user.find({
      role: 'subdistributor',
      addedby: { $exists: true, $ne: [] },
      $expr: {
        $eq: [{ $arrayElemAt: ["$addedby", -1] }, addedbyuserid]
      }
    });

    if (users && users.length > 0) {
      res.status(200).json(users);
    } else {
      res.status(404).json({"Message": "No subdistributors found"});
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({"Message": "Internal server error", err: e.message});
  }
};
let getAllMerchants= async(req , res)=>{
  try{if(req.Tokendata.role==="superadmin"){
    let addedbyuserid=req.Tokendata.userid
    let users = await user.find({ role:  'merchant' });
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" })
    }
  }else{
    res.status(403).json({"Message":"You dont have access"})
  }}

  catch(e){
    res.status(403).json({"Message":"Internal server error",err:e})

  }
 
}
// let getAllMyMerchants= async(req , res)=>{
//     try{let addedbyuserid=req.Tokendata._id
//     let users = await user.find({ role:  'merchant',addedby:addedbyuserid});
//     if(users)
//     {
//        res.status(200).json(users)
//     }else
//     {
//       res.status(404).json({"Message":"Error" })
//     }
//   }
//     catch(e){
//       res.status(403).json({"Message":"Internal server error",err:e})
  
//     }
 
// }
let getAllMyMerchants = async(req, res) => {
  try {
    let addedbyuserid = req.Tokendata._id;
    
    // Find users with role 'merchant' and where the last element of addedby array matches addedbyuserid
    let users = await user.find({
      role: 'merchant',
      addedby: { $exists: true, $ne: [] },
      $expr: {
        $eq: [{ $arrayElemAt: ["$addedby", -1] }, addedbyuserid]
      }
    });

    if (users && users.length > 0) {
      res.status(200).json(users);
    } else {
      res.status(404).json({"Message": "No merchants found"});
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({"Message": "Internal server error", err: e.message});
  }
};
let getAllMyusers = async(req, res) => {
  try {
    let addedbyuserid = req.Tokendata._id;
    
    // Find users with role 'merchant' and where the last element of addedby array matches addedbyuserid
    let users = await user.find({
      addedby: { $exists: true, $ne: [] },
      $expr: {
        $eq: [{ $arrayElemAt: ["$addedby", -1] }, addedbyuserid]
      }
    });

    if (users && users.length > 0) {
      res.status(200).json(users);
    } else {
      res.status(404).json({"Message": "No merchants found"});
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({"Message": "Internal server error", err: e.message});
  }
};
let GetUserById = async(req ,res)=>{
    try{let id = req.params.id;
    let users = await user.findOne({_id:id});
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
  }
    catch(e){
      res.status(403).json({"Message":"Internal server error",err:e})
  
    }
}
async function getAllUsersAddedBy(userId) {
  const allUsers = [];
  
  async function findUsersAddedBy(currentUserId) {
      const users = await user.find({ addedby: currentUserId }).exec();
      if (users.length > 0) {
          for (const user of users) {
              allUsers.push(user);
              await findUsersAddedBy(user.userid);
          }
      }
  }

  await findUsersAddedBy(userId);
  return allUsers;
}

let Edituser =async (req , res)=>{
  try{let User=req.Tokendata
  let data = req.body;
  
  let id = data._id;
  let users = await user.findById(id);
  if(users)
  {
    if(users.purchase.plimitaf!==data.purchase.plimitaf|| users.purchase.plimitas !==data.purchase.plimitas || users.purchase.plimitbf !== data.purchase.plimitbf|| users.purchase.plimitbs !==data.purchase.plimitbs ||users.purchase.plimitcf !==data.purchase.plimitcf|| users.purchase.plimitcs !==data.purchase.plimitcs|| users.purchase.plimitdf !==data.purchase.plimitdf|| users.purchase.plimitds !==data.purchase.plimitds){
      let allusers=await getAllUsersAddedBy(id)
   
      let users1 = await user.findByIdAndUpdate(id,data);
      for (let i=0;i<allusers.length;i++){
        let temp=await user.findByIdAndUpdate(allusers[i]._doc._id,{...allusers[i]._doc,purchase:data.purchase});

      }
      res.status(200).json({status:true,data:users1})
    }else{
      let users = await user.findByIdAndUpdate(id,data);
      res.status(200).json({status:true,data:users})
    }
   
  }else
  {
    res.status(404).json({status:false,"Message":"Error" })
  }
}
  catch(e){
    res.status(403).json({"Message":"Internal server error",err:e})

  }
}

// Get User by User ID Function
const getLimitByUserId = async (req, res) => {
  try {
    let userId = req.params.userId;
    let user = await Limit.find({ userid: userId });

    if (user) {
      res.status(200).json({ status: true, data: user });
    } else {
      res.status(200).json({ status: true, data:[] });
    }
  } catch (e) {
    res.status(500).json({ status: false, message: "Internal server error", error: e });
  }
};


// Add User Function
const addLimit = async (req, res) => {
  try {
    let data = req.body;
    let newLimit = new Limit(data);
    let savedLimit = await newLimit.save();
    res.status(201).json({ status: true, data: savedLimit });
  } catch (e) {
    res.status(500).json({ status: false, message: "Internal server error", error: e });
  }
};

// Edit User Function
const editLimit = async (req, res) => {
  try {
    let userTokenData = req.Tokendata; // Assuming userTokenData has some useful context
    let data = req.body;

    let id = data._id;
    if(id!==""){
    
    let existingLimit = await Limit.findById(id);
    if (existingLimit) {
      // Check if any of the limit fields differ
      const hasChanged = (
        existingLimit.drawid !== data.limit.drawid ||
        existingLimit.hindsaa !== data.limit.hindsaa ||
        existingLimit.hindsab !== data.limit.hindsab ||
        existingLimit.akraa !== data.limit.akraa ||
        existingLimit.akrab !== data.limit.akrab ||
        existingLimit.tendolaa !== data.limit.tendolaa ||
        existingLimit.tendolab !== data.limit.tendolab ||
        existingLimit.panogadaa !== data.limit.panogadaa ||
        existingLimit.panogadab !== data.limit.panogadab
      );

      if (hasChanged) {
        
        let tempdata={
          userid: data.userid,
          drawid: data.drawid,
            hindsaa: data.limit.hindsaa,
            hindsab: data.limit.hindsab,
            akraa:data.limit.akraa,
            akrab: data.limit.akrab,
            tendolaa: data.limit.tendolaa,
            tendolab: data.limit.tendolab,
            panogadaa: data.limit.panogadaa,
            panogadab: data.limit.panogadab
        }

        // Update the current limit
        let updatedLimit = await Limit.findByIdAndUpdate(id, tempdata, { new: true });
        res.status(200).json({ status: true, data: updatedLimit });
      } else {
        let tempdata={
          userid: data.userid,
          drawid: data.drawid,
            hindsaa: data.limit.hindsaa,
            hindsab: data.limit.hindsab,
            akraa:data.limit.akraa,
            akrab: data.limit.akrab,
            tendolaa: data.limit.tendolaa,
            tendolab: data.limit.tendolab,
            panogadaa: data.limit.panogadaa,
            panogadab: data.limit.panogadab
        }

        // No changes detected in limits, update directly
        let updatedLimit = await Limit.findByIdAndUpdate(id, tempdata, { new: true });
        res.status(200).json({ status: true, data: updatedLimit });
      }
    }
  } else {
      let data = req.body;
      let tempdata={
        userid: data.userid,
        drawid: data.drawid,
          hindsaa: data.limit.hindsaa,
          hindsab: data.limit.hindsab,
          akraa:data.limit.akraa,
          akrab: data.limit.akrab,
          tendolaa: data.limit.tendolaa,
          tendolab: data.limit.tendolab,
          panogadaa: data.limit.panogadaa,
          panogadab: data.limit.panogadab
      }
    let newLimit = new Limit(tempdata);
    let savedLimit = await newLimit.save();
    res.status(201).json({ status: true, data: savedLimit });
    }
  } catch (e) {
    res.status(500).json({ message: "Internal server error", error: e });
  }
};

let Editadmin =async (req , res)=>{
  try{let User=req.Tokendata
  if(req.Tokendata.role==="superadmin"){
    let data = req.body;
    let id = data._id;
    let users = await user.findById(id);
    if(users)
    {
        let users1 = await user.findByIdAndUpdate(id,data);
        res.status(200).json({status:true,data:users1})
    }else
    {
      res.status(404).json({status:false,"Message":"Error" })
    }
  }
}
  catch(e){
    res.status(403).json({"Message":"Internal server error",err:e})

  }
}
let addadmin =async(req,res)=>{
  try{let {username,name,password,address,contact,role,blocked } = req.body;
  let key="123"
  let User = await user.findOne({role});
  if(User){
    res.status(500).json({status:false,"Message":"A same user exists with this username enter another username"})
  }else{
    let addedbyuserid = "superadmin"
    let data={key,username,name,password,address,contact,role,blocked,addedbyuserid}
    user.create(data).then(data=>{
      res.status(200).json({status:true,data})
  }).catch(err=>{
      res.status(500).json({status:false,"Message":"there was Some Error"})
  })
  }}catch(e){
    res.status(500).json({status:false,"Message":"Internal server error"})
  }
}
let Createuser =async (req , res)=>{
  try{let {username,name,password,address,contact,role,blocked,comission, pcpercentage} = req.body;
  let key="123"
let User = await user.findOne({username});
if(User){
  res.status(500).json({status:false,"Message":"A same user exists with this username enter another username"})
}
else{
  let addedbyuserid = req.Tokendata._id
  let temppay={cash:0,credit:0,balanceupline:0,availablebalance:0}
  let tempcommission={comission:comission , pcpercentage:pcpercentage}
  let templimit={
    hindsaa:0,
    hindsab:0,
    akraa:0,
    akrab:0,
    tendolaa:0,
    tendolab:0,
    panogadaa:0,
    panogadab:0,
}
let tempprize={
    prizea:7,
    prizeb:70,
    prizec:700,
    prized:5000,
}
let temppurchase={
    plimitaf:0,
    plimitas:0,
    plimitbf:0,
    plimitbs:0,
    plimitcf:0,
    plimitcs:0,
    plimitdf:0,
    plimitds:0,
}
let tempuser=await user.findById(addedbyuserid)
if(role==="merchant"){
  let temparr=[...tempuser.addedby  ]
  
  temparr.push(addedbyuserid)
  let data = {username,key,haddaloud:false,distributorhaddaloud:false,name,password,address,contact,payment:temppay,comission:tempcommission,limit:templimit,prize:tempprize,purchase:tempuser.purchase ,role,blocked,addedby:temparr};
  user.create(data).then(data=>{
      res.status(200).json({status:true,data})
  }).catch(err=>{
      res.status(500).json({status:false,"Message":"there was Some Error"})
  })
}else{
  let temparr=[...tempuser.addedby  ]
  
  temparr.push(addedbyuserid)
  let data = {username,key,name,haddaloud:false,distributorhaddaloud:false,password,address,contact,payment:temppay,comission:tempcommission,limit:templimit,prize:tempprize,purchase:temppurchase ,role,blocked,addedby:temparr};
  user.create(data).then(data=>{
      res.status(200).json({status:true,data})
  }).catch(err=>{
      res.status(500).json({status:false,"Message":"there was Some Error"})
  })
  }
}}catch(e){
  res.status(500).json({status:false,"Message":"Internal server error"})
}
}

let updateuserById = async(req ,res)=>{
  try{let User=req.Tokendata
    let id = User.id;
    let data = req.body;
    let users = await user.findByIdAndUpdate(id , data);
    if(users)
    {
       res.status(200).json({status:true,data:users})
    }else
    {
      res.status(404).json({status:false,"Message":"Error"})
    }
  }
    catch(e){
      res.status(403).json({"Message":"Internal server error",err:e})
  
    }
}
let changekey =async(req,res)=>{
  try{let User=req.Tokendata
  let id = User._id;

  let users = await user.findById(id);
  if(users)
  {
    let data = users;
    if(data.key===req.body.oldkey&&req.body.newkey===req.body.confirmnewkey){
      data.key=req.body.newkey
      let usersnew = await user.findByIdAndUpdate(id,data);
       res.status(200).json({status:true,data:usersnew})
    }else{
      res.status(404).json({status:false,"Message":"Ensure the old key is correct and new key and confirmed new key are same"})
    }
  }else
  {
    res.status(404).json({status:false,"Message":"Error"})
  }
}
  catch(e){
    res.status(403).json({"Message":"Internal server error",err:e})

  }
}

let DeleteUserById =  async(req ,res)=>{
    try{let id = req.params.id;
    let users = await user.findByIdAndDelete(id);
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error"})
    }
  }
    catch(e){
      res.status(403).json({"Message":"Internal server error",err:e})
  
    }
}
let getAlldetailsbyId = async (req, res) => {
  let id = req.params.id;
  try {
    let users = await user.findOne({ _id: id });
    if (users) {
      let referralusers = await user.find({ addedby: id });
      res.status(200).json({ users, referralusers });
    } else {
      res.status(404).json({ "Message": "User not found" });
    }
  } catch (error) {
    res.status(500).json({ "Message": "There was an error", "Error": error.message });
  }
};

let changepassword=async(req,res)=>{
  try{let id=req.Tokendata._id
  let data = req.body;
  let users = await user.findById(id);
  if(users&&users._doc.password===data.oldpassword)
  {
      let users1 = await user.findByIdAndUpdate(id,{...users._doc,password:data.password});
      res.status(200).json({status:true,data:users1})
   
  }else
  {
    res.status(404).json({status:false,"Message":"Error" })
  }
}
  catch(e){
    res.status(403).json({"Message":"Internal server error",err:e})

  }
}

let Login = async(req , res)=>{
    let {username , password,captchaValue} = req.body;

  // Verify if the captchaValue (token) exists
  if (!captchaValue) {
    return res.status(400).json({ success: false, message: 'Please complete the reCAPTCHA.' });
  }
    try{
      const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaValue}`;
      const response = await fetch(verificationURL, { method: 'POST' });
      const captchaResult = await response.json();
      if (captchaResult.success) {
        let User = await user.findOne({username});
        if(User)
        {
          if(!User.blocked){
            if(User.password == password)
            {
                let {password , ...rest} = User
                let _id = User._id;
                let role = User.role;
                let name = User.name;
                let username = User.username;
                let userid=User.userid;
                if(role==="merchant"){
                  let distributorids = User.addedby
                  let allusers = []
                  for (let i=0;i<distributorids.length;i++){
                    let temp = await  user.find({_id:distributorids[i],role:"distributor"})
                    if(temp.length>0){
                      allusers.push(temp[0])
                    }
                  }
                 
                  let token = await jwt.sign({_id ,name, role,username,userid,distributorid:allusers[0]._id} ,
                    process.env.SECRET_KEY ,
                     {expiresIn :'30d'})
               res.json({rest , "Success":true , token})
                }
                else{
                  let token = await jwt.sign({_id ,name, role,username,userid} ,
                     process.env.SECRET_KEY ,
                      {expiresIn :'30d'})
                res.json({rest , "Success":true , token})
              }
            }else
            {
                res.status(200).json({ "Success":false , "Message":"Invalid password"})

            }
          }
          else{
            res.status(200).json({ "Success":false , "Message":"Your account has been blocked"})

          }
            
        }else
        {
            res.status(200).json({ "Success":false , "Message":"Username not Found"})

        }
      }
        else {
          return res.status(400).json({ success: false, message: 'CAPTCHA validation failed. Please try again.' });
        }
    }catch(err)
    {
        res.status(200).json({"Success":false , "Message":"User not Found" , err})
        
    }
    
}

let Loginasanother = async(req , res)=>{
  let {idtologin,id } = req.body;
  let key1=req.body.key
  try{
    let User1 = await user.findOne({_id:id});
    if(User1){
      let {key,role}=User1;
      if(role!=="merchant"&&key1===key){
        let User = await user.findOne({_id:idtologin});
        if(User)
        {
                let {password , ...rest} = User
                let _id = User._id;
                let role = User.role;
                let name = User.name;
                let username = User.username;
                let userid=User.userid;
                if(role==="merchant"){
                  let distributorids = User.addedby

                  let allusers = await  user.find({_id:distributorids,role:"distributor"})
                  let token = await jwt.sign({_id ,name, role,username,userid,distributorid:allusers[0]._id} ,
                    process.env.SECRET_KEY ,
                     {expiresIn :'30d'})
               res.json({rest , "Success":true , token})
                }else{
                  let token = await jwt.sign({_id ,name, role,username,userid} ,
                    process.env.SECRET_KEY ,
                     {expiresIn :'30d'})
               res.json({rest , "Success":true , token})
                }
                
        }else
        {
            res.json({ "Success":false , "Message":"User not Found"})
  
        }
      }else{
        res.json({ "Success":false , "Message":"User not Found"})
      }
      
    }else{
      res.json({ "Success":false , "Message":"User not Found"})
    }
  
  }catch(err)
  {
      res.json({"Success":false , "Message":"User not Found" , err})
      
  }
  
}


module.exports  ={
    GetUserById,
    getAllUsers,
    getAllDistributors,
    getAllMyDistributors,
    getAllSubDistributors,
    getAllMySubDistributors,
    getAllMerchants,
    getAllMyMerchants,
    updateuserById,
    DeleteUserById,
    Createuser,
    Login,
    Edituser,
    getAlldetailsbyId,
    Loginasanother,
    getBalance,
    changekey,
    changepassword,
    Editadmin,
    getadmindetail,
    addadmin,
    getAllMyusers,
    addLimit,
    editLimit,
    getLimitByUserId
}