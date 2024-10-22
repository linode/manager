export const createMaskedText = (plainText: string) => {
  let maskedText = '';

  for (let i = 0; i < plainText.length; i++) {
    maskedText += '•';
  }
  return maskedText;
};
