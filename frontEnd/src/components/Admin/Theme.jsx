import { Outlet, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AppContext from "../Data/AppContext";

function Config(props) {
  const globalData = useContext(AppContext);

  const getTheme = () => {
    axios
      .get(process.env.REACT_APP_BACKEND_URI + "/api/getTheme", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          globalData.setTheme(response.data.theme);

          const root = document.documentElement;

          root.style.setProperty(
            "--color-1",
            response.data.theme.color_1
              ? response.data.theme.color_1
              : "#ff3c5c"
          );
          root.style.setProperty(
            "--color-2",
            response.data.theme.color_2
              ? response.data.theme.color_2
              : "#ff707f"
          );
          root.style.setProperty(
            "--color-1-50",
            response.data.theme.color_1
              ? response.data.theme.color_1 + "50"
              : "#ff707f50"
          );
          root.style.setProperty(
            "--bg-img",
            response.data.theme.bg_img
              ? `url(${response.data.theme.bg_img})`
              : "none"
          );
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    getTheme();
  }, []);

  const saveTheme = () => {
    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/admin/saveTheme",
        {
          color_1: document.getElementById("theme_color_1").value,
          color_2: document.getElementById("theme_color_2").value,
          bg_img: document.getElementById("theme_img").textContent,
          top1_icon: document.getElementById("theme_top1").textContent,
          top2_icon: document.getElementById("theme_top2").textContent,
          top3_icon: document.getElementById("theme_top3").textContent,
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
            globalData.alert.success("Updated theme!");
            getTheme();
          } else {
            globalData.alert.error(response.data.message);
            getTheme();
          }
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return (
    <div>
      <h1
        className="display-1 bold color_white cool"
        style={{ textAlign: "center", marginBottom: "50px" }}
      >
        THEME
      </h1>
      <table className="table table-hover table-striped">
        <thead className="thead-dark hackerFont">
          <tr>
            <th scope="col">Config Name</th>
            <th scope="col">Config Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>COLOR #1</td>
            <td>
              <input
                type="color"
                id="theme_color_1"
                defaultValue={globalData.theme.color_1}
              />
            </td>
          </tr>
          <tr>
            <td>COLOR #2</td>
            <td>
              <input
                type="color"
                id="theme_color_2"
                defaultValue={globalData.theme.color_2}
              />
            </td>
          </tr>
          <tr>
            <td>BACKROUND IMAGE</td>
            <td contenteditable="true" id="theme_img" suppressContentEditableWarning={true}>
              {globalData.theme.bg_img}
            </td>
          </tr>
          <tr>
            <td>TOP1 Icon</td>
            <td contenteditable="true" id="theme_top1" suppressContentEditableWarning={true}>
              {globalData.theme.top1_icon}
            </td>
          </tr>
          <tr>
            <td>TOP2 Icon</td>
            <td contenteditable="true" id="theme_top2" suppressContentEditableWarning={true}>
              {globalData.theme.top2_icon}
            </td>
          </tr>
          <tr>
            <td>TOP3 Icon</td>
            <td contenteditable="true" id="theme_top3" suppressContentEditableWarning={true}>
              {globalData.theme.top3_icon}
            </td>
          </tr>
        </tbody>
      </table>
      <button
        id="submit_p2"
        className="btn btn-outline-danger"
        type="button"
        onClick={() => {
          saveTheme();
        }}
      >
        Save
      </button>
    </div>
  );
}

export default Config;
