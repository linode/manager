import { extendedTypes } from 'src/__data__/ExtendedType';
import { images } from 'src/__data__/images';
import { linode1 } from 'src/__data__/linodes';

import { extendLinodes } from './utilities';

describe('Extend Linode', () => {
  it('should do the thing', () => {
    const extendedLinodes = extendLinodes([linode1], images, extendedTypes);
    expect(extendedLinodes[0].heading).toBe('test');
    expect(extendedLinodes[0].subHeadings).toEqual([
      'Linode 1024, Ubuntu 16.10'
    ]);
  });
});
