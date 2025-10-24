import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/api/register", { username, email, password });
      alert("Registered successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div>
      <h3 style={{fontSize:"30px"}}>Register</h3>
      <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{width:"250px",marginBottom:"7px",height:"25px"}} /><br />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{width:"250px", marginBottom:"7px",height:"25px"}}/><br />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{width:"250px",marginBottom:"15px",height:"25px" }} /><br />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
