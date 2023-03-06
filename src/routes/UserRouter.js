const router = require("express").Router();
const User = require('../models/UserModel');

const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Friends = require('../models/FriendsMoldel')
const { verifyToken } = require("./verifyToken");

//Create
router.post('/create', async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!email || !password || !name) {
            return res.status(200).json({
                err: 1,
                message: 'Không được thiếu'
            })
        };

        const user = await User.findOne({
            email: email
        });
        if (user) {
            return res.status(200).json({
                err: 1,
                message: 'Email đã được sử dụng'
            })
        };
        const hash = bcrypt.hashSync(password, 10);
        const createdUser = await User.create({
            name: name,
            email: email,
            password: hash,
            avatar: 'https://res.cloudinary.com/dbkgkyh4h/image/upload/v1674980785/aztdhoncs6wzqlbb7tqz.jpg',
            imageBg: 'https://res.cloudinary.com/dbkgkyh4h/image/upload/v1674980641/vii8rn8memosqggzhn6v.jpg',
            phone: '0123456789',
            title: 'yêu Dũng',
        });
        await Friends.create({
            user: createdUser._id
        })

        return res.status(200).json({
            err: 0,
            message: 'Đăng ký thành công!',
            createdUser
            // createdUser
            // user: {
            //     createdUser,
            //     accessToken
            // }
        })

    } catch (e) {
        return res.status(400).json({
            msg: e
        })
    }
})

//Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(200).json({
                err: 1,
                msg: 'Điền đủ thông tin'
            })
        };
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(200).json({
                err: 1,
                msg: 'Email chưa được đăng ký'
            })
        };
        // const comparePassword = bcrypt.compareSync(password, user.password);
        // if (!comparePassword) {
        //     res.status(200).json({
        //         err: 1,
        //         message: 'Sai mật khẩu'
        //     })
        // };
        const accessToken = jwt.sign({
            id: user._id,
            user: user.name
        }, process.env.ACCESS_TOKEN);
       
        return res.status(200).json({
            err: 0,
            msg: 'Đăng nhập thành công!',
            token: accessToken,
            id: user._id
            // user,
            // accessToken
        });

    } catch (error) {
        return res.status(400).json({
            msg: error
        })
    }
})

//Get all user
router.get("/get-all", verifyToken, async (req, res) => {
    try {
        const allUser = await User.find();

        res.status(200).json(allUser);
    } catch (error) {
        return res.status(500).json("Internal server error")
    }
})


//Get profile
router.get("/profile/:id", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(400).json("User not found");
        }
        const profile = {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            imageBg: user.imageBg,
            address: user.address,
            phone: user.phone,
            listImage: user.listImg,
            title: user.title
        }
        
        res.status(200).json(profile);
    } catch (error) {
        return res.status(500).json("Internal server error")
    }
})

//Get Friends 
router.get("/get-friends", verifyToken, async (req, res) => {
    try {
        const friends = await Friends.find({user:req.user.id});
        if (!friends) {
            return res.status(400).json("Sống lỗi nên chưa có bạn !");
        }
        res.status(200).json(friends);
    } catch (error) {
        return res.status(500).json("Internal server error")
    }
})


//Update User Profile
router.put("/update/:id", verifyToken, async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                const secpass = await bcrypt.hash(req.body.password, salt);
                req.body.password = secpass;
                const updateuser = await User.findByIdAndUpdate(req.params.id, {
                    $set: req.body
                });
                await updateuser.save();
                res.status(200).json(updateuser);
            }
        } else {
            return res.status(400).json("Your are not allow to update this user details ")
        }
    } catch (error) {
        return res.status(500).json("Internal server error")
    }
})

//Delete User account 
router.delete("/delete/:id", verifyToken, async (req, res) => {
    try {
        if (req.params.id !== req.user.id) {
            return res.status(400).json("Account doesn't match")
        } else {
            const user = await User.findByIdAndDelete(req.params.id);
            return res.status(200).json("User account has been deleted")
        }
    } catch (error) {
        return res.status(500).json("Internal server error")
    }
})

//get user details for post

router.get("/post/user/details/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(400).json("User not found")
        }
        const { email, password, phonenumber, ...others } = user._doc;
        res.status(200).json(others);
    } catch (error) {
        return res.status(500).json("Internal server error")
    }
})
//pendingFriends
// router.put("/pending-friends/", verifyToken, async (req, res) => {
//     if (req.params.id !== req.body.user) {
//         const user = await User.findById(req.params.id);
//         const otheruser = await User.findById(req.body.user);

//         if (!user.Followers.includes(req.body.user)) {
//             await user.updateOne({ $push: { Followers: req.body.user } });
//             await otheruser.updateOne({ $push: { Following: req.params.id } });
//             return res.status(200).json("User has followed");
//         } else {
//             await user.updateOne({ $pull: { Followers: req.body.user } });
//             await otheruser.updateOne({ $pull: { Following: req.params.id } });

//             return res.status(200).json("User has Unfollowed");
//         }
//     } else {
//         return res.status(400).json("You can't follow yourself")
//     }
// })

//request friend
router.put("/request-friend", verifyToken, async (req, res) => {
    try {
        const fromUserId = req.user.id
        const toUserId = req.body.toUser.id;

        const fromUserInfor = req.body.fromUser;
        const toUserInfor = req.body.toUser;


        const fromUser = await Friends.find({user:fromUserId});
        const toUser = await User.find({user:toUserId});

    
        await fromUser.updateOne({ $push: { requestFriends: toUserInfor} });
        await toUser.updateOne({ $push: { pendingFriends: fromUserInfor } });


        return res.status(200).json({
            msg: 'Đã gửi lời mời kết bạn'
        })


    } catch (error) {
        console.log(error);
    }
})

//add friend
router.put('/add-friend',verifyToken, async (req, res) => {
    try {
        const fromUserId = req.user.id
        const toUserId = req.body.toUser.id;

        const fromUserInfor = req.body.fromUser;
        const toUserInfor = req.body.toUser;

        const fromUser = await Friends.find({user:fromUserId});
        const toUser = await Friends.find({user:toUserId});

        await toUser.updateOne({ $push: { friends: fromUserInfor } });
        await fromUser.updateOne({ $push: { friends: toUserInfor} });

        const indexFrom = fromUser.pendingFriends.findIndex(item => item.id === toUserId)
        fromUser.pendingFriends.splice(indexFrom, 1);

        const indexTo = fromUser.requestFriends.findIndex(item => item.id === fromUserId)
        toUser.requestFriends.splice(indexTo, 1);

        await fromUser.save();
        await toUser.save();

        return res.status(200).json({
            err: 0,
            msg: 'đã add',
        })

    } catch (error) {
        console.log(error);
    }
})

//Cancel request add friend 

router.put('/delete-friend/:userId1/:userId2', async (req, res) => {
    try {
        const fromUserId = req.user.id
        const toUserId = req.body.toUser.id;

        const toUserInfor = req.body.toUser;


        const fromUser = await Friends.find({user:fromUserId});
        const toUser = await User.find({user:toUserId});

        const indexFrom = fromUser.pendingFriends.findIndex(item => item.id === toUserId)
        fromUser.pendingFriends.splice(indexFrom, 1);

        const indexTo = fromUser.requestFriends.findIndex(item => item.id === fromUserId)
        toUser.requestFriends.splice(indexTo, 1);


        await fromUser.save();
        await toUser.save();

        return res.status(200).json({
            err: 0,
            msg: `đã hủy yêu cầu kết bạn của ${toUserInfor.name}`,
        })

    } catch (error) {
        console.log(error);
    }
})

module.exports = router