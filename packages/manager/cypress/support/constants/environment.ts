/**
 * @file Constants related to test environment.
 */

export interface ViewportSize {
  height: number;
  label?: string;
  width: number;
}

// Array of common mobile viewports against which to test.
export const MOBILE_VIEWPORTS: ViewportSize[] = [
  {
    // iPhone 14 Pro, iPhone 15, iPhone 15 Pro, etc.
    label: 'iPhone 15',
    width: 393,
    height: 852,
  },
  // TODO Evaluate what devices to include here and how long to allow this list to be. Tablets?
  // Do we want to keep this short, or make it long and just choose a random subset each time we do mobile testing?
];
