import { SocketState, updateSocketState } from "@/store/connectionSlice";
import { RootState } from "@/store/store";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";

export const SocketContext = createContext<{
  socket?: Socket;
  setSocket?: Dispatch<SetStateAction<Socket | undefined>>;
}>({});

export const SocketProvider = ({ children }: PropsWithChildren) => {
  const [socket, setSocket] = useState<Socket>();
  const dispatch = useDispatch();
  const { ghostpadConfig, socketState } = useSelector((state: RootState) => {
    return {
      ghostpadConfig: state?.config?.ghostpadConfig,
      socketState: state?.connection.socketState,
    };
  }, shallowEqual);

  useEffect(() => {
    const connectSocket = () => {
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
      setSocket(newSocket);
      dispatch(updateSocketState({ socketState: SocketState.DISCONNECTED }));
    };

    if (socketState === SocketState.READY_TO_CONNECT) {
      connectSocket();
    }

    return () => {
      if (socketState === SocketState.READY_TO_CONNECT) socket?.disconnect();
    };
  }, [socket, setSocket, socketState, ghostpadConfig?.host, dispatch]);
  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
