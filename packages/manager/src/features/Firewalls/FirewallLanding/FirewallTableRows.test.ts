import { firewalls } from 'src/__data__/firewalls';
import { getCountOfRules, getRuleString } from './FirewallTableRows';

describe('Utility functions', () => {
  it('should return correct number of inbound and outbound rules', () => {
    expect(getCountOfRules(firewalls[0])).toEqual([1, 1]);
    expect(getCountOfRules(firewalls[1])).toEqual([0, 2]);
  });

  it('should return the correct string given an array of numbers', () => {
    expect(getRuleString([1, 2])).toBe('1 Inbound / 2 Outbound');
    expect(getRuleString([1, 0])).toBe('1 Inbound');
    expect(getRuleString([0, 1])).toBe('1 Outbound');
  });
});
