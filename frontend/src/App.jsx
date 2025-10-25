import React from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import { Routes, Route } from "react-router-dom";
import AddTask from "./components/AddTask";

import "./App.css";
const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/add-task" element={<AddTask />} />
      </Routes>
    </>
  );
};

export default App;
