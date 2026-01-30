import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { toast } from "sonner";

export default function CommentDialog({ open, setOpen }) {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();
  const [comments, setComments] = useState([]);

  // track which comment user is replying to
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    setComments(selectedPost?.comments || []);
  }, [selectedPost]);

  const changeEventHandler = (e) => {
    setText(e.target.value);
  };
  const sendMessageHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/post/${selectedPost?._id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const updatedCommentData = [res.data.comment, ...comments];
        setComments(updatedCommentData);

        const updatedPostsData = posts.map((p) =>
          p._id === selectedPost._id
            ? { ...p, comments: updatedCommentData }
            : p
        );

        dispatch(setPosts(updatedPostsData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendReplyHandler = async (commentId) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/post/comment/${commentId}/reply`,
        { text: replyText, postId: selectedPost._id },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        // update local state: add reply under the correct comment
        const updatedComments = comments.map((c) =>
          c._id === commentId
            ? { ...c, replies: [res.data.reply, ...(c.replies || [])] }
            : c
        );
        setComments(updatedComments);

        toast.success(res.data.message);
        setReplyText("");
        setReplyingTo(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="flex flex-col sm:flex-row w-full max-w-full sm:max-w-4xl h-[90vh] sm:h-[70vh] bg-white border-none rounded-2xl overflow-hidden"
      >
        {/* Left side: Image */}
        <div className="w-full sm:w-1/2 min-h-[200px] sm:min-h-full">
          <img
            src={selectedPost?.image}
            alt="post_img"
            className="h-full w-full object-cover sm:rounded-l-2xl"
          />
        </div>

        {/* Right side: Comments + Input */}
        <div className="w-full sm:w-1/2 flex flex-col justify-between relative">
          {/* Post Author + More Options */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Link to={`/profile/${selectedPost?.author?._id}`}>
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden">
                  <AvatarImage
                    src={selectedPost?.author?.profilePicture}
                    alt={selectedPost?.author?.username || "profile"}
                    className="w-full h-full object-cover"
                  />
                  <AvatarFallback className="bg-gray-200 flex items-center justify-center text-xs sm:text-sm font-medium rounded-full">
                    {selectedPost?.author?.username?.[0]?.toUpperCase() || "CN"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link className="font-semibold text-sm sm:text-base">
                  {selectedPost?.author?.username}
                </Link>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <MoreHorizontal className="cursor-pointer" />
              </DialogTrigger>
              <DialogContent className="flex flex-col items-center justify-center gap-2 text-center bg-white w-40 max-w-xs h-auto border-none p-3 rounded-md shadow-lg">
                <div className="cursor-pointer w-full text-[#ED4956] font-bold text-sm">
                  Unfollow
                </div>
                <div className="cursor-pointer w-full text-sm">
                  Add to favorite
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-16 sm:mb-0">
            {comments.map((c) => (
              <div key={c._id} className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden">
                    <AvatarImage
                      src={c?.author?.profilePicture}
                      alt={c?.author?.username || "profile"}
                      className="w-full h-full object-cover"
                    />
                    <AvatarFallback className="bg-gray-200 flex items-center justify-center text-xs sm:text-sm font-medium rounded-full">
                      {c?.author?.username?.[0]?.toUpperCase() || "CN"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm sm:text-base">
                    <span className="font-bold">{c?.author?.username}</span>{" "}
                    <span className="font-normal">{c?.text}</span>
                    <div
                      className="text-xs text-blue-500 cursor-pointer mt-1"
                      onClick={() => setReplyingTo(c._id)}
                    >
                      Reply
                    </div>
                  </div>
                </div>

                {/* Show replies */}
                {c.replies &&
                  c.replies.map((r) => (
                    <div
                      key={r._id}
                      className="flex items-start gap-2 ml-10 mt-1"
                    >
                      <Avatar className="w-6 h-6 rounded-full overflow-hidden">
                        <AvatarImage
                          src={r?.author?.profilePicture}
                          alt={r?.author?.username || "profile"}
                          className="w-full h-full object-cover"
                        />
                        <AvatarFallback className="bg-gray-200 flex items-center justify-center text-xs font-medium rounded-full">
                          {r?.author?.username?.[0]?.toUpperCase() || "CN"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-xs sm:text-sm">
                        <span className="font-bold">{r?.author?.username}</span>{" "}
                        <span className="font-normal">{r?.text}</span>
                      </div>
                    </div>
                  ))}

                {/* Reply input */}
                {replyingTo === c._id && (
                  <div className="flex items-center gap-2 ml-10 mt-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      type="text"
                      placeholder="Write a reply..."
                      className="w-full border outline-none border-gray-300 p-2 rounded text-xs sm:text-sm"
                    />
                    <Button
                      disabled={!replyText.trim()}
                      onClick={() => sendReplyHandler(c._id)}
                      variant="outline"
                      className="border border-gray-400 text-xs sm:text-sm h-8 px-3 rounded-md hover:bg-gray-100 disabled:opacity-50"
                    >
                      Send
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Comment Input (fixed bottom on mobile) */}
          <div className="w-full p-4 border-t border-gray-200 bg-white absolute bottom-0 left-0 sm:relative sm:border-t-0 sm:bg-transparent">
            <div className="flex items-center gap-2">
              <input
                value={text}
                onChange={changeEventHandler}
                type="text"
                placeholder="Add a comment..."
                className="w-full border outline-none border-gray-300 p-2 rounded text-xs sm:text-sm"
              />
              <Button
                disabled={!text.trim()}
                onClick={sendMessageHandler}
                variant="outline"
                className="border border-gray-400 text-xs sm:text-sm h-8 px-3 rounded-md hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
