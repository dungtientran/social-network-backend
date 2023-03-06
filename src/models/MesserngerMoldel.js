const mongoose = require('mongoose');

const MessengerSchema = new mongoose.Schema(
    {
        message: {
          text: { type: String, required: true },
        },
        users: Array,
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
      {
        timestamps: true,
      }
    );

const Messenger = mongoose.model("Messenger", MessengerSchema);
module.exports = Messenger;