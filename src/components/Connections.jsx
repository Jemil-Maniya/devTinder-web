import React, { useEffect, useState } from "react";
import { fetchConnections } from "../api/user";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionsSlice";
import { useNavigate } from "react-router-dom";

const Connections = () => {
  const dispatch = useDispatch();
  const connections = useSelector((store) => store.connections) || [];
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

  const allConnections = async () => {
    try {
      const data = await fetchConnections();
      dispatch(addConnections(data));
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    allConnections();
  }, []);

const handleChat = (connect) => {
  const { _id, firstName, lastName } = connect;

  navigate(`/chat/${_id}`, {
    state: {
      name: `${firstName} ${lastName}`,
    },
  });
};


  return (
    <div className="flex flex-col items-center min-h-screen bg-base-content py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-white">Your Connections</h1>

      {loading ? (
        <div className="p-4 text-center text-gray-400 text-lg">Loading...</div>
      ) : connections.length > 0 ? (
        <ul className="w-full max-w-3xl space-y-4">
          {connections.map((connect) => {
            const { about, age, firstName, lastName, gender, photoUrl, _id } =
              connect;

            return (
              <li
                key={_id}
                className="flex items-center gap-4 p-5 bg-neutral rounded-2xl shadow-md hover:shadow-lg transition-all border border-transparent hover:border-gray-600">
                <img
                  src={
                    photoUrl ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
                  }
                  alt={`${firstName} ${lastName}`}
                  className="w-14 h-14 rounded-full object-cover border border-gray-500"
                />

                <div className="flex flex-col text-white">
                  <span className="font-semibold text-lg">
                    {firstName} {lastName}
                  </span>
                  <span className="text-sm text-gray-400">
                    {age ? `${age} • ${gender}` : gender}
                  </span>
                  {about && (
                    <span className="text-sm text-gray-300 mt-1 italic">
                      “{about}”
                    </span>
                  )}
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => handleChat(connect)}
                    aria-label={`Chat with ${firstName} ${lastName}`}
                    className="btn btn-sm btn-primary gap-2">
                    {/* simple chat icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    Chat
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="p-6 text-center text-gray-400 text-lg">
          You have no connections yet.
        </div>
      )}
    </div>
  );
};

export default Connections;
