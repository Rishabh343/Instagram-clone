import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import api from "@/api/axios";

export default function Login() {
  const [input, setInput] = React.useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = React.useState(false);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const signupHandler = async (e) => {
    e.preventDefault();
    console.log(input);
    try {
      setLoading(true);
      const res = await api.post("/api/v1/user/login", input, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        navigate("/");
        toast.success(res.data.message);
        setInput({
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);
  return (
    <>
      <div className="flex items-center justify-center w-screen min-h-screen bg-gray-50 px-4">
        <form
          onSubmit={signupHandler}
          className="bg-white shadow-md flex flex-col gap-5 p-6 sm:p-8 rounded-lg w-full max-w-sm sm:max-w-md"
        >
          {/* Logo + tagline */}
          <div className="my-4 flex flex-col items-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1200px-Instagram_logo.svg.png?20160616034027"
              alt="Instagram Logo"
              className="w-28 sm:w-36 mt-4"
            />
            <p className="text-sm sm:text-base text-center text-gray-400 mt-2">
              Login to see photos & videos from your friends
            </p>
          </div>

          {/* Email input */}
          <div className="flex flex-col gap-1">
            <span className="py-1 font-medium text-sm sm:text-base">Email</span>
            <Input
              type="text"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent text-sm sm:text-base"
            />
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1">
            <span className="py-1 font-medium text-sm sm:text-base">
              Password
            </span>
            <Input
              type="password"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent text-sm sm:text-base"
            />
          </div>

          {/* Submit button */}
          {loading ? (
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 bg-gray-200 text-gray-600 font-medium py-2 rounded"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Please wait
            </button>
          ) : (
            <Button
              className="bg-black font-bold text-white w-full py-2 rounded text-sm sm:text-base"
              type="submit"
            >
              Login
            </Button>
          )}

          {/* Signup redirect */}
          <span className="text-center text-sm sm:text-base mt-4">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-blue-600 font-medium">
              Signup
            </Link>
          </span>
        </form>
      </div>
    </>
  );
}
