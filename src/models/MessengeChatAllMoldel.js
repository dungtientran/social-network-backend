const mongoose = require('mongoose');

const MessageChatAllSchema = new mongoose.Schema(
  {
    allmessnger: []
  }
);

const MessageChatAll = mongoose.model("MessageChatAll", MessageChatAllSchema);
module.exports = MessageChatAll;