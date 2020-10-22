import { getTabMatch, NavTab } from './NavTabs';

describe('getTabMatch', () => {
  const tabs: NavTab[] = [
    {
      title: 'Backups',
      routeName: '/databases/1234/backups',
      component: null as any
    },
    {
      title: 'Settings',
      routeName: '/databases/1234/settings',
      component: null as any
    }
  ];

  it('returns the index of the matched tab', () => {
    expect(getTabMatch(tabs, '/databases/1234/settings')).toEqual({
      idx: 1,
      isExact: true
    });
  });

  it('returns whether the match is exact', () => {
    expect(getTabMatch(tabs, '/databases/1234/settings/unknown-path')).toEqual({
      idx: 1,
      isExact: false
    });
  });

  it('returns an index of `0` if there is no match', () => {
    expect(getTabMatch(tabs, '/databases/1234/unknown-path').idx).toBe(-1);
  });
});
