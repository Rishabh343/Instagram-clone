import api from "@/api/axios";
import { setUserProfile } from "@/redux/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();
  //   const [userProfile, setUserProfile] = React.useState(null);
  useEffect(() => {
    if (!userId) return; // don't call API with undefined id

    const fetchUserProfile = async () => {
      try {
        const res = await api.get(
          `/api/v1/user/${userId}/profile`,
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(setUserProfile(res.data.user));
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserProfile();
  }, [userId, dispatch]);
};
export default useGetUserProfile;
