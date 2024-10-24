export const createMaskedText = (plainText: string) => {
  return plainText.replace(/./g, '•');
};
