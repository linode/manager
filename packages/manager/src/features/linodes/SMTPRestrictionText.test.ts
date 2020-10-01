import { accountCreatedAfterRestrictions } from './SMTPRestrictionText';

describe('accountCreatedAfterRestrictions', () => {
  it('defaults to true with bad/no input', () => {
    expect(accountCreatedAfterRestrictions()).toBe(true);
    expect(accountCreatedAfterRestrictions('not a date!')).toBe(true);
  });

  it('only returns true when the account was created after the magic date', () => {
    expect(accountCreatedAfterRestrictions('2019-11-04 00:00:00Z')).toBe(false);
    expect(accountCreatedAfterRestrictions('2019-11-05 23:59:59Z')).toBe(false);
    expect(accountCreatedAfterRestrictions('2019-11-06 00:00:00Z')).toBe(true);
  });
});
