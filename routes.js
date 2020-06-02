const router = require('express').Router();
require('dotenv').config();
const authy = require('authy')(process.env.AUTHY_API_KEY);

const User = require('./model');

router.post( '/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const exists = await User.findOne({ email });
        if (exists) {
            return res.json({ message: "Email exists"});
        }
        const newUser = new User({
            email,
            password
        });
        await newUser.save();
        res.status(200).json({ message: "User account registered"})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        const isMatch = await user.comparePassword(password);
        if (!user || !isMatch) {
            return res.json({ message: "Email or password incorrect"});
        }
        if (user.authyId) {
            authy.request_sms(
                user.authyId, {force: true},  
                function (err, smsRes) {
                    if (err) {
                        res.json({ message: 'An error occurred while sending OTP to user'});
                    } 
            });
            return res.status(200).json({ message: 'OTP sent to user' });
        }
        res.status(200).json({ message: "Logged in successfully"})
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.post('/enable/2fa', async (req, res) => {
    try {
        const { email, countryCode, phone } = req.body;
        const user = await User.findOne({ email });
        if (!user) {   
            return res.json({ message:'User account does not exist' });
        }
        authy.register_user(email, phone, countryCode, (err, regRes) =>{
            if (err) {
                return res.json({ message:'An error occurred while registering user' });
            }
            user.authyId = regRes.user.id
            user.save((err, user) => {
                if (err) {
                    return res.json({ message:'An error occurred while saving authyId into db' });
                }
            })
        });
        res.status(200).json({ message: '2FA enabled' }) 
    } catch (error) {
        res.status(500).json({ message: error.message })   
    }
});

router.post('/verify/:token', async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email });
        
        authy.verify(
            user.authyId,
            req.params.token,
            function(err, tokenRes){
                if (err) {
                    return res.json({ message:'OTP verification failed' });
                }
                res.status(200).json({ message: 'Token is valid'});
            });
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
});

module.exports = router