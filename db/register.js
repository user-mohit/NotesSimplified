const mongoose = require('mongoose')
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')

const registerSchema = new mongoose.Schema({
    username : {
        type: String,
        required: true,
        unique: true
    },
   phone : {
        type: String,
        required: true,
        unique: true
   },
   age : {
        type: Number,
        requierd: true,

   },
   email : {
        type: String,
        required: true,
        unique: true
   },
   password : {
        type: String,
        required: true
   },
   tokens:[{ 
          token:{
               type: String,
               required: true
          }
   }]

});
//Generating tokens
registerSchema.methods.generateAuthToken = async function() {
     try{
          const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
          this.tokens = this.tokens.concat({token:token})
          await this.save();
          return token;
     } catch (error) {
          console.log("The error part" +error)

     }
}

// Converting password in to hash 
registerSchema.pre("save",async function(next){

     if(this.isModified("password")){
     this.password = await bcrypt.hash(this.password,10);
}
next();

})


var register = mongoose.model('Register', registerSchema);

module.exports = register;