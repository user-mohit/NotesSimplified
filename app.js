require('dotenv').config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cookieParser = require('cookie-parser')
const dialog = require("dialog");
require('./db/mongo')
const User = require('./db/user');
const Register = require('./db/register');
const auth = require("./middleware/auth");
const app = express();
const port = 8000;
//EXPRESS SPECIFIC STUFF
app.use('/static', express.static('static'))//for serving static files
app.use(cookieParser());
app.use(express.urlencoded());


//PUG SPECIFIC STUFF
app.set('view engine', 'pug')//set the template engine as pug
app.set('views',path.join(__dirname, 'views'))//set the views directory


//ENDPOINTS

app.get('/',(req, res)=>{
    const params = {};
    res.status(200).render('index.pug',  params);
})
app.get('/notes', auth, (req, res)=>{
    const params = {};
    res.status(200).render('notes.pug',  params);
})
app.get('/addnotes', auth, (req, res)=>{
    const params = {};
    res.status(200).render('addnotes.pug',  params);
})
app.get('/login',(req, res)=>{
    const params = {};
    res.status(200).render('login.pug',  params);
})
app.get('/logout',auth,async (req, res)=>{
   try {
        res.clearCookie("jwt");

        // console.log("Logout successfully")
        // await req.user.save();
        console.log("Logout successfully")
        res.status(200).render('login.pug');
        dialog.info("Logout successfully!!")
   } catch (error) {
        res.status(500).send(error);
   }
})
app.get('/register',(req, res)=>{
    const params = {};
    res.status(200).render('register.pug',  params);
})

app.post('/',(req, res) =>{
    var myData = new User(req.body);
    myData.save().then(() =>{
    //   res.send("This item has been saved to the database")
    // res.send(`<script> alert("Sent") </script>`)
    res.status(200).render('index.pug');
    dialog.info("Message sent !!");
    
  }) .catch(()=>{
    //   res.status(400).send("Item was not saved to the database .")
    //   res.send(`<script> window.alert("Unable to sent") </script>`)
    dialog.info("Unable to sent !!");
  })
  })
app.post('/register',async (req, res) =>{
    var registerData = new Register(req.body);

    const token = await registerData.generateAuthToken();

    //Saving the tokens in cookies..
    res.cookie("jwt",token, {
        expires:new Date(Date.now() + 600000),
        httpOnly: true
    });


    registerData.save().then(() =>{
        res.status(200).render('login.pug',dialog.info("Registered Successfully !!"));
  }) .catch(()=>{
    //   res.status(400).send("Item was not saved to the database .")
    dialog.info("Unable to register!!!")
  })
  })

  app.post('/login',async (req, res)=>{
    try {
            const email = req.body.email;
            const password = req.body.password;

            const useremail = await  Register.findOne({email:email});
            const isMatch = await bcrypt.compare(password, useremail.password);
            const token = await useremail.generateAuthToken();

            res.cookie("jwt",token, {
                expires:new Date(Date.now() + 600000),
                httpOnly: true,
            });

          
            
            if(isMatch){
                res.status(200).render('notes.pug');
                dialog.info("Successfully log in !!")
            }else{
               
               dialog.info("Invalid password !!")
            }

    } catch (error) {
        // res.status(400).send("Invalid login details");
        dialog.info("Invalid details !!")
    }
})

//START THE SERVER 

app.listen(port, ()=>{
    console.log(`The application started successfully on port ${port}`);
})