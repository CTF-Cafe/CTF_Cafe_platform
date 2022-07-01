import { Column } from "@ant-design/plots";

function ColumnChart(props) {
  let data = props.data;

  const config = {
    data,
    xField: "name",
    yField: "solves",
    seriesField: "name",
    legend: {
      position: "bottom-left",
    },
  };

  return (
    <div>
      <Column {...config} />
    </div>
  );
}

export default ColumnChart;
