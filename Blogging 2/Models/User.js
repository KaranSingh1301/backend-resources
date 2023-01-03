const UserSchema = require("../Schemas/User");
const bcrypt = require("bcrypt");
const validator = require("validator");
const ObjectId = require("mongodb").ObjectId;

// Username, Email

let User = class {
  username;
  email;
  password;
  phoneNumber;
  name;
  profilePic;
  constructor({ username, email, password, phoneNumber, name, profilePic }) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.phoneNumber = phoneNumber;
    this.name = name;
    this.profilePic = profilePic;
  }

  static verifyUsernameAndEmailExists({ username, email }) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await UserSchema.findOne({
          $or: [{ username }, { email }],
        });

        if (user && user.email === email) {
          return reject("Email already exists");
        }

        if (user && user.username === username) {
          return reject("Username already taken");
        }

        return resolve();
      } catch (err) {
        return reject(err);
      }
    });
  }

  static verifyUserId({ userId }) {
    return new Promise(async (resolve, reject) => {
      try {
        // Not a valid mongodb id - reject rightaway
        if (!ObjectId.isValid(userId)) {
          reject("Not a valid userId");
        }

        // Valid ObjectId but not of a user in our db
        const dbUser = await UserSchema.findOne({ _id: ObjectId(userId) });
        if (!dbUser) {
          reject("No user found");
        }
        resolve(dbUser);
      } catch (err) {
        reject(err);
      }
    });
  }

  static loginUser({ loginId, password }) {
    return new Promise(async (resolve, reject) => {
      let dbUser = {};
      if (validator.isEmail(loginId)) {
        dbUser = await UserSchema.findOne({ email: loginId });
      } else {
        dbUser = await UserSchema.findOne({ username: loginId });
      }

      if (!dbUser) {
        return reject("No user found");
      }

      // Match the password
      const isMatch = await bcrypt.compare(password, dbUser.password);

      if (!isMatch) {
        return reject("Invalid Password");
      }
      resolve(dbUser);
    });
  }

  registerUser() {
    return new Promise(async (resolve, reject) => {
      const hashedPassword = await bcrypt.hash(this.password, 15);

      const user = new UserSchema({
        username: this.username,
        email: this.email,
        password: hashedPassword,
        name: this.name,
        phoneNumber: this.phoneNumber,
      });

      try {
        const dbUser = await user.save();

        return resolve(dbUser);
      } catch (err) {
        return reject(err);
      }
    });
  }
};

module.exports = User;
