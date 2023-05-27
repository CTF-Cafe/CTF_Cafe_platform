import { Outlet, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AppContext from "../Data/AppContext";

function Tools(props) {
  const globalData = useContext(AppContext);
  const [teams, setTeams] = useState([]);

  const getTeams = () => {
    axios
      .get(process.env.REACT_APP_BACKEND_URI + "/api/getTeams")
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          response.data.forEach((team) => {
            team.users.forEach((user) => {
              if (team.totalScore) {
                team.totalScore += user.score;
              } else {
                team.totalScore = user.score;
              }
            });
          });

          response.data.sort((a, b) => {
            if (a.totalScore < b.totalScore) {
              return 1;
            }

            if (a.totalScore > b.totalScore) {
              return -1;
            }

            return 0;
          });

          setTeams(response.data);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    getTeams();
  }, []);

  const downloadCert = () => {
    var canvas = document.getElementById("canvas"),
      ctx = canvas.getContext("2d");

    canvas.width = document.querySelector("#certImg").width;

    canvas.crossOrigin = "Anonymous";

    canvas.height = document.querySelector("#certImg").height;

    ctx.drawImage(document.querySelector("#certImg"), 0, 0);

    var selectedTeam = document.querySelector("#cert_team").value;

    var team = teams.find((obj) => {
      return obj.name === selectedTeam;
    });

    var index = teams.indexOf(team) + 1;
    var teamLength = teams.length;

    if (team === undefined) {
      index = 1;
      team = {
        name: "TEST_TEAM",
      };
    }

    if (index < 10) {
      index = "00" + index.toString();
    } else if (index < 100) {
      index = "0" + index.toString();
    }

    if (teamLength < 10) {
      teamLength = "00" + teamLength.toString();
    } else if (index < 100) {
      teamLength = "0" + teamLength.toString();
    }

    //   CTF Name
    ctx.font = "bold 55px Fira Code";
    ctx.fillStyle = "red";
    ctx.fillText(process.env.REACT_APP_CTF_NAME, 1350, 120);

    //   Team Nae
    ctx.font = "bold 34px Fira Code";
    ctx.fillStyle = "red";
    ctx.fillText(team.name, 410, 178);

    //   Team Placement
    ctx.font = "bold 80px Fira Code";
    ctx.fillStyle = "red";
    ctx.fillText(index, 1050, 275);

    //   Total Teams
    ctx.font = "bold 80px Fira Code";
    ctx.fillStyle = "red";
    ctx.fillText(teamLength, 1250, 275);

    var anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = "IMAGE.PNG";
    anchor.click();
  };

  const sendGlobalMessage = () => {
    const globalMessage = document.getElementById("global_message").value;

    axios
      .post(process.env.REACT_APP_BACKEND_URI + "/api/admin/sendGlobalMessage", {
        globalMessage: globalMessage
      }, { withCredentials: true })
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          if(response.data.state == "success") {
            globalData.alert.success("Message sent!");
          } else {
            globalData.alert.error(response.data.message);
          }
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return (
    <div>
      <h1
        className="display-1 bold color_white cool"
        style={{ textAlign: "center", marginBottom: "50px" }}
      >
        TOOLS
      </h1>
      <table className="table table-hover table-striped">
        <thead className="thead-dark hackerFont">
          <tr>
            <th scope="col">NAME</th>
            <th scope="col">INPUT</th>
            <th scope="col">RUN</th>
          </tr>
        </thead>

        {/* Hidden Stuff */}
        <img
          style={{ display: "none" }}
          src={process.env.REACT_APP_BACKEND_URI + "/api/assets/template.jpg"}
          crossorigin="anonymous"
          id="certImg"
        />
        <canvas id="canvas" hidden />

        <tbody>
          {/* <tr>
            <td>Generate Certificate</td>
            <td>
              <select id={"cert_team"}>
                <option value="test">Test</option>
                {teams.map((team) => {
                  return (
                    <option value={team.name} key={team.name}>
                      {team.name}
                    </option>
                  );
                })}
              </select>
            </td>
            <td>
              <button
                id="submit_p2"
                className="btn btn-outline-danger"
                type="button"
                onClick={() => {
                  downloadCert();
                }}
              >
                Run
              </button>
            </td>
          </tr> */}
          <tr>
            <td>Send Global Message</td>
            <td>
              <input type="text" id="global_message" />
            </td>
            <td>
              <button
                id="submit_p2"
                className="btn btn-outline-danger"
                type="button"
                onClick={() => {
                  sendGlobalMessage();
                }}
              >
                Run
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Tools;
