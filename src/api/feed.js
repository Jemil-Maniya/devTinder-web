import axiosInstance from "./axiosInstance";

export const userFeed = async () => {
  try {
    const response = await axiosInstance.get(
      "/user/feed",
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};
