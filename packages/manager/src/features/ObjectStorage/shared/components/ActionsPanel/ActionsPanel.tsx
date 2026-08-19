import { Button } from '@akamai/cds-components/react';
import type { CSSProperties } from 'react';
import React from 'react';

interface ActionButtonsProps {
  'data-testid'?: string;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  processing?: boolean;
}

interface Props {
  /**
   * primary type actionable button custom aria descripton.
   */
  primaryButtonProps?: ActionButtonsProps;
  /**
   * Determines the position of the primary button within the actions panel.
   */
  reversePrimaryButtonPosition?: boolean;
  /**
   * secondary type actionable button custom aria descripton.
   */
  secondaryButtonProps?: ActionButtonsProps;
  /**
   * styles that will be applied to the ActionsPanel container
   */
  style?: CSSProperties;
}

export const ActionsPanel = ({
  secondaryButtonProps,
  primaryButtonProps,
  style,
  reversePrimaryButtonPosition,
}: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'end',
        gap: 'var(--token-global-spacing-s16)',
        flexDirection: reversePrimaryButtonPosition ? 'row-reverse' : 'row',
        ...style,
      }}
    >
      {secondaryButtonProps ? (
        <Button
          data-qa-cancel
          size="large"
          variant="secondary"
          {...secondaryButtonProps}
        >
          {secondaryButtonProps.label}
        </Button>
      ) : null}
      {primaryButtonProps ? (
        <Button
          data-qa-submit
          size="large"
          variant="primary"
          {...primaryButtonProps}
        >
          {primaryButtonProps.label}
        </Button>
      ) : null}
    </div>
  );
};
