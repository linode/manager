import {
  DEFAULT_MASKED_TEXT_LENGTH,
  MASKABLE_TEXT_LENGTH_MAP,
  createMaskedText,
} from './createMaskedText';

describe('createMaskedText', () => {
  it('should return a masked string the same length as the original string', () => {
    const plainTextString = 'hello world';
    const maskedString = createMaskedText(plainTextString, 'plaintext');
    expect(maskedString.length).toEqual(plainTextString.length);
    expect(maskedString).toBe('•••••••••••');
  });

  it('should return a masked string with a default length if no length provided and plaintext is shorter than default', () => {
    const plainTextString = 'hello world';
    const maskedString = createMaskedText(plainTextString);
    expect(maskedString.length).toEqual(DEFAULT_MASKED_TEXT_LENGTH);
    expect(maskedString).toBe('••••••••••••');
  });

  it('should return a masked string with a default length if no length provided and plaintext is longer than default', () => {
    const plainTextString = 'hello world, goodbye world';
    const maskedString = createMaskedText(plainTextString);
    expect(maskedString.length).toEqual(DEFAULT_MASKED_TEXT_LENGTH);
    expect(maskedString).toBe('••••••••••••');
  });

  it('should return a masked string with a default length for ipv4', () => {
    const plainTextString = '123.456.789.123';
    const maskedString = createMaskedText(plainTextString, 'ipv4');
    expect(maskedString.length).toEqual(MASKABLE_TEXT_LENGTH_MAP.get('ipv4'));
    expect(maskedString).toBe('•••••••••••••••');
  });
});
