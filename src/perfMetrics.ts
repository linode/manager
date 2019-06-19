import * as _Perfume from 'perfume.js';
import { LOG_PERFORMANCE_METRICS } from './constants';

// Something is off about the way `perfume.js` is exported, and it behaves
// differently when running the app vs. running tests. Not sure if this is an
// issue with Jest, perfume.js, or what, but this is the workaround I came up with.
const Perfume: any = _Perfume.default ? _Perfume.default : _Perfume;

export const perfume = new Perfume({
  firstPaint: true,
  googleAnalytics: {
    enable: true,
    timingVar: 'perfMetrics'
  },
  browserTracker: true,
  logPrefix: 'Performance:',
  logging: LOG_PERFORMANCE_METRICS
});
