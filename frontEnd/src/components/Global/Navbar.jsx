import { Outlet, Routes, Route, Link } from "react-router-dom";
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
              <Link to={`/`} style={{ display: "flex" }}>
                <a className="pl-md-0 p-3 text-decoration-none text-light">
                  <h3 className="bold" style={{ margin: 0 }}>
                    <span className="color_danger">
                      {process.env.REACT_APP_CTF_NAME.split("_")[0]}
                    </span>
                    <span className="color_white">
                      {process.env.REACT_APP_CTF_NAME.split("_")[1]}
                    </span>
                  </h3>
                </a>
              </Link>
            </div>
            <div className="navbar-nav ml-auto">
              {globalData.userData.isAdmin && globalData.loggedIn ? (
                <Link to={`/admin`}>
                  <a className="p-3 text-decoration-none text-light bold">
                    Admin_Mode
                  </a>
                </Link>
              ) : null}
              <Link to={`/`}>
                <a className="p-3 text-decoration-none text-light bold">Home</a>
              </Link>
              <Link to={`/rules`}>
                <a className="p-3 text-decoration-none text-light bold">
                  Rules
                </a>
              </Link>
              <Link to={`/hackerboard`}>
                <a className="p-3 text-decoration-none text-light bold">
                  Hackerboard
                </a>
              </Link>
              {globalData.loggedIn ? (
                <>
                  <Link to={`/challenges`}>
                    <a className="p-3 text-decoration-none text-light bold">
                      Challenges
                    </a>
                  </Link>
                  <Link to={`/userteam`}>
                    <a className="p-3 text-decoration-none text-light bold">
                      Team
                    </a>
                  </Link>
                  <Link to={`/logout`}>
                    <a className="p-3 text-decoration-none text-light bold">
                      Logout
                    </a>
                  </Link>
                  <Link to={`/user/${globalData.userData.username}`}>
                    <span
                      className="fa fa-user-ninja text-light bold"
                      style={{ fontSize: "18px", paddingRight: "10px"}}
                    ></span>
                  </Link>
                  <Link to={`/usersettings`}>
                    <span
                      className="fa fa-cog text-light bold"
                      style={{ fontSize: "18px" }}
                    ></span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to={`/login`}>
                    <a className="p-3 text-decoration-none text-light bold">
                      Login
                    </a>
                  </Link>
                  <Link to={`/register`}>
                    <a className="p-3 text-decoration-none text-light bold">
                      Register
                    </a>
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
