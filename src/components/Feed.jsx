import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userFeed } from "../api/feed";
import { addFeed } from "../utils/feedSlice";
import UserCard from "./UserCard";

const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);


  const getFeed = async () => {
    try {
      const data = await userFeed();
      dispatch(addFeed(data));
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-base-content  ">
      <UserCard feed={feed?.feed?.data?.[0]} />
    </div>
  );
};

export default Feed;
