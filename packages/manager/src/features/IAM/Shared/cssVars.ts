import type { CSSProperties } from 'react';

/** A valid CSS custom property name (e.g. `--grid-columns`). */
export type CssCustomPropertyName = `--${string}`;

/**
 * Builds a React `style` prop from CSS custom properties.
 * `undefined` values are omitted; returns `undefined` when nothing would be set
 * (so the `style` attribute is not added to the DOM element at all).
 *
 * @example
 * ```tsx
 * const style = cssVars({ '--grid-columns': 'repeat(4, auto 1fr)' });
 * <div style={style} />
 * ```
 */
export function cssVars(
  vars: Partial<Record<CssCustomPropertyName, number | string | undefined>>
): CSSProperties | undefined {
  const out: Record<string, number | string> = {};
  for (const [name, value] of Object.entries(vars)) {
    if (value !== undefined) out[name] = value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
