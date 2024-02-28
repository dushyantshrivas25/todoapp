const mongoose = require("mongoose")
const plm = require("passport-local-mongoose")
const userModel = new mongoose.Schema({
    username:{
        type:String,
        trim:true,
        unique:true,
        required:[true,"please provide a username"],
        minlength:[4,"username must have atleast 4 characters"]
    },
    password:{ 
        type: String,
     },
     todos: [{ type: mongoose.Schema.Types.ObjectId, ref: "todo" }],
    
email:{
    type:String,
    required:[true,"email address is required"],
    trim:true,
    lowercase:true,
    match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email address",
    ],
},
avatar:{
    type:String,
    default:"default.jpg",
}

})

userModel.plugin(plm);

const user = mongoose.model("user",userModel)
module.exports = user;