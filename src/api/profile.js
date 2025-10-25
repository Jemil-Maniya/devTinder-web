import axiosInstance from "./axiosInstance";

export const profileEdit = async (
  firstName,
  lastName,
  age,
  gender,
  about,
  photoUrl
) => {
  try {
    const response = await axiosInstance.patch(
      "/profile/edit",
      { firstName, lastName, age, gender, about, photoUrl },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.log("ERROR: ", error.response?.data || error.message);
  }
};
