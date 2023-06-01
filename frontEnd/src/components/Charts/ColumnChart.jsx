import { Column } from "@ant-design/plots";

function ColumnChart(props) {
  let data = props.data;

  const config = {
    data,
    xField: "name",
    yField: "solves",
    seriesField: "tag", // or seriesField in some cases
    color: ({ tag }) => {
      return (
        props.tagColors.find((x) => tag.includes(x.name)) || {
          color: "#ADD8E6",
        }
      ).color;
    },
    slider: {
      start: 0,
      end: 1,
    },
  };

  return (
    <div>
      <Column {...config} />
    </div>
  );
}

export default ColumnChart;
