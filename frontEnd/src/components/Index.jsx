import { Outlet, Routes, Route, Link } from "react-router-dom";
import { useContext, useState } from "react";
import AppContext from "./Data/AppContext";
import Navbar from "./Global/Navbar";

function Index(props) {
  const globalData = useContext(AppContext);

  return (
    <div>
      <div className="glitch">
        <div className="glitch_bg"></div>
        <div className="glitch_bg"></div>
        <div className="glitch_bg"></div>
        <div className="glitch_bg"></div>
        <div className="glitch_bg"></div>
      </div>

      <Navbar />

      <div className="jumbotron bg-transparent mb-0 pt-3 radius-0">
        <div className="container">
          <div className="row">
            <div className="col-xl-8">
              <h1 className="display-1 bold color_white content__title cool">
                {process.env.REACT_APP_CTF_NAME.toUpperCase()}
                <span className="vim-caret">&nbsp;</span>
              </h1>
              <p>
                {`${new Date(globalData.startTime).toDateString()} ${new Date(
                  globalData.startTime
                ).getHours()}:${new Date(
                  globalData.startTime
                ).getMinutes()} - ${new Date(
                  globalData.endTime
                ).toDateString()} ${new Date(
                  globalData.endTime
                ).getHours()}:${new Date(globalData.endTime).getMinutes()}`}
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-4">
              {globalData.loggedIn ? (
                <Link
                  to={`/challenges`}
                  className="btn btn-outline-danger btn-shadow px-3 my-2 ml-0 ml-sm-1 text-center"
                  ref={(element) => {
                    if (element)
                      element.style.setProperty(
                        "padding-right",
                        "14px",
                        "important"
                      );
                    if (element)
                      element.style.setProperty(
                        "padding-left",
                        "14px",
                        "important"
                      );
                  }}
                >
                  <h4 style={{ fontSize: "1.4rem" }}>Challenges</h4>
                </Link>
              ) : (
                <Link
                  to={`/login`}
                  className="btn btn-outline-danger btn-shadow px-3 my-2 ml-0 ml-sm-1 text-center"
                  ref={(element) => {
                    if (element)
                      element.style.setProperty(
                        "padding-right",
                        "52px",
                        "important"
                      );
                    if (element)
                      element.style.setProperty(
                        "padding-left",
                        "52px",
                        "important"
                      );
                  }}
                >
                  <h4>Login</h4>
                </Link>
              )}
              <br />
              {globalData.socialLinks.map((social) => 
                <a
                  href={social.link}
                  className="btn btn-outline-danger btn-shadow mr-2 ml-0 ml-sm-1"
                  target="_blank"
                  rel="noreferrer"
                  style={{ padding: "8px" }}
                  key={social.link}
                >
                  <span
                    className={"fa-brands fa-" + social.icon}
                    style={{ fontSize: "32px" }}
                  ></span>
                </a>
              )}
            </div>
          </div>

          <div className="row">
            <div
              className="col-xl-12"
              style={{ marginTop: "30px", textAlign: "center" }}
            >
              {globalData.sponsors.length > 0 ? (
                <>
                  <h2 className="display-2 bold color_white cool">SPONSORS</h2>
                  {globalData.sponsors.map((sponsor) => {
                    return (
                      <img
                        alt="sponsor"
                        key={sponsor.image}
                        src={sponsor.image}
                        style={{
                          margin: "0px 15px",
                          marginTop: "30px",
                          width: "400px",
                        }}
                      />
                    );
                  })}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
