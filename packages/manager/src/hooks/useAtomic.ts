import { useEffect, useState } from 'react';

type UpdateQueue<T> = {
  reject: (reason: any) => void;
  resolve: () => void;
  status: 'PENDING' | 'RUNNING';
  updater: (resource: T) => T;
}[];
/**
 * A hook that allows atomic, asynchronous updates to a resource.
 * This can be used to avoid race conditions resulting in
 * conflicting updates.
 *
 * @example
 * ```
 * const updateTagsAtomic = useAtomic(tags, updateTags);
 * setTimeout(updateTagsAtomic, 100, tags => [...tags, 'tag1']);
 * setTimeout(updateTagsAtomic, 110, tags => [...tags, 'tag2']); // This update will be queued
 * // The resulting tags will be [..., 'tag1', 'tag2']
 * // Without `useAtomic`, the updates would override each other and the result would be [..., 'tag2']
 * ```
 *
 * @param initial An initial value for the resource upon which updates are applied.
 * @param updater The asynchronous updater function. `useAtomic` will call this
 *                function after applying all queued atomic updates.
 * @returns A function that can be used to enqueue atomic updates.
 */
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
