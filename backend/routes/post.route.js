import express from "express";
import multer from "multer";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import {
  likePost,
  addNewPost,
  dislikePost,
  addComment,
  getCommentsOfPost,
  deletePost,
  bookmarkPost,
  getAllPost,
  getUserPost,
  addReply,
} from "../controllers/post.controllers.js";

const router = express.Router();
router
  .route("/addPost")
  .post(isAuthenticated, upload.single("image"), addNewPost);
router.route("/all").get(isAuthenticated, getAllPost);
router.route("/userpost/all").get(isAuthenticated, getUserPost);
router.route("/:id/like").get(isAuthenticated, likePost);
router.route("/:id/dislike").get(isAuthenticated, dislikePost);
router.route("/:id/comment").post(isAuthenticated, addComment);
router.route("/:id/comment/all").post(isAuthenticated, getCommentsOfPost);
router.route("/delete/:id").delete(isAuthenticated, deletePost);
router.route("/:id/bookmark").get(isAuthenticated, bookmarkPost);
router.route("/comment/:id/reply").post(isAuthenticated, addReply);

export default router;
