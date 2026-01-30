import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";
import api from "@/api/axios";

export default function EditProfile() {
  const imageRef = useRef();
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    profilePicture: null, // only set when user selects a file
    bio: user?.bio || "",
    gender: user?.gender || "",
  });

  // Handle file selection
  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, profilePicture: file });
    }
  };

  // Handle gender select
  const selectChangeHandler = (value) => {
    setInput({ ...input, gender: value });
  };

  // Submit edited profile
  const editProfileHandler = async () => {
    console.log();
    const formData = new FormData();
    formData.append("bio", input.bio);
    formData.append("gender", input.gender);
    if (input.profilePicture instanceof File) {
      formData.append("profilePicture", input.profilePicture);
    }
    try {
      setLoading(true);
      const res = await api.post(
        "/api/v1/user/profile/edit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // cookies/session
        }
      );

      if (res.data.success) {
        const updatedUserData = {
          ...user,
          bio: res.data.user?.bio,
          profilePicture: res.data.user?.profilePicture,
          gender: res.data.user.gender,
        };
        dispatch(setAuthUser(updatedUserData));
        navigate(`/profile/${user?._id}`);
        toast.success(res.data.message);
      }
    } catch (error) {
      if (error.response) {
        console.log(" Response error:", error.response.data);
        toast.error(error.response.data.message || "Server error");
      } else if (error.request) {
        console.log(" No response received:", error.request);
        toast.error("No response from server");
      } else {
        console.log(" Request setup error:", error.message);
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center w-full min-h-screen bg-gray-50 px-4 py-6">
      <section className="flex flex-col gap-6 w-full max-w-2xl bg-white p-6 sm:p-8 rounded-lg shadow-md overflow-y-auto">
        <h1 className="font-bold text-xl text-center sm:text-left">
          Edit Profile
        </h1>

        {/* Profile Photo Section */}
        <div className="flex flex-col sm:flex-row items-center sm:justify-between bg-gray-100 rounded-xl p-4 gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
              <AvatarImage src={user?.profilePicture} alt="profile_image" />
              <AvatarFallback className="bg-gray-200 rounded-full">
                CN
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="font-bold text-sm sm:text-base">
                {user?.username}
              </h1>
              <span className="text-gray-600 text-xs sm:text-sm">
                {user?.bio || "Bio here.."}
              </span>
            </div>
          </div>

          <div className="flex justify-center sm:justify-end w-full sm:w-auto">
            <input
              ref={imageRef}
              type="file"
              className="hidden"
              onChange={fileChangeHandler}
            />
            <Button
              onClick={() => imageRef?.current.click()}
              className="bg-[#0095F6] h-8 hover:bg-[#318bc7] w-full sm:w-auto"
            >
              Change photo
            </Button>
          </div>
        </div>

        {/* Bio */}
        <div className="flex flex-col">
          <h1 className="font-bold text-lg sm:text-xl mb-2">Bio</h1>
          <Textarea
            value={input.bio}
            onChange={(e) => setInput({ ...input, bio: e.target.value })}
            name="bio"
            className="focus-visible:ring-transparent w-full"
          />
        </div>

        {/* Gender */}
        <div className="flex flex-col">
          <h1 className="font-bold mb-2">Gender</h1>
          <Select
            defaultValue={input.gender}
            onValueChange={selectChangeHandler}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          {loading ? (
            <Button className="w-full sm:w-fit bg-[#0095f6] hover:bg-[#318bc7] flex items-center justify-center gap-2">
              <Loader2 className="h-4 animate-spin" /> Please wait
            </Button>
          ) : (
            <Button
              onClick={editProfileHandler}
              className="w-full sm:w-fit bg-[#0095f6] hover:bg-[#318bc7]"
            >
              Submit
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
