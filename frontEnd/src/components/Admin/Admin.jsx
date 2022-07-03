import { Outlet, Routes, Route, Link, useLocation } from "react-router-dom";
import Stats from "./Stats";
import Challenges from "./Challenges";
import Assets from "./Assets";
import Config from "./Config";
import Users from "./Users";
import Teams from "./Teams";
import Theme from "./Theme";
import Tools from "./Tools";
import ConfirmModal from "../Global/ConfirmModal";
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
      <ConfirmModal action={action} />
    </div>
  );
}

export default Admin;
