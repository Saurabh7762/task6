import { useState, useEffect } from "react";
import Logig from "./Page/Login";
import Signup from "./Page/Signup";
import { auth } from "./FirebaseConfig";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Page/Components/Home";
import Test from "./Page/Components/Test";

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
            element={<Navigate to={user ? "/to-do-list" : "/login"} />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/to-do-list" /> : <Logig />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/to-do-list" /> : <Signup />}
          />
          <Route
            path="/profile"
            element={user ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/to-do-list"
            element={user ? <Test user={user} /> : <Navigate to="/login" />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
