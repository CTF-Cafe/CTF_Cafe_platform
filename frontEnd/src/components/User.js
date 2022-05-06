import { Outlet, Routes, Route, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import AppContext from "./Data/AppContext";
import Navbar from "./Global/Navbar.js";
import PieChart from "./Charts/PieChart.js";

function User(props) {
  const globalData = useContext(AppContext);
  const location = useLocation();
  const selectedUser = location.pathname.replace("/user/", "");
  const [user, setUser] = useState({});
  const [challengeStatsCategory, setChallengeStatsCategory] = useState([]);
  const [challengeStatsDifficulty, setChallengeStatsDifficulty] = useState([]);

  const getUser = (username) => {
    axios
      .post(process.env.REACT_APP_SERVER_URI + "/api/getUser", {
        username: username,
      })
      .then((response) => {
        if (response.data.state != "error") {
          setUser(response.data);

          if (response.data.solved.length > 0) {
            let finalDataCategory = [];
            let finalDataDifficulty = [];

            response.data.solved.forEach((solve) => {
              var category = finalDataCategory.find((obj) => {
                return obj.name == solve.challenge.category;
              });

              if (category) {
                finalDataCategory[
                  finalDataCategory.indexOf(category)
                ].value += 1;
              } else {
                finalDataCategory.push({
                  name: solve.challenge.category,
                  value: 1,
                });
              }

              console.log(finalDataCategory);
              setChallengeStatsCategory(finalDataCategory);

              var difficulty = finalDataDifficulty.find((obj) => {
                return (
                  obj.name ==
                  (solve.challenge.level == 3
                    ? "Ninja"
                    : solve.challenge.level == 2
                    ? "Hard"
                    : solve.challenge.level == 1
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
                    solve.challenge.level == 3
                      ? "Ninja"
                      : solve.challenge.level == 2
                      ? "Hard"
                      : solve.challenge.level == 1
                      ? "Medium"
                      : "Easy",
                  value: 1,
                });
              }

              setChallengeStatsDifficulty(finalDataDifficulty);
            });
          }
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    getUser(selectedUser);
  }, []);

  return (
    <div>
      <Navbar />
      <div className="jumbotron bg-transparent mb-0 pt-3 radius-0">
        <div className="container">
          {user.username ? (
            <div>
              <h1
                className="display-1 bold color_white"
                style={{ textAlign: "center", marginBottom: "25px" }}
              >
                {user.username.toUpperCase()}
              </h1>

              {user.solved.length > 0 ? (
                <>
                  <div className="row" style={{ textAlign: "center" }}>
                    <div className="col-md-6 mb-3">
                      <div>
                        <h3>Solves by Category</h3>
                        <PieChart data={challengeStatsCategory} />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div>
                        <h3>Solves by Difficulty</h3>
                        <PieChart data={challengeStatsDifficulty} />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <table className="table table-hover table-striped">
                      <thead className="thead-dark hackerFont">
                        <tr>
                          <th scope="col" style={{ textAlign: "center" }}>
                            #
                          </th>
                          <th scope="col">Challenge Name</th>
                          <th scope="col">Challenge Points</th>
                          <th scope="col">Challenge Category</th>
                          <th scope="col">Time Solved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.solved.map((solve, index) => {
                          return (
                            <tr key={solve._id}>
                              <th scope="row" style={{ textAlign: "center" }}>
                                {index}
                              </th>
                              <td>{solve.challenge.name}</td>
                              <td>{solve.challenge.points}</td>
                              <td>{solve.challenge.category}</td>
                              <td>{solve.timestamp}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <h3 style={{ textAlign: "center" }}>No Challenges Solved!</h3>
              )}
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
