import { Outlet, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import { useContext, useEffect } from "react";
import copy from "copy-to-clipboard";
import AppContext from "./Data/AppContext";
import Navbar from "./Global/Navbar.js";

function Team(props) {
  const globalData = useContext(AppContext);

  const getTeam = () => {
    axios
      .post(process.env.REACT_APP_SERVER_URI + "/api/getUserTeam", {
        teamId: globalData.userData.teamId,
      })
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state != "error") {
          globalData.userData.team = response.data;
          globalData.setUserData(globalData.userData);
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
      .post(process.env.REACT_APP_SERVER_URI + "/api/registerTeam", {
        teamName: teamName,
      })
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state == "success") {
          globalData.alert.success("Team registered!");
          globalData.userData = response.data.user;
          globalData.userData.team = response.data.team;
          globalData.setUserData(globalData.userData);
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
      .post(process.env.REACT_APP_SERVER_URI + "/api/joinTeam", {
        teamCode: teamCode,
      })
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state == "success") {
          globalData.alert.success("Team joined!");
          globalData.userData = response.data.user;
          globalData.userData.team = response.data.team;
          globalData.setUserData(globalData.userData);
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
      .post(process.env.REACT_APP_SERVER_URI + "/api/getTeamCode", {
        teamName: globalData.userData.team.name,
      })
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
      .get(process.env.REACT_APP_SERVER_URI + "/api/leaveTeam")
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state == "success") {
          globalData.userData.teamId = 'none';
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

  return (
    <div>
      <Navbar />
      <div className="jumbotron bg-transparent mb-0 pt-3 radius-0">
        <div className="container">
          {!globalData.userData.team ? (
            <div className="jumbotron bg-transparent mb-0 pt-3 radius-0">
              <div className="container">
                <div className="row">
                  <div className="col-xl-8">
                    <h1 className="display-1 bold color_white">
                      {process.env.REACT_APP_CTF_NAME}
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
                  className="display-1 bold color_white"
                  style={{ textAlign: "center", marginBottom: "25px" }}
                >
                  {globalData.userData.team.name.toUpperCase()}
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
                  {globalData.userData.team.users.map((user, index) => {
                    return (
                      <tr key={user.username}>
                        <th scope="row" style={{ textAlign: "center" }}>
                          {index}
                        </th>
                        <td> {user.username} </td> <td> {user.score} </td>
                        <td> {user.solved.length} </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Team;
