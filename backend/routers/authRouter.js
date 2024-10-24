const express = require('express');
const router = express.Router();
const authMiddleware=require('../middlewaree/authMiddleware');
const { registerUser, confirmEmail,login,getUsers,logout,refresh } = require('../controllers/authController');
router.post('/registration', registerUser);
router.post('/login',login);
router.post('/logout',logout);
router.get('/refresh',refresh);
router.get('/confirm', confirmEmail);

router.get('/users',authMiddleware,getUsers);
module.exports = router;