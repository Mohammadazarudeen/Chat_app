import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  if (!token || !user)
    return (
      <div style={{ padding: "2rem" }}>
        <Login setToken={setToken} setUser={setUser} />
        <Register />
      </div>
    );

  return <Chat user={user} onLogout={handleLogout} />;
}
