const {createHmac,randomBytes}=require("crypto");
const {Schema,model}=require("mongoose");

const {createToken}=require("../services/authentication");

const userSchema= new Schema({
    fullName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    salt:{
        type:String,
    },
    password:{
        type:String,
        required:true,
    },
    profileImageURL:{
        type:String,
        default:"/images/default.png",
    },
    role:{
        type: String,
        enum: ["USER","ADMIN"],
        default:"USER",
    }
},
{timestamps:true}
);

//adding middleware using "pre save" for hashing our password
userSchema.pre("save",function(next){
    const user=this;
    if(!user.isModified("password")) return;
    
    const salt=randomBytes(16).toString();
    const hashedPassword=createHmac("sha256",salt).update(user.password).digest("hex");

    this.salt=salt;
    this.password=hashedPassword;

    next();
})

//adding a virtual function for checking password
userSchema.static("matchPasswordAndCreateToken",async function(email,password){
    const user= await this.findOne({email});
    if(!user) throw new Error("User not found!");

    const salt=user.salt;
    const hashedPassword=user.password;
    
    const userProvidedHashedPassword=createHmac("sha256",salt).update(password).digest("hex");
    
    if(hashedPassword!==userProvidedHashedPassword) throw new Error("Incorrect Password!");
    
    const token=createToken(user);
    return token;
});

const User=model("user",userSchema);

module.exports=User;