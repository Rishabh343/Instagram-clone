import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setSuggestedUsers } from "@/redux/authSlice"; // make sure this action exists
import api from "@/api/axios";

export default function SuggestedUser() {
  const dispatch = useDispatch();
  const { suggestedUsers, user } = useSelector((store) => store.auth); // logged-in user also

  const handleFollowOrUnfollow = async (userId, isFollowing) => {
    try {
      const res = await api.post(
        `/api/v1/user/followorunfollow/${userId}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        // update suggestedUsers optimistically
        const updated = suggestedUsers.map((u) =>
          u._id === userId
            ? {
                ...u,
                followers: isFollowing
                  ? u.followers.filter((id) => id !== user._id)
                  : [...u.followers, user._id],
              }
            : u
        );
        dispatch(setSuggestedUsers(updated));
      }
    } catch (error) {
      console.error("Follow/Unfollow error:", error.response?.data || error);
    }
  };

  return (
    <div className="my-10 gap-3">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-gray-600">Suggested for User</h1>
        <span className="font-medium cursor-pointer">See All</span>
      </div>

      {suggestedUsers.map((sUser) => {
        const isFollowing = sUser?.followers?.includes(user?._id);

        return (
          <div key={sUser._id} className="gap-1">
            <div className="flex items-center justify-between my-3 gap-1">
              <Link to={`profile/${sUser._id}`}>
                <Avatar>
                  <AvatarImage src={sUser?.profilePicture} alt="post_image" />
                  <AvatarFallback className=" bg-gray-200 rounded-full ">
                    CN
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div>
                <h1 className="font-semibold text-sm">
                  <Link to={`/profile/${sUser?._id}`}>{sUser?.username}</Link>
                </h1>
                <span className="text-gray-600 text-sm">
                  {sUser?.bio || "Bio here.."}
                </span>
              </div>

              {isFollowing ? (
                <span
                  onClick={() => handleFollowOrUnfollow(sUser._id, true)}
                  className="text-gray-600 text-sm font-bold cursor-pointer hover:text-black"
                >
                  Unfollow
                </span>
              ) : (
                <span
                  onClick={() => handleFollowOrUnfollow(sUser._id, false)}
                  className="text-[#3BADF8] text-sm font-bold cursor-pointer hover:text-[#3495d6]"
                >
                  Follow
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
