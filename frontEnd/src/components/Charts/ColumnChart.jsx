import { Column } from "@ant-design/plots";

function ColumnChart(props) {
  let data = props.data;

  const config = {
    data,
    xField: "name",
    yField: "solves",
    seriesField: "category", // or seriesField in some cases
    color: ({ category }) => {
      console.log(category);
      switch (category) {
        case "crypto":
          return "#9966FF94";
        case "web":
          return "#ef121b94";
        case "osint":
          return "#b017a494";
        case "steganography":
          return "#17b06b94";
        case "pwn":
          return "#00d5ff94";
        case "forensics":
          return "#0f329894";
        case "misc":
          return "#ffce5694";
        default:
          return "lightblue"
      }
    },
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
