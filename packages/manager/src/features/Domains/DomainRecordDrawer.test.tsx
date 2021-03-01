import {
  castFormValuesToNumeric,
  resolve,
  resolveAlias,
  shouldResolve,
} from './DomainRecordDrawer';

const exampleDomain = 'example.com';

describe('Domain record helper methods', () => {
  describe('shouldResolve', () => {
    it('should return true for the target of a CNAME', () => {
      expect(shouldResolve('CNAME', 'target')).toBe(true);
    });

    it('should return false for other fields of a CNAME', () => {
      expect(shouldResolve('CNAME', 'name')).toBe(false);
    });

    it('should return true for the name of an AAAA record', () => {
      expect(shouldResolve('AAAA', 'name')).toBe(true);
    });

    it('should return false for other fields of an AAAA', () => {
      expect(shouldResolve('AAAA', 'target')).toBe(false);
    });

    // @todo: test for fields we know will be ignored under all cases, once we know what those are.
  });

  describe('resolve()', () => {
    it('should resolve a single @ to the Domain name', () => {
      expect(resolve('mail.@', exampleDomain)).toBe('mail.example.com');
    });

    it('should return values with no @ unchanged', () => {
      expect(resolve('mail', exampleDomain)).toBe('mail');
    });

    it('should ignore additional @s', () => {
      expect(resolve('mail.@.@', exampleDomain)).toBe('mail.example.com.@');
    });
  });

  describe('resolveAlias helper', () => {
    it('should resolve aliases where shouldResolve is true', () => {
      const payload = {
        name: 'my-name-@',
        target: 'my-target-@',
      };
      const result = resolveAlias(payload, exampleDomain, 'CNAME');
      expect(result).toHaveProperty('name', payload.name);
      expect(result).toHaveProperty(
        'target',
        resolve(payload.target, exampleDomain)
      );
    });
  });

  describe('castFormValuesToNumeric helper', () => {
    it('should convert string values to numeric for all target fields', () => {
      const formValues = { apple: '1', bear: '2', cat: '3' };
      const result = castFormValuesToNumeric(formValues, ['apple', 'bear']);
      expect(result).toEqual({
        apple: 1,
        bear: 2,
        cat: '3',
      });
    });

    it('should convert to undefined if the value is an empty string', () => {
      const formValues = { apple: '' };
      const result = castFormValuesToNumeric(formValues, ['apple']);
      expect(result).toEqual({
        apple: undefined,
      });
    });
  });
});
