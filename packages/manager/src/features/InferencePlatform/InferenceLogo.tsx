import { useTheme } from '@linode/ui';
import * as React from 'react';

import {
  modelIcon,
  modelIconStyles,
  providerIcon,
  providerIconStyles,
} from './utils';

interface Props {
  /**
   * Optional accessible name; defaults to an empty string (decorative icon).
   */
  alt?: string;
  /**
   * Optional CSS class applied to the rendered element.
   */
  className?: string;
  /**
   * Chooses which local slug switch to use when `value` is not a URL.
   * - `'model'` → `modelIcon`
   * - `'provider'` → `providerIcon` (+ theme-aware color styles)
   */
  kind: 'model' | 'provider';
  /**
   * Extra inline styles merged on top of the slug-based theme styles.
   */
  style?: React.CSSProperties;
  /**
   * Either a full URL (http/https/data) pointing to a remote SVG/PNG **or**
   * a short slug matching the local `providerIcon`/`modelIcon` switch.
   */
  value: string | undefined;
}

const isUrl = (v: string) =>
  v.startsWith('http://') ||
  v.startsWith('https://') ||
  v.startsWith('data:') ||
  v.startsWith('/');

/**
 * Renders an inference model / provider logo.
 *
 * The backend is expected to eventually return an image URL in
 * `provider.provider_icon` / `model_icon`. Until then (and to keep the mock
 * data working), short slug strings like `'qwen'` or `'gemma4'` are also
 * accepted and resolved via the local `providerIcon` / `modelIcon` switch.
 */
export const InferenceLogo = ({
  alt = '',
  className,
  kind,
  style,
  value,
}: Props) => {
  const theme = useTheme();

  if (!value) {
    return null;
  }

  if (isUrl(value)) {
    return (
      <img
        alt={alt}
        className={className}
        src={value}
        style={{ objectFit: 'contain', ...style }}
      />
    );
  }

  const Component =
    kind === 'provider' ? providerIcon(value) : modelIcon(value);
  if (!Component) {
    return null;
  }

  const themeStyle =
    kind === 'provider'
      ? providerIconStyles(value, theme)
      : modelIconStyles(value, theme);

  // Render the raw SVG component directly (not through MUI `SvgIcon`) so it
  // keeps its native viewBox / intrinsic sizing and picks up the CSS custom
  // properties set by `providerIconStyles`.
  return (
    <Component
      className={className}
      style={{ ...(themeStyle as React.CSSProperties), ...style }}
    />
  );
};
