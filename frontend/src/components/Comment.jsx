import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import React from "react";

export default function Comment({ comment }) {
  return (
    <div className="my-2 ">
      {/* <div className="flex items-center gap-2 mb-5">
        <Avatar className="">
          <AvatarImage
            className="w-[35px] h-[35px] rounded-full"
            src={comment?.author?.profilePicture}
          />
          <AvatarFallback className="bg-gray-200 rounded-full  ">
            CN
          </AvatarFallback>
        </Avatar>
        <h1 className="font-bold text-xs ">
          {comment?.author?.username}
          <span className="font-normal pl-1">{comment?.text}</span>
        </h1>
      </div> */}
    </div>
  );
}
