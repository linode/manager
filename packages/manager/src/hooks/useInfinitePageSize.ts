import { useMemo } from 'react';
import { storage } from 'src/utilities/storage';

export const useInfinitePageSize = () => {
  // Setting infinitePageSize to 100 since show all effecting page performacne.
  const infinitePageSize =
    storage.infinitePageSize.get() === Infinity
      ? 100
      : storage.infinitePageSize.get();
  return {
    infinitePageSize: useMemo(() => infinitePageSize, []),
    setInfinitePageSize: storage.infinitePageSize.set,
  };
};
