import { users } from "../dummyData/data.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const userResolver = {
  Query: {
    authUser: async (_, __, context) => {
      try {
        const authUser = await context.getUser();
        return authUser;
      } catch (error) {
        console.error("Error in get auth user: ", error);
        throw new Error("Internal server error");
      }
    },

    user: async (_, { userId }, context) => {
      try {
        const user = await User.findById(userId);
        return user;
      } catch (error) {
        console.error("Error in getting user: ", error);
        throw new Error(error.message || "Internal Server error");
      }
    },
  },
  Mutation: {
    signUp: async (_, { input }, context) => {
      try {
        const { username, name, password, gender } = input;
        if (!username || !name || !password || !gender) {
          throw new Error(`All fields are require`);
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          throw new Error(`User already exists`);
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //https://avatar.iran.liara.run
        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;
        const newUser = new User({
          username,
          name,
          password: hashedPassword,
          profilePicture: gender === "male" ? boyProfilePic : girlProfilePic,
          gender,
        });
        await newUser.save();
        await context.login(newUser);
        return newUser;
      } catch (error) {
        console.error("Error in signUp: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    login: async (_, { input }, context) => {
      try {
        const { username, password } = input;
        if (!username || !password) {
          throw new Error("All fields are require");
        }
        const { user } = await context.authenticate("graphql-local", {
          username,
          password,
        });
        await context.login(user);
        return user;
      } catch (error) {
        console.error("Error in login: ", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
    logout: async (_, __, context) => {
      try {
        await context.logout();
        context.req.session.destroy((error) => {
          if (error) throw error;
        });
        context.res.clearCookie("connect.sid");
        return { message: "Logged out successfully" };
      } catch (error) {
        console.error("Error in log out: ", error);
        return { message: error.message || "Internal server error" };
      }
    },
  },
  User: {
    transactions: async (parent) => {
      try {
        const transactions = await Transaction.find({ userId: parent._id });
        return transactions;
      } catch (error) {
        console.error("Error in user.transactions resolver: ", error);
        throw new Error(error.message);
      }
    },
  },
};
export default userResolver;
