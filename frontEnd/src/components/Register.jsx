import { Outlet, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import AppContext from "./Data/AppContext";
import Navbar from "./Global/Navbar";

function Register(props) {
  const globalData = useContext(AppContext);
  const register = () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirm_password = document.getElementById("confirm_password").value;
    const email = document.getElementById("email").value;
    const userCategory = document.getElementById("userCategory").value;

    if (password !== confirm_password) {
      globalData.alert.error("Passwords don't match!");
    } else {
      axios
        .post(
          process.env.REACT_APP_BACKEND_URI + "/api/register",
          {
            username: username,
            password: password,
            email: email,
            userCategory: userCategory,
          },
          { withCredentials: true }
        )
        .then((response) => {
          if (response.data.state === "success") {
            globalData.alert.success(response.data.message);
            if (response.data.verified) {
              // Registered, now get all needed data from session if verified
              axios
                .get(process.env.REACT_APP_BACKEND_URI + "/api/checkSession", {
                  withCredentials: true,
                })
                .then((res) => {
                  if (res.data.state === "success") {
                    if (res.data.team) {
                      const clubArray = (arr) => {
                        return arr.reduce((acc, val, ind) => {
                          const index = acc.findIndex(
                            (el) => el.username === val.username
                          );
                          if (index !== -1) {
                            acc[index].solved.push(val.solved[0]);
                            acc[index].score += val.score;
                          } else {
                            acc.push(val);
                          }
                          return acc;
                        }, []);
                      };

                      res.data.team.users = clubArray(res.data.team.users);

                      res.data.team.users.forEach((user) => {
                        user.solved.forEach((solved) => {
                          user.score += solved.points;
                        });
                      });

                      res.data.user.team = res.data.team;
                    }

                    globalData.setUserData(res.data.user);
                    globalData.setLoggedIn(true);
                    globalData.navigate("/", { replace: true });
                  } else {
                    globalData.alert.error(response.data.message);
                  }
                })
                .catch(console.log);
            }
          } else {
            globalData.alert.error(response.data.message);
          }
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  };

  return (
    <div>
      <div className="bg" />

      <Navbar />

      <div
        className="jumbotron bg-transparent mb-0 pt-3 radius-0"
        style={{ position: "relative" }}
      >
        <div className="container">
          <div className="row">
            <div className="col-xl-8">
              <h1 className="display-1 bold color_white content__title cool">
                {process.env.REACT_APP_CTF_NAME.toUpperCase()}
                <span className="vim-caret">&nbsp;</span>
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
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      className="form-control"
                      id="confirm_password"
                      placeholder="Confirm Password"
                    />
                    <small id="passHelp" className="form-text text-muted">
                      Make sure nobody's behind you
                    </small>
                  </div>
                  {globalData.userCategories.length > 0 && (
                    <div className="form-group">
                      <label>Category : </label>
                      <select id="userCategory" className="form-control">
                        {globalData.userCategories.map((c) => (
                          <option key={c} value={c}>{c.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  )}
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
