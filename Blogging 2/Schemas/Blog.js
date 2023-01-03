const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  bodyText: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  creationDatetime: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Blogs", blogSchema);
