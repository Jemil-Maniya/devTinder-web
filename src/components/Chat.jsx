// File: src/components/Chat.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchConversation, sendMessageRest } from "../api/message";
import {
  initSocket,
  connectSocket,
  on as socketOn,
  off as socketOff,
  sendMessage as socketSendMessage,
  checkOnline as socketCheckOnline,
  disconnectSocket,
  getSocket,
} from "../utils/socket";

const Chat = () => {
  const { toUserId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedName = location.state?.name || "";

  const loggedInUser = useSelector((s) => s.user.user);
  const loggedInUserId = loggedInUser?._id;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socketReady, setSocketReady] = useState(false);
  const [toUserName, setToUserName] = useState(passedName);
  const [recipientOnline, setRecipientOnline] = useState(null);

  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const mergeServerMessage = (serverMsg) => {
    setMessages((prev) => {
      if (prev.some((p) => String(p.id) === String(serverMsg.id))) return prev;

      if (serverMsg.clientId) {
        const idx = prev.findIndex(
          (p) => String(p.id) === String(serverMsg.clientId)
        );
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = {
            id: serverMsg.id,
            text: serverMsg.text,
            fromSelf: serverMsg.from === loggedInUserId || prev[idx].fromSelf,
            time: serverMsg.time || new Date().toISOString(),
          };
          return copy;
        }
      }

      const now = Date.now();
      const heurIdx = prev.findIndex((p) => {
        if (!p._optimistic) return false;
        if (p.text !== serverMsg.text) return false;
        const maybeTs = String(p.id).startsWith("optim-")
          ? Number(String(p.id).split("optim-")[1])
          : null;
        return maybeTs ? Math.abs(now - maybeTs) < 10000 : true;
      });

      if (heurIdx !== -1) {
        const copy = [...prev];
        copy[heurIdx] = {
          id: serverMsg.id,
          text: serverMsg.text,
          fromSelf: serverMsg.from === loggedInUserId || prev[heurIdx].fromSelf,
          time: serverMsg.time || new Date().toISOString(),
        };
        return copy;
      }

      return [
        ...prev,
        {
          id: serverMsg.id,
          text: serverMsg.text,
          fromSelf: serverMsg.from === loggedInUserId,
          time: serverMsg.time || new Date().toISOString(),
        },
      ];
    });
  };

  useEffect(() => {
    if (!loggedInUserId) return;

    initSocket();

    const removeConnectListener = connectSocket(loggedInUserId, (ack) => {
      if (ack?.ok) {
        setSocketReady(true);
        if (toUserId) {
          socketCheckOnline(toUserId, (res) => {
            setRecipientOnline(!!res?.online);
          });
        }
      } else {
        console.warn("JOIN FAILED", ack);
      }
    });

    const onUserOnline = ({ userId }) => {
      if (userId === toUserId) setRecipientOnline(true);
    };
    const onUserOffline = ({ userId }) => {
      if (userId === toUserId) setRecipientOnline(false);
    };
    const onReceiveMessage = (msg) => mergeServerMessage(msg);
    const onMessageSent = (msg) => mergeServerMessage(msg);

    socketOn("userOnline", onUserOnline);
    socketOn("userOffline", onUserOffline);
    socketOn("receiveMessage", onReceiveMessage);
    socketOn("messageSent", onMessageSent);

    return () => {
      if (typeof removeConnectListener === "function") removeConnectListener();
      socketOff("userOnline", onUserOnline);
      socketOff("userOffline", onUserOffline);
      socketOff("receiveMessage", onReceiveMessage);
      socketOff("messageSent", onMessageSent);
      disconnectSocket();
    };
  }, [loggedInUserId, toUserId]); // include toUserId so presence check runs if it changes

  useEffect(() => {
    if (passedName) setToUserName(passedName);
    setRecipientOnline(null);
    const socket = getSocket();
    if (!socket || !socket.connected) return;
    socketCheckOnline(toUserId, (res) => setRecipientOnline(!!res?.online));
  }, [toUserId, passedName]);

  const sendMessage = () => {
    if (!input.trim() || !loggedInUserId) return;
    const text = input.trim();
    const clientId = `optim-${Date.now()}`;
    const payload = {
      from: loggedInUser,
      to: toUserId,
      text,
      meta: {},
      clientId,
    };
    const optimistic = {
      id: clientId,
      text,
      fromSelf: true,
      time: new Date().toISOString(),
      _optimistic: true,
    };

    setMessages((p) => [...p, optimistic]);
    setInput("");

    const socket = getSocket();
    if (socket && socket.connected && socketReady) {
      socketSendMessage(payload, (ack) => {
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

  const formatTime = (iso) =>
    iso
      ? new Date(iso).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 pt-2 bg-base-content">
      {!loggedInUserId ? (
        <div className="text-white">Loading...</div>
      ) : (
        <div className="w-full max-w-2xl bg-base-content rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
          <div className="flex items-center gap-3 p-3 border-b border-gray-700 text-white">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-ghost btn-circle btn-sm">
              ←
            </button>
            <img
              src={`https://api.dicebear.com/6.x/identicon/svg?seed=${toUserId}`}
              className="w-10 h-10 rounded-full border border-gray-600"
              alt="avatar"
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
