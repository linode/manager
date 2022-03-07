import { extendedTypes } from 'src/__data__/ExtendedType';
import { imageFactory, normalizeEntities } from 'src/factories';
import { linode1, linode2 } from 'src/__data__/linodes';

import {
  extendLinodes,
  formatLinodeSubheading,
  getRegionIDFromLinodeID,
} from './utilities';

const linodeImage = imageFactory.build({
  vendor: 'linode',
  id: 'linode/debian10',
  label: 'Debian 10',
});
const images = normalizeEntities(imageFactory.buildList(10));
images['linode/debian10'] = linodeImage;

describe('Extend Linode', () => {
  it('should create an array of Extended Linodes from an array of Linodes', () => {
    const extendedLinodes = extendLinodes(
      [
        {
          ...linode1,
          image: 'linode/debian10',
        },
      ],
      images,
      extendedTypes
    );
    expect(extendedLinodes[0].heading).toBe('test');
    expect(extendedLinodes[0].subHeadings).toEqual(['Linode 1024, Debian 10']);
  });

  it('should concat image and type data, separated by a comma', () => {
    const withImage = formatLinodeSubheading('test', 'test');
    const withoutImage = formatLinodeSubheading('test');

    expect(withImage).toEqual(['test, test']);
    expect(withoutImage).toEqual(['test']);
  });
});

describe('getRegionIDFromLinodeID', () => {
  it('returns the regionID from the given Linodes and Linode ID', () => {
    expect(getRegionIDFromLinodeID([linode1, linode2], 2020425)).toBe(
      'us-east-1a'
    );
  });
});
