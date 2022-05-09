import { Outlet, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AppContext from "../Data/AppContext";

function Config(props) {
  const globalData = useContext(AppContext);
  const [configs, setConfigs] = useState([]);

  const getConfigs = () => {
    axios
      .get(process.env.REACT_APP_SERVER_URI + "/api/admin/getConfigs", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          setConfigs(response.data);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    getConfigs();
  }, []);

  const saveConfig = () => {
    let configsArray = [];

    configs.forEach((config) => {
      configsArray.push({
        name: config.name,
        value: document.getElementById("config-data" + config._id).textContent,
      });
    });

    axios
      .post(
        process.env.REACT_APP_SERVER_URI + "/api/admin/saveConfigs",
        {
          newConfigs: configsArray,
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
            globalData.alert.success("Updated config!");
            getConfigs();
          } else {
            globalData.alert.error(response.data.message);
            getConfigs();
          }
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

    return ( 
        <div>
        <h1 className = "display-1 bold color_white"
        style = {
            { textAlign: "center", marginBottom: "50px" }
        }>ASSETS </h1>
        <table className = "table table-hover table-striped" >
        <thead className = "thead-dark hackerFont" >
        <tr >
        <th scope = "col"
        style = {
            { textAlign: "center" }
        } > #</th> <th scope = "col" > Config Name </th> 
        <th scope = "col" > Config Data </th> 
        </tr> </thead> <tbody> {
            configs.map((config, index) => {
                return ( <tr key = { config._id } >
                    <th scope = "row"
                    style = {
                        { textAlign: "center" }
                    } > { index } </th>
                    <td> { config.name } </td> <td contenteditable = "true" id = { "config-data" + config._id } > { JSON.stringify(config.value) } </td> </tr>
                );
            })
        } </tbody> </table>
        <button id="submit_p2"
        className="btn btn-outline-danger"
        type="button"
        onClick = {
            () => {
                saveConfig();
            }
        }>Save </button> 
        </div>
    );
}

export default Config;
