import { renderHook, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';

import { useAtomic } from './useAtomic';

describe('useAtomic', () => {
  it('batches updates', async () => {
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
});
