import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Link } from "react-router-dom";
import api from "@/api/axios";

export default function Post({ post }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [postLike, setPostLike] = useState(post.likes.length);
  const [comment, setComment] = useState(post.comments);

  
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setText(e.target.value.trim() ? e.target.value : "");
  };

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await axios.get(
        `http://localhost:8000/api/v1/post/${post._id}/${action}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);

        const updatedPostsData = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user._id)
                  : [...p.likes, user._id],
              }
            : p
        );
        dispatch(setPosts(updatedPostsData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const commentHandler = async () => {
    try {
      const res = await api.post(
        `/api/v1/post/${post._id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);
        const updatedPostsData = posts.map((p) =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        );
        dispatch(setPosts(updatedPostsData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `http://localhost:8000/api/v1/post/delete/${post._id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedPostsData = posts.filter(
          (postItem) => postItem?._id !== post?._id
        );
        dispatch(setPosts(updatedPostsData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/post/${post._id}/bookmark`,
        { withCredentials: true }
      );
      if (res.data.success) toast.success(res.data.message);
    } catch (error) {
      console.log(error);
    }
  };

  const timeAgo = (postDate) => {
    const now = new Date();
    const created = new Date(postDate);
    const diff = Math.floor((now - created) / 1000);
    if (diff < 10) return "Just now";
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return created.toLocaleDateString();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mb-6 px-2 sm:px-4">
      <div className="w-full bg-white rounded-md shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between py-3 px-3 sm:px-5">
          <div className="flex items-start gap-3">
            <Link to={`/profile/${post.author?._id}`}>
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Avatar>
                  <AvatarImage
                    src={post.author?.profilePicture}
                    alt="post_image"
                    className="w-full h-full object-cover"
                  />
                  <AvatarFallback className="bg-gray-200 flex items-center justify-center text-xs font-medium">
                    CN
                  </AvatarFallback>
                </Avatar>
              </div>
            </Link>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-sm sm:text-base">
                  {post.author?.username}
                </h1>
                {user?._id === post.author._id && (
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Author
                  </Badge>
                )}
              </div>
              {post.createdAt && !isNaN(new Date(post.createdAt)) && (
                <span className="text-gray-500 text-xs">
                  {timeAgo(post.createdAt)}
                </span>
              )}
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <MoreHorizontal className="cursor-pointer" />
            </DialogTrigger>
            <DialogContent className="flex flex-col items-center gap-2 text-sm bg-white w-44 sm:w-56 p-2 rounded-md shadow-lg">
              <Button
                variant="outline"
                className="w-full text-[#ED4956] border font-bold text-xs sm:text-sm"
              >
                Unfollow
              </Button>
              <Button variant="ghost" className="w-full text-xs sm:text-sm">
                Add to favorite
              </Button>
              {user && user._id === post.author?._id && (
                <Button
                  onClick={deletePostHandler}
                  variant="ghost"
                  className="w-full text-xs sm:text-sm"
                >
                  Delete
                </Button>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Post Image */}
        <img
          className="rounded-md w-full object-cover aspect-square"
          src={post.image}
          alt="post_img"
        />

        {/* Actions */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2">
          <div className="flex gap-4">
            {liked ? (
              <FaHeart
                size={22}
                onClick={likeOrDislikeHandler}
                className="text-[#ED4956] cursor-pointer"
              />
            ) : (
              <FaRegHeart
                size={22}
                onClick={likeOrDislikeHandler}
                className="cursor-pointer hover:text-gray-600"
              />
            )}
            <MessageCircle
              size={22}
              onClick={() => {
                dispatch(setSelectedPost(post));
                setOpen(true);
              }}
              className="cursor-pointer hover:text-gray-600"
            />
            <Send size={22} className="cursor-pointer hover:text-gray-600" />
          </div>
          <Bookmark
            onClick={bookmarkHandler}
            size={22}
            className="cursor-pointer hover:text-gray-600"
          />
        </div>

        {/* Likes & Caption */}
        <div className="px-3 sm:px-5">
          <span className="font-medium block mb-1 text-sm sm:text-base">
            {postLike} Likes
          </span>
          <p className="text-sm sm:text-base">
            <span className="font-semibold mr-1">{post.author?.username}</span>
            {post.caption}
          </p>
        </div>

        {/* View all comments */}
        {comment.length > 0 && (
          <span
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer text-gray-400 text-xs sm:text-sm px-3 sm:px-5 block mt-1"
          >
            View all {comment.length} comments
          </span>
        )}

        {/* Comment Dialog */}
        <CommentDialog open={open} setOpen={setOpen} />

        {/* Add Comment */}
        <div className="flex items-center gap-2 px-3 sm:px-5 py-2 border-t border-gray-200">
          <input
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={changeEventHandler}
            className="w-full outline-none text-xs sm:text-sm"
          />
          {text && (
            <span
              onClick={commentHandler}
              className="text-[#3BADF8] cursor-pointer text-xs sm:text-sm font-medium"
            >
              Post
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
