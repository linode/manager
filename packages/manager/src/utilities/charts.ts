// Here i do `import * as Chart` instead of `import Chart` because of issues with jest
// jest not be able to access the namespce variable correctly
import { Chart } from 'chart.js';

export const setUpCharts = () => {
  Chart.defaults.fontFamily = '"LatoWeb", sans-serif';
  Chart.defaults.fontStyle = '700';
  Chart.defaults.fontSize = 13;
};
