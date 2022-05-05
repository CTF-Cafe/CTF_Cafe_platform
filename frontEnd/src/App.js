import "./css/bootstrap4-neon-glow.css";
import "./css/main.css";
import { Outlet, Routes, Route, Link } from "react-router-dom";
import Index from "./components/Index.js";
import FourOFour from "./components/FourOFour.js";
import Rules from "./components/Rules.js";
import Hackerboard from "./components/Hackerboard.js";
import Login from "./components/Login.js";
import Logout from "./components/Logout.js";
import Register from "./components/Register.js";
import Challenges from "./components/Challenges.js";
import Admin from "./components//Admin/Admin.js";
import Team from "./components/Team.js";
import User from "./components/User.js";
import { useState, useEffect, useLayoutEffect } from "react";
import { useAlert } from "react-alert";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Objects
import AppContext from "./components/Data/AppContext";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState(false);
  const [theme, setTheme] = useState({});
  const [rules, setRules] = useState([]);
  const alert = useAlert();
  const navigate = useNavigate();

  const globalData = {
    loggedIn: loggedIn,
    userData: userData,
    theme: theme,
    rules: rules,
    setTheme,
    setLoggedIn,
    setUserData,
    alert,
    navigate,
  };

  const getRules = () => {
    axios
      .get(process.env.REACT_APP_SERVER_URI + "/api/getRules")
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          setRules(response.data);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useLayoutEffect(() => {
    const root = document.documentElement;
    axios
      .get(process.env.REACT_APP_SERVER_URI + "/api/getTheme")
      .then((res) => {
        root.style.setProperty(
          "--color-1",
          res.data.theme.color_1 ? res.data.theme.color_1 : "#ff3c5c"
        );
        root.style.setProperty(
          "--color-2",
          res.data.theme.color_2 ? res.data.theme.color_2 : "#ff707f"
        );
        root.style.setProperty(
          "--color-1-50",
          res.data.theme.color_1 ? res.data.theme.color_1 + "50" : "#ff707f50"
        );
        root.style.setProperty(
          "--bg-img",
          res.data.theme.bg_img ? `url(${res.data.theme.bg_img})` : "none"
        );

        setTheme(res.data.theme);
      })
      .catch((err) => {
        console.error(err);
      });
    getRules();
  }, []);

  useEffect(() => {
    if (!loggedIn) {
      axios
        .post(process.env.REACT_APP_SERVER_URI + "/api/checkSession")
        .then((res) => {
          if (res.data.state == "success") {
            alert.success("Logged In!");

            if (res.data.team) {
              res.data.user.team = res.data.team;
            }

            if (res.data.message) {
              alert.info("Admin Message: " + res.data.message, {
                timeout: 5000,
              });
            }

            setUserData(res.data.user);
            setLoggedIn(true);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  return (
    <AppContext.Provider value={globalData}>
      <div>
        <div id="main">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/hackerboard" element={<Hackerboard />} />
            <Route path="/user/*" element={<User />} />
            {userData.isAdmin && loggedIn ? (
              <Route path="/admin/*" element={<Admin />} />
            ) : null}
            {loggedIn ? (
              <>
                <Route path="/challenges" element={<Challenges />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/team" element={<Team />} />
              </>
            ) : (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </>
            )}
            <Route path="/*" element={<FourOFour />} />
          </Routes>
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
