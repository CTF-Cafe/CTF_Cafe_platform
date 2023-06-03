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
  const [tags, setTags] = useState([]);
  const [endTime, setEndTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [counter, setCounter] = useState(0);
  const [action, setAction] = useState({});
  const [challSearch, setChallSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

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

  // TODO / CLEAN
  const refreshUser = () => {
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
        }
      })
      .catch(console.log);
  };

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
            if (a.level < b.level) {
              return -1;
            }

            if (a.level > b.level) {
              return 1;
            }

            return 0;
          });

          response.data.tags.sort((a, b) => {
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
          setTags(response.data.tags.filter((x) => typeof x === "string"));
          setSelectedTags(
            response.data.tags.filter((x) => typeof x === "string")
          );
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
          globalData.alert.success("Correct Flag!");
          getChallenges();
          refreshUser();
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

    if (globalData.userData.team) {
      // replace team name
      tmp = tmp.replace("${teamName}", globalData.userData.team.name);
    }

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
              <p className="text-grey text-spacey hackerFont lead mb-3">
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

          {tags.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "#151623",
                  padding: "5px",
                  borderStartEndRadius: "10px",
                  borderStartStartRadius: "10px",
                }}
              >
                <input
                  type="text"
                  id="searchChalls"
                  placeholder="Search..."
                  style={{ marginRight: "5px" }}
                  onChange={(e) => setChallSearch(e.target.value)}
                />
                <i class="fa-solid fa-magnifying-glass"></i>
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "25px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#151623",
                  padding: "5px",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {tags.map((tag, i) => (
                  <span
                    key={tag + "selector" + i}
                    className="badge color_white align-self-end"
                    style={{
                      marginRight: "5px",
                      backgroundColor: selectedTags.includes(tag)
                        ? (
                            globalData.tagColors.find((x) => tag == x.name) || {
                              color: "black",
                            }
                          ).color
                        : "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (selectedTags.length === tags.length) {
                        setSelectedTags([tag]);
                      } else if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter((x) => x !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                  >
                    {tag}
                  </span>
                ))}
                <i
                  className={
                    selectedTags.length === tags.length
                      ? "fa-sharp fa-regular fa-circle"
                      : "fa-solid fa-circle"
                  }
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (selectedTags.length === tags.length) {
                      setSelectedTags([]);
                    } else {
                      setSelectedTags(tags);
                    }
                  }}
                ></i>
              </div>
            </div>
          )}

          {/* {tags
            .filter((x) => selectedTags.includes(x))
            .map((tag, index) => {
              return ( */}
          <div className="row hackerFont">
            {/* <div className="col-md-12">
                    <h4>{capitalize(tag)}</h4>
                  </div> */}
            {challenges
              .filter((x) =>
                x.name.toLowerCase().includes(challSearch.toLowerCase())
              )
              .filter((x) => x.tags.some((t) => selectedTags.includes(t)))
              // .filter((x) => x.tags[0] === tag)
              .map((challenge, index) => {
                return (
                  <div className="col-md-6 mb-3 " key={challenge._id}>
                    <div
                      className="card"
                      style={{
                        borderTop:
                          "4px solid " +
                          (
                            globalData.tagColors.find(
                              (x) => challenge.tags[0] == x.name
                            ) || { color: "white" }
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
                            ? globalData.userData.team.users.filter((user) => {
                                return (
                                  user.solved.filter((obj) => {
                                    return obj._id === challenge._id;
                                  }).length > 0
                                );
                              }).length > 0
                              ? "card-header solved"
                              : "card-header"
                            : "card-header"
                        }
                        data-target={"#problem_id_" + challenge._id}
                        data-toggle="collapse"
                        aria-expanded="false"
                        role="button"
                        aria-controls={"problem_id_" + challenge._id}
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
                          {challenge.firstBlood === globalData.userData._id ? (
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
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row-reverse",
                            }}
                          >
                            {challenge.tags.map((tag) => (
                              <span
                                key={tag + challenge._id}
                                className="badge color_white align-self-end"
                                style={{
                                  marginRight: "5px",
                                  backgroundColor: (
                                    globalData.tagColors.find(
                                      (x) => tag == x.name
                                    ) || { color: "black" }
                                  ).color,
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          {/* DIFFICULTY BADGE */}
                          {/* <span
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
                          </span> */}
                          <span
                            className="badge align-self-end"
                            style={{ marginRight: "5px" }}
                          >
                            {challenge.points}pts
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
                        </div>
                      </div>
                      <div
                        id={"problem_id_" + challenge._id}
                        className="collapse"
                      >
                        <div className="card-body">
                          <blockquote className="card-blockquote">
                            <div style={{ display: "flex" }}>
                              <h6 className="solvers">
                                Solves:{" "}
                                <span className="solver_num">
                                  {challenge.solveCount}
                                </span>{" "}
                                &nbsp;
                                {/* <span
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
                                </span> */}
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
                                id={"flag_id_" + challenge._id}
                                onKeyPress={(e) => {
                                  handleEnterSubmit(
                                    e,
                                    challenge._id,
                                    challenge
                                  );
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
                                    submitFlag(challenge._id, challenge);
                                  }}
                                >
                                  Go!
                                </button>
                              </div>
                            </div>

                            {challenge.url ? (
                              <div className="mt-3">
                                <span>{challenge.url}</span>
                                <br />
                                <span>
                                  {formatHours(
                                    (new Date(
                                      parseInt(challenge.deployTime)
                                    ).getTime() +
                                      2 * 60 * 60 * 1000 -
                                      new Date().getTime()) /
                                      1000
                                  )}
                                </span>
                              </div>
                            ) : null}
                          </blockquote>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          {/* );
            })} */}
        </div>
        <ConfirmModal action={action} />
        <div
          className="modal fade"
          id="modal"
          tabIndex="-1"
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
