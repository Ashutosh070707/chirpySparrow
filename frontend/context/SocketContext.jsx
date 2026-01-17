import { useRecoilValue } from "recoil";
import { loggedInUserAtom } from "../src/atoms/loggedInUserAtom";
import io from "socket.io-client";
import { createContext, useState, useContext, useEffect } from "react";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const user = useRecoilValue(loggedInUserAtom);

  useEffect(() => {
    //for development:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    // const socket = io("http://localhost:5000", {
    //   query: {
    //     userId: user?._id,
    //   },
    // });
    // ---------------------------------------------------------------------------------

    if (!user?._id) return;

    //for deployment:::::::::::::::::::::::::::::::::::::::::::::
    const socket = io("/", {
      query: {
        userId: user?._id,
      },
    });
    // /////////////////////////////////////////////////////////

    setSocket(socket);
    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => socket && socket.close();
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
