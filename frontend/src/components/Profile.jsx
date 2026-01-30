import React, { use } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { AtSign, Heart, MessageCircle } from "lucide-react";
import { Badge } from "./ui/badge";
import axios from "axios";
import { setUserProfile } from "@/redux/authSlice";
import api from "@/api/axios";

export default function Profile() {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const dispatch = useDispatch();

  const { userProfile, user } = useSelector((store) => store.auth);

  const [activeTab, setActiveTag] = React.useState("posts");

  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isFollowing = userProfile?.followers?.includes(user?._id);

  const handleTabChange = (tab) => {
    setActiveTag(tab);
  };
  const handleFollowOrUnfollow = async () => {
    try {
      // API call
      const res = await api.post(
        `/api/v1/user/followorunfollow/${userProfile?._id}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        // Optimistic update like your like handler
        const updatedProfile = {
          ...userProfile,
          followers: isFollowing
            ? userProfile.followers.filter((id) => id !== user._id) // remove current user
            : [...userProfile.followers, user._id], // add current user
        };

        // Update Redux store instantly
        dispatch(setUserProfile(updatedProfile));
      }
    } catch (error) {
      console.error(
        "Follow/Unfollow error:",
        error.response?.data || error.message
      );
    }
  };

  const displayedPost =
    activeTab == "posts" ? userProfile?.posts : userProfile?.bookmarks;
  return (
    <div className="flex max-w-4xl justify-center mx-auto pl-10 mt-12 sm:mt-4 ">
      <div className="flex flex-col gap-20 p-8 bg">
        <div className="grid grid-cols-[2fr_3fr] gap-15 sm:grid-cols-[2fr_3fr] ">
          <section className="flex items-center justify-start sm:justify-center">
            <Avatar className=" w-24 h-24  sm:w-32 sm:h-32">
              <AvatarImage
                src={userProfile?.profilePicture}
                alt="profilePhoto"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className="flex flex-col gap-5">
              <div className="flex item-center gap-2 ">
                <span className="mt-1 font-bold ">{userProfile?.username}</span>
                {isLoggedInUserProfile ? (
                  <>
                    <Link to="/account/edit">
                      <Button
                        variant="secondary"
                        className=" bg-gray-100 *:hover:bg-gray-200 h-8"
                      >
                        Edit profile
                      </Button>
                    </Link>

                    <Button
                      variant="secondary"
                      className=" bg-gray-100 hover:bg-gray-200 h-8"
                    >
                      View archive
                    </Button>
                  </>
                ) : isFollowing ? (
                  <>
                    <Button
                      onClick={handleFollowOrUnfollow}
                      variant="secondary"
                      className=" bg-gray-100 h-8"
                    >
                      Unfollow
                    </Button>
                    <Button variant="secondary" className="bg-gray-100 h-8">
                      Message
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleFollowOrUnfollow}
                    variant="secondary"
                    className="bg-[#0095F6] hover:bg-[#3192D2] h-8"
                  >
                    Follow
                  </Button>
                )}
              </div>
              <div className=" flex items-center gap-5 sm:gap-15">
                <p>
                  <span className="font-semibold gap-1 sm:gap-0">
                    {userProfile?.posts.length}
                  </span>
                  posts
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.followers.length}
                  </span>
                  followers
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.following.length}
                  </span>
                  following
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">
                  {userProfile?.bio || "bio here"}
                </span>
                <Badge className="w-fit" variant="secondary">
                  <AtSign />
                  <span className="pl-1">{userProfile?.username}</span>
                </Badge>
                <span>Learn to code</span>
                <span>Learn to code</span>
                <span>Learn to code</span>
              </div>
            </div>
          </section>
        </div>
        <div className="border-t border-t-gray-200 ">
          <div className="flex items-center justify-center gap-10 text-sm">
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "posts" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("posts")}
            >
              POSTS
            </span>

            <span
              className={`py-3 cursor-pointer ${
                activeTab === "saved" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("saved")}
            >
              SAVED
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "reels" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("reels")}
            >
              REELS
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "tags" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("tags")}
            >
              TAGS
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {displayedPost?.map((post) => {
              return (
                <div
                  key={post?._id}
                  className="relative group cursor-pointer aspect-square overflow-hidden"
                >
                  {/* Image */}
                  <img
                    src={post?.image}
                    alt="postimage"
                    className="w-full h-full object-cover rounded-sm block"
                  />

                  {/* Hover Overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center
               bg-black/30
               opacity-0 group-hover:opacity-100
               transition-opacity duration-300"
                  >
                    <div className="flex items-center text-white space-x-6">
                      {/* Likes */}
                      <button className="flex items-center gap-2 hover:text-gray-300">
                        <Heart />
                        <span>{post?.likes?.length || 0}</span>
                      </button>

                      {/* Comments */}
                      <button className="flex items-center gap-2 hover:text-gray-300">
                        <MessageCircle />
                        <span>{post?.comments?.length || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
