import {
  getFilteredFirewallResources,
  getFirewallLinodes,
  getLinodeRegions,
  getOperatorGroup,
  getStaticOptions,
  handleValueChange,
  resolveSelectedValues,
} from './utils';

describe('Utils', () => {
  describe('resolveSelectedValues', () => {
    const options = [
      { label: 'Option One', value: 'one' },
      { label: 'Option Two', value: 'two' },
      { label: 'Option Three', value: 'three' },
    ];

    it('should return null if value is null and not multiple', () => {
      expect(resolveSelectedValues(options, null, false)).toBeNull();
    });

    it('should return empty array if value is null and multiple', () => {
      expect(resolveSelectedValues(options, null, true)).toEqual([]);
    });

    it('should return matched option for single value', () => {
      expect(resolveSelectedValues(options, 'two', false)).toEqual(options[1]);
    });

    it('should return matched options for multiple values', () => {
      expect(resolveSelectedValues(options, 'one,two', true)).toEqual([
        options[0],
        options[1],
      ]);
    });
  });

  describe('handleValueChange', () => {
    const selectedSingle = { label: 'One', value: 'one' };
    const selectedMultiple = [
      { label: 'One', value: 'one' },
      { label: 'Two', value: 'two' },
    ];

    it('should return empty string if operation is not selectOption', () => {
      expect(handleValueChange(selectedSingle, 'blur', false)).toBe('');
    });

    it('should return single value string', () => {
      expect(handleValueChange(selectedSingle, 'selectOption', false)).toBe(
        'one'
      );
    });

    it('should return comma-separated string for multiple', () => {
      expect(handleValueChange(selectedMultiple, 'selectOption', true)).toBe(
        'one,two'
      );
    });
  });

  describe('getOperatorGroup', () => {
    it('should return correct group for eq/neq', () => {
      expect(getOperatorGroup('eq')).toBe('eq_neq');
      expect(getOperatorGroup('neq')).toBe('eq_neq');
    });

    it('should return correct group for startswith/endswith', () => {
      expect(getOperatorGroup('startswith')).toBe('startswith_endswith');
      expect(getOperatorGroup('endswith')).toBe('startswith_endswith');
    });

    it('should return in for operator in', () => {
      expect(getOperatorGroup('in')).toBe('in');
    });

    it('should return * for unknown/null operators', () => {
      expect(getOperatorGroup(null)).toBe('*');
      expect(getOperatorGroup('something_else' as any)).toBe('*');
    });
  });

  describe('getStaticOptions', () => {
    it('should return capitalized label/value pairs', () => {
      expect(getStaticOptions(['dev', 'prod'])).toEqual([
        { label: 'Dev', value: 'dev' },
        { label: 'Prod', value: 'prod' },
      ]);
    });

    it('should return empty array if input is null', () => {
      expect(getStaticOptions(null)).toEqual([]);
    });
  });

  describe('getFilteredFirewallResources', () => {
    const resources = [
      { id: '1', entities: { a: 'A' } },
      { id: '2', entities: { a: 'B' } },
    ];

    it('should return matched resources by entity IDs', () => {
      expect(getFilteredFirewallResources(resources, ['1'])).toEqual([
        resources[0],
      ]);
    });

    it('should return empty array if no match', () => {
      expect(getFilteredFirewallResources(resources, ['3'])).toEqual([]);
    });

    it('should handle undefined inputs', () => {
      expect(getFilteredFirewallResources(undefined, ['1'])).toEqual([]);
      expect(getFilteredFirewallResources(resources, undefined)).toEqual([]);
    });
  });

  describe('getFirewallLinodes', () => {
    it('should merge and flatten entities into options', () => {
      const resources: Record<'entities', Record<string, string>>[] = [
        { entities: { '123': 'linode1' } },
        { entities: { '456': 'linode2' } },
      ];
      expect(getFirewallLinodes(resources)).toEqual([
        { label: 'linode1', value: '123' },
        { label: 'linode2', value: '456' },
      ]);
    });

    it('should handle missing entities', () => {
      const resources = [{}, { entities: { '789': 'linode3' } }];
      expect(getFirewallLinodes(resources)).toEqual([
        { label: 'linode3', value: '789' },
      ]);
    });
  });

  describe('getLinodeRegions', () => {
    it('should extract and deduplicate regions', () => {
      const linodes = [
        { region: 'us-east' },
        { region: 'us-west' },
        { region: 'us-east' },
      ];
      const result = getLinodeRegions(linodes);
      expect(result).toEqual([
        { label: 'Us-east', value: 'us-east' },
        { label: 'Us-west', value: 'us-west' },
      ]);
    });

    it('should handle undefined regions', () => {
      const linodes = [{}, { region: 'eu' }];
      expect(getLinodeRegions(linodes)).toEqual([{ label: 'Eu', value: 'eu' }]);
    });

    it('should return empty array for undefined input', () => {
      expect(getLinodeRegions(undefined)).toEqual([]);
    });
  });
});
