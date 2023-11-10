import { SocketState, updateSocketState } from "@/store/connectionSlice";
import { RootState } from "@/store/store";
import {
  createContext,
  PropsWithChildren,
  useEffect,
  useRef,
} from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";

export const SocketContext = createContext<{
  socket?: Socket;
}>({});

export const SocketProvider = ({ children }: PropsWithChildren) => {
  const socket = useRef<Socket>();
  const dispatch = useDispatch();
  const { ghostpadConfig, socketState } = useSelector((state: RootState) => {
    return {
      ghostpadConfig: state?.config?.ghostpadConfig,
      socketState: state?.connection.socketState,
    };
  }, shallowEqual);
  useEffect(() => {
    return () => {
      if (socket.current?.connected) {
        socket.current?.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const connectSocket = () => {
      dispatch(updateSocketState({ socketState: SocketState.DISCONNECTED }));
      const newSocket = io(ghostpadConfig?.host || window.location.host, {
        transports: ["polling", "websocket"],
        closeOnBeforeunload: false,
        query: { ui: "2" },
      });
      newSocket.on("disconnect", () => {
        dispatch(updateSocketState({ socketState: SocketState.DISCONNECTED }));
      });
      newSocket.on("connect", () => {
        dispatch(updateSocketState({ socketState: SocketState.CONNECTED }));
      });
      socket.current = newSocket;
    };

    if (socketState === SocketState.READY_TO_CONNECT) {
      connectSocket();
    }
  }, [socketState, ghostpadConfig?.host, dispatch]);
  return (
    <SocketContext.Provider value={{ socket: socket?.current }}>
      {children}
    </SocketContext.Provider>
  );
};
