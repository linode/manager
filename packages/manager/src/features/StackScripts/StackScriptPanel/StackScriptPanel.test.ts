import { getTabValueFromQueryString, StackScriptTab } from './StackScriptPanel';

describe('getTabValueFromQueryString helper function', () => {
  const tabs: StackScriptTab[] = [
    {
      title: 'Account StackScripts',
      request: jest.fn(),
      category: 'account'
    },
    {
      title: 'Community StackScripts',
      request: jest.fn(),
      category: 'community'
    }
  ];
  it('provides the index of the desired tab', () => {
    expect(getTabValueFromQueryString('type=account', tabs)).toBe(0);
    expect(getTabValueFromQueryString('type=community', tabs)).toBe(1);
  });

  it('provides the index of the default tab when the given type is not present', () => {
    expect(getTabValueFromQueryString('type=unknown-type', tabs)).toBe(0);
    expect(getTabValueFromQueryString('type=unknown-type', tabs, 10)).toBe(10);
    expect(getTabValueFromQueryString('', tabs, 0)).toBe(0);
  });
});
