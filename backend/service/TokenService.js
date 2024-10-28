const jwt = require('jsonwebtoken');
const Token = require('../models/token-model')
require('dotenv').config();
class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.SECRET_ACCESS, { expiresIn: '30m' });
        const refreshToken = jwt.sign(payload, process.env.SECRET_REFRESH, { expiresIn: '30d' });
        return {
            accessToken, refreshToken
        }
    }
    validateRefreshToken(refreshToken)
    {
        try{
            const userData= jwt.verify(refreshToken,process.env.SECRET_REFRESH);
            return userData;
        }
        catch(e)
        {
            return null;
        }
    }
    async findToken(refreshToken)
    {
        try{
        const token= await Token.findOne({refreshToken:refreshToken});
        return token;
        }
        catch(e){
            console.log(e);
            return null;
        }
    }
    async saveToken(userId,deviceId,refreshToken) {
        let tokenData = await Token.findOne({ user: userId, deviceId: deviceId });
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }

        tokenData = await Token.create({user: userId, deviceId:deviceId,refreshToken: refreshToken});
        return tokenData;
    }
    async removeToken(deviceId,refreshToken)
    {
    
        const tokenData= await Token.deleteOne(  {
            deviceId:deviceId,
            refreshToken: refreshToken
        });
        return tokenData;
    }
}

module.exports = new TokenService();