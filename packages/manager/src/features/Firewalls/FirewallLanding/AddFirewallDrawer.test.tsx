import { firewallRulesFactory } from 'src/factories/firewalls';

import { mergeRules } from './AddFirewallDrawer';

const rule1 = firewallRulesFactory.build();
const rule2 = firewallRulesFactory.build();

const sampleRulesMap = {
  a: rule1,
  b: rule2
};

const makeItems = (items: string[]) => {
  return items.map(thisItem => ({
    label: thisItem,
    value: thisItem
  }));
};

describe('Add Firewall Drawer', () => {
  describe('mergeRules helper function', () => {
    it('should return an empty object if no rule sets are provided', () => {
      expect(mergeRules([], sampleRulesMap)).toEqual({});
    });

    it('should return an empty object if none of the keys match the provided rules map', () => {
      expect(mergeRules(makeItems(['d', 'e', 'f']), sampleRulesMap)).toEqual(
        {}
      );
    });

    it('should return the full rule set for a single matched selected rule', () => {
      expect(mergeRules(makeItems(['a']), sampleRulesMap)).toEqual(rule1);
    });

    it('should merge multiple matching rulesets', () => {
      const rules = mergeRules(makeItems(['a', 'b']), sampleRulesMap);
      expect(rules).toHaveProperty('inbound', [
        ...rule1.inbound,
        ...rule2.inbound
      ]);
      expect(rules).toHaveProperty('outbound', [
        ...rule1.outbound,
        ...rule2.outbound
      ]);
    });
  });
});
