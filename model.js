const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    authyId: {
        type: String,
        default: null
    }
});

// hash password before save
userSchema.pre('save', async function(next) {
    try {
        if (!this.isModified('password')) next();
        // generate salt
        const salt = await bcrypt.genSalt(10);
        // hash the password
        const hashedPassword = await bcrypt.hash(this.password, salt);
        // replace plain text password with hashed password
        this.password = hashedPassword;
        next();
    } catch (error) {
        return next(error);
    }
});

userSchema.methods.comparePassword = function(plainPwd) {
return bcrypt.compareSync(plainPwd, this.password);
};

module.exports = mongoose.model('User', userSchema);