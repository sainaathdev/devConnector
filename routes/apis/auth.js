const express  = require("express");
const auth = require("../../middleware/auth");
const User = require("../../models/User.model");
const jwt = require('jsonwebtoken')
const config =  require('config')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator');
const router = express.Router()

//@user  GET api/auth
//@desc  test route
//@access public

router.get('/', auth, async (req,res) => {
    try {
        const user = await User.findById(req.user.id).select("-password")
        res.json(user)
    } catch (error) {
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})

//@user  POST api/users 
//@desc  authenticate user & get token
//@access public

router.post('/', [
    check('email', 'Enter Valid Email').isEmail(),
    check('password', 'Password is required').exists()

], async (req,res) => {

    //console.log(req.body)

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password} = req.body

    try {
        //see user exists-------------------------------------------------------------------
        let user = await User.findOne({email})
        if(!user){
           return res.status(400).json({errors: [{msg: "Invalid Credentials"}] })
        }
        
        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.status(400).json({errors: [{msg: "Invalid Credentials"}] })
        }

        //return jsonwebtoken-----------------

        const payload = {
            user: {
                id: user.id
            }
        }
    
        jwt.sign(
            payload, 
            config.get('jwtScrect'),
            {expiresIn: 360000},
            (err, token)=> {
                if(err) throw err;
                res.json({token})
            }
        )
       // res.send("User Registered")

    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error")
    }
    

    
})



module.exports = router;