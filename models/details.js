const mongoose=require("mongoose");
const detailSchema=new mongoose.Schema({
    address:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true
    },
    age:{
        type:Number,
    },
})
module.exports=mongoose.model("details",detailSchema);