import { Color, Spacing } from '@akamai/cds-tokens';
import * as React from 'react';

export type Status = 'active' | 'error' | 'inactive' | 'other';

export interface StatusProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'aria-label'> {
  /**
   * Optional property can override the value of the default aria label for status.
   * This is useful when the status is not descriptive enough.
   */
  ariaLabel?: string;
  /**
   * When true, displays the icon with a pulsing animation.
   */
  pulse?: boolean;
  /**
   * Status of the icon.
   */
  status: Status;
}

const STATUS_COLORS: Record<Status, string> = {
  active: Color.Green[70],
  error: Color.Red[70],
  inactive: Color.Neutrals[30],
  other: Color.Amber[70],
};

export const StatusIcon = React.memo((props: StatusProps) => {
  const { ariaLabel, pulse, status, style, ...rest } = props;

  const shouldPulse =
    pulse ?? !['active', 'error', 'inactive'].includes(status);

  return (
    <span
      aria-label={ariaLabel ?? `Status is ${status}`}
      style={{
        animation: shouldPulse ? 'pulse 1.5s ease-in-out infinite' : undefined,
        backgroundColor: STATUS_COLORS[status],
        borderRadius: '50%',
        display: 'inline-block',
        flexShrink: 0,
        height: 16,
        marginRight: Spacing.S8,
        position: 'relative',
        transition: 'color 150ms ease-in-out',
        width: 16,
        alignSelf: 'center',
        ...style,
      }}
      {...rest}
    />
  );
});
