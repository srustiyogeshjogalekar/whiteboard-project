import React, { useRef, useEffect, useState } from "react";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

// 🏠 HOME PAGE
function Home() {
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    navigate("/room/" + randomId);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Join Whiteboard</h2>

      <input
        placeholder="Enter Room ID"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />

      <br /><br />

      <button onClick={() => navigate("/room/" + room)}>Join</button>
      <button onClick={createRoom} style={{ marginLeft: "10px" }}>
        Create Room
      </button>
    </div>
  );
}

// 🎨 WHITEBOARD
function Whiteboard() {
  const { roomId } = useParams();

  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const socketRef = useRef(null);

  const [color, setColor] = useState("#000000");
  const [tool, setTool] = useState("pen");
  const [brushSize, setBrushSize] = useState(2);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // 🔌 SOCKET
  useEffect(() => {
    socketRef.current = io("http://localhost:5006", {
      query: { room: roomId },
    });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    socketRef.current.on("draw", (data) => {
      drawLine(ctx, data);
    });

    socketRef.current.on("clear", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    socketRef.current.on("chat", (msg) => {
      setMessages((prev) => [...prev, "User: " + msg]);
    });

    return () => socketRef.current.disconnect();
  }, [roomId]);

  // 🖊 DRAW CONTROL
  const startDrawing = () => (drawing.current = true);

  const stopDrawing = () => {
    drawing.current = false;
    canvasRef.current.getContext("2d").beginPath();
  };

  const draw = (e) => {
    if (!drawing.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const data = { x, y, color, tool, size: brushSize };

    drawLine(canvasRef.current.getContext("2d"), data);
    socketRef.current.emit("draw", data);
  };

  const drawLine = (ctx, { x, y, color, tool, size }) => {
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    }

    ctx.lineWidth = size;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // 🧹 CLEAR
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    socketRef.current.emit("clear");
  };

  // 💾 DOWNLOAD
  const downloadImage = () => {
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  // 🔗 COPY LINK
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
  };

  // 💬 CHAT
  const sendMessage = () => {
    if (message.trim() === "") return;

    socketRef.current.emit("chat", message);
    setMessages((prev) => [...prev, "Me: " + message]);
    setMessage("");
  };

  // 📱 TOUCH
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    draw({ clientX: touch.clientX, clientY: touch.clientY });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Room: {roomId}</h3>

      {/* TOOLS */}
      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      <button onClick={() => setTool("pen")}>Pen</button>
      <button onClick={() => setTool("eraser")}>Eraser</button>

      <div>
        Size: {brushSize}
        <input
          type="range"
          min="1"
          max="30"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
        />
      </div>

      {/* ACTIONS */}
      <button onClick={clearCanvas}>Clear</button>
      <button onClick={downloadImage}>Download</button>
      <button onClick={copyLink}>Copy Link</button>

      <br /><br />

      {/* CANVAS */}
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{ border: "2px solid black" }}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={handleTouchMove}
      />

      {/* CHAT */}
      <div style={{ marginTop: "20px" }}>
        <h4>Chat</h4>

        <div style={{ height: "120px", overflowY: "scroll", border: "1px solid gray" }}>
          {messages.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

// 🔀 ROUTES
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomId" element={<Whiteboard />} />
    </Routes>
  );
}

export default App;