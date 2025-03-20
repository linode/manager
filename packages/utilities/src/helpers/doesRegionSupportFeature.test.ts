// @todo: modularization - Update this import (to import from `utilities` package)
// once the "Make RegionSelect pure" PR is merged.
import { regions } from '../../../manager/src/__data__/regionsData';

import { describe, expect, it } from 'vitest';

import { doesRegionSupportFeature } from './doesRegionSupportFeature';

const blockStorage = 'Block Storage';

describe('does region support Block Storage', () => {
  it('returns true if the region supports Block Storage', () => {
    expect(doesRegionSupportFeature('us-central', regions, blockStorage)).toBe(
      true
    );
  });

  it('returns false if the region does not support Block Storage', () => {
    expect(
      doesRegionSupportFeature('ap-northeast-1a', regions, blockStorage)
    ).toBe(false);
  });
});
