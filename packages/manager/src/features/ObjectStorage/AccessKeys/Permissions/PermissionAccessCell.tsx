import { Radio, Tooltip } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import Check from 'src/assets/icons/monitor-ok.svg';

interface RadioButton extends HTMLInputElement {
  name: string;
}

interface PermissionAccessCellProps {
  active: boolean;
  disabled: boolean;
  onChange: (e: React.SyntheticEvent<RadioButton>) => void;
  scope: string;
  scopeDisplay: string;
  tooltipText?: string;
  viewOnly: boolean;
}

export const PermissionAccessCell = React.memo(
  (props: PermissionAccessCellProps) => {
    const {
      active,
      disabled,
      onChange,
      scope,
      scopeDisplay,
      tooltipText,
      viewOnly,
    } = props;

    if (viewOnly) {
      if (!active) {
        return null;
      }
      return (
        <StyledCheckIcon
          aria-label={`This token has ${scope} access for ${scopeDisplay}`}
          data-testid={`perm-${scopeDisplay}`}
          tabIndex={0}
        >
          <Check />
        </StyledCheckIcon>
      );
    }

    const radioBtn = (
      <Radio
        checked={active}
        data-testid={`perm-${scopeDisplay}-radio`}
        disabled={disabled}
        inputProps={{
          'aria-label': `${scope} for ${scopeDisplay}`,
        }}
        name={scopeDisplay}
        onChange={onChange}
        value={scope}
      />
    );

    return tooltipText ? (
      <Tooltip placement="top" title={tooltipText}>
        <span>{radioBtn}</span>
      </Tooltip>
    ) : (
      radioBtn
    );
  }
);

const StyledCheckIcon = styled('span', {
  label: 'StyledCheckIcon',
})(({ theme }) => ({
  '& svg': {
    height: 25,
    width: 25,
    color: theme.tokens.alias.Content.Icon.Positive,
  },
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
}));
