import axios from "axios";
import { useContext, useEffect, useState } from "react";
import AppContext from "./Data/AppContext";
import Navbar from "./Global/Navbar";
import PieChart from "./Charts/PieChart";

function User(props) {
  const globalData = useContext(AppContext);

  const updateUsername = () => {
    const newUsername = document.getElementById("newUsername").value;

    axios
      .post(
        process.env.REACT_APP_SERVER_URI + "/api/user/updateUsername",
        {
          newUsername: newUsername,
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
          globalData.alert.success("Username updated!");
          globalData.navigate("/", { replace: true });
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
          {globalData.userData.username ? (
            <div>
              <>
                <div className="row" style={{ textAlign: "center" }}>
                  <div className="col-md-6 mb-3">
                    <div>
                      <h3>Settings</h3>
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          id="newUsername"
                          placeholder="New Username"
                          style={{
                            width: "75%",
                            margin: "auto",
                            marginBottom: "10px",
                          }}
                        />
                        <button
                          className="btn btn-outline-danger btn-shadow"
                          onClick={updateUsername}
                          style={{ marginBottom: "25px" }}
                        >
                          Update Username
                        </button>
                      </div>
                      {/* 
                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control"
                            id="password"
                            placeholder="New Password"
                          />
                          <button
                            className="btn btn-outline-danger btn-shadow"
                            onClick={updatePassword}
                            style={{ marginBottom: "25px" }}
                          >
                            Update Password
                          </button>
                        </div> */}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div>
                      <h3>User Info</h3>
                      <ul
                        style={{
                          listStyle: "none",
                          textAlign: "center",
                          padding: 0,
                        }}
                      >
                        <li>Username: {globalData.userData.username}</li>
                        {globalData.userData.team ? (
                          <li>Team: {globalData.userData.team.name}</li>
                        ) : null}
                        <li># Solved: {globalData.userData.solved.length}</li>
                        <li>Score: {globalData.userData.score}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            </div>
          ) : (
            <div>
              <h1
                className="display-1 bold color_white"
                style={{ textAlign: "center", marginBottom: "25px" }}
              >
                USER NOT FOUND
              </h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default User;
