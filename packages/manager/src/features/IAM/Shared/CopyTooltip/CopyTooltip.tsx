import { Icon, Tooltip } from '@akamai/cds-components/react';
import copy from 'copy-to-clipboard';
import * as React from 'react';

import styles from './CopyTooltip.module.css';

export interface CopyTooltipProps {
  /**
   * Additional class names to apply to the button element.
   */
  className?: string;
  /**
   * If true, the copy button is disabled with no tooltip.
   * Combine with `disabledReason` to show a tooltip explaining why.
   * @default false
   */
  disabled?: boolean;
  /**
   * When provided alongside `disabled`, renders a tooltip with this message
   * instead of suppressing it entirely.
   */
  disabledReason?: string;
  /**
   * Callback fired after the text is copied to the clipboard.
   */
  onClickCallback?: () => void;

  /**
   * Optional Pendo ID for tracking purposes.
   */
  pendoId?: string;

  /**
   * The text to copy to the clipboard.
   */
  text: string;
}

export const CopyTooltip = ({
  className,
  disabled,
  disabledReason,
  onClickCallback,
  text,
  pendoId,
}: CopyTooltipProps) => {
  const [copied, setCopied] = React.useState(false);

  const handleClick = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
    copy(text);
    onClickCallback?.();
  };

  const button = (
    <button
      aria-label={`Copy ${text} to clipboard`}
      className={[styles.button, className].filter(Boolean).join(' ')}
      data-pendo-id={pendoId}
      data-qa-copy-btn
      disabled={disabled && !disabledReason}
      onClick={!disabled ? handleClick : undefined}
      type="button"
    >
      <Icon className={styles.icon} icon="copy" size="s" />
    </button>
  );

  // Disabled with no reason: render plain button, no tooltip
  if (disabled && !disabledReason) {
    return button;
  }

  const tooltipText = disabled
    ? (disabledReason ?? '')
    : copied
      ? 'Copied!'
      : 'Copy';

  return (
    <Tooltip
      className={styles.tooltip}
      noArrow
      tooltipPlacement="top"
      tooltipText={tooltipText}
    >
      {button}
    </Tooltip>
  );
};
