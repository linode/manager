/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import * as React from 'react';
import Check from 'src/assets/icons/monitor-ok.svg';
import { Radio } from 'src/components/Radio/Radio';
import { styled } from '@mui/material/styles';

interface RadioButton extends HTMLInputElement {
  name: string;
}

interface AccessCellProps {
  active: boolean;
  disabled: boolean;
  onChange: (e: React.SyntheticEvent<RadioButton>) => void;
  scope: string;
  scopeDisplay: string;
  viewOnly: boolean;
}

export const AccessCell = React.memo((props: AccessCellProps) => {
  const { active, disabled, onChange, scope, scopeDisplay, viewOnly } = props;

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

  return (
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
});

const StyledCheckIcon = styled('span', {
  label: 'StyledCheckIcon',
})(() => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  '& svg': {
    height: 25,
    width: 25,
  },
}));
