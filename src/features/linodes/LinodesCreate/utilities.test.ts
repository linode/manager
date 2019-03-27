import { extendedTypes } from 'src/__data__/ExtendedType';
import { images } from 'src/__data__/images';
import { linode1 } from 'src/__data__/linodes';

import { extendLinodes, formatLinodeSubheading } from './utilities';

describe('Extend Linode', () => {
  it('should create an array of Extended Linodes from an array of Linodes', () => {
    const extendedLinodes = extendLinodes([linode1], images, extendedTypes);
    expect(extendedLinodes[0].heading).toBe('test');
    expect(extendedLinodes[0].subHeadings).toEqual([
      'Linode 1024, Ubuntu 16.10'
    ]);
  });

  it('should concat image and type data, seperated by a comma', () => {
    const withImage = formatLinodeSubheading('test', 'test');
    const withoutImage = formatLinodeSubheading('test');

    expect(withImage).toEqual(['test, test']);
    expect(withoutImage).toEqual(['test']);
  });
});
