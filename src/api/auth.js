import axiosInstance from "./axiosInstance";

export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post(
      "/login",
      { email, password },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const userLogin = async () => {
  try {
    const response = await axiosInstance.get("/profile", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};
