const router = require("express").Router();
const Messenger = require('../models/MesserngerMoldel');
const { verifyToken } = require("./verifyToken");


//send message

router.post('/create', async (req, res) => {
    try {
        const { from, to, message } = req.body;
        const data = await Messenger.create({
            message: { text: message },
            users: [from, to],
            sender: from,
        }); 
        if (data) return res.json({ msg: "Message added successfully." });

    } catch (error) {
        console.log(error);
    }
})

//Get message


router.post('/get-message', verifyToken , async (req, res) => {
    try {

        const from = req.user.id
        const { to } = req.body;

        const messages = await Messenger.find({
            users: {
                $all: [from, to],
            },
        }).sort({ updatedAt: 1 });

        const projectedMessages = messages.map((msg) => {
            return {
                fromSelf: msg.sender.toString() === from,
                message: msg.message.text,
            };
        });
        res.json(projectedMessages);

    } catch (error) {
        console.log(error);
    }
})



module.exports = router
