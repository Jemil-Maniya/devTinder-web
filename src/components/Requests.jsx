import React, { useEffect, useState } from "react";
import { fetchRequests } from "../api/user";
import { useDispatch, useSelector } from "react-redux";
import { addRequest } from "../utils/requestSlice";
import { reviewRequest } from "../api/request";

const Requests = () => {
  const dispatch = useDispatch();
  const requests = useSelector((store) => store.request) || [];
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const allRequests = async () => {
    try {
      const data = await fetchRequests();
      dispatch(addRequest(data));
    } catch (err) {
      console.log(err.message);
      showToast("Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    allRequests();
  }, []);

  const handleReview = async (status, requestId) => {
    try {
      await reviewRequest(status, requestId);
      if (status === "accepted") {
        showToast("Request accepted!", "success");
      } else {
        showToast("Request ignored.", "warning");
      }
      allRequests();
    } catch (err) {
      console.log(err.message);
      showToast("Something went wrong.", "error");
    }
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-base-content">
      {/* ✅ Compact Toast near top center */}
      {toast && (
        <div className="toast toast-top toast-center mt-14 z-50">
          <div
            className={`alert ${
              toast.type === "success"
                ? "alert-success"
                : toast.type === "error"
                ? "alert-error"
                : toast.type === "warning"
                ? "alert-warning"
                : "alert-info"
            } shadow-md px-4 py-2 text-sm rounded-lg`}>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <h1 className="text-3xl font-bold mb-6 text-white mt-10">Requests</h1>

      {loading ? (
        <div className="p-4 text-center text-gray-500">Loading...</div>
      ) : requests.length > 0 ? (
        <ul className="w-full max-w-3xl space-y-3">
          {requests.map((request) => {
            const { about, age, firstName, lastName, gender, photoUrl, _id } =
              request.fromUserId;

            return (
              <li
                key={_id}
                className="flex items-center p-4 gap-4 border border-transparent hover:border-white transition-colors rounded-md shadow-md bg-neutral">
                <img
                  src={
                    photoUrl ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
                  }
                  alt={`${firstName} ${lastName}`}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
                <div className="flex-1">
                  <div className="font-semibold text-white">
                    {firstName} {lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {age} - {gender}
                  </div>
                  <div className="text-sm text-gray-700">
                    {about || "No additional info."}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleReview("accepted", request._id)}>
                    Interested
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleReview("rejected", request._id)}>
                    Ignored
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="p-4 text-center text-gray-500">
          No requests found.
        </div>
      )}
    </div>
  );
};

export default Requests;
