const express  = require("express")
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config =  require('config')
const { check, validationResult } = require('express-validator');
const User = require('../../models/User.model')


//@user  POST api/users 
//@desc  user registration
//@access public

router.post('/', [
    check('name', 'Name is Required').not().isEmpty(),
    check('email', 'Enter Valid Email').isEmail(),
    check('password', 'Enter password more than 6 numbers or more').isLength({min: 6})

], async (req,res) => {

    //console.log(req.body)

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const {name, email, password} = req.body

    try {
        //see user exists-------------------------------------------------------------------
        let user = await User.findOne({email})
        if(user){
           return res.status(400).json({errors: [{msg: "User already Exists"}] })
        }
        //get users gravatar ---------------------------------------------

        let avatar = gravatar.url(email, {
            s: "200",
            r: "pg",
            d: "mm"
        })

        user = new User({
            name,
            email,
            avatar,
            password
        })

        //bcrypt password -----------------------------------------------------------------------------------

        const salt = await bcrypt.genSalt(10)

        user.password = await bcrypt.hash(password, salt)

        await user.save();

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