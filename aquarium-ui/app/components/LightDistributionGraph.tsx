import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LightingData {
  time: string;
  brightness: number;
  red: number;
  green: number;
  blue: number;
  white: number;
}

interface LightDistributionGraphProps {
  data: LightingData[];
}

export default function LightDistributionGraph({
  data,
}: LightDistributionGraphProps) {
  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Light Distribution Throughout the Day",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Intensity (%)",
        },
      },
      x: {
        type: "category",
        title: {
          display: true,
          text: "Time of Day",
        },
        ticks: {
          callback(tickValue: number | string) {
            const timeEntry = data[Number(tickValue)];
            if (!timeEntry) return "";
            return timeEntry.time;
          },
        },
      },
    },
  };

  const chartData = {
    labels: data.map((d) => d.time),
    datasets: [
      {
        label: "Brightness",
        data: data.map((d) => d.brightness),
        borderColor: "rgb(255, 205, 86)",
        backgroundColor: "rgba(255, 205, 86, 0.5)",
        fill: true,
      },
      {
        label: "Red",
        data: data.map((d) => (d.red / 255) * 100),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Green",
        data: data.map((d) => (d.green / 255) * 100),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
      {
        label: "Blue",
        data: data.map((d) => (d.blue / 255) * 100),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
      {
        label: "White",
        data: data.map((d) => (d.white / 255) * 100),
        borderColor: "rgb(201, 203, 207)",
        backgroundColor: "rgba(201, 203, 207, 0.5)",
      },
    ],
  };

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Line options={options} data={chartData} />
    </div>
  );
}
