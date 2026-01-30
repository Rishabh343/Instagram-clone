import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import Post from "../models/post.model.js";
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(401).json({
        message: "something is missing, please check",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        message: "try different email",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({
      message: "Account created successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        message: "Something is missing, please check",
        success: false,
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const populatedposts = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId);
        if (post && post.author && post.author.equals(user._id)) {
          return post;
        }
        return null;
      }),
    );

    user = {
      _id: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: populatedposts,
    };

    // 🔑 create token
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProd, // only require HTTPS in production
      sameSite: isProd ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };

    return res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export const logout = async (req, res) => {
  try {
    return res
      .cookie("token", "", { maxAge: 0, httpOnly: true, sameSite: "strict" })
      .json({
        message: "logged out successfully",
        success: true,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("userId:", userId);

    const user = await User.findById(userId)
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } }, // sort posts by newest
      })
      .populate("bookmarks");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.log("error in getProfile:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;

    let cloudResponse;
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        message: "User not found",
        success: false,
      });
    }

    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();

    return res.status(200).json({
      message: "Profile updated",
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select(
      "-password",
    );
    if (!suggestedUsers) {
      return res.status(400).json({
        message: "Currently do not have any users",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      users: suggestedUsers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    const followKrneWala = req.id; //patel
    const jiskoFollowKarunga = req.params.id; //shivani
    if (followKrneWala === jiskoFollowKarunga) {
      return res.status(400).json({
        message: "You cannot follow or unfollow yourself",
        success: false,
      });
    }
    const user = await User.findById(followKrneWala);
    const targetUser = await User.findById(jiskoFollowKarunga);

    if (!user || !targetUser) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }
    //now mai check krunga ki follow krna hai ki unfollow

    const isfollowing = user.following.includes(jiskoFollowKarunga);
    if (isfollowing) {
      //unfollow logic
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $pull: { following: jiskoFollowKarunga } },
        ),
        User.updateOne(
          { _id: jiskoFollowKarunga },
          { $pull: { followers: followKrneWala } },
        ),
      ]);
      return res
        .status(200)
        .json({ message: "unfollow successfully", success: true });
    } else {
      //follow logic ayega
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $push: { following: jiskoFollowKarunga } },
        ),
        User.updateOne(
          { _id: jiskoFollowKarunga },
          { $push: { followers: followKrneWala } },
        ),
      ]);
      return res
        .status(200)
        .json({ message: "follow successfully", success: true });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
