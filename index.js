const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
require('dotenv').config();
const index = express()

index.use(express.json());
index.use(cors())

mongoose.connect(process.env.MONGODB)
    .then(() => console.log('Mongodb Connected successfully!'))
    .catch((err) => console.log('Error found on mongodb connection: ', err))

const nutsuserschma = new mongoose.Schema({

    username: String,
    email: String,
    password: String,
});
const nutsuser = mongoose.model('nutsUser', nutsuserschma);


const postSchema = new mongoose.Schema({
    content: { type: String, required: true },
    email: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);



index.listen(3003, () => {
    console.log('Server is running on port3003');
});

//user register APIEND point register
index.post('/register', async (req,res)=>{
    try{
        const {username,email,password}=req.body
        if(username&&email&&password){
            const oneuser = await nutsuser.findOne({email : email})
            if(oneuser){
                return res.send({success : false , message: "A user with this email already exists. Please use a different email to register." })
            }
            const newuser = new nutsuser({username : username,email : email,password : password})
            const saveuser = await newuser.save()
            if(saveuser){
                return res.send({success : true,message:"User registered successfully."})
            }
            else{
                return res.send({success : false,message: "Registration failed. Please try again later." })
            }
        }
        else{
            return res.send({success : false,message:"All fields are required. Please provide complete user information."})
        }
    }
    catch(err){
        console.log("Error during user registration:",err)
        return res.send({success : false,message:"An error occurred during registration. Please contact the developer."})
    }
})



// user login APIEND point using signin
index.post('/Login', async (req,res)=>{
    try{
        const {email,password}=req.body
        console.log(email,password)
        if(email&&password){
            const checking = await nutsuser.findOne({email : email})
            if(checking){
                if(checking.password===password){
                    console.log(checking)
                    const token = jwt.sign(checking.email,process.env.SECRITY_KEY)
                    return res.send({success : true,message:"Login successful.",restoken : token})
                }
                else{
                    return res.send({success : false,message: "Incorrect password. Please try again."})
                }
            }
            else{
                return res.send({success : false,message:"Email not found. Please register first."})
            }
        }
        else{
            return res.send({success : false,message:"Email and password are required."})
        }
    }
    catch(err){
        console.log("Error during login:",err)
        return res.send({success : false,message:"An error occurred during login. Please contact the developer."})
    }
})



/// user login APIEND point using Update
index.put('/Upadte', async (req,res)=>{
    try{
        const { username,email,password }=req.body
        if(username&&email&&password){
            const isoneuser = await nutsuser.findOne({email : email})
            if(isoneuser){
                const isupuser = await nutsuser.updateOne({email : email},{$set: {username : username,password : password
            }})
                if(isupuser){
                    return res.send({response:"ok",message:"User details updated successfully."})
                }
                else{
                    return res.send({response:"not",message:"Failed to update user. Please try again."})
                }
            }
            else{
                return res.send({response:"not",message:"User not found. Please check the user ID."})
            }
        }
        else{
            return res.send({response:"not",message:"All fields are required. Please provide complete information."})
        }
    }
    catch(err){
        console.log("Error updating user:",err)
        return res.send({response:"not",message:"An error occurred while updating the user. Please contact the developer."})
    }
})


// Post a message 
index.post('/postMessage', async (req, res) => {
    try {
        const { content, email } = req.body;
        if (content && email) {
            const newPost = new Post({ content, email });
            const savedPost = await newPost.save();
            return res.send({ success: true, message: "Message posted successfully.", post: savedPost });
        } else {
            return res.send({ success: false, message: "Content and email are required." });
        }
    } catch (err) {
        console.log("Error posting message:", err);
        return res.send({ success: false, message: "An error occurred while posting the message. Please contact the developer." });
    }
});

// Get all messages sorted by timestamp
index.get('/getMessages', async (req, res) => {
    try {
        const messages = await Post.find({}).sort({ timestamp: -1 });
        return res.send({ success: true, messages });
    } catch (err) {
        console.log("Error retrieving messages:", err);
        return res.send({ success: false, message: "An error occurred while retrieving messages. Please contact the developer." });
    }
});






















