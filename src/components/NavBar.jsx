import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../api/auth";
import { removeUser } from "../utils/userSlice";
import { Link, replace, useNavigate } from "react-router-dom";

const NavBar = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(removeUser());
      navigate("/login", { replace: true });
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="navbar bg-neutral shadow-sm">
      <div className="flex-1">
        <Link
          to={"/feed"}
          className="btn btn-ghost text-xl text-white hover:bg-white/10">
          devTinder
        </Link>
      </div>
      {user && (
        <div className="flex items-center gap-2 mx-5">
          <p className=" text-white mr-3 text-sm">
            Welcome, {user?.firstName} {user?.lastName}
          </p>
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full ">
                <img alt="User IMG" src={user?.photoUrl} />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
              <li>
                <Link to={"/profile"} className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </Link>
              </li>
              <li>
                <Link to={"/user/connections"}>Connections</Link>
              </li>
              <li>
                <Link to={"/user/request/receivede"}>Requests</Link>
              </li>
              <li>
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
