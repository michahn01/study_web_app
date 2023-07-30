import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./home.js";
import Login from "./login.js";
import Register from "./register.js"
import MyStudySets from "./mystudysets.js"
import Navbar from "./navbar.js"
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
          <Route path="/create-study-set" element={<CreateStudySet />}></Route>
        </Route>
      </Routes>
    </div>
    </Router>
  );
}

export default App;
