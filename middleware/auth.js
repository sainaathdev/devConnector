const jwt = require('jsonwebtoken')
const config =  require('config')

module.exports = function(req, res, next){
    //get token from header

    const token = req.header('x-auth-token')

    //check if not token
    if(!token){
        res.status(401).json({msg: "No Token, Authentication denied"})
    }

    //verify token-----------------

    try {
        const decoded = jwt.verify(token, config.get("jwtScrect"))

        req.user = decoded.user;
        next();
    } catch (err) {
        return res.status(401).json({msg: 'Invalid Token'})
    }
}