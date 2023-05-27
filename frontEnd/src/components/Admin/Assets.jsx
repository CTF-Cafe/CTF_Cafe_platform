import { Outlet, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AppContext from "../Data/AppContext";

function Assets(props) {
  const globalData = useContext(AppContext);
  const [assets, setAssets] = useState([]);

  const getAssets = () => {
    axios
      .get(process.env.REACT_APP_BACKEND_URI + "/api/admin/getAssets", { withCredentials: true })
      .then((response) => {
        if (response.data.state == "sessionError") {
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
  };

  useEffect(() => {
    getAssets();
  }, []);

  const deleteAsset = (e, asset) => {
    e.preventDefault();
    axios
      .post(process.env.REACT_APP_BACKEND_URI + "/api/admin/deleteAsset", {
        asset: asset.name,
      }, { withCredentials: true })
      .then((response) => {
        if (response.data.state == "sessionError") {
          globalData.alert.error("Session expired!");
          globalData.setUserData({});
          globalData.setLoggedIn(false);
          globalData.navigate("/", { replace: true });
        } else {
          if (response.data.state == "success") {
            globalData.alert.success("Deleted asset!");
            getAssets();
          } else {
            globalData.alert.error(response.data.message);
            getAssets();
          }
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const fileUpload = (e) => {
    var formData = new FormData();
    var file = e.target;
    formData.append("file", file.files[0]);

    axios.post(process.env.REACT_APP_BACKEND_URI + "/api/admin/uploadAsset", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
    }).then((response) => {
      if (response.data.state == "sessionError") {
        globalData.alert.error("Session expired!");
        globalData.setUserData({});
        globalData.setLoggedIn(false);
        globalData.navigate("/", { replace: true });
      } else {
        if (response.data.state == "success") {
          globalData.alert.success("Uploaded asset!");
          getAssets();
        } else {
          globalData.alert.error(response.data.message);
          getAssets();
        }
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
  }

  return (
    <div>
      <h1
        className="display-1 bold color_white cool"
        style={{ textAlign: "center", marginBottom: "50px" }}
      >
        ASSETS
      </h1>
      <div  style={{ marginBottom: "30px", display: 'flex', flexDirection: 'column' }}>
        <label
          for="formFile"
          className="form-label"
        >
          Upload File
        </label>
        <input id='uploadedAsset' type="file" onChange={fileUpload} />
      </div>
      <table className="table table-hover table-striped">
        <thead className="thead-dark hackerFont">
          <tr>
            <th scope="col" style={{ textAlign: "center" }}>
              #
            </th>
            <th scope="col">File Name</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset, index) => {
            return (
              <tr key={asset.name}>
                <th scope="row" style={{ textAlign: "center" }}>
                  {index}
                </th>
                <td>
                  <a
                    href="#"
                    className="btn btn-outline-danger btn-shadow"
                    onClick={(e) => {
                      deleteAsset(e, asset);
                    }}
                    style={{ marginRight: "30px" }}
                  >
                    <span className="fa-solid fa-minus"></span>
                  </a>
                  {asset.name}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Assets;
