const router = require("express").Router();
const Messenger = require('../models/MessengeChatAllMoldel');
const { verifyToken } = require("./verifyToken");


router.post('/all/create', async(req, res) => {
    try {
        const all = await Messenger.create({
            allmessnger: ['helll', 'hj']
        })
        res.status(200).json(all)
    } catch (error) {
        console.log(error);
    }
})


//send message

router.post('/create', verifyToken, async (req, res) => {
    try {
        const id = '64046a1b53e7fb3ed8209911'
        const allMessenger = await Messenger.findById(id);

        const { text, user } = req.body;

        const messenger = {
           text, user
        }
        allMessenger.allmessnger.push(messenger);

        await allMessenger.save();
      
        return res.status(200).json(allMessenger);

    } catch (error) {
        console.log(error);
    }
})

//Get message

router.get('/get-message',verifyToken , async (req, res) => {
    try {

        const from = req.user.id;
        const id = '64046a1b53e7fb3ed8209911'
        const allMessenger = await Messenger.findById(id);

        const projectedMessages = allMessenger.allmessnger.map((msg) => {
            return {
                fromSelf: msg?.user?.id.toString() === from,
                messenger: msg.text,
                user: msg.user
            };
        });
        res.json(projectedMessages);

    } catch (error) {
        console.log(error);
    }
})


module.exports = router
