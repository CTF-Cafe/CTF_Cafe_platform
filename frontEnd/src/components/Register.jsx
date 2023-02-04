import { Outlet, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import { useContext } from 'react';
import AppContext from './Data/AppContext';
import Navbar from './Global/Navbar';

function Register(props) {
  const globalData = useContext(AppContext);
  const register = () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;

    axios
      .post(process.env.REACT_APP_BACKEND_URI + "/api/register", {
        username: username,
        password: password,
        email: email
      }, { withCredentials: true })
      .then((response) => {
        if (response.data.state == "success") {
          globalData.alert.success(response.data.message);
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
                {process.env.REACT_APP_CTF_NAME}<span className="vim-caret">&nbsp;</span>
              </h1>
              <p className="text-grey text-spacey hackerFont lead mb-5">
                Join the worlds leading forces, and battle it out for the win!
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
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Email"
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
                onClick={register}
              >
                <h4>Register</h4>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
