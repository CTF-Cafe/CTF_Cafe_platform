import { Pie } from "@ant-design/plots";
import { useState, useEffect, useCallback } from "react";

function PieChart(props) {
  const [data, setData] = useState(props.data);
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  useEffect(() => {
    setData(props.data);
    forceUpdate();
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
