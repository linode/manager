import * as Factory from 'factory.ts';

const originalEach = Factory.each;

const isCypress = typeof window !== 'undefined' && (window as any).Cypress;

/**
 * Override the each method of the factory.ts library to start the index from 1
 * This prevents a a variety of issues with entity IDs being falsy.
 *
 * Monkey patching here in oder to avoid patching the library itself.
 * While not ideal, it prevents us from having to maintain a fork of the library,
 * or having to modify and remember to increment every `each` at the factory level.
 */
if (!isCypress) {
  Object.defineProperty(Factory, 'each', {
    value: (fn: (index: number) => number | string) => {
      return originalEach((i) => {
        return fn(i + 1);
      });
    },
    writable: false,
  });
}
