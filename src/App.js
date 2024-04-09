import { useState,useEffect } from "react";
import "./App.css";
import Logig from "./Page/Login";
import Signup from "./Page/Signup";
import { auth } from "./FirebaseConfig";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Page/Home";
import Test from "./Page/Test";

function App() {
  const [user, setUser] = useState();
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  });
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/profile" /> : <Logig />}
          />
          
          <Route path="/login" element={<Logig />} />
          <Route path="/test" element={<Test user={user} />} /> 
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={user ? <Home /> : <Logig />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
