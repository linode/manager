import * as React from 'react';

// useSet exposes an easy API to consumers wishing to use the Set data structure
// as function component state. Sets work pretty well with function components,
// but adding and deleting items is somewhat verbose (well, really only ~5 lines)
// since a new Set must be created in order for React to successfully diff and
// update the DOM when appropriate.
export const useSet = <T>(initial?: Iterable<T>) => {
  const [set, setSet] = React.useState(new Set(initial));

  const add = (element: T) => {
    setSet((prevSet) => {
      // A new Set must be created, otherwise React won't know to re-render the DOM.
      const newSet = new Set(prevSet);
      newSet.add(element);
      return newSet;
    });
  };

  const _delete = (element: T) => {
    setSet((prevSet) => {
      // A new Set must be created, otherwise React won't know to re-render the DOM.
      const newSet = new Set(prevSet);
      newSet.delete(element);
      return newSet;
    });
  };

  // Proxy methods. The entire Set is also exported, so these are just a convenience.
  // More Set methods can be added here.
  const has = (element: T) => set.has(element);

  const forEach = (callbackFn: (value1: T, value2: T, set: Set<T>) => void) =>
    set.forEach(callbackFn);

  const clear = () => set.clear();

  return {
    add,
    clear,
    delete: _delete,
    forEach,
    has,
    set,
  };
};
