import React, { useState } from "react";
import useAuthStore from "../../stores/authStore";
import useToastStore from "../../stores/toastStore";
import Spinner from "../common/Spinner";

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const addToast = useToastStore((state) => state.addToast);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      addToast("Login successful!", "success");
    } catch (err) {
      setError(err.message || "Login failed.");
      addToast(err.message || "Login failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">さくらShop</div>
        <div className="login-sub">Admin Console</div>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sakurashop.jp"
              required
              autoFocus
            />
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            className="topbar-btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "10px" }}
            disabled={loading}
          >
            {loading ? <Spinner /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
