import { createMaskedText } from './createMaskedText';

describe('createMaskedText', () => {
  it('should return a masked string the same length as the original string', () => {
    const plainTextString = 'hello world';
    const maskedString = createMaskedText(plainTextString);
    expect(maskedString).toBe('•••••••••••');
    expect(plainTextString.length).toEqual(maskedString.length);
  });
});
