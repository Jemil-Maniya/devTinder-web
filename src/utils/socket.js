// src/utils/socket.js
import { io } from "socket.io-client";

const isDev = window.location.hostname === "localhost";
const DEV_URL = "http://localhost:7777"; // dev backend origin
const PROD_BASE = "http://51.21.248.17"; // production base for socket path

let socket = null;

export function initSocket(options = {}) {
  if (socket) return socket;

  const url = isDev ? DEV_URL : PROD_BASE;

  socket = io(url, {
    path: isDev ? "/socket.io" : "/api/socket.io", // match server path in prod
    withCredentials: true,
    autoConnect: false,
    ...options,
  });

  return socket;
}

export function connectSocket(userId, joinAckCb = () => {}) {
  if (!userId) throw new Error("connectSocket requires userId");
  if (!socket) initSocket();

  socket.connect();

  const onConnect = () => {
    socket.emit("join", userId, (ack) => {
      joinAckCb(ack);
    });
  };

  socket.on("connect", onConnect);

  return () => socket.off("connect", onConnect);
}

export function sendMessage(payload, ackCb) {
  if (!socket || !socket.connected) {
    if (typeof ackCb === "function")
      ackCb({ ok: false, error: "not_connected" });
    return;
  }
  socket.emit("sendMessage", payload, ackCb);
}

export function checkOnline(targetUserId, cb) {
  if (!socket || !socket.connected) {
    if (typeof cb === "function") cb({ ok: false });
    return;
  }
  socket.emit("checkOnline", targetUserId, cb);
}

export function on(event, handler) {
  if (!socket) initSocket();
  socket.on(event, handler);
}

export function off(event, handler) {
  if (!socket || !socket.off) return;
  socket.off(event, handler);
}

export function disconnectSocket() {
  if (!socket) return;
  try {
    socket.disconnect();
  } catch (e) {}
  socket = null;
}

export function getSocket() {
  return socket;
}
