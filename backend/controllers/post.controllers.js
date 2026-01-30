import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";

export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const authorId = req.id; // <-- Fix 1

    if (!req.file) {
      return res.status(400).json({
        message: "Image file is required",
        success: false,
      });
    }
    const optimizedImageBUffer = await sharp(req.file.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    const fileuri = `data:image/jpeg;base64,${optimizedImageBUffer.toString(
      "base64",
    )}`;
    const cloudResponse = await cloudinary.uploader.upload(fileuri);

    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });

    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    await post.populate({ path: "author", select: "-password" });

    return res.status(201).json({
      message: "New post added",
      post,
      success: true, // <-- Fix 4
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        options: { sort: { created: -1 } },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });

    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username profilePicture",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const likePost = async (req, res) => {
  try {
    const likeKrneWalaUserKiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }
    //like logic started
    await post.updateOne({
      $addToSet: { likes: likeKrneWalaUserKiId },
    });
    await post.save();

    //implement socket io for real time notification
    return res.status(200).json({
      message: "Post liked",
      success: true,
      post,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const dislikePost = async (req, res) => {
  try {
    const likeKrneWalaUserKiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }
    //like logic started
    await post.updateOne({
      $pull: { likes: likeKrneWalaUserKiId },
    });
    await post.save();

    //implement socket io for real time notification
    return res.status(200).json({
      message: "Post disliked",
      success: true,
      post,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentKrneWalaUserKiId = req.id;
    const { text } = req.body;
    const post = await Post.findById(postId);
    if (!text || !post) {
      return res.status(404).json({
        message: "text is required or post not found",
        success: false,
      });
    }
    const comment = await Comment.create({
      text,
      post: postId,
      author: commentKrneWalaUserKiId,
    });
    await comment.populate({
      path: "author",
      select: "username profilePicture",
    });
    post.comments.push(comment._id);
    await post.save();
    return res.status(201).json({
      message: "Comment added",
      success: true,
      comment,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({ post: postId }).populate({
      path: "author",
      select: "username profilePicture",
    });
    if (!comments) {
      return res.status(404).json({
        message: "No comments found for this post",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Comments fetched successfully",
      success: true,
      comments,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
export const addReply = async (req, res) => {
  try {
    const { text, postId } = req.body;
    const userId = req.user.id;
    const parentCommentId = req.params.id;

    if (!text)
      return res
        .status(400)
        .json({ success: false, message: "Reply text required" });

    // Create reply
    const newReply = new Comment({
      text,
      author: userId,
      post: postId,
      parent: parentCommentId,
    });

    await newReply.save();

    // Push reply into parent comment
    await Comment.findByIdAndUpdate(parentCommentId, {
      $push: { replies: newReply._id },
    });

    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      reply: newReply,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }
    //check if the user is the author of the post
    if (post.author.toString() !== authorId) {
      return res.status(403).json({
        message: "You are not authorized to delete this post",
        success: false,
      });
    }
    //delete the post
    await Post.findByIdAndDelete(postId);
    //remove the post from the user's posts array
    let user = await User.findById(authorId);
    user.posts = user.posts.filter((id) => id.toString() !== postId);
    await user.save();
    //delete associated comments
    await Comment.deleteMany({ post: postId });
    return res.status(200).json({
      message: "Post deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
export const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }
    //bookmark logic
    const user = await User.findById(authorId);
    if (user.bookmarks.includes(postId)) {
      await user.updateOne({ $pull: { bookmarks: postId } });
      await user.save();
      return res.status(200).json({
        type: "unsaved",
        message: "Post removed from bookmarks",
        success: true,
        post,
      });
    } else {
      await user.updateOne({ $addToSet: { bookmarks: postId } });
      await user.save();
      return res.status(200).json({
        type: "saved",
        message: "Post bookmarked successfully",
        success: true,
        post,
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    // 1️⃣ Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    // 2️⃣ Check if the logged-in user is the author of the comment
    if (comment.author.toString() !== req.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // 3️⃣ Delete the comment document
    await comment.deleteOne();

    // 4️⃣ Remove comment reference from Post
    await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });

    res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
