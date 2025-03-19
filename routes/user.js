const {Router}=require("express");
const User=require("../models/user");

const router=Router();

router.get("/signin",(req,res)=>{
    return res.render("signin");
});

router.get("/signup",(req,res)=>{
    return res.render("signup");
});

router.post("/signin", async(req,res)=>{
    const {email,password}=req.body;

    try {
        const token=await User.matchPasswordAndCreateToken(email,password);
        return res.cookie("token",token).redirect("/");

    } catch (error) {

        return res.render("signin",{
            error:"Incorrect Email or Password",
        });
    }
});

router.post("/signup",async (req,res)=>{
    const {fullName,email,password}=req.body;

    if(!fullName||!email||!password){
        return res.render("signup",{
            error:"All fields are necessary",
        });
    }

    // Capitalize each word in fullName
    const capitalizedFullName = fullName
        .trim()
        .split(" ") // Split into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
        .join(" "); // Join back into a string

    // Strong password regex pattern
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

    // Check if password is strong
    if (!passwordRegex.test(password)) {
        return res.render("signup", { 
            warning: "Password must be at least 6 characters long, and contain atleast one uppercase, one lowercase, one number, and one special character." 
        });
    }

    const existing=await User.findOne({email});
    if(existing){
        return res.render("signup", { error: "Email already registered, Try signin instead" });
    }

    await User.create({
        fullName: capitalizedFullName,
        email,
        password,
    });

    return res.render("signin",{
        success:"Account created successfuly, Signin to continue ",
    });
});

router.get("/signout",(req,res)=>{
    return res.clearCookie("token").redirect("/");
})

router.get("/profile-image",(req,res)=>{
    return res.render("profileImage",{
        user:req.user,
    });
});

module.exports=router;