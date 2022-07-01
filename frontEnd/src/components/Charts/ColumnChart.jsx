import { Column } from "@ant-design/plots";

function ColumnChart(props) {
  let data = props.data;

  const config = {
    data,
    xField: "name",
    yField: "solves",
    scrollbar: {
      type: 'horizontal',
    },
  };

  return (
    <div>
      <Column {...config} />
    </div>
  );
}

export default ColumnChart;
