const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String
        },
        email: {
            type: String
        },
        password: {
            type: String
        },
        phone: {
            type: Number
        },
        pendingFriends: {
            type: Array,
        },
        friends: {
            type: Array,
        },
        profile: {
            type: String,
        },
        verifed: {
            type: Boolean,
            required: true,
            default: false
        }

    }
);
const User = mongoose.model("User", UserSchema);
module.exports = User;