import axiosInstance from "./axiosInstance";

/**
 * Fetch conversation between two users
 * GET /messages/:userA/:userB?limit=200
 * returns { ok: true, messages: [...] }
 */
export const fetchConversation = async (userA, userB, limit = 200) => {
  try {
    const res = await axiosInstance.get(
      `/messages/${userA}/${userB}?limit=${limit}`
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
 * PATCH /messages/status/:messageId  { status }
 */
export const updateMessageStatus = async (messageId, status) => {
  try {
    const res = await axiosInstance.patch(`/messages/status/${messageId}`, {
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
 * Optional: send message via REST (fallback)
 * POST /messages/send
 */
export const sendMessageRest = async (payload) => {
  try {
    // payload: { from, to, text, meta }
    const res = await axiosInstance.post("/messages/send", payload);
    return res.data;
  } catch (err) {
    console.error("sendMessageRest error:", err?.response?.data || err.message);
    throw err;
  }
};
