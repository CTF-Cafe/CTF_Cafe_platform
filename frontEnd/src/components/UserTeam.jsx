import { Outlet, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import copy from "copy-to-clipboard";
import AppContext from "./Data/AppContext";
import Navbar from "./Global/Navbar";
import ConfirmModal from "./Global/ConfirmModal";
import PieChart from "./Charts/PieChart";

const flags = [
  "🌐",
  "🇦🇨",
  "🇦🇩",
  "🇦🇪",
  "🇦🇫",
  "🇦🇬",
  "🇦🇮",
  "🇦🇱",
  "🇦🇲",
  "🇦🇴",
  "🇦🇶",
  "🇦🇷",
  "🇦🇸",
  "🇦🇹",
  "🇦🇺",
  "🇦🇼",
  "🇦🇽",
  "🇦🇿",
  "🇧🇦",
  "🇧🇧",
  "🇧🇩",
  "🇧🇪",
  "🇧🇫",
  "🇧🇬",
  "🇧🇭",
  "🇧🇮",
  "🇧🇯",
  "🇧🇱",
  "🇧🇲",
  "🇧🇳",
  "🇧🇴",
  "🇧🇶",
  "🇧🇷",
  "🇧🇸",
  "🇧🇹",
  "🇧🇻",
  "🇧🇼",
  "🇧🇾",
  "🇧🇿",
  "🇨🇦",
  "🇨🇨",
  "🇨🇩",
  "🇨🇫",
  "🇨🇬",
  "🇨🇭",
  "🇨🇮",
  "🇨🇰",
  "🇨🇱",
  "🇨🇲",
  "🇨🇳",
  "🇨🇴",
  "🇨🇵",
  "🇨🇷",
  "🇨🇺",
  "🇨🇻",
  "🇨🇼",
  "🇨🇽",
  "🇨🇾",
  "🇨🇿",
  "🇩🇪",
  "🇩🇬",
  "🇩🇯",
  "🇩🇰",
  "🇩🇲",
  "🇩🇴",
  "🇩🇿",
  "🇪🇦",
  "🇪🇨",
  "🇪🇪",
  "🇪🇬",
  "🇪🇭",
  "🇪🇷",
  "🇪🇸",
  "🇪🇹",
  "🇪🇺",
  "🇫🇮",
  "🇫🇯",
  "🇫🇰",
  "🇫🇲",
  "🇫🇴",
  "🇫🇷",
  "🇬🇦",
  "🇬🇧",
  "🇬🇩",
  "🇬🇪",
  "🇬🇫",
  "🇬🇬",
  "🇬🇭",
  "🇬🇮",
  "🇬🇱",
  "🇬🇲",
  "🇬🇳",
  "🇬🇵",
  "🇬🇶",
  "🇬🇷",
  "🇬🇸",
  "🇬🇹",
  "🇬🇺",
  "🇬🇼",
  "🇬🇾",
  "🇭🇰",
  "🇭🇲",
  "🇭🇳",
  "🇭🇷",
  "🇭🇹",
  "🇭🇺",
  "🇮🇨",
  "🇮🇩",
  "🇮🇪",
  "🇮🇱",
  "🇮🇲",
  "🇮🇳",
  "🇮🇴",
  "🇮🇶",
  "🇮🇷",
  "🇮🇸",
  "🇮🇹",
  "🇯🇪",
  "🇯🇲",
  "🇯🇴",
  "🇯🇵",
  "🇰🇪",
  "🇰🇬",
  "🇰🇭",
  "🇰🇮",
  "🇰🇲",
  "🇰🇳",
  "🇰🇵",
  "🇰🇷",
  "🇰🇼",
  "🇰🇾",
  "🇰🇿",
  "🇱🇦",
  "🇱🇧",
  "🇱🇨",
  "🇱🇮",
  "🇱🇰",
  "🇱🇷",
  "🇱🇸",
  "🇱🇹",
  "🇱🇺",
  "🇱🇻",
  "🇱🇾",
  "🇲🇦",
  "🇲🇨",
  "🇲🇩",
  "🇲🇪",
  "🇲🇫",
  "🇲🇬",
  "🇲🇭",
  "🇲🇰",
  "🇲🇱",
  "🇲🇲",
  "🇲🇳",
  "🇲🇴",
  "🇲🇵",
  "🇲🇶",
  "🇲🇷",
  "🇲🇸",
  "🇲🇹",
  "🇲🇺",
  "🇲🇻",
  "🇲🇼",
  "🇲🇽",
  "🇲🇾",
  "🇲🇿",
  "🇳🇦",
  "🇳🇨",
  "🇳🇪",
  "🇳🇫",
  "🇳🇬",
  "🇳🇮",
  "🇳🇱",
  "🇳🇴",
  "🇳🇵",
  "🇳🇷",
  "🇳🇺",
  "🇳🇿",
  "🇴🇲",
  "🇵🇦",
  "🇵🇪",
  "🇵🇫",
  "🇵🇬",
  "🇵🇭",
  "🇵🇰",
  "🇵🇱",
  "🇵🇲",
  "🇵🇳",
  "🇵🇷",
  "🇵🇸",
  "🇵🇹",
  "🇵🇼",
  "🇵🇾",
  "🇶🇦",
  "🇷🇪",
  "🇷🇴",
  "🇷🇸",
  "🇷🇺",
  "🇷🇼",
  "🇸🇦",
  "🇸🇧",
  "🇸🇨",
  "🇸🇩",
  "🇸🇪",
  "🇸🇬",
  "🇸🇭",
  "🇸🇮",
  "🇸🇯",
  "🇸🇰",
  "🇸🇱",
  "🇸🇲",
  "🇸🇳",
  "🇸🇴",
  "🇸🇷",
  "🇸🇸",
  "🇸🇹",
  "🇸🇻",
  "🇸🇽",
  "🇸🇾",
  "🇸🇿",
  "🇹🇦",
  "🇹🇨",
  "🇹🇩",
  "🇹🇫",
  "🇹🇬",
  "🇹🇭",
  "🇹🇯",
  "🇹🇰",
  "🇹🇱",
  "🇹🇲",
  "🇹🇳",
  "🇹🇴",
  "🇹🇷",
  "🇹🇹",
  "🇹🇻",
  "🇹🇼",
  "🇹🇿",
  "🇺🇦",
  "🇺🇬",
  "🇺🇲",
  "🇺🇳",
  "🇺🇸",
  "🇺🇾",
  "🇺🇿",
  "🇻🇦",
  "🇻🇨",
  "🇻🇪",
  "🇻🇬",
  "🇻🇮",
  "🇻🇳",
  "🇻🇺",
  "🇼🇫",
  "🇼🇸",
  "🇽🇰",
  "🇾🇪",
  "🇾🇹",
  "🇿🇦",
  "🇿🇲",
  "🇿🇼",
  "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
];

function UserTeam(props) {
  const globalData = useContext(AppContext);
  const [action, setAction] = useState({});
  const [userTeam, setUserTeam] = useState({});
  const [challengeStatsTags, setChallengeStatsTags] = useState([]);
  const [challengeStatsDifficulty, setChallengeStatsDifficulty] = useState([]);

  // Parse and Organize team data
  const updateUserTeam = (response) => {
    let finalDataTags = [];
    let finalDataDifficulty = [];

    response.data.solved = [];
    response.data.hintsBought = [];
    response.data.score = 0;
    response.data.users.forEach((user) => {
      user.solved.forEach((solve) => {
        response.data.solved.push({
          ...solve,
          userId: user._id,
          username: user.username,
        });

        // Add FirstBlood Points if match
        if (solve.firstBlood === user._id) {
          user.score += solve.firstBloodPoints;
          response.data.score += solve.firstBloodPoints;
        }

        user.score += solve.points;
        response.data.score += solve.points;

        let exists = finalDataTags.find((obj) => {
          return obj.name === solve.tags[0];
        });

        if (exists) {
          exists.value += 1;
        } else {
          finalDataTags.push({
            name: solve.tags[0],
            value: 1,
          });
        }

        var difficulty = finalDataDifficulty.find((obj) => {
          return (
            obj.name ===
            (solve.level === 3
              ? "Ninja"
              : solve.level === 2
              ? "Hard"
              : solve.level === 1
              ? "Medium"
              : "Easy")
          );
        });

        if (difficulty) {
          finalDataDifficulty[
            finalDataDifficulty.indexOf(difficulty)
          ].value += 1;
        } else {
          finalDataDifficulty.push({
            name:
              solve.level === 3
                ? "Ninja"
                : solve.level === 2
                ? "Hard"
                : solve.level === 1
                ? "Medium"
                : "Easy",
            value: 1,
          });
        }
      });
      user.hintsBought.forEach((hint) => {
        response.data.hintsBought.push({
          ...hint,
          userId: user._id,
          username: user.username,
        });
        user.score -= hint.cost;
        response.data.score -= hint.cost;
      });

      response.data.score += user.adminPoints;
      user.score += user.adminPoints;
    });

    response.data.users.sort((a, b) => b.score - a.score);

    setChallengeStatsTags(finalDataTags);

    setChallengeStatsDifficulty(finalDataDifficulty);

    globalData.userData.team = response.data;
    setUserTeam(response.data);
    globalData.setUserData(globalData.userData);
  };

  const getTeam = () => {
    axios
      .get(process.env.REACT_APP_BACKEND_URI + "/api/user/getUserTeam", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.state !== "error") {
          updateUserTeam(response);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    getTeam();
  }, []);

  const registerTeam = () => {
    const teamName = document.getElementById("teamName").value;

    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/user/registerTeam",
        {
          teamName: teamName,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state === "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state === "success") {
          globalData.alert.success("Team registered!");
          getTeam();
        } else {
          globalData.alert.error(response.data.message);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const joinTeam = () => {
    const teamCode = document.getElementById("teamCode").value;

    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/user/joinTeam",
        {
          teamCode: teamCode,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state === "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state === "success") {
          globalData.alert.success("Team joined!");
          getTeam();
        } else {
          globalData.alert.error(response.data.message);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const copyCode = (e) => {
    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/user/getTeamCode",
        {
          teamName: globalData.userData.team.name,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state == "success") {
          copy(response.data.code);
          globalData.alert.success("Copied to clipboard!");
        } else {
          globalData.alert.error(response.data.message);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const leaveTeam = (e) => {
    axios
      .get(process.env.REACT_APP_BACKEND_URI + "/api/user/leaveTeam", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state == "success") {
          globalData.userData.teamId = "none";
          globalData.userData.team = undefined;
          globalData.setUserData(globalData.userData);
          globalData.navigate("/", { replace: true });
          globalData.alert.success("Left team!");
        } else {
          globalData.alert.error(response.data.message);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const kickUser = (e, userToKick) => {
    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/user/kickUser",
        {
          userToKick: userToKick,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state == "success") {
          globalData.alert.success("Kicked user!");
          getTeam();
        } else {
          globalData.alert.error(response.data.message);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const saveUserTeamCountry = (e) => {
    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/user/saveTeamCountry",
        {
          country: e.target.value,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state == "success") {
          globalData.alert.success("Updated Country!");
        } else {
          globalData.alert.error(response.data.message);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return (
    <div>
      <div className="bg" />
      <Navbar />
      <ConfirmModal action={action} />
      <div
        className="jumbotron bg-transparent mb-0 pt-3 radius-0"
        style={{ position: "relative" }}
      >
        <div className="container">
          {!userTeam.name ? (
            <div className="jumbotron bg-transparent mb-0 pt-3 radius-0">
              <div className="container">
                <div className="row">
                  <div className="col-xl-8">
                    <h1 className="display-1 bold color_white cool">
                      {process.env.REACT_APP_CTF_NAME.toUpperCase()}
                      <span className="vim-caret">&nbsp;</span>
                    </h1>
                    <p className="text-grey text-spacey hackerFont lead mb-5">
                      Join the worlds leading forces, and battle it out for the
                      win!
                    </p>
                  </div>
                </div>
                <div className="row hackerFont">
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        id="teamCode"
                        placeholder="Team Code"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <button
                      className="btn btn-outline-danger btn-shadow text-left"
                      onClick={joinTeam}
                      style={{ paddingBottom: "0px" }}
                    >
                      <h4 style={{ fontSize: "16px" }}> Join Team </h4>
                    </button>
                  </div>
                </div>
                <div className="row hackerFont" style={{ marginTop: "50px" }}>
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        id="teamName"
                        placeholder="Team Name"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <button
                      className="btn btn-outline-danger btn-shadow text-left"
                      onClick={registerTeam}
                      style={{ paddingBottom: "0px" }}
                    >
                      <h4 style={{ fontSize: "16px" }}> Register Team </h4>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: "center" }}>
                <h1
                  className="display-1 bold color_white cool"
                  style={{ textAlign: "center", marginBottom: "25px" }}
                >
                  <select
                    style={{ fontSize: "40px", marginRight: "10px" }}
                    defaultValue={userTeam.country ? userTeam.country : "🌐"}
                    onChange={saveUserTeamCountry}
                  >
                    {flags.map((f) => (
                      <option value={f}>{f}</option>
                    ))}
                  </select>
                  {userTeam.name.toUpperCase()}
                </h1>
                <button
                  className="btn btn-outline-danger btn-shadow"
                  onClick={copyCode}
                  style={{ marginBottom: "25px" }}
                >
                  Copy Invite Code
                </button>
                <button
                  className="btn btn-outline-danger btn-shadow"
                  onClick={leaveTeam}
                  style={{ marginBottom: "25px" }}
                >
                  Leave Team
                </button>
                <div style={{ textAlign: "center" }}>
                  <p>Score : {userTeam.score}</p>
                </div>
              </div>
              <table className="table table-hover table-striped">
                <thead className="thead-dark hackerFont">
                  <tr>
                    <th scope="col" style={{ textAlign: "center" }}>
                      #
                    </th>
                    <th scope="col"> Username </th>
                    <th scope="col"> User Score </th>
                    <th scope="col"> User Solves </th>
                  </tr>
                </thead>
                <tbody>
                  {userTeam.users.map((user, index) => {
                    return (
                      <tr key={user.username}>
                        <th scope="row" style={{ textAlign: "center" }}>
                          {index}
                        </th>
                        <td>
                          {userTeam.teamCaptain === globalData.userData._id &&
                          globalData.userData.username !== user.username ? (
                            <button
                              className="btn btn-outline-danger btn-shadow"
                              data-toggle="modal"
                              data-target="#confirmModal"
                              onClick={(e) => {
                                setAction({
                                  function: kickUser,
                                  e: e,
                                  data: user.username,
                                });
                              }}
                            >
                              <span className="fa-solid fa-minus"></span>
                            </button>
                          ) : null}
                          <Link to={`/user/${user.username}`}>
                            <a className="p-3 text-decoration-none text-light bold">
                              {user.username}
                            </a>
                          </Link>
                        </td>
                        <td> {user.score} </td>
                        <td> {user.solved.length} </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="row" style={{ textAlign: "center" }}>
                <div className="col-md-6 mb-3">
                  <div>
                    <h3>Solves by Tags</h3>
                    <PieChart data={challengeStatsTags} />
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div>
                    <h3>Solves by Difficulty</h3>
                    <PieChart data={challengeStatsDifficulty} />
                  </div>
                </div>
              </div>

              {/* Team Solves */}
              <div className="row">
                <p>Team Solves</p>
                <table className="table table-hover table-striped">
                  <thead className="thead-dark hackerFont">
                    <tr>
                      <th scope="col" style={{ textAlign: "center" }}>
                        #
                      </th>
                      <th scope="col">Challenge Name</th>
                      <th scope="col">Challenge Points</th>
                      <th scope="col">Challenge Tags</th>
                      <th scope="col">Time Solved</th>
                      <th scope="col">Flagger</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userTeam.solved.map((solve, index) => {
                      return (
                        <tr key={solve._id}>
                          <th scope="row" style={{ textAlign: "center" }}>
                            {index}
                          </th>
                          <td>
                            {solve.firstBlood === solve.userId ? (
                              <span
                                className="fa-solid fa-droplet"
                                style={{
                                  fontSize: "22px",
                                  color: "red",
                                  marginRight: "5px",
                                }}
                              ></span>
                            ) : null}
                            {solve.name}
                          </td>
                          <td>
                            {solve.points}{" "}
                            {solve.firstBlood === solve.userId &&
                              `(+${solve.firstBloodPoints})`}
                          </td>
                          <td>
                            {solve.tags.map((tag) => (
                              <span
                                key={tag + solve._id}
                                className="badge color_white align-self-end"
                                style={{
                                  marginRight: "5px",
                                  backgroundColor: (
                                    globalData.tagColors.find(
                                      (x) => tag == x.name
                                    ) || { color: "black" }
                                  ).color,
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </td>
                          <td>
                            {new Date(solve.timestamp).toString().split("(")[0]}
                          </td>
                          <td>{solve.username}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Team Hints Bought */}
              <div className="row">
                <p>Team Hints Bought</p>
                <table className="table table-hover table-striped">
                  <thead className="thead-dark hackerFont">
                    <tr>
                      <th scope="col" style={{ textAlign: "center" }}>
                        #
                      </th>
                      <th scope="col">Challenge Name</th>
                      <th scope="col">Hint Cost</th>
                      <th scope="col">Time Bought</th>
                      <th scope="col">Buyer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userTeam.hintsBought.map((hint, index) => {
                      return (
                        <tr key={hint.hintId}>
                          <th scope="row" style={{ textAlign: "center" }}>
                            {index}
                          </th>
                          <td>{hint.challName}</td>
                          <td>-{hint.cost}</td>
                          <td>{hint.timestamp}</td>
                          <td>{hint.username}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserTeam;
