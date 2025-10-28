import React, { useEffect, useState } from "react";
import { fetchConnections } from "../api/user";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionsSlice";

const Connections = () => {
  const dispatch = useDispatch();
  const connections = useSelector((store) => store.connections) || [];
  const [loading, setLoading] = useState(true);

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
