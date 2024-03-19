import { useEffect, useState } from 'react';

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
 * @param initial   An initial value for the resource upon which updates are applied.
 * @param updater   The asynchronous updater function. `useAtomic` will call this
 *                  function after applying all queued atomic updates.
 * @param debounce  An optional period (in ms) to wait for new updates before applying queued updates.
 * @returns A function that can be used to enqueue atomic updates.
 */
export const useAtomic = <T>(
  initial: T,
  updater: (value: T) => Promise<void>,
  debounce?: number
) => {
  const [updateQueue] = useState(
    () => new AtomicQueue<T>(initial, updater, debounce)
  );
  useEffect(() => {
    updateQueue.resource = initial;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  return (update: (value: T) => T) => updateQueue.enqueue(update);
};

class AtomicQueue<T> {
  constructor(
    public resource: T,
    private readonly updater: (value: T) => Promise<void>,
    private readonly debounce?: number
  ) {}

  public enqueue = (updater: (prev: T) => T) =>
    new Promise<void>((resolve, reject) => {
      this.queue.push({ reject, resolve, updater });
      if (this.queueStatus.status == 'PENDING') {
        this.queueStatus.clearTimeout();
        this.queueStatus = { status: 'IDLE' };
      }
      this.executeQueue();
    });

  private executeQueue = () => {
    if (this.queue.length == 0 || this.queueStatus.status != 'IDLE') {
      return;
    }
    const timeout = setTimeout(() => {
      const updates = this.queue;
      this.queue = [];
      this.queueStatus = { status: 'RUNNING' };
      // alert('Updating ' + updates.map((update) => update.label).join(', '));
      this.updater(
        updates.reduce((prev, cur) => cur.updater(prev), this.resource)
      )
        .then(() => updates.forEach(({ resolve }) => resolve()))
        .catch((e) => updates.forEach(({ reject }) => reject(e)))
        .finally(() => {
          this.queueStatus = { status: 'IDLE' };
          this.executeQueue();
        });
    }, this.debounce);

    this.queueStatus = {
      clearTimeout: () => clearTimeout(timeout),
      status: 'PENDING',
    };
  };

  private queue: {
    reject: (reason: any) => void;
    resolve: () => void;
    updater: (resource: T) => T;
  }[] = [];

  private queueStatus:
    | {
        clearTimeout: () => void;
        status: 'PENDING';
      }
    | {
        status: 'IDLE' | 'RUNNING';
      } = { status: 'IDLE' };
}
