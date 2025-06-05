import { arePortsValid, isValidPort } from './utils';

describe('isValidPort', () => {
  it('should return valid for empty string and valid ports', () => {
    expect(isValidPort('').isValid).toBe(true);
    expect(isValidPort('1').isValid).toBe(true);
    expect(isValidPort('80').isValid).toBe(true);
    expect(isValidPort('65535').isValid).toBe(true);
  });

  it('should return invalid for ports with leading zeros', () => {
    const result = isValidPort('0');
    expect(result.isValid).toBe(false);
    expect(result.errorMsg).toBe('Port must not have leading zeroes');
  });

  it('should return invalid for ports outside range 1-65535', () => {
    expect(isValidPort('0').isValid).toBe(false);
    expect(isValidPort('99999').isValid).toBe(false);
  });

  it('should return invalid for non-numeric key strokes', () => {
    expect(isValidPort('a').isValid).toBe(false);
    expect(isValidPort('@').isValid).toBe(false);
  });
});

describe('arePortsValid', () => {
  it('should return valid for valid port combinations', () => {
    expect(arePortsValid('').isValid).toBe(true);
    expect(arePortsValid('80').isValid).toBe(true);
    expect(arePortsValid('80,443,8080').isValid).toBe(true);
    expect(arePortsValid('1,65535').isValid).toBe(true);
  });

  it('should return invalid for consecutive commas', () => {
    const result = arePortsValid('80,,443');
    expect(result.isValid).toBe(false);
    expect(result.errorMsg).toBe('Consecutive commas are not allowed.');
  });

  it('should return invalid for starting with comma', () => {
    expect(arePortsValid(',80').errorMsg).toBe(
      'Ports cannot start with a comma.'
    );
  });

  it('should return invalid for more than 15 ports', () => {
    const ports = Array.from({ length: 16 }, (_, i) => i + 1).join(',');
    const result = arePortsValid(ports);
    expect(result.isValid).toBe(false);
    expect(result.errorMsg).toBe(
      'Number of ports or port range endpoints exceeded. Max allowed is 15'
    );
  });
});
