// src/api/messagesApi.js
import axiosInstance from "./axiosInstance";

/**
 * Fetch conversation between two users
 * GET /api/messages/:userA/:userB?limit=200
 * returns { ok: true, messages: [...] }
 */
export const fetchConversation = async (userA, userB, limit = 200) => {
  try {
    const res = await axiosInstance.get(
      `/api/messages/${userA}/${userB}?limit=${limit}`
    );
    return res.data; // { ok: true, messages: [...] }
  } catch (err) {
    console.error(
      "fetchConversation error:",
      err?.response?.data || err.message
    );
    throw err;
  }
};

/**
 * Update message status (delivered/read)
 * PATCH /api/messages/status/:messageId  { status }
 */
export const updateMessageStatus = async (messageId, status) => {
  try {
    const res = await axiosInstance.patch(`/api/messages/status/${messageId}`, {
      status,
    });
    return res.data;
  } catch (err) {
    console.error(
      "updateMessageStatus error:",
      err?.response?.data || err.message
    );
    throw err;
  }
};

/**
 * Optional: send message via REST (if you want a fallback)
 * POST /api/messages/send -> implement on server if needed
 * (You can keep using sockets for real-time sending.)
 */
export const sendMessageRest = async (payload) => {
  try {
    // payload: { from, to, text, meta }
    const res = await axiosInstance.post("/api/messages/send", payload);
    return res.data;
  } catch (err) {
    console.error("sendMessageRest error:", err?.response?.data || err.message);
    throw err;
  }
};
