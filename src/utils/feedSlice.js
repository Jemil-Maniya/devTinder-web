import { createSlice } from "@reduxjs/toolkit";

export const feedSlice = createSlice({
  name: "feed",
  initialState: {
    feed: [],
  },
  reducers: {
    addFeed: (state, action) => {
      state.feed = action.payload;
    },
    removeFeed: (state, action) => {
      state.feed = [];
    },
    removeUserFromFeed: (state, action) => {
      const id = action.payload;
      state.feed.data = state.feed.data.filter((user) => user._id !== id);
      console.log("state", state.feed.data);
    },
  },
});

export const { addFeed, removeFeed, removeUserFromFeed } = feedSlice.actions;
export default feedSlice.reducer;
