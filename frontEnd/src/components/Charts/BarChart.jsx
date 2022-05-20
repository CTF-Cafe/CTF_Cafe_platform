import { Bar } from "@ant-design/plots";

function BarChart(props) {
  let data = props.data;

  const config = {
    data,
    xField: "count",
    yField: "score",
    seriesField: "score",
    legend: {
      position: "top-left",
    },
  };

  return (
    <div>
      <Bar {...config} />
    </div>
  );
}

export default BarChart;
