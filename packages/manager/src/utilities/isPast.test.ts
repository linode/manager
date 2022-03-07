import isPast from './isPast';

/** @see http://krl.io/510e5 */
describe('isPastNow', () => {
  const now = '2018-04-26T14:00:00';
  const isPastNow = isPast(now);

  it('should return true if time is past now.', () => {
    const later = '2018-04-26T15:00:00';
    expect(isPastNow(later)).toBeTruthy();
  });

  it('should return true if time is not past now.', () => {
    const before = '2018-04-26T13:00:00';
    expect(isPastNow(before)).toBeFalsy();
  });
});
