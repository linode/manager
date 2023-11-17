import { extendedTypes } from 'src/__data__/ExtendedType';
import { linode1, linode2 } from 'src/__data__/linodes';
import { imageFactory, normalizeEntities } from 'src/factories';
import { stackScriptFactory } from 'src/factories/stackscripts';

import {
  extendLinodes,
  filterOneClickApps,
  formatLinodeSubheading,
  getMonthlyAndHourlyNodePricing,
  getRegionIDFromLinodeID,
  handleAppLabel,
  trimOneClickFromLabel,
} from './utilities';

import type { StackScript } from '@linode/api-v4';

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

describe('trimOneClickFromLabel', () => {
  const stackScript = stackScriptFactory.build({
    label: 'MongoDB Cluster One-Click',
  });

  it('should remove "One-Click" from the label', () => {
    expect(trimOneClickFromLabel(stackScript)).toStrictEqual({
      ...stackScript,
      label: 'MongoDB Cluster ',
    });
  });
});

describe('filterOneClickApps', () => {
  const baseApps = {
    1: 'Base App 1',
    2: 'Base App 2',
    3: 'Base App 3',
    4: 'Base App 4',
  };
  const newApps = {
    5: 'New App 1',
    6: 'New App 2',
    7: 'New App 3',
    8: 'New App 4',
  };

  const stackScript = stackScriptFactory.build();

  // id: 1,2,3,4
  const queryResultsWithHelpers: StackScript[] = [
    ...stackScriptFactory.buildList(3),
    { ...stackScript, id: 4, label: 'StackScript Helpers' },
  ];
  // id: 5,6,7,8
  const queryResultsWithoutHelpers: StackScript[] = stackScriptFactory.buildList(
    4
  );

  it('filters OneClickApps and trims labels, excluding StackScripts with Helpers', () => {
    // feeding 4 Ids (1,2,3,4) getting 3 back
    const filteredOCAsWithHelpersLabel = filterOneClickApps({
      baseApps,
      newApps,
      queryResults: queryResultsWithHelpers,
    });
    expect(filteredOCAsWithHelpersLabel.length).toBe(3);

    // feeding 4 Ids (5,6,7,8) getting 4 back
    const filteredOCAsWithoutHelpersLabel = filterOneClickApps({
      baseApps,
      newApps,
      queryResults: queryResultsWithoutHelpers,
    });

    expect(filteredOCAsWithoutHelpersLabel.length).toBe(4);
  });

  it('handles empty queryResults', () => {
    const emptyQueryResults: StackScript[] = [];
    const filteredOCAs = filterOneClickApps({
      baseApps,
      newApps,
      queryResults: emptyQueryResults,
    });

    // Expect an empty array when queryResults is empty
    expect(filteredOCAs).toEqual([]);
  });
});

describe('handleAppLabel', () => {
  it('should decode the label and remove "Cluster" when cluster_size is present', () => {
    const stackScript = stackScriptFactory.build({
      label: 'My StackScript Cluster ',
      user_defined_fields: [{ name: 'cluster_size' }],
    });

    const result = handleAppLabel(stackScript);

    expect(result.decodedLabel).toBe('My StackScript Cluster ');
    expect(result.isCluster).toBe(true);
    expect(result.label).toBe('My StackScript');
  });

  it('should decode the label without removing "Cluster" when cluster_size is not present', () => {
    const stackScript = stackScriptFactory.build({
      label: 'My StackScript&reg; Cluster ',
      user_defined_fields: [],
    });

    const result = handleAppLabel(stackScript);

    expect(result.decodedLabel).toBe('My StackScript® Cluster ');
    expect(result.isCluster).toBe(false);
    expect(result.label).toBe('My StackScript® Cluster ');
  });
});
