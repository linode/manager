import { linodeFactory } from 'src/factories';

import { mapIdsToDevices } from './mapIdsToDevices';

describe('mapIdsToLinodes', () => {
  const linodes = linodeFactory.buildList(5);
  it('works with a single id', () => {
    expect(mapIdsToDevices(1, linodes)).toBe(linodes[1]);
  });
  it('works with a multiple ids', () => {
    expect(mapIdsToDevices([0, 1, 2], linodes)).toEqual([
      linodes[0],
      linodes[1],
      linodes[2],
    ]);
  });
  it('omits missing ids', () => {
    expect(mapIdsToDevices(99, linodes)).toBe(null);
    expect(mapIdsToDevices([0, 99, 2], linodes)).toEqual([
      linodes[0],
      linodes[2],
    ]);
  });
});
