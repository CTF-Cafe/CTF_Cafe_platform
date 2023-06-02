import { useLocation } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useContext } from "react";
import Navbar from "./Global/Navbar";
import PieChart from "./Charts/PieChart";
import AppContext from "./Data/AppContext";

function User(props) {
  const globalData = useContext(AppContext);
  const location = useLocation();
  const selectedUser = decodeURIComponent(
    location.pathname.replace("/user/", "")
  );
  const [user, setUser] = useState({});
  const [challengeStatsTags, setChallengeStatsTags] = useState([]);
  const [challengeStatsDifficulty, setChallengeStatsDifficulty] = useState([]);

  const getUser = (username) => {
    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/getUser",
        {
          username: username,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        if (response.data.state !== "error") {
          setUser(response.data);

          if (response.data.solved.length > 0) {
            let finalDataTags = [];
            let finalDataDifficulty = [];

            response.data.solved.forEach((solve) => {
              let exists = finalDataTags.find((obj) => {
                return obj.name === solve.challenge.tags[0];
              });

              if (exists) {
                exists.value += 1;
              } else {
                finalDataTags.push({
                  name: solve.challenge.tags[0],
                  value: 1,
                });
              }

              setChallengeStatsTags(finalDataTags);

              let difficulty = finalDataDifficulty.find((obj) => {
                return (
                  obj.name ===
                  (solve.challenge.level === 3
                    ? "Ninja"
                    : solve.challenge.level === 2
                    ? "Hard"
                    : solve.challenge.level === 1
                    ? "Medium"
                    : "Easy")
                );
              });

              console.log(solve.challenge)

              if (difficulty) {
                finalDataDifficulty[
                  finalDataDifficulty.indexOf(difficulty)
                ].value += 1;
              } else {
                finalDataDifficulty.push({
                  name:
                    solve.challenge.level === 3
                      ? "Ninja"
                      : solve.challenge.level === 2
                      ? "Hard"
                      : solve.challenge.level === 1
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
      <div className="bg" />

      <Navbar />
      <div
        className="jumbotron bg-transparent mb-0 pt-3 radius-0"
        style={{ position: "relative" }}
      >
        <div className="container">
          {user.username ? (
            <div>
              <h1
                className="display-1 bold color_white cool"
                style={{ textAlign: "center", marginBottom: "25px" }}
              >
                {user.username.toUpperCase()}
              </h1>
              <div style={{ textAlign: "center" }}>
                <p>
                  Score : {user.score}{" "}
                  {user.adminPoints !== 0 &&
                    `(${
                      user.adminPoints > 0
                        ? "+" + user.adminPoints
                        : user.adminPoints
                    })`}
                </p>
                <p>Category : {user.category}</p>
              </div>
              {/* User Solve Stats */}
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
              {/* User Solves Table */}
              <div className="row" style={{ marginBottom: "25px" }}>
                <p>User Solves</p>
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
                    </tr>
                  </thead>
                  <tbody>
                    {user.solved.map((solve, index) => {
                      return (
                        <tr key={solve._id}>
                          <th scope="row" style={{ textAlign: "center" }}>
                            {index}
                          </th>
                          <td>
                            {solve.challenge.firstBlood == user._id && (
                              <span
                                className="fa-solid fa-droplet"
                                style={{
                                  fontSize: "22px",
                                  color: "red",
                                  marginRight: "5px",
                                }}
                              ></span>
                            )}
                            {solve.challenge.name}
                          </td>
                          <td>
                            {solve.challenge.points}{" "}
                            {solve.challenge.firstBlood == user._id &&
                              `(+${solve.challenge.firstBloodPoints})`}
                          </td>
                          <td>
                            {solve.challenge.tags.map((tag) => (
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
                          <td>{solve.timestamp}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* User Hints Bought */}
              <div className="row">
                <p>User Hints Bought</p>
                <table className="table table-hover table-striped">
                  <thead className="thead-dark hackerFont">
                    <tr>
                      <th scope="col" style={{ textAlign: "center" }}>
                        #
                      </th>
                      <th scope="col">Challenge Name</th>
                      <th scope="col">Hint Cost</th>
                      <th scope="col">Time Bought</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.hintsBought.map((hint, index) => {
                      return (
                        <tr key={hint._id}>
                          <th scope="row" style={{ textAlign: "center" }}>
                            {index}
                          </th>
                          <td>{hint.challName}</td>
                          <td>-{hint.cost}</td>
                          <td>{hint.timestamp}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <h1
                className="display-1 bold color_white cool"
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
