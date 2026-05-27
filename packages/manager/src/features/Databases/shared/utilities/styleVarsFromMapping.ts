import type { CSSProperties } from 'react';

/** CSS custom property name (e.g. `--divider-margin-top`). */
export type CssCustomPropertyName = `--${string}`;

/**
 * Builds a `style` object of CSS custom properties from a values object and a
 * fixed prop-key → variable-name map. Omits keys whose values are `undefined`.
 * Returns `undefined` when nothing would be set (no `style` attribute needed).
 */
export function cssPropertyVariablesFromMapping<
  const TMapping extends Record<string, CssCustomPropertyName>,
>(
  values: Partial<{ [K in keyof TMapping]: number | string | undefined }>,
  mapping: TMapping
): CSSProperties | undefined {
  const out: Record<string, number | string> = {};

  for (const key of Object.keys(mapping) as (keyof TMapping)[]) {
    const value = values[key];
    if (value !== undefined) {
      out[mapping[key]] = value;
    }
  }

  return Object.keys(out).length > 0 ? (out as CSSProperties) : undefined;
}
