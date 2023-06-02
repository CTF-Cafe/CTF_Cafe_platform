import { Link } from "react-router-dom";
import axios from "axios";
import { useState, useEffect, useContext } from "react";
import LoadingScreen from "react-loading-screen";
import AppContext from "./Data/AppContext";
import Navbar from "./Global/Navbar";
import LineChart from "./Charts/LineChart";

const now = new Date();
now.setHours(0, 0, 0, 0);

function Hackerboard(props) {
  const globalData = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectionMain, setSelectionMain] = useState("Teams");
  const [selectionScore, setSelectionScore] = useState("up");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [endTime, setEndTime] = useState(2651526762);
  const [teamCount, setTeamCount] = useState(0);
  const [category, setCategory] = useState(null);
  const [liveReload, setLiveReload] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    selectionMain === "Teams" ? getTeams(page) : getUsers(page);
  }, [searchQuery]);

  const getData = (index) => {
    axios
      .get(process.env.REACT_APP_BACKEND_URI + "/api/getEndTime")
      .then((response) => {
        setEndTime(response.data);
      })
      .catch((err) => {
        console.log(err.message);
      });

    axios
      .get(process.env.REACT_APP_BACKEND_URI + "/api/user/getTeamCount", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.state === "error") {
          globalData.alert.error(response.data.message);
        } else {
          setTeamCount(response.data.count);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });

    getUsers(index);
    getTeams(index);
  };

  const getUsers = (index) => {
    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/getUsers",
        {
          page: index,
          search: searchQuery,
          category: category,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state === "error") {
          globalData.alert.error(response.data.message);
        } else {
          if (selectionScore === "down") {
            setUsers(response.data.reverse());
          } else {
            setUsers(response.data);
          }

          setPage(index);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const getTeams = (index) => {
    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/getTeams",
        {
          page: index,
          search: searchQuery,
          category: category,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state === "error") {
          globalData.alert.error(response.data.message);
          setLoading(false);
        } else {
          if (selectionScore === "down") {
            setTeams(response.data.reverse());
          } else {
            setTeams(response.data);
          }

          setLoading(false);
          setPage(index);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    getData(1);
  }, [category]);

  useEffect(() => {
    setTimeout(() => {
      if (liveReload) {
        getData(page);
        setReload(!reload);
      }
    }, 15000);
  }, [reload, liveReload]);

  const sortData = () => {
    setUsers(users.reverse());
    setTeams(teams.reverse());
  };

  const changeSelection = (type) => {
    switch (type) {
      case "main":
        setPage(1);
        getUsers(1);
        getTeams(1);

        setSelectionMain(selectionMain === "Users" ? "Teams" : "Users");
        break;
      case "score":
        setSelectionScore(selectionScore === "down" ? "up" : "down");
        sortData();
        break;
      default:
        break;
    }
  };

  const downloadCert = async () => {
    var canvas = document.getElementById("canvas"),
      ctx = canvas.getContext("2d");

    canvas.width = document.querySelector("#certImg").width;

    canvas.crossOrigin = "Anonymous";

    canvas.height = document.querySelector("#certImg").height;

    ctx.drawImage(document.querySelector("#certImg"), 0, 0);

    await axios
      .get(process.env.REACT_APP_BACKEND_URI + "/api/getScoreboard", {
        withCredentials: true,
      })
      .then((response) => {
        const scoreboardTeams = response.data.standings;

        var team = scoreboardTeams.find((obj) => {
          if (obj) {
            return obj.team === globalData.userData.team.name;
          } else {
            return false;
          }
        });

        if (!team) {
          throw Error("Team has no solves!");
        }

        var index = team.pos;
        var totalCount = teamCount;

        if (index < 10) {
          index = "00" + index.toString();
        } else if (index < 100) {
          index = "0" + index.toString();
        }

        if (totalCount < 10) {
          totalCount = "00" + totalCount.toString();
        } else if (totalCount < 100) {
          totalCount = "0" + totalCount.toString();
        }

        const color = getComputedStyle(canvas).getPropertyValue("--color-1");

        //   CTF Name
        ctx.font = "bold 55px Fira Code";
        ctx.fillStyle = color;
        ctx.fillText(process.env.REACT_APP_CTF_NAME.toUpperCase(), 1280, 115);

        //   Team Nae
        ctx.font = "bold 40px Fira Code";
        ctx.fillStyle = color;
        ctx.fillText(team.team, 415, 195);

        //   Team Placement
        ctx.font = "bold 80px Fira Code";
        ctx.fillStyle = color;
        ctx.fillText(index, 1050, 385);

        //   Total Teams
        ctx.font = "bold 80px Fira Code";
        ctx.fillStyle = color;
        ctx.fillText(totalCount, 1270, 385);

        var anchor = document.createElement("a");
        anchor.href = canvas.toDataURL("image/png");
        anchor.download = "Certificate.png";
        anchor.click();
      })
      .catch((err) => {
        globalData.alert.error(err.message);
      });
  };

  const nextPage = () => {
    if (selectionMain == "Users") {
      getUsers(page + 1);
    } else {
      getTeams(page + 1);
    }
  };

  const previousPage = () => {
    if (selectionMain == "Users") {
      getUsers(page - 1);
    } else {
      getTeams(page - 1);
    }
  };

  return (
    <div>
      {loading !== undefined && (
        <LoadingScreen
          loading={loading}
          bgColor="#0c0d16"
          spinnerColor="#ef121b"
        />
      )}

      <div className="bg" />

      <Navbar />

      {/* Hidden Stuff */}
      {/* <img
        style={{ display: "none" }}
        src={process.env.REACT_APP_BACKEND_URI + "/api/assets/template.jpg"}
        crossorigin="anonymous"
        id="certImg"
      />
      <canvas id="canvas" hidden /> */}

      <div
        className="jumbotron bg-transparent mb-0 pt-3 radius-0"
        style={{ position: "relative" }}
      >
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <h1 className="display-1 bold color_white text-center cool">
                <span className="color_danger"> HACKER </span>BOARD
              </h1>
              <p className="text-grey lead text-spacey text-center hackerFont">
                Where the world 's greatest get ranked!
              </p>
              {/* {globalData.loggedIn &&
                new Date().getTime() > endTime &&
                globalData.userData.team && (
                  <div style={{ textAlign: "center" }}>
                    <button
                      className="btn btn-outline-danger btn-shadow"
                      onClick={() => {
                        downloadCert();
                      }}
                      style={{ marginBottom: "25px" }}
                    >
                      Download Certificate
                    </button>
                  </div>
                )} */}
            </div>
          </div>
          <div className="row mt-5  justify-content-center">
            <div className="col-xl-10">
              <div style={{ marginBottom: "25px" }}>
                <button
                  className={
                    "btn btn-outline-danger btn-shadow " +
                    (category === null ? "btn-selected" : "")
                  }
                  onClick={() => {
                    setCategory(null);
                  }}
                >
                  Global
                </button>
                {globalData.userCategories.map((c) => (
                  <button
                    key={c}
                    className={
                      "btn btn-outline-danger btn-shadow " +
                      (category === c ? "btn-selected" : "")
                    }
                    onClick={() => {
                      setCategory(c);
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: "25px" }}>
                <LineChart
                  startTime={globalData.startTime}
                  endTime={globalData.endTime}
                  data={selectionMain == "Users" ? users : teams}
                  selection={selectionMain}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "25px",
                }}
              >
                <div>
                  <button
                    className="btn btn-outline-danger btn-shadow"
                    onClick={() => {
                      changeSelection("main");
                    }}
                    title={
                      selectionMain === "Users" ? "View Teams" : "View Users"
                    }
                  >
                    {selectionMain === "Users" ? (
                      <span className="fa-solid fa-users" />
                    ) : (
                      <span className="fa-solid fa-user" />
                    )}
                  </button>
                  <button
                    className="btn btn-outline-danger btn-shadow"
                    onClick={() => setLiveReload(!liveReload)}
                    title={"Live Reload"}
                  >
                    {liveReload ? (
                      <span className="fa-solid fa-rss" />
                    ) : (
                      <span
                        className="fa-solid fa-rss"
                        style={{ opacity: "20%" }}
                      />
                    )}
                  </button>
                </div>
                <div>
                  <input
                    type="text"
                    className="form-control"
                    id="searchQuery"
                    placeholder="Search"
                    onChange={(e) => {
                      setPage(1);
                      setSearchQuery(e.target.value);
                    }}
                  />
                </div>
                {/* Pagination Div */}
                <div>
                  <button
                    className="btn btn-outline-danger btn-shadow"
                    onClick={previousPage}
                    title="Prev Page"
                  >
                    <span className="fa-solid fa-arrow-left"></span>
                  </button>
                  <button
                    className="btn btn-outline-danger btn-shadow"
                    onClick={nextPage}
                    title="Next Page"
                  >
                    <span className="fa-solid fa-arrow-right"></span>
                  </button>
                </div>
              </div>

              {/* Scoreboard Title */}
              <div style={{ textAlign: "center" }}>
                <h1 className="cool">
                  {selectionMain.toUpperCase() + " SCOREBOARD"}
                </h1>
              </div>

              <table className="table table-hover table-striped">
                <thead className="thead-dark hackerFont">
                  <tr style={{ textAlign: "center" }}>
                    <th> # </th> <th style={{ textAlign: "left" }}> Name </th>
                    <th> Solves </th>
                    <th>
                      Score
                      <button
                        className="btn btn-outline-danger btn-shadow"
                        onClick={() => {
                          changeSelection("score");
                        }}
                        style={{ marginRight: "30px" }}
                      >
                        <span
                          className={
                            selectionScore === "down"
                              ? "fa-solid fa-arrow-down"
                              : "fa-solid fa-arrow-up"
                          }
                        ></span>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectionMain === "Users"
                    ? users.map(function (user, index) {
                        return (
                          <tr
                            key={index + 1 + (page - 1) * 100}
                            style={{ textAlign: "center" }}
                          >
                            <th scope="row">
                              {(
                                selectionScore === "up"
                                  ? index + (page - 1) * 100 === 0
                                  : index * -1 +
                                      (page - 1) * 100 +
                                      users.length ===
                                    1
                              ) ? (
                                globalData.theme.top1_icon ? (
                                  <img
                                    src={globalData.theme.top1_icon}
                                    style={{ width: "50px" }}
                                  />
                                ) : (
                                  1
                                )
                              ) : (
                                  selectionScore === "up"
                                    ? index + (page - 1) * 100 === 1
                                    : index * -1 +
                                        (page - 1) * 100 +
                                        users.length ===
                                      2
                                ) ? (
                                globalData.theme.top2_icon ? (
                                  <img
                                    src={globalData.theme.top2_icon}
                                    style={{ width: "40px" }}
                                  />
                                ) : (
                                  2
                                )
                              ) : (
                                  selectionScore === "up"
                                    ? index + (page - 1) * 100 === 2
                                    : index * -1 +
                                        (page - 1) * 100 +
                                        users.length ===
                                      3
                                ) ? (
                                globalData.theme.top3_icon ? (
                                  <img
                                    src={globalData.theme.top3_icon}
                                    style={{ width: "30px" }}
                                  />
                                ) : (
                                  3
                                )
                              ) : selectionScore === "up" ? (
                                index + 1 + (page - 1) * 100
                              ) : (
                                index * -1 + (page - 1) * 100 + users.length
                              )}
                            </th>
                            <td style={{ textAlign: "left" }}>
                              <Link
                                to={`/user/${user.username}`}
                                className="text-decoration-none text-light bold"
                              >
                                {user.username}
                              </Link>
                            </td>
                            <td> {user.solved.length} </td>
                            <td> {user.score} </td>
                          </tr>
                        );
                      })
                    : teams.map(function (team, index) {
                        return (
                          <tr
                            key={index + (page - 1) * 100}
                            style={{ textAlign: "center" }}
                          >
                            <th scope="row">
                              {(
                                selectionScore === "up"
                                  ? index + (page - 1) * 100 === 0
                                  : index * -1 +
                                      (page - 1) * 100 +
                                      teams.length ===
                                    1
                              ) ? (
                                globalData.theme.top1_icon ? (
                                  <img
                                    src={globalData.theme.top1_icon}
                                    style={{ width: "50px" }}
                                  />
                                ) : (
                                  1
                                )
                              ) : (
                                  selectionScore == "up"
                                    ? index + (page - 1) * 100 == 1
                                    : index * -1 +
                                        (page - 1) * 100 +
                                        teams.length ===
                                      2
                                ) ? (
                                globalData.theme.top2_icon ? (
                                  <img
                                    src={globalData.theme.top2_icon}
                                    style={{ width: "40px" }}
                                  />
                                ) : (
                                  2
                                )
                              ) : (
                                  selectionScore === "up"
                                    ? index + (page - 1) * 100 === 2
                                    : index * -1 +
                                        (page - 1) * 100 +
                                        teams.length ===
                                      3
                                ) ? (
                                globalData.theme.top3_icon ? (
                                  <img
                                    src={globalData.theme.top3_icon}
                                    style={{ width: "30px" }}
                                  />
                                ) : (
                                  3
                                )
                              ) : selectionScore === "up" ? (
                                index + (page - 1) * 100 + 1
                              ) : (
                                index * -1 + (page - 1) * 100 + teams.length
                              )}
                            </th>
                            <td style={{ textAlign: "left" }}>
                              <Link
                                to={`/team/${team.name}`}
                                className="text-decoration-none text-light bold"
                              >
                                {team.country} {team.name}
                              </Link>
                            </td>
                            <td> {team.totalSolved} </td>
                            <td> {team.totalScore} </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
              <div
                style={{
                  display: "flex",
                  justifyContent: "end",
                  marginBottom: "25px",
                }}
              >
                {/* Pagination Div */}
                <div>
                  <button
                    className="btn btn-outline-danger btn-shadow"
                    onClick={previousPage}
                    title="Prev Page"
                  >
                    <span className="fa-solid fa-arrow-left"></span>
                  </button>
                  <button
                    className="btn btn-outline-danger btn-shadow"
                    onClick={nextPage}
                    title="Next Page"
                  >
                    <span className="fa-solid fa-arrow-right"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hackerboard;
