// Registers Chart.js pieces exactly once for all charts.
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend,
    Filler,
  } from "chart.js";
  
  if (!ChartJS.registry.controllers.has("line")) {
    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      BarElement,
      Tooltip,
      Legend,
      Filler
    );
  }
  
  // Global-ish defaults (optional)
  ChartJS.defaults.responsive = true;
  ChartJS.defaults.maintainAspectRatio = false;
  ChartJS.defaults.plugins.legend.position = "bottom";
  