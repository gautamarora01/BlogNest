const express=require("express");
const {Router}=require("express");
const multer=require("multer");
const {storage}=require("../services/cloudinary");
const path=require("path");

const Blog=require("../models/blog");
const Comment=require("../models/comment");

const router=Router();

router.use(express.static(path.resolve("./public")));

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, path.resolve(`./public/uploads`));
//     },
//     filename: function (req, file, cb) {
//       const fileName = `${Date.now()}-${req.user._id}-${file.originalname}`
//       cb(null,fileName); 
//     },
// })

const fileFilterMiddleware = (req, file, cb) => {
    const fileSize = parseInt(req.headers["content-length"])

    if ((file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/webp") && fileSize <= 1282810) {
        cb(null, true)
    } 
    else {
        cb(null, false)
    }
}

const upload = multer({ 
    storage: storage,
    fileFilter:fileFilterMiddleware,
});

router.get("/write",(req,res)=>{
    return res.render("writeBlog",{
        user: req.user,
    });
});

router.get("/:id",async (req,res)=>{
    const blog=await Blog.findById(req.params.id).populate("createdBy");
    
    const comments = await Comment.find({blogId:req.params.id}).populate("createdBy")
    
    return res.render("blog",{
        user:req.user,
        blog,
        comments,
    });
});

router.post("/", upload.single("coverImage"), async (req, res) => {
    try {
        const { title, body } = req.body;
        let coverImage = req.file ? req.file.path : "uploads/defaultCoverImage.png";

        if (!title || !body) {
            return res.render("writeBlog", {
                error: "Title and Body are necessary",
            });
        }

        const blog = await Blog.create({
            body,
            title,
            createdBy: req.user._id,
            coverImageURL: coverImage,
        });

        return res.redirect(`/blog/${blog._id}`);
    } catch (err) {
        console.error("Error creating blog:", err);

        return res.status(500).render("writeBlog", {
            error: "Something went wrong while uploading your blog. Please try again.",
        });
    }
});


router.post("/comment/:blogId",async (req,res)=>{
    
    const { content } = req.body;
    
    if (!content || content.trim() === "") {
        return res.redirect(`/blog/${req.params.blogId}`); // No change if content is empty
    }
    
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    });

    return res.redirect(`/blog/${req.params.blogId}`);
});

router.get("/delete/:blogId", async(req,res)=>{

    await Blog.deleteOne({_id:req.params.blogId});
    await Comment.deleteMany({blogId:req.params.blogId});

    return res.redirect("/");
});


module.exports=router;