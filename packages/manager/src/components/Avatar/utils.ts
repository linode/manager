export type HSL = { h: number; l: number; s: number };
export type AvatarFontColor = 'black' | 'white';

export function getFontColor(hslColor: HSL): AvatarFontColor {
  if (hslColor.l <= 25 || hslColor.s <= 50) {
    return 'white';
  } else {
    return 'black';
  }
}

// Credit to https://www.jameslmilner.com/posts/converting-rgb-hex-hsl-colors/.
export function hexToHSL(
  hex: string
): { h: number; l: number; s: number } | undefined {
  const _hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!_hex) {
    return;
  }

  const rHex = parseInt(_hex[1], 16);
  const gHex = parseInt(_hex[2], 16);
  const bHex = parseInt(_hex[3], 16);

  const r = rHex / 255;
  const g = gHex / 255;
  const b = bHex / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = (max + min) / 2;
  let s = h;
  let l = h;

  if (max === min) {
    // Achromatic
    return { h: 0, l, s: 0 };
  }

  const d = max - min;
  s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    case b:
      h = (r - g) / d + 4;
      break;
  }
  h /= 6;

  s = s * 100;
  s = Math.round(s);
  l = l * 100;
  l = Math.round(l);
  h = Math.round(360 * h);

  return { h, l, s };
}
