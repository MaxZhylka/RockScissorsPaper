const ApiError = require("../exceptions/api-error");
const mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
const { TokenExpiredError } = jwt;
module.exports=function(err,req,res,next)
{
    console.log(err);
    if(err instanceof ApiError)
        {
            return res.status(err .status).json({message:err .message, errors: err.errors});
        }

        if(err instanceof mongoose.Error.ValidationError)
            {
                return res.status(400).json({message:'Bad Request',
                    errors: err.errors
                })
            }
            if (err.code && err.code === 11000) {
                const duplicatedField = Object.keys(err.keyPattern)[0];
                const duplicatedValue = err.keyValue[duplicatedField];
                return res.status(400).json({
                    message: 'Ошибка дублирования',
                    errors: [{
                        field: duplicatedField,
                        message: `Значение '${duplicatedValue}' уже используется`
                    }]
                });
            }
            if (err instanceof TokenExpiredError || err.name === 'TokenExpiredError') 
                {
                    return res.status(401).json({message:'Unauthorized'});
                }
        
    return res.status(500).json({message:'Internal Server Error'})
}