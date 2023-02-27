const router = require("express").Router();
const User = require('../models/UserModel');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Post = require('../models/PostsMoldel')
const { verifyToken } = require("./verifyToken");

//Create
router.post('/create', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body
        if (!email || !password || !name) {
            return res.status(200).json({
                err: 1,
                message: 'Không được thiếu'
            })
        }
        const user = await User.findOne({
            email: email
        });
        if (user) {
            return res.status(200).json({
                err: 1,
                msg: 'Email đã được sử dụng'
            })
        };
        const hash = bcrypt.hashSync(password, 10);
        const createdUser = await User.create({
            name: name,
            email: email,
            password: hash,
            phone: phone
        });
        const accessToken = jwt.sign({
            id: createdUser._id,
            user: createdUser.name
        }, process.env.ACCESS_TOKEN);

        return res.status(200).json({
            err: 0,
            msg: 'Đăng ký thành công!',
            user: {
                createdUser,
                accessToken
            }
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
        const comparePassword = bcrypt.compareSync(password, user.password);
        if (!comparePassword) {
            res.status(200).json({
                err: 1,
                message: 'Sai mật khẩu'
            })
        };
        const accessToken = jwt.sign({
            id: user._id,
            user: user.name
        }, process.env.ACCESS_TOKEN);

        return res.status(200).json({
            err: 0,
            msg: 'Đăng nhập thành công!',
            user: {
                user,
                accessToken
            }
        });

    } catch (error) {
        return res.status(400).json({
            msg: e
        })
    }
})

//pendingFriends
router.put("/pending-friends/:id" , verifyToken , async(req , res)=>{
    if(req.params.id !== req.body.user){
        const user = await User.findById(req.params.id);
        const otheruser = await User.findById(req.body.user);

        if(!user.Followers.includes(req.body.user)){
            await user.updateOne({$push:{Followers:req.body.user}});
            await otheruser.updateOne({$push:{Following:req.params.id}});
            return res.status(200).json("User has followed");
        }else{
            await user.updateOne({$pull:{Followers:req.body.user}});
            await otheruser.updateOne({$pull:{Following:req.params.id}});
            return res.status(200).json("User has Unfollowed");
        }
    }else{
        return res.status(400).json("You can't follow yourself")
    }
})

//Fetch post from following
// router.get("/flw/:id" , verifyToken , async(req , res)=>{
//     try {
//         const user = await User.findById(req.params.id);
//         const followersPost = await Promise.all(
//             user.Following.map((item)=>{
//                 return Post.find({user:item})
//             })
//         )
//         const userPost = await Post.find({user:user._id});

//         res.status(200).json(userPost.concat(...followersPost));
//     } catch (error) {
//         return res.status(500).json("Internal server error")
//     }
// })

//Update User Profile
router.put("/update/:id" , verifyToken , async(req , res)=>{
    try {
        if(req.params.id === req.user.id){
            if(req.body.password){
                const salt = await bcrypt.genSalt(10);
                const secpass = await bcrypt.hash(req.body.password , salt);
                req.body.password = secpass;
                const updateuser = await User.findByIdAndUpdate(req.params.id , {
                    $set:req.body
                });
                await updateuser.save();
                res.status(200).json(updateuser);
            }
        }else{
            return res.status(400).json("Your are not allow to update this user details ")
        }
    } catch (error) {
        return res.status(500).json("Internal server error")
    }
})

//Delete User account 
router.delete("/delete/:id" , verifyToken , async(req , res)=>{
    try {
        if(req.params.id !== req.user.id){
            return res.status(400).json("Account doesn't match")
        }else{
            const user = await User.findByIdAndDelete(req.params.id);
            return res.status(200).json("User account has been deleted")
        }
    } catch (error) {
        return res.status(500).json("Internal server error")
    }
})

//get user details for post
router.get("/post/user/details/:id" , async(req , res)=>{
    try {
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(400).json("User not found")
        }
        const {email , password , phonenumber , ...others}=user._doc;
        res.status(200).json(others);
    } catch (error) {
        return res.status(500).json("Internal server error")
    }
})

//get user to follow
router.get("/all/user/:id" , async(req , res)=>{
    try {
        const allUser = await User.find();
        const user = await User.findById(req.params.id);
        const followinguser = await Promise.all(
            user.Following.map((item)=>{
                return item;
            })
        )
        let UserToFollow = allUser.filter((val)=>{
            return !followinguser.find((item)=>{
                return val._id.toString()===item;
            })
        })

        let filteruser = await Promise.all(
            UserToFollow.map((item)=>{
                const {email , phonenumber , Followers , Following , password , ...others} = item._doc;
                return others
            })
        )

        res.status(200).json(filteruser)
    } catch (error) {
        
    }
})

module.exports = router