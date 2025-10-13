import axiosInstance from "./axiosInstance";

export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post(
      "/login",
      { email, password },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    console.log(error.message);
  }
};
