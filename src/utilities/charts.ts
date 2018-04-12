import { defaults as chartDefaults } from 'react-chartjs-2';

export function setUpCharts() {
  (chartDefaults as any).global.defaultFontFamily = '"Lato", sans-serif';
  (chartDefaults as any).global.defaultFontStyle = '700';
  (chartDefaults as any).global.defaultFontSize = 13;
}
