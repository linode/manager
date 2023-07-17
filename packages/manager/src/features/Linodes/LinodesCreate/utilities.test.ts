import { extendedTypes } from 'src/__data__/ExtendedType';
import { linode1, linode2 } from 'src/__data__/linodes';
import { imageFactory, normalizeEntities } from 'src/factories';

import {
  extendLinodes,
  formatLinodeSubheading,
  getMonthlyAndHourlyNodePricing,
  getRegionIDFromLinodeID,
} from './utilities';

const linodeImage = imageFactory.build({
  id: 'linode/debian10',
  label: 'Debian 10',
  vendor: 'linode',
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
    expect(extendedLinodes[0].subHeadings).toEqual(['Nanode 1 GB, Debian 10']);
  });

  it('should concat image, type data, and region data separated by a comma', () => {
    const withImage = formatLinodeSubheading('linode', 'image');
    const withoutImage = formatLinodeSubheading('linode');
    const withImageAndRegion = formatLinodeSubheading(
      'linode',
      'image',
      'region'
    );

    expect(withImage).toEqual(['linode, image']);
    expect(withoutImage).toEqual(['linode']);
    expect(withImageAndRegion).toEqual(['linode, image, region']);
  });
});

describe('getRegionIDFromLinodeID', () => {
  it('returns the regionID from the given Linodes and Linode ID', () => {
    expect(getRegionIDFromLinodeID([linode1, linode2], 2020425)).toBe(
      'us-east'
    );
  });
});

describe('Marketplace cluster pricing', () => {
  it('should return the monthly and hourly price multipled by the number of nodes', () => {
    expect(getMonthlyAndHourlyNodePricing(30, 0.045, 3)).toEqual({
      hourlyPrice: 0.135,
      monthlyPrice: 90,
    });
  });

  it('should round the hourly price to 3 digits', () => {
    expect(getMonthlyAndHourlyNodePricing(30, 0.045, 5)).toEqual({
      hourlyPrice: 0.225,
      monthlyPrice: 150,
    });
  });
});
