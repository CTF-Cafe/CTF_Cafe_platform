import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AppContext from "../Data/AppContext";
const configsToShow = [
  "startTime",
  "endTime",
  "rules",
  "sponsors",
  "socialLinks",
  "tags",
  "tagColors",
  "dynamicScoring",
  "scoreboardHidden",
  "dockerLimit",
  "userCategories"
];

function toDatetimeLocal(date) {
  let ten = function (i) {
      return (i < 10 ? '0' : '') + i;
    },
    YYYY = date.getFullYear(),
    MM = ten(date.getMonth() + 1),
    DD = ten(date.getDate()),
    HH = ten(date.getHours()),
    II = ten(date.getMinutes()),
    SS = ten(date.getSeconds())
  ;
  return YYYY + '-' + MM + '-' + DD + 'T' +
           HH + ':' + II + ':' + SS;
};

function ArrayEdit(props) {
  const config = props.config;
  const [array, setArray] = useState(config.value);

  const removeFromArray = (item) => {
    setArray([...array.filter((x) => x != item)]);
  };

  const addToArray = () => {
    setArray([...array, "example"]);
  };

  const updateArray = (e, item) => {
    let tmpArray = array;
    e.target.style = "width: " + (e.target.value.length + 2) + "ch;";
    tmpArray[tmpArray.indexOf(item)] = e.target.value;
    setArray([...tmpArray]);
  };

  return (
    <td value={JSON.stringify(array)} id={"config-data" + config._id}>
      <button
        className="btn btn-outline-danger"
        style={{ border: "1px solid gray", margin: "5px" }}
        onClick={addToArray}
      >
        +
      </button>
      {array.map((item) => {
        return (
          <span
            style={{
              margin: "5px",
              border: "1px solid var(--color-1)",
              whiteSpace: "pre-wrap",
            }}
          >
            <input
              onChange={(e) => updateArray(e, item)}
              className="min-input"
              defaultValue={item}
              type="text"
              style={{ width: item.length + 2 + "ch" }}
              key={array.length}
            />
            <button
              className="btn min-btn"
              style={{ padding: "0px 10px" }}
              onClick={() => removeFromArray(item)}
            >
              -
            </button>
          </span>
        );
      })}
    </td>
  );
}

function Config(props) {
  const globalData = useContext(AppContext);
  const [configs, setConfigs] = useState([]);

  const getConfigs = () => {
    axios
      .get(process.env.REACT_APP_BACKEND_URI + "/api/getConfigs")
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          response.data.sort((a, b) => {
            const aIndex = configsToShow.indexOf(a.name);
            const bIndex = configsToShow.indexOf(b.name);
            return aIndex - bIndex;
          });
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
      if (configsToShow.includes(config.name)) {
        configsArray.push({
          name: config.name,
          value: ["startTime", "endTime"].includes(config.name)
            ? new Date(
                document.getElementById("config-data" + config._id).value
              ).getTime()
            : config.name === "tags"
            ? document.getElementById("config-data" + config._id).attributes
                .value.nodeValue
            : config.name === "dockerLimit"
            ? parseInt(document.getElementById("config-data" + config._id).value) || 0
            : ["dynamicScoring", "scoreboardHidden"].includes(config.name)
            ? document.getElementById("config-data" + config._id).value
            : document.getElementById("config-data" + config._id).textContent,
        });
      }
    });

    axios
      .post(
        process.env.REACT_APP_BACKEND_URI + "/api/admin/saveConfigs",
        {
          newConfigs: configsArray,
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
          if (response.data.state === "success") {
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
      <h1
        className="display-1 bold color_white cool"
        style={{ textAlign: "center", marginBottom: "50px" }}
      >
        CONFIG
      </h1>
      <table className="table table-hover table-striped">
        <thead className="thead-dark hackerFont">
          <tr>
            <th scope="col"> Config Name </th>
            <th scope="col"> Config Data </th>
          </tr>
        </thead>
        <tbody>
          {configs.map((config, _) => {
            if (configsToShow.includes(config.name)) {
              return (
                <tr key={config._id}>
                  <td> {config.name} </td>
                  {["startTime", "endTime"].includes(config.name) ? (
                    <td>
                      <input
                        type="datetime-local"
                        id={"config-data" + config._id}
                        defaultValue={toDatetimeLocal(new Date(config.value))}
                      />
                    </td>
                  ) : config.name === "tags" ? (
                    <ArrayEdit config={config} />
                  ) : ["dynamicScoring", "scoreboardHidden"].includes(
                      config.name
                    ) ? (
                    <td>
                      <select
                        defaultValue={JSON.stringify(config.value)}
                        id={"config-data" + config._id}
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </td>
                  ) : config.name === "dockerLimit" ? (
                    <td>
                      <input
                        id={"config-data" + config._id}
                        type="number"
                        defaultValue={config.value}
                      />
                    </td>
                  ) : (
                    <td contentEditable="true" id={"config-data" + config._id} suppressContentEditableWarning={true}>
                      <pre style={{ color: "white" }}>
                        {JSON.stringify(config.value, null, 2)}
                      </pre>
                    </td>
                  )}
                </tr>
              );
            }
          })}
        </tbody>
      </table>
      <button
        id="submit_p2"
        className="btn btn-outline-danger"
        type="button"
        onClick={() => {
          saveConfig();
        }}
      >
        Save
      </button>
    </div>
  );
}

export default Config;
