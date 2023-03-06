const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
          user:{
                    type:mongoose.Schema.Types.ObjectId,
                    required:true
          },
          title:{
                    type:String,
          },
          images:{
                    type:Array, 
          },
          videos:{
                    type: Array,
          },
          like:{
                    type:Array,
          },
          dislike:{
                    type:Array,
          },
          comments:[
                    {
                              user:{
                                        type:mongoose.Schema.ObjectId,
                              },
                              username:{
                                        type:String,
                              },
                              usercmt:{
                                        type:Object
                              },
                              comment:{
                                        type:String,
                              }
                    }
          ]
},
{
    timestamps:true
}
)

module.exports = mongoose.model("Post" , PostSchema);