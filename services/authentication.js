const JWT=require("jsonwebtoken");

const secret="abcd@1234$";

function createToken(user){
    const payload={
        _id:user._id,
        email:user.email,
        fullName:user.fullName,
        role:user.role,
    };

    const token=JWT.sign(payload,secret);
    return token;
}

function validateToken(token){
    const payload=JWT.verify(token,secret);
    return payload;
}

//here we are having less coupling (i.e. inter module dependence)
//NOTE: cohesion is intra module dependence
module.exports={
    createToken,
    validateToken,
}
