import { Button, Icon, Tooltip } from '@akamai/cds-components/react';
import React from 'react';

interface Props {
  isActionDisabled: boolean;
  label: string;
  onClick?: () => void;
  pendoID?: string;
  tooltipText: string;
}

export const InlineMenuAction = ({
  isActionDisabled,
  onClick,
  pendoID,
  tooltipText,
  label,
}: Props) => {
  return isActionDisabled ? (
    <Tooltip
      disabled={!isActionDisabled}
      noArrow={true}
      style={{ textAlign: 'left', whiteSpace: 'normal' }}
      tooltipPlacement="bottom"
      tooltipText={isActionDisabled ? tooltipText : undefined}
    >
      <Button
        data-pendo-id={pendoID}
        disabled={isActionDisabled}
        onClick={onClick}
        style={{ whiteSpace: 'nowrap' }}
        variant="primary"
      >
        {label}
        {isActionDisabled ? <Icon icon="info-outline" size="m" /> : null}
      </Button>
    </Tooltip>
  ) : (
    <Button
      data-pendo-id={pendoID}
      onClick={onClick}
      size="large"
      variant="link"
    >
      {label}
    </Button>
  );
};
