import React, { useEffect, useRef, useState } from "react";
import UserCard from "./UserCard";
import { profileEdit } from "../api/profile";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import axios from "axios";

const EditProfile = ({ user }) => {
  // console.log("USER PROFILE ", user);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [age, setAge] = useState();
  const [about, setAbout] = useState("");
  const [gender, setGender] = useState("");
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhotoUrl(user.photoUrl || "");
      setAge(user.age || "");
      setAbout(user.about || "");
      setGender(user.gender || "");
    }
  }, [user]);

  const provideUser = { firstName, lastName, photoUrl, age, gender, about };

  const handleGenderSelect = (value) => {
    setGender(value);
    if (dropdownRef.current) {
      dropdownRef.current.removeAttribute("open");
    }
  };

  // const handleSaveChanges = async () => {
  //   try {
  //     const data = await profileEdit(
  //       firstName,
  //       lastName,
  //       age,
  //       gender,
  //       about,
  //       photoUrl
  //     );
  //     dispatch(addUser(data.data))
  //     return data;
  //   } catch (err) {
  //     console.log(err.message);
  //   }
  // };

  const handleSaveChanges = async () => {
    try {
      const res = await axios.patch(
        "http://localhost:7777/profile/edit",
        {
          firstName,
          lastName,
          photoUrl,
          age,
          gender,
          about,
        },
        { withCredentials: true }
      );
      dispatch(addUser(res.data))
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-base-content gap-10 p-6">
        <div className="flex items-center justify-center min-h-screen bg-base-content   ">
          <div className="card bg-neutral w-96 shadow-xl p-2">
            <div className="card-body ">
              <h2 className="card-title text-white mb-4">Edit Profile</h2>
              <div className="flex flex-col space-y-5">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Photo URL"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="input"
                />

                <textarea
                  className="textarea"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="About"></textarea>
                <details className="dropdown" ref={dropdownRef}>
                  <summary className="btn m-1">
                    {gender || "Select Gender"}
                  </summary>
                  <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                    <li>
                      <a onClick={() => handleGenderSelect("Male")}>Male</a>
                    </li>
                    <li>
                      <a onClick={() => handleGenderSelect("Female")}>Female</a>
                    </li>
                    <li>
                      <a onClick={() => handleGenderSelect("Others")}>Others</a>
                    </li>
                  </ul>
                </details>
              </div>

              <div className="card-actions justify-start py-5">
                <button className="btn btn-primary" onClick={handleSaveChanges}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
        <UserCard feed={provideUser} />
      </div>
    </>
  );
};

export default EditProfile;
