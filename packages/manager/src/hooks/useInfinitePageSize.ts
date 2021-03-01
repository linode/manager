import { useMemo } from 'react';
import { storage } from 'src/utilities/storage';

export const useInfinitePageSize = () => {
  return {
    infinitePageSize: useMemo(storage.infinitePageSize.get, []),
    setInfinitePageSize: storage.infinitePageSize.set,
  };
};
