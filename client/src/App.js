import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home.js";
import Login from "./Login.js";
import Register from "./Register.js"
import MyStudySets from "./MyStudySets.js"
import Navbar from "./Navbar.js"
import CreateStudySet from "./CreateStudySet.js"
import ProtectedRoutes from "./protected_routes.js";

function App() {
  return (
    <Router>
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route element={<ProtectedRoutes />}>
          <Route path="/my-study-sets" element={<MyStudySets />}></Route>
          <Route path="/my-study-sets/study-set/*" element={<MyStudySets />}></Route>
          <Route path="/create-study-set" element={<CreateStudySet />}></Route>
        </Route>
      </Routes>
    </div>
    </Router>
  );
}

export default App;
