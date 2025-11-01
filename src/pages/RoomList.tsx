// ...existing code...
import { collection, getDocs } from "firebase/firestore";
import "./RoomList.css";
import { database } from "../auth/config";
import { useEffect, useState } from "react";
import type { RoomData } from "../types/room";
import { useNavigate } from "react-router-dom";

export function RoomList() {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      const colRef = collection(database, "rooms");
      const snap = await getDocs(colRef);
      const roomsData: RoomData[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setRooms(roomsData);
      console.log("fetched rooms:", roomsData);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    }
  }

  return (
    <div>
      Room List Page - Coming Soon!
      {rooms.map((room) => (
        <div key={room.id} onClick={() => navigate(`/online/${room.id}`)}>
          {room.name}
        </div>
      ))}
    </div>
  );
}
