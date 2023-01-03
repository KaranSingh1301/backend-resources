const BlogsSchema = require("../Schemas/Blog");
const ObjectId = require("mongodb").ObjectId;
const constants = require("../constants");

const Blogs = class {
  title;
  bodyText;
  userId;
  creationDatetime;

  constructor({ blogId, title, bodyText, userId, creationDatetime }) {
    this.title = title;
    this.bodyText = bodyText;
    this.userId = userId;
    this.creationDatetime = creationDatetime;
    this.blogId = blogId;
  }

  createBlog() {
    return new Promise(async (resolve, reject) => {
      this.title.trim();
      this.bodyText.trim();

      const blog = new BlogsSchema({
        title: this.title,
        bodyText: this.bodyText,
        userId: this.userId,
        creationDatetime: this.creationDatetime,
      });

      try {
        const dbBlog = await blog.save();
        resolve(dbBlog);
      } catch (err) {
        reject(err);
      }
    });
  }

  static getBlogs({ offset, userIds }) {
    return new Promise(async (resolve, reject) => {
      try {
        // const dbBlogs = await BlogsSchema.find().sort({creationDatetime: -1});

        const dbBlogs = await BlogsSchema.aggregate([
          //   { $match: { userId: { $in: userIds }, deleted: { $ne: true } } },
          { $sort: { creationDatetime: -1 } },
          {
            $facet: {
              data: [
                { $skip: parseInt(offset) },
                { $limit: constants.BLOGSLIMIT },
              ],
            },
          },
        ]);

        resolve(dbBlogs[0].data);
      } catch (err) {
        reject(err);
      }
    });
  }

  static myBlogs({ userId, offset }) {
    return new Promise(async (resolve, reject) => {
      try {
        // const dbBlogs = await BlogsSchema.find().sort({creationDatetime: -1});

        const dbBlogs = await BlogsSchema.aggregate([
          { $match: { userId: ObjectId(userId) } },
          { $sort: { creationDatetime: -1 } },
          {
            $facet: {
              data: [
                { $skip: parseInt(offset) },
                { $limit: constants.BLOGSLIMIT },
              ],
            },
          },
        ]);
        resolve(dbBlogs);
      } catch (err) {
        reject(err);
      }
    });
  }

  //   getDataOfBlogFromBlogId() {
  //     return new Promise(async (resolve, reject) => {
  //       const blogUserId = await BlogsSchema.aggregate([
  //         { $match: { _id: ObjectId(this.blogId) } },
  //         { $project: { userId: 1, creationDatetime: 1 } },
  //       ]);
  //       resolve(blogUserId[0]);
  //     });
  //   }

  //   updateBlog() {
  //     return new Promise(async (resolve, reject) => {
  //       let newBlogData = {};
  //       if (this.title) {
  //         newBlogData.title = this.title;
  //       }

  //       if (this.bodyText) {
  //         newBlogData.bodyText = this.bodyText;
  //       }

  //       try {
  //         const oldDbdData = await BlogsSchema.findOneAndUpdate(
  //           { _id: ObjectId(this.blogId) },
  //           newBlogData
  //         );
  //         return resolve(oldDbdData);
  //       } catch (err) {
  //         return reject("Database error");
  //       }
  //     });
  //   }

  //   deleteBlog() {
  //     return new Promise(async (resolve, reject) => {
  //       // const blogData = await BlogsSchema.findOneAndDelete({_id: ObjectId(this.blogId)});

  //       const blogData = await BlogsSchema.findOneAndUpdate(
  //         { _id: ObjectId(this.blogId) },
  //         { deleted: true, deletionDatetime: new Date() }
  //       );
  //       resolve(blogData);
  //     });
  //   }
};

module.exports = Blogs;
