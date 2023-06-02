import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useContext } from "react";
import AppContext from "./Data/AppContext";
import Navbar from "./Global/Navbar";
import PieChart from "./Charts/PieChart";

function Team(props) {
  const globalData = useContext(AppContext);
  const location = useLocation();
  const selectedTeam = decodeURIComponent(
    location.pathname.replace("/team/", "")
  );
  const [team, setTeam] = useState({});
  const [challengeStatsTags, setChallengeStatsTags] = useState([]);
  const [challengeStatsDifficulty, setChallengeStatsDifficulty] = useState([]);

  const getTeam = (teamName) => {
    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/getTeam",
        {
          teamName: teamName,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        if (response.data.state !== "error") {
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
                className="display-1 bold color_white cool"
                style={{ textAlign: "center", marginBottom: "25px" }}
              >
                TEAM NOT FOUND
              </h1>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: "center" }}>
                <h1
                  className="display-1 bold color_white cool"
                  style={{ textAlign: "center", marginBottom: "25px" }}
                >
                  <span style={{ fontSize: "50px", marginRight: "10px" }}>
                    {team.country}
                  </span>
                  {team.name.toUpperCase()}
                </h1>
                <div style={{ textAlign: "center" }}>
                  <p>Score : {team.score}</p>
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
              {team.solved.length > 0 && (
                <>
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
                        {team.solved
                          .sort((a, b) =>
                            a.timestamp > b.timestamp
                              ? 1
                              : b.timestamp > a.timestamp
                              ? -1
                              : 0
                          )
                          .map((solve, index) => {
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
                                  {
                                    new Date(solve.timestamp)
                                      .toString()
                                      .split("(")[0]
                                  }
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
                        {team.hintsBought.map((hint, index) => {
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
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Team;
