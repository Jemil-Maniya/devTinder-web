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

export const signupUser = async (firstName, lastName, email, password) => {
  try {
    const response = await axiosInstance.post(
      "/signup",
      {
        firstName,
        lastName,
        email,
        password,
      },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    console.log(error.message);
  }
};

export const userProfile = async () => {
  try {
    const response = await axiosInstance.get("/profile", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const logoutUser = async () => {
  try {
    const response = await axiosInstance.post(
      "/logout",
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};
