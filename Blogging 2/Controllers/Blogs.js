const express = require("express");
const BlogsRouter = express.Router();
const Blogs = require("../Models/Blogs");
const User = require("../Models/User");
const ObjectId = require("mongodb").ObjectId;

BlogsRouter.post("/create-blog", async (req, res) => {
  const userId = req.session.user.userId;
  let title = req.body.title;
  let bodyText = req.body.bodyText;
  const creationDatetime = new Date();

  if (!userId) {
    return res.send({
      status: 401,
      message: "Invalid userId",
    });
  }

  if (
    !title ||
    !bodyText ||
    typeof title != "string" ||
    typeof bodyText != "string"
  ) {
    return res.send({
      status: 401,
      message: "Invalid data",
    });
  }

  if (title.length > 50) {
    return res.send({
      status: 401,
      message: "Title too long",
    });
  }

  if (bodyText.length > 1000) {
    return res.send({
      status: 401,
      message: "Blog too long",
    });
  }

  try {
    await User.verifyUserId({ userId });
  } catch (err) {
    return res.send({
      status: 402,
      message: "Error Occured",
      error: err,
    });
  }

  const blog = new Blogs({ title, bodyText, userId, creationDatetime });

  try {
    const dbBlog = await blog.createBlog();
    return res.send({
      status: 200,
      message: "Blog Created Successfully",
      data: dbBlog,
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Error Occured",
      error: err,
    });
  }
});

BlogsRouter.get("/get-blogs", async (req, res) => {
  const offset = req.query.offset || 0;
  const userId = req.session.user.userId;

  //   if (!validateMongoUserIds([userId])) {
  //     return res.send({
  //       status: 400,
  //       message: "Invalid User",
  //       error: "Invalid Mongo UserId",
  //     });
  //   }

  try {
    // const followingUserList = await followingUsers({
    //   followerUserId: ObjectId(userId),
    // });

    // let userIds = [];
    // followingUserList.forEach((user) => {
    //   userIds.push(ObjectId(user._id));
    // });

    const dbBlogs = await Blogs.getBlogs({ offset, userId });

    // let blogAndUserDetails = [];

    // dbBlogs.forEach((blog) => {
    //   // 20 times
    //   followingUserList.forEach((user) => {
    //     if (user._id.toString() === blog.userId.toString()) {
    //       // Mongo Ids cannot be comapred with equals
    //       let blogAndUserDetail = {
    //         ...blog,
    //         userDetails: user,
    //       };
    //       blogAndUserDetails.push(blogAndUserDetail);
    //     }
    //   });
    // });

    return res.send({
      status: 200,
      message: "Successful",
      data: dbBlogs,
    });
  } catch (err) {
    return res.send({
      status: 401,
      message: "Error Occured",
      error: err,
    });
  }
});

BlogsRouter.get("/my-blogs", async (req, res) => {
  const userId = req.session.user.userId;
  const offset = req.query.offset || 0;

  console.log(userId, offset);

  try {
    const dbBlogs = await Blogs.myBlogs({ userId, offset });

    return res.send({
      status: 200,
      message: "Successful",
      data: dbBlogs,
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Internal error occured",
      error: err,
    });
  }
});

BlogsRouter.post("/edit-blog", async (req, res) => {
  const { title, bodyText } = req.body.data;
  const blogId = req.body.blogId;
  const userId = req.body.userId; // req.session.user.userId

  if (!title && !bodyText) {
    return res.send({
      status: 400,
      message: "Insufficient data",
      error: "Missing title and bodyText",
    });
  }

  try {
    // User is allowed to edit this blog - If he has created the blog

    const blog = new Blogs({ blogId, title, bodyText });
    const dbBlogData = await blog.getDataOfBlogFromBlogId();

    console.log(dbBlogData);

    if (dbBlogData.userId != userId) {
      return res.send({
        status: 404,
        message: "Not allowed to edit",
        error: "Blog belong to some other user",
      });
    }

    // Check the creationDatetime is within 30 mins
    const currentDateTime = Date.now();
    const creationDatetime = new Date(dbBlogData.creationDatetime);
    const diff = (currentDateTime - creationDatetime.getTime()) / (60 * 1000);

    console.log(diff);

    if (diff > 30) {
      return res.send({
        status: "401",
        message: "Edit unsuccessful",
        error: "Cannot edit blogs after 30 minutes of creation",
      });
    }

    // Update the blog in db

    const oldDbBlog = await blog.updateBlog();

    return res.send({
      status: 200,
      message: "Edit Successful",
      data: oldDbBlog,
    });
  } catch (err) {
    res.send({
      status: "400",
      message: "Failed to edit the blog",
      error: err,
    });
  }
});

BlogsRouter.post("/delete-blog", async (req, res) => {
  const blogId = req.body.blogId;
  const userId = req.body.userId; // req.session.user.userId

  try {
    const blog = new Blogs({ blogId });
    const dbBlogData = await blog.getDataOfBlogFromBlogId();

    // Check if blog belongs to the user
    if (userId != dbBlogData.userId) {
      return res.send({
        status: "401",
        message: "Delete Unsuccessful",
        error: "Blog belongs to some other user",
      });
    }

    // Deleting the blog
    const blogData = await blog.deleteBlog();

    return res.send({
      status: 200,
      message: "Delete Successful",
      data: blogData,
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Delete Unsuccessful",
      error: err,
    });
  }
});

module.exports = BlogsRouter;
