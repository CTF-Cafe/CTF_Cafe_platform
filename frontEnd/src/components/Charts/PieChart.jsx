import { Pie } from "@ant-design/plots";
import { useState, useEffect } from "react";

function PieChart(props) {
  let data, setData = useState(props.data);

  useEffect(() => {
    setData(props.data);
  }, [props]);

  const config = {
    appendPadding: 10,
    data,
    angleField: "value",
    colorField: "name",
    radius: 0.9,
    label: {
      type: "inner",
      offset: "-30%",
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: "center",
      },
    },
    interactions: [
      {
        type: "element-active",
      },
    ],
  };

  return (
    <div>
      <Pie {...config} />
    </div>
  );
}

export default PieChart;
