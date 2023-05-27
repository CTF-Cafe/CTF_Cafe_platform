import axios from "axios";
import { useContext } from "react";
import AppContext from "./Data/AppContext";
import Navbar from "./Global/Navbar";

function Login(props) {
  const globalData = useContext(AppContext);

  const checkLogin = () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/login",
        {
          username: username,
          password: password,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state == "success") {
          // Logged in, now get all needed data from session
          axios
            .get(process.env.REACT_APP_BACKEND_URI + "/api/checkSession", {
              withCredentials: true,
            })
            .then((res) => {
              if (res.data.state == "success") {
                globalData.alert.success("Logged In!");

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
      <div className="bg" />

      <Navbar />

      <div className="jumbotron bg-transparent mb-0 pt-3 radius-0" style={{ position: "relative" }}>
        <div className="container">
          <div className="row">
            <div className="col-xl-8">
              <h1 className="display-1 bold color_white content__title cool">
                {process.env.REACT_APP_CTF_NAME.toUpperCase()}
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
