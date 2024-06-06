import { useEffect, useState } from "react";
import socket from "../services/socket";
import { Link, useNavigate } from "react-router-dom";

export default function App() {
  const [rooms, setRooms] = useState<string[]>([]);
  const navigate = useNavigate();

  const newRoom = () => {
    const roomId = new Date().getTime().toString();
    navigate("/room/" + roomId);
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to the server");
      socket.emit("rooms"); // Request the list of rooms when connected
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from the server");
    });

    socket.on("rooms", (rooms: string[]) => {
      setRooms(rooms);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("rooms");
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col justify-start items-center">
      <div className="w-full py-10 flex flex-col justify-start items-center">
        <h1 className="text-4xl text-center font-semibold text-primary">
          Welcome to the Fight Club
        </h1>
        <p className="text-2xl text-center font-thin text-gray-400">
          Let's fight
        </p>
      </div>

      <div className="w-full py-10 flex flex-col justify-start items-center">
        <button className="btn" onClick={newRoom}>
          New Room
        </button>
      </div>

      <div className="w-full py-10 gap-4 flex flex-col justify-start items-center">
        <h2 className="text-2xl text-center text-gray-400">Join a Room</h2>
        <div className="flex flex-col justify-start items-center px-4 py-6 gap-4 board aspect-[3/2] w-full max-w-[500px]">
          <ul className="overflow-y-auto w-full h-full flex flex-col justify-start items-center">
            {rooms.map((room) => (
              <li key={room} className="cursor-pointer hover:underline">
                <Link to={`/room/${room}`}>{room}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
