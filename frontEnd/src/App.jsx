/* eslint-disable array-callback-return */
import "./css/bootstrap4-neon-glow.css";
import "./css/main.css";
import "./css/prism.css";
import { Routes, Route } from "react-router-dom";
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
import { useAlert } from "react-alert";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TradeMark from "./components/Global/TradeMark";
import LoadingScreen from "react-loading-screen";

// Objects
import AppContext from "./components/Data/AppContext";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState(false);
  const [theme, setTheme] = useState(
    JSON.parse(localStorage.getItem("theme")) || []
  );
  const [rules, setRules] = useState(
    JSON.parse(localStorage.getItem("rules")) || []
  );
  const [dynamicScoring, setDynamicScoring] = useState(
    JSON.parse(localStorage.getItem("dynamicScoring")) || false
  );
  const [socialLinks, setSocialLinks] = useState(
    JSON.parse(localStorage.getItem("socialLinks")) || []
  );
  const [tags, setTags] = useState(
    JSON.parse(localStorage.getItem("tags")) || []
  );
  const [tagColors, setTagColors] = useState(
    JSON.parse(localStorage.getItem("tagColors")) || []
  );
  const [sponsors, setSponsors] = useState(
    JSON.parse(localStorage.getItem("sponsors")) || []
  );
  const [endTime, setEndTime] = useState(
    JSON.parse(localStorage.getItem("endTime")) || 0
  );
  const [startTime, setStartTime] = useState(
    JSON.parse(localStorage.getItem("startTime")) || 0
  );
  const alert = useAlert();
  const [notifications, setNotifications] = useState(
    JSON.parse(localStorage.getItem("notifications")) || []
  );
  const [userCategories, setUserCategories] = useState(
    JSON.parse(localStorage.getItem("userCategories")) || []
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const globalData = {
    loggedIn: loggedIn,
    userData: userData,
    theme: theme,
    rules: rules,
    notifications: notifications,
    dynamicScoring: dynamicScoring,
    socialLinks: socialLinks,
    tags: tags,
    tagColors: tagColors,
    sponsors: sponsors,
    startTime: startTime,
    endTime: endTime,
    userCategories: userCategories,
    setNotifications,
    setTheme,
    setLoggedIn,
    setUserData,
    alert,
    navigate,
  };

  const getConfigs = () => {
    axios
      .get(process.env.REACT_APP_BACKEND_URI + "/api/getConfigs")
      .then((response) => {
        if (response.data.state === "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          response.data.forEach((config) => {
            switch (config.name) {
              case "rules":
                localStorage.setItem("rules", JSON.stringify(config.value));
                setRules(config.value);
                break;
              case "sponsors":
                localStorage.setItem("sponsors", JSON.stringify(config.value));
                setSponsors(config.value);
                break;
              case "dynamicScoring":
                localStorage.setItem(
                  "dynamicScoring",
                  JSON.stringify(config.value)
                );
                setDynamicScoring(config.value);
                break;
              case "socialLinks":
                localStorage.setItem(
                  "socialLinks",
                  JSON.stringify(config.value)
                );
                setSocialLinks(config.value);
                break;
              case "tags":
                localStorage.setItem(
                  "tags",
                  JSON.stringify(config.value)
                );
                setTags(config.value);
                break;
              case "tagColors":
                localStorage.setItem(
                  "tagColors",
                  JSON.stringify(config.value)
                );
                setTagColors(config.value);
                break;
              case "startTime":
                localStorage.setItem("startTime", JSON.stringify(config.value));
                setStartTime(parseInt(config.value));
                break;
              case "endTime":
                localStorage.setItem("endTime", JSON.stringify(config.value));
                setEndTime(parseInt(config.value));
                break;
              case "userCategories":
                localStorage.setItem("userCategories", JSON.stringify(config.value));
                setUserCategories(config.value);
                break;
              default:
                break;
            }
          });
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const getNotifications = () => {
    axios
      .get(process.env.REACT_APP_BACKEND_URI + "/api/user/getNotifications", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.state === "success") {
          setNotifications([...notifications, ...response.data.notifications]);
          localStorage.setItem(
            "notifications",
            JSON.stringify([...notifications, ...response.data.notifications])
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useLayoutEffect(() => {
    const root = document.documentElement;
    axios
      .get(process.env.REACT_APP_BACKEND_URI + "/api/getTheme")
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
          res.data.theme.bg_img.trim().length > 0
            ? `url(${res.data.theme.bg_img})`
            : "none"
        );

        setTheme(res.data.theme);
      })
      .catch((err) => {
        console.error(err);
      });
    getConfigs();
    getNotifications();
  }, []);

  useEffect(() => {
    if (!loggedIn) {
      axios
        .get(process.env.REACT_APP_BACKEND_URI + "/api/checkSession", {
          withCredentials: true,
        })
        .then((res) => {
          if (res.data.state === "success") {
            alert.success("Logged In!");

            if (res.data.team) {
              const clubArray = (arr) => {
                return arr.reduce((acc, val, ind) => {
                  const index = acc.findIndex(
                    (el) => el.username === val.username
                  );
                  if (index !== -1) {
                    acc[index].solved.push(val.solved[0]);
                    acc[index].score += val.score;
                  } else {
                    acc.push(val);
                  }
                  return acc;
                }, []);
              };

              res.data.team.users = clubArray(res.data.team.users);

              res.data.team.users.forEach((user) => {
                user.solved.forEach((solved) => {
                  user.score += solved.points;
                });
              });

              res.data.user.team = res.data.team;
            }

            setUserData(res.data.user);
            setLoggedIn(true);
          }
          setLoading(false);
        })
        .catch(console.log);
    }
  }, []);

  return (
    <AppContext.Provider value={globalData}>
      {loading !== undefined && (
        <LoadingScreen
          loading={loading}
          bgColor="#0c0d16"
          spinnerColor="#ef121b"
        />
      )}
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
          <TradeMark />
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
