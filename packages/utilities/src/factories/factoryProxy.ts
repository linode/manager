import * as Factory from 'factory.ts';

const originalEach = Factory.each;

/**
 * This file is a proxy for the factory.ts library.
 *
 * We Override the `each` method of the factory.ts library to start the index from 1
 * This prevents a a variety of issues with entity IDs being falsy when starting from 0.
 *
 * As a result, `Factory` must be imported from the `factoryProxy` file. ex:
 * `import Factory from 'src/factories/factoryProxy';`
 */
const factoryProxyHandler = {
  get(
    target: typeof Factory,
    prop: keyof typeof Factory,
    receiver: typeof Factory
  ) {
    if (prop === 'each') {
      return (fn: (index: number) => number | string) => {
        return originalEach((i) => {
          return fn(i + 1);
        });
      };
    }

    return Reflect.get(target, prop, receiver);
  },
};

const factoryProxy = new Proxy(Factory, factoryProxyHandler);

export { factoryProxy as Factory };
