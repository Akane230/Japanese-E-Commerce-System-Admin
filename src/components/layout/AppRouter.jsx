import React from "react";
import useAuthStore from "../../stores/authStore";
import LoginScreen from "../pages/LoginScreen";
import Shell from "./Shell";

export default function AppRouter() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (!isAuthenticated) return <LoginScreen />;
  return <Shell />;
}
