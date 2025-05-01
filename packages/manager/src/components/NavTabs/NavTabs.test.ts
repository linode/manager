import { getTabMatch } from './NavTabs';

import type { NavTab } from './NavTabs';

describe('getTabMatch', () => {
  const tabs: NavTab[] = [
    {
      component: null as any,
      routeName: '/databases/1234/backups',
      title: 'Backups',
    },
    {
      component: null as any,
      routeName: '/databases/1234/settings',
      title: 'Settings',
    },
  ];

  it('returns the index of the matched tab', () => {
    expect(getTabMatch(tabs, '/databases/1234/settings')).toEqual({
      idx: 1,
      isExact: true,
    });
  });

  it('returns whether the match is exact', () => {
    expect(getTabMatch(tabs, '/databases/1234/settings/unknown-path')).toEqual({
      idx: 1,
      isExact: false,
    });
  });

  it('returns an index of `-1` if there is no match', () => {
    expect(getTabMatch(tabs, '/databases/1234/unknown-path').idx).toBe(-1);
  });
});
