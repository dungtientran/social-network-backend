const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const userRouter = require('./src/routes/UserRouter');
const postRouter = require('./src/routes/PostRouter');

mongoose.connect(`${process.env.MONGO_DB}`)
.then(() => {
    console.log('Connect Db success!')
})
.catch((err) => {
    console.log(err)
})

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use('/api/user', userRouter);
app.use('/api/post', postRouter);

const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log('Server is running in port: ', + port)
})
