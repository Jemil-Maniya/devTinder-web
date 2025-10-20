import React, { useEffect } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { userProfile } from "../api/auth";

const Body = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const tokenExist = document.cookie.includes("token");
      if (!tokenExist) {
        return navigate("/login");
      }

      const data = await userProfile();
      dispatch(addUser(data));
      console.log(data);
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login");
      }
      console.log(err.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [ dispatch, navigate]);

  return (
    <>
      <NavBar />
      <Outlet />
      <Footer />
    </>
  );
};

export default Body;
