import axiosInstance from "./axiosInstance";


export const reviewRequest = async (status, requestId) => {
  const response = await axiosInstance.post(
    `/request/review/${status}/${requestId}`,
    {},
    { withCredentials: true }
  );
  return response.data;
};
