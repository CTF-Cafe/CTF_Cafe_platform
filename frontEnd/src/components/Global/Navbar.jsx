/* eslint-disable jsx-a11y/anchor-is-valid */
import { Link } from "react-router-dom";
import { useContext } from "react";
import AppContext from "../Data/AppContext";

function Navbar() {
  const globalData = useContext(AppContext);

  return (
    <div className="navbar-dark text-white">
      <div className="container">
        <nav className="navbar px-0 py-0 navbar-expand-lg navbar-dark">
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span
              className="navbar-toggler-icon"
              style={{ filter: "brightness(10)" }}
            ></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
              <Link
                to={`/`}
                style={{ display: "flex", paddingRight: "10px" }}
                className="pl-md-0 p-3 text-decoration-none text-light"
              >
                <h3 className="bold" style={{ margin: 0 }}>
                  {process.env.REACT_APP_CTF_NAME.split("_").map((text, i) =>
                    i % 2 ? (
                      <span className="color_white" key={text}>
                        {text}
                      </span>
                    ) : (
                      <span className="color_danger" key={text}>
                        {text}
                      </span>
                    )
                  )}
                </h3>
              </Link>
            </div>
            <div className="navbar-nav ml-auto">
              {globalData.userData.isAdmin && globalData.loggedIn ? (
                <Link
                  to={`/admin`}
                  style={{ marginRight: "25px" }}
                  className="text-decoration-none text-light bold"
                >
                  Admin_Mode
                </Link>
              ) : null}
              <Link
                to={`/`}
                style={{ marginRight: "25px" }}
                className="text-decoration-none text-light bold"
              >
                Home
              </Link>
              <Link
                to={`/rules`}
                style={{ marginRight: "25px" }}
                className="text-decoration-none text-light bold"
              >
                Rules
              </Link>
              <Link
                to={`/hackerboard`}
                style={{ marginRight: "25px" }}
                className="text-decoration-none text-light bold"
              >
                Hackerboard
              </Link>
              {globalData.loggedIn ? (
                <>
                  <Link
                    to={`/challenges`}
                    style={{ marginRight: "25px" }}
                    className="text-decoration-none text-light bold"
                  >
                    Challenges
                  </Link>
                  <Link
                    to={`/userteam`}
                    style={{ marginRight: "25px" }}
                    className="text-decoration-none text-light bold"
                  >
                    Team
                  </Link>
                  <Link
                    to={`/logout`}
                    style={{ marginRight: "25px" }}
                    className="text-decoration-none text-light bold"
                  >
                    Logout
                  </Link>
                  <a className="btn-group" style={{ marginRight: "10px" }}>
                    {globalData.notifications.length > 0 ? (
                      <>
                        <span
                          className="fa-solid fa-bell text-light bold"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                          style={{
                            fontSize: "18px",
                            cursor: "pointer",
                          }}
                        ></span>
                        <span
                          className="fa-solid fa-circle color_danger bold"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                          style={{
                            fontSize: "8px",
                            cursor: "pointer",
                            position: "absolute",
                            left: "8px",
                          }}
                        ></span>
                      </>
                    ) : (
                      <span
                        className="fa-solid fa-bell text-light bold"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                        style={{
                          fontSize: "18px",
                          cursor: "pointer",
                        }}
                      ></span>
                    )}
                    <div
                      className="dropdown-menu dropdown-menu-right"
                      onClick={(e) => e.stopPropagation()}
                      style={{ padding: "30px" }}
                    >
                      {globalData.notifications.map((notification) => {
                        return (
                          <div
                            key={notification.message}
                            className="card-header text-light"
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              borderTop:
                                notification.type === "admin"
                                  ? "4px solid #ffff00c4"
                                  : "4px solid #ef121b94",
                              borderRadius: "6px",
                              whiteSpace: "nowrap",
                              width: "100%",
                              marginBottom: "5px",
                            }}
                          >
                            {notification.type === "first_blood" && (
                              <span
                                className="fa-solid fa-droplet"
                                style={{
                                  fontSize: "24px",
                                  color: "red",
                                  marginRight: "10px",
                                }}
                              ></span>
                            )}
                            <div>{notification.message}</div>
                            <span
                              className="fa-solid fa-circle-xmark text-light notification-close"
                              style={{
                                fontSize: "24px",
                                cursor: "pointer",
                                marginLeft: "10px",
                              }}
                              onClick={() => {
                                const newNotifications = [
                                  ...globalData.notifications.filter(
                                    (x) => x !== notification
                                  ),
                                ];
                                globalData.setNotifications(newNotifications);
                                localStorage.setItem(
                                  "notifications",
                                  JSON.stringify(newNotifications)
                                );
                              }}
                            ></span>
                          </div>
                        );
                      })}
                      {globalData.notifications.length > 0 ? (
                        <div style={{ textAlign: "center" }}>
                          <span
                            onClick={() => {
                              globalData.setNotifications([]);
                              localStorage.setItem(
                                "notifications",
                                JSON.stringify([])
                              );
                            }}
                            style={{
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              width: "100%",
                              textDecoration: "underline",
                            }}
                          >
                            Mark all as read
                          </span>
                        </div>
                      ) : (
                        <span
                          style={{
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            width: "100%",
                          }}
                        >
                          No Notifications
                        </span>
                      )}
                    </div>
                  </a>
                  <Link
                    to={`/user/${globalData.userData.username}`}
                    style={{ marginRight: "10px" }}
                  >
                    <span
                      className="fa-solid fa-user-ninja text-light bold"
                      style={{ fontSize: "18px" }}
                    ></span>
                  </Link>
                  <Link to={`/usersettings`}>
                    <span
                      className="fa-solid fa-cog text-light bold"
                      style={{ fontSize: "18px" }}
                    ></span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={`/login`}
                    style={{ marginRight: "25px" }}
                    className="text-decoration-none text-light bold"
                  >
                    Login
                  </Link>
                  <Link
                    to={`/register`}
                    style={{ marginRight: "25px" }}
                    className="text-decoration-none text-light bold"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Navbar;
