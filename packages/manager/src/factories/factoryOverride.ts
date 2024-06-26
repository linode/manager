import * as Factory from 'factory.ts';

const originalEach = Factory.each;

Object.defineProperty(Factory, 'each', {
  value: (fn: any) => {
    return originalEach((i) => {
      return fn(i + 1);
    });
  },
  writable: false,
});
