import { Chart } from 'chart.js';

export const setUpCharts = () => {
  /**
   * The any-casting is bad, but necessary because the typings
   * don't match what's actually on the object. Hopefully this
   * can be cleaned up post-beta.
   */
  (Chart as any).defaults.fontFamily = '"LatoWeb", sans-serif';
  (Chart as any).defaults.fontStyle = '700';
  (Chart as any).defaults.fontSize = 13;
};
