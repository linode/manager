import { useEffect, useState } from 'react';

type UpdateQueue<T> = {
  reject: (reason: any) => void;
  resolve: () => void;
  status: 'PENDING' | 'RUNNING';
  updater: (resource: T) => T;
}[];

export const useAtomic = <T>(
  initial: T,
  updater: (value: T) => Promise<void>
) => {
  const [updateQueue, setUpdateQueue] = useState<UpdateQueue<T>>([]);

  useEffect(() => {
    if (
      updateQueue.length > 0 &&
      updateQueue.every((update) => update.status == 'PENDING')
    ) {
      const updates = new Set(updateQueue);
      updateQueue.forEach((update) => (update.status = 'RUNNING'));
      updater(updateQueue.reduce((prev, cur) => cur.updater(prev), initial))
        .then(() => updates.forEach(({ resolve }) => resolve()))
        .catch((e) => updates.forEach(({ reject }) => reject(e)))
        .finally(() =>
          setUpdateQueue((queue) =>
            queue.filter((update) => !updates.has(update))
          )
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateQueue]);

  return (updater: (value: T) => T) =>
    new Promise<void>((resolve, reject) => {
      setUpdateQueue((queue) => {
        return [...queue, { reject, resolve, status: 'PENDING', updater }];
      });
    });
};
