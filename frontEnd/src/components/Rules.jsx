import { Outlet, Routes, Route, Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import AppContext from "./Data/AppContext";
import Navbar from "./Global/Navbar";
import axios from "axios";

function Rules(props) {
  const globalData = useContext(AppContext);

  return (
    <div>
      <div className="bg" />

      <Navbar />

      <div className="jumbotron bg-transparent mb-0 pt-3 radius-0" style={{ position: "relative" }}>
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <h1 className="display-1 bold color_white text-center cool">
                CTF<span className="color_danger">RULES</span>
              </h1>
              <p className="text-grey text-spacey text-center hackerFont lead">
                A community of like minded individuals who support cybersecurity
                and Anonymous.
              </p>
              <div className="row justify-content-center hackerFont">
                <div className="col-md-8">
                  <ul style={{ listStyleType: "none" }}>
                    {globalData.rules.map((rule) => {
                      return (
                        <li key={rule.text}>
                          <p>
                            {rule.text}
                            {rule.link ? (
                              <>
                                <br />
                                <a href={rule.link} target="_blank">
                                  {rule.linkText}
                                </a>
                              </>
                            ) : null}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="row text-center pt-5">
                    <div className="col-xl-12">
                      {globalData.loggedIn ? (
                        <Link to={`/challenges`}>
                          <button className="btn btn-outline-danger btn-shadow px-3my-2 ml-0 ml-sm-1 text-left">
                            <h4>LET IT RIP!</h4>
                          </button>
                        </Link>
                      ) : (
                        <Link to={`/login`}>
                          <button className="btn btn-outline-danger btn-shadow px-3my-2 ml-0 ml-sm-1 text-left">
                            <h4>LET IT RIP!</h4>
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rules;
