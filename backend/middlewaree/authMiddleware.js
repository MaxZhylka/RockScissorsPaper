
const jwt=require('jsonwebtoken');
require('dotenv').config();
const secret=process.env.SECRET_ACCESS;
module.exports=function (req,res,next)
    {
        if(req.method==='OPTIONS')
            {
                next();
            }
        try
        {
            const token= req.headers.authorization.split(' ')[1];
            if(!token)
            {
                console.error('JWT verification error:', e);
                res.status(401).json({message:'Unauthorized'});
            }
            const verify=jwt.verify(token,secret);
            
            req.user=verify;
            next();
        }
        catch(e)
        {
            next(e);
        }
    }