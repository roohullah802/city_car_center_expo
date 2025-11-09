import { io, Socket } from "socket.io-client";

let socket: Socket;

export const initSocket = (token?: string) => {
  if (!socket) {
    socket = io("https://api.citycarcenters.com", {
      auth: { token },
      transports: ["websocket"],
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error("Socket not initialized");
  return socket;
};
