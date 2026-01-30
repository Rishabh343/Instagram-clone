import React from "react";
import Posts from "./Posts";
import { useSelector } from "react-redux";

export default function Feed() {
  const { user } = useSelector((store) => store.auth);
  return (
    <div className="flex flex-col items-center w-full mt-12 sm:mt-4">
      {/* Story Section */}
      <div className="flex gap-4 my-5 overflow-x-auto px-0 sm:px-4">
        <div className="w-20 h-20 sm:w-20 sm:h-20 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-white p-[2px]">
            <img
              className="w-full h-full rounded-full object-cover"
              src={
                user?.profilePicture ||
                "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
              }
              alt="profile"
            />
          </div>
        </div>

        {/* Other Stories */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-full w-20 h-20 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0"
          >
            <img
              className="w-full h-full rounded-full object-cover"
              src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
              alt="story"
            />
          </div>
        ))}
      </div>

      {/* Feed Section */}
      <div className="flex-1 w-full max-w-[600px] flex flex-col items-center">
        <Posts />
      </div>
    </div>
  );
}
