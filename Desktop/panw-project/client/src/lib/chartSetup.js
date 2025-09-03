import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Title,
  } from "chart.js";
  
  let registered = false;
  export function ensureChartSetup() {
    if (registered) return;
    ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Title);
    registered = true;
  }
  