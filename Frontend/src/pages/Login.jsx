import { useState } from "react";
import axios from "axios";

export default function Login({ setToken, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));  // ✅ store user
      setToken(res.data.token);
      setUser(res.data.user); // ✅ update state
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div>
      <h3 style={{fontSize:"30px"}}>Login</h3>
      <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{width:"250px", marginBottom:"7px",height:"25px"}} /><br />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{width:"250px",marginBottom:"15px",height:"25px"}} /><br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
