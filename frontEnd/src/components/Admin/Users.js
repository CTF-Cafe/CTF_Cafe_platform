import { Outlet, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AppContext from "../Data/AppContext";

function Users(props) {
  const globalData = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);

  const getUsers = (index) => {
    axios
      .post(process.env.REACT_APP_SERVER_URI + "/api/admin/getUsers", {
        page: index,
      })
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state == "error") {
          globalData.alert.error(response.data.message);
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

          setUsers(response.data);
          setPage(index);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    getUsers(1);
  }, []);

  const deleteUser = (e, user) => {
    axios
      .post(process.env.REACT_APP_SERVER_URI + "/api/admin/deleteUser", {
        user: user,
      })
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          if (response.data.state == "success") {
            globalData.alert.success("Deleted user!");
            getUsers(page);
          } else {
            globalData.alert.error(response.data.message);
            getUsers(page);
          }
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const addAdmin = (e, user) => {
    axios
      .post(process.env.REACT_APP_SERVER_URI + "/api/admin/addAdmin", {
        user: user,
      })
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          if (response.data.state == "success") {
            globalData.alert.success("User is now admin!");
            getUsers(page);
          } else {
            globalData.alert.error(response.data.message);
            getUsers(page);
          }
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const removeAdmin = (e, user) => {
    axios
      .post(process.env.REACT_APP_SERVER_URI + "/api/admin/removeAdmin", {
        user: user,
      })
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          if (response.data.state == "success") {
            globalData.alert.success("Admin removed!");
            getUsers(page);
          } else {
            globalData.alert.error(response.data.message);
            getUsers(page);
          }
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const previousPage = () => {
    getUsers(page - 1);
  };

  const nextPage = () => {
    getUsers(page + 1);
  };

  return (
    <div>
      <h1
        className="display-1 bold color_white"
        style={{ textAlign: "center", marginBottom: "50px" }}
      >
        USERS
      </h1>
      <div style={{marginBottom: '25px'}}>
        <button
          className="btn btn-outline-danger btn-shadow"
          onClick={previousPage}
        >
          <span className="fa fa-arrow-left"></span>
        </button>
        <button
          className="btn btn-outline-danger btn-shadow"
          onClick={nextPage}
        >
          <span className="fa fa-arrow-right"></span>
        </button>
      </div>
      <table className="table table-hover table-striped">
        <thead className="thead-dark hackerFont">
          <tr>
            <th scope="col" style={{ textAlign: "center" }}>
              #
            </th>
            <th scope="col">Username</th>
            <th scope="col">User Score</th>
            <th scope="col">User Solves</th>
            <th scope="col">Admin</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => {
            return (
              <tr key={user.username}>
                <th scope="row" style={{ textAlign: "center" }}>
                  {(index + ((page - 1) * 100))}
                </th>
                <td>
                  <button
                    className="btn btn-outline-danger btn-shadow"
                    data-toggle="modal"
                    data-target="#confirmModal"
                    onClick={(e) => {
                      props.setAction({
                        function: deleteUser,
                        e: e,
                        data: user,
                      });
                    }}
                    style={{ marginRight: "30px" }}
                  >
                    <span className="fa fa-minus"></span>
                  </button>
                  {user.username}
                </td>
                <td>{user.score}</td>
                <td>{user.solved.length}</td>
                <td>
                  {user.isAdmin.toString()}{" "}
                  <button
                    className="btn btn-outline-danger btn-shadow"
                    data-toggle="modal"
                    data-target="#confirmModal"
                    onClick={(e) => {
                      props.setAction({
                        function: addAdmin,
                        e: e,
                        data: user,
                      });
                    }}
                    style={{ marginLeft: "15px" }}
                  >
                    <span className="fa fa-arrow-up"></span>
                  </button>
                  <button
                    className="btn btn-outline-danger btn-shadow"
                    data-toggle="modal"
                    data-target="#confirmModal"
                    onClick={(e) => {
                      props.setAction({
                        function: removeAdmin,
                        e: e,
                        data: user,
                      });
                    }}
                    style={{ marginLeft: "5px" }}
                  >
                    <span className="fa fa-arrow-down"></span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Users;
