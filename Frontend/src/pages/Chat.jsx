import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

export default function Chat({ user, onLogout }) {
  if (!user) return <h3>Loading user...</h3>; 

  const [users, setUsers] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    socket.emit("join", user.id);

    // fetch all users
    axios.get("http://localhost:5000/api/users").then((res) => {
      setUsers(res.data.filter((u) => u.id !== user.id));
    });

    socket.on("receiveMessage", (msg) => {
      if (
        (msg.user_id === user.id && msg.receiver_id === receiver?.id) ||
        (msg.user_id === receiver?.id && msg.receiver_id === user.id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [user, receiver]);

  const openChat = async (u) => {
    setReceiver(u);
    const res = await axios.get(`http://localhost:5000/api/messages/${user.id}/${u.id}`);
    setMessages(res.data);
  };

  const sendMessage = () => {
    if (!text.trim() || !receiver) return;
    socket.emit("sendMessage", { senderId: user.id, receiverId: receiver.id, text });
    setText("");
  };

  return (
    <div style={{ display: "flex", padding: "2rem", height: "100vh",}}>
      {/* User list */}
      <div style={{ width: "250px", borderRight: "1px solid gray" }}>
        <h3>Users</h3>
        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => openChat(u)}
            style={{
              padding: "8px",
              cursor: "pointer",
              background: receiver?.id === u.id ? "#181818" : "transparent",
            }}
          >
            {u.username}
          </div>
        ))}
      </div>

      {/* Chat window */}
      <div style={{ flex: 1, padding: "1rem", width: "500px" }}>
        {receiver ? (
          <>
            <h3>Chating with {receiver.username}</h3>
            <button onClick={onLogout} style={{backgroundColor:"red",marginBottom:"7px"}}>Logout</button>
            <div
              style={{
                height: "500px",
                overflowY: "auto",
                border: "1px solid #ccc",
                marginBottom: "1rem",
                padding: "1rem",
              }}
            >
              {messages.map((m, i) => (
                <p
                  key={i}
                  style={{
                    textAlign: m.user_id === user.id ? "right" : "left",
                    background: m.user_id === user.id ? "#03346E" : "#007AFF",
                    padding: "6px",
                    borderRadius: "6px",
                    margin: "4px 0",
                    color: m.user_id === user.id ? "#FFFFFF" : " #DCDDDE",
                  }}
                >
                  {m.text}
                </p>
              ))}
            </div>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type message..."
              style={{ width: "80%", height:"5%", marginRight: "1rem" }}
            />
            <button 
            onClick={sendMessage}
            style={{height:"6%"}}
            >Send</button>
          </>
        ) : (
          <h4>Select a user to chat</h4>
        )}
      </div>
      
    </div>
  );
}
