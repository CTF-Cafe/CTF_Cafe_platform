import { Outlet, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AppContext from "../Data/AppContext";

function Teams(props) {
  const globalData = useContext(AppContext);
  const [teams, setTeams] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getTeams(page);
  }, [searchQuery]);

  const getTeams = (index) => {
    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/getTeams",
        {
          page: index,
          search: searchQuery
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state == "error") {
          globalData.alert.error(response.data.message);
        } else {
          setTeams(response.data);
          setPage(index);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    getTeams(1);
  }, []);

  const deleteTeam = (e, team) => {
    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/admin/deleteTeam",
        {
          team: team,
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
          if (response.data.state == "success") {
            globalData.alert.success("Deleted team!");
            getTeams(page);
          } else {
            globalData.alert.error(response.data.message);
            getTeams(page);
          }
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const previousPage = () => {
    getTeams(page - 1);
  };

  const nextPage = () => {
    getTeams(page + 1);
  };

  return (
    <div>
      <h1
        className="display-1 bold color_white"
        style={{ textAlign: "center", marginBottom: "50px" }}
      >
        TEAMS
      </h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "25px",
        }}
      >
        <div>
          <button
            className="btn btn-outline-danger btn-shadow"
            onClick={previousPage}
          >
            <span className="fa-solid fa-arrow-left"></span>
          </button>
          <button
            className="btn btn-outline-danger btn-shadow"
            onClick={nextPage}
          >
            <span className="fa-solid fa-arrow-right"></span>
          </button>
        </div>
        <div>
          <input
            type="text"
            className="form-control"
            id="searchQuery"
            placeholder="Search"
            onChange={(e) => {
              setPage(1);
              setSearchQuery(e.target.value);
            }}
          />
        </div>
      </div>
      <table className="table table-hover table-striped">
        <thead className="thead-dark hackerFont">
          <tr>
            <th scope="col" style={{ textAlign: "center" }}>
              #
            </th>
            <th scope="col">Team Name</th>
            <th scope="col">Team Users</th>
            <th scope="col">Team Score</th>
            <th scope="col">Team Solves</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => {
            return (
              <tr key={team.name}>
                <th scope="row" style={{ textAlign: "center" }}>
                  {index + (page - 1) * 100}
                </th>
                <td>
                  <button
                    className="btn btn-outline-danger btn-shadow"
                    data-toggle="modal"
                    data-target="#confirmModal"
                    onClick={(e) => {
                      props.setAction({
                        function: deleteTeam,
                        e: e,
                        data: team,
                      });
                    }}
                    style={{ marginRight: "30px" }}
                  >
                    <span className="fa-solid fa-minus"></span>
                  </button>
                  {team.name}
                </td>
                <td>
                  {team.users.map((user) => {
                    return <p key={user.username}>{user.username}</p>;
                  })}
                </td>
                <td>{team.totalScore}</td>
                <td>{team.totalSolved}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Teams;
