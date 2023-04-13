import * as React from 'react';
import ToggleOff from 'src/assets/icons/toggleOff.svg';
import ToggleOn from 'src/assets/icons/toggleOn.svg';
import Switch, { SwitchProps } from '@mui/material/Switch';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';

export interface ToggleProps extends SwitchProps {
  tooltipText?: JSX.Element | string;
  interactive?: boolean;
}

export const Toggle = (props: ToggleProps) => {
  const { tooltipText, interactive, ...rest } = props;

  return (
    <React.Fragment>
      <Switch
        icon={<ToggleOff />}
        checkedIcon={<ToggleOn />}
        data-qa-toggle={props.checked}
        color="primary"
        {...rest}
      />
      {tooltipText && (
        <TooltipIcon
          text={tooltipText}
          interactive={interactive}
          status="help"
        />
      )}
    </React.Fragment>
  );
};
