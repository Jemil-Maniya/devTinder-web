import axiosInstance from "./axiosInstance";

export const reviewRequest = async (status, requestId) => {
  const response = await axiosInstance.post(
    `/request/review/${status}/${requestId}`,
    {},
    { withCredentials: true }
  );
  return response.data;
};

export const sendRequest = async (status, requestId) => {
  try {
    const response = await axiosInstance.post(
      `/send/request/${status}/${requestId}`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};
