require("dotenv").config();
const express=require("express");
const path=require("path");
const mongoose=require("mongoose");
const cookieParser=require("cookie-parser");
const {checkForAuthenticationCookie}=require("./middlewares/authentication")

const Blog=require("./models/blog");

const userRouter=require("./routes/user");
const blogRouter=require("./routes/blog");

const app=express();
const PORT=process.env.PORT || 8000;

mongoose.connect(process.env.MONGO_URL)
.then((e)=> console.log("MongoDB connected"));

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));


app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public"))); //allows us to statically serve public folder

app.get("/",async (req,res)=>{
    const allBlogs=await Blog.find({}).sort({createdAt:-1});
    res.render("home",{
        user:req.user,
        blogs:allBlogs,
    });
});


app.use("/user",userRouter);
app.use("/blog",blogRouter);

app.listen(PORT,()=>{
    console.log(`server started at port ${PORT}`);
});
