const dialog = require('dialog');
const jwt = require('jsonwebtoken');
const Register = require("../db/register");

const auth = async (req, res, next) =>{
    try {

        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

        const user = await Register.findOne({_id:verifyUser._id});


        next();
        
    } catch (error) {
        // console.log("Please login")
        res.status(200).render('login.pug');
        dialog.info("Please login")
    }

}

module.exports = auth;