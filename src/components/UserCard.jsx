import React from "react";

const UserCard = ({ feed }) => {
 
  return (
    <div className="card bg-neutral w-86 shadow-sm">
      <figure>
        <img src={feed?.photoUrl} alt="Profile IMG" />
      </figure>
      <div className="card-body text-white">
        <h2 className="card-title">
          {feed?.firstName} {feed?.lastName}
        </h2>
        <h2 className="card-title">
          {feed?.gender} - {feed?.age} years
        </h2>
        <p>{feed?.about}</p>
        <div className="card-actions justify-between gap-2 mt-5 mb-2">
          <button className="btn btn-primary flex-1">Ignore</button>
          <button className="btn btn-secondary flex-1">Intrested</button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
