import ColumnChart from "../Charts/ColumnChart";
import PieChart from "../Charts/PieChart";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AppContext from "../Data/AppContext";

function Stats(props) {
  const globalData = useContext(AppContext);
  const [counts, setCounts] = useState({});
  const [challengeSolves, setChallengeSolves] = useState([]);
  const [challengeStatsTags, setChallengeStatsTags] = useState([]);
  const [challengeStatsDifficulty, setChallengeStatsDifficulty] = useState([]);

  const getStats = () => {
    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/admin/getStats",
        {
          name: "counts",
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
          setCounts(response.data);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });

    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/admin/getStats",
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
          let finalDataTags = [];
          let finalDataDifficulty = [];
          let finalDataSolves = [];

          response.data.forEach((data) => {
            finalDataSolves.push({
              name: data.name,
              solves: data.solveCount,
              tag: data.tags,
            });

            var result = finalDataTags.find((obj) => {
              return obj.name === data.tags[0];
            });

            if (result) {
              result.value += data.solveCount;
            } else {
              finalDataTags.push({
                name: data.tags[0],
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

          setChallengeSolves(finalDataSolves);
          setChallengeStatsTags(finalDataTags);
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
        className="display-1 bold color_white cool"
        style={{ textAlign: "center", marginBottom: "50px" }}
      >
        STATS
      </h1>
      <div className="row">
        <div className="col-md-6 mb-3">
          <h3>CTF Stats</h3>
          <p>Total Users: {counts.usersCount}</p>
          <p>Total Teams: {counts.teamsCount}</p>
          <p>Total Challenges: {counts.challengesCount}</p>
        </div>
        <div className="col-md-6 mb-3">
          <h3>Solve Counts</h3>
          <ColumnChart data={challengeSolves} tagColors={globalData.tagColors}/>
        </div>
      </div>
      <div className="row">
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
    </div>
  );
}

export default Stats;
