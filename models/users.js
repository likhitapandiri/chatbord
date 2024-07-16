const mongoose=require("mongoose");
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },  
    id:{
        type:Number,
        required:true
    }
});
module.exports= mongoose.model("users",userSchema);