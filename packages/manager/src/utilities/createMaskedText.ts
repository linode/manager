import type { MaskableTextLength } from 'src/components/MaskableText/MaskableText';

export const DEFAULT_MASKED_TEXT_LENGTH = 12;

export const MASKABLE_TEXT_LENGTH_MAP: Map<
  MaskableTextLength,
  number
> = new Map([
  ['ipv4', 15],
  ['ipv6', 30],
]);

export const createMaskedText = (
  plainText: string,
  length?: MaskableTextLength
) => {
  // Mask a default of 12 dots, unless the prop specifies a different default or the plaintext length.
  const MASKED_TEXT_LENGTH = !length
    ? DEFAULT_MASKED_TEXT_LENGTH
    : MASKABLE_TEXT_LENGTH_MAP.get(length) ?? plainText.length;

  return '•'.repeat(MASKED_TEXT_LENGTH);
};
