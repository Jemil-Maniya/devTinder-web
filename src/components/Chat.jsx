// src/components/Chat.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchConversation, sendMessageRest } from "../api/message";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:7777";

const Chat = () => {
  const { toUserId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedName = location.state?.name || "";

  // logged in user from redux
  const loggedInUser = useSelector((state) => state.user.user);
  const loggedInUserId = loggedInUser?._id;

  // STATE
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socketReady, setSocketReady] = useState(false);
  const [toUserName, setToUserName] = useState(passedName);

  // presence state for recipient:
  // null = unknown (not checked yet), true = online, false = offline
  const [recipientOnline, setRecipientOnline] = useState(null);

  // REFS
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // SCROLL ALWAYS TO BOTTOM
  const scrollToBottom = () => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ----------------------------
  // 1) LOAD INITIAL MESSAGES
  // ----------------------------
  useEffect(() => {
    if (!loggedInUserId || !toUserId) return;

    (async () => {
      try {
        const data = await fetchConversation("me", toUserId, 200);

        if (data.ok && Array.isArray(data.messages)) {
          setMessages(
            data.messages.map((m) => ({
              id: m._id,
              text: m.text,
              fromSelf: m.fromSelf,
              time: m.time,
            }))
          );
        }
      } catch (err) {
        console.error("Conversation load failed:", err);
      }
    })();
  }, [loggedInUserId, toUserId]);

  // ----------------------------
  // 2) SOCKET SETUP (connect + presence)
  // ----------------------------
  useEffect(() => {
    if (!loggedInUserId) return;

    // create socket (keeps your original options)
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      socket.emit("join", loggedInUserId, (ack) => {
        if (ack?.ok) {
          console.log("JOIN OK");
          setSocketReady(true);

          // initial presence check for the current recipient (if any)
          if (toUserId) {
            socket.emit("checkOnline", toUserId, (res) => {
              if (res?.ok) setRecipientOnline(!!res.online);
              else setRecipientOnline(false);
            });
          }
        } else {
          console.warn("JOIN FAILED", ack);
        }
      });
    });

    // presence updates (server emits these)
    const onUserOnline = ({ userId }) => {
      if (!toUserId) return;
      if (userId === toUserId) setRecipientOnline(true);
    };
    const onUserOffline = ({ userId }) => {
      if (!toUserId) return;
      if (userId === toUserId) setRecipientOnline(false);
    };

    socket.on("userOnline", onUserOnline);
    socket.on("userOffline", onUserOffline);

    // receive message from server
    socket.on("receiveMessage", (msg) => {
      console.log("RECEIVED:", msg);

      setMessages((prev) => {
        if (prev.some((p) => String(p.id) === String(msg.id))) return prev;

        return [
          ...prev,
          {
            id: msg.id,
            text: msg.text,
            fromSelf: msg.from === loggedInUserId,
            time: msg.time,
          },
        ];
      });
    });

    // confirmation message for my sends
    socket.on("messageSent", (msg) => {
      setMessages((prev) => {
        if (prev.some((p) => String(p.id) === String(msg.id))) return prev;

        return [
          ...prev,
          {
            id: msg.id,
            text: msg.text,
            fromSelf: true,
            time: msg.time,
          },
        ];
      });
    });

    // cleanup all listeners and disconnect
    return () => {
      if (!socket) return;
      socket.off("connect");
      socket.off("userOnline", onUserOnline);
      socket.off("userOffline", onUserOffline);
      socket.off("receiveMessage");
      socket.off("messageSent");
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUserId]);

  // ----------------------------
  // 2b) RE-CHECK PRESENCE WHEN toUserId CHANGES
  // ----------------------------
  useEffect(() => {
    // update displayed name if route passed one
    if (passedName) setToUserName(passedName);

    // reset to unknown while checking
    setRecipientOnline(null);

    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      // will be checked when socket connects
      return;
    }

    // ask server whether recipient is online
    socket.emit("checkOnline", toUserId, (res) => {
      if (res?.ok) setRecipientOnline(!!res.online);
      else setRecipientOnline(false);
    });
  }, [toUserId, passedName]);

  // ----------------------------
  // 3) SEND MESSAGE
  // ----------------------------
  const sendMessage = () => {
    if (!input.trim()) return;
    if (!loggedInUserId) return;

    const payload = {
      from: "me",
      to: toUserId,
      text: input.trim(),
      meta: {},
    };

    // optimistic
    const optimistic = {
      id: `optim-${Date.now()}`,
      text: payload.text,
      fromSelf: true,
      time: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    const socket = socketRef.current;

    if (socket && socket.connected && socketReady) {
      socket.emit("sendMessage", payload, (ack) => {
        if (!ack?.ok) {
          console.warn("Socket failed → using REST");
          sendMessageRest(payload);
        }
      });
    } else {
      console.warn("Socket not ready → REST fallback");
      sendMessageRest(payload);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ----------------------------
  // 4) UI RENDER
  // ----------------------------
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 pt-2 bg-base-content">
      {!loggedInUserId ? (
        <div className="text-white">Loading...</div>
      ) : (
        <div className="w-full max-w-2xl bg-base-content rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
          {/* HEADER */}
          <div className="flex items-center gap-3 p-3 border-b border-gray-700 text-white">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-ghost btn-circle btn-sm">
              ←
            </button>

            <img
              src={`https://api.dicebear.com/6.x/identicon/svg?seed=${toUserId}`}
              className="w-10 h-10 rounded-full border border-gray-600"
            />

            <div>
              <div className="font-semibold">{toUserName || "User"}</div>
              <div className="text-sm text-gray-400">
                {recipientOnline === null
                  ? socketReady
                    ? "Checking…"
                    : "Connecting…"
                  : recipientOnline
                  ? "Online"
                  : "Offline"}
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="p-4 h-[50vh] overflow-auto space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.fromSelf ? "justify-end" : "justify-start"
                }`}>
                <div
                  className={`max-w-[70%] p-3 rounded-xl ${
                    msg.fromSelf
                      ? "bg-primary text-white"
                      : "bg-neutral text-gray-200"
                  }`}>
                  <div>{msg.text}</div>
                  <div className="text-[11px] mt-1 opacity-70 text-right">
                    {formatTime(msg.time)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-3 border-t border-gray-700">
            <div className="flex gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message"
                className="w-full resize-none rounded-lg p-2 bg-base-content border border-gray-700 text-white"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="btn btn-primary">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
