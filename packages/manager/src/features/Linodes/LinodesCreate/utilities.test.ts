import { imageFactory, normalizeEntities } from 'src/factories';
import { stackScriptFactory } from 'src/factories/stackscripts';

import {
  filterOneClickApps,
  getMonthlyAndHourlyNodePricing,
  handleAppLabel,
  trimOneClickFromLabel,
  utoa,
} from './utilities';

import type { StackScript } from '@linode/api-v4';

const linodeImage = imageFactory.build({
  id: 'linode/debian10',
  label: 'Debian 10',
  vendor: 'linode',
});

const images = normalizeEntities(imageFactory.buildList(10));
images['linode/debian10'] = linodeImage;

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
  const baseAppIds = [2, 3, 4, 5];
  const newApps = {
    6: 'New App 1',
    7: 'New App 2',
    8: 'New App 3',
    9: 'New App 4',
  };

  // id: 2,3,4,5
  const queryResultsWithHelpers: StackScript[] = [
    ...stackScriptFactory.buildList(3),
    stackScriptFactory.build({ label: 'StackScript Helpers' }),
  ];
  // id: 6,7,8,9
  const queryResultsWithoutHelpers: StackScript[] = stackScriptFactory.buildList(
    4
  );

  it('filters OneClickApps and trims labels, excluding StackScripts with Helpers', () => {
    // feeding 4 Ids (2,3,4,5) getting 3 back
    const filteredOCAsWithHelpersLabel = filterOneClickApps({
      baseAppIds,
      newApps,
      queryResults: queryResultsWithHelpers,
    });
    expect(filteredOCAsWithHelpersLabel.length).toBe(3);

    // feeding 4 Ids (6,7,8,9) getting 4 back
    const filteredOCAsWithoutHelpersLabel = filterOneClickApps({
      baseAppIds,
      newApps,
      queryResults: queryResultsWithoutHelpers,
    });

    expect(filteredOCAsWithoutHelpersLabel.length).toBe(4);
  });

  it('handles empty queryResults', () => {
    const emptyQueryResults: StackScript[] = [];
    const filteredOCAs = filterOneClickApps({
      baseAppIds,
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

/**
 * This is an example cloud-init config
 */
export const userData = `#cloud-config
package_update: true
package_upgrade: true
packages:
- nginx
- mysql-server
`;

/**
 * This is the base64 encoded version of `userData`.
 * It was generated by base64 --break=0 --input=[file name here]
 */
export const base64UserData =
  'I2Nsb3VkLWNvbmZpZwpwYWNrYWdlX3VwZGF0ZTogdHJ1ZQpwYWNrYWdlX3VwZ3JhZGU6IHRydWUKcGFja2FnZXM6Ci0gbmdpbngKLSBteXNxbC1zZXJ2ZXIK';

describe('utoa', () => {
  it('should produce base64 encoded user data', () => {
    expect(utoa(userData)).toBe(base64UserData);
  });
});
