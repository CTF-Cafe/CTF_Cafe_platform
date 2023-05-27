import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AppContext from "../Data/AppContext";
import ChallengeCard from "./components/ChallengeCard";

function Challenges(props) {
  const globalData = useContext(AppContext);
  const [challenges, setChallenges] = useState([]);
  const [categories, setCategories] = useState(globalData.categories);
  const [assets, setAssets] = useState([]);

  // const importChallenges = () => {
  //   const file = document.getElementById("jsonImport").files[0];

  //   const reader = new FileReader();
  //   reader.addEventListener("load", async (event) => {
  //     const json = JSON.parse(window.atob(event.target.result.split(",")[1]));

  //     let categoriesArray = [...categories];

  //     json.results.forEach(async (challenge) => {
  //       if (!categoriesArray.includes(challenge.category)) {
  //         categoriesArray.push(challenge.category);
  //       }

  //       await axios
  //         .post(
  //           process.env.REACT_APP_BACKEND_URI + "/api/admin/createChallenge",
  //           {
  //             category: challenge.category,
  //           },
  //           { withCredentials: true }
  //         )
  //         .then((response) => {
  //           if (response.data.state == "sessionError") {
  //             globalData.alert.error("Session expired!");
  //             globalData.setUserData({});
  //             globalData.setLoggedIn(false);
  //             globalData.navigate("/", { replace: true });
  //           } else {
  //             if (response.data.state == "success") {
  //               globalData.alert.success("Challenge created!");
  //             } else {
  //               globalData.alert.error(response.data.message);
  //             }
  //           }
  //         })
  //         .catch((error) => console.log(error.message));
  //     });

  //     await axios
  //       .post(
  //         process.env.REACT_APP_BACKEND_URI + "/api/admin/saveConfigs",
  //         {
  //           newConfigs: [
  //             { name: "categories", value: JSON.stringify(categoriesArray) },
  //           ],
  //         },
  //         { withCredentials: true }
  //       )
  //       .then((response) => {
  //         if (response.data.state == "sessionError") {
  //           globalData.alert.error("Session expired!");
  //           globalData.setUserData({});
  //           globalData.setLoggedIn(false);
  //           globalData.navigate("/", { replace: true });
  //         } else {
  //           if (response.data.state == "success") {
  //             globalData.alert.success("Updated config!");
  //           } else {
  //             globalData.alert.error(response.data.message);
  //           }
  //         }
  //       })
  //       .catch((err) => {
  //         console.log(err.message);
  //       });

  //     getChallenges();
  //   });
  //   reader.readAsDataURL(file);
  // };

  const getChallenges = () => {
    axios
      .get(process.env.REACT_APP_BACKEND_URI + "/api/admin/getAssets", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.state === "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          setAssets(response.data);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });

    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/admin/getStats",
        {
          name: "challenges&categories",
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state === "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
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
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    getChallenges();
  }, []);

  const saveChallenge = (oldChallenge) => {
    var formData = new FormData();

    formData.append("id", oldChallenge._id);

    const hidden = document.getElementById("hidden" + oldChallenge._id).value;
    formData.append("hidden", hidden);

    const name = document.getElementById("name" + oldChallenge._id).value;
    formData.append("name", name);

    const points = document.getElementById(
      "points" + oldChallenge._id
    ).value;
    formData.append("points", points);

    const firstBloodPoints = document.getElementById(
      "firstBloodPoints" + oldChallenge._id
    ).textContent;
    formData.append("firstBloodPoints", firstBloodPoints);

    const minimumPoints = document.getElementById(
      "minimumPoints" + oldChallenge._id
    ).textContent;
    formData.append("minimumPoints", minimumPoints);

    const level = document.getElementById("level" + oldChallenge._id).value;
    formData.append("level", level);

    const info = document.getElementById("info" + oldChallenge._id).innerText;
    formData.append("info", info);

    let hints = [];
    let i = 0;
    while (document.getElementById(i + "hintId" + oldChallenge._id)) {
      const id = document.getElementById(
        i + "hintId" + oldChallenge._id
      ).textContent;
      const content = document.getElementById(
        i + "hintContent" + oldChallenge._id
      ).textContent;
      const cost = document.getElementById(
        i + "hintCost" + oldChallenge._id
      ).textContent;

      hints.push({ id: id, content: content, cost: cost });
      i += 1;
    }

    formData.append("hints", JSON.stringify(hints));

    const file = document.getElementById("file" + oldChallenge._id).value;
    formData.append("file", file);

    const codeSnippet = document.getElementById(
      "code_snippet" + oldChallenge._id
    ).textContent;
    formData.append("codeSnippet", codeSnippet);

    const codeLanguage = document.getElementById(
      "code_language" + oldChallenge._id
    ).value;
    formData.append("codeLanguage", codeLanguage);

    const flag = document.getElementById("flag" + oldChallenge._id).textContent;
    formData.append("flag", flag);

    const githubUrl = document.getElementById(
      "githubUrl" + oldChallenge._id
    ).textContent;
    formData.append("githubUrl", githubUrl);

    const isInstance = document.getElementById(
      "isInstance" + oldChallenge._id
    ).value;
    formData.append("isInstance", isInstance);

    const randomFlag = document.getElementById(
      "randomFlag" + oldChallenge._id
    ).value;
    formData.append("randomFlag", randomFlag);

    const requirement = document.getElementById(
      "requirement" + oldChallenge._id
    ).value;
    formData.append("requirement", requirement);

    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/admin/saveChallenge",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      )
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          if (response.data.state == "success") {
            globalData.alert.success("Challenge updated!");
            getChallenges();
          } else {
            globalData.alert.error(response.data.message);
          }
        }
      })
      .catch((error) => console.log(error.message));
  };

  const deleteChallenge = (e, oldChallenge) => {
    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/admin/deleteChallenge",
        {
          id: oldChallenge._id,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          if (response.data.state == "success") {
            globalData.alert.success("Challenge deleted!");
            getChallenges();
          } else {
            globalData.alert.error(response.data.message);
          }
        }
      })
      .catch((error) => console.log(error.message));
  };

  const capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const allowDrop = function (ev) {
    ev.preventDefault();
  };

  const drag = function (ev) {
    ev.dataTransfer.setData("text", ev.target.id);
  };

  const drop = function (ev) {
    ev.preventDefault();

    var data = ev.dataTransfer.getData("text");

    const challenge = document.getElementById(data).closest(".top");
    const oldCategory = challenge.closest(".row");
    let challenge2 = "";
    let newCategory = "";

    if (!ev.target.classList.value.includes("row")) {
      newCategory = ev.target.closest(".row");

      challenge2 = challenge.cloneNode();
      challenge2.display = "none";

      newCategory.appendChild(challenge2);
    } else {
      newCategory = ev.target;

      challenge2 = challenge.cloneNode();
      challenge2.display = "none";

      newCategory.appendChild(challenge2);
    }

    if (newCategory.children[0].id != oldCategory.children[0].id) {
      axios
        .post(
          process.env.REACT_APP_BACKEND_URI +
            "/api/admin/updateChallengeCategory",
          {
            id: challenge.id.replace("challenge-top", ""),
            category: newCategory.children[0].id,
          },
          { withCredentials: true }
        )
        .then((response) => {
          if (response.data.state == "sessionError") {
            globalData.alert.error("Session expired!");
            globalData.setUserData({});
            globalData.setLoggedIn(false);
            globalData.navigate("/", { replace: true });
          } else {
            if (response.data.state == "success") {
              globalData.alert.success(response.data.message);
              getChallenges();
              challenge2.remove();
            } else {
              globalData.alert.error(response.data.message);
              challenge2.remove();
            }
          }
        })
        .catch((error) => console.log(error.message));
    }
  };

  const createChallenge = (e, category) => {
    e.preventDefault();
    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/admin/createChallenge",
        {
          category: category,
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          if (response.data.state == "success") {
            globalData.alert.success("Challenge created!");
            getChallenges();
          } else {
            globalData.alert.error(response.data.message);
          }
        }
      })
      .catch((error) => console.log(error.message));
  };

  const setAction = (action) => {
    props.setAction(action);
  };

  return (
    <div>
      <h1
        className="display-1 bold color_white cool"
        style={{ textAlign: "center", marginBottom: "50px" }}
      >
        CHALLENGES
      </h1>
      {categories.map((category, index) => {
        return (
          <div
            className="row hackerFont"
            key={category}
            // onDrop={drop}
            // onDragOver={allowDrop}
          >
            <div
              className="col-md-12"
              id={category}
              style={{ marginBottom: "10px" }}
            >
              <h4 style={{ display: "inline-block" }}>
                {capitalize(category)}
              </h4>
              <a
                href="#"
                className="btn btn-outline-danger btn-shadow"
                onClick={(e) => {
                  createChallenge(e, category);
                }}
                title="Create Challenge"
              >
                <span className="fa-solid fa-plus"> </span>
              </a>
            </div>
            {challenges.map((challenge, index) => {
              if (challenge.category === category) {
                return (
                  <ChallengeCard
                    challenge={challenge}
                    drag={drag}
                    saveChallenge={saveChallenge}
                    deleteChallenge={deleteChallenge}
                    key={challenge._id}
                    assets={assets}
                    challenges={challenges}
                    setAction={setAction}
                    dynamicScoring={globalData.dynamicScoring}
                    categoryColors={globalData.categoryColors}
                  />
                );
              }
            })}
          </div>
        );
      })}
      <div className="row hackerFont justify-content-center mt-5">
        {/* <div className="col-md-12">
          <button onClick={importChallenges} className="btn btn-outline-danger">
            Import JSON
          </button>
          <br />
          <input type="file" id="jsonImport" />
        </div> */}
        <div className="col-md-12">
          <br />
          Challenge Types:
          {globalData.categoryColors.map((category) => (
            <span className="p-1" style={{ backgroundColor: category.color }} key={category.color}>
              {category.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Challenges;
