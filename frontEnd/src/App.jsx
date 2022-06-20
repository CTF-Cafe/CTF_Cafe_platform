import "./css/bootstrap4-neon-glow.css";
import "./css/main.css";
import "./css/prism.css";
import { Outlet, Routes, Route, Link } from "react-router-dom";
import Index from "./components/Index";
import FourOFour from "./components/FourOFour";
import Rules from "./components/Rules";
import Hackerboard from "./components/Hackerboard";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Register from "./components/Register";
import Challenges from "./components/Challenges";
import Admin from "./components//Admin/Admin";
import Team from "./components/Team";
import UserTeam from "./components/UserTeam";
import User from "./components/User";
import UserSettings from "./components/UserSettings";
import { useState, useEffect, useLayoutEffect } from "react";
import { useAlert, positions } from "@blaumaus/react-alert";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Objects
import AppContext from "./components/Data/AppContext";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState(false);
  const [theme, setTheme] = useState({});
  const [rules, setRules] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const alert = useAlert();
  const navigate = useNavigate();

  const globalData = {
    loggedIn: loggedIn,
    userData: userData,
    theme: theme,
    rules: rules,
    sponsors: sponsors,
    setTheme,
    setLoggedIn,
    setUserData,
    alert,
    navigate,
  };

  const getConfigs = () => {
    axios
      .get(process.env.REACT_APP_SERVER_URI + "/api/getConfigs")
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          response.data.forEach((config) => {
            switch (config.name) {
              case "rules":
                setRules(config.value)
                break;
              case 'sponsors':
                setSponsors(config.value)
                break;
              default:
                break;
            }
          })
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const getGlobalMessage = () => {
    axios
      .get(process.env.REACT_APP_SERVER_URI + "/api/user/getGlobalMessage", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.message && response.data.state == "success") {
          alert.info("Admin Message: " + response.data.message, {
            timeout: 5000,
            position: positions.TOP_CENTER,
          });
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
    getConfigs();
    getGlobalMessage();
  }, []);

  useEffect(() => {
    if (!loggedIn) {
      axios
        .get(process.env.REACT_APP_SERVER_URI + "/api/checkSession", {
          withCredentials: true,
        })
        .then((res) => {
          if (res.data.state == "success") {
            alert.success("Logged In!");

            if (res.data.team) {
              res.data.user.team = res.data.team;
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
            <Route path="/team/*" element={<Team />} />
            {userData.isAdmin && loggedIn ? (
              <Route path="/admin/*" element={<Admin />} />
            ) : null}
            {loggedIn ? (
              <>
                <Route path="/challenges" element={<Challenges />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/userteam" element={<UserTeam />} />
                <Route path="/usersettings" element={<UserSettings />} />
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
