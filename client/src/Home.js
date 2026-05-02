import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Enter Room ID</h2>

      <input
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="Enter room name"
      />

      <button onClick={() => navigate("/room/" + room)}>
        Join
      </button>
    </div>
  );
}

export default Home;