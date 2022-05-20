import { Outlet, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { saveAs } from "file-saver";
import LoadingScreen from "react-loading-screen";
import AppContext from "./Data/AppContext";
import Navbar from "./Global/Navbar";
import copy from 'copy-to-clipboard';
import "../css/prism.css";
import Prism from "prismjs";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/components/prism-python";
import "prismjs/components/prism-javascript";

// Prepend `0` for one digit numbers. For that the number has to be
// converted to string, as numbers don't have length method
const padTime = (time) => {
  return String(time).length === 1 ? `0${time}` : `${time}`;
};

const format = (time) => {
  // Convert seconds into minutes and take the whole part
  const minutes = Math.floor(time / 60);

  // Get the seconds left after converting minutes
  const seconds = time % 60;

  //Return combined values as string in format mm:ss
  return `${minutes}:${padTime(seconds)}`;
};

const formatHours = (time) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor((time % 3600) % 60);

  //Return combined values as string in format mm:ss
  return `${padTime(hours)}:${padTime(minutes)}:${padTime(seconds)}`;
};

function Challenges(props) {
  const globalData = useContext(AppContext);
  const [challenges, setChallenges] = useState([]);
  const [currentHint, setCurrentHint] = useState("");
  const [currentSnippet, setCurrentSnippet] = useState({});
  const [categories, setCategories] = useState([]);
  const [endTime, setEndTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    let timer;
    if (counter > 0) {
      timer = setTimeout(() => setCounter((c) => c - 1), 1000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [counter]);

  const getChallenges = () => {
    axios
      .get(process.env.REACT_APP_SERVER_URI + "/api/user/getChallenges", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state == "error") {
          var startDate = new Date();
          var endDate = new Date(parseInt(response.data.startTime + "000"));
          var secondsTillStart = parseInt(
            (endDate.getTime() - startDate.getTime()) / 1000
          );

          setCounter(secondsTillStart);
          setLoading(false);
        } else {
          response.data.challenges.sort((a, b) => {
            if (a.level < b.level) {
              return -1;
            }

            if (a.level > b.level) {
              return 1;
            }

            return 0;
          });

          response.data.categories.sort((a, b) => {
            if (a == "misc") {
              return 1;
            }

            if (b == "misc") {
              return -1;
            }

            return 0;
          });
          setChallenges(response.data.challenges);
          setCategories(response.data.categories);
          setEndTime(response.data.endTime);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const downloadFile = (file, name) => {
    saveAs(process.env.REACT_APP_SERVER_URI + "/api/assets/" + file, name); // Put your image url here.
  };

  useEffect(() => {
    Prism.highlightAll();
  }, [currentSnippet]);

  useEffect(() => {
    getChallenges();
  }, []);

  const submitFlag = (index) => {
    const flag = document.getElementById(`flag_id_${index}`).value;

    axios
      .post(
        process.env.REACT_APP_SERVER_URI + "/api/user/submitFlag",
        {
          flag: flag,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state == "success") {
          globalData.setUserData(response.data.user);
          globalData.alert.success("Correct Flag!");
          getChallenges();
        } else {
          if (response.data.state == "sessionError") {
            globalData.alert.error("Session expired!");
            globalData.setUserData({});
            globalData.setLoggedIn(false);
            globalData.navigate("/", { replace: true });
          } else {
            globalData.alert.error(response.data.message);
          }
        }
      })
      .catch((err) => {
        globalData.alert.error(err.message);
        console.log(err.message);
      });
  };

  const capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleEnterSubmit = (event, index) => {
    // look for the `Enter` keyCode
    if (event.keyCode === 13 || event.which === 13) {
      submitFlag(index);
    }
  };

  return (
    <div>
      <LoadingScreen
        loading={loading}
        bgColor="#0c0d16"
        spinnerColor="#ef121b"
      />

      <Navbar />

      <div className="jumbotron bg-transparent mb-0 pt-0 radius-0">
        <div className="container">
          <div className="row">
            <div className="col-xl-12  text-center">
              <h1 className="display-1 bold color_white">CHALLENGES</h1>
              <p className="text-grey text-spacey hackerFont lead mb-5">
                Its time to show the world what you can do!
              </p>
            </div>
          </div>

          {counter != 0 ? (
            <div style={{ textAlign: "center" }}>
              <h2>CTF NOT STARTED YET!</h2>
              <p>
                {counter === 0 ? (
                  "Refresh :)"
                ) : (
                  <div>
                    Starts in:{" "}
                    {counter <= 3600 ? format(counter) : formatHours(counter)}
                  </div>
                )}{" "}
              </p>
            </div>
          ) : null}

          {categories.map((category, index) => {
            return (
              <div className="row hackerFont" key={index}>
                <div className="col-md-12">
                  <h4>{capitalize(category)}</h4>
                </div>
                {challenges.map((challenge, index) => {
                  if (challenge.category == category) {
                    return (
                      <div className="col-md-6 mb-3" key={index}>
                        <div
                          className={
                            challenge.category == "crypto"
                              ? "card category_crypt"
                              : challenge.category == "web"
                              ? "card category_web"
                              : challenge.category == "osint"
                              ? "card category_osint"
                              : challenge.category == "steganography"
                              ? "card category_steg"
                              : challenge.category == "pwn"
                              ? "card category_pwning"
                              : challenge.category == "forensics"
                              ? "card category_forensics"
                              : "card category_misc"
                          }
                        >
                          <div
                            className={
                              globalData.userData.solved.filter((obj) => {
                                return obj.challenge._id == challenge._id;
                              }).length > 0
                                ? "card-header solved"
                                : globalData.userData.team
                                ? globalData.userData.team.users.filter(
                                    (user) => {
                                      return (
                                        user.solved.filter((obj) => {
                                          return (
                                            obj.challenge._id == challenge._id
                                          );
                                        }).length > 0
                                      );
                                    }
                                  ).length > 0
                                  ? "card-header solved"
                                  : "card-header"
                                : "card-header"
                            }
                            data-target={"#problem_id_" + index}
                            data-toggle="collapse"
                            aria-expanded="false"
                            aria-controls={"problem_id_" + index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            {challenge.name}{" "}
                            <div>
                              {globalData.userData.solved.filter((obj) => {
                                return obj.challenge._id == challenge._id;
                              }).length > 0 ? (
                                <>
                                  <span className="badge">solved</span>{" "}
                                </>
                              ) : null}
                              <span className="badge align-self-end">
                                {challenge.points} points
                              </span>
                            </div>
                          </div>
                          <div
                            id={"problem_id_" + index}
                            className="collapse card-body"
                          >
                            <blockquote className="card-blockquote">
                              <div style={{ display: "flex" }}>
                                <h6 className="solvers">
                                  Solves:{" "}
                                  <span className="solver_num">
                                    {challenge.solveCount}
                                  </span>{" "}
                                  &nbsp;
                                  <span
                                    className={
                                      challenge.level == 0
                                        ? "color_white color_easy"
                                        : challenge.level == 1
                                        ? "color_white color_medium"
                                        : challenge.level == 2
                                        ? "color_white color_hard"
                                        : "color_white color_ninja"
                                    }
                                  >
                                    {challenge.level == 0
                                      ? "Easy"
                                      : challenge.level == 1
                                      ? "Medium"
                                      : challenge.level == 2
                                      ? "Hard"
                                      : "Ninja"}
                                  </span>
                                </h6>
                              </div>
                              <p>
                                {challenge.info
                                  .split("\\n")
                                  .map(function (item, idx) {
                                    return (
                                      <span key={idx}>
                                        {item}
                                        <br />
                                      </span>
                                    );
                                  })}
                              </p>

                              {challenge.file ? (
                                challenge.file.length > 0 ? (
                                  <a
                                    href="#"
                                    className="btn btn-outline-danger btn-shadow"
                                    onClick={() => {
                                      downloadFile(
                                        challenge.file,
                                        challenge.name
                                      );
                                    }}
                                  >
                                    <span className="fa fa-download mr-2"></span>
                                    Files
                                  </a>
                                ) : null
                              ) : null}

                              {challenge.codeSnippet ? (
                                challenge.codeSnippet.trim().length > 0 ? (
                                  <a
                                    onClick={() => {
                                      setCurrentHint("");
                                      setCurrentSnippet({
                                        code: challenge.codeSnippet,
                                        language: challenge.codeLanguage,
                                      });
                                    }}
                                    href="#modal"
                                    data-toggle="modal"
                                    data-target="#modal"
                                    className="btn btn-outline-danger btn-shadow"
                                  >
                                    <span className="fa fa-laptop-code mr-2"></span>
                                    Code Snippet
                                  </a>
                                ) : null
                              ) : null}

                              {challenge.hint ? (
                                challenge.hint.trim().length > 0 ? (
                                  <a
                                    onClick={() => {
                                      setCurrentHint(challenge.hint);
                                    }}
                                    href="#modal"
                                    data-toggle="modal"
                                    data-target="#modal"
                                    className="btn btn-outline-danger btn-shadow"
                                  >
                                    <span className="far fa-lightbulb mr-2"></span>
                                    Hint
                                  </a>
                                ) : null
                              ) : null}
                              <div className="input-group mt-3">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter Flag"
                                  aria-label="Enter Flag"
                                  aria-describedby="basic-addon2"
                                  id={"flag_id_" + index}
                                  onKeyPress={(e, index) => {
                                    handleEnterSubmit(e, index);
                                  }}
                                />
                                <div className="input-group-append">
                                  <button
                                    id="submit_p2"
                                    className="btn btn-outline-danger"
                                    type="button"
                                    onClick={() => {
                                      submitFlag(index);
                                    }}
                                  >
                                    Go!
                                  </button>
                                </div>
                              </div>
                            </blockquote>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            );
          })}

          {counter == 0 ? (
            <div className="row hackerFont justify-content-center mt-5">
              <div className="col-md-12">
                <br />
                Challenge Types:
                <span className="p-1" style={{ backgroundColor: "#ef121b94" }}>
                  Web
                </span>
                <span className="p-1" style={{ backgroundColor: "#b017a494" }}>
                  Osint
                </span>
                <span className="p-1" style={{ backgroundColor: "#17b06b94" }}>
                  Steganography
                </span>
                <span className="p-1" style={{ backgroundColor: "#36a2eb94" }}>
                  Pwning
                </span>
                <span className="p-1" style={{ backgroundColor: "#0f329894" }}>
                  Forensics
                </span>
                <span className="p-1" style={{ backgroundColor: "#9966FF94" }}>
                  Cryptography
                </span>
                <span className="p-1" style={{ backgroundColor: "#ffce5694" }}>
                  Misc
                </span>
              </div>
            </div>
          ) : null}
        </div>
        <div
          className="modal fade"
          id="modal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="modal label"
          style={{ display: "none" }}
          aria-hidden="true"
        >
          <div
            className="modal-dialog modal-dialog-centered"
            role="document"
            style={{ maxWidth: "80%", width: "fit-content" }}
          >
            <div className="modal-content">
              <div className="modal-body">
                {currentHint.length > 0 ? (
                  <div className="col-md-12">
                    <p style={{ textAlign: "center" }}>
                      {currentHint.split("\\n").map(function (item, idx) {
                        return (
                          <span key={idx}>
                            {item}
                            <br />
                          </span>
                        );
                      })}
                    </p>
                  </div>
                ) : currentSnippet.code ? (
                  <pre className="line-numbers">
                    <code className={"language-" + currentSnippet.language}>
                      {currentSnippet.code}
                    </code>
                  </pre>
                ) : null}
              </div>
              <div
                className="modal-footer"
                style={{ justifyContent: "center" }}
              >
                {currentSnippet.code ? (
                  <button
                    type="button"
                    className="btn btn-success"
                    data-dismiss="modal"
                    onClick={() => {copy(currentSnippet.code)}}
                  >
                    Copy Code
                  </button>
                ) : null}
                <button
                  type="button"
                  className="btn btn-danger"
                  data-dismiss="modal"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Challenges;
