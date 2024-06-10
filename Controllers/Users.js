
const user = require("../models/Users.schema")
const jwt = require("jsonwebtoken")
let getAllUsers = async(req , res)=>{
  if(req.Tokendata.role==="superadmin"){
    let users = await user.find({ role: { $ne: 'superadmin' } });
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
  }else{
    res.status(403).json({"Message":"You dont have access"})
  }
 
}

let getAllDistributors = async(req , res)=>{
  if(req.Tokendata.role==="superadmin"){
    let users = await user.find({ role:  'distributor'  });
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
  }else{
    res.status(403).json({"Message":"You dont have access"})
  }
 
}
let getAllSubDistributors = async(req , res)=>{
  if(req.Tokendata.role==="superadmin"){
    let users = await user.find({ role:  'subdistributor'  });
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
  }else{
    res.status(403).json({"Message":"You dont have access"})
  }
 
}
let getAllMyDistributors = async(req , res)=>{
  if(req.Tokendata.role==="superadmin"){
    let addedbyuserid=req.Tokendata.userid
    let users = await user.find({ role:  'distributor' ,addedby:addedbyuserid });
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
  }else{
    res.status(403).json({"Message":"You dont have access"})
  }
}
let getAllMySubDistributors = async(req , res)=>{
    let addedbyuserid=req.Tokendata.userid
    let users = await user.find({ role:  'subdistributor' ,addedby:addedbyuserid });
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
 
}
let getAllMerchants= async(req , res)=>{
  if(req.Tokendata.role==="superadmin"){
    let addedbyuserid=req.Tokendata.userid
    let users = await user.find({ role:  'merchant' });
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
  }else{
    res.status(403).json({"Message":"You dont have access"})
  }
 
}
let getAllMyMerchants= async(req , res)=>{
    let addedbyuserid=req.Tokendata.userid
    let users = await user.find({ role:  'merchant',addedby:addedbyuserid});
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
 
}

let GetUserById = async(req ,res)=>{
    let id = req.params.id;
    let users = await user.findOne({_id:id});
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
}
////added by to be fixed
let Createuser =async (req , res)=>{
  let {username,name,password,address,contact,role,blocked } = req.body;
let User = await user.findOne({username});
if(User){
  res.status(500).json({"Message":"A same user exists with this rollnumber enter another rollnumber"})
}
else{
  let addedbyuserid = req.Tokendata.userid
  let data = {username,name,password,address,contact ,role,blocked,addedby:Number(addedbyuserid)};
  user.create(data).then(data=>{
      res.status(201).json(data)
  }).catch(err=>{
      res.status(500).json({"Message":"there was Some Error"})
  })
}
}

let updateuserById = async(req ,res)=>{
  let User=req.Tokendata
    let id = User.id;
    let data = req.body;
    let users = await user.findByIdAndUpdate(id , data);
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
}

let followuserById = async(req ,res)=>{
  const id=req.Tokendata.id;
  const settobefollowed = await user.findById(id);
    const data= req.body;
    try {
      const tobefollowed  = data.tobefollowed;
      if (!settobefollowed) {
        return res.status(404).json({ error: 'Account not found' });
      }
  
      // Append the new comment to the Comments array
      settobefollowed.Following.push({Username:data.Username,UserId:data.tobefollowed});
  
      // Save the updated blog document
      await settobefollowed.save();
  
      res.json(settobefollowed);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
}

let unfollowuserById = async(req ,res)=>{
    const data= req.body;
    const id=req.Tokendata.id;
  const settobeunfollowed = await user.findById(id);
    try {
      const UserId  = data.UserId; // Comments array with the new comment
  
      if (!settobeunfollowed) {
        return res.status(404).json({ error: 'Account not found' });
      }
      let temparr=settobeunfollowed.Following;
      
    let index=null;
    for(let i=0;i<temparr.length;i++){
      if(temparr[i].UserId===data.tobeunfollowed){
        index=i;
      }
    }
        settobeunfollowed.Following.splice(index,1);

  
      // Save the updated blog document
      await settobeunfollowed.save();
  
      res.json(settobeunfollowed);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
}
let disableuser = async(req ,res)=>{
  if(req.Tokendata.role!=="Admin"){
    res.status(403).json({"Message":"You dont have access"})
  }
  else{
    let data = req.body;
    let id = data.UserId;
    let users = await user.findOne({_id:id});
    if(users)
    {
        users.blocked=true;
        users.reason=data.reason;
        let usersupdated = await user.findByIdAndUpdate(id , users);
        if(usersupdated)
        {
           res.status(200).json(usersupdated)
        }else
        {
          res.status(404).json({"Message":"Error"})
        }
    }else
    {
      res.status(404).json({"Message":"Error"})
    } 
  }
   
}

let ableuser = async(req ,res)=>{
  if(req.Tokendata.role!=="Admin"){
    res.status(403).json({"Message":"You dont have access"})
  }
  else{
    let data = req.body;
    let id = data.UserId;
    let users = await user.findOne({_id:id});
    if(users)
    {
        users.blocked=false;
        users.reason="";
        let usersupdated = await user.findByIdAndUpdate(id , users);
        if(usersupdated)
        {
           res.status(200).json(usersupdated)
        }else
        {
          res.status(404).json({"Message":"Error"})
        }
    }else
    {
      res.status(404).json({"Message":"Error"})
    } 
  }

    
}

let DeleteUserById =  async(req ,res)=>{
    let id = req.params.id;
    let users = await user.findByIdAndDelete(id);
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
}
let Addowner =  async(req ,res)=>{
  let data = req.body;
    user.create(data).then(data=>{
        res.status(201).json(data)
    }).catch(err=>{
        res.status(500).json({"Message":"there was Some Error"})
    })
}
let Login = async(req , res)=>{
    let {username , password} = req.body;
    try{
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
                let token = await jwt.sign({_id ,name, role,username,userid} ,
                     process.env.SECRET_KEY ,
                      {expiresIn :'30d'})
                res.json({rest , "Success":true , token})
            }else
            {
                res.json({ "Success":false , "Message":"Invalid password"})

            }
          }
          else{
            res.json({ "Success":false , "Message":"Your account has been blocked"})

          }
            
        }else
        {
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
    disableuser,
    ableuser,
    followuserById,
    unfollowuserById,
    Login,
    Addowner
}