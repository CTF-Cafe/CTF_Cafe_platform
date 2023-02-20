import { Outlet, Routes, Route, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import AppContext from "./Data/AppContext";
import Navbar from "./Global/Navbar";
import PieChart from "./Charts/PieChart";

function Team(props) {
  const location = useLocation();
  const selectedTeam = location.pathname.replace("/team/", "");
  const [team, setTeam] = useState({});
  const [challengeStatsCategory, setChallengeStatsCategory] = useState([]);
  const [challengeStatsDifficulty, setChallengeStatsDifficulty] = useState([]);

  const getTeam = (teamName) => {
    axios
      .post(process.env.REACT_APP_BACKEND_URI + "/api/getTeam", {
        teamName: teamName,
      })
      .then((response) => {
        if (response.data.state != "error") {
          const clubArray = (arr) => {
            return arr.reduce((acc, val, ind) => {
              const index = acc.findIndex((el) => el.username === val.username);
              if (index !== -1) {
                acc[index].solved.push(val.solved[0]);
                acc[index].score += val.score;
              } else {
                acc.push(val);
              }
              return acc;
            }, []);
          };

          response.data.users = clubArray(response.data.users);

          let finalDataCategory = [];
          let finalDataDifficulty = [];

          response.data.solved = [];
          response.data.users.forEach((user) => {
            user.solved.forEach((solve) => {
              response.data.solved.push({
                ...solve,
                userId: user._id,
                username: user.username,
              });
              user.score += solve.points;

              var category = finalDataCategory.find((obj) => {
                return obj.name == solve.category;
              });

              if (category) {
                finalDataCategory[
                  finalDataCategory.indexOf(category)
                ].value += 1;
              } else {
                finalDataCategory.push({
                  name: solve.category,
                  value: 1,
                });
              }

              var difficulty = finalDataDifficulty.find((obj) => {
                return (
                  obj.name ==
                  (solve.level == 3
                    ? "Ninja"
                    : solve.level == 2
                    ? "Hard"
                    : solve.level == 1
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
                    solve.level == 3
                      ? "Ninja"
                      : solve.level == 2
                      ? "Hard"
                      : solve.level == 1
                      ? "Medium"
                      : "Easy",
                  value: 1,
                });
              }
            });
            user.hintsBought.forEach((hint) => {
              user.score -= hint.cost;
            });
          });

          setChallengeStatsCategory(finalDataCategory);

          setChallengeStatsDifficulty(finalDataDifficulty);

          setTeam(response.data);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    getTeam(selectedTeam);
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
          {!team.name ? (
            <div>
              <h1
                className="display-1 bold color_white"
                style={{ textAlign: "center", marginBottom: "25px" }}
              >
                TEAM NOT FOUND
              </h1>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: "center" }}>
                <h1
                  className="display-1 bold color_white"
                  style={{ textAlign: "center", marginBottom: "25px" }}
                >
                  {team.name.toUpperCase()}
                </h1>
              </div>
              {team.solved.length > 0 && (
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
                          <th scope="col">Flagger</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.solved.map((solve, index) => {
                          return (
                            <tr key={solve._id}>
                              <th scope="row" style={{ textAlign: "center" }}>
                                {index}
                              </th>
                              <td>
                                {solve.firstBlood == solve.userId ? (
                                  <span
                                    class="fa-solid fa-droplet"
                                    style={{
                                      fontSize: "22px",
                                      color: "red",
                                      marginRight: "5px",
                                    }}
                                  ></span>
                                ) : null}
                                {solve.name}
                              </td>
                              <td>{solve.points}</td>
                              <td>{solve.category}</td>
                              <td>{solve.timestamp}</td>
                              <td>{solve.username}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
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
                  {team.users.map((user, index) => {
                    return (
                      <tr key={user.username}>
                        <th scope="row" style={{ textAlign: "center" }}>
                          {index}
                        </th>
                        <td>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Team;
