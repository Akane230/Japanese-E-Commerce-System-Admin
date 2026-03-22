import React from "react";
import "./styles/global.css";
import AppRouter from "./components/layout/AppRouter";
import ToastContainer from "./components/common/ToastContainer";

export default function App() {
  return (
    <>
      <AppRouter />
      <ToastContainer />
    </>
  );
}
