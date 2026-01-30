import React from "react";

import {
  ChevronDown,
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";

import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
// import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
// import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import api from "@/api/axios";
// import axios from "axios";
// import { toast } from "react-hot-toast";

export default function LeftSidebar() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const logoutHandler = async () => {
    try {
      const res = await api.get("/api/v1/user/logout", {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message || "Logout failed");
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data?.message || "Logout failed");
      } else if (error.request) {
        toast.error(
          "No response from server. Please check your network or CORS settings."
        );
      } else {
        toast.error("An error occurred during logout.");
      }
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
    }
  };
  const sidebarItems = [
    { icon: <Home strokeWidth={3} />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare c />, text: "Create" },
    {
      icon: (
        <Avatar>
          <AvatarImage
            className="rounded-full w-8 h-8"
            src={user?.profilePicture}
          />
          <AvatarFallback className="bg-gray-200">CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut className="" />, text: "Logout" },
  ];
  return (
    <>
      <div
        className="fixed top-0 left-0 z-10 h-screen border-r border-gray-300 
                  hidden sm:flex flex-col w-[8%] lg:w-[20%] xl:w-[18%] px-4 "
      >
        <div className="flex flex-col w-full">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1200px-Instagram_logo.svg.png?20160616034027"
            alt="Instagram Logo"
            className="hidden lg:block w-36 mt-6 ml-3"
          />

          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Instagram_simple_icon.svg/1024px-Instagram_simple_icon.svg.png"
            alt="Instagram Icon"
            className="block lg:hidden w-6 mt-6 ml-3"
          />

          <div className="mt-6">
            {sidebarItems.map((item, index) => (
              <div
                onClick={() => sidebarHandler(item.text)}
                key={index}
                className="flex items-center  gap-4 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 mb-3"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="hidden lg:block text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto mb-6 w-full">
          <CreatePost open={open} setOpen={setOpen} />
        </div>
      </div>

      {/* Bottom Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-10 flex justify-around border-t bg-white border-gray-300  p-2 md:hidden">
        {sidebarItems
          .filter((item) =>
            ["Home", "Explore", "Messages", "Create", "Profile"].includes(
              item.text
            )
          )
          .map((item, index) => (
            <button
              key={index}
              onClick={() => sidebarHandler(item.text)}
              className="flex flex-col items-center text-xs"
            >
              <span className="text-xl">{item.icon}</span>
            </button>
          ))}
      </div>
      <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between border-t bg-white border-gray-300 p-2 md:hidden">
        {/* Left: Logo */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1200px-Instagram_logo.svg.png?20160616034027"
          alt="Instagram Logo"
          className="w-28"
        />
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ChevronDown className="cursor-pointer w-5 h-5 " />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className=" flex w-32 h-10 rounded-md shadow-md bg-white align-center"
          >
            <DropdownMenuItem
              onClick={logoutHandler}
              className="text-red-500 font-semibold cursor-pointer"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Middle: Search bar with icon */}
        <div className="flex mx-3 relative ">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            className=" rounded-md  bg-gray-100 pl-9 pr-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        {/* Right: Notification icon */}
        {sidebarItems
          .filter((item) => ["Notifications"].includes(item.text))
          .map((item, index) => (
            <button
              key={index}
              onClick={() => sidebarHandler(item.text)}
              className="flex flex-col items-center"
            >
              <span className="text-xl">{item.icon}</span>
            </button>
          ))}
      </div>
    </>
  );
}
