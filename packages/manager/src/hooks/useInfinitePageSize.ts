import { storage } from 'src/utilities/storage';

export const useInfinitePageSize = () => {
  return {
    // Setting infinitePageSize to 100 since Show All is effecting page performance.
    infinitePageSize:
      storage.infinitePageSize.get() === Infinity
        ? 100
        : storage.infinitePageSize.get(),
    setInfinitePageSize: storage.infinitePageSize.set,
  };
};
