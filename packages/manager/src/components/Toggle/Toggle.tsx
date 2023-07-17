import Switch, { SwitchProps } from '@mui/material/Switch';
import * as React from 'react';

import ToggleOff from 'src/assets/icons/toggleOff.svg';
import ToggleOn from 'src/assets/icons/toggleOn.svg';
import { TooltipIcon } from 'src/components/TooltipIcon';

export interface ToggleProps extends SwitchProps {
  interactive?: boolean;
  tooltipText?: JSX.Element | string;
}

export const Toggle = (props: ToggleProps) => {
  const { interactive, tooltipText, ...rest } = props;

  return (
    <React.Fragment>
      <Switch
        checkedIcon={<ToggleOn />}
        color="primary"
        data-qa-toggle={props.checked}
        icon={<ToggleOff />}
        {...rest}
      />
      {tooltipText && (
        <TooltipIcon
          interactive={interactive}
          status="help"
          text={tooltipText}
        />
      )}
    </React.Fragment>
  );
};
