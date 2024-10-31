const express = require('express');
const router = express.Router();
const authMiddleware=require('../middlewaree/authMiddleware');
const { registerUser, confirmEmail,login,logout,refresh, getTournaments, getTournament } = require('../controllers/authController');
router.post('/registration', registerUser);
router.post('/login',login);
router.post('/logout',logout);
router.get('/refresh',refresh);
router.get('/confirm', confirmEmail);
router.get('/tournaments',authMiddleware,getTournaments);
router.get('/tournament',authMiddleware,getTournament)
module.exports = router;