// ...existing code...
import { collection, getDocs } from "firebase/firestore";
import "./RoomList.css";
import { database } from "../auth/config";
import { useEffect, useState } from "react";
import type { RoomData } from "../types/room";
import { Link, useNavigate } from "react-router-dom";
import { MenuBackground } from "../components/MenuBackground";

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
    <MenuBackground>
      <div className="room-list">
        <h1>Join rooms:</h1>
        {rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => navigate(`/online/${room.id}`)}
            className="room-item"
          >
            <span>{room.name}</span>

            <span>{room.password ? "Password" : undefined}</span>
            <p>
              <span>Room id:&nbsp;</span>
              <span>{room.id}</span>
            </p>
          </div>
        ))}{" "}
        <Link to="/" className="pixel-button secondary-button margin-bottom">
          Back to Menu
        </Link>
      </div>
    </MenuBackground>
  );
}
