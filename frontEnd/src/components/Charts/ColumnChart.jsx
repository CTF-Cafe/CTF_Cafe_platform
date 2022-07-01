import { Column } from "@ant-design/plots";

function ColumnChart(props) {
  let data = props.data;

  const config = {
    data,
    xField: "name",
    yField: "solves",
    slider: {
      start: 0.1,
      end: 0.2,
    },
  };

  return (
    <div>
      <Column {...config} />
    </div>
  );
}

export default ColumnChart;
