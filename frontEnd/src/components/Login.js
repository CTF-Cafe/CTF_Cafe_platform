import { Outlet, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import AppContext from "./Data/AppContext";
import Navbar from "./Global/Navbar.js";

function Login(props) {
  const globalData = useContext(AppContext);

  const checkLogin = () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    axios
      .post(process.env.REACT_APP_SERVER_URI + "/api/login", {
        username: username,
        password: password,
      })
      .then((response) => {
        if (response.data.state == "success") {
          globalData.alert.success("Logged In!");
          globalData.setUserData(response.data.user);
          globalData.setLoggedIn(true);
          globalData.navigate("/", { replace: true });
        } else {
          globalData.alert.error(response.data.message);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return (
    <div>
      <div className="glitch">
        <div className="glitch__img"></div>
        <div className="glitch__img"></div>
        <div className="glitch__img"></div>
        <div className="glitch__img"></div>
        <div className="glitch__img"></div>
      </div>

      <Navbar />

      <div className="jumbotron bg-transparent mb-0 pt-3 radius-0">
        <div className="container">
          <div className="row">
            <div className="col-xl-8">
              <h1 className="display-1 bold color_white content__title">
                {process.env.REACT_APP_CTF_NAME}
                <span className="vim-caret">&nbsp;</span>
              </h1>
              <p className="text-grey text-spacey hackerFont lead mb-5">
                Type your credentials to conquer the world
              </p>
              <div className="row hackerFont">
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      placeholder="Username"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="Password"
                    />
                    <small id="passHelp" className="form-text text-muted">
                      Make sure nobody's behind you
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-8">
              <button
                className="btn btn-outline-danger btn-shadow px-3 my-2 ml-0 ml-sm-1 text-left"
                onClick={checkLogin}
              >
                <h4>Login</h4>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
