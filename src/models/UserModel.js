const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name: { type: String },
        email: { type: String },
        password: {type: String},
        avatar: { type: String },
        imageBg: { type: String },
        phone: { type: String },
        address: { type: String },
        avatar: { type: String },
        title: { type: String },
        listImg: {
            avatars: { type: Array },
            imagesPosts: { type: Array },
            imagesBgs: { type: Array },
        }
    }
);
const User = mongoose.model("User", UserSchema);
module.exports = User;