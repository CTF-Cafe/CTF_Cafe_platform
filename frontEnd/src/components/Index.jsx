import { Outlet, Routes, Route, Link } from "react-router-dom";
import { useContext, useState } from "react";
import AppContext from "./Data/AppContext";
import Navbar from "./Global/Navbar";

function Index(props) {
  const globalData = useContext(AppContext);

  return (
    <div>
      <div className="glitch">
        <div className="glitch__img"></div>
        <div className="glitch__img"></div>
        <div className="glitch__img"></div>
        <div className="glitch__img"></div>
        <div className="glitch__img"></div>
      </div>

      <Navbar />

      <div className="jumbotron bg-transparent mb-0 pt-3 radius-0">
        <div className="container">
          <div className="row">
            <div className="col-xl-8">
              <h1 className="display-1 bold color_white content__title">
                {process.env.REACT_APP_CTF_NAME}
                <span className="vim-caret">&nbsp;</span>
              </h1>
              <h1 className="display-1 bold color_white content__title2">
                INC {new Date().getFullYear()}
              </h1>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-4">
              <p className="mt-5 text-grey text-spacey hackerFont lead">
                The quieter you become the more you are able to hear.
              </p>
              {globalData.loggedIn ? (
                <Link to={`/challenges`} style={{ display: "block" }}>
                  <button
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
                  </button>
                </Link>
              ) : (
                <Link to={`/login`} style={{ display: "block" }}>
                  <button
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
                  </button>
                </Link>
              )}
              <a
                href="https://discord.gg/HzcxNgRmjx"
                className="btn btn-outline-danger btn-shadow mr-2 ml-0 ml-sm-1"
                target="_blank"
                style={{ paddingRight: "8px" }}
              >
                <span
                  className="fa-brands fa-discord"
                  style={{ fontSize: "32px" }}
                ></span>
              </a>
              <a
                href="https://twitter.com/CTFCafe"
                className="btn btn-outline-danger btn-shadow mr-2 ml-0 ml-sm-1"
                target="_blank"
                style={{ paddingRight: "8px" }}
              >
                <span
                  className="fa-brands fa-twitter"
                  style={{ fontSize: "32px" }}
                ></span>
              </a>
              <a
                href="https://github.com/CTF-Cafe/CTF_Cafe"
                className="btn btn-outline-danger btn-shadow mr-2 ml-0 ml-sm-1"
                target="_blank"
                style={{ paddingRight: "8px" }}
              >
                <span
                  className="fa-brands fa-github"
                  style={{ fontSize: "32px" }}
                ></span>
              </a>
            </div>
          </div>

          <div className="row">
            <div
              className="col-xl-12"
              style={{ marginTop: "30px", textAlign: "center" }}
            >
              <h2 className="display-2 bold color_white">SPONSORS</h2>
              {globalData.sponsors.map((sponsor) => {
                return (
                  <img
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
