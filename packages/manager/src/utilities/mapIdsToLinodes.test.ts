import { linodeFactory } from 'src/factories';

import { mapIdsToLinodes } from './mapIdsToLinodes';

describe('mapIdsToLinodes', () => {
  const linodes = linodeFactory.buildList(5);
  it('works with a single id', () => {
    expect(mapIdsToLinodes(1, linodes)).toBe(linodes[1]);
  });
  it('works with a multiple ids', () => {
    expect(mapIdsToLinodes([0, 1, 2], linodes)).toEqual([
      linodes[0],
      linodes[1],
      linodes[2],
    ]);
  });
  it('omits missing ids', () => {
    expect(mapIdsToLinodes(99, linodes)).toBe(null);
    expect(mapIdsToLinodes([0, 99, 2], linodes)).toEqual([
      linodes[0],
      linodes[2],
    ]);
  });
});
