import { Outlet, Routes, Route, Link } from "react-router-dom";
import { useEffect, useContext } from "react";
import AppContext from './Data/AppContext';
import Navbar from './Global/Navbar';

function FourOFour(props) {
  const globalData = useContext(AppContext);
  return (
    <div>
      <style>{"body { background-color: #0b130d }"}</style>
      <div className="glitch">
        <div className="glitch_bg bg"></div>
        <div className="glitch_bg bg"></div>
        <div className="glitch_bg bg"></div>
        <div className="glitch_bg bg"></div>
        <div className="glitch_bg bg"></div>
      </div>

      <Navbar />

      <div className="jumbotron bg-transparent mb-0 pt-5 radius-0" style={{ position: "relative" }}>
        <div className="container">
          <div className="row">
            <div className="col-xl-12 text-center">
              <h1
                style={{ backgroundColor: "#000000A4" }}
                className="py-5 display-1 bold color_white content__title cool"
              >
                404 N07 F0UND<span className="vim-caret">&nbsp;</span>
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FourOFour;
