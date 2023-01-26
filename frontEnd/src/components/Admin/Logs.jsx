import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AppContext from "../Data/AppContext";

function Stats(props) {
  const globalData = useContext(AppContext);
  const [logs, setLogs] = useState([]);

  const getLogs = () => {
    axios
      .post(process.env.REACT_APP_SERVER_URI + "/api/admin/getLogs", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          setLogs(response.data);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    getLogs();
  }, []);

  return (
    <div>
      <h1
        className="display-1 bold color_white"
        style={{ textAlign: "center", marginBottom: "50px" }}
      >
        LOGS
      </h1>
      <table className="table table-hover table-striped">
        <thead className="thead-dark hackerFont">
          <tr>
            <th scope="col" style={{ textAlign: "center" }}>
              #
            </th>
            <th scope="col">Author IP</th>
            <th scope="col">Author ID</th>
            <th scope="col">Function</th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>
            {console.log(logs)}
          {logs.map((log, index) => {
            return (
              <tr key={log._id}>
                <th scope="row" style={{ textAlign: "center" }}>
                  {index}
                </th>
                <td>{log.authorIp}</td>
                <td>{log.authorId}</td>
                <td>{log.function}</td>
                <td>{JSON.stringify(log.result)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Stats;
