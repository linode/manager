import { transformDimensionValue } from '../../../Utils/utils';
import {
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

    it('should return empty string if operation is not selectOption/removeOption', () => {
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
    });
  });

  describe('getStaticOptions', () => {
    it('should return transformed label/value pairs', () => {
      expect(
        getStaticOptions('nodebalancer', 'protocol', ['tcp', 'udp'])
      ).toEqual([
        {
          label: transformDimensionValue('nodebalancer', 'protocol', 'tcp'),
          value: 'tcp',
        },
        {
          label: transformDimensionValue('nodebalancer', 'protocol', 'udp'),
          value: 'udp',
        },
      ]);
    });

    it('should return empty array if input is null', () => {
      expect(getStaticOptions('linode', 'dim', null)).toEqual([]);
    });
  });
});
