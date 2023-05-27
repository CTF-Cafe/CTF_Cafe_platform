import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import axios from "axios";
import AppContext from "../Data/AppContext";

function Dockers(props) {
  const globalData = useContext(AppContext);
  const [dockers, setDockers] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [editMode, setEditMode] = useState(false);

  const getDockers = (index) => {
    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/admin/getDockers",
        {
          page: index,
          search: searchQuery,
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
          setDockers(response.data);
          setPage(index);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    getDockers(page);
  }, [searchQuery]);

  const shutdownDocker = (docker) => {
    docker.progress = "stopping";
    setDockers([...dockers]);

    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/admin/shutdownDocker",
        {
          docker: docker,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state == "error") {
          globalData.alert.error(response.data.message);
          delete docker.progress;
          setDockers([...dockers]);
        } else {
          globalData.alert.success("Docker stopped!");
          getDockers();
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const restartDocker = (docker) => {
    docker.progress = "restarting";
    setDockers([...dockers]);

    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/admin/restartDocker",
        {
          docker: docker,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state == "error") {
          globalData.alert.error(response.data.message);
          delete docker.progress;
          setDockers([...dockers]);
        } else {
          globalData.alert.success("Docker restarted!");
          getDockers();
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
        DOCKERS
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
            onClick={() => getDockers(page - 1)}
            title="Prev Page"
          >
            <span className="fa-solid fa-arrow-left"></span>
          </button>
          <button
            className="btn btn-outline-danger btn-shadow"
            onClick={() => getDockers(page + 1)}
            title="Next Page"
          >
            <span className="fa-solid fa-arrow-right"></span>
          </button>
          <button
            className="btn btn-outline-danger btn-shadow"
            onClick={() => setEditMode(!editMode)}
            title="Edit Mode"
          >
            <span className="fa-solid fa-pencil"></span>
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
            <th scope="col">Challenge</th>
            <th scope="col">Team</th>
            <th scope="col">Port</th>
            <th scope="col">Deploy Time</th>
            <th scope="col">Random Flag</th>
            {editMode && <th scope="col">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {dockers.map((docker, index) => {
            return (
              <tr key={docker.dockerId}>
                <th scope="row" style={{ textAlign: "center" }}>
                  {index + (page - 1) * 100}
                </th>
                <td>{docker.challenge.name}</td>
                <td>
                  <Link
                    to={`/team/${docker.team.name}`}
                    className="text-decoration-none text-light bold"
                  >
                    {docker.team.name}
                  </Link>
                </td>
                <td>{docker.mappedPort}</td>
                <td>{docker.deployTime}</td>
                <td>
                  {docker.randomFlag
                    ? docker.randomFlag.substr(0, 10) + "..."
                    : "none"}
                </td>
                {editMode && (
                  <td>
                    <button
                      className="btn btn-outline-danger btn-shadow"
                      onClick={() => {
                        restartDocker(docker);
                      }}
                      title={
                        docker.progress === "restarting" ||
                        docker.progress === "starting"
                          ? "Restarting..."
                          : "Restart"
                      }
                    >
                      {docker.progress === "restarting" ||
                      docker.progress === "starting" ? (
                        <span className="fa-solid fa-spinner fa-spin" />
                      ) : (
                        <span className="fa-solid fa-arrows-rotate" />
                      )}
                    </button>
                    <button
                      className="btn btn-outline-danger btn-shadow"
                      onClick={() => {
                        shutdownDocker(docker);
                      }}
                      title={
                        docker.progress === "stopping" ? "Stopping..." : "Stop"
                      }
                    >
                      {docker.progress === "stopping" ? (
                        <span className="fa-solid fa-spinner fa-spin" />
                      ) : (
                        <span className="fa-solid fa-power-off" />
                      )}
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div
        style={{
          display: "flex",
          justifyContent: "start",
          marginBottom: "25px",
        }}
      >
        {/* Pagination Div */}
        <div>
          <button
            className="btn btn-outline-danger btn-shadow"
            onClick={() => getDockers(page - 1)}
            title="Prev Page"
          >
            <span className="fa-solid fa-arrow-left"></span>
          </button>
          <button
            className="btn btn-outline-danger btn-shadow"
            onClick={() => getDockers(page + 1)}
            title="Next Page"
          >
            <span className="fa-solid fa-arrow-right"></span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dockers;
