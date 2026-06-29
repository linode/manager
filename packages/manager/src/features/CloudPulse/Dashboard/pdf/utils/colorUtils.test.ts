import { hexToRgb } from './colorUtils'; // Adjust path as needed

describe('hexToRgb', () => {
  it('converts hex with hashtag', () => {
    expect(hexToRgb('#FF5733')).toEqual([255, 87, 51]);
  });

  it('converts hex without hashtag', () => {
    expect(hexToRgb('000000')).toEqual([0, 0, 0]);
  });

  it('converts white color correctly', () => {
    expect(hexToRgb('#FFFFFF')).toEqual([255, 255, 255]);
  });
});
