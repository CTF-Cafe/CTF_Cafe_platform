import React, { useState, useEffect } from "react";
import { Line } from "@ant-design/plots";

const LineChart = (props) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    let rawData = [...props.data.slice(0, 10)];

    let structuredData = [];

    if (props.selection === "Users") {
      rawData.forEach((user) => {
        let currentPoints = 0;
        let d = new Date(props.startTime);
        let dformat =
          [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/") +
          " " +
          [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
        structuredData.push({
          date: dformat,
          points: 0,
          name: user.username,
        });

        d = new Date(props.endTime);
        dformat =
          [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/") +
          " " +
          [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
        structuredData.push({
          date: dformat,
          points: user.score,
          name: user.username,
        });
        
        user.items = [
          ...user.solved,
          ...user.hintsBought.map((x) => {
            return { points: -x.cost, timestamp: x.timestamp };
          }),
        ];

        user.items.sort((a, b) => a.timestamp - b.timestamp);
        user.items.forEach((item) => {
          currentPoints += item.points;
          d = new Date(item.timestamp);
          dformat =
            [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/") +
            " " +
            [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
          structuredData.push({
            date: dformat,
            points: currentPoints,
            name: user.username,
          });
        });
      });

      structuredData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else {
      rawData.forEach((team) => {
        let currentPoints = 0;
        let d = new Date(props.startTime);
        let dformat =
          [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/") +
          " " +
          [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
        structuredData.push({
          date: dformat,
          points: 0,
          name: team.name,
        });

        d = new Date(props.endTime);
        dformat =
          [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/") +
          " " +
          [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
        structuredData.push({
          date: dformat,
          points: team.totalScore,
          name: team.name,
        });

        team.items = [
          ...team.solved,
          ...team.hintsBought.map((x) => {
            return { points: -x.cost, timestamp: x.timestamp };
          }),
        ];

        team.items.sort((a, b) => a.timestamp - b.timestamp);
        team.items.forEach((item) => {
          currentPoints += item.points;
          d = new Date(item.timestamp);
          dformat =
            [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/") +
            " " +
            [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
          structuredData.push({
            date: dformat,
            points: currentPoints,
            name: team.name,
          });
        });
      });

      structuredData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }

    setData(structuredData);
  }, [props]);

  // { time: "1850", points: 54, name: "Test" }

  const config = {
    data,
    xField: "date",
    yField: "points",
    seriesField: "name",
    // point: {
    //   shape: "circle",
    // },
    smooth: true,
    theme: "dark",
    padding: 50,
  };

  return <Line {...config} />;
};

export default LineChart;
