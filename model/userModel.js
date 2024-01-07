const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    location: {
        address: { type: String },
    },
    displayName: {
        type: String,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'non-binary', 'other'],
    },
    birthday: {
        year: {
            type: Number,
        },
        month: {
            type: String,
            enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        },
        day: {
            type: Number,
        }
    },
    profilePicture: {
        type: String,
    },
    Bio: {
        type: String,
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Film'
    }],
    watchlist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Watchlist',
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
}, { strict: false });

// Hashing password before saving the data in the database
UserSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);
        if (this.isModified('password')) {
            const hashedPwd = await bcrypt.hash(this.password, salt);
            this.password = hashedPwd;
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Comparing password if it's entered or valid
UserSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw error;
    }
};

UserSchema.virtual('age').get(function () {
    if (this.birthday && this.birthday.year) {
        const currentYear = new Date().getFullYear();
        return currentYear - this.birthday.year;
    }
    return null;
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
