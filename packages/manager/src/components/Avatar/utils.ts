export type RGB = { b: number; g: number; r: number };

export function getContrastingFontColor(backgroundHexColor: string): string {
  const whiteHex = '#000000';
  const blackHex = '#FFFFFF';
  const backgroundRBG = hexToRGB(backgroundHexColor);

  const blackTextContrastRatio = getContrastRatio(
    hexToRGB(whiteHex),
    backgroundRBG
  );
  const whiteTextContrastRatio = getContrastRatio(
    hexToRGB(blackHex),
    backgroundRBG
  );

  if (whiteTextContrastRatio > blackTextContrastRatio) {
    return blackHex;
  } else {
    return whiteHex;
  }
}

function getContrastRatio(color1: RGB, color2: RGB): number {
  const luminance1 = 0.2126 * color1.r + 0.7152 * color1.g + 0.0722 * color1.b;
  const luminance2 = 0.2126 * color2.r + 0.7152 * color2.g + 0.0722 * color2.b;
  return (
    (Math.max(luminance1, luminance2) + 0.05) /
    (Math.min(luminance1, luminance2) + 0.05)
  );
}

// https://decipher.dev/30-seconds-of-typescript/docs/hexToRGB/
export const hexToRGB = (hex: string) => {
  hex = hex.startsWith('#') ? hex.slice(1) : hex;
  if (hex.length === 3) {
    hex = Array.from(hex).reduce((str, x) => str + x + x, '');
  }
  const values = hex
    .split(/([a-z0-9]{2,2})/)
    .filter(Boolean)
    .map((x) => parseInt(x, 16));
  return {
    b: values[2],
    g: values[1],
    r: values[0],
  };
};
