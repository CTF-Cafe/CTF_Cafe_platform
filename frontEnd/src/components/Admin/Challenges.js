import { Outlet, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AppContext from "../Data/AppContext";
import ChallengeCard from "./components/ChallengeCard.js";

function Challenges(props) {
  const globalData = useContext(AppContext);
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [categories, setCategories] = useState([
    "crypto",
    "web",
    "osint",
    "steganography",
    "forensics",
    "pwn",
    "misc",
  ]);
  const [assets, setAssets] = useState([]);

  const getChallenges = () => {
    axios
      .get(process.env.REACT_APP_SERVER_URI + "/api/admin/getAssets", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          setAssets(response.data);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });

    axios
      .post(
        process.env.REACT_APP_SERVER_URI + "/api/admin/getStats",
        {
          name: "challenges&categories",
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          response.data.challenges.sort((a, b) => {
            if (a.level < b.level) {
              return -1;
            }

            if (a.level > b.level) {
              return 1;
            }

            return 0;
          });

          response.data.categories.sort((a, b) => {
            if (a == "misc") {
              return 1;
            }

            if (b == "misc") {
              return -1;
            }

            return 0;
          });
          setChallenges(response.data.challenges);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    getChallenges();
  }, []);

  const saveChallenge = (oldChallenge) => {
    const name = document.getElementById("name" + oldChallenge._id).textContent;
    const points = document.getElementById(
      "points" + oldChallenge._id
    ).textContent;
    const level = document.getElementById("level" + oldChallenge._id).value;
    const info = document.getElementById("info" + oldChallenge._id).textContent;
    const hint = document.getElementById("hint" + oldChallenge._id).textContent;
    const file = document.getElementById("file" + oldChallenge._id).value;
    const codeSnippet = document.getElementById("code_snippet" + oldChallenge._id).textContent;
    const codeLanguage = document.getElementById("code_language" + oldChallenge._id).value;

    const flag = document.getElementById("flag" + oldChallenge._id).textContent;

    axios
      .post(
        process.env.REACT_APP_SERVER_URI + "/api/admin/saveChallenge",
        {
          id: oldChallenge._id,
          name: name,
          points: points,
          level: level,
          info: info,
          hint: hint,
          file: file,
          flag: flag,
          codeSnippet: codeSnippet,
          codeLanguage: codeLanguage
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          if (response.data.state == "success") {
            globalData.alert.success("Challenge updated!");
            getChallenges();
          } else {
            globalData.alert.error(response.data.message);
          }
        }
      })
      .catch((error) => console.log(error.message));
  };

  const deleteChallenge = (e, oldChallenge) => {
    axios
      .post(
        process.env.REACT_APP_SERVER_URI + "/api/admin/deleteChallenge",
        {
          id: oldChallenge._id,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          if (response.data.state == "success") {
            globalData.alert.success("Challenge deleted!");
            getChallenges();
          } else {
            globalData.alert.error(response.data.message);
          }
        }
      })
      .catch((error) => console.log(error.message));
  };

  const capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const allowDrop = function (ev) {
    ev.preventDefault();
  };

  const drag = function (ev) {
    ev.dataTransfer.setData("text", ev.target.id);
  };

  const drop = function (ev) {
    ev.preventDefault();

    var data = ev.dataTransfer.getData("text");

    const challenge = document.getElementById(data).closest(".top");
    const oldCategory = challenge.closest(".row");
    let challenge2 = "";
    let newCategory = "";

    if (!ev.target.classList.value.includes("row")) {
      newCategory = ev.target.closest(".row");

      challenge2 = challenge.cloneNode();
      challenge2.display = "none";

      newCategory.appendChild(challenge2);
    } else {
      newCategory = ev.target;

      challenge2 = challenge.cloneNode();
      challenge2.display = "none";

      newCategory.appendChild(challenge2);
    }

    if (newCategory.children[0].id != oldCategory.children[0].id) {
      axios
        .post(
          process.env.REACT_APP_SERVER_URI +
            "/api/admin/updateChallengeCategory",
          {
            id: challenge.id.replace("challenge-top", ""),
            category: newCategory.children[0].id,
          },
          { withCredentials: true }
        )
        .then((response) => {
          if (response.data.state == "sessionError") {
            globalData.alert.error("Session expired!");
            globalData.setUserData({});
            globalData.setLoggedIn(false);
            globalData.navigate("/", { replace: true });
          } else {
            if (response.data.state == "success") {
              globalData.alert.success(response.data.message);
              getChallenges();
              challenge2.remove();
            } else {
              globalData.alert.error(response.data.message);
              challenge2.remove();
            }
          }
        })
        .catch((error) => console.log(error.message));
    }
  };

  const createChallenge = (e, category) => {
    e.preventDefault();
    axios
      .post(
        process.env.REACT_APP_SERVER_URI + "/api/admin/createChallenge",
        {
          name: "Challenge",
          points: 100,
          level: 0,
          info: "I am a challenge!",
          hint: "Easy Peasy Lemon Squeezy!",
          file: "",
          flag: "FLAG{H3LL0_W0RLD}",
          category: category,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          if (response.data.state == "success") {
            globalData.alert.success("Challenge created!");
            getChallenges();
          } else {
            globalData.alert.error(response.data.message);
          }
        }
      })
      .catch((error) => console.log(error.message));
  };

  const setAction = (action) => {
    props.setAction(action);
  };

  return (
    <div>
      <h1
        className="display-1 bold color_white"
        style={{ textAlign: "center", marginBottom: "50px" }}
      >
        CHALLENGES{" "}
      </h1>{" "}
      {categories.map((category, index) => {
        return (
          <div
            className="row hackerFont"
            key={category}
            onDrop={drop}
            onDragOver={allowDrop}
          >
            <div
              className="col-md-12"
              id={category}
              style={{ marginBottom: "10px" }}
            >
              <h4 style={{ display: "inline-block" }}>
                {" "}
                {capitalize(category)}{" "}
              </h4>{" "}
              <a
                href="#"
                className="btn btn-outline-danger btn-shadow"
                onClick={(e) => {
                  createChallenge(e, category);
                }}
              >
                <span className="fa fa-plus"> </span>{" "}
              </a>{" "}
            </div>
            {challenges.map((challenge, index) => {
              if (challenge.category === category) {
                return (
                  <ChallengeCard
                    challenge={challenge}
                    drag={drag}
                    saveChallenge={saveChallenge}
                    deleteChallenge={deleteChallenge}
                    key={challenge._id}
                    assets={assets}
                    setAction={setAction}
                  />
                );
              }
            })}{" "}
          </div>
        );
      })}
      <div className="row hackerFont justify-content-center mt-5">
        <div className="col-md-12">
          <br />
          Challenge Types:
          <span className="p-1" style={{ backgroundColor: "#ef121b94" }}>
            Web{" "}
          </span>{" "}
          <span className="p-1" style={{ backgroundColor: "#b017a494" }}>
            Osint{" "}
          </span>{" "}
          <span className="p-1" style={{ backgroundColor: "#17b06b94" }}>
            Steganography{" "}
          </span>{" "}
          <span className="p-1" style={{ backgroundColor: "#36a2eb94" }}>
            Pwning{" "}
          </span>{" "}
          <span className="p-1" style={{ backgroundColor: "#0f329894" }}>
            Forensics{" "}
          </span>{" "}
          <span className="p-1" style={{ backgroundColor: "#9966FF94" }}>
            Cryptography{" "}
          </span>{" "}
          <span className="p-1" style={{ backgroundColor: "#ffce5694" }}>
            Misc{" "}
          </span>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}

export default Challenges;
