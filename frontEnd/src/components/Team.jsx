import { Outlet, Routes, Route, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import AppContext from "./Data/AppContext";
import Navbar from "./Global/Navbar";
import PieChart from "./Charts/PieChart";

function Team(props) {
  const globalData = useContext(AppContext);
  const location = useLocation();
  const selectedTeam = location.pathname.replace("/team/", "");
  const [team, setTeam] = useState({});

  const getTeam = (teamName) => {
    axios
      .post(process.env.REACT_APP_SERVER_URI + "/api/getTeam", {
        teamName: teamName,
      })
      .then((response) => {
        if (response.data.state != "error") {
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
      <Navbar />
      <div className="jumbotron bg-transparent mb-0 pt-3 radius-0">
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
