const express  = require("express");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile.model");
const User = require("../../models/User.model");
const { check, validationResult } = require('express-validator');
const router = express.Router()

//@user  GET api/profile/me 
//@desc  get current user profile
//@access private

router.get('/me', auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate("user",['name', 'avatar']);

        if(!profile){
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server Error")
    }
})

//@user  POST api/profile 
//@desc  create & update user profile
//@access private

router.post('/', [auth,[
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').notEmpty(),
    async(req,res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        //destructuring the req

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin

        } = req.body

        //build profile objects

        const profileFields = {};
        profileFields.user = req.user.id;
        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(bio) profileFields.bio = bio;
        if(status) profileFields.status = status;
        if(githubusername) profileFields.githubusername = githubusername;
        if(skills){
            profileFields.skills = skills.split(',').map(skill => skill.trim())
        }
        //console.log(profileFields.skills)

        //build social object 

        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube;
        if (facebook) profileFields.social.facebook = facebook;
        if (twitter) profileFields.social.twitter = twitter;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        //res.send('hello')

        try {
            let profile = await Profile.findOne({user: req.user.id})

            if(profile){
                //update profile
                profile = await Profile.findOneAndUpdate({user: req.user.id},
                    {$set: profileFields}, 
                    {new: true}
                )
                return res.json(profile)
                
            }

            //create 
            profile = new Profile(profileFields);

            await profile.save();
            res.json(profile)


        } catch (err) {
            console.error(err.message)
            return res.status(500).send("Server Error")
        }
    }
]])

//@user  GET api/profile 
//@desc  get all profiles
//@access public 

router.get('/', async (req,res) => {

    try {
        const profiles = await Profile.find().populate('user',['name', 'avatar'])
        res.json(profiles)

    } catch (error) {
        console.error(err.message)
        return res.status(500).send("Server Error")
    }

})


//@user  GET api/profile/user/:user_id
//@desc  get profile by user ID
//@access public 

router.get('/user/:user_id', async (req,res) => {

    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user',['name', 'avatar'])

        if(!profile){
            return res.status(400).json({msg: "Profile Not Found"})
        }

        res.json(profile)
        
    } catch (err) {
        console.error(err.message)
        if(err.kind === "ObjectId"){
            return res.status(400).json({msg: "Profile Not Found"})
        }
        return res.status(500).send("Server Error")
    }

});


//@user  DELETE api/profile 
//@desc  delete profile, user & posts
//@access Private 

router.delete('/', auth, async (req,res) => {

    try {

        //Remove Profile
        await Profile.findOneAndDelete({user: req.user.id})

        //Remove User
        await User.findOneAndDelete({_id: req.user.id})

        res.json({msg: "User Deleted"})

    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server Error")
    }

})


//@user  Experience api/profile 
//@desc  add profile experience
//@access Private 

router.put('/experience', [ auth, [
    check('title', 'Title is Required').not().isEmpty(),
    check('company', 'Company is Required').not().isEmpty(),
    check('from', 'From Date is Required').not().isEmpty()
]],  async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body

    const newExp = {
        title,                           //title: title
        company,
        location,
        from,
        to,
        current,
        description                        
    }

    try {
        const profile = await Profile.findOne({user: req.user.id})

        profile.experience.unshift(newExp)

        await profile.save()

        res.json(profile)

    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server Error")
    }
})


//@user  Delete api/profile/experience/:exp_id
//@desc  delete profile experience
//@access Private

router.delete('/experience/:exp_id', auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id})

        //get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)

        profile.experience.splice(removeIndex, 1);

        await profile.save()

        res.json(profile)



    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server Error")
    }
})




//@user Education api/profile 
//@desc  add profile education
//@access Private 

router.put('/education', [ auth, [
    check('school', 'School is Required').not().isEmpty(),
    check('degree', 'Degree is Required').not().isEmpty(),
    check('fieldofstudy', 'fieldofstudy is Required').not().isEmpty(),
    check('from', 'From Date is Required').not().isEmpty()
]],  async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description                        
    }

    try {
        const profile = await Profile.findOne({user: req.user.id})

        profile.education.unshift(newEdu)

        await profile.save()

        res.json(profile)

    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server Error")
    }
})


//@user  Delete api/profile/education/:edu_id
//@desc  delete profile education
//@access Private

router.delete('/education/:edu_id', auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id})

        //get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)

        profile.education.splice(removeIndex, 1);

        await profile.save()

        res.json(profile)



    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server Error")
    }
})







module.exports = router;