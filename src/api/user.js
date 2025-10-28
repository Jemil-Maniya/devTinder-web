import axiosInstance from "./axiosInstance";

export const fetchConnections = async () => {
  try {
    const response = await axiosInstance.get("/user/connections", {
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const fetchRequests = async () => {
  try {
    const response = await axiosInstance.get("/user/request/received", {
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.log(error.message);
  }
};
