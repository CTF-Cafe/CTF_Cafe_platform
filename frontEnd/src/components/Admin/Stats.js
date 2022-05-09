import { Outlet, Routes, Route, Link } from "react-router-dom";
import BarChart from "../Charts/BarChart.js";
import PieChart from "../Charts/PieChart.js";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AppContext from "../Data/AppContext";

function Stats(props) {
  const globalData = useContext(AppContext);
  const [userStats, setUserStats] = useState([]);
  const [challengeStatsCategory, setChallengeStatsCategory] = useState([]);
  const [challengeStatsDifficulty, setChallengeStatsDifficulty] = useState([]);
  const navigate = useNavigate();

  const getStats = () => {
    axios
      .post(
        process.env.REACT_APP_SERVER_URI + "/api/admin/getStats",
        {
          name: "users",
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
          response.data.sort((a, b) => {
            if (a.score < b.score) {
              return 1;
            }

            if (a.score > b.score) {
              return -1;
            }

            return 0;
          });

          const highestScore = response.data[0].score;

          const one = {
            score: `${highestScore / 1.25} - ${highestScore}`,
            count: 0,
          };

          let two = {
            score: `${highestScore / 2} - ${highestScore / 1.25 - 1}`,
            count: 0,
          };

          let three = {
            score: `${highestScore / 4} - ${highestScore / 2 - 1}`,
            count: 0,
          };

          let four = {
            score: `${0} - ${highestScore / 4 - 1}`,
            count: 0,
          };

          response.data.forEach((item) => {
            if (item.score >= highestScore / 1.25) {
              one.count += 1;
            } else if (item.score >= highestScore / 2) {
              two.count += 1;
            } else if (item.score >= highestScore / 4) {
              three.count += 1;
            } else {
              four.count += 1;
            }
          });

          const finalData = [one, two, three, four];

          setUserStats(finalData);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });

    axios
      .post(
        process.env.REACT_APP_SERVER_URI + "/api/admin/getStats",
        {
          name: "challenges",
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
          let finalDataCategory = [];
          let finalDataDifficulty = [];

          response.data.forEach((data) => {
            var result = finalDataCategory.find((obj) => {
              return obj.name == data.category;
            });

            if (result) {
              finalDataCategory[finalDataCategory.indexOf(result)].value +=
                data.solveCount;
            } else {
              finalDataCategory.push({
                name: data.category,
                value: data.solveCount,
              });
            }

            var result = finalDataDifficulty.find((obj) => {
              return (
                obj.name ==
                (data.level == 3
                  ? "Ninja"
                  : data.level == 2
                  ? "Hard"
                  : data.level == 1
                  ? "Medium"
                  : "Easy")
              );
            });

            if (result) {
              finalDataDifficulty[finalDataDifficulty.indexOf(result)].value +=
                data.solveCount;
            } else {
              finalDataDifficulty.push({
                name:
                  data.level == 3
                    ? "Ninja"
                    : data.level == 2
                    ? "Hard"
                    : data.level == 1
                    ? "Medium"
                    : "Easy",
                value: data.solveCount,
              });
            }
          });

          setChallengeStatsCategory(finalDataCategory);
          setChallengeStatsDifficulty(finalDataDifficulty);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    getStats();
  }, []);

  return (
    <div>
      <h1
        className="display-1 bold color_white"
        style={{ textAlign: "center", marginBottom: "50px" }}
      >
        STATS
      </h1>
      <div style={{ marginBottom: "100px" }}>
        <h3>Score Distribution</h3>
        <BarChart data={userStats} />
      </div>
      <div className="row">
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
    </div>
  );
}

export default Stats;
