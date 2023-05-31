import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { saveAs } from "file-saver";
import LoadingScreen from "react-loading-screen";
import AppContext from "./Data/AppContext";
import ConfirmModal from "./Global/ConfirmModal";
import Navbar from "./Global/Navbar";
import copy from "copy-to-clipboard";
import "../css/prism.css";
import Prism from "prismjs";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/components/prism-python";
import "prismjs/components/prism-javascript";
import ReactMarkdown from "react-markdown";

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

let stoppingDocker = false;
function Challenges(props) {
  const globalData = useContext(AppContext);
  const [challenges, setChallenges] = useState([]);
  const [currentHint, setCurrentHint] = useState("");
  const [currentSnippet, setCurrentSnippet] = useState({});
  const [categories, setCategories] = useState([]);
  const [endTime, setEndTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [counter, setCounter] = useState(0);
  const [action, setAction] = useState({});

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

  const buyHint = (e, data) => {
    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/user/buyHint",
        {
          challengeId: data.challId,
          hintId: data.hintId,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        if (response.data.state === "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state === "error") {
          globalData.alert.error(response.data.message);
        } else {
          globalData.alert.success("Hint Bought!");
          setCurrentHint(response.data.hint);
          getChallenges();
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const getChallenges = () => {
    axios
      .get(process.env.REACT_APP_BACKEND_URI + "/api/user/getChallenges", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.state === "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state === "error") {
          var startDate = new Date();
          var endDate = new Date(parseInt(response.data.startTime));
          var secondsTillStart = parseInt(
            (endDate.getTime() - startDate.getTime()) / 1000
          );

          setCounter(secondsTillStart);
          setLoading(false);
        } else {
          response.data.challenges.sort((a, b) => {
            if (a.level < b.level || a.category.length < b.category.length) {
              return -1;
            }

            if (a.level > b.level || a.category.length > b.category.length) {
              return 1;
            }

            return 0;
          });

          response.data.categories.sort((a, b) => {
            if (a === "misc") {
              return 1;
            }

            if (b === "misc") {
              return -1;
            }

            return 0;
          });

          response.data.challenges.forEach((c) => {});
          for (let c of response.data.challenges) {
            if ((c.progress && c.progress !== "finished") || stoppingDocker) {
              setTimeout(() => {
                getChallenges();
                stoppingDocker = false;
              }, 1000);
              break;
            }
          }

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
    saveAs(process.env.REACT_APP_BACKEND_URI + "/api/assets/" + file, name); // Put your image url here.
  };

  useEffect(() => {
    Prism.highlightAll();
  }, [currentSnippet]);

  useEffect(() => {
    getChallenges();
  }, []);

  const shutdownDocker = (challenge) => {
    challenge.progress = "stopping";
    setChallenges([...challenges]);

    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/user/shutdownDocker",
        {
          challengeId: challenge._id,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        if (response.data.state === "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state === "error") {
          globalData.alert.error(response.data.message);
          delete challenge.progress;
          setChallenges([...challenges]);
        } else {
          globalData.alert.success("Challenge docker stopped!");
          stoppingDocker = true;
          getChallenges();
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const createDocker = (challenge) => {
    challenge.progress = "deploying";
    setChallenges([...challenges]);

    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/user/deployDocker",
        {
          challengeId: challenge._id,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        if (response.data.state === "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else if (response.data.state === "error") {
          globalData.alert.error(response.data.message);
          delete challenge.progress;
          setChallenges([...challenges]);
        } else {
          globalData.alert.success("Challenge docker started!");
          getChallenges();
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const submitFlag = (index, challenge) => {
    const flag = document.getElementById(`flag_id_${index}`).value;

    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/user/submitFlag",
        {
          flag: flag,
          challengeId: challenge._id,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state === "success") {
          globalData.setUserData(response.data.user);
          globalData.alert.success("Correct Flag!");
          getChallenges();
        } else {
          if (response.data.state === "sessionError") {
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

  const handleEnterSubmit = (event, index, challenge) => {
    // look for the `Enter` keyCode
    if (event.key === "Enter") {
      submitFlag(index, challenge);
    }
  };

  // Content Templating
  const templateParse = (content) => {
    let tmp = content;

    // replace user name
    tmp = tmp.replace("${username}", globalData.userData.username);

    // replace team name
    tmp = tmp.replace("${teamName}", globalData.userData.team.name);

    return tmp;
  };

  return (
    <div>
      {loading !== undefined && (
        <LoadingScreen
          loading={loading}
          bgColor="#0c0d16"
          spinnerColor="#ef121b"
        />
      )}

      <div className="bg" />

      <Navbar />

      <div
        className="jumbotron bg-transparent mb-0 pt-0 radius-0"
        style={{ position: "relative" }}
      >
        <div className="container">
          <div className="row">
            <div className="col-xl-12  text-center">
              <h1 className="display-1 bold color_white cool">CHALLENGES</h1>
              <p className="text-grey text-spacey hackerFont lead mb-5">
                Its time to show the world what you can do!
              </p>
            </div>
          </div>

          {counter > 0 ? (
            <div style={{ textAlign: "center" }}>
              <h2 className="cool">CTF NOT STARTED YET!</h2>
              <p>
                {counter < 0 ? (
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
                  if (challenge.category === category) {
                    return (
                      <div className="col-md-6 mb-3" key={index}>
                        <div
                          className="card"
                          style={{
                            borderTop:
                              "4px solid " +
                              globalData.categoryColors.find(
                                (x) => x.name === challenge.category
                              ).color,
                          }}
                        >
                          <div
                            className={
                              globalData.userData.solved.filter((obj) => {
                                return obj._id === challenge._id;
                              }).length > 0
                                ? "card-header solved"
                                : globalData.userData.team
                                ? globalData.userData.team.users.filter(
                                    (user) => {
                                      return (
                                        user.solved.filter((obj) => {
                                          return obj._id === challenge._id;
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
                            role="button"
                            aria-controls={"problem_id_" + index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              {challenge.isInstance && (
                                <span
                                  className="fa-brands fa-docker"
                                  style={{
                                    fontSize: "22px",
                                    marginRight: "10px",
                                  }}
                                ></span>
                              )}
                              {challenge.firstBlood ===
                              globalData.userData._id ? (
                                <div
                                  style={{
                                    display: "inline-flex",
                                    color: "red",
                                    marginRight: "10px",
                                  }}
                                >
                                  <span
                                    className="fa-solid fa-droplet"
                                    style={{ fontSize: "22px" }}
                                  ></span>
                                </div>
                              ) : null}
                              {challenge.name}{" "}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-end",
                              }}
                            >
                              {globalData.userData.solved.filter((obj) => {
                                return obj._id === challenge._id;
                              }).length > 0 ? (
                                <>
                                  <span
                                    className="badge"
                                    style={{ marginRight: "5px" }}
                                  >
                                    solved
                                  </span>{" "}
                                </>
                              ) : null}
                              <span
                                className={
                                  challenge.level === 0
                                    ? "badge color_white color_easy align-self-end"
                                    : challenge.level === 1
                                    ? "badge color_white color_medium align-self-end"
                                    : challenge.level === 2
                                    ? "badge color_white color_hard align-self-end"
                                    : "badge color_white color_ninja align-self-end"
                                }
                                style={{ marginRight: "5px" }}
                              >
                                {challenge.level === 0
                                  ? "Easy"
                                  : challenge.level === 1
                                  ? "Medium"
                                  : challenge.level === 2
                                  ? "Hard"
                                  : "Ninja"}
                              </span>
                              <span
                                className="badge align-self-end"
                                style={{ marginRight: "5px" }}
                              >
                                {challenge.points} points
                              </span>
                              {challenge.firstBloodPoints > 0 && (
                                <span className="badge align-self-end">
                                  (+{challenge.firstBloodPoints}){" "}
                                  <span
                                    className="fa-solid fa-droplet"
                                    style={{ fontSize: "11px", color: "red" }}
                                  ></span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div id={"problem_id_" + index} className="collapse">
                            <div className="card-body">
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
                                        challenge.level === 0
                                          ? "color_white color_easy"
                                          : challenge.level === 1
                                          ? "color_white color_medium"
                                          : challenge.level === 2
                                          ? "color_white color_hard"
                                          : "color_white color_ninja"
                                      }
                                    >
                                      {challenge.level === 0
                                        ? "Easy"
                                        : challenge.level === 1
                                        ? "Medium"
                                        : challenge.level === 2
                                        ? "Hard"
                                        : "Ninja"}
                                    </span>
                                  </h6>
                                </div>
                                <ReactMarkdown
                                  children={templateParse(challenge.info)}
                                />

                                {challenge.isInstance && (
                                  <button
                                    className="btn btn-outline-danger btn-shadow"
                                    onClick={(e) => {
                                      if (!challenge.progress)
                                        createDocker(challenge);
                                      if (challenge.progress === "finished")
                                        shutdownDocker(challenge);
                                    }}
                                    title={
                                      !challenge.progress
                                        ? "Start Docker"
                                        : challenge.progress === "finished"
                                        ? "Stop Docker"
                                        : challenge.progress === "stopping"
                                        ? "Stopping Docker..."
                                        : "Building Docker..."
                                    }
                                  >
                                    {!challenge.progress ? (
                                      <>
                                        <span className="fa-solid fa-circle-play"></span>
                                      </>
                                    ) : challenge.progress === "finished" ? (
                                      <>
                                        <span className="fa-solid fa-power-off"></span>
                                      </>
                                    ) : challenge.progress === "stopping" ? (
                                      <>
                                        <span className="fa-solid fa-spinner fa-spin"></span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="fa-solid fa-spinner fa-spin"></span>
                                      </>
                                    )}
                                  </button>
                                )}

                                {challenge.file ? (
                                  challenge.file.length > 0 ? (
                                    <button
                                      className="btn btn-outline-danger btn-shadow"
                                      onClick={() => {
                                        downloadFile(
                                          challenge.file,
                                          challenge.name
                                        );
                                      }}
                                      title="Download File"
                                    >
                                      <span className="fa-solid fa-download" />
                                    </button>
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
                                      title="Code Snippet"
                                    >
                                      <span className="fa-solid fa-laptop-code" />
                                    </a>
                                  ) : null
                                ) : null}

                                {challenge.hints.map((hint, i) =>
                                  hint.cost === 0 ? (
                                    hint.content.trim().length > 0 && (
                                      <a
                                        onClick={() => {
                                          setCurrentHint(hint.content);
                                        }}
                                        href="#modal"
                                        data-toggle="modal"
                                        data-target="#modal"
                                        className="btn btn-outline-danger btn-shadow"
                                        title={"Hint#" + (i + 1)}
                                      >
                                        <span className="fa-solid fa-lightbulb" />
                                      </a>
                                    )
                                  ) : (
                                    <a
                                      onClick={(e) => {
                                        setAction({
                                          function: buyHint,
                                          e: e,
                                          data: {
                                            challId: challenge._id,
                                            hintId: hint.id,
                                          },
                                        });
                                      }}
                                      href="#confirmModal"
                                      data-toggle="modal"
                                      data-target="#confirmModal"
                                      className="btn btn-outline-danger btn-shadow"
                                      title={"Buy Hint#" + (i + 1)}
                                    >
                                      <span className="fa-solid fa-lightbulb mr-2"></span>
                                      (-{hint.cost.toString()}pts)
                                    </a>
                                  )
                                )}

                                <div className="input-group mt-3">
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter Flag"
                                    aria-label="Enter Flag"
                                    aria-describedby="basic-addon2"
                                    id={"flag_id_" + index}
                                    onKeyPress={(e) => {
                                      handleEnterSubmit(e, index, challenge);
                                    }}
                                  />
                                  <div className="input-group-append">
                                    <button
                                      style={{
                                        borderTopRightRadius: "6px",
                                        borderBottomRightRadius: "6px",
                                      }}
                                      id="submit_p2"
                                      className="btn btn-outline-danger"
                                      type="button"
                                      onClick={() => {
                                        submitFlag(index, challenge);
                                      }}
                                    >
                                      Go!
                                    </button>
                                  </div>
                                </div>

                                {challenge.url ? (
                                  <div>
                                    <a
                                      href={`${challenge.url}`}
                                      target="_blank"
                                      className="btn btn-outline-danger btn-shadow mt-3"
                                      rel="noreferrer"
                                    >
                                      {challenge.url}
                                    </a>
                                    <span className="btn btn-outline-danger btn-shadow mt-3">
                                      {formatHours(((new Date(parseInt(challenge.deployTime)).getTime() + 2 * 60 * 60 * 1000) - new Date().getTime()) / 1000)}
                                    </span>
                                  </div>
                                ) : null}
                              </blockquote>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            );
          })}
        </div>
        <ConfirmModal action={action} />
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
                {currentHint.length === 0 ? (
                  <button
                    type="button"
                    className="btn btn-success"
                    data-dismiss="modal"
                    onClick={() => {
                      copy(currentSnippet.code);
                    }}
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
