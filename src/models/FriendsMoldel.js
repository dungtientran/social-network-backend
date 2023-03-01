const mongoose = require('mongoose');

const FriendsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        pendingFriends: {
            type: Array,
        },
        requestFriends: {
            type: Array,
        },
        friends: {
            type: Array
        }
    }
);
const User = mongoose.model("Friends", FriendsSchema);
module.exports = User;