/**
 * @file Constants related to test environment.
 */

export interface ViewportSize {
  width: number;
  height: number;
  label?: string;
}

// Array of common mobile viewports against which to test.
export const MOBILE_VIEWPORTS: ViewportSize[] = [
  {
    // iPhone 6, 7, 8, SE2, etc.
    label: 'iPhone 8',
    width: 375,
    height: 667,
  },
  {
    // iPhone 14 Pro, iPhone 15, iPhone 15 Pro, etc.
    label: 'iPhone 15',
    width: 393,
    height: 852,
  },
  {
    // iPhone 15 Pro Max
    label: 'iPhone 15 Pro Max',
    width: 430,
    height: 932,
  },
  {
    // Galaxy S22
    label: 'Samsung Galaxy S22',
    width: 360,
    height: 780,
  },
  // TODO Evaluate what devices to include here and how long to allow this list to be. Tablets?
  // Do we want to keep this short, or make it long and just choose a random subset each time we do mobile testing?
];
