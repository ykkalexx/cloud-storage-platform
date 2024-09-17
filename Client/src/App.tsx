import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import "./index.css";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./Pages/Dashboard";
import { useAuth } from "./hooks/useAuth";
import { initializeSocket } from "./services/websockes";

const App: React.FC = () => {
  const { user, token } = useAuth();

  useEffect(() => {
    if (token) {
      console.log("hit 20");
      initializeSocket(token);
    }
  }, [token]);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
