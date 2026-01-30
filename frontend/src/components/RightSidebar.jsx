import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";
import store from "@/redux/store";
import { Link } from "react-router-dom";
import SuggestedUser from "./SuggestedUser";

export default function RightSidebar() {
  const { user } = useSelector((store) => store.auth);

  return (
    <div className="hidden lg:flex fixed top-0  right-0 h-screen w-[25%] xl:w-[23%] flex-col px-6 py-10 overflow-y-auto">
      <div className="flex items-center gap-2 mb-6 sticky top-0 bg-white py-2">
        <Link to={`/profile/${user?._id}`}>
          <Avatar className="w-12 h-12">
            <AvatarImage src={user?.profilePicture} alt="profile" />
            <AvatarFallback className="bg-gray-200 rounded-full">
              CN
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex flex-col gap-3">
          <h1 className="font-semibold text-sm">
            <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
          </h1>
          <span className="text-gray-600 text-xs">
            {user?.bio || "Bio here.."}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <SuggestedUser />
      </div>
    </div>
  );
}
