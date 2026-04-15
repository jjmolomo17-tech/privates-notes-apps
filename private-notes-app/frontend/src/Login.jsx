import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/auth/login", { email, password }, { withCredentials: true });
    alert("Login successful!");
    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={handleLogin} className="p-4">
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}
