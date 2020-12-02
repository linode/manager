import * as React from 'react';
import Check from 'src/assets/icons/monitor-ok.svg';
import Radio from 'src/components/Radio';
import { makeStyles } from 'src/components/core/styles';

const useStyles = makeStyles(() => ({
  checkIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': {
      height: 25,
      width: 25
    }
  }
}));

interface RadioButton extends HTMLInputElement {
  name: string;
}

interface AccessCellProps {
  disabled: boolean;
  active: boolean;
  viewOnly: boolean;
  scope: string;
  scopeDisplay: string;
  onChange: (e: React.SyntheticEvent<RadioButton>) => void;
}

export const AccessCell: React.FC<AccessCellProps> = props => {
  const { active, disabled, onChange, scope, scopeDisplay, viewOnly } = props;
  const classes = useStyles();

  if (viewOnly) {
    if (!active) {
      return null;
    }
    return (
      <span
        className={classes.checkIcon}
        aria-label={`This token has ${scope} access for ${scopeDisplay}`}
      >
        <Check />
      </span>
    );
  }

  return (
    <Radio
      name={scopeDisplay}
      disabled={disabled}
      checked={active}
      value={scope}
      onChange={onChange}
      data-testid={`perm-${scopeDisplay}-radio`}
      inputProps={{
        'aria-label': `${scope} for ${scopeDisplay}`
      }}
    />
  );
};

export default React.memo(AccessCell);
