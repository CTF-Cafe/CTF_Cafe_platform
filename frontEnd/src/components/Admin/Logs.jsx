import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AppContext from "../Data/AppContext";

function Stats() {
  const globalData = useContext(AppContext);
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const getLogs = (index) => {
    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/admin/getLogs",
        {
          page: index,
          search: searchQuery,
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
        } else {
          setLogs(response.data);
          setPage(index);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    getLogs(page);
  }, [searchQuery]);

  return (
    <div>
      <h1
        className="display-1 bold color_white cool"
        style={{ textAlign: "center", marginBottom: "50px" }}
      >
        LOGS
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
            onClick={() => getLogs(page - 1)}
            title="Prev Page"
          >
            <span className="fa-solid fa-arrow-left"></span>
          </button>
          <button
            className="btn btn-outline-danger btn-shadow"
            onClick={() => getLogs(page + 1)}
            title="Next Page"
          >
            <span className="fa-solid fa-arrow-right"></span>
          </button>
          <a
            className="btn btn-outline-danger btn-shadow"
            href={`data:text/json;charset=utf-8,${encodeURIComponent(
              JSON.stringify(logs)
            )}`}
            download="logs.json"
            title="Export Logs"
          >
            <span className="fa-solid fa-file-export" />
          </a>
        </div>
        <div>
          <input
            type="text"
            className="form-control"
            id="searchQuery"
            placeholder="Search"
            onChange={(e) => {
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
            <th scope="col">Author IP</th>
            <th scope="col">Author ID</th>
            <th scope="col">Author Name</th>
            <th scope="col">Function</th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => {
            return (
              <tr key={log._id}>
                <th scope="row" style={{ textAlign: "center" }}>
                  {index + ((page - 1)* 100)}
                </th>
                <td>{log.authorIp}</td>
                <td>{log.authorId.substring(0, 8)}</td>
                <td>{log.authorName}</td>
                <td>{log.function.replace("exports.", "")}</td>
                <td>{log.result ? JSON.parse(log.result).message : ""}</td>
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
            onClick={() => getLogs(page - 1)}
            title="Prev Page"
          >
            <span className="fa-solid fa-arrow-left"></span>
          </button>
          <button
            className="btn btn-outline-danger btn-shadow"
            onClick={() => getLogs(page + 1)}
            title="Next Page"
          >
            <span className="fa-solid fa-arrow-right"></span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Stats;
