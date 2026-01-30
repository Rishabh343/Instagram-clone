import api from "@/api/axios";
import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllPost = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const res = await api.get("/api/v1/post/all", {
          withCredentials: true,
        });
        if (res.data.success) {
        //   console.log(res.data);
          dispatch(setPosts(res.data.posts))
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllPosts();
  }, []);
};
export default useGetAllPost;
