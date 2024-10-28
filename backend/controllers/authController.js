const User = require("../models/user-model");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const sendConfirmationEmail = require('../service/emailService');
require('dotenv').config();
const userDTO = require('../dtos/user-dto');
const TokenService = require('../service/TokenService');
const ApiError=require('../exceptions/api-error');

const registerUser = async (req, res, next) => {
    try {
        const { login, password, email } = req.body;

        const confirmationToken = uuidv4();

        const newUser = new User({
            login,
            password,
            email,
            confirmationToken,
            expires: Date.now() + 30 * 60 * 1000 
        });

        let deviceId = req.cookies['deviceId'];
        if (!deviceId) {
            deviceId = crypto.randomBytes(32).toString('hex');
            res.cookie('deviceId', deviceId, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 ,
                secure: true,});
        }

        await newUser.save();

        const userDto = new userDTO(newUser);
        const token = TokenService.generateTokens({ ...userDto });

        const saveTokenPromise = TokenService.saveToken(userDto.id, deviceId, token.refreshToken);

        setImmediate(() => {
            sendConfirmationEmail(newUser, confirmationToken).catch((err) => {
                console.error('Error sending email:', err);
            });
        });

        await saveTokenPromise;

        res.cookie('refreshToken', token.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true,
            secure: true, });

        res.status(200).json({ token: token.accessToken, user: userDto });
    } catch (e) {
        next(e);
    }
};


const confirmEmail = async (req, res, next) => {
    try {
        const token = req.query.token;
        const confirmUser = await User.findOne({ confirmationToken: token });

        if (!confirmUser) {
            return res.status(404).send("User not found or token is invalid.");
        }

        confirmUser.isConfirmed = true;
        confirmUser.expires = undefined;
        await confirmUser.save();

        res.status(200).send("User Confirmed!");
    } catch (e) {
        console.error("Error confirming user:", e);
        next(e);
    }
}

const login = async (req, res, next) => {

    try {
        const { email, password } = req.body;
        const user = await User.findOne( {email: email} );
        if (!user) {

            throw ApiError.BadRequest(`Пользователь ${email} не найден`);
        }
        const validPassword =await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw ApiError.BadRequest(`Неправильный пароль`);
        }

        let deviceId = req.cookies['deviceId'];

        if (!deviceId) {

            deviceId = crypto.randomBytes(32).toString('hex');
            res.cookie('deviceId',deviceId, {httpOnly:true, maxAge: 30 * 24 * 60 * 60 * 1000 ,secure: true});

        }
        const userDto = new userDTO(user);
        const token = TokenService.generateTokens({ ...userDto });
        await TokenService.saveToken(userDto.id, deviceId, token.refreshToken);
        res.cookie('refreshToken', token.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true,
            secure: true, });
        res.status(200).json({ token: token.accessToken, user:userDto});
    }
    catch (e) {
        console.log(e);
        next(e);
    }
}
const getUsers = async (req, res, next) => {
    try {
        const Users = await User.find();
        res.status(200).json(Users);
    }
    catch (e) {
        next(e);
    }
}
const logout = async(req,res, next)=>
    {
        try{
            const {refreshToken, deviceId}=req.cookies;
            if(!refreshToken||!deviceId)
                {
                    throw ApiError.UnauthorizedError();
                }
            await TokenService.removeToken(deviceId,refreshToken);
            res.clearCookie('refreshToken');
            res.clearCookie('deviceId');
            res.status(200).json({message:'success logout!'});
        }
        catch(e)
        {
            next(e);
        }
    }
    const refresh=async(req,res, next)=>
        {
            let {refreshToken,deviceId}=req.cookies;
            const findedToken= await TokenService.findToken(refreshToken);
            const validToken= TokenService.validateRefreshToken(refreshToken);
            console.log(findedToken);
            console.log(validToken);
            if(!findedToken||!validToken)
                {
                    return res.status(401).json({message:'Unauthorized'});
                }
                const user= await User.findById(validToken.id);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                deviceId= crypto.randomBytes(32).toString('hex');
                const userDto= new userDTO(user);
                const token= TokenService.generateTokens({...userDto});
                await TokenService.saveToken(user._id,deviceId,token.refreshToken);
                
                res.cookie('deviceId', deviceId, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true,secure: true });
                res.cookie('refreshToken', token.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true,secure: true,});
                res.status(200).json({message: "TokenRefreshed", accessToken: token.accessToken, user: userDto});
                
        }
module.exports = { registerUser, confirmEmail, login, getUsers,logout,refresh };