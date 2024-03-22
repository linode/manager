import { renderHook, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';

import { useAtomic } from './useAtomic';

describe('useAtomic', () => {
  it('atomically updates', async () => {
    const { result } = renderHook(() => {
      const [tags, setTags] = useState<string[]>([]);
      const updateTags = (tags: string[]) =>
        new Promise<void>((resolve) =>
          setTimeout(() => {
            setTags(tags);
            resolve();
          }, 100)
        );
      const updateTagsAtomic = useAtomic(tags, updateTags);
      useEffect(() => {
        setTimeout(() => {
          updateTagsAtomic((tags) => [...tags, 'tag1']);
        }, 0);
        setTimeout(() => {
          updateTagsAtomic((tags) => [...tags, 'tag2']);
        }, 10);
      }, []);

      return tags;
    });

    await waitFor(() => {
      expect(result.current).toEqual(['tag1', 'tag2']);
    });
  });

  it("wouldn't work without", async () => {
    const { result } = renderHook(() => {
      const [tags, setTags] = useState<string[]>([]);
      const updateTags = (tags: string[]) =>
        new Promise<void>((resolve) =>
          setTimeout(() => {
            setTags(tags);
            resolve();
          }, 100)
        );
      useEffect(() => {
        setTimeout(() => {
          updateTags([...tags, 'tag1']);
        }, 0);
        setTimeout(() => {
          updateTags([...tags, 'tag2']);
        }, 10);
      }, []);

      return tags;
    });

    await waitFor(() => {
      expect(result.current).toEqual(['tag2']);
    });
  });

  it('batches updates when debounce is specified', async () => {
    const calls: string[][] = [];
    const callFn = (items: string[]) =>
      new Promise<void>((resolve) => {
        calls.push(items);
        resolve();
      });

    renderHook(() => {
      const callFnAtomic = useAtomic([], callFn, 100);
      useEffect(() => {
        setTimeout(() => {
          callFnAtomic((items) => [...items, 'item1']);
        }, 0);
        setTimeout(() => {
          callFnAtomic((items) => [...items, 'item2']);
        }, 50);
        setTimeout(() => {
          callFnAtomic((items) => [...items, 'item3']);
        }, 200);
      }, []);
    });

    await waitFor(() => {
      expect(calls).toEqual([['item1', 'item2'], ['item3']]);
    });
  });
});
