import React from "react";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "@/redux/lib/utils";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import api from "@/api/axios";

export default function CreatePost({ open, setOpen }) {
  const imageRef = React.useRef();

  const [file, setFile] = React.useState("");
  const [caption, setCaption] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState("");
  const [loading, setloading] = React.useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  };
  const createPostHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (file) formData.append("image", file);
    if (caption) formData.append("caption", caption);
    try {
      setloading(true);
      const res = await api.post("/api/v1/post/addpost", formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setloading(false);
    }
  };
  return (
    <Dialog open={open}>
      <DialogContent
        className="flex flex-col gap-6 p-4 sm:p-6 bg-white w-full max-w-md sm:max-w-lg md:max-w-xl rounded-xl shadow-lg border-none max-h-[90vh] overflow-y-auto"
        onInteractOutside={() => setOpen(false)}
      >
        <DialogHeader className="font-bold text-lg sm:text-xl text-center mb-2">
          Create New Post
        </DialogHeader>

        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
            <AvatarImage src={user?.profilePicture} alt="img" />
            <AvatarFallback className="text-lg bg-gray-100">CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-sm sm:text-base">
              {user?.username}
            </h1>
            <span className="text-gray-500 text-xs sm:text-sm">
              {user?.bio || "Bio here.."}
            </span>
          </div>
        </div>

        {/* Caption Input (auto-growing) */}
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="focus-visible:ring-transparent border border-gray-300 rounded-md text-base px-3 py-2 resize-none w-full min-h-[3rem] sm:min-h-[4rem] overflow-hidden"
          placeholder="Write a caption..."
          style={{ height: "auto" }}
          rows={3}
          onInput={(e) =>
            (e.target.style.height = e.target.scrollHeight + "px")
          }
        />

        {/* Image Preview */}
        {imagePreview && (
          <div className="flex items-center justify-center w-full max-h-60 sm:max-h-80 overflow-hidden">
            <img
              src={imagePreview}
              alt="preview"
              className="object-contain w-full h-full rounded-md"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col items-center gap-3 w-full">
          <input
            ref={imageRef}
            type="file"
            className="hidden"
            onChange={fileChangeHandler}
          />
          <Button
            onClick={() => imageRef.current.click()}
            type="button"
            className="bg-[#0095F6] hover:bg-[#2583c1] text-white px-4 sm:px-6 py-2 rounded-md text-sm sm:text-base font-medium w-full sm:w-auto"
          >
            Select from computer
          </Button>

          {imagePreview &&
            (loading ? (
              <Button className="flex items-center justify-center gap-2 w-full sm:w-auto">
                <Loader2 className="h-4 w-4 animate-spin" />
                Please wait...
              </Button>
            ) : (
              <Button
                onClick={createPostHandler}
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-950 text-white px-4 sm:px-6 py-2 rounded-md text-sm sm:text-base font-medium"
              >
                Post
              </Button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
