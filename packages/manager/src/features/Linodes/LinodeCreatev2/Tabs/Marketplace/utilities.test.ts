import { stackScriptFactory } from 'src/factories';
import { oneClickApps } from 'src/features/OneClickApps/oneClickAppsv2';

import { getFilteredApps } from './utilities';

import type { MarketplaceApp } from './utilities';

const mysql = {
  details: oneClickApps[607026],
  stackscript: stackScriptFactory.build({ id: 607026, label: 'MySQL' }),
};

const piHole = {
  details: oneClickApps[970522],
  stackscript: stackScriptFactory.build({ id: 970522, label: 'Pi-Hole' }),
};

const vault = {
  details: oneClickApps[1037038],
  stackscript: stackScriptFactory.build({ id: 1037038, label: 'Vault' }),
};

const apps: MarketplaceApp[] = [mysql, piHole, vault];

describe('getFilteredApps', () => {
  it('should not perform any filtering if the search is empty', () => {
    const result = getFilteredApps({
      apps,
      category: undefined,
      query: '',
    });

    expect(result).toStrictEqual(apps);
  });

  it('should allow a simple filter on label', () => {
    const result = getFilteredApps({
      apps,
      category: undefined,
      query: 'mysql',
    });

    expect(result).toStrictEqual([mysql]);
  });

  it('should allow a filter on label and catergory', () => {
    const result = getFilteredApps({
      apps,
      category: undefined,
      query: 'mysql, database',
    });

    expect(result).toStrictEqual([mysql]);
  });

  it('should allow filtering on StackScript id', () => {
    const result = getFilteredApps({
      apps,
      category: undefined,
      query: '1037038',
    });

    expect(result).toStrictEqual([vault]);
  });

  it('should allow filtering on alt description with many words', () => {
    const result = getFilteredApps({
      apps,
      category: undefined,
      query: 'HashiCorp password',
    });

    expect(result).toStrictEqual([vault]);
  });

  it('should filter if a category is selected in the category dropdown', () => {
    const result = getFilteredApps({
      apps,
      category: 'Databases',
      query: '',
    });

    expect(result).toStrictEqual([mysql]);
  });

  it('should allow searching by both a query and a category', () => {
    const result = getFilteredApps({
      apps,
      category: 'Databases',
      query: 'My',
    });

    expect(result).toStrictEqual([mysql]);
  });

  it('should return no matches if there are no results when searching by both query and category', () => {
    const result = getFilteredApps({
      apps,
      category: 'Databases',
      query: 'HashiCorp',
    });

    expect(result).toStrictEqual([]);
  });
});
