import { Outlet, Routes, Route, Link, useLocation } from "react-router-dom";
import Stats from "./Stats.js";
import Challenges from "./Challenges.js";
import Assets from "./Assets.js";
import Config from "./Config.js";
import Users from "./Users.js";
import Teams from "./Teams.js";
import Theme from "./Theme.js";
import Tools from "./Tools.js";
import { useState } from "react";

function Admin(props) {
  const location = useLocation();
  const pathName = location.pathname.replace("/admin", "");
  const [action, setAction] = useState({});

  return (
    <div>
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
                <Link to={`/admin/`}>
                  <a className="p-3 text-decoration-none text-light bold">
                    Stats
                  </a>
                </Link>
                <Link to={`/admin/users`}>
                  <a className="p-3 text-decoration-none text-light bold">
                    Users
                  </a>
                </Link>
                <Link to={`/admin/teams`}>
                  <a className="p-3 text-decoration-none text-light bold">
                    Teams
                  </a>
                </Link>
                <Link to={`/admin/challenges`}>
                  <a className="p-3 text-decoration-none text-light bold">
                    Challenges
                  </a>
                </Link>
                <Link to={`/admin/assets`}>
                  <a className="p-3 text-decoration-none text-light bold">
                    Assets
                  </a>
                </Link>
                <Link to={`/admin/config`}>
                  <a className="p-3 text-decoration-none text-light bold">
                    Config
                  </a>
                </Link>
                <Link to={`/admin/theme`}>
                  <a className="p-3 text-decoration-none text-light bold">
                    Theme
                  </a>
                </Link>
                <Link to={`/admin/tools`}>
                  <a className="p-3 text-decoration-none text-light bold">
                    Tools
                  </a>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </div>
      <div className="jumbotron bg-transparent mb-0 pt-3 radius-0">
        <div className="container">
          {pathName == "/" || pathName == "" ? (
            <Stats />
          ) : pathName == "/challenges/" || pathName == "/challenges" ? (
            <Challenges setAction={setAction} />
          ) : pathName == "/assets/" || pathName == "/assets" ? (
            <Assets />
          ) : pathName == "/config/" || pathName == "/config" ? (
            <Config />
          ) : pathName == "/users/" || pathName == "/users" ? (
            <Users setAction={setAction} />
          ) : pathName == "/teams/" || pathName == "/teams" ? (
            <Teams setAction={setAction} />
          ) : pathName == "/theme/" || pathName == "/theme" ? (
            <Theme />
          ) : pathName == "/tools/" || pathName == "/tools" ? (
            <Tools />
          ) : (
            <h1 className="display-1 bold color_white content__title">
              404<span className="vim-caret">&nbsp;</span>
            </h1>
          )}
        </div>
      </div>

      {/* <!-- Modal --> */}
      <div
        className="modal fade"
        id="confirmModal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="confirmModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="confirmModalLabel">
                Confirm action?
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-footer" style={{ justifyContent: "center" }}>
              <button type="button" className="btn btn-danger" data-dismiss="modal">
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                data-dismiss="modal"
                onClick={() => {
                  action.function(action.e, action.data);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
